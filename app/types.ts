export interface Project {
  id: string;
  name: string;
  type: string;
  domain: string;
  description: string;
  qualityScore: number;
  status: string;
  frameworkProgress: number;
  automationProgress: number;
  humanReviewProgress: number;
  lastRun: string;
  lastUpdated: string;
  createdDate: string;
  version: string;
  owner: string;
  repositoryUrl: string;
  deploymentUrl: string;
  frameworkChecksCount?: number;
}

export interface ActivityItem {
  id: string;
  time: string;
  icon: any;
  description: string;
  color: string;
}

export interface TestRun {
  id: string;
  name: string;
  completed: string;
  passed: number;
  failed: number;
  warnings: number;
  status: "Completed" | "Running" | "Failed";
}

export interface QaCheck {
  id: string;
  title: string;
  level: "Product QA" | "Page QA" | "Component QA" | "Feature QA" | "Release QA";
  pageName?: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Passed" | "Failed" | "Skipped";
  type: string;
  automation: "Automated" | "Human Review";
  description: string;
  expectedBehavior: string;
  acceptanceCriteria: string[];
  notes: string;
}

export interface DetailedTestRun {
  id: string;
  runNumber: number;
  suite: string;
  status: "Completed" | "Running" | "Failed" | "Cancelled" | "Queued";
  qualityScore: number;
  scoreTrend: {
    type: "improvement" | "decline" | "neutral";
    text: string;
  };
  passed: number;
  failed: number;
  coverage: number;
  environment: "Production" | "Staging" | "Local";
  executed: string;
  duration: string;
  scopeExecuted: string[];
  majorFailures: string[];
}

export interface HumanReviewItem {
  id: string;
  checkId: string;
  title: string;
  level: "Product QA" | "Page QA" | "Component QA" | "Feature QA" | "Release QA";
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Needs Review" | "In Progress" | "Completed" | "Needs Improvement" | "Passed" | "Failed" | "Not Applicable";
  reviewResult?: "Pass" | "Needs Improvement" | "Fail" | "Not Applicable";
  rating?: number; // 1 to 5 stars
  automation: "Human Review";
  description: string;
  expectedBehavior: string;
  acceptanceCriteria?: string[];
  notes: string;
  screenshotUrl?: string | null;
  lastUpdated?: string;
  reviewedBy?: string;
}

export interface IssueItem {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  source: "Automation" | "Human Review";
  level: "Product QA" | "Page QA" | "Component QA" | "Feature QA" | "Release QA";
  linkedPage: string;
  assignedTo: string;
  description: string;
  recommendation: string;
  createdDate: string;
  linkedCheckId?: string;
  linkedReviewId?: string;
}

export interface PageNote {
  id: string;
  pageName: string;
  author: string;
  date: string;
  content: string;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}
