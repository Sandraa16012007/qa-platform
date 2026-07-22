"use client";

import { motion } from "framer-motion";
import { Check, RotateCw } from "lucide-react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

export const GENERATION_STEPS = [
  "Analyzing product context & requirements...",
  "Identifying user personas & critical workflows...",
  "Generating Product QA framework checks...",
  "Building Page & Component test specifications...",
  "Constructing Feature state trees & edge cases...",
  "Setting up accessibility & usability standards...",
  "Finalizing framework structure...",
];

interface Step4GenerationProps {
  genCompleted: number;
}

export default function Step4Generation({ genCompleted }: Step4GenerationProps) {
  return (
    <div className="flex overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto">
        <Header />
        <div style={{ height: 64 }} />
        <div className="p-6 flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="neo-border bg-surface p-8 rounded-xl max-w-lg w-full flex flex-col items-center shadow-2xl">
            {/* Animated Icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mb-4 text-primary flex items-center justify-center"
            >
              <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="36" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="6 6" />
                <path d="M24 24H56V56H24V24Z" stroke="var(--color-primary)" strokeWidth="2" />
                <circle cx="18" cy="22" r="2" fill="var(--color-primary)" />
                <circle cx="25" cy="22" r="2" fill="var(--color-magenta)" />
                <circle cx="32" cy="22" r="2" fill="var(--color-yellow)" />
                <path d="M24 40H56" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M24 46H48" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                <path d="M24 52H40" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
              </svg>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-on-surface mb-2 text-center"
            >
              Generating Your QA Framework
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-on-surface-variant text-center mb-8"
            >
              Understanding your product and building a customized quality strategy.
            </motion.p>

            {/* Timeline */}
            <div className="w-full space-y-2">
              {GENERATION_STEPS.map((step, i) => {
                const isComplete = i < genCompleted;
                const isCurrent = i === genCompleted;
                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isCurrent || isComplete ? 1 : 0.3, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    className="flex items-center gap-3 py-1"
                  >
                    <div className="flex flex-col items-center w-5">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300 ${
                          isComplete
                            ? "bg-primary text-on-primary-container"
                            : isCurrent
                            ? "border border-primary text-primary animate-pulse"
                            : "border border-outline text-text-muted"
                        }`}
                      >
                        {isComplete ? (
                          <Check size={11} strokeWidth={3} />
                        ) : isCurrent ? (
                          <RotateCw size={10} className="animate-spin" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors duration-300 ${
                        isComplete
                          ? "text-primary font-bold"
                          : isCurrent
                          ? "text-on-surface font-semibold"
                          : "text-text-muted"
                      }`}
                    >
                      {step}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
