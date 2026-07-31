import { supabase } from "../supabase/client";
import {
  dbProjectToFrontend,
  frontendProjectToDb,
  frontendQaCheckToDb,
  DbProject,
  DbQaFramework,
  DbAiUnderstanding,
} from "../supabase/types";
import type { Project, QaCheck } from "../../types";
import type { AiUnderstandingState } from "../../stores/useAiUnderstandingStore";

type UnderstandingData = Omit<AiUnderstandingState, "isAnalyzing" | "isEditingSummary">;

export interface CreateProjectPayload {
  project: Partial<Project>;
  aiUnderstanding: UnderstandingData;
  qaChecks: QaCheck[];
}

/** Fetch all projects, newest first. */
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as DbProject[]).map(dbProjectToFrontend);
}

/** Fetch a single project by id. Returns null if not found. */
export async function fetchProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? dbProjectToFrontend(data as DbProject) : null;
}

/** Create a new project row standalone. */
export async function createProject(data: Partial<Project>): Promise<Project> {
  const payload = frontendProjectToDb(data);
  const { data: row, error } = await supabase
    .from("projects")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return dbProjectToFrontend(row as DbProject);
}

/**
 * Creates a project ONLY AFTER AI Understanding and QA Framework have both been generated.
 * Atomically inserts the Project row, AI Understanding row, QA Framework rows,
 * and initial Human Review entries into Supabase.
 */
export async function createProjectAfterGeneration(
  params: CreateProjectPayload
): Promise<{ project: Project; projectId: string }> {
  const { project, aiUnderstanding, qaChecks } = params;

  if (!aiUnderstanding || !aiUnderstanding.summary) {
    throw new Error(
      "Project creation aborted: AI Understanding must be generated before creating a project."
    );
  }

  if (!qaChecks || qaChecks.length === 0) {
    throw new Error(
      "Project creation aborted: QA Framework checks must be generated before creating a project."
    );
  }

  // 1. Insert Project Row
  const projectPayload = {
    ...frontendProjectToDb(project),
    framework_checks_count: qaChecks.length,
    framework_progress: 100,
    status: "In Progress",
  };

  const { data: projectRow, error: projectError } = await supabase
    .from("projects")
    .insert(projectPayload)
    .select()
    .single();

  if (projectError) throw projectError;
  const createdProject = dbProjectToFrontend(projectRow as DbProject);
  const projectId = createdProject.id;

  try {
    // 2. Insert AI Understanding Row
    const aiPayload = {
      project_id: projectId,
      summary: aiUnderstanding.summary,
      target_users: aiUnderstanding.detectedUsers || [],
      core_features: aiUnderstanding.detectedFeatures || [],
      main_workflows: aiUnderstanding.criticalWorkflows || [],
      quality_goals: aiUnderstanding.qaCoverage || [],
      risk_areas: aiUnderstanding.riskAreas || [],
    };

    const { error: aiError } = await supabase
      .from("ai_understanding")
      .insert(aiPayload);

    if (aiError) throw aiError;

    // 3. Insert QA Framework Checks
    const qaPayloads = qaChecks.map((check) => ({
      ...frontendQaCheckToDb(check),
      project_id: projectId,
    }));

    const { data: insertedChecks, error: qaError } = await supabase
      .from("qa_framework")
      .insert(qaPayloads)
      .select();

    if (qaError) throw qaError;

    // 4. Create Human Reviews for any checks requiring human review
    const humanReviewChecks = (insertedChecks as DbQaFramework[]).filter(
      (c) => c.automation_type === "Human Review"
    );

    if (humanReviewChecks.length > 0) {
      const reviewPayloads = humanReviewChecks.map((c) => ({
        framework_item_id: c.id,
        status: "Needs Review",
        notes: "",
      }));

      const { error: hrError } = await supabase
        .from("human_reviews")
        .insert(reviewPayloads);

      if (hrError) throw hrError;
    }

    return { project: createdProject, projectId };
  } catch (err) {
    // Clean up project row if downstream insertion failed
    await supabase.from("projects").delete().eq("id", projectId);
    throw err;
  }
}

/**
 * Recomputes the live Quality Score for a project — the same derivation used
 * on the Project Overview page header (see `derivedQualityScore` in
 * app/qa-projects/[id]/page.tsx): (automated checks that Passed) + (human
 * reviews whose result was "Pass"), over the total number of evaluable
 * items — and persists it to projects.quality_score. Returns the new value.
 *
 * This mirrors `recomputeHumanReviewProgress` in lib/services/humanReviews.ts
 * so the QA Projects list page (which reads project.qualityScore straight
 * from Supabase) always shows the same number as the live Overview page,
 * instead of the stale value written once at project creation.
 */
export async function recomputeQualityScore(projectId: string): Promise<number> {
  const { data: checkRows, error: checksError } = await supabase
    .from("qa_framework")
    .select("automation_type, status")
    .eq("project_id", projectId);

  if (checksError) throw checksError;

  const { data: reviewRows, error: reviewsError } = await supabase
    .from("human_reviews")
    .select("review_result, qa_framework!inner(project_id)")
    .eq("qa_framework.project_id", projectId);

  if (reviewsError) throw reviewsError;

  const checks = (checkRows as { automation_type: string; status: string }[]) || [];
  const reviews = (reviewRows as { review_result: string | null }[]) || [];

  const automatedChecks = checks.filter((c) => c.automation_type === "Automated");
  const automatedPassed = automatedChecks.filter((c) => c.status === "Passed").length;
  const humanPassed = reviews.filter((r) => r.review_result === "Pass").length;
  const totalEvaluable = automatedChecks.length + reviews.length;
  const percentage =
    totalEvaluable === 0 ? 0 : Math.round(((automatedPassed + humanPassed) / totalEvaluable) * 100);

  const { error: updateError } = await supabase
    .from("projects")
    .update({ quality_score: percentage })
    .eq("id", projectId);
  if (updateError) throw updateError;

  return percentage;
}

/** Apply a partial update to a project row. */
export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<Project> {
  const payload = frontendProjectToDb(updates);
  const { data: row, error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return dbProjectToFrontend(row as DbProject);
}

/** Delete a project (cascades to ai_understanding, qa_framework, human_reviews, page_notes, issues). */
export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}