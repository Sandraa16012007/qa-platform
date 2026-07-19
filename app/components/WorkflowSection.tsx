"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  FlaskConical,
  Terminal,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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
    description:
      "Create product, page, feature, and domain-specific checks.",
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
    description:
      "Get quality scores, issues, and improvement recommendations.",
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
    hoverText: "group-hover:text-surface",
  },
};

/* ── Project cards data ── */
const allProjects = [
  {
    name: "StoreFront V3",
    status: "Under Review",
    statusColor: "magenta" as const,
    updated: "10m ago",
    score: 94,
    scoreColor: "text-primary",
    tests: "3,120",
    testsIcon: CheckCircle2,
  },
  {
    name: "API Gateway",
    status: "Pending",
    statusColor: "yellow" as const,
    updated: "1h ago",
    score: 72,
    scoreColor: "text-yellow",
    tests: "562",
    testsIcon: AlertCircle,
  },
];

export default function WorkflowSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* ── YOUR QA WORKFLOW ── */}
      <div className="flex items-center justify-between">
        <h3
          style={{ fontSize: 24, lineHeight: 1.3 }}
          className="font-bold text-on-surface uppercase tracking-tight whitespace-nowrap"
        >
          Your QA Workflow
        </h3>
        <div className="h-px flex-1 mx-4 bg-outline-variant" />
      </div>

      {/* Pipeline stages */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-primary/20 -translate-y-1/2" />

        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const colors = colorMap[stage.color];
          return (
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              className={`neo-border bg-surface p-4 space-y-2 relative z-10 group ${colors.hoverBorder} transition-all rounded-lg cursor-default`}
            >
              <div
                className={`w-8 h-8 ${colors.bg} neo-border ${colors.border} flex items-center justify-center rounded transition-all ${colors.hoverBg}`}
              >
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className={`${colors.text} ${colors.hoverText}`}
                />
              </div>
              <h4
                style={{ fontSize: 12, letterSpacing: "0.05em" }}
                className={`font-semibold ${colors.text} uppercase leading-none`}
              >
                {stage.title}
              </h4>
              <p className="text-sm text-on-surface-variant leading-snug">
                {stage.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ── ALL PROJECTS ── */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h3
            style={{ fontSize: 24, lineHeight: 1.3 }}
            className="font-bold text-on-surface uppercase tracking-tight whitespace-nowrap"
          >
            All Projects
          </h3>
          <div className="h-px flex-1 mx-4 bg-outline-variant" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {allProjects.map((project, index) => {
            const TestsIcon = project.testsIcon;
            const statusBorderColor =
              project.statusColor === "magenta"
                ? "hover:border-primary"
                : "hover:border-yellow";
            const statusBg =
              project.statusColor === "magenta"
                ? "bg-magenta/10 border-magenta/20 text-magenta"
                : "bg-yellow/10 border-yellow/20 text-yellow";
            const barColor =
              project.statusColor === "magenta" ? "bg-primary" : "bg-yellow";

            return (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className={`neo-border bg-surface-container-low p-6 space-y-4 group ${statusBorderColor} transition-all rounded-xl`}
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
                        Updated {project.updated}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      style={{ fontSize: 28 }}
                      className={`font-bold ${project.scoreColor}`}
                    >
                      {project.score}%
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
                    animate={{ width: `${project.score}%` }}
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
                    <TestsIcon size={16} strokeWidth={1.5} />
                    <span className="font-mono text-sm">
                      {project.tests} Tests
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ x: 2 }}
                    style={{ fontSize: 12 }}
                    className="bg-primary/10 hover:bg-primary text-primary hover:text-on-primary-container px-2 py-1.5 font-bold uppercase tracking-widest rounded transition-all flex items-center gap-1 cursor-pointer"
                  >
                    View Project{" "}
                    <ArrowRight size={14} strokeWidth={2} />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
