"use client";

import { motion } from "framer-motion";
import {
  Globe,
  Layers,
  Cpu,
  Sparkles,
  Play,
  RotateCw,
  AlertTriangle,
  Eye,
  Activity,
  CheckCircle2,
  User,
  Laptop,
  Calendar,
  Code,
  Clock,
  ExternalLink,
  GitBranch,
} from "lucide-react";
import { Project, TestRun, ActivityItem } from "../../types";
import EditableTags from "../EditableTags";

interface OverviewTabProps {
  project: Project;
  currentScore: number;
  runs: TestRun[];
  activities: ActivityItem[];
  summaryText: string;
  setSummaryText: (val: string) => void;
  isEditingSummary: boolean;
  setIsEditingSummary: (val: boolean) => void;
  users: string[];
  setUsers: (val: string[]) => void;
  features: string[];
  setFeatures: (val: string[]) => void;
  workflows: string[];
  setWorkflows: (val: string[]) => void;
  risks: string[];
  setRisks: (val: string[]) => void;
  setActiveTab: (tab: string) => void;
  showToast: (msg: string, type?: string) => void;
}

export default function OverviewTab({
  project,
  currentScore,
  runs,
  activities,
  summaryText,
  setSummaryText,
  isEditingSummary,
  setIsEditingSummary,
  users,
  setUsers,
  features,
  setFeatures,
  workflows,
  setWorkflows,
  risks,
  setRisks,
  setActiveTab,
  showToast,
}: OverviewTabProps) {
  return (
    <div className="grid grid-cols-12 gap-5 items-start">
      {/* Main panel - 8 columns */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Progress Overview */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
            Progress Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Metric 1 - QA Framework */}
            <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between hover:border-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                    QA Framework
                  </span>
                  <h4 className="text-xl font-bold text-on-surface mt-1">100% Complete</h4>
                </div>
                <span className="text-[9px] bg-cyan-dim border border-cyan/20 text-primary px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                  Finished
                </span>
              </div>
              <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden my-3">
                <div className="h-full bg-primary" style={{ width: "100%" }} />
              </div>
              <button
                onClick={() => setActiveTab("QA Framework")}
                className="self-start text-[10px] text-primary hover:underline font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer mt-1"
              >
                View Framework →
              </button>
            </div>

            {/* Metric 2 - Automation */}
            <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between hover:border-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                    Automation
                  </span>
                  <h4 className="text-xl font-bold text-on-surface mt-1">82% Executed</h4>
                </div>
                <span className="text-[9px] bg-cyan-dim border border-cyan/20 text-primary px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                  Running
                </span>
              </div>
              <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden my-3">
                <div className="h-full bg-primary" style={{ width: "82%" }} />
              </div>
              <button
                onClick={() => setActiveTab("Test Runs")}
                className="self-start text-[10px] text-primary hover:underline font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer mt-1"
              >
                Run Tests →
              </button>
            </div>

            {/* Metric 3 - Human Review */}
            <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between hover:border-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                    Human Review
                  </span>
                  <h4 className="text-xl font-bold text-on-surface mt-1">45% Evaluated</h4>
                </div>
                <span className="text-[9px] bg-yellow-dim border border-yellow/20 text-yellow px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                  Pending
                </span>
              </div>
              <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden my-3">
                <div className="h-full bg-primary" style={{ width: "45%" }} />
              </div>
              <button
                onClick={() => setActiveTab("Human Reviews")}
                className="self-start text-[10px] text-primary hover:underline font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer mt-1"
              >
                Continue Review →
              </button>
            </div>

            {/* Metric 4 - Reports */}
            <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between hover:border-primary transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                    Latest Report
                  </span>
                  <h4 className="text-xl font-bold text-on-surface mt-1">v{project.version} Release</h4>
                </div>
                <span className="text-[9px] bg-cyan-dim border border-cyan/20 text-primary px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                  Generated
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-mono mt-3 mb-2">
                UPDATED: YESTERDAY
              </p>
              <button
                onClick={() => setActiveTab("Reports")}
                className="self-start text-[10px] text-primary hover:underline font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer mt-1"
              >
                View Report →
              </button>
            </div>
          </div>
        </div>

        {/* Framework Coverage */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
            QA Framework Coverage
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { name: "Product QA", count: 42, icon: Globe },
              { name: "Page QA", count: 118, icon: Layers },
              { name: "Component QA", count: 74, icon: Cpu },
              { name: "Feature QA", count: 56, icon: Sparkles },
              { name: "Release QA", count: 18, icon: CheckCircle2 },
            ].map((cov) => {
              const CovIcon = cov.icon;
              return (
                <div
                  key={cov.name}
                  className="neo-border bg-surface p-3 rounded-lg flex flex-col justify-between animate-fade-in"
                >
                  <div className="w-7 h-7 bg-surface-container-high rounded flex items-center justify-center text-primary mb-2 flex-shrink-0">
                    <CovIcon size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase font-semibold">
                      {cov.name}
                    </p>
                    <h4 className="text-lg font-bold text-on-surface font-mono mt-1">
                      {cov.count} checks
                    </h4>
                  </div>
                  <span className="text-[8px] bg-cyan-dim text-primary px-1 py-0.5 rounded font-bold uppercase tracking-wider self-start mt-2">
                    Ready
                  </span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setActiveTab("QA Framework")}
            className="text-[10px] text-primary hover:underline uppercase tracking-wider font-bold block cursor-pointer"
          >
            View Full Framework →
          </button>
        </div>

        {/* AI Product Understanding */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
            AI Understanding
          </h3>
          <div className="neo-border bg-surface p-5 rounded-xl space-y-4">
            {/* Application Summary */}
            <div className="space-y-1 pb-3 border-b border-outline-variant">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                  Application Summary
                </label>
                <button
                  onClick={() => setIsEditingSummary(!isEditingSummary)}
                  className="text-[10px] text-primary hover:underline uppercase font-bold cursor-pointer"
                >
                  {isEditingSummary ? "Save" : "Edit"}
                </button>
              </div>
              {isEditingSummary ? (
                <textarea
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline rounded-lg text-sm text-on-surface px-3 py-2 focus:outline-none focus:border-primary resize-none mt-1"
                  rows={3}
                />
              ) : (
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {summaryText}
                </p>
              )}
            </div>

            {/* Breakdown columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableTags title="Detected Users" tags={users} onSave={setUsers} />
              <EditableTags title="Detected Features" tags={features} onSave={setFeatures} />
              <EditableTags title="Critical Workflows" tags={workflows} onSave={setWorkflows} />
              <EditableTags title="Potential Risk Areas" tags={risks} onSave={setRisks} />
            </div>

            <button
              onClick={() => showToast("Opening full AI understanding settings...", "info")}
              className="text-[10px] text-primary hover:underline uppercase tracking-wider font-bold block cursor-pointer mt-2"
            >
              Edit Understanding →
            </button>
          </div>
        </div>

        {/* Recent Test Runs */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
            Recent Test Runs
          </h3>
          <div className="space-y-2">
            {runs.map((run) => (
              <div
                key={run.id}
                className="neo-border bg-surface p-4 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                    <Play size={16} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{run.name}</h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Completed {run.completed}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 sm:gap-8 text-center font-mono">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase">Passed</p>
                    <p className="text-xs font-bold text-primary">{run.passed}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase">Failed</p>
                    <p className="text-xs font-bold text-magenta">{run.failed}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase">Warnings</p>
                    <p className="text-xs font-bold text-yellow">{run.warnings}</p>
                  </div>
                </div>

                {/* Action view */}
                <div className="flex items-center gap-3">
                  <span className="text-[9px] bg-cyan-dim border border-cyan/20 text-primary py-0.5 px-2 rounded uppercase font-bold">
                    {run.status}
                  </span>
                  <button
                    onClick={() => setActiveTab("Test Runs")}
                    className="text-[10px] text-primary hover:underline font-bold uppercase cursor-pointer"
                  >
                    View Run →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveTab("Test Runs")}
            className="text-[10px] text-primary hover:underline uppercase tracking-wider font-bold block cursor-pointer"
          >
            View All Test Runs →
          </button>
        </div>

        {/* Human Reviews & Issues & Quality Report - Stacked Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Human Reviews */}
          <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
              Human Reviews
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center my-3">
              <div className="bg-surface-container-low p-2 rounded">
                <p className="text-[10px] text-text-muted uppercase">Pending</p>
                <p className="text-sm font-bold text-yellow">12</p>
              </div>
              <div className="bg-surface-container-low p-2 rounded">
                <p className="text-[10px] text-text-muted uppercase">Active</p>
                <p className="text-sm font-bold text-primary">4</p>
              </div>
              <div className="bg-surface-container-low p-2 rounded">
                <p className="text-[10px] text-text-muted uppercase">Done</p>
                <p className="text-sm font-bold text-emerald-400">31</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("Human Reviews")}
              className="text-[10px] text-primary hover:underline uppercase font-bold text-left cursor-pointer"
            >
              View Human Reviews →
            </button>
          </div>

          {/* Open Issues */}
          <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
              Open Issues
            </h4>
            <div className="grid grid-cols-4 gap-1 text-center my-3">
              <div className="bg-surface-container-low p-1.5 rounded">
                <p className="text-[8px] text-text-muted uppercase">Critical</p>
                <p className="text-xs font-bold text-magenta">2</p>
              </div>
              <div className="bg-surface-container-low p-1.5 rounded">
                <p className="text-[8px] text-text-muted uppercase">High</p>
                <p className="text-xs font-bold text-magenta/80">6</p>
              </div>
              <div className="bg-surface-container-low p-1.5 rounded">
                <p className="text-[8px] text-text-muted uppercase">Medium</p>
                <p className="text-xs font-bold text-yellow">14</p>
              </div>
              <div className="bg-surface-container-low p-1.5 rounded">
                <p className="text-[8px] text-text-muted uppercase">Low</p>
                <p className="text-xs font-bold text-text-muted">27</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("Issues")}
              className="text-[10px] text-primary hover:underline uppercase font-bold text-left cursor-pointer"
            >
              View Issues →
            </button>
          </div>

          {/* Quality Report */}
          <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
              Latest Quality Report
            </h4>
            <div className="flex justify-between items-center my-3">
              <div className="space-y-0.5">
                <p className="text-[10px] text-text-muted uppercase">Report Version</p>
                <p className="text-xs font-bold text-on-surface">v{project.version}</p>
                <p className="text-[9px] text-text-muted uppercase">Yesterday</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-text-muted uppercase">Score</p>
                <p className="text-base font-bold text-primary font-mono">{currentScore}%</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("Reports")}
              className="text-[10px] text-primary hover:underline uppercase font-bold text-left cursor-pointer"
            >
              Open Report →
            </button>
          </div>
        </div>
      </div>

      {/* Right panel - 4 columns */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        {/* Recent Activity timeline */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
            Recent Activity
          </h3>
          <div className="neo-border bg-surface p-5 rounded-xl">
            <div className="relative border-l border-outline-variant pl-4 space-y-5">
              {activities.map((act) => {
                const ActIcon = act.icon;
                return (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-[25px] top-0.5 w-4 h-4 rounded-md bg-surface border border-outline flex items-center justify-center text-on-surface">
                      <ActIcon size={10} className={act.color} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-text-muted uppercase font-mono">
                        {act.time}
                      </span>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Project Information Metadata */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
            Project Information
          </h3>
          <div className="neo-border bg-surface p-5 rounded-xl space-y-3 text-xs">
            {[
              { label: "Project Owner", value: project.owner, icon: User },
              { label: "Application Type", value: project.type, icon: Laptop },
              { label: "Domain", value: project.description, icon: Globe },
              { label: "Created Date", value: project.createdDate, icon: Calendar },
              { label: "Framework Version", value: project.version, icon: Code },
              { label: "Last Updated", value: project.lastUpdated, icon: Clock },
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex justify-between items-center py-1.5 border-b border-outline-variant last:border-b-0"
                >
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <ItemIcon size={12} className="text-primary" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-semibold text-on-surface text-right font-mono">{item.value}</span>
                </div>
              );
            })}

            {/* URL resources links */}
            <div className="pt-2 flex flex-col gap-2 font-mono text-[10px]">
              <a
                href={project.deploymentUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline uppercase font-bold"
              >
                <ExternalLink size={10} />
                <span>Deployment URL</span>
              </a>
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline uppercase font-bold"
              >
                <GitBranch size={10} />
                <span>Repository URL</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
