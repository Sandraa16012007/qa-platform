import { GithubContext } from "./types";

export interface GithubExtractionOptions {
  repositoryUrl?: string;
}

/**
 * GitHub Source Adapter Placeholder
 * 
 * Typed foundation for GitHub repository inspection.
 * Returns null or empty context until source extraction is implemented in later Phase 2 modules.
 */
export async function extractGithubContext(
  options?: GithubExtractionOptions
): Promise<GithubContext | null> {
  if (!options?.repositoryUrl || !options.repositoryUrl.trim()) {
    return null;
  }

  // Placeholder foundation: real repository analysis will be added in Phase 2 source ingestion
  return {
    repositoryUrl: options.repositoryUrl.trim(),
    extractedAt: new Date().toISOString(),
  };
}
