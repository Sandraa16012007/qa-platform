import { supabase } from "../supabase/client";
import { dbQaFrameworkToFrontend, frontendQaCheckToDb, DbQaFramework } from "../supabase/types";
import { syncHumanReviewLink } from "./humanReviews";
import type { QaCheck } from "../../types";

/** Fetch all QA framework checks for a project. */
export async function fetchQaFramework(projectId: string): Promise<QaCheck[]> {
  const { data, error } = await supabase
    .from("qa_framework")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as DbQaFramework[]).map(dbQaFrameworkToFrontend);
}

/** Fetch a single QA check by ID. Returns null if not found. */
export async function fetchQaCheckById(id: string): Promise<QaCheck | null> {
  const { data, error } = await supabase
    .from("qa_framework")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? dbQaFrameworkToFrontend(data as DbQaFramework) : null;
}


/** Apply a partial update to a QA check row, then sync its linked human_reviews row. */
export async function updateQaCheck(id: string, updates: Partial<QaCheck>): Promise<QaCheck> {
  const payload = frontendQaCheckToDb(updates);
  const { data: row, error } = await supabase
    .from("qa_framework")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  const check = dbQaFrameworkToFrontend(row as DbQaFramework);
  await syncHumanReviewLink(check);
  return check;
}

/** Insert a new QA check row for a project. */
export async function createQaCheck(
  projectId: string,
  data: Partial<QaCheck>
): Promise<QaCheck> {
  const payload = { ...frontendQaCheckToDb(data), project_id: projectId };
  const { data: row, error } = await supabase
    .from("qa_framework")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  const check = dbQaFrameworkToFrontend(row as DbQaFramework);
  await syncHumanReviewLink(check);
  return check;
}

/** Delete a QA check row (cascades to its human_reviews row, if any). */
export async function deleteQaCheck(id: string): Promise<void> {
  const { error } = await supabase.from("qa_framework").delete().eq("id", id);
  if (error) throw error;
}
