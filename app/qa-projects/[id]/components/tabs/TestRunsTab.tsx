"use client";

import React, { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Search,
  ChevronDown,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { DetailedTestRun } from "../../types";
import { QA_SUITES } from "../../mockData";
import FilterDropdown from "../FilterDropdown";
import QualityCircleDashboard from "../QualityCircleDashboard";

interface TestRunsTabProps {
  detailedRuns: DetailedTestRun[];
  isCurrentlyRunning: boolean;
  runningSuite: string;
  runningStage: string;
  runningProgress: number;
  runningTimeRemaining: string;
  handleCancelDetailedRun: () => void;
  handleRunQA: () => void;
  handleStartDetailedRun: (suiteName: string) => void;
  currentScore: number;
  runsSearch: string;
  setRunsSearch: (val: string) => void;
  runsFilterStatus: string;
  setRunsFilterStatus: (val: string) => void;
  runsFilterSuite: string;
  setRunsFilterSuite: (val: string) => void;
  runsFilterEnv: string;
  setRunsFilterEnv: (val: string) => void;
  runsSort: string;
  setRunsSort: (val: string) => void;
  filteredRuns: DetailedTestRun[];
  expandedRunId: string | null;
  setExpandedRunId: (id: string | null) => void;
  getTestStatusBadgeClass: (status: string) => string;
  showToast: (msg: string, type?: string) => void;
}

export default function TestRunsTab({
  detailedRuns,
  isCurrentlyRunning,
  runningSuite,
  runningStage,
  runningProgress,
  runningTimeRemaining,
  handleCancelDetailedRun,
  handleRunQA,
  handleStartDetailedRun,
  currentScore,
  runsSearch,
  setRunsSearch,
  runsFilterStatus,
  setRunsFilterStatus,
  runsFilterSuite,
  setRunsFilterSuite,
  runsFilterEnv,
  setRunsFilterEnv,
  runsSort,
  setRunsSort,
  filteredRuns,
  expandedRunId,
  setExpandedRunId,
  getTestStatusBadgeClass,
  showToast,
}: TestRunsTabProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Test Runs</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Run automated QA suites, monitor execution, compare previous runs, and review quality improvements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRunQA}
            className="bg-primary text-on-primary-container px-4 py-2 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all rounded-lg cursor-pointer"
          >
            <Play size={12} fill="currentColor" />
            Run QA
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => showToast("Opening latest generated report...", "success")}
            className="neo-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:border-outline-variant transition-all rounded-lg cursor-pointer"
          >
            View Latest Report
          </motion.button>
        </div>
      </div>

      {/* Running Test Card */}
      <AnimatePresence>
        {isCurrentlyRunning && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="neo-border bg-surface-dim p-6 rounded-xl space-y-4 glow-cyan overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-on-surface">{runningSuite}</h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-xs text-primary font-semibold uppercase tracking-wider font-mono">
                    Running...
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Current Stage: <span className="text-on-surface font-semibold font-mono">{runningStage}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-mono font-bold">
                  Estimated Time
                </p>
                <p className="text-xs font-semibold text-on-surface font-mono">
                  {runningTimeRemaining} remaining
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-on-surface-variant font-mono">
                <span>Progress</span>
                <span>{runningProgress}%</span>
              </div>
              <div className="h-2 bg-surface-container-high w-full rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${runningProgress}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => showToast("Monitoring active console stream...", "info")}
                className="px-3.5 py-1.5 bg-surface-container-low border border-outline hover:border-outline-variant text-on-surface-variant hover:text-on-surface text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                View Progress
              </button>
              <button
                onClick={handleCancelDetailedRun}
                className="px-3.5 py-1.5 bg-surface-container-low border border-magenta/20 hover:border-magenta text-magenta text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel Run
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick QA Suites presets */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
          Quick QA Suites Presets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {QA_SUITES.map((suite) => {
            const SuiteIcon = suite.icon;
            return (
              <motion.button
                key={suite.id}
                whileHover={{ y: -3 }}
                onClick={() => {
                  handleStartDetailedRun(suite.name);
                }}
                className="neo-border text-left p-4 rounded-xl bg-surface hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center mb-3">
                  <SuiteIcon size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wide leading-tight">
                    {suite.name}
                  </h4>
                  <p className="text-[10px] text-text-muted mt-1 leading-normal line-clamp-3">
                    {suite.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            label: "Quality Score",
            value: `${currentScore}%`,
            sub: "↑ +3 since previous run",
            color: "text-primary",
          },
          {
            label: "Total Runs",
            value: detailedRuns.length.toString(),
            sub: "Across all environments",
            color: "text-on-surface",
          },
          {
            label: "Average Duration",
            value: "4m 12s",
            sub: "Standard validation run",
            color: "text-on-surface",
          },
          {
            label: "Automation Coverage",
            value: "82%",
            sub: "Automated checks validation",
            color: "text-primary",
          },
          {
            label: "Tests Executed",
            value: "2,184",
            sub: "Total assertions compiled",
            color: "text-on-surface",
          },
        ].map((metric) => (
          <div key={metric.label} className="neo-border bg-surface p-4 rounded-xl space-y-1">
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">
              {metric.label}
            </p>
            <h4 className={`text-xl font-bold font-mono ${metric.color}`}>{metric.value}</h4>
            <p className="text-[10px] text-text-muted font-sans font-medium">{metric.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="neo-border bg-surface p-4 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search runs..."
              value={runsSearch}
              onChange={(e) => setRunsSearch(e.target.value)}
              className="w-full bg-surface-container-low border border-outline rounded-lg text-xs pl-9 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary placeholder:text-text-muted uppercase"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Status"
            options={["All", "Completed", "Running", "Failed", "Cancelled", "Queued"]}
            selected={runsFilterStatus}
            onSelect={setRunsFilterStatus}
          />
          <FilterDropdown
            label="Suite"
            options={["All", "Full QA Suite", "Smoke Test", "Regression Suite", "Accessibility Audit", "Performance Check", "Responsive Validation", "Custom Run"]}
            selected={runsFilterSuite}
            onSelect={setRunsFilterSuite}
          />
          <FilterDropdown
            label="Environment"
            options={["All", "Production", "Staging", "Local"]}
            selected={runsFilterEnv}
            onSelect={setRunsFilterEnv}
          />
          <FilterDropdown
            label="Sort By"
            options={["Newest", "Oldest", "Highest Score", "Lowest Score"]}
            selected={runsSort}
            onSelect={setRunsSort}
          />

          {(runsSearch || runsFilterStatus !== "All" || runsFilterSuite !== "All" || runsFilterEnv !== "All") && (
            <button
              onClick={() => {
                setRunsSearch("");
                setRunsFilterStatus("All");
                setRunsFilterSuite("All");
                setRunsFilterEnv("All");
              }}
              className="text-[10px] text-magenta hover:underline uppercase font-bold tracking-wider cursor-pointer ml-1"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Runs Table List */}
      <div className="neo-border bg-surface rounded-xl overflow-hidden">
        {filteredRuns.length === 0 ? (
          <div className="text-center py-16 p-6 space-y-4">
            <div className="w-14 h-14 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-text-muted">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-on-surface">No matching test runs</h4>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                Adjust your query filter parameters or search terms to display past records.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline text-text-muted uppercase font-mono text-[10px] tracking-wider">
                  <th className="p-3.5 w-10"></th>
                  <th className="p-3.5">Run</th>
                  <th className="p-3.5">Suite</th>
                  <th className="p-3.5 w-24">Status</th>
                  <th className="p-3.5 w-28">Quality Score</th>
                  <th className="p-3.5 w-20">Passed</th>
                  <th className="p-3.5 w-20">Failed</th>
                  <th className="p-3.5 w-20">Coverage</th>
                  <th className="p-3.5 w-28">Environment</th>
                  <th className="p-3.5 w-32">Executed</th>
                  <th className="p-3.5 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map((run) => {
                  const isExpanded = expandedRunId === run.id;
                  return (
                    <Fragment key={run.id}>
                      <tr
                        onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                        className={`border-b border-outline last:border-b-0 cursor-pointer transition-colors hover:bg-surface-container-low ${
                          isExpanded ? "bg-cyan-dim/20 hover:bg-cyan-dim/30" : ""
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <ChevronDown
                            size={14}
                            className={`text-text-muted transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </td>
                        <td className="p-3.5 font-bold font-mono text-on-surface">
                          #{run.runNumber}
                        </td>
                        <td className="p-3.5 font-medium text-on-surface">
                          {run.suite}
                        </td>
                        <td className="p-3.5">
                          <span className={`tag font-mono uppercase text-[9px] py-0.5 px-2 rounded ${getTestStatusBadgeClass(run.status)}`}>
                            {run.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold font-mono text-on-surface">
                          {run.status === "Cancelled" ? (
                            <span className="text-text-muted">—</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{run.qualityScore}%</span>
                              {run.scoreTrend && run.scoreTrend.text !== "No Change" && (
                                <span className={`text-[9px] font-sans font-semibold py-0.5 px-1 rounded ${
                                  run.scoreTrend.type === "improvement" ? "bg-emerald-dim text-emerald-400" : "bg-magenta-dim text-magenta"
                                }`}>
                                  {run.scoreTrend.text}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-primary font-semibold">
                          {run.status === "Cancelled" ? "—" : run.passed}
                        </td>
                        <td className="p-3.5 font-mono text-magenta font-semibold">
                          {run.status === "Cancelled" ? "—" : run.failed}
                        </td>
                        <td className="p-3.5 font-mono text-on-surface-variant">
                          {run.status === "Cancelled" ? "—" : `${run.coverage}%`}
                        </td>
                        <td className="p-3.5 text-on-surface-variant font-medium">
                          {run.environment}
                        </td>
                        <td className="p-3.5 text-text-muted font-medium">
                          {run.executed}
                        </td>
                        <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <button
                              onClick={() => showToast(`Opening quality report details for Run #${run.runNumber}...`, "success")}
                              className="text-[10px] text-primary hover:underline font-bold uppercase cursor-pointer"
                            >
                              View Report
                            </button>
                            <button
                              onClick={() => handleStartDetailedRun(run.suite)}
                              className="text-[10px] text-primary hover:underline font-bold uppercase cursor-pointer"
                            >
                              Run Again
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded row details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={11} className="p-0 border-b border-outline">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden bg-surface-container-lowest/40"
                              >
                                <div className="p-5 border-l-4 border-l-primary bg-surface-container-low/50 grid grid-cols-12 gap-6">
                                  <div className="col-span-12 lg:col-span-7 space-y-4">
                                    <div>
                                      <h4 className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">
                                        Execution Summary
                                      </h4>
                                      <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                                        Validation run compiled on <span className="text-on-surface font-semibold">{run.environment}</span> server node. Automated checks covered critical application parameters.
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h5 className="text-[9px] text-text-muted font-mono uppercase tracking-wider font-bold">
                                          Duration
                                        </h5>
                                        <p className="text-xs text-on-surface font-semibold font-mono mt-0.5">
                                          {run.status === "Cancelled" ? "Cancelled" : run.duration}
                                        </p>
                                      </div>
                                      <div>
                                        <h5 className="text-[9px] text-text-muted font-mono uppercase tracking-wider font-bold">
                                          QA Scope Executed
                                        </h5>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                          {run.scopeExecuted.map((scopeItem) => (
                                            <span
                                              key={scopeItem}
                                              className="text-[9px] font-semibold bg-surface-container border border-outline px-1.5 py-0.5 rounded text-on-surface-variant uppercase font-mono"
                                            >
                                              {scopeItem}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {run.status === "Failed" && run.majorFailures && run.majorFailures.length > 0 && (
                                      <div className="border border-magenta/20 bg-magenta-dim/10 rounded-lg p-3 space-y-1.5">
                                        <h5 className="text-[9px] text-magenta font-mono uppercase tracking-wider font-bold flex items-center gap-1">
                                          <AlertTriangle size={10} />
                                          Major Failures ({run.majorFailures.length})
                                        </h5>
                                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-on-surface-variant font-medium">
                                          {run.majorFailures.map((fail, i) => (
                                            <li key={i}>{fail}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>

                                  <div className="col-span-12 lg:col-span-5 flex flex-col justify-between items-end border-l border-outline-variant/60 pl-6">
                                    <div className="text-right">
                                      <h4 className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">
                                        Overall Quality score
                                      </h4>
                                      <div className="flex items-center gap-3 justify-end mt-1.5">
                                        <span className="text-3xl font-mono font-bold text-on-surface">
                                          {run.status === "Cancelled" ? "—" : `${run.qualityScore}%`}
                                        </span>
                                        {run.status !== "Cancelled" && (
                                          <QualityCircleDashboard percentage={run.qualityScore} />
                                        )}
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => showToast(`Navigating to Full Quality Report for Run #${run.runNumber}...`, "success")}
                                      className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer pt-4 uppercase tracking-wider"
                                    >
                                      <span>View Full Report</span>
                                      <ArrowUpRight size={14} />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
