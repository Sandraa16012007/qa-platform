"use client";

import { motion } from "framer-motion";
import { Zap, Scale, Layers, Check, ArrowRight, ArrowLeft } from "lucide-react";

export const QUALITY_PRIORITIES = [
  "Accessibility (WCAG 2.1 AA)",
  "Performance & Speed",
  "User Experience & Design",
  "Security & Data Protection",
  "Browser & Device Compatibility",
  "SEO & Metadata",
  "Content Quality & Copywriting",
  "Edge Case Hardening",
];

export const AUTOMATION_PREFS = [
  "Automated E2E specs",
  "Visual regression checks",
  "Performance & Core Web Vitals",
  "Accessibility DOM scans",
  "API schema & payload checks",
  "Security header checks",
];

export const HUMAN_REVIEW_CATS = [
  "Usability & Flow Intuition",
  "Visual Design Polish",
  "Content Tone & Messaging",
  "Mobile Gesture Responsiveness",
  "Brand Identity Alignment",
  "Edge Case UX Handling",
];

interface Step2PreferencesProps {
  qaDepth: "quick" | "balanced" | "comprehensive";
  setQaDepth: (val: "quick" | "balanced" | "comprehensive") => void;
  qualityPriorities: string[];
  setQualityPriorities: React.Dispatch<React.SetStateAction<string[]>>;
  automationPrefs: string[];
  setAutomationPrefs: React.Dispatch<React.SetStateAction<string[]>>;
  humanReviewCats: string[];
  setHumanReviewCats: React.Dispatch<React.SetStateAction<string[]>>;
  additionalInstructions: string;
  setAdditionalInstructions: (val: string) => void;
  goNext: () => void;
  goPrev: () => void;
}

export default function Step2Preferences({
  qaDepth,
  setQaDepth,
  qualityPriorities,
  setQualityPriorities,
  automationPrefs,
  setAutomationPrefs,
  humanReviewCats,
  setHumanReviewCats,
  additionalInstructions,
  setAdditionalInstructions,
  goNext,
  goPrev,
}: Step2PreferencesProps) {
  const toggleItem = (list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <div>
          <h2 className="text-base font-bold text-on-surface">Quality Preferences</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Tell us how you&apos;d like the QA framework to be generated.
          </p>
        </div>

        {/* QA Depth */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2 block">
            QA Depth
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "quick" as const, label: "Quick", desc: "Essential quality checks only.", icon: Zap, accent: "yellow" },
              { key: "balanced" as const, label: "Balanced", desc: "Recommended for most applications.", icon: Scale, accent: "primary" },
              { key: "comprehensive" as const, label: "Comprehensive", desc: "Maximum coverage with deeper edge-case analysis.", icon: Layers, accent: "magenta" },
            ].map((opt) => {
              const isActive = qaDepth === opt.key;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setQaDepth(opt.key)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? opt.accent === "primary"
                        ? "neo-border-primary bg-cyan-dim"
                        : opt.accent === "magenta"
                        ? "border-magenta bg-magenta-dim"
                        : "border-yellow bg-yellow-dim"
                      : "neo-border hover:border-outline-variant bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon
                      size={14}
                      strokeWidth={1.5}
                      className={
                        isActive
                          ? opt.accent === "primary"
                            ? "text-primary"
                            : opt.accent === "magenta"
                            ? "text-magenta"
                            : "text-yellow"
                          : "text-text-muted"
                      }
                    />
                    <span className={`text-xs font-bold ${isActive ? "text-on-surface" : "text-on-surface-variant"}`}>
                      {opt.label}
                    </span>
                    {opt.key === "balanced" && (
                      <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quality Priorities */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2 block">
            Quality Priorities
          </label>
          <div className="flex flex-wrap gap-2">
            {QUALITY_PRIORITIES.map((p) => {
              const isSelected = qualityPriorities.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleItem(qualityPriorities, setQualityPriorities, p)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-cyan-dim border-cyan/30 text-primary"
                      : "bg-surface-container border-outline text-text-muted hover:text-on-surface-variant hover:border-outline-variant"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Automation & Human Review Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Automation Preferences */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2 block">
              Automation Preferences
            </label>
            <div className="space-y-1.5">
              {AUTOMATION_PREFS.map((item) => {
                const checked = automationPrefs.includes(item);
                return (
                  <label key={item} className="flex items-center gap-2.5 cursor-pointer group select-none">
                    <button
                      type="button"
                      onClick={() => toggleItem(automationPrefs, setAutomationPrefs, item)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                        checked ? "bg-primary border-primary" : "border-outline group-hover:border-outline-variant"
                      }`}
                    >
                      {checked && <Check size={10} strokeWidth={3} className="text-on-primary-container" />}
                    </button>
                    <span className={`text-xs ${checked ? "text-on-surface" : "text-on-surface-variant"}`}>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Human Review Categories */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2 block">
              Human Review Categories
            </label>
            <div className="space-y-1.5">
              {HUMAN_REVIEW_CATS.map((item) => {
                const checked = humanReviewCats.includes(item);
                return (
                  <label key={item} className="flex items-center gap-2.5 cursor-pointer group select-none">
                    <button
                      type="button"
                      onClick={() => toggleItem(humanReviewCats, setHumanReviewCats, item)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                        checked ? "bg-primary border-primary" : "border-outline group-hover:border-outline-variant"
                      }`}
                    >
                      {checked && <Check size={10} strokeWidth={3} className="text-on-primary-container" />}
                    </button>
                    <span className={`text-xs ${checked ? "text-on-surface" : "text-on-surface-variant"}`}>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Additional Instructions */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-1.5 block">
            Additional Instructions
          </label>
          <textarea
            rows={2}
            placeholder="Example: Prioritize accessibility, onboarding experience, and mobile usability."
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            className="w-full bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface text-sm px-4 py-2.5 resize-none placeholder:text-text-muted/50 font-medium"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4 flex-shrink-0 border-t border-outline-variant mt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goPrev}
          className="neo-border px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-on-surface flex items-center gap-2 transition-all rounded-lg cursor-pointer"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Previous
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goNext}
          className="bg-primary text-on-primary-container px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all rounded-lg cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight size={14} strokeWidth={2} />
        </motion.button>
      </div>
    </div>
  );
}
