import { supabase } from "../supabase/client";
import { dbAiUnderstandingToState, DbAiUnderstanding } from "../supabase/types";
import type { AiUnderstandingState } from "../../stores/useAiUnderstandingStore";

type UnderstandingData = Omit<AiUnderstandingState, "isAnalyzing" | "isEditingSummary">;

/** Fetch the AI Understanding row for a project. Returns null if none exists yet. */
export async function fetchAiUnderstanding(
  projectId: string
): Promise<UnderstandingData | null> {
  const { data, error } = await supabase
    .from("ai_understanding")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  return data ? dbAiUnderstandingToState(data as DbAiUnderstanding) : null;
}

/** Insert or update the single ai_understanding row for a project. */
export async function upsertAiUnderstanding(
  projectId: string,
  data: Partial<UnderstandingData>
): Promise<UnderstandingData> {
  const payload: Record<string, unknown> = { project_id: projectId };
  if (data.summary !== undefined) payload.summary = data.summary;
  if (data.detectedUsers !== undefined) payload.target_users = data.detectedUsers;
  if (data.detectedFeatures !== undefined) payload.core_features = data.detectedFeatures;
  if (data.criticalWorkflows !== undefined) payload.main_workflows = data.criticalWorkflows;
  if (data.riskAreas !== undefined) payload.risk_areas = data.riskAreas;
  if (data.qaCoverage !== undefined) payload.quality_goals = data.qaCoverage;

  const { data: row, error } = await supabase
    .from("ai_understanding")
    .upsert(payload, { onConflict: "project_id" })
    .select()
    .single();

  if (error) throw error;
  return dbAiUnderstandingToState(row as DbAiUnderstanding);
}

/** Delete the ai_understanding row for a project. */
export async function deleteAiUnderstanding(projectId: string): Promise<void> {
  const { error } = await supabase
    .from("ai_understanding")
    .delete()
    .eq("project_id", projectId);

  if (error) throw error;
}

