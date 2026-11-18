import { create } from "zustand";
import { PageNote } from "../types";
import * as pageNotesService from "../lib/services/pageNotes";

interface PageNotesStore {
  pageNotes: PageNote[];
  isLoading: boolean;
  currentProjectId: string | null;

  loadPageNotes: (projectId: string) => Promise<void>;
  addPageNote: (
    projectId: string,
    note: { pageName: string; content: string; author?: string }
  ) => Promise<PageNote>;
  updatePageNote: (id: string, updates: { pageName?: string; content?: string }) => Promise<void>;
  deletePageNote: (id: string) => Promise<void>;
  setPageNotes: (value: PageNote[] | ((prev: PageNote[]) => PageNote[])) => void;
  reset: () => void;
}

export const usePageNotesStore = create<PageNotesStore>((set, get) => ({
  pageNotes: [],
  isLoading: false,
  currentProjectId: null,

  loadPageNotes: async (projectId) => {
    if (get().isLoading && get().currentProjectId === projectId) return;
    set({ isLoading: true, currentProjectId: projectId });
    try {
      const pageNotes = await pageNotesService.fetchPageNotes(projectId);
      set({ pageNotes, isLoading: false });
    } catch (err: any) {
      console.error("loadPageNotes failed:", err?.message || err);
      set({ pageNotes: [], isLoading: false });
    }
  },

  addPageNote: async (projectId, note) => {
    try {
      const newNote = await pageNotesService.createPageNote(projectId, note);
      set((state) => ({
        pageNotes: [newNote, ...state.pageNotes],
      }));
      return newNote;
    } catch (err) {
      console.error("addPageNote failed:", err);
      throw err;
    }
  },

  updatePageNote: async (id, updates) => {
    set((state) => ({
      pageNotes: state.pageNotes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));

    try {
      const updated = await pageNotesService.updatePageNote(id, updates);
      set((state) => ({
        pageNotes: state.pageNotes.map((n) => (n.id === id ? updated : n)),
      }));
    } catch (err) {
      console.error("updatePageNote failed:", err);
    }
  },

  deletePageNote: async (id) => {
    const prev = get().pageNotes;
    set((state) => ({
      pageNotes: state.pageNotes.filter((n) => n.id !== id),
    }));

    try {
      await pageNotesService.deletePageNote(id);
    } catch (err) {
      console.error("deletePageNote failed, restoring state:", err);
      set({ pageNotes: prev });
    }
  },

  setPageNotes: (value) =>
    set((state) => ({
      pageNotes: typeof value === "function" ? value(state.pageNotes) : value,
    })),

  reset: () =>
    set({
      pageNotes: [],
      isLoading: false,
      currentProjectId: null,
    }),
}));
