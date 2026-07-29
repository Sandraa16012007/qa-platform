import { create } from "zustand";
import { IssueItem } from "../types";
import * as issuesService from "../lib/services/issues";

interface IssuesStore {
  issues: IssueItem[];
  isLoading: boolean;
  currentProjectId: string | null;

  loadIssues: (projectId: string) => Promise<void>;
  addIssue: (projectId: string, issueData: Partial<IssueItem>) => Promise<IssueItem>;
  updateIssue: (id: string, updates: Partial<IssueItem>) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  setIssues: (value: IssueItem[] | ((prev: IssueItem[]) => IssueItem[])) => void;
}

export const useIssuesStore = create<IssuesStore>((set, get) => ({
  issues: [],
  isLoading: false,
  currentProjectId: null,

  loadIssues: async (projectId) => {
    if (get().isLoading && get().currentProjectId === projectId) return;
    set({ isLoading: true, currentProjectId: projectId });
    try {
      const issues = await issuesService.fetchIssues(projectId);
      set({ issues, isLoading: false });
    } catch (err: any) {
      console.error("loadIssues failed:", err?.message || err);
      set({ issues: [], isLoading: false });
    }
  },

  addIssue: async (projectId, issueData) => {
    try {
      const newIssue = await issuesService.createIssue(projectId, issueData);
      set((state) => ({
        issues: [newIssue, ...state.issues],
      }));
      return newIssue;
    } catch (err) {
      console.error("addIssue failed:", err);
      throw err;
    }
  },

  updateIssue: async (id, updates) => {
    // Optimistic local update
    set((state) => ({
      issues: state.issues.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));

    try {
      const updated = await issuesService.updateIssue(id, updates);
      set((state) => ({
        issues: state.issues.map((item) => (item.id === id ? updated : item)),
      }));
    } catch (err) {
      console.error("updateIssue failed:", err);
    }
  },

  deleteIssue: async (id) => {
    const prev = get().issues;
    set((state) => ({
      issues: state.issues.filter((item) => item.id !== id),
    }));

    try {
      await issuesService.deleteIssue(id);
    } catch (err) {
      console.error("deleteIssue failed, restoring state:", err);
      set({ issues: prev });
    }
  },

  setIssues: (value) =>
    set((state) => ({
      issues: typeof value === "function" ? value(state.issues) : value,
    })),
}));
