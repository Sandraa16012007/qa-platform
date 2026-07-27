/**
 * Database row types that mirror the Supabase schema.
 * These are the raw shapes returned by PostgREST queries.
 */

// ── projects ──

export interface DbProject {
  id: string;
  name: string;
  product_type: string;
  domain: string;
  description: string;
  status: string;
  quality_score: number;
  version: string;
  owner: string;
  repository_url: string;
  deployment_url: string;
  framework_checks_count: number;
  framework_progress: number;
  automation_progress: number;
  human_review_progress: number;
  last_run: string;
  created_at: string;
  updated_at: string;
}

// ── ai_understanding ──

export interface DbAiUnderstanding {
  id: string;
  project_id: string;
  summary: string;
  target_users: string[];
  core_features: string[];
  main_workflows: string[];
  quality_goals: string[];
  risk_areas: string[];
  generated_at: string;
}

// ── qa_framework ──

export interface DbQaFramework {
  id: string;
  project_id: string;
  qa_level: string;
  page_name: string;
  // NOTE: `page_name` maps to the frontend `QaCheck.pageName` field.
  category: string;
  title: string;
  description: string;
  expected_behavior: string;
  acceptance_criteria: string[];
  automation_type: string;
  check_type: string;
  priority: string;
  status: string;
  notes: string;
  editable: boolean;
  created_at: string;
}

// ── human_reviews ──

export interface DbHumanReview {
  id: string;
  framework_item_id: string;
  status: string;
  review_result: string | null;
  rating: number | null;
  confidence: number | null;
  notes: string;
  screenshot_url: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

/**
 * Joined shape returned when querying human_reviews with qa_framework fields.
 * Uses Supabase's embedded select syntax:
 *   `select("*, qa_framework(*)")`
 */
export interface DbHumanReviewJoined extends DbHumanReview {
  qa_framework: Pick<
    DbQaFramework,
    | "title"
    | "qa_level"
    | "category"
    | "priority"
    | "description"
    | "expected_behavior"
    | "acceptance_criteria"
    | "check_type"
  >;
}

// ─────────────────────────────────────────────
// Mappers: DB rows → Frontend types
// ─────────────────────────────────────────────

import type { Project, QaCheck, HumanReviewItem } from "../../types";
import type { AiUnderstandingState } from "../../stores/useAiUnderstandingStore";

/** Format an ISO timestamp into a human-friendly relative or date string. */
function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function dbProjectToFrontend(row: DbProject): Project {
  return {
    id: row.id,
    name: row.name,
    type: row.product_type,
    domain: row.domain,
    description: row.description,
    qualityScore: row.quality_score,
    status: row.status,
    frameworkProgress: row.framework_progress,
    automationProgress: row.automation_progress,
    humanReviewProgress: row.human_review_progress,
    lastRun: row.last_run,
    lastUpdated: formatDate(row.updated_at),
    createdDate: formatDate(row.created_at),
    version: row.version,
    owner: row.owner,
    repositoryUrl: row.repository_url,
    deploymentUrl: row.deployment_url,
    frameworkChecksCount: row.framework_checks_count,
  };
}

export function frontendProjectToDb(
  p: Partial<Project>
): Partial<DbProject> {
  const mapped: Record<string, unknown> = {};
  if (p.name !== undefined) mapped.name = p.name;
  if (p.type !== undefined) mapped.product_type = p.type;
  if ((p as any).domain !== undefined) mapped.domain = (p as any).domain;
  if (p.description !== undefined) mapped.description = p.description;
  if (p.qualityScore !== undefined) mapped.quality_score = p.qualityScore;
  if (p.status !== undefined) mapped.status = p.status;
  if (p.frameworkProgress !== undefined) mapped.framework_progress = p.frameworkProgress;
  if (p.automationProgress !== undefined) mapped.automation_progress = p.automationProgress;
  if (p.humanReviewProgress !== undefined) mapped.human_review_progress = p.humanReviewProgress;
  if (p.lastRun !== undefined) mapped.last_run = p.lastRun;
  if (p.version !== undefined) mapped.version = p.version;
  if (p.owner !== undefined) mapped.owner = p.owner;
  if (p.repositoryUrl !== undefined) mapped.repository_url = p.repositoryUrl;
  if (p.deploymentUrl !== undefined) mapped.deployment_url = p.deploymentUrl;
  if (p.frameworkChecksCount !== undefined) mapped.framework_checks_count = p.frameworkChecksCount;
  return mapped as Partial<DbProject>;
}

export function dbQaFrameworkToFrontend(row: DbQaFramework): QaCheck {
  return {
    id: row.id,
    title: row.title,
    level: row.qa_level as QaCheck["level"],
    pageName: row.page_name || undefined,
    category: row.category,
    priority: row.priority as QaCheck["priority"],
    status: row.status as QaCheck["status"],
    type: row.check_type,
    automation: row.automation_type as QaCheck["automation"],
    description: row.description,
    expectedBehavior: row.expected_behavior,
    acceptanceCriteria: row.acceptance_criteria ?? [],
    notes: row.notes,
  };
}

export function frontendQaCheckToDb(
  check: Partial<QaCheck>
): Partial<DbQaFramework> {
  const mapped: Record<string, unknown> = {};
  if (check.title !== undefined) mapped.title = check.title;
  if (check.level !== undefined) mapped.qa_level = check.level;
  if (check.pageName !== undefined) mapped.page_name = check.pageName;
  if (check.category !== undefined) mapped.category = check.category;
  if (check.priority !== undefined) mapped.priority = check.priority;
  if (check.status !== undefined) mapped.status = check.status;
  if (check.type !== undefined) mapped.check_type = check.type;
  if (check.automation !== undefined) mapped.automation_type = check.automation;
  if (check.description !== undefined) mapped.description = check.description;
  if (check.expectedBehavior !== undefined) mapped.expected_behavior = check.expectedBehavior;
  if (check.acceptanceCriteria !== undefined) mapped.acceptance_criteria = check.acceptanceCriteria;
  if (check.notes !== undefined) mapped.notes = check.notes;
  return mapped as Partial<DbQaFramework>;
}

export function dbHumanReviewToFrontend(row: DbHumanReviewJoined): HumanReviewItem {
  const fw = row.qa_framework;
  return {
    id: row.id,
    checkId: row.framework_item_id,
    title: fw.title,
    level: fw.qa_level as HumanReviewItem["level"],
    category: fw.category,
    priority: fw.priority as HumanReviewItem["priority"],
    status: row.status as HumanReviewItem["status"],
    reviewResult: (row.review_result as HumanReviewItem["reviewResult"]) ?? undefined,
    rating: row.rating ?? undefined,
    automation: "Human Review",
    description: fw.description,
    expectedBehavior: fw.expected_behavior,
    acceptanceCriteria: fw.acceptance_criteria ?? [],
    notes: row.notes,
    screenshotUrl: row.screenshot_url,
    lastUpdated: formatDate(row.reviewed_at),
    reviewedBy: row.reviewed_by ?? undefined,
  };
}

export function dbAiUnderstandingToState(
  row: DbAiUnderstanding
): Omit<AiUnderstandingState, "isAnalyzing" | "isEditingSummary"> {
  return {
    summary: row.summary,
    detectedUsers: row.target_users ?? [],
    detectedFeatures: row.core_features ?? [],
    criticalWorkflows: row.main_workflows ?? [],
    riskAreas: row.risk_areas ?? [],
    qaCoverage: row.quality_goals ?? [],
  };
}
