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
 * Website Crawling Context Models (Phase 2.2 Website Source Ingestion)
 */
export interface WebsiteHeading {
  level: number;
  text: string;
}

export interface WebsiteLink {
  text: string;
  href: string;
  isInternal: boolean;
}

export interface WebsiteButton {
  text: string;
  type?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export interface WebsiteFormField {
  name?: string;
  type?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  options?: string[];
}

export interface WebsiteForm {
  id?: string;
  action?: string;
  method?: string;
  fields: WebsiteFormField[];
  submitButtonText?: string;
}

export interface WebsiteImage {
  src?: string;
  alt?: string;
  title?: string;
}

export type DetectedComponentType =
  | "search"
  | "filter"
  | "form"
  | "table"
  | "card"
  | "navigation"
  | "upload"
  | "pagination"
  | "auth"
  | "comments"
  | "modal"
  | "tabs"
  | "accordion"
  | "pricing"
  | "cart_checkout"
  | "media_player"
  | "dashboard_chart"
  | "notification_alert"
  | "code_snippet"
  | "custom_feature"
  | "other";

export interface WebsiteDetectedComponent {
  type: DetectedComponentType;
  label: string;
  description: string;
  confidence: "high" | "medium";
  selectorOrLocation?: string;
}

export interface WebsitePageStructure {
  hasHeader: boolean;
  hasFooter: boolean;
  hasNav: boolean;
  hasSidebar: boolean;
  hasMain: boolean;
}

export interface WebsitePageContext {
  url: string;
  title?: string;
  description?: string;
  content?: string;
  headings?: WebsiteHeading[];
  links?: WebsiteLink[];
  buttons?: WebsiteButton[];
  forms?: WebsiteForm[];
  images?: WebsiteImage[];
  structure?: WebsitePageStructure;
  detectedComponents?: WebsiteDetectedComponent[];
  depth: number;
  referrerUrl?: string;
  statusCode?: number;
  extractedAt: string;
}

export interface WebsiteNavigationEdge {
  fromUrl: string;
  toUrl: string;
  anchorText?: string;
}

export interface WebsiteCrawlError {
  url: string;
  error: string;
  statusCode?: number;
  timestamp: string;
}

export interface WebsiteContext {
  url?: string;
  title?: string;
  description?: string;
  domain?: string;
  pages?: WebsitePageContext[];
  navigationGraph?: WebsiteNavigationEdge[];
  detectedFeatures?: string[];
  crawlErrors?: WebsiteCrawlError[];
  extractedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * PRD Document Context (Phase 2.3.1 Active Document Ingestion)
 */
export type DocumentExtractionStatus = "success" | "empty" | "truncated" | "error";

export interface PrdFileContext {
  fileName: string;
  fileSize?: number;
  fileType?: "pdf" | "docx" | "md" | string;
  content?: string;
  extractedText?: string;
  pageCount?: number;
  characterCount?: number;
  wordCount?: number;
  status: DocumentExtractionStatus;
  error?: string;
  extractedAt: string;
}

export interface PrdContext {
  files: PrdFileContext[];
  totalFiles: number;
  totalCharacters: number;
  totalWords: number;
  extractedText?: string;
  sections?: Array<{
    title?: string;
    content?: string;
  }>;
  metadata?: Record<string, unknown>;
  extractedAt?: string;
}

/**
 * Additional Specification Context (API Specs, Swagger, Postman, YAML, JSON, PDF)
 */
export interface AdditionalFileContext {
  fileName: string;
  fileSize?: number;
  fileType?: "pdf" | "json" | "yaml" | "yml" | string;
  format: "pdf" | "json" | "yaml" | "unsupported";
  extractedText?: string;
  parsedData?: unknown;
  pageCount?: number;
  characterCount?: number;
  wordCount?: number;
  itemCount?: number;
  status: DocumentExtractionStatus;
  error?: string;
  extractedAt: string;
}

export interface AdditionalContext {
  files: AdditionalFileContext[];
  totalFiles: number;
  totalCharacters: number;
  totalWords: number;
  extractedText?: string;
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
  activeSources: Array<"prd" | "additional" | "website" | "manual" | "github" | "design">;
  primaryDescriptionSource: "prd" | "website" | "manual" | "github" | "none";
  mergedAt: string;
  sourceCounts: {
    prdFiles: number;
    additionalFiles: number;
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
  additional?: AdditionalContext;
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
  additional?: AdditionalContext | null;
  design?: DesignContext | null;
  github?: GithubContext | null;
}
