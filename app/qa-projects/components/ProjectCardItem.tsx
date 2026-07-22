"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Edit3,
  Copy,
  FileDown,
  Trash2,
  Play,
  RotateCw,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Project } from "../../types";
import QualityCircleDashboard from "../[id]/components/QualityCircleDashboard";

interface ProjectCardItemProps {
  project: Project;
  onEdit: (p: Project) => void;
  onDuplicate: (p: Project) => void;
  onDelete: (p: Project) => void;
  onExport: (p: Project) => void;
}

export default function ProjectCardItem({
  project,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
}: ProjectCardItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Ready":
        return "bg-emerald-dim border border-emerald/30 text-emerald-400 font-bold";
      case "Testing":
        return "bg-cyan-dim border border-cyan/30 text-cyan font-bold";
      case "Human Review":
        return "bg-yellow-dim border border-yellow/30 text-yellow font-bold";
      case "Framework Generated":
        return "bg-magenta-dim border border-magenta/30 text-magenta font-bold";
      default:
        return "bg-surface-container border border-outline text-text-muted";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="neo-border bg-surface p-6 rounded-xl space-y-4 hover:border-primary transition-all flex flex-col justify-between relative group"
    >
      {/* Top Header Row */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-on-surface truncate">
              {project.name}
            </h3>
            <span className="tag font-mono text-[9px] uppercase bg-surface-container border border-outline text-text-muted px-1.5 py-0.5 rounded">
              {project.type}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant line-clamp-1">
            {project.description}
          </p>
        </div>

        {/* Menu Toggle */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-text-muted hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-1 w-44 bg-surface-container border border-outline rounded-lg shadow-xl z-30 py-1 font-sans text-xs"
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(project);
                }}
                className="w-full text-left px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex items-center gap-2 cursor-pointer"
              >
                <Edit3 size={12} />
                Edit Settings
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate(project);
                }}
                className="w-full text-left px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex items-center gap-2 cursor-pointer"
              >
                <Copy size={12} />
                Duplicate Project
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onExport(project);
                }}
                className="w-full text-left px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex items-center gap-2 cursor-pointer"
              >
                <FileDown size={12} />
                Export QA Framework
              </button>
              <div className="my-1 border-t border-outline-variant" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(project);
                }}
                className="w-full text-left px-3 py-2 text-magenta hover:bg-magenta-dim flex items-center gap-2 cursor-pointer font-semibold"
              >
                <Trash2 size={12} />
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle Score & Progress Row */}
      <div className="flex items-center gap-4 py-2 border-y border-outline-variant">
        <QualityCircleDashboard percentage={project.qualityScore} />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-text-muted uppercase text-[10px] font-bold">QA Progress</span>
            <span className={`tag uppercase text-[9px] py-0.5 px-2 rounded ${getStatusBadgeClass(project.status)}`}>
              {project.status}
            </span>
          </div>

          {/* Combined Progress Bar */}
          <div className="h-2 bg-surface-container-high w-full rounded-full overflow-hidden flex">
            <div
              className="h-full bg-primary"
              style={{ width: `${(project.frameworkProgress * 0.4)}%` }}
              title={`Framework: ${project.frameworkProgress}%`}
            />
            <div
              className="h-full bg-cyan"
              style={{ width: `${(project.automationProgress * 0.35)}%` }}
              title={`Automation: ${project.automationProgress}%`}
            />
            <div
              className="h-full bg-yellow"
              style={{ width: `${(project.humanReviewProgress * 0.25)}%` }}
              title={`Human Review: ${project.humanReviewProgress}%`}
            />
          </div>

          <div className="flex justify-between text-[9px] text-text-muted font-mono">
            <span>Framework: {project.frameworkProgress}%</span>
            <span>Auto: {project.automationProgress}%</span>
            <span>Human: {project.humanReviewProgress}%</span>
          </div>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="flex justify-between items-center text-[10px] text-text-muted font-mono">
        <span>Owner: <strong className="text-on-surface">{project.owner}</strong></span>
        <span>Version: <strong className="text-on-surface">{project.version}</strong></span>
        <span>Last Run: <strong className="text-on-surface">{project.lastRun}</strong></span>
      </div>

      {/* Action CTAs */}
      <div className="flex items-center gap-2 pt-2">
        <Link href={`/qa-projects/${project.id}`} className="flex-1">
          <button className="w-full bg-primary text-on-primary-container font-semibold py-2 text-xs uppercase tracking-wider hover:opacity-90 transition-all rounded-lg cursor-pointer flex items-center justify-center gap-1.5">
            <span>View Workspace</span>
            <ArrowUpRight size={12} />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
