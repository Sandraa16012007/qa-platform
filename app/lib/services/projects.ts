import { supabase } from "../supabase/client";
import { dbProjectToFrontend, frontendProjectToDb, DbProject } from "../supabase/types";
import type { Project } from "../../types";

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

/** Create a new project row. */
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

/** Apply a partial update to a project row. */
export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
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

/** Delete a project (cascades to ai_understanding, qa_framework, human_reviews). */
export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
