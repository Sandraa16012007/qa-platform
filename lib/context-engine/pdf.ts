import { PrdContext } from "./types";

export interface PrdExtractionOptions {
  files?: Array<{
    name: string;
    size?: number;
    type?: string;
  }>;
}

/**
 * PRD / PDF Source Adapter Stub
 * 
 * For full server-side parsing with pdf-parse and mammoth, use extractPrdContextFromFiles in document-extractor.ts
 */
export async function extractPrdContext(
  options?: PrdExtractionOptions
): Promise<PrdContext | null> {
  if (!options?.files || options.files.length === 0) {
    return null;
  }

  return {
    files: options.files.map((f) => ({
      fileName: f.name,
      fileSize: f.size,
      fileType: f.type,
      status: "success",
      extractedAt: new Date().toISOString(),
    })),
    totalFiles: options.files.length,
    totalCharacters: 0,
    totalWords: 0,
    extractedAt: new Date().toISOString(),
  };
}


