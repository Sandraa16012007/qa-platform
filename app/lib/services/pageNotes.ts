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

/** Delete a page note by ID. */
export async function deletePageNote(id: string): Promise<void> {
  const { error } = await supabase
    .from("page_notes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
