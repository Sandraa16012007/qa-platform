import {
  cleanAndNormalizeText,
  countWords,
  applyCharLimit,
  extractPrdContextFromFiles,
  extractAdditionalContextFromFiles,
  extractMarkdownText,
  extractJsonText,
  extractYamlText,
  extractSinglePrdFile,
  extractSingleAdditionalFile,
} from "./lib/context-engine/document-extractor";

async function runTests() {
  console.log("=== Running Phase 2.3.1 Document Extraction Unit Tests ===\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extra?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}${extra ? ` -> ${extra}` : ""}`);
      failed++;
    }
  }

  // 1. Text normalization & cleaning
  const dirtyText = "   Hello \x00\x08World!  \r\n\r\n\r\n\r\nThis is QA context.\x1B[31mRed\x1B[0m   \n\n\nDone!   ";
  const cleaned = cleanAndNormalizeText(dirtyText);
  assert(!cleaned.includes("\x00"), "Control characters stripped");
  assert(!cleaned.includes("\r"), "Carriage returns converted to \\n");
  assert(!cleaned.includes("\n\n\n"), "Excessive blank lines collapsed");
  assert(cleaned.includes("Hello World!"), "Text content preserved");
  assert(countWords("This is QA context. 123-test.") === 5, "Word counter accurate");

  // 2. Character limit truncation
  const longText = "A".repeat(105_000);
  const truncatedRes = applyCharLimit(longText, 100_000);
  assert(truncatedRes.truncated === true, "Character limit triggered");
  assert(truncatedRes.text.includes("[... Content truncated"), "Truncation notice appended");

  // 3. Markdown extraction
  const mdBuffer = Buffer.from("# Product Requirements\n\n## Authentication\n- Email login\n- OAuth with Google");
  const mdRes = extractMarkdownText(mdBuffer);
  assert(mdRes.status === "success", "Markdown extracted successfully");
  assert(mdRes.text.includes("Product Requirements"), "Markdown content preserved");

  // 4. JSON extraction
  const jsonBuffer = Buffer.from(JSON.stringify({
    openapi: "3.0.0",
    info: { title: "Test API", version: "1.0.0" },
    paths: { "/users": { get: { summary: "List users" } } }
  }));
  const jsonRes = extractJsonText(jsonBuffer);
  assert(jsonRes.status === "success", "JSON parsed successfully");
  assert(jsonRes.itemCount === 3, "JSON root item count calculated");

  const corruptJsonBuffer = Buffer.from("{ invalid json ");
  const corruptJsonRes = extractJsonText(corruptJsonBuffer);
  assert(corruptJsonRes.status === "error", "Corrupt JSON caught gracefully");
  assert(corruptJsonRes.error !== undefined, "Corrupt JSON has error message");

  // 5. YAML extraction
  const yamlBuffer = Buffer.from(`
swagger: '2.0'
info:
  title: Petstore API
  version: 1.0.0
paths:
  /pets:
    get:
      description: Returns all pets
`);
  const yamlRes = extractYamlText(yamlBuffer);
  assert(yamlRes.status === "success", "YAML parsed successfully");
  assert(yamlRes.itemCount === 3, "YAML item count accurate");

  const corruptYamlBuffer = Buffer.from("key: [unclosed array\n  another: : :");
  const corruptYamlRes = extractYamlText(corruptYamlBuffer);
  assert(corruptYamlRes.status === "error", "Corrupt YAML handled gracefully");

  // 6. PDF Extraction (using real PDF if present in test data or standard buffer)
  const fs = await import("fs");
  const path = await import("path");
  const testPdfPath = path.join(process.cwd(), "node_modules", "pdf-parse", "test", "data", "01-valid.pdf");
  const realPdfBuffer = fs.existsSync(testPdfPath)
    ? fs.readFileSync(testPdfPath)
    : Buffer.from(
        "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (QA Platform PRD Spec) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000214 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n307\n%%EOF"
      );

  const pdfPrdRes = await extractSinglePrdFile({
    name: "PRD_v1.pdf",
    buffer: realPdfBuffer,
  });
  assert(pdfPrdRes.status === "success", "PDF PRD file extracted without DOMMatrix errors");
  assert(Boolean(pdfPrdRes.pageCount && pdfPrdRes.pageCount >= 1), "PDF page count detected");
  assert(Boolean(pdfPrdRes.extractedText && pdfPrdRes.extractedText.length > 10), "PDF text content extracted");


  // 7. PRD Context Multi-file Aggregation
  const prdContext = await extractPrdContextFromFiles([
    { name: "specs.md", buffer: mdBuffer },
    { name: "prd.pdf", buffer: realPdfBuffer },
  ]);
  assert(prdContext.totalFiles === 2, "PRD Context aggregated total files");
  assert(prdContext.totalCharacters > 0, "PRD Context character count aggregated");
  assert(prdContext.extractedText?.includes("specs.md") || false, "PRD Context contains source attribution header");

  // 8. Additional Context Multi-file Aggregation
  const addlContext = await extractAdditionalContextFromFiles([
    { name: "api.json", buffer: jsonBuffer },
    { name: "swagger.yaml", buffer: yamlBuffer },
    { name: "doc.pdf", buffer: realPdfBuffer },
  ]);
  assert(addlContext.totalFiles === 3, "Additional Context aggregated total files");
  assert(addlContext.files.some(f => f.format === "json"), "JSON format preserved");
  assert(addlContext.files.some(f => f.format === "yaml"), "YAML format preserved");
  assert(addlContext.files.some(f => f.format === "pdf"), "PDF format preserved");

  // 9. Unsupported file types & empty files
  const unsupportedPrd = await extractSinglePrdFile({
    name: "archive.zip",
    buffer: Buffer.from("PK..."),
  });
  assert(unsupportedPrd.status === "error", "Unsupported PRD file returns error status");
  assert(unsupportedPrd.error?.includes("Unsupported PRD file type") || false, "Clean error message for unsupported PRD");

  const emptyAddl = await extractSingleAdditionalFile({
    name: "empty.json",
    buffer: Buffer.alloc(0),
  });
  assert(emptyAddl.status === "empty", "Empty file returns empty status");

  console.log(`\n=== Test Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner threw uncaught error:", err);
  process.exit(1);
});
