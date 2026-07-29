import { create } from "zustand";
import { HumanReviewItem } from "../types";
import { initialHumanReviews } from "../mockData";
import * as humanReviewsService from "../lib/services/humanReviews";
import { useFrameworkStore } from "./useFrameworkStore";
import { useProjectStore } from "./useProjectStore";

interface HumanReviewStore {
  humanReviews: HumanReviewItem[];
  selectedReviewId: string | null;
  isLoading: boolean;
  currentProjectId: string | null;

  loadReviews: (projectId: string) => Promise<void>;
  selectReview: (id: string | null) => void;
  updateReview: (id: string, updates: Partial<HumanReviewItem>) => void;
  saveReviewResult: (
    id: string,
    checkId: string,
    result: HumanReviewItem["reviewResult"],
    rating: number,
    notes: string,
    screenshotUrl?: string | null
  ) => void;
  /**
   * Drop-in replacement for React's setState dispatcher so components built
   * against `useState<HumanReviewItem[]>` can be wired to this store without
   * changing their prop signatures. Local-only (no persistence) — used for
   * optimistic/bulk UI updates; use `saveReviewResult` to persist a save.
   */
  setHumanReviews: (
    value: HumanReviewItem[] | ((prev: HumanReviewItem[]) => HumanReviewItem[])
  ) => void;
  resetReviews: () => void;
}

export const useHumanReviewStore = create<HumanReviewStore>((set, get) => ({
  humanReviews: [],
  selectedReviewId: null,
  isLoading: false,
  currentProjectId: null,

  // Fetches human review items (joined with QA framework metadata) from
  // Supabase. Falls back to bundled mock reviews if the request fails.
  loadReviews: async (projectId) => {
    if (get().isLoading && get().currentProjectId === projectId) return;
    set({ isLoading: true, currentProjectId: projectId });
    try {
      const humanReviews = await humanReviewsService.fetchHumanReviews(projectId);
      if (humanReviews && humanReviews.length > 0) {
        set({ humanReviews, isLoading: false });
      } else {
        set((state) => ({
          humanReviews: state.humanReviews.length > 0 ? state.humanReviews : initialHumanReviews,
          isLoading: false,
        }));
      }
    } catch (err) {
      console.error("loadReviews failed:", err);
      set((state) => ({
        humanReviews: state.humanReviews.length > 0 ? state.humanReviews : initialHumanReviews,
        isLoading: false,
      }));
    }
  },

  selectReview: (id) => set({ selectedReviewId: id }),

  updateReview: (id, updates) =>
    set((state) => ({
      humanReviews: state.humanReviews.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  saveReviewResult: (id, checkId, result, rating, notes, screenshotUrl) => {
    let computedStatus: HumanReviewItem["status"] = "Completed";
    if (result === "Needs Improvement") computedStatus = "Needs Improvement";
    if (result === "Fail") computedStatus = "Failed";
    if (result === "Not Applicable") computedStatus = "Not Applicable";

    // Optimistic local update first.
    set((state) => ({
      humanReviews: state.humanReviews.map((item) =>
        item.id === id
          ? {
              ...item,
              status: computedStatus,
              reviewResult: result,
              rating,
              notes,
              screenshotUrl: screenshotUrl ?? null,
              lastUpdated: "Just now",
              reviewedBy: "Admin Engineer",
            }
          : item
      ),
    }));

    // Mirror the same status onto the linked QA Framework checklist item so
    // the two stay in sync (Pass→Passed, Fail→Failed, Needs Improvement→In
    // Progress, N/A→Skipped), matching the mapping the service applies.
    const checkStatusMap: Record<HumanReviewItem["status"], "Not Started" | "In Progress" | "Passed" | "Failed" | "Skipped"> = {
      "Needs Review": "Not Started",
      "In Progress": "In Progress",
      Completed: "Passed",
      Passed: "Passed",
      Failed: "Failed",
      "Needs Improvement": "In Progress",
      "Not Applicable": "Skipped",
    };
    useFrameworkStore.getState().patchCheckLocal(checkId, {
      status: checkStatusMap[computedStatus],
    });

    humanReviewsService
      .saveHumanReviewResult(id, checkId, result, rating, notes, screenshotUrl)
      .then((saved) => {
        set((state) => ({
          humanReviews: state.humanReviews.map((item) => (item.id === id ? saved : item)),
        }));

        // Recompute the live Human Review completion % for the project card.
        const projectId = get().currentProjectId;
        if (projectId) {
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
      .catch((err) => console.error("saveReviewResult persist failed:", err));
  },

  setHumanReviews: (value) =>
    set((state) => ({
      humanReviews:
        typeof value === "function"
          ? (value as (prev: HumanReviewItem[]) => HumanReviewItem[])(
              state.humanReviews
            )
          : value,
    })),

  resetReviews: () => set({ humanReviews: [], selectedReviewId: null }),
}));
