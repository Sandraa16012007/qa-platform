import { create } from "zustand";
import { QaCheck } from "../types";
import { initialQaChecks } from "../mockData";
import * as qaFrameworkService from "../lib/services/qaFramework";
import * as humanReviewsService from "../lib/services/humanReviews";
import { useHumanReviewStore } from "./useHumanReviewStore";
import { useProjectStore } from "./useProjectStore";

interface FrameworkStore {
  checks: QaCheck[];
  selectedCheckId: string | null;
  selectedLevel: string;
  searchText: string;
  filterCategory: string;
  filterPriority: string;
  filterStatus: string;
  filterAutomation: string;
  collapsedCats: Record<string, boolean>;
  isLoading: boolean;
  currentProjectId: string | null;

  loadChecks: (projectId: string) => Promise<void>;
  selectCheck: (id: string | null) => void;
  selectLevel: (level: string) => void;
  setSearchText: (text: string) => void;
  setFilterCategory: (category: string) => void;
  setFilterPriority: (priority: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterAutomation: (automation: string) => void;
  toggleCategory: (category: string) => void;
  addCheck: (check: QaCheck) => void;
  updateCheck: (id: string, updates: Partial<QaCheck>) => void;
  deleteCheck: (id: string) => void;
  patchCheckLocal: (id: string, patch: Partial<QaCheck>) => void;
  resetFilters: () => void;
}

export const useFrameworkStore = create<FrameworkStore>((set, get) => ({
  checks: [],
  selectedCheckId: null,
  selectedLevel: "Product QA",
  searchText: "",
  filterCategory: "All",
  filterPriority: "All",
  filterStatus: "All",
  filterAutomation: "All",
  collapsedCats: {},
  isLoading: false,
  currentProjectId: null,

  // Fetches QA framework checks for a project from Supabase. Falls back to
  // bundled mock checks if the request fails (e.g. Supabase not configured).
  loadChecks: async (projectId) => {
    if (get().isLoading && get().currentProjectId === projectId) return;
    set({ isLoading: true, currentProjectId: projectId });
    try {
      const checks = await qaFrameworkService.fetchQaFramework(projectId);
      set({ checks, isLoading: false });
    } catch (err) {
      console.error("loadChecks failed, falling back to mock data:", err);
      set({ checks: initialQaChecks, isLoading: false });
    }
  },

  selectCheck: (id) => set({ selectedCheckId: id }),

  selectLevel: (level) => set({ selectedLevel: level }),

  setSearchText: (text) => set({ searchText: text }),

  setFilterCategory: (category) => set({ filterCategory: category }),

  setFilterPriority: (priority) => set({ filterPriority: priority }),

  setFilterStatus: (status) => set({ filterStatus: status }),

  setFilterAutomation: (automation) => set({ filterAutomation: automation }),

  toggleCategory: (category) =>
    set((state) => ({
      collapsedCats: {
        ...state.collapsedCats,
        [category]: !state.collapsedCats[category],
      },
    })),

  addCheck: (check) => {
    set((state) => ({
      checks: [check, ...state.checks],
    }));

    const projectId = get().currentProjectId;
    if (!projectId) return;
    qaFrameworkService
      .createQaCheck(projectId, check)
      .then((saved) => {
        set((state) => ({
          checks: state.checks.map((c) => (c.id === check.id ? saved : c)),
        }));
        useHumanReviewStore.getState().loadReviews(projectId);
        humanReviewsService
          .recomputeHumanReviewProgress(projectId)
          .then((pct) =>
            useProjectStore.getState().patchProjectLocal(projectId, {
              humanReviewProgress: pct,
            })
          )
          .catch((err) => console.error("recomputeHumanReviewProgress failed:", err));
      })
      .catch((err) => console.error("addCheck persist failed:", err));
  },

  updateCheck: (id, updates) => {
    // Optimistic local update first.
    set((state) => ({
      checks: state.checks.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));

    qaFrameworkService
      .updateQaCheck(id, updates)
      .then((saved) => {
        set((state) => ({
          checks: state.checks.map((c) => (c.id === id ? saved : c)),
        }));
        // Validation Mode may have changed, which creates/removes a linked
        // human_reviews row — refresh the Human Reviews tab + live progress
        // so both stay in sync without needing a page reload.
        const projectId = get().currentProjectId;
        if (projectId) {
          useHumanReviewStore.getState().loadReviews(projectId);
          humanReviewsService
            .recomputeHumanReviewProgress(projectId)
            .then((pct) =>
              useProjectStore.getState().patchProjectLocal(projectId, {
                humanReviewProgress: pct,
              })
            )
            .catch((err) => console.error("recomputeHumanReviewProgress failed:", err));
        }
      })
      .catch((err) => console.error("updateCheck persist failed:", err));
  },

  deleteCheck: (id) => {
    const prevChecks = get().checks;

    set((state) => ({
      checks: state.checks.filter((c) => c.id !== id),
      selectedCheckId: state.selectedCheckId === id ? null : state.selectedCheckId,
    }));

    qaFrameworkService.deleteQaCheck(id).catch((err) => {
      console.error("deleteCheck persist failed, restoring local state:", err);
      set({ checks: prevChecks });
    });

    const projectId = get().currentProjectId;
    if (projectId) {
      useHumanReviewStore.getState().loadReviews(projectId);
      humanReviewsService
        .recomputeHumanReviewProgress(projectId)
        .then((pct) =>
          useProjectStore.getState().patchProjectLocal(projectId, {
            humanReviewProgress: pct,
          })
        )
        .catch((err) => console.error("recomputeHumanReviewProgress failed:", err));
    }
  },

  resetFilters: () =>
    set({
      searchText: "",
      filterCategory: "All",
      filterPriority: "All",
      filterStatus: "All",
      filterAutomation: "All",
    }),

  patchCheckLocal: (id, patch) =>
    set((state) => ({
      checks: state.checks.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),
}));
