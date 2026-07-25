import { create } from "zustand";
import { QaCheck } from "../types";
import { initialQaChecks } from "../mockData";

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
  resetFilters: () => void;
}

export const useFrameworkStore = create<FrameworkStore>((set) => ({
  checks: initialQaChecks,
  selectedCheckId: null,
  selectedLevel: "Product QA",
  searchText: "",
  filterCategory: "All",
  filterPriority: "All",
  filterStatus: "All",
  filterAutomation: "All",
  collapsedCats: {},

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

  addCheck: (check) =>
    set((state) => ({
      checks: [check, ...state.checks],
    })),

  updateCheck: (id, updates) =>
    set((state) => ({
      checks: state.checks.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  deleteCheck: (id) =>
    set((state) => ({
      checks: state.checks.filter((c) => c.id !== id),
      selectedCheckId: state.selectedCheckId === id ? null : state.selectedCheckId,
    })),

  resetFilters: () =>
    set({
      searchText: "",
      filterCategory: "All",
      filterPriority: "All",
      filterStatus: "All",
      filterAutomation: "All",
    }),
}));
