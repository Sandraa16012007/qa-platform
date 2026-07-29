import { supabase } from "../supabase/client";
import { dbPageNoteToFrontend, DbPageNote } from "../supabase/types";
import type { PageNote } from "../../types";

/** Fetch all page notes for a project from Supabase. */
export async function fetchPageNotes(projectId: string): Promise<PageNote[]> {
  const { data, error } = await supabase
    .from("page_notes")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as DbPageNote[]) || []).map(dbPageNoteToFrontend);
}

/** Fetch a single page note by ID. Returns null if not found. */
export async function fetchPageNoteById(id: string): Promise<PageNote | null> {
  const { data, error } = await supabase
    .from("page_notes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? dbPageNoteToFrontend(data as DbPageNote) : null;
}

/** Create a new page note for a project. */
export async function createPageNote(
  projectId: string,
  note: { pageName: string; content: string; author?: string }
): Promise<PageNote> {
  const { data, error } = await supabase
    .from("page_notes")
    .insert({
      project_id: projectId,
      page_name: note.pageName,
      content: note.content,
      author: note.author || "Admin Engineer",
    })
    .select("*")
    .single();

  if (error) throw error;
  return dbPageNoteToFrontend(data as DbPageNote);
}

/** Update an existing page note's content or page name. */
export async function updatePageNote(
  id: string,
  updates: { pageName?: string; content?: string }
): Promise<PageNote> {
  const payload: Record<string, unknown> = {};
  if (updates.pageName !== undefined) payload.page_name = updates.pageName;
  if (updates.content !== undefined) payload.content = updates.content;

  const { data, error } = await supabase
    .from("page_notes")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return dbPageNoteToFrontend(data as DbPageNote);
}

/** Delete a page note by ID. */
export async function deletePageNote(id: string): Promise<void> {
  const { error } = await supabase
    .from("page_notes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

