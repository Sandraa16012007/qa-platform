/**
 * Temporary dev test script for lib/context-engine/website.ts
 *
 * Usage:
 *   npx tsx test-website-extractor.ts <url> [maxPages] [maxDepth]
 *
 * Examples:
 *   npx tsx test-website-extractor.ts https://example.com
 *   npx tsx test-website-extractor.ts https://www.w3.org/ 5 2
 *   npx tsx test-website-extractor.ts not-a-valid-url
 */

import { extractWebsiteContext } from "./lib/context-engine/website";

const line = (char = "-") => console.log(char.repeat(70));
const heading = (text: string) => {
  console.log("\n" + "=".repeat(70));
  console.log(text);
  console.log("=".repeat(70));
};

async function main() {
  // --- Read args, with sane defaults ---
  const [, , urlArg, maxPagesArg, maxDepthArg] = process.argv;
  const url = urlArg || "https://example.com";
  const maxPages = maxPagesArg ? Number(maxPagesArg) : 5;
  const maxDepth = maxDepthArg ? Number(maxDepthArg) : 2;

  heading(`CRAWLING: ${url}`);
  console.log(`Options: maxPages=${maxPages}, maxDepth=${maxDepth}`);

  const startedAt = Date.now();
  const result = await extractWebsiteContext({ url, maxPages, maxDepth });
  const durationMs = Date.now() - startedAt;

  // --- 1. Did we even get a result back? ---
  if (!result) {
    console.log("\n❌ extractWebsiteContext returned NULL.");
    console.log(
      "   This only happens when no `url` was passed at all (empty/missing input)."
    );
    console.log("   Check that you're calling it as extractWebsiteContext({ url }), not extractWebsiteContext(url).");
    return;
  }

  heading("SUMMARY");
  console.log(`URL:              ${result.url ?? "(none)"}`);
  console.log(`Domain:           ${result.domain ?? "(none)"}`);
  console.log(`Title:            ${result.title ?? "(none)"}`);
  console.log(`Description:      ${result.description?.slice(0, 120) ?? "(none)"}`);
  console.log(`Duration:         ${durationMs}ms`);
  console.log(`Pages crawled:    ${result.pages?.length ?? 0}`);
  console.log(`Nav graph edges:  ${result.navigationGraph?.length ?? 0}`);
  console.log(`Detected features:${result.detectedFeatures?.length ?? 0}`);
  console.log(`Crawl errors:     ${result.crawlErrors?.length ?? 0}`);

  // --- 2. Errors first — most important thing to know ---
  if (result.crawlErrors?.length) {
    heading("CRAWL ERRORS");
    for (const err of result.crawlErrors) {
      console.log(`✗ ${err.url}`);
      console.log(`  status: ${err.statusCode ?? "n/a"}  error: ${err.error}`);
    }
  }

  // --- 3. No pages? Stop here, nothing else to report ---
  if (!result.pages || result.pages.length === 0) {
    console.log("\n⚠️  No pages were crawled successfully.");
    return;
  }

  // --- 4. Per-page summary table ---
  heading("PAGES");
  result.pages.forEach((page, i) => {
    line();
    console.log(`[${i}] depth=${page.depth}  status=${page.statusCode ?? "n/a"}`);
    console.log(`URL:        ${page.url}`);
    console.log(`Title:      ${page.title ?? "(none)"}`);
    console.log(`Referrer:   ${page.referrerUrl ?? "(root)"}`);
    console.log(`Headings:   ${page.headings?.length ?? 0}`);
    console.log(`Links:      ${page.links?.length ?? 0} (${page.links?.filter((l) => l.isInternal).length ?? 0} internal)`);
    console.log(`Buttons:    ${page.buttons?.length ?? 0}`);
    console.log(`Forms:      ${page.forms?.length ?? 0}`);
    console.log(`Images:     ${page.images?.length ?? 0}`);
    console.log(
      `Structure:  header=${page.structure?.hasHeader} nav=${page.structure?.hasNav} main=${page.structure?.hasMain} sidebar=${page.structure?.hasSidebar} footer=${page.structure?.hasFooter}`
    );
    if (page.detectedComponents?.length) {
      console.log(`Components: ${page.detectedComponents.map((c) => c.type).join(", ")}`);
    }
  });

  // --- 5. Duplicate URL check (should be equal) ---
  heading("DUPLICATE URL CHECK");
  const urls = result.pages.map((p) => p.url);
  console.log(`Total pages:  ${urls.length}`);
  console.log(`Unique pages: ${new Set(urls).size}`);
  console.log(
    urls.length === new Set(urls).size
      ? "✓ No duplicates."
      : "✗ Duplicates found — URL normalization/visited-set may have a gap."
  );

  // --- 6. maxPages limit respected? ---
  heading("LIMIT CHECK");
  console.log(
    result.pages.length <= maxPages
      ? `✓ Pages crawled (${result.pages.length}) is within maxPages (${maxPages}).`
      : `✗ Pages crawled (${result.pages.length}) EXCEEDS maxPages (${maxPages}).`
  );
  console.log(`Max depth reached: ${result.metadata?.maxDepthReached ?? "n/a"} (limit was ${maxDepth})`);

  // --- 7. Same-origin check on the nav graph ---
  if (result.navigationGraph?.length) {
    heading("NAVIGATION GRAPH");
    const rootDomain = result.domain ?? "";
    let offOriginEdges = 0;
    for (const edge of result.navigationGraph) {
      const toHost = safeHostname(edge.toUrl);
      if (toHost && rootDomain && toHost !== rootDomain) offOriginEdges++;
      console.log(`${edge.fromUrl}  →  ${edge.toUrl}  ("${edge.anchorText ?? ""}")`);
    }
    console.log(
      offOriginEdges === 0
        ? "\n✓ All navigation edges stay on the same origin."
        : `\n✗ ${offOriginEdges} edge(s) point off-origin — same-origin filtering may have a gap.`
    );
  }

  // --- 8. Detected features across the whole crawl ---
  if (result.detectedFeatures?.length) {
    heading("DETECTED FEATURES (aggregated across all pages)");
    result.detectedFeatures.forEach((f) => console.log(`• ${f}`));
  }

  heading("DONE");
}

function safeHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});