"use client";

import { useState, useEffect, useMemo, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Smartphone,
  Laptop,
  Cpu,
  Layers,
  ChevronRight,
  Plus,
  MoreVertical,
  Edit3,
  Copy,
  FileDown,
  Trash2,
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  CheckCircle2,
  X,
  Sparkles,
  Info,
  Calendar,
  Code,
  ExternalLink,
  GitBranch,
  Shield,
  Activity,
  Eye,
  FileText,
  Clock,
  User,
  Check,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

// Project Type Definition
interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  qualityScore: number;
  status: string;
  frameworkProgress: number;
  automationProgress: number;
  humanReviewProgress: number;
  lastRun: string;
  lastUpdated: string;
  version: string;
  createdDate: string;
  owner: string;
  deploymentUrl: string;
  repositoryUrl: string;
}

// Activity Item
interface ActivityItem {
  id: string;
  time: string;
  icon: any;
  description: string;
  color: string;
}

// Test Run
interface TestRun {
  id: string;
  name: string;
  completed: string;
  passed: number;
  failed: number;
  warnings: number;
  status: "Completed" | "Running" | "Failed";
}

// Initial Project mock database
const projectDatabase: Record<string, Project> = {
  "1": {
    id: "1",
    name: "CreativeHub",
    type: "Web App",
    description: "Portfolio Platform",
    qualityScore: 87,
    status: "Human Review",
    frameworkProgress: 100,
    automationProgress: 92,
    humanReviewProgress: 45,
    lastRun: "2 hours ago",
    lastUpdated: "Today",
    version: "v1.2",
    createdDate: "Jul 22, 2026",
    owner: "Alex Rivera",
    deploymentUrl: "https://creativehub.dev.io",
    repositoryUrl: "https://github.com/engineering/creativehub",
  },
  "2": {
    id: "2",
    name: "LearnPro",
    type: "Web App",
    description: "EdTech Platform",
    qualityScore: 94,
    status: "Ready",
    frameworkProgress: 100,
    automationProgress: 100,
    humanReviewProgress: 100,
    lastRun: "1 day ago",
    lastUpdated: "Yesterday",
    version: "v2.0",
    createdDate: "Jun 14, 2026",
    owner: "Sarah Chen",
    deploymentUrl: "https://learnpro.edu",
    repositoryUrl: "https://github.com/engineering/learnpro",
  },
  "3": {
    id: "3",
    name: "API Gateway",
    type: "API",
    description: "Backend Service",
    qualityScore: 72,
    status: "Testing",
    frameworkProgress: 100,
    automationProgress: 58,
    humanReviewProgress: 0,
    lastRun: "4 hours ago",
    lastUpdated: "Today",
    version: "v1.0",
    createdDate: "May 08, 2026",
    owner: "Dave Miller",
    deploymentUrl: "https://api.gateway.local",
    repositoryUrl: "https://github.com/engineering/api-gateway",
  },
  "4": {
    id: "4",
    name: "ShopFlow",
    type: "Web App",
    description: "E-commerce",
    qualityScore: 81,
    status: "Framework Generated",
    frameworkProgress: 100,
    automationProgress: 0,
    humanReviewProgress: 0,
    lastRun: "Never",
    lastUpdated: "3 days ago",
    version: "v0.8",
    createdDate: "Apr 30, 2026",
    owner: "Emma Watson",
    deploymentUrl: "https://shopflow.shop",
    repositoryUrl: "https://github.com/engineering/shopflow",
  },
};

