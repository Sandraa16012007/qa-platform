import { create } from "zustand";
import { Project } from "../types";
import { allProjectsList, projectDatabase } from "../mockData";

interface ProjectStore {
  projects: Project[];
  selectedProjectId: string | null;
  selectProject: (id: string | null) => void;
  createProject: (newProj: Partial<Project>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getSelectedProject: () => Project | null;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: allProjectsList,
  selectedProjectId: "1",

  selectProject: (id) => set({ selectedProjectId: id }),

  createProject: (newProjData) => {
    const id = Date.now().toString();
    const newProject: Project = {
      id,
      name: newProjData.name || "Untitled Project",
      type: newProjData.type || "Web App",
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

    return newProject;
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, lastUpdated: "Just now" } : p
      ),
    }));
  },

  deleteProject: (id) => {
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
}));
