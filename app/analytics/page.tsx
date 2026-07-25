"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  Globe,
  Layers,
  Cpu,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Filter,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { mockWorkspaceAnalytics } from "../qa-projects/[id]/mockData";
import { useUiStore } from "../stores/useUiStore";

export default function AnalyticsPage() {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const initSidebarFromStorage = useUiStore((state) => state.initSidebarFromStorage);

  useEffect(() => {
    initSidebarFromStorage();
  }, [initSidebarFromStorage]);

  // Filter States
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [selectedDomain, setSelectedDomain] = useState("All Domains");

  const analytics = mockWorkspaceAnalytics;

  return (
    <div className="flex overflow-hidden w-full bg-background min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <main className="flex-grow h-screen overflow-y-auto">
        <Header sidebarWidth={sidebarCollapsed ? 64 : 260} />
        <div style={{ height: 64 }} />

        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Header Banner */}
          <div className="neo-border bg-surface p-6 rounded-xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                  <BarChart3 className="text-primary" size={24} />
                  Workspace Analytics
                </h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  Monitor quality scores, automated test execution, issue resolution, and human review progress across all QA projects.
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-surface-container-low border border-outline rounded-lg text-xs font-semibold px-3 py-2 text-on-surface cursor-pointer focus:outline-none focus:border-primary"
                >
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Last 90 Days">Last 90 Days</option>
                  <option value="This Year">This Year</option>
                </select>

                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="bg-surface-container-low border border-outline rounded-lg text-xs font-semibold px-3 py-2 text-on-surface cursor-pointer focus:outline-none focus:border-primary"
                >
                  <option value="All Projects">All Projects</option>
                  <option value="CreativeHub">CreativeHub</option>
                  <option value="LearnPro">LearnPro</option>
                  <option value="API Gateway">API Gateway</option>
                  <option value="ShopFlow">ShopFlow</option>
                </select>

                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="bg-surface-container-low border border-outline rounded-lg text-xs font-semibold px-3 py-2 text-on-surface cursor-pointer focus:outline-none focus:border-primary"
                >
                  <option value="All Domains">All Domains</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="EdTech">EdTech</option>
                  <option value="Developer Tools">Developer Tools</option>
                  <option value="SaaS">SaaS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="neo-border bg-surface p-5 rounded-xl space-y-1 border-l-4 border-l-primary">
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">
                Average Quality Score
              </p>
              <h3 className="text-3xl font-bold font-mono text-primary">
                {analytics.averageQualityScore}%
              </h3>
              <p className="text-[10px] text-emerald-400 font-semibold font-mono">
                ↑ +4.2% across workspace
              </p>
            </div>

            <div className="neo-border bg-surface p-5 rounded-xl space-y-1">
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">
                Total QA Projects
              </p>
              <h3 className="text-3xl font-bold font-mono text-on-surface">
                {analytics.totalProjects}
              </h3>
              <p className="text-[10px] text-text-muted font-mono">
                Active quality pipelines
              </p>
            </div>

            <div className="neo-border bg-surface p-5 rounded-xl space-y-1">
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">
                Total Assertions Executed
              </p>
              <h3 className="text-3xl font-bold font-mono text-on-surface">
                {analytics.totalTestsExecuted.toLocaleString()}
              </h3>
              <p className="text-[10px] text-primary font-semibold font-mono">
                82% Automation ratio
              </p>
            </div>

            <div className="neo-border bg-surface p-5 rounded-xl space-y-1">
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">
                Active Open Issues
              </p>
              <h3 className="text-3xl font-bold font-mono text-magenta">
                {analytics.activeIssues}
              </h3>
              <p className="text-[10px] text-magenta font-semibold font-mono">
                4 Critical severity
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Quality Trend Chart (7 cols) */}
            <div className="lg:col-span-7 neo-border bg-surface p-6 rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-primary" />
                    Quality Trend History
                  </h3>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Monthly average quality score evolution across all projects
                  </p>
                </div>
                <span className="text-[10px] font-mono text-primary font-bold bg-cyan-dim px-2 py-0.5 rounded">
                  +8% Year-to-Date
                </span>
              </div>

              {/* Bar Chart Visual */}
              <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
                {analytics.monthlyTrend.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-mono font-bold text-primary">{m.score}%</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${m.score}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all group relative cursor-pointer"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container text-on-surface text-[10px] font-mono font-bold px-2 py-1 rounded border border-outline whitespace-nowrap shadow-xl z-20 pointer-events-none transition-opacity">
                        {m.month}: {m.score}% Score
                      </div>
                    </motion.div>
                    <span className="text-[10px] font-mono text-text-muted">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Distribution Chart (5 cols) */}
            <div className="lg:col-span-5 neo-border bg-surface p-6 rounded-xl space-y-4">
              <div className="border-b border-outline-variant pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                  Quality Tier Distribution
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Percentage of projects by quality score bracket
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {analytics.distribution.map((dist) => (
                  <div key={dist.range} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-on-surface font-semibold">{dist.range}</span>
                      <span className="text-primary font-bold">{dist.percentage}% ({dist.count} projects)</span>
                    </div>
                    <div className="h-2 bg-surface-container-high w-full rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${dist.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Performance & Common Issues */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* QA Category Performance (6 cols) */}
            <div className="lg:col-span-6 neo-border bg-surface p-6 rounded-xl space-y-4">
              <div className="border-b border-outline-variant pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                  QA Category Performance
                </h3>
              </div>

              <div className="space-y-3">
                {analytics.categoryPerformance.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface font-medium">{cat.category}</span>
                      <span className="font-mono font-bold text-primary">{cat.score}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-container-high w-full rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          cat.score >= 90
                            ? "bg-primary"
                            : cat.score >= 80
                            ? "bg-cyan"
                            : "bg-yellow"
                        }`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Common Issues (6 cols) */}
            <div className="lg:col-span-6 neo-border bg-surface p-6 rounded-xl space-y-4">
              <div className="border-b border-outline-variant pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                  Most Common Issues
                </h3>
              </div>

              <div className="space-y-2.5">
                {analytics.commonIssues.map((issue) => (
                  <div
                    key={issue.title}
                    className="p-3 bg-surface-container-low rounded-lg border border-outline flex justify-between items-center text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-on-surface">{issue.title}</span>
                      <p className="text-[10px] text-text-muted font-mono">
                        Frequency: <strong className="text-magenta">{issue.count} occurrences</strong>
                      </p>
                    </div>
                    <span className={`tag font-mono uppercase text-[9px] py-0.5 px-2 rounded ${
                      issue.severity === "Critical" ? "bg-magenta-dim text-magenta" : "bg-yellow-dim text-yellow"
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Reports List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
              Recent Reports
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.recentReports.map((rep) => (
                <div
                  key={rep.id}
                  className="neo-border bg-surface p-5 rounded-xl flex flex-col justify-between space-y-4 hover:border-primary transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-on-surface font-mono">{rep.projectName}</span>
                      <span className="text-[10px] font-mono bg-surface-container border border-outline px-1.5 py-0.5 rounded text-text-muted">
                        {rep.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold font-mono text-primary">{rep.score}%</span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase bg-emerald-dim px-1.5 py-0.5 rounded font-mono">
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted font-mono">Assessed: {rep.date}</p>
                  </div>

                  <Link
                    href={`/qa-projects/${rep.id}`}
                    className="w-full bg-surface-container-low border border-outline hover:border-primary hover:text-primary text-on-surface text-xs font-semibold uppercase tracking-wider py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Report</span>
                    <ArrowUpRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
