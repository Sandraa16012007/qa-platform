import { DesignContext } from "./types";

export interface DesignExtractionOptions {
  files?: Array<{
    name: string;
    size?: number;
    type?: string;
  }>;
}

/**
 * Design / Image Source Adapter Placeholder
 * 
 * Typed foundation for design file & image analysis.
 * Returns null or empty context until source extraction is implemented in later Phase 2 modules.
 */
export async function extractDesignContext(
  options?: DesignExtractionOptions
): Promise<DesignContext | null> {
  if (!options?.files || options.files.length === 0) {
    return null;
  }

  // Placeholder foundation: real image vision analysis will be added in Phase 2 source ingestion
  return {
    files: options.files.map((f) => ({
      fileName: f.name,
      fileSize: f.size,
      fileType: f.type,
    })),
    extractedAt: new Date().toISOString(),
  };
}
