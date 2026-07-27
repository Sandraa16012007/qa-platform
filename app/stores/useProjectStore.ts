import { create } from "zustand";
import { Project } from "../types";
import { allProjectsList, projectDatabase } from "../mockData";
import * as projectsService from "../lib/services/projects";

interface ProjectStore {
  projects: Project[];
  selectedProjectId: string | null;
  isLoading: boolean;
  isLoaded: boolean;
  loadError: string | null;

  loadProjects: () => Promise<void>;
  selectProject: (id: string | null) => void;
  createProject: (newProj: Partial<Project>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  patchProjectLocal: (id: string, patch: Partial<Project>) => void;
  getSelectedProject: () => Project | null;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  selectedProjectId: "1",
  isLoading: false,
  isLoaded: false,
  loadError: null,

  // Fetches all projects from Supabase and replaces local state.
  // Falls back to the bundled mock list if the request fails (e.g. Supabase
  // isn't configured yet), so the UI never gets stuck empty during setup.
  loadProjects: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, loadError: null });
    try {
      const projects = await projectsService.fetchProjects();
      set((state) => ({
        projects,
        isLoading: false,
        isLoaded: true,
        selectedProjectId: state.selectedProjectId || projects[0]?.id || null,
      }));
    } catch (err) {
      console.error("loadProjects failed, falling back to mock data:", err);
      set({
        projects: allProjectsList,
        isLoading: false,
        isLoaded: true,
        loadError: err instanceof Error ? err.message : "Failed to load projects",
      });
    }
  },

  selectProject: (id) => set({ selectedProjectId: id }),

  // NOTE: project creation is intentionally local-only for now — the New
  // Project wizard (and its Gemini-generated content) isn't wired up yet.
  // Once that flow exists, this can be swapped for an async, service-backed
  // create the same way update/delete already are below.
  createProject: (newProjData) => {
    const id = Date.now().toString();
    const newProject: Project = {
      id,
      name: newProjData.name || "Untitled Project",
      type: newProjData.type || "Web App",
      domain: (newProjData as any).domain || "",
      description: newProjData.description || "Digital Application",
      qualityScore: 85,
      status: "Framework Generated",
      frameworkProgress: 100,
      automationProgress: 0,
      humanReviewProgress: 0,
      lastRun: "Never",
      lastUpdated: "Just now",
      createdDate: "Just now",
      version: "v1.0",
      owner: "Admin Engineer",
      repositoryUrl: newProjData.repositoryUrl || "https://github.com/company/project",
      deploymentUrl: newProjData.deploymentUrl || "https://app.dev",
      frameworkChecksCount: 300,
      ...newProjData,
    };

    set((state) => ({
      projects: [newProject, ...state.projects],
      selectedProjectId: id,
    }));

    // Best-effort persist in the background so duplicated/manually-created
    // projects still show up after a refresh once Supabase is configured.
    projectsService
      .createProject(newProject)
      .then((saved) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? saved : p)),
          selectedProjectId: state.selectedProjectId === id ? saved.id : state.selectedProjectId,
        }));
      })
      .catch((err) => console.error("createProject persist failed:", err));

    return newProject;
  },

  updateProject: (id, updates) => {
    // Optimistic local update first so the UI feels instant.
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, lastUpdated: "Just now" } : p
      ),
    }));

    projectsService
      .updateProject(id, updates)
      .then((saved) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? saved : p)),
        }));
      })
      .catch((err) => console.error("updateProject persist failed:", err));
  },

  deleteProject: (id) => {
    const prevProjects = get().projects;

    set((state) => {
      const nextProjects = state.projects.filter((p) => p.id !== id);
      const nextSelected =
        state.selectedProjectId === id
          ? nextProjects[0]?.id || null
          : state.selectedProjectId;
      return {
        projects: nextProjects,
        selectedProjectId: nextSelected,
      };
    });

    projectsService.deleteProject(id).catch((err) => {
      console.error("deleteProject persist failed, restoring local state:", err);
      // Roll back the optimistic delete if the server call failed.
      set({ projects: prevProjects });
    });
  },

  getSelectedProject: () => {
    const state = get();
    if (!state.selectedProjectId) return state.projects[0] || null;
    return (
      state.projects.find((p) => p.id === state.selectedProjectId) ||
      projectDatabase[state.selectedProjectId] ||
      state.projects[0] ||
      null
    );
  },

  // Local-only update — use when a value has already been persisted directly
  // (e.g. a recomputed live percentage) and only the in-memory copy needs
  // to catch up, without re-triggering a full project update/save.
  patchProjectLocal: (id, patch) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
}));
