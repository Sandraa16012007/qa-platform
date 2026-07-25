import { create } from "zustand";
import { Toast } from "../types";

interface UiStore {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  initSidebarFromStorage: () => void;

  // Active Tab (project dashboard)
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Wizard Step
  wizardStep: number;
  wizardDirection: number;
  setWizardStep: (step: number) => void;
  goWizardNext: () => void;
  goWizardPrev: () => void;

  // Framework Generation
  isGeneratingFramework: boolean;
  setIsGeneratingFramework: (generating: boolean) => void;

  // Toast Notifications
  toasts: Toast[];
  showToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiStore>((set, get) => ({
  // ── Sidebar ──
  sidebarCollapsed: true,

  toggleSidebar: () => {
    set((state) => {
      const next = !state.sidebarCollapsed;
      if (typeof window !== "undefined") {
        localStorage.setItem("qa-sidebar-collapsed", String(next));
      }
      return { sidebarCollapsed: next };
    });
  },

  setSidebarCollapsed: (collapsed) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qa-sidebar-collapsed", String(collapsed));
    }
    set({ sidebarCollapsed: collapsed });
  },

  initSidebarFromStorage: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("qa-sidebar-collapsed");
      if (stored !== null) {
        set({ sidebarCollapsed: stored === "true" });
      }
    }
  },

  // ── Active Tab ──
  activeTab: "Overview",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ── Wizard ──
  wizardStep: 0,
  wizardDirection: 1,

  setWizardStep: (step) => {
    const current = get().wizardStep;
    set({
      wizardStep: step,
      wizardDirection: step > current ? 1 : -1,
    });
  },

  goWizardNext: () => {
    set((state) => ({
      wizardStep: Math.min(state.wizardStep + 1, 3),
      wizardDirection: 1,
    }));
  },

  goWizardPrev: () => {
    set((state) => ({
      wizardStep: Math.max(state.wizardStep - 1, 0),
      wizardDirection: -1,
    }));
  },

  // ── Framework Generation ──
  isGeneratingFramework: false,
  setIsGeneratingFramework: (generating) => set({ isGeneratingFramework: generating }),

  // ── Toast Notifications ──
  toasts: [],

  showToast: (message, type = "success") => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
