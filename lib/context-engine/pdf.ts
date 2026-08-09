import { PrdContext } from "./types";

export interface PrdExtractionOptions {
  files?: Array<{
    name: string;
    size?: number;
    type?: string;
  }>;
}

/**
 * PRD / PDF Source Adapter Placeholder
 * 
 * Typed foundation for PRD PDF document parsing & section extraction.
 * Returns null or empty context until source extraction is implemented in later Phase 2 modules.
 */
export async function extractPrdContext(
  options?: PrdExtractionOptions
): Promise<PrdContext | null> {
  if (!options?.files || options.files.length === 0) {
    return null;
  }

  // Placeholder foundation: real PDF parsing will be added in Phase 2 source ingestion
  return {
    files: options.files.map((f) => ({
      fileName: f.name,
      fileSize: f.size,
      fileType: f.type,
    })),
    extractedAt: new Date().toISOString(),
  };
}
