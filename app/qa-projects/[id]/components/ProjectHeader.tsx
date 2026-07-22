"use client";

import { motion } from "framer-motion";
import { Play, Edit3, ShieldCheck } from "lucide-react";
import { Project } from "../types";
import QualityCircleDashboard from "./QualityCircleDashboard";

interface ProjectHeaderProps {
  project: Project;
  currentScore: number;
  scoreAnimation: boolean;
  handleRunQA: () => void;
  showToast: (msg: string, type?: string) => void;
}

export default function ProjectHeader({
  project,
  currentScore,
  scoreAnimation,
  handleRunQA,
  showToast,
}: ProjectHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="neo-border bg-surface p-6 rounded-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden"
    >
      <div className="space-y-2 max-w-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1
            style={{ fontSize: 32, lineHeight: 1.15, letterSpacing: "-0.015em" }}
            className="font-bold text-on-surface"
          >
            {project.name}
          </h1>

          <span className="tag font-mono uppercase bg-cyan-dim border border-cyan/30 text-primary text-xs py-0.5 px-2.5 rounded font-semibold">
            {project.type}
          </span>

          <span className="tag font-mono uppercase bg-yellow-dim border border-yellow/30 text-yellow text-xs py-0.5 px-2.5 rounded font-semibold">
            {project.status}
          </span>
        </div>

        <p className="text-sm text-on-surface-variant leading-relaxed">
          {project.description}
        </p>

        {/* Status badges summary */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant pt-1 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Version: <strong className="text-on-surface font-semibold">{project.version}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow" />
            <span>Last Run: <strong className="text-on-surface font-semibold">{project.lastRun}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Updated: <strong className="text-on-surface font-semibold">{project.lastUpdated}</strong></span>
          </div>
        </div>
      </div>

      {/* Right controls: Quality Score dial & Primary CTAs */}
      <div className="flex items-center gap-6 self-end lg:self-center">
        {/* Quality Score circular indicator dial */}
        <div className="neo-border bg-surface-container-low p-3.5 rounded-xl flex items-center gap-3.5">
          <QualityCircleDashboard percentage={currentScore} animating={scoreAnimation} />
          <div className="space-y-0.5 pr-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">
                Quality Score
              </span>
              <ShieldCheck size={12} className="text-primary" />
            </div>
            <p className="text-xs font-bold text-on-surface">
              {currentScore >= 90 ? "Excellent Quality" : currentScore >= 80 ? "Good Stability" : "Needs Review"}
            </p>
            <p className="text-[10px] text-text-muted">
              Framework & Automated evaluation
            </p>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col gap-2.5 min-w-36">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRunQA}
            className="bg-primary text-on-primary-container font-semibold py-2.5 px-4 text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 rounded-lg cursor-pointer shadow-lg"
          >
            <Play size={14} fill="currentColor" />
            Run QA
          </motion.button>

          <button
            onClick={() => showToast("Opening project configuration settings...", "info")}
            className="bg-surface-container-low border border-outline hover:border-primary hover:text-primary transition-all text-on-surface-variant font-semibold py-2 px-3 text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-lg cursor-pointer"
          >
            <Edit3 size={14} />
            Edit Project
          </button>
        </div>
      </div>
    </motion.div>
  );
}
