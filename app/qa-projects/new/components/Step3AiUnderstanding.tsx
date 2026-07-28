"use client";

import { motion } from "framer-motion";
import { Sparkles, Edit3, Activity, Zap, Eye, RotateCw, ArrowLeft } from "lucide-react";
import EditableTagList from "./EditableTagList";

export const QA_COVERAGE_OPTIONS = [
  "Product QA (High-level architecture & brand)",
  "Page QA (Per-page layout, specs & responsive)",
  "Component QA (Design system tokens & states)",
  "Feature QA (User workflows & state trees)",
  "Accessibility QA (WCAG 2.1 AA compliance)",
  "UX & Content QA (Tone, microcopy & usability)",
];

interface Step3AiUnderstandingProps {
  isAnalyzing: boolean;
  aiSummary: string;
  setAiSummary: (val: string) => void;
  isEditingSummary: boolean;
  setIsEditingSummary: (val: boolean) => void;
  detectedUsers: string[];
  setDetectedUsers: (items: string[]) => void;
  detectedFeatures: string[];
  setDetectedFeatures: (items: string[]) => void;
  criticalWorkflows: string[];
  setCriticalWorkflows: (items: string[]) => void;
  riskAreas: string[];
  setRiskAreas: (items: string[]) => void;
  qaCoverage: string[];
  setQaCoverage: React.Dispatch<React.SetStateAction<string[]>>;
  estimatedChecks?: number;
  estimatedAutomation?: number;
  estimatedHumanReview?: number;
  goPrev: () => void;
  handleGenerate: () => void;
}

export default function Step3AiUnderstanding({
  isAnalyzing,
  aiSummary,
  setAiSummary,
  isEditingSummary,
  setIsEditingSummary,
  detectedUsers,
  setDetectedUsers,
  detectedFeatures,
  setDetectedFeatures,
  criticalWorkflows,
  setCriticalWorkflows,
  riskAreas,
  setRiskAreas,
  qaCoverage,
  setQaCoverage,
  estimatedChecks = 450,
  estimatedAutomation = 78,
  estimatedHumanReview = 22,
  goPrev,
  handleGenerate,
}: Step3AiUnderstandingProps) {
  const toggleItem = (list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="h-full flex flex-col justify-between">
      {isAnalyzing ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
              Analyzing your product...
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div>
            <h2 className="text-base font-bold text-on-surface">AI Product Understanding</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Based on the information provided, we&apos;ve analyzed your product and inferred the following. Review and edit anything before generating your QA framework.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Application Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="neo-border bg-surface rounded-xl p-4 md:col-span-2"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                  Application Summary
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingSummary(!isEditingSummary)}
                  className="text-[10px] text-text-muted hover:text-primary flex items-center gap-1 cursor-pointer transition-colors uppercase font-semibold tracking-wider"
                >
                  <Edit3 size={10} />
                  {isEditingSummary ? "Done" : "Edit"}
                </button>
              </div>
              {isEditingSummary ? (
                <textarea
                  rows={3}
                  value={aiSummary}
                  onChange={(e) => setAiSummary(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface text-xs p-3 resize-none font-medium"
                />
              ) : (
                <p className="text-xs text-on-surface-variant leading-relaxed">{aiSummary}</p>
              )}
            </motion.div>

            {/* Detected Users */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="neo-border bg-surface rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                  Detected Users
                </h3>
                <span className="text-[9px] bg-cyan-dim border border-cyan/20 text-primary px-1.5 py-0.5 rounded font-bold">
                  95% Confidence
                </span>
              </div>
              <EditableTagList items={detectedUsers} onChange={setDetectedUsers} color="primary" />
            </motion.div>

            {/* Detected Features */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="neo-border bg-surface rounded-xl p-4"
            >
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2">
                Detected Features
              </h3>
              <EditableTagList items={detectedFeatures} onChange={setDetectedFeatures} color="primary" />
            </motion.div>

            {/* Critical Workflows */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="neo-border bg-surface rounded-xl p-4"
            >
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2">
                Critical Workflows
              </h3>
              <EditableTagList items={criticalWorkflows} onChange={setCriticalWorkflows} color="magenta" />
            </motion.div>

            {/* Potential Risk Areas */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="neo-border bg-surface rounded-xl p-4"
            >
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2">
                Potential Risk Areas
              </h3>
              <EditableTagList items={riskAreas} onChange={setRiskAreas} color="yellow" />
            </motion.div>
          </div>

          {/* Recommended QA Coverage */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="neo-border bg-surface rounded-xl p-4"
          >
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2">
              Recommended QA Coverage
            </h3>
            <div className="flex flex-wrap gap-2">
              {QA_COVERAGE_OPTIONS.map((opt) => {
                const isSelected = qaCoverage.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleItem(qaCoverage, setQaCoverage, opt)}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-cyan-dim border-cyan/30 text-primary"
                        : "bg-surface-container border-outline text-text-muted hover:border-outline-variant"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Estimated Framework Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="neo-border bg-surface rounded-xl p-4"
          >
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-3">
              Estimated Framework
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "QA Checks", value: `~${estimatedChecks}`, icon: Activity },
                { label: "Automation", value: `~${estimatedAutomation}%`, icon: Zap },
                { label: "Human Review", value: `~${estimatedHumanReview}%`, icon: Eye },
                { label: "Generation Time", value: "~30s", icon: RotateCw },
              ].map((m) => {
                const MIcon = m.icon;
                return (
                  <div key={m.label} className="bg-surface-container-low border border-outline rounded-lg p-3 text-center">
                    <MIcon size={14} strokeWidth={1.5} className="text-primary mx-auto mb-1.5" />
                    <p className="text-sm font-bold text-on-surface font-mono">{m.value}</p>
                    <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">{m.label}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {!isAnalyzing && (
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
            onClick={handleGenerate}
            className="bg-primary text-on-primary-container px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all rounded-lg cursor-pointer shadow-lg"
          >
            <Sparkles size={14} strokeWidth={2} />
            Generate QA Framework
          </motion.button>
        </div>
      )}
    </div>
  );
}
