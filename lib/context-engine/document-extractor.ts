/**
 * Document Extractor & Normalizer
 * Phase 2.3.1: Document Extraction and Complementary Context Preparation
 * 
 * Extracts text and metadata locally from PRD (PDF, DOCX, MD) and
 * Additional Context (PDF, JSON, YAML/YML) files without calling any AI model.
 */

import YAML from "yaml";
import {
  AdditionalContext,
  AdditionalFileContext,
  DocumentExtractionStatus,
  PrdContext,
  PrdFileContext,
} from "./types";

export interface DocumentFileInput {
  name: string;
  buffer: Buffer | Uint8Array;
  size?: number;
  type?: string;
}

// Sensible constraints to prevent unbounded downstream memory / context
export const DOCUMENT_LIMITS = {
  MAX_FILE_SIZE_BYTES: 15 * 1024 * 1024, // 15 MB
  MAX_CHARS_PER_DOCUMENT: 100_000,       // 100k chars per doc
  MAX_TOTAL_CONTEXT_CHARS: 300_000,      // 300k chars total
};

/**
 * Strips unprintable control characters, normalizes line breaks, and collapses excess whitespace.
 */
export function cleanAndNormalizeText(rawText: string): string {
  if (!rawText || typeof rawText !== "string") return "";

  return rawText
    // Unicode normalization
    .normalize("NFKC")
    // Normalize Windows/Mac line endings to Unix \n
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove null bytes and non-printable control characters (preserve \t and \n)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Remove ANSI escape codes if present
    .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "")
    // Trim trailing whitespace on each line
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    // Collapse 3 or more consecutive newlines into 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Counts words accurately based on alphanumeric word boundaries.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  const matches = text.match(/\b[\w'-]+\b/gu);
  return matches ? matches.length : 0;
}

/**
 * Safely caps text length and appends a truncation marker if limit is exceeded.
 */
export function applyCharLimit(
  text: string,
  limit: number = DOCUMENT_LIMITS.MAX_CHARS_PER_DOCUMENT
): { text: string; truncated: boolean } {
  if (text.length <= limit) {
    return { text, truncated: false };
  }
  const truncatedText =
    text.slice(0, limit) +
    `\n\n[... Content truncated: reached ${limit.toLocaleString()} character limit ...]`;
  return { text: truncatedText, truncated: true };
}

// Ensure DOMMatrix polyfill in Node environment if missing
if (typeof globalThis !== "undefined" && typeof (globalThis as unknown as { DOMMatrix: unknown }).DOMMatrix === "undefined") {
  class DOMMatrixPolyfill {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true;
    isIdentity = true;
    constructor(init?: unknown) {
      if (Array.isArray(init) && init.length >= 6) {
        this.a = this.m11 = init[0];
        this.b = this.m12 = init[1];
        this.c = this.m21 = init[2];
        this.d = this.m22 = init[3];
        this.e = this.m41 = init[4];
        this.f = this.m42 = init[5];
      }
    }
    multiply() { return this; }
    translate() { return this; }
    scale() { return this; }
    rotate() { return this; }
    transformPoint(point: { x: number; y: number }) { return point; }
    inverse() { return this; }
  }
  (globalThis as unknown as { DOMMatrix: unknown }).DOMMatrix = DOMMatrixPolyfill;
}

/**
 * Extracts raw text from PDF buffer using pdf-parse.
 */
