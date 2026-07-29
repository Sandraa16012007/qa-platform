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

      {/* ── ALL PROJECTS ── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3
            style={{ fontSize: 24, lineHeight: 1.3 }}
            className="font-bold text-on-surface uppercase tracking-tight whitespace-nowrap"
          >
            Projects
          </h3>
          <div className="h-px flex-1 mx-4 bg-outline-variant" />
        </div>

        {projects.length === 0 ? (
          <div className="neo-border bg-surface-container-low p-8 text-center rounded-xl space-y-3">
            <p className="text-sm text-on-surface-variant">No projects created yet.</p>
            <Link
              href="/qa-projects/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline uppercase tracking-wider"
            >
              + Create your first project →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project, index) => {
              const statusBg =
                project.qualityScore >= 85
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-yellow/10 border-yellow/20 text-yellow";
              const barColor =
                project.qualityScore >= 85 ? "bg-primary" : "bg-yellow";

              return (
                <Link href={`/qa-projects/${project.id}`} key={project.id} className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="neo-border bg-surface-container-low p-6 space-y-4 group hover:border-primary transition-all rounded-xl cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4
                          style={{ fontSize: 24, lineHeight: 1.3 }}
                          className="font-bold text-on-surface"
                        >
                          {project.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div
                            style={{ fontSize: 10 }}
                            className={`px-2 py-0.5 border font-mono uppercase rounded ${statusBg}`}
                          >
                            {project.status}
                          </div>
                          <span
                            style={{ fontSize: 12 }}
                            className="text-on-surface-variant uppercase"
                          >
                            Updated {project.lastUpdated}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          style={{ fontSize: 28 }}
                          className={`font-bold ${project.qualityScore >= 85 ? "text-primary" : "text-yellow"}`}
                        >
                          {project.qualityScore}%
                        </div>
                        <div
                          style={{ fontSize: 10, letterSpacing: "-0.04em" }}
                          className="font-semibold text-on-surface-variant uppercase"
                        >
                          Avg Score
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-surface-container-highest w-full rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.qualityScore}%` }}
                        transition={{
                          duration: 1,
                          delay: 0.5 + index * 0.1,
                          ease: "easeOut",
                        }}
                        className={`h-full ${barColor}`}
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <CheckCircle2 size={16} strokeWidth={1.5} />
                        <span className="font-mono text-sm">
                          {project.frameworkChecksCount || 35} Tests
                        </span>
                      </div>
                      <div
                        style={{ fontSize: 12 }}
                        className="bg-primary/10 group-hover:bg-primary text-primary group-hover:text-on-primary-container px-2 py-1.5 font-bold uppercase tracking-widest rounded transition-all flex items-center gap-1 cursor-pointer"
                      >
                        View Project{" "}
                        <ArrowRight size={14} strokeWidth={2} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
}
