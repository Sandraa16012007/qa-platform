import { chromium, Browser, Page } from "playwright";
import {
  WebsiteContext,
  WebsitePageContext,
  WebsiteHeading,
  WebsiteLink,
  WebsiteButton,
  WebsiteForm,
  WebsiteImage,
  WebsitePageStructure,
  WebsiteDetectedComponent,
  WebsiteNavigationEdge,
  WebsiteCrawlError,
  DetectedComponentType,
} from "./types";

export interface WebsiteExtractionOptions {
  /**
   * Target website URL to crawl
   */
  url?: string;
  /**
   * Maximum number of internal pages to crawl (default: 20)
   */
  maxPages?: number;
  /**
   * Maximum link depth from root URL (default: 3)
   */
  maxDepth?: number;
  /**
   * Navigation and execution timeout per page in milliseconds (default: 20000)
   */
  timeoutMs?: number;
  /**
   * Page load readiness event (default: 'domcontentloaded')
   */
  waitUntil?: "domcontentloaded" | "load" | "networkidle";
  /**
   * Custom user agent string for the headless browser
   */
  userAgent?: string;
  /**
   * Optional callback triggered when a page finishes extraction
   */
  onPageCrawled?: (page: WebsitePageContext, progress: { crawled: number; queueSize: number }) => void;
}

/**
 * Common non-page file extensions to exclude from crawler queue
 */
const IGNORED_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "svg", "webp", "ico", "bmp", "tiff",
  "pdf", "zip", "tar", "gz", "rar", "7z", "exe", "dmg", "iso", "apk",
  "mp3", "mp4", "avi", "mov", "wmv", "wav", "flac", "ogg", "m4a",
  "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv",
  "css", "js", "map", "woff", "woff2", "ttf", "eot", "otf",
  "xml", "json", "rss", "atom",
]);

/**
 * Validate and normalize a starting or discovered URL
 */
