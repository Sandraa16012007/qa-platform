import { supabase } from "../supabase/client";
import { dbIssueToFrontend, frontendIssueToDb, DbIssue } from "../supabase/types";
import type { IssueItem } from "../../types";

/** Fetch all issues for a given project, ordered newest first. */
export async function fetchIssues(projectId: string): Promise<IssueItem[]> {
  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as DbIssue[]) || []).map(dbIssueToFrontend);
}

/** Fetch a single issue by its UUID. Returns null if not found. */
export async function fetchIssueById(id: string): Promise<IssueItem | null> {
  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? dbIssueToFrontend(data as DbIssue) : null;
}

/** Create a new issue linked to a project (and optionally a human review). */
export async function createIssue(
  projectId: string,
  issueData: Partial<IssueItem>
): Promise<IssueItem> {
  const payload = frontendIssueToDb(issueData, projectId);
  const { data: row, error } = await supabase
    .from("issues")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return dbIssueToFrontend(row as DbIssue);
}

/** Apply a partial update to an existing issue. */
export async function updateIssue(
  id: string,
  updates: Partial<IssueItem>
): Promise<IssueItem> {
  const mapped: Record<string, unknown> = {};
  if (updates.title !== undefined) mapped.title = updates.title;
  if (updates.severity !== undefined) mapped.severity = updates.severity;
  if (updates.status !== undefined) mapped.status = updates.status;
  if (updates.source !== undefined) mapped.source = updates.source;
  if (updates.level !== undefined) mapped.level = updates.level;
  if (updates.linkedPage !== undefined) mapped.linked_page = updates.linkedPage;
  if (updates.assignedTo !== undefined) mapped.assigned_to = updates.assignedTo;
  if (updates.description !== undefined) mapped.description = updates.description;
  if (updates.recommendation !== undefined) mapped.recommendation = updates.recommendation;
  if (updates.linkedCheckId !== undefined) mapped.framework_item_id = updates.linkedCheckId || null;
  if (updates.linkedReviewId !== undefined) mapped.human_review_id = updates.linkedReviewId || null;

  const { data: row, error } = await supabase
    .from("issues")
    .update(mapped)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return dbIssueToFrontend(row as DbIssue);
}

/** Delete an issue by ID. */
export async function deleteIssue(id: string): Promise<void> {
  const { error } = await supabase
    .from("issues")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