export async function extractPdfText(
  buffer: Buffer
): Promise<{ text: string; pageCount: number; status: DocumentExtractionStatus; error?: string }> {
  try {
    if (!buffer || buffer.length === 0) {
      return { text: "", pageCount: 0, status: "empty", error: "PDF file is empty (0 bytes)." };
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfModule = require("pdf-parse");

    let rawText = "";
    let pageCount = 1;

    if (typeof pdfModule === "function") {
      const res = await pdfModule(buffer);
      rawText = res.text || "";
      pageCount = res.numpages || 1;
    } else if (pdfModule.default && typeof pdfModule.default === "function") {
      const res = await pdfModule.default(buffer);
      rawText = res.text || "";
      pageCount = res.numpages || 1;
    } else if (pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const res = await parser.getText();
      rawText = res.text || "";
      pageCount = res.total || 1;
    } else {
      throw new Error("Unable to initialize PDF parser engine.");
    }


    const cleaned = cleanAndNormalizeText(rawText);
    if (!cleaned) {
      return {
        text: "",
        pageCount,
        status: "empty",
        error: "No readable text found in PDF (file may be scanned image or empty).",
      };
    }

    const { text, truncated } = applyCharLimit(cleaned);
    return {
      text,
      pageCount,
      status: truncated ? "truncated" : "success",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      text: "",
      pageCount: 0,
      status: "error",
      error: `PDF extraction failed: ${msg.slice(0, 150)}`,
    };
  }
}

/**
 * Extracts raw text from DOCX buffer using mammoth.
 */
export async function extractDocxText(
  buffer: Buffer
): Promise<{ text: string; status: DocumentExtractionStatus; error?: string }> {
  try {
    if (!buffer || buffer.length === 0) {
      return { text: "", status: "empty", error: "DOCX file is empty (0 bytes)." };
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const cleaned = cleanAndNormalizeText(result.value || "");

    if (!cleaned) {
      return {
        text: "",
        status: "empty",
        error: "No readable text content found in DOCX document.",
      };
    }

    const { text, truncated } = applyCharLimit(cleaned);
    return {
      text,
      status: truncated ? "truncated" : "success",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      text: "",
      status: "error",
      error: `DOCX extraction failed: ${msg.slice(0, 150)}`,
    };
  }
}

/**
 * Extracts text from Markdown / plain text buffer.
 */
export function extractMarkdownText(
  buffer: Buffer
): { text: string; status: DocumentExtractionStatus; error?: string } {
  try {
    if (!buffer || buffer.length === 0) {
      return { text: "", status: "empty", error: "Markdown file is empty (0 bytes)." };
    }

    const raw = buffer.toString("utf-8");
    const cleaned = cleanAndNormalizeText(raw);

    if (!cleaned) {
      return {
        text: "",
        status: "empty",
        error: "Markdown document contains only whitespace.",
      };
    }

    const { text, truncated } = applyCharLimit(cleaned);
    return {
      text,
      status: truncated ? "truncated" : "success",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      text: "",
      status: "error",
      error: `Markdown extraction failed: ${msg.slice(0, 150)}`,
    };
  }
}

/**
 * Safely parses and normalizes JSON files.
 */
export function extractJsonText(
  buffer: Buffer
): { text: string; parsedData?: unknown; itemCount?: number; status: DocumentExtractionStatus; error?: string } {
  try {
    if (!buffer || buffer.length === 0) {
      return { text: "", status: "empty", error: "JSON file is empty (0 bytes)." };
    }

    const rawStr = buffer.toString("utf-8").trim();
    if (!rawStr) {
      return { text: "", status: "empty", error: "JSON file is empty." };
    }

    const parsed = JSON.parse(rawStr);

    let itemCount = 0;
    if (Array.isArray(parsed)) {
      itemCount = parsed.length;
    } else if (parsed && typeof parsed === "object") {
      itemCount = Object.keys(parsed).length;
    }

    const formatted = JSON.stringify(parsed, null, 2);
    const cleaned = cleanAndNormalizeText(formatted);
    const { text, truncated } = applyCharLimit(cleaned);

    return {
      text,
      parsedData: parsed,
      itemCount,
      status: truncated ? "truncated" : "success",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      text: "",
      status: "error",
      error: `Invalid JSON format: ${msg.slice(0, 150)}`,
    };
  }
}

/**
 * Safely parses and normalizes YAML files using yaml.
 */
export function extractYamlText(
  buffer: Buffer
): { text: string; parsedData?: unknown; itemCount?: number; status: DocumentExtractionStatus; error?: string } {
  try {
    if (!buffer || buffer.length === 0) {
      return { text: "", status: "empty", error: "YAML file is empty (0 bytes)." };
    }

    const rawStr = buffer.toString("utf-8").trim();
    if (!rawStr) {
      return { text: "", status: "empty", error: "YAML file is empty." };
    }

    const parsed = YAML.parse(rawStr);

    let itemCount = 0;
    if (Array.isArray(parsed)) {
      itemCount = parsed.length;
    } else if (parsed && typeof parsed === "object") {
      itemCount = Object.keys(parsed).length;
    }

    // Re-stringify with consistent YAML formatting to remove comments/unclean spacing
    const normalizedYaml = YAML.stringify(parsed);
    const cleaned = cleanAndNormalizeText(normalizedYaml || rawStr);
    const { text, truncated } = applyCharLimit(cleaned);

    return {
      text,
      parsedData: parsed,
      itemCount,
      status: truncated ? "truncated" : "success",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      text: "",
      status: "error",
      error: `Invalid YAML format: ${msg.slice(0, 150)}`,
    };
  }
}

/**
 * Extracts a single PRD document file (PDF, DOCX, MD).
 */
export async function extractSinglePrdFile(file: DocumentFileInput): Promise<PrdFileContext> {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
  const now = new Date().toISOString();

  if (buffer.length > DOCUMENT_LIMITS.MAX_FILE_SIZE_BYTES) {
    return {
      fileName: file.name,
      fileSize: file.size || buffer.length,
      fileType: ext,
      status: "error",
      error: `File exceeds maximum allowed size of 15 MB (${(buffer.length / (1024 * 1024)).toFixed(1)} MB).`,
      extractedAt: now,
    };
  }

  if (ext === "pdf") {
    const res = await extractPdfText(buffer);
    return {
      fileName: file.name,
      fileSize: file.size || buffer.length,
      fileType: "pdf",
      extractedText: res.text,
      content: res.text,
      pageCount: res.pageCount,
      characterCount: res.text.length,
      wordCount: countWords(res.text),
      status: res.status,
      error: res.error,
      extractedAt: now,
    };
  }

  if (ext === "docx") {
    const res = await extractDocxText(buffer);
    return {
      fileName: file.name,
      fileSize: file.size || buffer.length,
      fileType: "docx",
      extractedText: res.text,
      content: res.text,
      characterCount: res.text.length,
      wordCount: countWords(res.text),
      status: res.status,
      error: res.error,
      extractedAt: now,
    };
  }

  if (ext === "md" || ext === "markdown" || ext === "txt") {
    const res = extractMarkdownText(buffer);
    return {
      fileName: file.name,
      fileSize: file.size || buffer.length,
      fileType: ext === "txt" ? "txt" : "md",
      extractedText: res.text,
      content: res.text,
      characterCount: res.text.length,
      wordCount: countWords(res.text),
      status: res.status,
      error: res.error,
      extractedAt: now,
    };
  }

  return {
    fileName: file.name,
    fileSize: file.size || buffer.length,
    fileType: ext,
    status: "error",
    error: `Unsupported PRD file type .${ext}. Supported types are: .pdf, .docx, .md`,
    extractedAt: now,
  };
}

/**
 * Extracts a single Additional Specification document file (PDF, JSON, YAML/YML).
 */
export async function extractSingleAdditionalFile(file: DocumentFileInput): Promise<AdditionalFileContext> {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
  const now = new Date().toISOString();

  if (buffer.length > DOCUMENT_LIMITS.MAX_FILE_SIZE_BYTES) {
    return {
      fileName: file.name,
      fileSize: file.size || buffer.length,
      fileType: ext,
      format: "unsupported",
      status: "error",
      error: `File exceeds maximum allowed size of 15 MB (${(buffer.length / (1024 * 1024)).toFixed(1)} MB).`,
      extractedAt: now,
    };
  }

  if (ext === "pdf") {
    const res = await extractPdfText(buffer);
    return {
      fileName: file.name,
      fileSize: file.size || buffer.length,
      fileType: "pdf",
      format: "pdf",
      extractedText: res.text,
      pageCount: res.pageCount,
      characterCount: res.text.length,
      wordCount: countWords(res.text),
      status: res.status,
      error: res.error,
      extractedAt: now,
    };
  }

  if (ext === "json") {
    const res = extractJsonText(buffer);
    return {
      fileName: file.name,
      fileSize: file.size || buffer.length,
      fileType: "json",
      format: "json",
      extractedText: res.text,
      parsedData: res.parsedData,
      itemCount: res.itemCount,
      characterCount: res.text.length,
      wordCount: countWords(res.text),
      status: res.status,
      error: res.error,
      extractedAt: now,
    };
  }

  if (ext === "yaml" || ext === "yml") {
    const res = extractYamlText(buffer);
    return {
      fileName: file.name,
      fileSize: file.size || buffer.length,
      fileType: ext,
      format: "yaml",
      extractedText: res.text,
      parsedData: res.parsedData,
      itemCount: res.itemCount,
      characterCount: res.text.length,
      wordCount: countWords(res.text),
      status: res.status,
      error: res.error,
      extractedAt: now,
    };
  }

  return {
    fileName: file.name,
    fileSize: file.size || buffer.length,
    fileType: ext,
    format: "unsupported",
    status: "error",
    error: `Unsupported additional context file type .${ext}. Supported types are: .pdf, .json, .yaml, .yml`,
    extractedAt: now,
  };
}

/**
 * Extracts and consolidates multiple PRD files into a normalized PrdContext.
 */
export async function extractPrdContextFromFiles(files: DocumentFileInput[]): Promise<PrdContext> {
  const fileContexts: PrdFileContext[] = [];

  for (const f of files) {
    const res = await extractSinglePrdFile(f);
    fileContexts.push(res);
  }

  const validTexts = fileContexts
    .filter((f) => f.status === "success" || f.status === "truncated")
    .map((f) => `### Source PRD File: ${f.fileName}\n${f.extractedText || ""}`);

  const combinedText = validTexts.join("\n\n---\n\n");
  const { text: cappedCombined } = applyCharLimit(combinedText, DOCUMENT_LIMITS.MAX_TOTAL_CONTEXT_CHARS);

  const totalCharacters = fileContexts.reduce((acc, f) => acc + (f.characterCount || 0), 0);
  const totalWords = fileContexts.reduce((acc, f) => acc + (f.wordCount || 0), 0);

  return {
    files: fileContexts,
    totalFiles: fileContexts.length,
    totalCharacters,
    totalWords,
    extractedText: cappedCombined,
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Extracts and consolidates multiple Additional Specification files into a normalized AdditionalContext.
 */
export async function extractAdditionalContextFromFiles(files: DocumentFileInput[]): Promise<AdditionalContext> {
  const fileContexts: AdditionalFileContext[] = [];

  for (const f of files) {
    const res = await extractSingleAdditionalFile(f);
    fileContexts.push(res);
  }

  const validTexts = fileContexts
    .filter((f) => f.status === "success" || f.status === "truncated")
    .map((f) => `### Specification Asset: ${f.fileName} (Format: ${f.format})\n${f.extractedText || ""}`);

  const combinedText = validTexts.join("\n\n---\n\n");
  const { text: cappedCombined } = applyCharLimit(combinedText, DOCUMENT_LIMITS.MAX_TOTAL_CONTEXT_CHARS);

  const totalCharacters = fileContexts.reduce((acc, f) => acc + (f.characterCount || 0), 0);
  const totalWords = fileContexts.reduce((acc, f) => acc + (f.wordCount || 0), 0);

  return {
    files: fileContexts,
    totalFiles: fileContexts.length,
    totalCharacters,
    totalWords,
    extractedText: cappedCombined,
    extractedAt: new Date().toISOString(),
  };
}
