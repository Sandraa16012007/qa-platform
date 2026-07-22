"use client";

import { motion } from "framer-motion";
import { ArrowRight, Info } from "lucide-react";

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
  goNext,
}: Step0BasicsProps) {
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
            onChange={(e) => setProjectName(e.target.value)}
            className={`w-full bg-surface-container-low border rounded-lg text-xs text-on-surface px-3 py-2.5 focus:outline-none focus:border-primary font-medium ${
              step0Errors.projectName ? "border-magenta" : "border-outline"
            }`}
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
            onChange={(e) => setProductType(e.target.value)}
            className={`w-full bg-surface-container-low border rounded-lg text-xs text-on-surface px-3 py-2.5 focus:outline-none focus:border-primary font-medium cursor-pointer ${
              step0Errors.productType ? "border-magenta" : "border-outline"
            }`}
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
            onChange={(e) => setDomain(e.target.value)}
            className={`w-full bg-surface-container-low border rounded-lg text-xs text-on-surface px-3 py-2.5 focus:outline-none focus:border-primary font-medium cursor-pointer ${
              step0Errors.domain ? "border-magenta" : "border-outline"
            }`}
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
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full bg-surface-container-low border rounded-lg text-xs text-on-surface p-3 focus:outline-none focus:border-primary resize-none font-medium ${
              step0Errors.description ? "border-magenta" : "border-outline"
            }`}
          />
        </div>

        {/* Website URL (optional) */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
            Website or Staging URL <span className="text-text-muted font-normal">(Optional)</span>
          </label>
          <input
            type="url"
            placeholder="https://staging.example.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full bg-surface-container-low border border-outline rounded-lg text-xs text-on-surface px-3 py-2.5 focus:outline-none focus:border-primary font-medium"
          />
        </div>
      </div>

      <div className="flex justify-end pt-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goNext}
          className="bg-primary text-on-primary-container px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all rounded-lg cursor-pointer"
        >
          <span>Next: Context & Assets</span>
          <ArrowRight size={14} strokeWidth={2} />
        </motion.button>
      </div>
    </div>
  );
}
