"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Sparkles,
  FlaskConical,
  Terminal,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useProjectStore } from "../stores/useProjectStore";

/* ── Workflow stages ── */
const stages = [
  {
    title: "Understand",
    icon: Brain,
    description: "Upload PRDs, designs, or describe your application",
    color: "magenta" as const,
  },
  {
    title: "Generate",
    icon: Sparkles,
    description: "Create product, page, feature, and domain-specific checks.",
    color: "yellow" as const,
  },
  {
    title: "Test",
    icon: FlaskConical,
    description: "Run automated checks and human-centric evaluations.",
    color: "cyan" as const,
  },
  {
    title: "Report",
    icon: Terminal,
    description: "Get quality scores, issues, and improvement recommendations.",
    color: "magenta" as const,
  },
];

const colorMap = {
  cyan: {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    hoverBorder: "hover:border-primary",
    hoverBg: "group-hover:bg-primary",
    hoverText: "group-hover:text-on-primary-container",
  },
  magenta: {
    text: "text-magenta",
    bg: "bg-magenta/10",
    border: "border-magenta/30",
    hoverBorder: "hover:border-magenta",
    hoverBg: "group-hover:bg-magenta",
    hoverText: "group-hover:text-white",
  },
  yellow: {
    text: "text-yellow",
    bg: "bg-yellow/10",
    border: "border-yellow/30",
    hoverBorder: "hover:border-yellow",
    hoverBg: "group-hover:bg-yellow",
    hoverText: "group-hover:text-on-surface",
  },
};

export default function WorkflowSection() {
  const projects = useProjectStore((state) => state.projects);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* ── WORKFLOW STAGES ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3
            style={{ fontSize: 24, lineHeight: 1.3 }}
            className="font-bold text-on-surface uppercase tracking-tight whitespace-nowrap"
          >
            QA Workflow
          </h3>
          <div className="h-px flex-1 mx-4 bg-outline-variant" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const c = colorMap[stage.color];

            return (
              <motion.div
                key={stage.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + index * 0.08,
                  ease: "easeOut",
                }}
                className={`neo-border bg-surface p-5 space-y-3 group ${c.hoverBorder} transition-all cursor-pointer rounded-xl flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-lg ${c.bg} ${c.text} border ${c.border} flex items-center justify-center ${c.hoverBg} ${c.hoverText} transition-all`}
                    >
                      <Icon size={20} strokeWidth={1.5} />
                    </div>
                    <span
                      style={{ fontSize: 10 }}
                      className="font-mono text-on-surface-variant font-bold"
                    >
                      0{index + 1}
                    </span>
                  </div>

                  <div>
                    <h4
                      style={{ fontSize: 18, lineHeight: 1.2 }}
                      className="font-bold text-on-surface"
                    >
                      {stage.title}
                    </h4>
                    <p
                      style={{ fontSize: 13, lineHeight: 1.5 }}
                      className="text-on-surface-variant mt-1"
                    >
                      {stage.description}
                    </p>
                  </div>
                </div>

                <div
                  style={{ fontSize: 10, letterSpacing: "0.08em" }}
                  className={`font-semibold uppercase tracking-widest ${c.text} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}
                >
                  Explore Stage <ArrowRight size={12} strokeWidth={2} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
