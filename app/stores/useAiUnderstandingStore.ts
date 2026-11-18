import { create } from "zustand";
import * as aiUnderstandingService from "../lib/services/aiUnderstanding";

export interface AiUnderstandingState {
  summary: string;
  detectedUsers: string[];
  detectedFeatures: string[];
  criticalWorkflows: string[];
  riskAreas: string[];
  qaCoverage: string[];
  isAnalyzing: boolean;
  isEditingSummary: boolean;
}

interface AiUnderstandingStore extends AiUnderstandingState {
  isLoading: boolean;
  currentProjectId: string | null;

  loadUnderstanding: (projectId: string) => Promise<void>;
  saveUnderstanding: (targetProjectId?: string) => Promise<void>;
  setUnderstanding: (data: Partial<AiUnderstandingState>) => void;
  updateSummary: (summary: string) => void;
  updateUsers: (users: string[]) => void;
  updateFeatures: (features: string[]) => void;
  updateWorkflows: (workflows: string[]) => void;
  updateRisks: (risks: string[]) => void;
  setQaCoverage: (
    value: string[] | ((prev: string[]) => string[])
  ) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setIsEditingSummary: (editing: boolean) => void;
  resetUnderstanding: () => void;
  clearProjectContext: () => void;
  reset: () => void;
}

const initialState: AiUnderstandingState = {
  summary: "",
  detectedUsers: [],
  detectedFeatures: [],
  criticalWorkflows: [],
  riskAreas: [],
  qaCoverage: [],
  isAnalyzing: false,
  isEditingSummary: false,
};

export const useAiUnderstandingStore = create<AiUnderstandingStore>((set, get) => {
  return {
    ...initialState,
    isLoading: false,
    currentProjectId: null,

    // Fetches the AI Understanding row for a project from Supabase.
    loadUnderstanding: async (projectId) => {
      if (get().isLoading && get().currentProjectId === projectId) return;
      set({ isLoading: true, currentProjectId: projectId });
      try {
        const data = await aiUnderstandingService.fetchAiUnderstanding(projectId);
        set({
          ...(data || {
            summary: "",
            detectedUsers: [],
            detectedFeatures: [],
            criticalWorkflows: [],
            riskAreas: [],
            qaCoverage: [],
          }),
          isLoading: false,
        });
      } catch (err: any) {
        console.error("loadUnderstanding failed:", err?.message || err);
        set({ isLoading: false });
      }
    },

    // Saves the current AI Understanding fields to Supabase ONLY when explicitly invoked.
    saveUnderstanding: async (targetProjectId?: string) => {
      const projectId = targetProjectId || get().currentProjectId;
      if (!projectId) return;
      const { summary, detectedUsers, detectedFeatures, criticalWorkflows, riskAreas, qaCoverage } =
        get();
      try {
        await aiUnderstandingService.upsertAiUnderstanding(projectId, {
          summary,
          detectedUsers,
          detectedFeatures,
          criticalWorkflows,
          riskAreas,
          qaCoverage,
        });
      } catch (err) {
        console.error("saveUnderstanding failed:", err);
        throw err;
      }
    },

    setUnderstanding: (data) => set((state) => ({ ...state, ...data })),

    updateSummary: (summary) => set({ summary }),

    updateUsers: (detectedUsers) => set({ detectedUsers }),

    updateFeatures: (detectedFeatures) => set({ detectedFeatures }),

    updateWorkflows: (criticalWorkflows) => set({ criticalWorkflows }),

    updateRisks: (riskAreas) => set({ riskAreas }),

    setQaCoverage: (value) => {
      set((state) => ({
        qaCoverage:
          typeof value === "function"
            ? (value as (prev: string[]) => string[])(state.qaCoverage)
            : value,
      }));
    },

    setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

    setIsEditingSummary: (isEditingSummary) => set({ isEditingSummary }),

    resetUnderstanding: () => set({ ...initialState }),

    clearProjectContext: () => set({ currentProjectId: null }),

    reset: () =>
      set({
        ...initialState,
        isLoading: false,
        currentProjectId: null,
      }),
  };
});

