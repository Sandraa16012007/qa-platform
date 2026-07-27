import { supabase } from "../supabase/client";
import { dbHumanReviewToFrontend, DbHumanReviewJoined } from "../supabase/types";
import type { HumanReviewItem, QaCheck } from "../../types";

const JOINED_SELECT =
  "*, qa_framework(title, qa_level, category, priority, description, expected_behavior, acceptance_criteria, check_type)";
// `!inner` makes PostgREST treat qa_framework as an inner join so the
// `.eq("qa_framework.project_id", ...)` filter below actually restricts rows,
// instead of just nulling out the embedded resource on non-matches.
const JOINED_SELECT_FILTERABLE =
  "*, qa_framework!inner(title, qa_level, category, priority, description, expected_behavior, acceptance_criteria, check_type, project_id)";

// Statuses that count as "reviewed" (a final result has been recorded) for
// completion-percentage purposes. "Needs Review" and "In Progress" do not.
const RESOLVED_REVIEW_STATUSES: HumanReviewItem["status"][] = [
  "Completed",
  "Passed",
  "Failed",
  "Needs Improvement",
  "Not Applicable",
];

/**
 * Maps a human_reviews status to the linked qa_framework check's status, so
 * the QA Framework checklist item and its Human Review entry always agree.
 */
export function mapReviewStatusToCheckStatus(
  reviewStatus: HumanReviewItem["status"]
): QaCheck["status"] {
  switch (reviewStatus) {
    case "Needs Review":
      return "Not Started";
    case "In Progress":
    case "Needs Improvement":
      return "In Progress";
    case "Completed":
    case "Passed":
      return "Passed";
    case "Failed":
      return "Failed";
    case "Not Applicable":
      return "Skipped";
    default:
      return "Not Started";
  }
}

/** Fetch all human review items for a project, joined with their QA framework metadata. */
export async function fetchHumanReviews(projectId: string): Promise<HumanReviewItem[]> {
  const { data, error } = await supabase
    .from("human_reviews")
    .select(JOINED_SELECT_FILTERABLE)
    .eq("qa_framework.project_id", projectId);

  if (error) throw error;
  return (data as unknown as DbHumanReviewJoined[]).map(dbHumanReviewToFrontend);
}

/**
 * Keeps a qa_framework check's linked human_reviews row in sync with its
 * Validation Mode:
 * - "Human Review": ensures a linked row exists (default "Needs Review" —
 *   never overwrites an existing linked row's progress).
 * - "Automated": removes any linked row, since it no longer applies.
 */
export async function syncHumanReviewLink(check: QaCheck): Promise<void> {
  if (check.automation === "Human Review") {
    const { error } = await supabase
      .from("human_reviews")
      .upsert(
        { framework_item_id: check.id, status: "Needs Review" },
        { onConflict: "framework_item_id", ignoreDuplicates: true }
      );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("human_reviews")
      .delete()
      .eq("framework_item_id", check.id);
    if (error) throw error;
  }
}

/** Save a reviewer's result for a human review item, and sync the linked QA check's status to match. */
export async function saveHumanReviewResult(
  id: string,
  checkId: string,
  result: HumanReviewItem["reviewResult"],
  rating: number,
  notes: string,
  screenshotUrl?: string | null
): Promise<HumanReviewItem> {
  let computedStatus: HumanReviewItem["status"] = "Completed";
  if (result === "Needs Improvement") computedStatus = "Needs Improvement";
  if (result === "Fail") computedStatus = "Failed";
  if (result === "Not Applicable") computedStatus = "Not Applicable";

  const { data: row, error } = await supabase
    .from("human_reviews")
    .update({
      status: computedStatus,
      review_result: result ?? null,
      rating,
      notes,
      screenshot_url: screenshotUrl ?? null,
      reviewed_by: "Admin Engineer",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(JOINED_SELECT)
    .single();

  if (error) throw error;

  // Keep the linked QA Framework checklist item's status in sync.
  const { error: syncError } = await supabase
    .from("qa_framework")
    .update({ status: mapReviewStatusToCheckStatus(computedStatus) })
    .eq("id", checkId);
  if (syncError) throw syncError;

  return dbHumanReviewToFrontend(row as unknown as DbHumanReviewJoined);
}

/**
 * Recomputes the live Human Review completion percentage for a project
 * — (# reviews with a final result) / (total human-review items) × 100 —
 * and persists it to projects.human_review_progress. Returns the new value.
 */
export async function recomputeHumanReviewProgress(projectId: string): Promise<number> {
  const { data, error } = await supabase
    .from("human_reviews")
    .select("status, qa_framework!inner(project_id)")
    .eq("qa_framework.project_id", projectId);

  if (error) throw error;

  const rows = (data as unknown as { status: HumanReviewItem["status"] }[]) || [];
  const total = rows.length;
  const resolved = rows.filter((r) => RESOLVED_REVIEW_STATUSES.includes(r.status)).length;
  const percentage = total === 0 ? 0 : Math.round((resolved / total) * 100);

  const { error: updateError } = await supabase
    .from("projects")
    .update({ human_review_progress: percentage })
    .eq("id", projectId);
  if (updateError) throw updateError;

  return percentage;
}
