import { create } from "zustand";

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

export const useAiUnderstandingStore = create<AiUnderstandingStore>((set) => ({
  ...initialState,

  setUnderstanding: (data) => set((state) => ({ ...state, ...data })),

  updateSummary: (summary) => set({ summary }),

  updateUsers: (detectedUsers) => set({ detectedUsers }),

  updateFeatures: (detectedFeatures) => set({ detectedFeatures }),

  updateWorkflows: (criticalWorkflows) => set({ criticalWorkflows }),

  updateRisks: (riskAreas) => set({ riskAreas }),

  setQaCoverage: (value) =>
    set((state) => ({
      qaCoverage:
        typeof value === "function"
          ? (value as (prev: string[]) => string[])(state.qaCoverage)
          : value,
    })),

  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  setIsEditingSummary: (isEditingSummary) => set({ isEditingSummary }),

  resetUnderstanding: () => set({ ...initialState }),
}));
