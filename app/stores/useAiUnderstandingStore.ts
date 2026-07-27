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
  /**
   * Clears the project id edits get persisted against, without touching the
   * editable fields themselves. Call this when entering a context (like the
   * New Project wizard) that edits this same shared store but isn't tied to
   * an existing saved project yet — otherwise edits could be written to
   * whichever project was last viewed on the dashboard.
   */
  clearProjectContext: () => void;
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
  // Persists the current understanding fields to Supabase in the background.
  // Fire-and-forget: edits already applied optimistically to local state.
  const persist = () => {
    const projectId = get().currentProjectId;
    if (!projectId) return;
    const { summary, detectedUsers, detectedFeatures, criticalWorkflows, riskAreas, qaCoverage } =
      get();
    aiUnderstandingService
      .upsertAiUnderstanding(projectId, {
        summary,
        detectedUsers,
        detectedFeatures,
        criticalWorkflows,
        riskAreas,
        qaCoverage,
      })
      .catch((err) => console.error("AI Understanding persist failed:", err));
  };

  return {
    ...initialState,
    isLoading: false,
    currentProjectId: null,

    // Fetches the AI Understanding row for a project from Supabase.
    // If no row exists yet (e.g. framework not generated for this project),
    // resets to the empty defaults so the UI falls back to its own copy.
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
      } catch (err) {
        console.error("loadUnderstanding failed:", err);
        set({ isLoading: false });
      }
    },

    setUnderstanding: (data) => set((state) => ({ ...state, ...data })),

    updateSummary: (summary) => {
      set({ summary });
      persist();
    },

    updateUsers: (detectedUsers) => {
      set({ detectedUsers });
      persist();
    },

    updateFeatures: (detectedFeatures) => {
      set({ detectedFeatures });
      persist();
    },

    updateWorkflows: (criticalWorkflows) => {
      set({ criticalWorkflows });
      persist();
    },

    updateRisks: (riskAreas) => {
      set({ riskAreas });
      persist();
    },

    setQaCoverage: (value) => {
      set((state) => ({
        qaCoverage:
          typeof value === "function"
            ? (value as (prev: string[]) => string[])(state.qaCoverage)
            : value,
      }));
      persist();
    },

    setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

    setIsEditingSummary: (isEditingSummary) => set({ isEditingSummary }),

    resetUnderstanding: () => set({ ...initialState }),

    clearProjectContext: () => set({ currentProjectId: null }),
  };
});
