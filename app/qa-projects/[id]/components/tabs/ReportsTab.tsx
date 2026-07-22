"use client";

import { motion } from "framer-motion";
import {
  FileText,
  FileDown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Layers,
  Cpu,
  User,
  ArrowUpRight,
} from "lucide-react";
import { Project, Toast } from "../../types";
import { mockReportData } from "../../mockData";
import QualityCircleDashboard from "../QualityCircleDashboard";

interface ReportsTabProps {
  project: Project;
  currentScore: number;
  showToast: (msg: string, type?: Toast["type"]) => void;
}

export default function ReportsTab({ project, currentScore, showToast }: ReportsTabProps) {
  const report = mockReportData;

  const handleExportPDF = () => {
    showToast(`Exporting Quality Report (PDF) for ${project.name} v${project.version}...`, "success");
  };

  const handleExportCSV = () => {
    showToast(`Exporting Quality Metrics (CSV) for ${project.name}...`, "info");
  };

  const handleGenerateAISummary = () => {
    showToast("Re-analyzing product specifications and generating fresh AI Quality Summary...", "info");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
      <div className="neo-border bg-surface p-6 rounded-xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-on-surface">Quality Report</h2>
              <span className="tag font-mono uppercase bg-emerald-dim border border-emerald/30 text-emerald-400 text-xs py-0.5 px-2.5 rounded font-bold">
                {report.releaseStatus}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant max-w-xl">
              Comprehensive release assessment report for <span className="text-on-surface font-semibold">{project.name} {project.version}</span>. Evaluates automated pipeline specs, accessibility compliance, visual aesthetics, and human UX reviews.
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2.5 self-end md:self-center">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 bg-primary text-on-primary-container text-xs font-bold uppercase tracking-wider rounded-lg hover:opacity-90 transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <FileDown size={14} />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-surface-container-low border border-outline hover:border-primary hover:text-primary text-on-surface text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <FileText size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-outline-variant">
          {/* Overall Quality Score */}
          <div className="neo-border bg-surface-container-low p-4 rounded-xl flex items-center gap-4 border-l-4 border-l-primary">
            <QualityCircleDashboard percentage={currentScore} />
            <div>
              <p className="text-[10px] text-text-muted font-mono uppercase font-bold">
                Overall Quality Score
              </p>
              <h3 className="text-2xl font-bold text-on-surface font-mono mt-0.5">
                {currentScore}%
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-dim px-1.5 py-0.5 rounded inline-block mt-1">
                Quality improved by +{report.scoreImprovement} since last assessment
              </span>
            </div>
          </div>

          {/* Test Coverage */}
          <div className="neo-border bg-surface-container-low p-4 rounded-xl space-y-1">
            <p className="text-[10px] text-text-muted font-mono uppercase font-bold">
              Total Test Coverage
            </p>
            <h3 className="text-2xl font-bold text-primary font-mono">
              {report.testingCoverage.totalCoverage}%
            </h3>
            <p className="text-[11px] text-on-surface-variant font-medium">
              Combined specs evaluation
            </p>
          </div>

          {/* Automation Coverage */}
          <div className="neo-border bg-surface-container-low p-4 rounded-xl space-y-1">
            <p className="text-[10px] text-text-muted font-mono uppercase font-bold">
              Automation Coverage
            </p>
            <h3 className="text-2xl font-bold text-on-surface font-mono">
              {report.testingCoverage.automatedPercentage}%
            </h3>
            <p className="text-[11px] text-on-surface-variant font-medium">
              Automated script checks
            </p>
          </div>

          {/* Human Review Evaluation */}
          <div className="neo-border bg-surface-container-low p-4 rounded-xl space-y-1">
            <p className="text-[10px] text-text-muted font-mono uppercase font-bold">
              Human Review Completion
            </p>
            <h3 className="text-2xl font-bold text-yellow font-mono">
              {report.testingCoverage.humanPercentage}%
            </h3>
            <p className="text-[11px] text-on-surface-variant font-medium">
              Usability & UX reviews
            </p>
          </div>
        </div>
      </div>

      {/* Quality Categories Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
          Quality Category Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report.qualityBreakdown.map((item) => (
            <div key={item.category} className="neo-border bg-surface p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-on-surface">{item.category}</h4>
                <span className="text-xs font-mono font-bold text-primary">{item.score}%</span>
              </div>
              <div className="h-1.5 bg-surface-container-high w-full rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-text-muted font-mono">
                <span>Status: <strong className="text-on-surface">{item.status}</strong></span>
                <span className="text-emerald-400 font-bold">Passing</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QA Level Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
          QA Level Performance Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {report.levelBreakdown.map((lvl) => (
            <div key={lvl.level} className="neo-border bg-surface p-4 rounded-xl space-y-2">
              <p className="text-[10px] text-on-surface-variant uppercase font-semibold font-mono">
                {lvl.level}
              </p>
              <h4 className="text-xl font-bold font-mono text-on-surface">
                {lvl.score}%
              </h4>
              <p className="text-[10px] text-text-muted font-mono">
                {lvl.passed} / {lvl.totalChecks} checks passed
              </p>
              <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden mt-1">
                <div className="h-full bg-primary" style={{ width: `${lvl.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations & Static AI Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Recommendations Summary (7 cols) */}
        <div className="lg:col-span-7 neo-border bg-surface p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" />
              Top Release Recommendations
            </h3>
            <span className="text-[10px] font-mono text-yellow font-bold bg-yellow-dim px-2 py-0.5 rounded border border-yellow/20">
              {report.topRecommendations.length} Action Items
            </span>
          </div>

          <div className="space-y-3">
            {report.topRecommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg border border-outline text-xs">
                <span className="w-5 h-5 rounded bg-cyan-dim text-primary flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-on-surface-variant leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Static AI Quality Summary Card (5 cols) */}
        <div className="lg:col-span-5 neo-border bg-surface p-6 rounded-xl space-y-4 border-l-4 border-l-primary">
          <div className="flex justify-between items-center border-b border-outline-variant pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1.5">
              <Sparkles size={14} />
              AI Quality Summary
            </h3>
            <span className="text-[9px] font-mono text-primary uppercase font-semibold">
              Platform AI v2.4
            </span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed p-3.5 bg-surface-container-low rounded-lg border border-outline">
            {report.aiSummary}
          </p>

          <button
            onClick={handleGenerateAISummary}
            className="w-full bg-primary hover:opacity-90 text-on-primary-container text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <Sparkles size={14} />
            <span>Generate AI Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
}
