/**
 * Database row types that mirror the Supabase schema.
 * These are the raw shapes returned by PostgREST queries.
 */

// ── projects ──

export interface DbProject {
  id: string;
  user_id?: string | null;
  name: string;
  product_type: string;
  domain: string;
  description: string;
  status: string;
  quality_score: number;
  version: string;
  owner: string;
  repository_url: string;
  deployment_url: string;
  framework_checks_count: number;
  framework_progress: number;
  automation_progress: number;
  human_review_progress: number;
  last_run: string;
  created_at: string;
  updated_at: string;
}

// ── ai_understanding ──

export interface DbAiUnderstanding {
  id: string;
  project_id: string;
  summary: string;
  target_users: string[];
  core_features: string[];
  main_workflows: string[];
  quality_goals: string[];
  risk_areas: string[];
  generated_at: string;
}

// ── page_notes ──

export interface DbPageNote {
  id: string;
  project_id: string;
  page_name: string;
  author: string;
  content: string;
  created_at: string;
}

// ── qa_framework ──

export interface DbQaFramework {
  id: string;
  project_id: string;
  qa_level: string;
  page_name: string;
  // NOTE: `page_name` maps to the frontend `QaCheck.pageName` field.
  category: string;
  title: string;
  description: string;
  expected_behavior: string;
  automation_type: string;
  check_type: string;
  priority: string;
  status: string;
  notes: string;
  editable: boolean;
  created_at: string;
}

// ── human_reviews ──

export interface DbHumanReview {
  id: string;
  framework_item_id: string;
  status: string;
  review_result: string | null;
  rating: number | null;
  confidence: number | null;
  notes: string;
  screenshot_url: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

/**
 * Joined shape returned when querying human_reviews with qa_framework fields.
 * Uses Supabase's embedded select syntax:
 *   `select("*, qa_framework(*)")`
 */
export interface DbHumanReviewJoined extends DbHumanReview {
  qa_framework: Pick<
    DbQaFramework,
    | "title"
    | "qa_level"
    | "category"
    | "priority"
    | "description"
    | "expected_behavior"
    | "check_type"
  >;
}

// ── issues ──

export interface DbIssue {
  id: string;
  project_id: string;
  human_review_id: string | null;
  framework_item_id: string | null;
  title: string;
  severity: string;
  status: string;
  source: string;
  level: string;
  linked_page: string;
  assigned_to: string;
  description: string;
  recommendation: string;
  created_at: string;
}

// ─────────────────────────────────────────────
// Mappers: DB rows → Frontend types
// ─────────────────────────────────────────────

import type { Project, QaCheck, HumanReviewItem, PageNote, IssueItem } from "../../types";
import type { AiUnderstandingState } from "../../stores/useAiUnderstandingStore";

/** Format an ISO timestamp into a human-friendly relative or date string. */
function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function dbProjectToFrontend(row: DbProject): Project {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    name: row.name,
    type: row.product_type,
    domain: row.domain,
    description: row.description,
    qualityScore: row.quality_score,
    status: row.status,
    frameworkProgress: row.framework_progress,
    automationProgress: row.automation_progress,
    humanReviewProgress: row.human_review_progress,
    lastRun: row.last_run,
    lastUpdated: formatDate(row.updated_at),
    createdDate: formatDate(row.created_at),
    version: row.version,
    owner: row.owner,
    repositoryUrl: row.repository_url,
    deploymentUrl: row.deployment_url,
    frameworkChecksCount: row.framework_checks_count,
  };
}

export function frontendProjectToDb(
  p: Partial<Project>
): Partial<DbProject> {
  const mapped: Record<string, unknown> = {};
  if (p.userId !== undefined) mapped.user_id = p.userId;
  if (p.name !== undefined) mapped.name = p.name;
  if (p.type !== undefined) mapped.product_type = p.type;
  if ((p as any).domain !== undefined) mapped.domain = (p as any).domain;
  if (p.description !== undefined) mapped.description = p.description;
  if (p.qualityScore !== undefined) mapped.quality_score = p.qualityScore;
  if (p.status !== undefined) mapped.status = p.status;
  if (p.frameworkProgress !== undefined) mapped.framework_progress = p.frameworkProgress;
  if (p.automationProgress !== undefined) mapped.automation_progress = p.automationProgress;
  if (p.humanReviewProgress !== undefined) mapped.human_review_progress = p.humanReviewProgress;
  if (p.lastRun !== undefined) mapped.last_run = p.lastRun;
  if (p.version !== undefined) mapped.version = p.version;
  if (p.owner !== undefined) mapped.owner = p.owner;
  if (p.repositoryUrl !== undefined) mapped.repository_url = p.repositoryUrl;
  if (p.deploymentUrl !== undefined) mapped.deployment_url = p.deploymentUrl;
  if (p.frameworkChecksCount !== undefined) mapped.framework_checks_count = p.frameworkChecksCount;
  return mapped as Partial<DbProject>;
}

