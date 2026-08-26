import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Info, Loader2, CheckCircle2, AlertTriangle, Globe } from "lucide-react";

const PRODUCT_TYPES = [
  "Web App",
  "Mobile App",
  "API / Backend Service",
  "SaaS Platform",
  "E-Commerce",
  "Landing / Marketing",
];

const DOMAINS = [
  "EdTech",
  "FinTech",
  "HealthTech",
  "E-Commerce",
  "Developer Tools",
  "Social / Community",
  "Productivity / SaaS",
  "Media / Entertainment",
  "Other",
];

export type WebsiteExtractionStatus = "idle" | "extracting" | "completed" | "failed";

interface Step0BasicsProps {
  projectName: string;
  setProjectName: (val: string) => void;
  productType: string;
  setProductType: (val: string) => void;
  domain: string;
  setDomain: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (val: string) => void;
  step0Errors: Record<string, boolean>;
  extractionStatus?: WebsiteExtractionStatus;
  extractionError?: string | null;
  pagesCrawled?: number;
  goNext: () => void;
}

export default function Step0Basics({
  projectName,
  setProjectName,
  productType,
  setProductType,
  domain,
  setDomain,
  description,
  setDescription,
  websiteUrl,
  setWebsiteUrl,
  step0Errors,
  extractionStatus = "idle",
  extractionError = null,
  pagesCrawled = 0,
  goNext,
}: Step0BasicsProps) {
  const isExtracting = extractionStatus === "extracting";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-on-surface">Project Basics</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Tell us about your digital product to establish the testing foundation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Name */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono flex items-center justify-between">
            <span>Project Name *</span>
            {step0Errors.projectName && (
              <span className="text-magenta font-normal">Required</span>
            )}
          </label>
          <input
            type="text"
            placeholder="e.g. CreativeHub, LearnPro..."
            value={projectName}
            disabled={isExtracting}
            onChange={(e) => setProjectName(e.target.value)}
            className={`w-full bg-surface-container-low border rounded-lg text-xs text-on-surface px-3 py-2.5 focus:outline-none focus:border-primary font-medium ${
              step0Errors.projectName ? "border-magenta" : "border-outline"
            } ${isExtracting ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        </div>

        {/* Product Type */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono flex items-center justify-between">
            <span>Product Type *</span>
            {step0Errors.productType && (
              <span className="text-magenta font-normal">Required</span>
            )}
          </label>
          <select
            value={productType}
            disabled={isExtracting}
            onChange={(e) => setProductType(e.target.value)}
            className={`w-full bg-surface-container-low border rounded-lg text-xs text-on-surface px-3 py-2.5 focus:outline-none focus:border-primary font-medium cursor-pointer ${
              step0Errors.productType ? "border-magenta" : "border-outline"
            } ${isExtracting ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <option value="">Select product type...</option>
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Domain */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono flex items-center justify-between">
            <span>Industry / Domain *</span>
            {step0Errors.domain && (
              <span className="text-magenta font-normal">Required</span>
            )}
          </label>
          <select
            value={domain}
            disabled={isExtracting}
            onChange={(e) => setDomain(e.target.value)}
            className={`w-full bg-surface-container-low border rounded-lg text-xs text-on-surface px-3 py-2.5 focus:outline-none focus:border-primary font-medium cursor-pointer ${
              step0Errors.domain ? "border-magenta" : "border-outline"
            } ${isExtracting ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <option value="">Select domain...</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono flex items-center justify-between">
            <span>Application Description *</span>
            {step0Errors.description && (
              <span className="text-magenta font-normal">Required</span>
            )}
          </label>
          <textarea
            rows={3}
            placeholder="Briefly describe what your app does, primary users, and key value proposition..."
            value={description}
            disabled={isExtracting}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full bg-surface-container-low border rounded-lg text-xs text-on-surface p-3 focus:outline-none focus:border-primary resize-none font-medium ${
              step0Errors.description ? "border-magenta" : "border-outline"
            } ${isExtracting ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        </div>

        {/* Website URL (optional) */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono flex items-center justify-between">
            <span>Website or Staging URL <span className="text-text-muted font-normal">(Optional)</span></span>
            {websiteUrl.trim() && (
              <span className="text-[9px] text-text-muted font-normal">
                Live pages, forms & features will be extracted via Playwright
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="url"
              placeholder="https://staging.example.com"
              value={websiteUrl}
              disabled={isExtracting}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className={`w-full bg-surface-container-low border rounded-lg text-xs text-on-surface px-3 py-2.5 focus:outline-none focus:border-primary font-medium ${
                isExtracting ? "opacity-60 cursor-not-allowed" : "border-outline"
              }`}
            />
          </div>

          {/* Website Extraction State Feedback */}
          <AnimatePresence>
            {isExtracting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 bg-surface-container border border-primary/30 rounded-lg flex items-center gap-3 overflow-hidden"
              >
                <Loader2 size={16} className="text-primary animate-spin flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-primary">
                    Crawling & extracting website context...
                  </p>
                  <p className="text-[10px] text-on-surface-variant truncate">
                    Analyzing pages, navigation, interactive buttons, forms and features via Playwright
                  </p>
                </div>
              </motion.div>
            )}

            {!isExtracting && extractionStatus === "completed" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-2.5 bg-cyan-dim border border-cyan/30 rounded-lg flex items-center gap-2.5 overflow-hidden"
              >
                <CheckCircle2 size={15} className="text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary">
                    Website context extracted ({pagesCrawled} {pagesCrawled === 1 ? "page" : "pages"} crawled)
                  </p>
                </div>
              </motion.div>
            )}

            {!isExtracting && extractionStatus === "failed" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-2.5 bg-yellow-dim border border-yellow/30 rounded-lg flex items-start gap-2.5 overflow-hidden"
              >
                <AlertTriangle size={15} className="text-yellow flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-yellow">
                    Website extraction failed: {extractionError || "Could not access URL"}.
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">
                    Proceeding with manual questionnaire context without interruption.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-end pt-3">
        <motion.button
          whileHover={!isExtracting ? { scale: 1.02 } : {}}
          whileTap={!isExtracting ? { scale: 0.98 } : {}}
          onClick={goNext}
          disabled={isExtracting}
          className={`bg-primary text-on-primary-container px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all rounded-lg ${
            isExtracting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {isExtracting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Extracting Website...</span>
            </>
          ) : (
            <>
              <span>Next: Context & Assets</span>
              <ArrowRight size={14} strokeWidth={2} />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
