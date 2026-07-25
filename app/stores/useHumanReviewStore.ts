import { create } from "zustand";
import { HumanReviewItem } from "../types";
import { initialHumanReviews } from "../mockData";

interface HumanReviewStore {
  humanReviews: HumanReviewItem[];
  selectedReviewId: string | null;

  selectReview: (id: string | null) => void;
  updateReview: (id: string, updates: Partial<HumanReviewItem>) => void;
  saveReviewResult: (
    id: string,
    result: HumanReviewItem["reviewResult"],
    rating: number,
    notes: string,
    screenshotUrl?: string | null
  ) => void;
  /**
   * Drop-in replacement for React's setState dispatcher so components built
   * against `useState<HumanReviewItem[]>` can be wired to this store without
   * changing their prop signatures.
   */
  setHumanReviews: (
    value: HumanReviewItem[] | ((prev: HumanReviewItem[]) => HumanReviewItem[])
  ) => void;
  resetReviews: () => void;
}

export const useHumanReviewStore = create<HumanReviewStore>((set) => ({
  humanReviews: initialHumanReviews,
  selectedReviewId: null,

  selectReview: (id) => set({ selectedReviewId: id }),

  updateReview: (id, updates) =>
    set((state) => ({
      humanReviews: state.humanReviews.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  saveReviewResult: (id, result, rating, notes, screenshotUrl) => {
    let computedStatus: HumanReviewItem["status"] = "Completed";
    if (result === "Needs Improvement") computedStatus = "Needs Improvement";
    if (result === "Fail") computedStatus = "Failed";
    if (result === "Not Applicable") computedStatus = "Not Applicable";

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

  resetReviews: () => set({ humanReviews: initialHumanReviews, selectedReviewId: null }),
}));
