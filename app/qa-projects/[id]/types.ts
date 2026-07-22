export interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  qualityScore: number;
  status: string;
  frameworkProgress: number;
  automationProgress: number;
  humanReviewProgress: number;
  lastRun: string;
  lastUpdated: string;
  version: string;
  createdDate: string;
  owner: string;
  deploymentUrl: string;
  repositoryUrl: string;
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
  level: string;
  title: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  type: "Visual" | "Functionality" | "Accessibility" | "Performance" | "Security" | "Content" | "UX";
  automation: "Automated" | "Human Review";
  status: "Not Started" | "In Progress" | "Passed" | "Failed" | "Skipped";
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

export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}
