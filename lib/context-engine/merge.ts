import {
  ContextSourceMeta,
  ContextSourcesInput,
  ProjectContext,
} from "./types";

/**
 * Context Merging Engine
 * 
 * Merges available source contexts into a single normalized ProjectContext.
 * Priority hierarchy for conflicting product information:
 *   1. PRD (Highest priority for product rules & specifications)
 *   2. Website (Second priority for live user-facing copy & features)
 *   3. Manual Questionnaire (Third priority for user-specified wizard parameters)
 *   4. GitHub (Fourth priority for codebase implementation structure)
 * 
 * Design context acts as supporting context and does not overwrite product requirements.
 */
export function mergeProjectContexts(sources: ContextSourcesInput): ProjectContext {
  const manual = sources.manual || undefined;
  const website = sources.website || undefined;
  const prd = sources.prd || undefined;
  const design = sources.design || undefined;
  const github = sources.github || undefined;

  // Track active sources
  const activeSources: Array<"prd" | "website" | "manual" | "github" | "design"> = [];
  if (prd) activeSources.push("prd");
  if (website) activeSources.push("website");
  if (manual) activeSources.push("manual");
  if (github) activeSources.push("github");
  if (design) activeSources.push("design");

  // Determine primary description source according to priority rules:
  // 1. PRD text/sections if present
  // 2. Website description/content if present
  // 3. Manual questionnaire description
  // 4. GitHub README content if present
  let primaryDescription = "";
  let primaryDescriptionSource: ContextSourceMeta["primaryDescriptionSource"] = "none";

  if (prd?.extractedText && prd.extractedText.trim()) {
    primaryDescription = prd.extractedText.trim();
    primaryDescriptionSource = "prd";
  } else if (website?.description && website.description.trim()) {
    primaryDescription = website.description.trim();
    primaryDescriptionSource = "website";
  } else if (manual?.description && manual.description.trim()) {
    primaryDescription = manual.description.trim();
    primaryDescriptionSource = "manual";
  } else if (github?.readmeContent && github.readmeContent.trim()) {
    primaryDescription = github.readmeContent.trim();
    primaryDescriptionSource = "github";
  }

  // Resolve metadata summary
  const metadata: ContextSourceMeta = {
    activeSources,
    primaryDescriptionSource,
    mergedAt: new Date().toISOString(),
    sourceCounts: {
      prdFiles: prd?.files?.length || 0,
      websitePages: website?.pages?.length || 0,
      designFiles: design?.files?.length || 0,
      hasGithub: Boolean(github?.repositoryUrl),
      hasManual: Boolean(manual?.projectName),
    },
  };

  // Resolved quick-access values for prompt construction
  const resolved = {
    projectName: manual?.projectName || website?.title || "Untitled Project",
    productType: manual?.productType || "Web Application",
    domain: manual?.domain || "Digital Product",
    primaryDescription,
    websiteUrl: website?.url || manual?.websiteUrl,
    repositoryUrl: github?.repositoryUrl,
  };

  return {
    manual,
    website,
    prd,
    design,
    github,
    metadata,
    resolved,
  };
}

/**
 * Prompt Helper for Gemini AI Understanding
 * 
 * Formats a normalized ProjectContext into a structured prompt block for Gemini calls.
 */
export function formatContextForPrompt(context: ProjectContext): string {
  const sections: string[] = [];

  const { resolved, manual, website, prd, design, github, metadata } = context;

  sections.push(`Project Name: ${resolved.projectName}`);
  sections.push(`Product Type: ${resolved.productType}`);
  sections.push(`Domain / Industry: ${resolved.domain}`);

  if (resolved.primaryDescription) {
    sections.push(`Primary Description (Source: ${metadata.primaryDescriptionSource}): ${resolved.primaryDescription}`);
  }

  if (resolved.websiteUrl) {
    sections.push(`Website / Staging URL: ${resolved.websiteUrl}`);
  }

  if (resolved.repositoryUrl) {
    sections.push(`GitHub Repository: ${resolved.repositoryUrl}`);
  }

  if (manual) {
    sections.push(`QA Depth Level: ${manual.qaDepth}`);

    if (manual.qualityPriorities.length > 0) {
      sections.push(`Quality Priorities: ${manual.qualityPriorities.join(", ")}`);
    }

    if (manual.automationPreferences.length > 0) {
      sections.push(`Automation Preferences: ${manual.automationPreferences.join(", ")}`);
    }

    if (manual.humanReviewCategories && manual.humanReviewCategories.length > 0) {
      sections.push(`Human Review Categories: ${manual.humanReviewCategories.join(", ")}`);
    }

    if (manual.additionalInstructions) {
      sections.push(`Additional Instructions: ${manual.additionalInstructions}`);
    }
  }

  if (prd?.files && prd.files.length > 0) {
    sections.push(`Attached PRD Files: ${prd.files.map((f) => f.fileName).join(", ")}`);
  }

  if (design?.files && design.files.length > 0) {
    sections.push(`Attached Design Assets: ${design.files.map((f) => f.fileName).join(", ")}`);
  }

  return sections.join("\n");
}
