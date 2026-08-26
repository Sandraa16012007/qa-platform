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

  if (website) {
    sections.push("\n--- Extracted Website Context (Live Crawl) ---");
    if (website.title) sections.push(`Website Title: ${website.title}`);
    if (website.domain) sections.push(`Website Domain: ${website.domain}`);
    if (website.description) sections.push(`Website Meta/Summary: ${website.description}`);
    
    if (website.detectedFeatures && website.detectedFeatures.length > 0) {
      sections.push(`Detected Application Features: ${website.detectedFeatures.join(", ")}`);
    }

    if (website.pages && website.pages.length > 0) {
      sections.push(`Crawled Pages (${website.pages.length} total):`);
      website.pages.forEach((page, idx) => {
        const pageLines: string[] = [];
        pageLines.push(`  [Page ${idx + 1}] ${page.title || "Untitled"} (${page.url}) [Depth: ${page.depth}, Status: ${page.statusCode || 200}]`);
        
        if (page.description) {
          pageLines.push(`    Description: ${page.description}`);
        }

        // Structure landmarks
        if (page.structure) {
          const landmarks = Object.entries(page.structure)
            .filter(([, v]) => v)
            .map(([k]) => k.replace(/^has/, "").toLowerCase());
          if (landmarks.length > 0) {
            pageLines.push(`    Landmarks: ${landmarks.join(", ")}`);
          }
        }

        // Headings with actual level and text
        if (page.headings && page.headings.length > 0) {
          const headingsStr = page.headings
            .slice(0, 15)
            .map((h) => `H${h.level}: "${h.text}"`)
            .join(" | ");
          pageLines.push(`    Headings: ${headingsStr}`);
        }

        // Buttons with actual visible text
        if (page.buttons && page.buttons.length > 0) {
          const buttonLabels = page.buttons
            .slice(0, 20)
            .map((b) => b.text || b.ariaLabel || "Button")
            .filter(Boolean);
          if (buttonLabels.length > 0) {
            pageLines.push(`    Interactive Buttons: ${buttonLabels.map((l) => `[${l}]`).join(", ")}`);
          }
        }

        // Forms and fields with names, types, labels, placeholders, options
        if (page.forms && page.forms.length > 0) {
          page.forms.forEach((form, fIdx) => {
            const fieldDescs = form.fields.map((f) => {
              const parts: string[] = [];
              if (f.label) parts.push(`label="${f.label}"`);
              if (f.name) parts.push(`name="${f.name}"`);
              if (f.type) parts.push(`type="${f.type}"`);
              if (f.placeholder) parts.push(`placeholder="${f.placeholder}"`);
              if (f.options && f.options.length > 0) parts.push(`options=[${f.options.slice(0, 5).join(",")}]`);
              return `{${parts.join(", ")}}`;
            });
            const submitInfo = form.submitButtonText ? ` (Submit: "${form.submitButtonText}")` : "";
            pageLines.push(`    Form ${fIdx + 1}${submitInfo}: ${fieldDescs.join(", ")}`);
          });
        }

        // Detected components & features with labels and descriptions
        if (page.detectedComponents && page.detectedComponents.length > 0) {
          const compStrs = page.detectedComponents.map((c) => {
            return `${c.type} ("${c.label}": ${c.description})`;
          });
          pageLines.push(`    Detected UI Components: ${compStrs.join(" | ")}`);
        }

        // Navigation links
        if (page.links && page.links.length > 0) {
          const keyLinks = page.links
            .filter((l) => l.text && l.text.trim())
            .slice(0, 15)
            .map((l) => `"${l.text}" -> ${l.href}`);
          if (keyLinks.length > 0) {
            pageLines.push(`    Key Links: ${keyLinks.join(" | ")}`);
          }
        }

        // Images with alt text
        if (page.images && page.images.length > 0) {
          const alts = page.images
            .filter((img) => img.alt && img.alt.trim())
            .slice(0, 10)
            .map((img) => `"${img.alt}"`);
          if (alts.length > 0) {
            pageLines.push(`    Images: ${alts.join(", ")}`);
          }
        }

        sections.push(pageLines.join("\n"));
      });
    }

    // Navigation relationships
    if (website.navigationGraph && website.navigationGraph.length > 0) {
      const graphSummary = website.navigationGraph
        .slice(0, 15)
        .map((edge) => `${edge.fromUrl} -> ${edge.toUrl}${edge.anchorText ? ` ("${edge.anchorText}")` : ""}`)
        .join("\n  ");
      sections.push(`Navigation Relationships:\n  ${graphSummary}`);
    }

    // Crawl errors if any
    if (website.crawlErrors && website.crawlErrors.length > 0) {
      const errSummary = website.crawlErrors
        .map((err) => `${err.url}: ${err.error}`)
        .join("; ");
      sections.push(`Crawl Notices / Errors: ${errSummary}`);
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