// Circular progress ring helper
function QualityCircleDashboard({
  percentage,
  animating = false,
}: {
  percentage: number;
  animating?: boolean;
}) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (percentage / 100) * circumference;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => setOffset(targetOffset), 200);
    return () => clearTimeout(timer);
  }, [targetOffset, percentage]);

  let strokeColor = "stroke-primary"; // Cyan
  if (percentage < 80) {
    strokeColor = "stroke-yellow"; // Yellow warning
  } else if (percentage < 70) {
    strokeColor = "stroke-magenta"; // Magenta critical
  }

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="transparent"
          strokeWidth="4"
          className="stroke-outline-variant"
        />
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="transparent"
          strokeWidth="4"
          className={`${strokeColor} transition-all duration-1000 ease-out`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-mono font-bold text-on-surface ${animating ? "animate-pulse" : ""}`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

// Editable Tags Component
function EditableTags({
  title,
  tags,
  onSave,
}: {
  title: string;
  tags: string[];
  onSave: (newTags: string[]) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [currentTags, setCurrentTags] = useState(tags);

  useEffect(() => {
    setCurrentTags(tags);
  }, [tags]);

  const handleAdd = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      const next = [...currentTags, tagInput.trim()];
      setCurrentTags(next);
      setTagInput("");
    }
  };

  const handleRemove = (tag: string) => {
    const next = currentTags.filter((t) => t !== tag);
    setCurrentTags(next);
  };

  const handleSave = () => {
    onSave(currentTags);
    setIsEditing(false);
  };

  return (
    <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
            {title}
          </h4>
          <button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="p-1 text-on-surface-variant hover:text-primary transition-all cursor-pointer"
          >
            {isEditing ? (
              <span className="text-[10px] font-bold text-primary uppercase">Save</span>
            ) : (
              <Edit3 size={12} />
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {currentTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-surface-container-low border border-outline text-[11px] text-on-surface px-2 py-0.5 rounded font-medium"
            >
              {tag}
              {isEditing && (
                <button
                  onClick={() => handleRemove(tag)}
                  className="text-magenta hover:text-on-surface transition-colors cursor-pointer"
                >
                  <X size={10} />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-1.5 mt-3 pt-2 border-t border-outline-variant">
          <input
            type="text"
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="flex-1 bg-surface-container-low border border-outline rounded px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="bg-primary text-on-primary-container px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded cursor-pointer"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

function ProjectDashboardContent({ id }: { id: string }) {
  const router = useRouter();

  // Selected project database check
  const project = useMemo(() => {
    return projectDatabase[id] || projectDatabase["1"]; // Default to CreativeHub
  }, [id]);

  // Page active tab
  const [activeTab, setActiveTab] = useState("Overview");

  // Dynamic values
  const [currentScore, setCurrentScore] = useState(project.qualityScore);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState(
    `${project.name} is a high-performance workspace designed to deliver professional services. Currently verifying critical integrations, automated scripts, and conducting human evaluation to achieve 100% test depth.`
  );

  // Editable lists
  const [users, setUsers] = useState(["Creators", "Recruiters", "Visitors", "Administrators"]);
  const [features, setFeatures] = useState([
    "Authentication",
    "Portfolio Upload",
    "Project Discovery",
    "Comments",
    "Likes",
    "Search",
    "Notifications",
    "Analytics",
  ]);
  const [workflows, setWorkflows] = useState([
    "Create Account",
    "Upload Portfolio",
    "Browse Projects",
    "Follow Creators",
    "Manage Profile",
    "Search Content",
  ]);
  const [risks, setRisks] = useState([
    "Media Upload Reliability",
    "Search Accuracy",
    "Mobile Responsiveness",
    "Accessibility",
    "Large Content Rendering",
  ]);

  // Simulated Test Runs State
  const [runs, setRuns] = useState<TestRun[]>([
    { id: "15", name: "Run #15", completed: "2 hours ago", passed: 412, failed: 7, warnings: 11, status: "Completed" },
    { id: "14", name: "Run #14", completed: "Yesterday", passed: 398, failed: 12, warnings: 8, status: "Completed" },
    { id: "13", name: "Run #13", completed: "3 days ago", passed: 420, failed: 2, warnings: 15, status: "Completed" },
  ]);

  // Simulated Activity State
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: "1", time: "1 hour ago", icon: AlertTriangle, description: "New issue detected in Search workflows", color: "text-magenta" },
    { id: "2", time: "3 hours ago", icon: Eye, description: "Human review submitted by Alex R.", color: "text-primary" },
    { id: "3", time: "Today", icon: Activity, description: "Accessibility run completed on Portfolio view", color: "text-primary" },
    { id: "4", time: "Today", icon: CheckCircle2, description: "Quality score updated after pipeline scan", color: "text-primary" },
    { id: "5", time: "2 days ago", icon: Sparkles, description: "QA Framework generated from PRD docs", color: "text-magenta" },
  ]);

  // Simulated state trigger toggles
  const [isSimulatingQA, setIsSimulatingQA] = useState(false);
  const [simulateEmptyState, setSimulateEmptyState] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<{ id: string; message: string; type: string }[]>([]);
  const showToast = (message: string, type: string = "success") => {
    const tid = Date.now().toString();
    setToasts((prev) => [...prev, { id: tid, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== tid));
    }, 3000);
  };

  // Run QA simulation
  const handleRunQA = () => {
    if (isSimulatingQA) return;
    setIsSimulatingQA(true);
    showToast("Starting automated QA testing pipeline...", "info");

    // Add running activity
    const runningAct: ActivityItem = {
      id: Date.now().toString(),
      time: "Just now",
      icon: RotateCw,
      description: "Automated QA run initialized",
      color: "text-yellow animate-spin",
    };
    setActivities((prev) => [runningAct, ...prev]);

    setTimeout(() => {
      // Complete run
      setIsSimulatingQA(false);
      const passedCount = Math.floor(Math.random() * 50) + 400;
      const failedCount = Math.floor(Math.random() * 8);
      const warningCount = Math.floor(Math.random() * 15);
      const newScore = Math.min(100, Math.floor(Math.random() * 5) + 91); // Update score upward

      // Insert new test run
      const nextRun: TestRun = {
        id: (runs.length + 13).toString(),
        name: `Run #${runs.length + 13}`,
        completed: "Just now",
        passed: passedCount,
        failed: failedCount,
        warnings: warningCount,
        status: "Completed",
      };
      setRuns((prev) => [nextRun, ...prev.slice(0, 2)]);

      // Animate score change
      setScoreAnimation(true);
      setCurrentScore(newScore);
      setTimeout(() => setScoreAnimation(false), 1500);

      // Add success activity
      const completeAct: ActivityItem = {
        id: (Date.now() + 1).toString(),
        time: "Just now",
        icon: CheckCircle2,
        description: `Automated QA run finished: ${passedCount} passed, ${failedCount} failed. Quality score: ${newScore}%`,
        color: "text-primary",
      };
      setActivities((prev) => [completeAct, ...prev.filter((act) => act.id !== runningAct.id)]);

      showToast(`QA Testing completed! Quality score is now ${newScore}%`, "success");
    }, 3000);
  };

  // Status Colors styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-surface-container-highest border border-outline text-text-muted";
      case "Framework Generated":
        return "bg-magenta-dim border border-magenta/30 text-magenta";
      case "Testing":
        return "bg-cyan-dim border border-cyan/30 text-cyan";
      case "Human Review":
        return "bg-yellow-dim border border-yellow/30 text-yellow";
      case "Ready":
        return "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400";
      default:
        return "bg-surface-container border border-outline text-on-surface-variant";
    }
  };

  return (
    <div className="flex overflow-hidden w-full bg-background min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <main
        style={{ marginLeft: 260 }}
        className="flex-grow h-screen overflow-y-auto"
      >
        <Header />
        <div style={{ height: 64 }} />

        {/* Dashboard Frame */}
        <div className="p-6 space-y-6">
          {/* Top Panel Actions & Simulation Switcher */}
          <div className="flex justify-end gap-3 items-center">
            <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer select-none border border-outline bg-surface px-3 py-1.5 rounded-lg">
              <input
                type="checkbox"
                checked={simulateEmptyState}
                onChange={(e) => setSimulateEmptyState(e.target.checked)}
                className="rounded text-primary focus:ring-0 accent-primary cursor-pointer"
              />
              <span>Simulate Empty State</span>
            </label>
          </div>

          {/* Project Details Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="neo-border bg-surface p-6 rounded-xl flex flex-col md:flex-row justify-between gap-6"
          >
            {/* Left Info */}
            <div className="space-y-4 flex-grow">
              <div className="flex items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2
                      style={{ fontSize: 32, lineHeight: 1.1, letterSpacing: "-0.015em" }}
                      className="font-bold text-on-surface"
                    >
                      {project.name}
                    </h2>
                    <span
                      style={{ fontSize: 10, letterSpacing: "0.02em" }}
                      className={`tag font-mono py-1 px-2.5 rounded ${getStatusBadgeClass(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant uppercase font-semibold">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Metadata strip */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-on-surface-variant uppercase pt-2 border-t border-outline-variant">
                <div>
                  Last Updated: <span className="text-on-surface font-semibold">{project.lastUpdated}</span>
                </div>
                <div>
                  Framework Version: <span className="text-on-surface font-semibold">{project.version}</span>
                </div>
                <div>
                  Created: <span className="text-on-surface font-semibold">{project.createdDate}</span>
                </div>
              </div>
            </div>

            {/* Right Quality Score */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                    Overall Quality Score
                  </p>
                  <p className="text-xs text-primary font-bold mt-1 flex items-center justify-end gap-1.5">
                    <span>+5 since last assessment</span>
                  </p>
                </div>
                <QualityCircleDashboard percentage={currentScore} animating={scoreAnimation} />
              </div>

              {/* Actions CTAs */}
              <div className="flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRunQA}
                  disabled={isSimulatingQA}
                  className="bg-primary text-on-primary-container px-5 py-3 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all rounded-lg cursor-pointer min-w-32 disabled:opacity-50"
                >
                  {isSimulatingQA ? (
                    <>
                      <RotateCw size={14} className="animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="currentColor" />
                      Run QA
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => showToast("Opening workspace settings...")}
                  className="neo-border px-5 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:border-outline-variant transition-all rounded-lg cursor-pointer"
                >
                  Edit Project
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Project Horizontal Navigation Tabs */}
          <nav className="flex gap-1 border-b border-outline-variant relative z-10">
            {["Overview", "QA Framework", "Test Runs", "Human Reviews", "Issues", "Reports"].map(
              (tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all relative cursor-pointer ${
                      isActive ? "text-primary font-bold" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {tab}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                );
              }
            )}
          </nav>

          {/* Dynamic Active Tab View renders */}
          <div className="min-h-[400px]">
            {activeTab !== "Overview" ? (
              // Mock Workspace view for other tabs
              <div className="neo-border bg-surface rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 py-16">
                <Layers size={48} className="text-primary animate-pulse" />
                <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface">
                  {activeTab} Workspace
                </h3>
                <p className="text-sm text-on-surface-variant max-w-md">
                  Showing detailed workspaces for this category. In a production app, this is where you customize individual {activeTab.toLowerCase()} parameters.
                </p>
                <button
                  onClick={() => setActiveTab("Overview")}
                  className="bg-primary text-on-primary-container px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  Return to Overview
                </button>
              </div>
            ) : simulateEmptyState ? (
              /* EMPTY STATES SIMULATION */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Empty Framework */}
                <div className="neo-border bg-surface rounded-xl p-6 text-center space-y-4 py-12">
                  <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-primary">
                    <Layers size={20} />
                  </div>
                  <h4 className="text-base font-bold text-on-surface">No QA Framework Generated</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Generate a framework to begin evaluating your application structure.
                  </p>
                  <button
                    onClick={() => {
                      setSimulateEmptyState(false);
                      showToast("Generating framework mock...");
                    }}
                    className="bg-primary text-on-primary-container text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-lg cursor-pointer hover:opacity-90 transition-all"
                  >
                    Generate Framework
                  </button>
                </div>

                {/* Empty Test Runs */}
                <div className="neo-border bg-surface rounded-xl p-6 text-center space-y-4 py-12">
                  <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-primary">
                    <Play size={20} fill="currentColor" />
                  </div>
                  <h4 className="text-base font-bold text-on-surface">No Test Runs Yet</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Run your first automated QA test to evaluate this project.
                  </p>
                  <button
                    onClick={() => {
                      setSimulateEmptyState(false);
                      handleRunQA();
                    }}
                    className="bg-primary text-on-primary-container text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-lg cursor-pointer hover:opacity-90 transition-all"
                  >
                    Run QA
                  </button>
                </div>

                {/* Empty Reports */}
                <div className="neo-border bg-surface rounded-xl p-6 text-center space-y-4 py-12">
                  <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-primary">
                    <FileText size={20} />
                  </div>
                  <h4 className="text-base font-bold text-on-surface">No Reports Available</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Reports will appear after completing your first QA run.
                  </p>
                  <button
                    disabled
                    className="border border-outline text-text-muted text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-lg cursor-not-allowed opacity-50"
                  >
                    Reports Locked
                  </button>
                </div>
              </div>
            ) : (
              /* TWO COLUMN MAIN CONTENT */
              <div className="grid grid-cols-12 gap-5 items-start">
                {/* Main panel - 70% width (8 columns) */}
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
                          onClick={() => showToast("Opening test automation workspace...")}
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
                            className="neo-border bg-surface p-3 rounded-lg flex flex-col justify-between"
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
                            className="text-[10px] text-primary hover:underline uppercase font-bold"
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
                        onClick={() => showToast("Opening full settings panel...")}
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
                              onClick={() => showToast(`Opening logs for ${run.name}...`)}
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

                {/* Right panel - 30% width (4 columns) */}
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
                              {/* Dot marker */}
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
            )}
          </div>
        </div>
      </main>

      {/* Dynamic Toast notifications overlay */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-4 rounded-lg neo-border bg-surface shadow-2xl flex items-center justify-between gap-3 text-xs font-sans border-l-4 ${
                toast.type === "success"
                  ? "border-l-primary border-outline/80 text-on-surface"
                  : toast.type === "info"
                  ? "border-l-yellow border-outline/80 text-on-surface"
                  : "border-l-magenta border-outline/80 text-on-surface"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Info size={14} className={toast.type === "success" ? "text-primary" : "text-yellow"} />
                <span className="truncate">{toast.message}</span>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-on-surface-variant hover:text-on-surface text-xs cursor-pointer"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Params handling component
function ProjectDashboardWrapper() {
  // Extract params
  const [params, setParams] = useState<any>(null);
  
  useEffect(() => {
    // Dynamically retrieve URL path id segment
    const path = window.location.pathname;
    const segments = path.split("/");
    const projectId = segments[segments.length - 1] || "1";
    setParams({ id: projectId });
  }, []);

  if (!params) {
    return (
      <div className="flex overflow-hidden bg-background text-foreground h-screen w-full">
        <Sidebar />
        <main
          style={{ marginLeft: 260 }}
          className="flex-grow h-screen overflow-y-auto bg-background"
        >
          <Header />
          <div style={{ height: 64 }} />
          <div className="p-6 flex items-center justify-center h-[calc(100vh-64px)]">
            <div className="flex flex-col items-center gap-3">
              <RotateCw className="w-8 h-8 text-primary animate-spin" />
              <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
                Loading workspace...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <ProjectDashboardContent id={params.id} />;
}

export default function ProjectDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex overflow-hidden bg-background text-foreground h-screen w-full">
          <Sidebar />
          <main
            style={{ marginLeft: 260 }}
            className="flex-grow h-screen overflow-y-auto bg-background"
          >
            <Header />
            <div style={{ height: 64 }} />
            <div className="p-6 flex items-center justify-center h-[calc(100vh-64px)]">
              <div className="flex flex-col items-center gap-3">
                <RotateCw className="w-8 h-8 text-primary animate-spin" />
                <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
                  Loading dashboard...
                </p>
              </div>
            </div>
          </main>
        </div>
      }
    >
      <ProjectDashboardWrapper />
    </Suspense>
  );
}
