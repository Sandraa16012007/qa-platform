import { WebsiteContext } from "./types";

export interface WebsiteExtractionOptions {
  url?: string;
}

/**
 * Website Source Adapter Placeholder
 * 
 * Typed foundation for website crawling & context extraction.
 * Returns null or empty context until source extraction is implemented in later Phase 2 modules.
 */
export async function extractWebsiteContext(
  options?: WebsiteExtractionOptions
): Promise<WebsiteContext | null> {
  if (!options?.url || !options.url.trim()) {
    return null;
  }

  // Placeholder foundation: real extraction logic will be added in Phase 2 source ingestion
  return {
    url: options.url.trim(),
    extractedAt: new Date().toISOString(),
  };
}