export function normalizeUrl(rawUrl: string, baseOrigin?: string): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  const trimmed = rawUrl.trim();
  if (
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("#")
  ) {
    return null;
  }

  try {
    const parsed = baseOrigin ? new URL(trimmed, baseOrigin) : new URL(trimmed);

    // Only allow HTTP and HTTPS protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    // Strip hash fragment
    parsed.hash = "";

    // Strip common tracking and analytics query parameters to avoid duplicate crawl states
    const trackingParams = [
      "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
      "ref", "fbclid", "gclid", "msclkid", "_ga", "_gl",
    ];
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    // Remove trailing slash for consistency (unless root path)
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    parsed.pathname = pathname;

    // Check extension
    const pathParts = pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart.includes(".")) {
      const ext = lastPart.split(".").pop()?.toLowerCase();
      if (ext && IGNORED_EXTENSIONS.has(ext)) {
        return null;
      }
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Checks if a normalized candidate URL belongs to the same domain/origin as the root
 */
export function isSameOrigin(targetUrl: string, baseOrigin: string): boolean {
  try {
    const targetObj = new URL(targetUrl);
    const baseObj = new URL(baseOrigin);

    // Strict hostname match (ignoring port differences if any or subdomains)
    return targetObj.hostname.toLowerCase() === baseObj.hostname.toLowerCase();
  } catch {
    return false;
  }
}

interface DomExtractedData {
  title: string;
  description: string;
  headings: WebsiteHeading[];
  contentExcerpt: string;
  rawLinks: Array<{ text: string; href: string }>;
  buttons: WebsiteButton[];
  forms: WebsiteForm[];
  images: WebsiteImage[];
  structure: WebsitePageStructure;
  detectedComponents: WebsiteDetectedComponent[];
}

const PAGE_DOM_EXTRACTOR_SCRIPT = `
(() => {
  // 1. Page Title & Meta Descriptions
  const title = document.title || "";
  const metaDescElem =
    document.querySelector('meta[name="description"]') ||
    document.querySelector('meta[property="og:description"]') ||
    document.querySelector('meta[name="twitter:description"]');
  const description = metaDescElem ? metaDescElem.getAttribute("content") || "" : "";

  // 2. Headings (h1 through h6)
  const headingElements = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  const headings = [];
  const seenHeadings = new Set();

  for (let i = 0; i < headingElements.length; i++) {
    const el = headingElements[i];
    const level = parseInt(el.tagName.replace(/^H/i, ""), 10) || 1;
    const text = (el.textContent || "").replace(/\\s+/g, " ").trim();
    if (text && text.length > 1 && text.length < 200 && !seenHeadings.has(text)) {
      seenHeadings.add(text);
      headings.push({ level: level, text: text });
      if (headings.length >= 25) break;
    }
  }

  // 3. Meaningful Visible Text Excerpt
  const mainContainer =
    document.querySelector("main") ||
    document.querySelector("article") ||
    document.querySelector('[role="main"]') ||
    document.body;

  let contentExcerpt = "";
  if (mainContainer) {
    const clone = mainContainer.cloneNode(true);
    const nonContent = clone.querySelectorAll("script, style, noscript, svg, nav, footer, iframe");
    for (let i = 0; i < nonContent.length; i++) {
      nonContent[i].remove();
    }

    const rawText = (clone.innerText || clone.textContent || "")
      .replace(/\\r\\n|\\r|\\n/g, "\\n")
      .replace(/[ \\t]+/g, " ")
      .replace(/\\n\\s*\\n/g, "\\n")
      .trim();

    contentExcerpt = rawText.slice(0, 2500);
  }

  // 4. Links Extraction
  const anchorElements = Array.from(document.querySelectorAll("a[href]"));
  const rawLinks = [];
  const seenLinks = new Set();

  for (let i = 0; i < anchorElements.length; i++) {
    const a = anchorElements[i];
    const href = a.getAttribute("href") || "";
    const text = (a.textContent || a.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim();
    if (href && !seenLinks.has(href)) {
      seenLinks.add(href);
      rawLinks.push({ text: text.slice(0, 100), href: href });
      if (rawLinks.length >= 80) break;
    }
  }

  // 5. Buttons Extraction
  const buttonElements = Array.from(
    document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"]')
  );
  const buttons = [];
  const seenButtons = new Set();

  for (let i = 0; i < buttonElements.length; i++) {
    const btn = buttonElements[i];
    const text = (
      btn.textContent ||
      btn.getAttribute("value") ||
      btn.getAttribute("aria-label") ||
      btn.getAttribute("title") ||
      ""
    ).replace(/\\s+/g, " ").trim();

    const type = btn.getAttribute("type") || (btn.tagName.toLowerCase() === "button" ? "button" : undefined);
    const ariaLabel = btn.getAttribute("aria-label") || undefined;
    const disabled = btn.hasAttribute("disabled") || btn.getAttribute("aria-disabled") === "true";

    const key = text + "|" + (type || "") + "|" + (ariaLabel || "");
    if (text && !seenButtons.has(key)) {
      seenButtons.add(key);
      buttons.push({
        text: text.slice(0, 80),
        type: type,
        ariaLabel: ariaLabel,
        disabled: disabled ? true : undefined,
      });
      if (buttons.length >= 30) break;
    }
  }

  // 6. Helper for Field Label
  function resolveFieldLabel(input) {
    const id = input.getAttribute("id");
    if (id) {
      const labelEl = document.querySelector('label[for="' + id + '"]');
      if (labelEl && labelEl.textContent) {
        return labelEl.textContent.replace(/\\s+/g, " ").trim();
      }
    }
    const parentLabel = input.closest("label");
    if (parentLabel && parentLabel.textContent) {
      return parentLabel.textContent.replace(/\\s+/g, " ").trim();
    }
    return input.getAttribute("aria-label") || input.getAttribute("placeholder") || undefined;
  }

  // Forms and Inputs Extraction
  const formElements = Array.from(document.querySelectorAll("form"));
  const forms = [];

  for (let i = 0; i < formElements.length; i++) {
    const form = formElements[i];
    const id = form.getAttribute("id") || undefined;
    const action = form.getAttribute("action") || undefined;
    const method = (form.getAttribute("method") || "GET").toUpperCase();

    const inputEls = Array.from(form.querySelectorAll("input, textarea, select"));
    const fields = [];

    for (let j = 0; j < inputEls.length; j++) {
      const inp = inputEls[j];
      const tag = inp.tagName.toLowerCase();
      const type = tag === "textarea" ? "textarea" : tag === "select" ? "select" : inp.getAttribute("type") || "text";
      if (type === "hidden") continue;

      const name = inp.getAttribute("name") || inp.getAttribute("id") || undefined;
      const placeholder = inp.getAttribute("placeholder") || undefined;
      const label = resolveFieldLabel(inp);
      const required = inp.hasAttribute("required") || inp.getAttribute("aria-required") === "true";

      let options = undefined;
      if (tag === "select") {
        options = Array.from(inp.querySelectorAll("option"))
          .map(function(opt) { return (opt.textContent || "").trim(); })
          .filter(Boolean)
          .slice(0, 10);
      }

      fields.push({
        name: name,
        type: type,
        placeholder: placeholder ? placeholder.slice(0, 80) : undefined,
        label: label ? label.slice(0, 80) : undefined,
        required: required ? true : undefined,
        options: options,
      });
      if (fields.length >= 20) break;
    }

    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
    const submitButtonText = submitBtn
      ? (submitBtn.textContent || submitBtn.getAttribute("value") || "").trim()
      : undefined;

    forms.push({
      id: id,
      action: action,
      method: method,
      fields: fields,
      submitButtonText: submitButtonText ? submitButtonText.slice(0, 60) : undefined,
    });
    if (forms.length >= 10) break;
  }

  // Standalone Inputs
  const standaloneInputs = Array.from(document.querySelectorAll("body > *:not(form) input:not([type='hidden']), header input, nav input"));
  const standaloneFields = [];

  for (let i = 0; i < standaloneInputs.length; i++) {
    const inp = standaloneInputs[i];
    if (inp.closest("form")) continue;
    const type = inp.getAttribute("type") || "text";
    const name = inp.getAttribute("name") || inp.getAttribute("id") || undefined;
    const placeholder = inp.getAttribute("placeholder") || undefined;
    const label = resolveFieldLabel(inp);

    standaloneFields.push({
      name: name,
      type: type,
      placeholder: placeholder ? placeholder.slice(0, 80) : undefined,
      label: label ? label.slice(0, 80) : undefined,
    });
    if (standaloneFields.length >= 5) break;
  }

  if (standaloneFields.length > 0) {
    forms.push({
      id: "standalone-inputs",
      method: "STANDALONE",
      fields: standaloneFields,
    });
  }

  // 7. Images Extraction
  const imgElements = Array.from(document.querySelectorAll("img"));
  const images = [];
  for (let i = 0; i < imgElements.length; i++) {
    const img = imgElements[i];
    const src = img.getAttribute("src") || undefined;
    const alt = img.getAttribute("alt") || undefined;
    const titleAttr = img.getAttribute("title") || undefined;
    if (alt || titleAttr) {
      images.push({
        src: src ? src.slice(0, 200) : undefined,
        alt: alt ? alt.slice(0, 150) : undefined,
        title: titleAttr ? titleAttr.slice(0, 150) : undefined,
      });
      if (images.length >= 20) break;
    }
  }

  // 8. Page Semantic Structure
  const structure = {
    hasHeader: Boolean(document.querySelector("header, [role='banner']")),
    hasFooter: Boolean(document.querySelector("footer, [role='contentinfo']")),
    hasNav: Boolean(document.querySelector("nav, [role='navigation']")),
    hasSidebar: Boolean(document.querySelector("aside, [role='complementary'], .sidebar, [class*='sidebar']")),
    hasMain: Boolean(document.querySelector("main, [role='main']")),
  };

  // 9. Rich Heuristic Component Detection
  const detectedComponents = [];
  const bodyTextLower = (document.body.innerText || "").toLowerCase();

  // Heuristic: Search
  const searchInput = document.querySelector(
    'input[type="search"], input[name*="search" i], input[placeholder*="search" i], [role="search"]'
  );
  if (searchInput) {
    detectedComponents.push({
      type: "search",
      label: "Search Bar / Query Input",
      description: "Enables users to search and filter content across the platform.",
      confidence: "high",
      selectorOrLocation: searchInput.tagName.toLowerCase(),
    });
  }

  // Heuristic: Filters / Sorting
  const filterElements = document.querySelectorAll(
    '[role="searchbox"], [aria-label*="filter" i], select[name*="filter" i], select[name*="sort" i], [class*="filter" i], [class*="sort" i]'
  );
  if (filterElements.length > 0) {
    detectedComponents.push({
      type: "filter",
      label: "Filtering & Sorting Controls",
      description: "Interactive controls to filter, slice, or sort data and catalog lists.",
      confidence: "high",
    });
  }

  // Heuristic: Authentication UI
  const passwordInput = document.querySelector('input[type="password"]');
  const authElements = Array.from(document.querySelectorAll("a, button"));
  let authLinkFound = false;
  for (let i = 0; i < authElements.length; i++) {
    const t = (authElements[i].textContent || "").toLowerCase();
    if (/log in|sign in|sign up|register|logout|sign out|oauth/i.test(t)) {
      authLinkFound = true;
      break;
    }
  }
  if (passwordInput || authLinkFound) {
    detectedComponents.push({
      type: "auth",
      label: "Authentication UI",
      description: passwordInput
        ? "Login/registration credential form with password protection."
        : "Navigation entry points for user sign-in, account creation, or session management.",
      confidence: passwordInput ? "high" : "medium",
    });
  }

  // Heuristic: Upload Controls
  const fileInput = document.querySelector('input[type="file"], [class*="dropzone" i], [class*="upload" i]');
  if (fileInput) {
    detectedComponents.push({
      type: "upload",
      label: "File Upload / Drag-and-Drop Area",
      description: "Allows uploading user documents, images, or media files.",
      confidence: "high",
    });
  }

  // Heuristic: Tables / Data Grids
  const tableEl = document.querySelector("table, [role='table'], [role='grid']");
  if (tableEl) {
    const rows = tableEl.querySelectorAll("tr, [role='row']").length;
    detectedComponents.push({
      type: "table",
      label: "Data Table / Grid",
      description: "Tabular display containing structured records (~" + rows + " rows detected).",
      confidence: "high",
    });
  }

  // Heuristic: Pagination
  const paginationEl = document.querySelector(
    '[aria-label*="pagination" i], .pagination, [class*="pagination" i], nav[aria-label*="page" i]'
  );
  if (paginationEl) {
    detectedComponents.push({
      type: "pagination",
      label: "Pagination Controls",
      description: "Navigational pager for multi-page data browsing.",
      confidence: "high",
    });
  }

  // Heuristic: Cards / Grid Layout
  const cards = document.querySelectorAll('.card, [class*="card"], [class*="grid-item"]');
  if (cards.length >= 2) {
    detectedComponents.push({
      type: "card",
      label: "Card / Tile Grid Container",
      description: "Visual card components representing entity items (" + cards.length + " cards detected).",
      confidence: "high",
    });
  }

  // Heuristic: Tabs
  const tabList = document.querySelector('[role="tablist"], [role="tab"], .tabs, [class*="tabs"]');
  if (tabList) {
    detectedComponents.push({
      type: "tabs",
      label: "Tabbed Navigation Interface",
      description: "Multi-tab interface allowing switching between contextual sub-views.",
      confidence: "high",
    });
  }

  // Heuristic: Accordion / Collapsible
  const accordionEl = document.querySelector('details, [class*="accordion" i], [aria-expanded]');
  if (accordionEl) {
    detectedComponents.push({
      type: "accordion",
      label: "Collapsible / Accordion Section",
      description: "Expandable content sections or FAQ panels.",
      confidence: "medium",
    });
  }

  // Heuristic: Pricing / Billing Tier Tables
  const pricingKeywords = ["pricing", "plan", "/month", "/mo", "per month", "billed annually", "subscription"];
  let hasPricing = false;
  for (let i = 0; i < pricingKeywords.length; i++) {
    if (bodyTextLower.indexOf(pricingKeywords[i]) !== -1) {
      if (document.querySelector('[class*="pricing" i], [id*="pricing" i]') || bodyTextLower.indexOf("tier") !== -1) {
        hasPricing = true;
        break;
      }
    }
  }
  if (hasPricing) {
    detectedComponents.push({
      type: "pricing",
      label: "Pricing & Tier Plans",
      description: "Product pricing structure, tier comparison, or subscription purchase options.",
      confidence: "high",
    });
  }

  // Heuristic: Cart / Checkout / E-commerce
  const cartKeywords = ["cart", "checkout", "basket", "add to cart", "buy now", "order summary"];
  let hasCart = false;
  for (let i = 0; i < cartKeywords.length; i++) {
    if (bodyTextLower.indexOf(cartKeywords[i]) !== -1) {
      if (document.querySelector('[class*="cart" i], [aria-label*="cart" i], [id*="cart" i]')) {
        hasCart = true;
        break;
      }
    }
  }
  if (hasCart) {
    detectedComponents.push({
      type: "cart_checkout",
      label: "Shopping Cart & Checkout Flow",
      description: "E-commerce order placement, cart drawer, or checkout mechanism.",
      confidence: "high",
    });
  }

  // Heuristic: Dashboard / Charts / Metrics
  const chartEl = document.querySelector('canvas, svg.recharts-surface, [class*="chart" i], [class*="metric" i]');
  if (chartEl) {
    detectedComponents.push({
      type: "dashboard_chart",
      label: "Dashboard Metrics & Charts",
      description: "Visual data charts, trend graphs, KPI metrics, or analytics widgets.",
      confidence: "high",
    });
  }

  // Heuristic: Audio / Video Media Player
  const mediaEl = document.querySelector("video, audio, iframe[src*='youtube'], iframe[src*='vimeo']");
  if (mediaEl) {
    detectedComponents.push({
      type: "media_player",
      label: "Audio / Video Media Player",
      description: "Embedded multimedia player or interactive video stream.",
      confidence: "high",
    });
  }

  // Heuristic: Notification / Toast / Alert
  const alertEl = document.querySelector('[role="alert"], [class*="toast" i], [class*="alert" i], [class*="notification" i]');
  if (alertEl) {
    detectedComponents.push({
      type: "notification_alert",
      label: "Alert / Notification Banner",
      description: "Dynamic feedback, banner notification, or toast message system.",
      confidence: "medium",
    });
  }

  // Heuristic: Code Snippet / Technical Blocks
  const codeEl = document.querySelector("pre > code, [class*='code-block' i], [class*='highlight' i]");
  if (codeEl) {
    detectedComponents.push({
      type: "code_snippet",
      label: "Code Snippet / Syntax Display",
      description: "Formatted code blocks, API payload samples, or developer documentation snippets.",
      confidence: "high",
    });
  }

  // Heuristic: Modals / Dialogs
  const dialogEl = document.querySelector('dialog, [role="dialog"], [role="alertdialog"], [class*="modal" i]');
  if (dialogEl) {
    detectedComponents.push({
      type: "modal",
      label: "Modal / Dialog Overlay",
      description: "Overlay window for prompts, confirmations, or sub-flows.",
      confidence: "high",
    });
  }

  // Heuristic: Comments / Reviews / Social Interactions
  const commentsEl = document.querySelector('[class*="comment" i], [class*="review" i], [class*="discussion" i], [id*="comments" i]');
  if (commentsEl) {
    detectedComponents.push({
      type: "comments",
      label: "User Comments & Reviews Section",
      description: "Community discussion, user ratings, or feedback commentary.",
      confidence: "medium",
    });
  }

  // Heuristic: Custom Application Features (Unique Interactive Elements)
  const testIdElements = Array.from(document.querySelectorAll("[data-testid], [data-qa], [data-cy]"));
  const customTestIds = [];
  for (let i = 0; i < testIdElements.length; i++) {
    const el = testIdElements[i];
    const id = el.getAttribute("data-testid") || el.getAttribute("data-qa") || el.getAttribute("data-cy") || "";
    if (id && id.length > 2 && id.indexOf("icon") === -1) {
      customTestIds.push(id);
    }
  }

  if (customTestIds.length > 0) {
    const sampleIds = Array.from(new Set(customTestIds)).slice(0, 5).join(", ");
    detectedComponents.push({
      type: "custom_feature",
      label: "Application Feature Identifiers",
      description: "Custom domain components detected via testing attributes: " + sampleIds + ".",
      confidence: "medium",
    });
  }

  return {
    title: title,
    description: description,
    headings: headings,
    contentExcerpt: contentExcerpt,
    rawLinks: rawLinks,
    buttons: buttons,
    forms: forms,
    images: images,
    structure: structure,
    detectedComponents: detectedComponents,
  };
})();
`;

/**
 * Evaluate and extract structured UI & product context from an active Playwright page
 */
async function extractPageDomContext(
  page: Page,
  currentUrl: string,
  baseOrigin: string,
  depth: number,
  referrerUrl?: string,
  statusCode?: number
): Promise<{ pageContext: WebsitePageContext; discoveredLinks: string[] }> {
  const domData = await page.evaluate<DomExtractedData>(PAGE_DOM_EXTRACTOR_SCRIPT);

  // Resolve raw links relative to the page URL and filter internal/external
  const links: WebsiteLink[] = [];
  const discoveredLinks: string[] = [];

  for (const item of domData.rawLinks) {
    const normalized = normalizeUrl(item.href, currentUrl);
    if (normalized) {
      const isInternal = isSameOrigin(normalized, baseOrigin);
      links.push({
        text: item.text,
        href: normalized,
        isInternal,
      });

      if (isInternal) {
        discoveredLinks.push(normalized);
      }
    }
  }

  const pageContext: WebsitePageContext = {
    url: currentUrl,
    title: domData.title || undefined,
    description: domData.description || undefined,
    content: domData.contentExcerpt || undefined,
    headings: domData.headings.length > 0 ? domData.headings : undefined,
    links: links.length > 0 ? links : undefined,
    buttons: domData.buttons.length > 0 ? domData.buttons : undefined,
    forms: domData.forms.length > 0 ? domData.forms : undefined,
    images: domData.images.length > 0 ? domData.images : undefined,
    structure: domData.structure,
    detectedComponents: domData.detectedComponents.length > 0 ? domData.detectedComponents : undefined,
    depth,
    referrerUrl,
    statusCode,
    extractedAt: new Date().toISOString(),
  };

  return {
    pageContext,
    discoveredLinks,
  };
}

/**
 * Synthesizes top-level detected features list across all crawled pages
 */
function aggregateDetectedFeatures(pages: WebsitePageContext[]): string[] {
  const featureSet = new Set<string>();

  for (const p of pages) {
    if (!p.detectedComponents) continue;
    for (const comp of p.detectedComponents) {
      featureSet.add(comp.label);
    }
  }

  return Array.from(featureSet);
}

/**
 * Website Context Extractor (Phase 2.2.2)
 *
 * Crawls a bounded set of internal pages of a website using Playwright headlessly,
 * extracting comprehensive UI, layout, component, and navigation context.
 */
export async function extractWebsiteContext(
  options?: WebsiteExtractionOptions
): Promise<WebsiteContext | null> {
  if (!options?.url || !options.url.trim()) {
    return null;
  }

  const rootUrl = normalizeUrl(options.url);
  if (!rootUrl) {
    return {
      url: options.url.trim(),
      extractedAt: new Date().toISOString(),
      crawlErrors: [
        {
          url: options.url.trim(),
          error: "Invalid or malformed URL provided. Must start with http:// or https://.",
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  const maxPages = Math.max(1, Math.min(options.maxPages ?? 20, 50));
  const maxDepth = Math.max(0, Math.min(options.maxDepth ?? 3, 5));
  const timeoutMs = options.timeoutMs ?? 20000;
  const waitUntil = options.waitUntil ?? "domcontentloaded";

  let origin = "";
  let domain = "";
  try {
    const urlObj = new URL(rootUrl);
    origin = urlObj.origin;
    domain = urlObj.hostname;
  } catch (err) {
    return {
      url: rootUrl,
      extractedAt: new Date().toISOString(),
      crawlErrors: [
        {
          url: rootUrl,
          error: `URL parsing failed: ${err instanceof Error ? err.message : String(err)}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  const crawledPages: WebsitePageContext[] = [];
  const crawlErrors: WebsiteCrawlError[] = [];
  const navigationGraph: WebsiteNavigationEdge[] = [];
  const visitedUrls = new Set<string>();

  // Queue holds BFS crawl targets
  const queue: Array<{ url: string; depth: number; referrerUrl?: string; anchorText?: string }> = [
    { url: rootUrl, depth: 0 },
  ];
  visitedUrls.add(rootUrl);

  let browser: Browser | null = null;

  try {
    // Launch Chromium headlessly with resilient parameters
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const context = await browser.newContext({
      userAgent:
        options.userAgent ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (QA Platform Context Extractor)",
      viewport: { width: 1280, height: 800 },
      ignoreHTTPSErrors: true,
    });

    // Abort heavy media requests (images, video, audio, fonts) to make crawling fast while keeping full DOM
    await context.route("**/*", (route) => {
      const req = route.request();
      const resourceType = req.resourceType();
      if (
        resourceType === "image" ||
        resourceType === "media" ||
        resourceType === "font"
      ) {
        return route.abort();
      }
      return route.continue();
    });

    const page = await context.newPage();
    page.setDefaultNavigationTimeout(timeoutMs);
    page.setDefaultTimeout(timeoutMs);

    while (queue.length > 0 && crawledPages.length < maxPages) {
      const currentItem = queue.shift();
      if (!currentItem) break;

      const { url: currentUrl, depth, referrerUrl, anchorText } = currentItem;

      // Track edge in navigation graph if referred
      if (referrerUrl) {
        navigationGraph.push({
          fromUrl: referrerUrl,
          toUrl: currentUrl,
          anchorText,
        });
      }

      let responseStatus: number | undefined;

      try {
        const response = await page.goto(currentUrl, {
          waitUntil,
          timeout: timeoutMs,
        });

        if (response) {
          responseStatus = response.status();
        }

        // Wait brief moment for dynamic hydration/rendering if loaded quickly
        await page.waitForTimeout(300);

        // Perform DOM context extraction
        const { pageContext, discoveredLinks } = await extractPageDomContext(
          page,
          currentUrl,
          origin,
          depth,
          referrerUrl,
          responseStatus
        );

        crawledPages.push(pageContext);

        if (options.onPageCrawled) {
          options.onPageCrawled(pageContext, {
            crawled: crawledPages.length,
            queueSize: queue.length,
          });
        }

        // Queue newly discovered internal links if within depth limit
        if (depth < maxDepth && crawledPages.length + queue.length < maxPages * 2) {
          for (const nextUrl of discoveredLinks) {
            if (!visitedUrls.has(nextUrl)) {
              visitedUrls.add(nextUrl);
              queue.push({
                url: nextUrl,
                depth: depth + 1,
                referrerUrl: currentUrl,
                anchorText: pageContext.links?.find((l) => l.href === nextUrl)?.text,
              });
            }
          }
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        crawlErrors.push({
          url: currentUrl,
          error: errMsg,
          statusCode: responseStatus,
          timestamp: new Date().toISOString(),
        });
      }
    }

    await context.close();
  } catch (launchErr: unknown) {
    const errorMsg = launchErr instanceof Error ? launchErr.message : String(launchErr);
    crawlErrors.push({
      url: rootUrl,
      error: `Browser crawler launch failure: ${errorMsg}`,
      timestamp: new Date().toISOString(),
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore closing errors
      }
    }
  }

  // Synthesize top-level title and description from root page or best crawled page
  const rootPage = crawledPages.find((p) => p.depth === 0) || crawledPages[0];
  const title = rootPage?.title || undefined;
  const description = rootPage?.description || rootPage?.content?.slice(0, 300) || undefined;
  const detectedFeatures = aggregateDetectedFeatures(crawledPages);

  const websiteContext: WebsiteContext = {
    url: rootUrl,
    title,
    description,
    domain,
    pages: crawledPages,
    navigationGraph: navigationGraph.length > 0 ? navigationGraph : undefined,
    detectedFeatures: detectedFeatures.length > 0 ? detectedFeatures : undefined,
    crawlErrors: crawlErrors.length > 0 ? crawlErrors : undefined,
    extractedAt: new Date().toISOString(),
    metadata: {
      totalPagesCrawled: crawledPages.length,
      totalErrors: crawlErrors.length,
      maxDepthReached: crawledPages.reduce((max, p) => Math.max(max, p.depth), 0),
      durationMs: undefined,
    },
  };

  return websiteContext;
}
