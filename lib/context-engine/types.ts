/**
 * Context Engine Data Models & Type Definitions
 * 
 * Provides unified, extensible context structures for Phase 2 source ingestion.
 * All sub-context fields in ProjectContext are optional to support progressive source addition.
 */

export type QaDepthLevel = "quick" | "balanced" | "comprehensive";

/**
 * Manual Questionnaire Context (Phase 2.1 Active Adapter Source)
 */
export interface ManualContext {
  projectName: string;
  productType: string;
  domain: string;
  description: string;
  websiteUrl?: string;
  qaDepth: QaDepthLevel;
  qualityPriorities: string[];
  automationPreferences: string[];
  humanReviewCategories?: string[];
  additionalInstructions?: string;
  extractedAt: string;
}

/**
 * Website Crawling Context (Typed Placeholder for Future Expansion)
 */
export interface WebsiteContext {
  url?: string;
  title?: string;
  description?: string;
  pages?: Array<{
    url: string;
    title?: string;
    content?: string;
  }>;
  extractedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * PRD Document Context (Typed Placeholder for Future Expansion)
 */
export interface PrdContext {
  files?: Array<{
    fileName: string;
    fileSize?: number;
    fileType?: string;
    content?: string;
    pageCount?: number;
  }>;
  extractedText?: string;
  sections?: Array<{
    title?: string;
    content?: string;
  }>;
  metadata?: Record<string, unknown>;
  extractedAt?: string;
}

/**
 * Design Context (Typed Placeholder for Future Expansion)
 */
export interface DesignContext {
  files?: Array<{
    fileName: string;
    fileSize?: number;
    fileType?: string;
    previewUrl?: string;
  }>;
  frames?: Array<{
    id: string;
    name?: string;
    description?: string;
  }>;
  metadata?: Record<string, unknown>;
  extractedAt?: string;
}

/**
 * GitHub Repository Context (Typed Placeholder for Future Expansion)
 */
export interface GithubContext {
  repositoryUrl?: string;
  branch?: string;
  readmeContent?: string;
  packageJson?: Record<string, unknown>;
  fileStructure?: string[];
  metadata?: Record<string, unknown>;
  extractedAt?: string;
}

/**
 * Source Attribution & Metadata
 */
export interface ContextSourceMeta {
  activeSources: Array<"prd" | "website" | "manual" | "github" | "design">;
  primaryDescriptionSource: "prd" | "website" | "manual" | "github" | "none";
  mergedAt: string;
  sourceCounts: {
    prdFiles: number;
    websitePages: number;
    designFiles: number;
    hasGithub: boolean;
    hasManual: boolean;
  };
}

/**
 * Unified Project Context (Output of Context Engine)
 */
export interface ProjectContext {
  manual?: ManualContext;
  website?: WebsiteContext;
  prd?: PrdContext;
  design?: DesignContext;
  github?: GithubContext;
  metadata: ContextSourceMeta;
  /**
   * Helper fields containing resolved high-priority values for quick prompt assembly
   */
  resolved: {
    projectName: string;
    productType: string;
    domain: string;
    primaryDescription: string;
    websiteUrl?: string;
    repositoryUrl?: string;
  };
}

/**
 * Raw input parameters received from the New QA Project Questionnaire Wizard
 */
export interface QuestionnaireInput {
  projectName: string;
  productType: string;
  domain: string;
  description: string;
  websiteUrl?: string;
  qaDepth?: QaDepthLevel;
  qualityPriorities?: string[];
  automationPrefs?: string[];
  humanReviewCats?: string[];
  additionalInstructions?: string;
}

/**
 * Input format for context merging
 */
export interface ContextSourcesInput {
  manual?: ManualContext | null;
  website?: WebsiteContext | null;
  prd?: PrdContext | null;
  design?: DesignContext | null;
  github?: GithubContext | null;
}