export function dbQaFrameworkToFrontend(row: DbQaFramework): QaCheck {
  return {
    id: row.id,
    title: row.title,
    level: row.qa_level as QaCheck["level"],
    pageName: row.page_name || undefined,
    category: row.category,
    priority: row.priority as QaCheck["priority"],
    status: row.status as QaCheck["status"],
    type: row.check_type,
    automation: row.automation_type as QaCheck["automation"],
    description: row.description,
    expectedBehavior: row.expected_behavior,
    notes: row.notes,
  };
}

export function frontendQaCheckToDb(
  check: Partial<QaCheck>
): Partial<DbQaFramework> {
  const mapped: Record<string, unknown> = {};
  if (check.title !== undefined) mapped.title = check.title;
  if (check.level !== undefined) mapped.qa_level = check.level;
  if (check.pageName !== undefined) mapped.page_name = check.pageName;
  if (check.category !== undefined) mapped.category = check.category;
  if (check.priority !== undefined) mapped.priority = check.priority;
  if (check.status !== undefined) mapped.status = check.status;
  if (check.type !== undefined) mapped.check_type = check.type;
  if (check.automation !== undefined) mapped.automation_type = check.automation;
  if (check.description !== undefined) mapped.description = check.description;
  if (check.expectedBehavior !== undefined) mapped.expected_behavior = check.expectedBehavior;
  if (check.notes !== undefined) mapped.notes = check.notes;
  return mapped as Partial<DbQaFramework>;
}

export function dbHumanReviewToFrontend(row: DbHumanReviewJoined): HumanReviewItem {
  const fw = row.qa_framework;
  return {
    id: row.id,
    checkId: row.framework_item_id,
    title: fw.title,
    level: fw.qa_level as HumanReviewItem["level"],
    category: fw.category,
    priority: fw.priority as HumanReviewItem["priority"],
    status: row.status as HumanReviewItem["status"],
    reviewResult: (row.review_result as HumanReviewItem["reviewResult"]) ?? undefined,
    rating: row.rating ?? undefined,
    automation: "Human Review",
    description: fw.description,
    expectedBehavior: fw.expected_behavior,
    notes: row.notes,
    screenshotUrl: row.screenshot_url,
    lastUpdated: formatDate(row.reviewed_at),
    reviewedBy: row.reviewed_by ?? undefined,
  };
}

export function dbPageNoteToFrontend(row: DbPageNote): PageNote {
  return {
    id: row.id,
    pageName: row.page_name,
    author: row.author,
    date: formatDate(row.created_at),
    content: row.content,
  };
}

export function dbAiUnderstandingToState(
  row: DbAiUnderstanding
): Omit<AiUnderstandingState, "isAnalyzing" | "isEditingSummary"> {
  return {
    summary: row.summary,
    detectedUsers: row.target_users ?? [],
    detectedFeatures: row.core_features ?? [],
    criticalWorkflows: row.main_workflows ?? [],
    riskAreas: row.risk_areas ?? [],
    qaCoverage: row.quality_goals ?? [],
  };
}

export function dbIssueToFrontend(row: DbIssue): IssueItem {
  return {
    id: row.id,
    title: row.title,
    severity: row.severity as IssueItem["severity"],
    status: row.status as IssueItem["status"],
    source: row.source as IssueItem["source"],
    level: row.level as IssueItem["level"],
    linkedPage: row.linked_page,
    assignedTo: row.assigned_to,
    description: row.description,
    recommendation: row.recommendation,
    createdDate: formatDate(row.created_at),
    linkedCheckId: row.framework_item_id ?? undefined,
    linkedReviewId: row.human_review_id ?? undefined,
  };
}

export function frontendIssueToDb(
  issue: Partial<IssueItem>,
  projectId: string
): Partial<DbIssue> {
  const mapped: Record<string, unknown> = { project_id: projectId };
  if (issue.title !== undefined) mapped.title = issue.title;
  if (issue.severity !== undefined) mapped.severity = issue.severity;
  if (issue.status !== undefined) mapped.status = issue.status;
  if (issue.source !== undefined) mapped.source = issue.source;
  if (issue.level !== undefined) mapped.level = issue.level;
  if (issue.linkedPage !== undefined) mapped.linked_page = issue.linkedPage;
  if (issue.assignedTo !== undefined) mapped.assigned_to = issue.assignedTo;
  if (issue.description !== undefined) mapped.description = issue.description;
  if (issue.recommendation !== undefined) mapped.recommendation = issue.recommendation;
  if (issue.linkedCheckId !== undefined) mapped.framework_item_id = issue.linkedCheckId || null;
  if (issue.linkedReviewId !== undefined) mapped.human_review_id = issue.linkedReviewId || null;
  return mapped as Partial<DbIssue>;
}

