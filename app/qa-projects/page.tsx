"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Smartphone,
  Laptop,
  Cpu,
  Layers,
  ChevronDown,
  Plus,
  PlusCircle,
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
  Info
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Link from "next/link";

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
}

// Toast Definition
interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

// Circular progress ring helper
function QualityCircle({ percentage }: { percentage: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (percentage / 100) * circumference;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => setOffset(targetOffset), 150);
    return () => clearTimeout(timer);
  }, [targetOffset]);

  // Adjust color based on quality score thresholds
  let strokeColor = "stroke-primary"; // Cyan
  if (percentage < 80) {
    strokeColor = "stroke-yellow"; // Accent color Yellow
  }

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="transparent"
          strokeWidth="3.5"
          className="stroke-outline-variant"
        />
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="transparent"
          strokeWidth="3.5"
          className={`${strokeColor} transition-all duration-1000 ease-out`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-mono font-bold text-on-surface">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

// Skeleton Loader Component
function CardSkeleton() {
  return (
    <div className="neo-border bg-surface p-6 space-y-5 rounded-xl animate-pulse">
      {/* Top Row */}
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-grow">
          <div className="h-6 w-32 bg-surface-bright rounded" />
          <div className="flex gap-2">
            <div className="h-4 w-20 bg-surface-bright rounded" />
            <div className="h-4 w-24 bg-surface-bright rounded" />
          </div>
        </div>
        <div className="w-16 h-6 bg-surface-bright rounded" />
      </div>

      {/* Quality Score Row */}
      <div className="flex justify-between items-center py-2">
        <div className="space-y-1">
          <div className="h-3 w-32 bg-surface-bright rounded" />
          <div className="h-4 w-24 bg-surface-bright rounded" />
        </div>
        <div className="w-12 h-12 bg-surface-bright rounded-full" />
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-surface-bright rounded" />
              <div className="h-3 w-8 bg-surface-bright rounded" />
            </div>
            <div className="h-1 bg-surface-bright w-full rounded" />
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className="h-px bg-outline-variant" />
      <div className="flex justify-between pt-1">
        <div className="h-3 w-20 bg-surface-bright rounded" />
        <div className="h-3 w-20 bg-surface-bright rounded" />
        <div className="h-3 w-10 bg-surface-bright rounded" />
      </div>

      {/* Action Row */}
      <div className="flex justify-between items-center pt-2">
        <div className="h-7 w-28 bg-surface-bright rounded" />
        <div className="h-7 w-7 bg-surface-bright rounded" />
      </div>
    </div>
  );
}

// Initial Mock Data
const initialProjects: Project[] = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

function QaProjectsPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  // Page States
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjType, setNewProjType] = useState("Web App");
  const [newProjStatus, setNewProjStatus] = useState("Draft");
  const [newProjQuality, setNewProjQuality] = useState(85);
  const [newProjFramework, setNewProjFramework] = useState(100);
  const [newProjAutomation, setNewProjAutomation] = useState(50);
  const [newProjHuman, setNewProjHuman] = useState(0);
  const [newProjVer, setNewProjVer] = useState("v1.0");

  // Toast System
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast["type"] = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Simulate loading spinner / skeletons on filter selection change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [selectedStatus, selectedType, query]);

  // Click outside to close dropdowns / menus
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveMenuId(null);
      setIsTypeDropdownOpen(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  // Filter Configuration Options
  const statuses = ["All", "Draft", "Framework Generated", "Testing", "Human Review", "Ready"];
  const applicationTypes = [
    { value: "All Types", label: "All Types", icon: Layers },
    { value: "Web App", label: "Web App", icon: Globe },
    { value: "Mobile App", label: "Mobile App", icon: Smartphone },
    { value: "Desktop", label: "Desktop", icon: Laptop },
    { value: "API", label: "API", icon: Cpu },
  ];

  const currentTypeIcon = useMemo(() => {
    const found = applicationTypes.find((t) => t.value === selectedType);
    return found ? found.icon : Layers;
  }, [selectedType]);

  // Filter logic
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        query === "" ||
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase()) ||
        project.type.toLowerCase().includes(query.toLowerCase()) ||
        project.status.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = selectedStatus === "All" || project.status === selectedStatus;
      const matchesType = selectedType === "All Types" || project.type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [projects, query, selectedStatus, selectedType]);

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

  // CRUD Actions
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) {
      showToast("Project name cannot be empty", "error");
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjName,
      type: newProjType,
      description: newProjDesc || "Custom Platform",
      qualityScore: newProjQuality,
      status: newProjStatus,
      frameworkProgress: newProjFramework,
      automationProgress: newProjAutomation,
      humanReviewProgress: newProjHuman,
      lastRun: "Never",
      lastUpdated: "Just now",
      version: newProjVer || "v1.0",
    };

    setProjects((prev) => [newProject, ...prev]);
    setIsCreateModalOpen(false);
    showToast(`Successfully initialized project "${newProjName}"!`);

    // Reset fields
    setNewProjName("");
    setNewProjDesc("");
    setNewProjType("Web App");
    setNewProjStatus("Draft");
    setNewProjQuality(85);
    setNewProjFramework(100);
    setNewProjAutomation(50);
    setNewProjHuman(0);
    setNewProjVer("v1.0");
  };

  const handleAction = (action: string, project: Project) => {
    setActiveMenuId(null);
    if (action === "delete") {
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      showToast(`Deleted project "${project.name}"`, "warning");
    } else if (action === "duplicate") {
      const copy: Project = {
        ...project,
        id: Date.now().toString(),
        name: `${project.name} Copy`,
        lastRun: "Never",
        lastUpdated: "Just now",
      };
      setProjects((prev) => {
        const idx = prev.findIndex((p) => p.id === project.id);
        const next = [...prev];
        next.splice(idx + 1, 0, copy);
        return next;
      });
      showToast(`Duplicated project "${project.name}"`);
    } else if (action === "export") {
      showToast(`Exported quality report for "${project.name}"`);
    } else if (action === "rename") {
      const newName = prompt(`Rename project "${project.name}" to:`, project.name);
      if (newName && newName.trim()) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, name: newName.trim() } : p))
        );
        showToast(`Renamed project to "${newName.trim()}"`);
      }
    }
  };

  const TypeIconComponent = currentTypeIcon;

  return (
    <div className="flex overflow-hidden w-full">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main content viewport */}
      <main
        style={{ marginLeft: 260 }}
        className="flex-1 h-screen overflow-y-auto"
      >
        {/* Top Header */}
        <Header />

        {/* Content Spacer for fixed header */}
        <div style={{ height: 64 }} />

        <div className="p-6 space-y-6">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="neo-border bg-surface p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 rounded-xl relative overflow-hidden"
          >
            <div className="space-y-2 max-w-3xl z-10">
              <h2
                style={{ fontSize: 36, lineHeight: 1.15, letterSpacing: "-0.015em" }}
                className="font-bold text-on-surface"
              >
                QA Projects
              </h2>
              <p
                style={{ fontSize: 14, lineHeight: 1.5 }}
                className="text-on-surface-variant max-w-2xl"
              >
                Manage every application from a single workspace. Generate QA frameworks,
                monitor testing progress, review quality metrics, and access reports.
              </p>
            </div>
            <div className="flex-shrink-0 z-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary text-on-primary-container px-5 py-3 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all rounded-lg cursor-pointer"
              >
                <PlusCircle size={16} strokeWidth={2} />
                New QA Project
              </motion.button>
            </div>
          </motion.section>

          {/* Filters Row */}
          <section className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 py-2 border-b border-outline-variant">
            {/* Status chips */}
            <div className="flex flex-wrap items-center gap-2">
              {statuses.map((status) => {
                const isActive = selectedStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                      isActive
                        ? "bg-primary text-on-primary-container border-primary font-medium"
                        : "bg-surface-container-low text-on-surface-variant border-outline hover:text-on-surface hover:border-outline-variant"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>

            {/* Application Type & Manual Shimmer Trigger */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              {/* Simulate loader button */}
              <button
                title="Reload and animate"
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 600);
                }}
                className="p-2 border border-outline bg-surface-container-low text-on-surface-variant hover:text-primary rounded-lg transition-all cursor-pointer"
              >
                <RotateCw size={15} className={isLoading ? "animate-spin text-primary" : ""} />
              </button>

              {/* Application Type custom Dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low border border-outline rounded-lg text-on-surface text-xs font-semibold hover:border-primary transition-all cursor-pointer"
                >
                  <TypeIconComponent size={14} strokeWidth={1.5} className="text-primary" />
                  <span>{selectedType}</span>
                  <ChevronDown
                    size={12}
                    className={`text-on-surface-variant transition-transform duration-200 ${
                      isTypeDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isTypeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-48 bg-surface-container border border-outline rounded-lg shadow-xl z-40 py-1"
                    >
                      {applicationTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            onClick={() => {
                              setSelectedType(type.value);
                              setIsTypeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs flex items-center gap-3 transition-colors cursor-pointer ${
                              selectedType === type.value
                                ? "bg-surface-container-high text-primary font-medium"
                                : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                            }`}
                          >
                            <Icon size={14} strokeWidth={1.5} />
                            {type.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Main Grid View */}
          <section className="min-h-[400px]">
            {isLoading ? (
              // Loading Skeleton State
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              // Empty State
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center neo-border bg-surface rounded-xl p-8"
              >
                <div className="relative mb-6">
                  <svg
                    className="w-20 h-20 text-on-surface-variant/40 mx-auto"
                    viewBox="0 0 100 100"
                    fill="none"
                  >
                    <rect
                      x="15"
                      y="25"
                      width="70"
                      height="55"
                      rx="8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path d="M15 38H85" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M35 25V20C35 18.9 34.1 18 33 18H20C18.9 18 18 18.9 18 20V25"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="50"
                      cy="55"
                      r="10"
                      stroke="var(--color-primary)"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                    <path
                      d="M47 55L49 57L53 53"
                      stroke="var(--color-primary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">No QA projects yet</h3>
                <p className="text-sm text-on-surface-variant max-w-sm mb-6">
                  Create your first QA project to begin generating frameworks and evaluating product quality.
                </p>
                <div className="flex gap-3">
                  {(selectedStatus !== "All" || selectedType !== "All Types" || query !== "") && (
                    <button
                      onClick={() => {
                        setSelectedStatus("All");
                        setSelectedType("All Types");
                        const params = new URLSearchParams(window.location.search);
                        params.delete("q");
                        window.history.replaceState({}, "", `${window.location.pathname}`);
                        showToast("Cleared active filters");
                      }}
                      className="px-4 py-2 border border-outline hover:border-outline-variant hover:text-on-surface text-xs font-semibold uppercase tracking-wider rounded-lg text-on-surface-variant transition-all cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary text-on-primary-container px-4 py-2 text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5 rounded-lg hover:opacity-90 transition-all cursor-pointer"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    New QA Project
                  </button>
                </div>
              </motion.div>
            ) : (
              // Project cards grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="neo-border bg-surface p-6 space-y-4 rounded-xl relative group transition-all duration-300 hover:border-primary hover:glow-cyan flex flex-col justify-between"
                    >
                      <div>
                        {/* Top row */}
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4
                              style={{ fontSize: 20, lineHeight: 1.25 }}
                              className="font-bold text-on-surface group-hover:text-primary transition-colors truncate max-w-[160px]"
                              title={project.name}
                            >
                              {project.name}
                            </h4>
                            <p className="text-xs text-on-surface-variant uppercase truncate max-w-[160px]">
                              {project.description}
                            </p>
                          </div>
                          <span
                            style={{ fontSize: 10, letterSpacing: "0.02em" }}
                            className={`tag font-mono py-1 px-2.5 rounded text-center whitespace-nowrap ${getStatusBadgeClass(
                              project.status
                            )}`}
                          >
                            {project.status}
                          </span>
                        </div>

                        {/* Middle Quality Score Circular Section */}
                        <div className="flex justify-between items-center py-2 bg-surface-container-lowest/30 rounded-lg p-3 my-3">
                          <div className="space-y-0.5">
                            <span
                              style={{ fontSize: 10, letterSpacing: "0.04em" }}
                              className="font-bold text-on-surface-variant uppercase font-sans"
                            >
                              Overall Quality Score
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-lg font-bold text-on-surface">
                                {project.qualityScore >= 90 ? "Excellent" : project.qualityScore >= 80 ? "Stable" : "Critical"}
                              </span>
                              {project.qualityScore < 80 && (
                                <AlertTriangle size={14} className="text-yellow" />
                              )}
                            </div>
                          </div>
                          <QualityCircle percentage={project.qualityScore} />
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-3 pt-1">
                          {/* Framework */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-on-surface-variant font-mono">
                              <span>Framework</span>
                              <span>{project.frameworkProgress}%</span>
                            </div>
                            <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${project.frameworkProgress}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="h-full bg-primary"
                              />
                            </div>
                          </div>

                          {/* Automation */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-on-surface-variant font-mono">
                              <span>Automation</span>
                              <span>{project.automationProgress}%</span>
                            </div>
                            <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${project.automationProgress}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="h-full bg-primary"
                              />
                            </div>
                          </div>

                          {/* Human Review */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-on-surface-variant font-mono">
                              <span>Human Review</span>
                              <span>{project.humanReviewProgress}%</span>
                            </div>
                            <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${project.humanReviewProgress}%` }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="h-full bg-primary"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div className="mt-4 pt-4 border-t border-outline-variant">
                        {/* Metadata row */}
                        <div className="flex justify-between text-[10px] text-on-surface-variant font-mono uppercase tracking-wider mb-4">
                          <div>
                            <span>Last Run: </span>
                            <span className="text-on-surface font-semibold">{project.lastRun}</span>
                          </div>
                          <div>
                            <span>Version: </span>
                            <span className="text-on-surface font-semibold">{project.version}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-between items-center relative">
                          <Link href={`/qa-projects/${project.id}`} className="block">
                            <motion.div
                              whileHover={{ x: 2 }}
                              className="bg-primary/10 group-hover:bg-primary text-primary group-hover:text-on-primary-container px-3 py-1.5 uppercase font-bold tracking-widest text-[9px] rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              View Project →
                            </motion.div>
                          </Link>

                          <div onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() =>
                                setActiveMenuId(activeMenuId === project.id ? null : project.id)
                              }
                              className="w-7 h-7 bg-surface-container border border-outline hover:border-primary hover:text-primary transition-all flex items-center justify-center rounded-lg text-on-surface-variant cursor-pointer"
                            >
                              <MoreVertical size={14} />
                            </button>

                            {/* Dropdown Options */}
                            <AnimatePresence>
                              {activeMenuId === project.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                  transition={{ duration: 0.1 }}
                                  className="absolute right-0 bottom-9 w-40 bg-surface-container border border-outline rounded-lg shadow-2xl z-30 py-1 font-sans"
                                >
                                  <button
                                    onClick={() => handleAction("rename", project)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-surface-container-highest hover:text-primary flex items-center gap-2 text-on-surface transition-all cursor-pointer"
                                  >
                                    <Edit3 size={12} strokeWidth={1.5} />
                                    Rename
                                  </button>
                                  <button
                                    onClick={() => handleAction("duplicate", project)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-surface-container-highest hover:text-primary flex items-center gap-2 text-on-surface transition-all cursor-pointer"
                                  >
                                    <Copy size={12} strokeWidth={1.5} />
                                    Duplicate
                                  </button>
                                  <button
                                    onClick={() => handleAction("export", project)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-surface-container-highest hover:text-primary flex items-center gap-2 text-on-surface transition-all cursor-pointer"
                                  >
                                    <FileDown size={12} strokeWidth={1.5} />
                                    Export Report
                                  </button>
                                  <div className="h-px bg-outline-variant my-1" />
                                  <button
                                    onClick={() => handleAction("delete", project)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-surface-container-highest hover:text-magenta flex items-center gap-2 text-magenta transition-all cursor-pointer"
                                  >
                                    <Trash2 size={12} strokeWidth={1.5} />
                                    Delete
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-outline-variant bg-surface-container-lowest mt-8" />
      </main>

      {/* CREATE NEW PROJECT MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-surface neo-border p-6 rounded-xl w-full max-w-lg space-y-6 shadow-2xl relative z-10"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  <h3 className="font-bold text-lg uppercase tracking-tight text-on-surface font-mono">
                    Initialize QA Project
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono block">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CreativeHub"
                    className="w-full bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface font-sans text-sm px-4 py-2.5"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono block">
                    Product Domain / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Portfolio Platform"
                    className="w-full bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface font-sans text-sm px-4 py-2.5"
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono block">
                      Application Type
                    </label>
                    <select
                      className="w-full bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface text-xs font-semibold px-4 py-2.5 cursor-pointer"
                      value={newProjType}
                      onChange={(e) => setNewProjType(e.target.value)}
                    >
                      <option value="Web App">Web App</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Desktop">Desktop</option>
                      <option value="API">API</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono block">
                      Initial Status
                    </label>
                    <select
                      className="w-full bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface text-xs font-semibold px-4 py-2.5 cursor-pointer"
                      value={newProjStatus}
                      onChange={(e) => setNewProjStatus(e.target.value)}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Framework Generated">Framework Generated</option>
                      <option value="Testing">Testing</option>
                      <option value="Human Review">Human Review</option>
                      <option value="Ready">Ready</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-outline-variant pt-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono block">
                        Overall Quality Score
                      </label>
                      <span className="text-xs font-mono font-bold text-primary">{newProjQuality}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="w-full bg-surface-container border border-outline rounded-lg h-2 accent-primary cursor-pointer"
                      value={newProjQuality}
                      onChange={(e) => setNewProjQuality(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono block">
                      Framework Version
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. v1.0"
                      className="w-full bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface font-sans text-sm px-4 py-2.5"
                      value={newProjVer}
                      onChange={(e) => setNewProjVer(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t border-outline-variant pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono block">
                    Execution Stage Progress
                  </span>

                  {/* Framework */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant font-mono">Framework Progress</span>
                      <span className="font-mono text-primary font-bold">{newProjFramework}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="w-full bg-surface-container h-2 accent-primary cursor-pointer"
                      value={newProjFramework}
                      onChange={(e) => setNewProjFramework(parseInt(e.target.value))}
                    />
                  </div>

                  {/* Automation */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant font-mono">Automation Progress</span>
                      <span className="font-mono text-primary font-bold">{newProjAutomation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="w-full bg-surface-container h-2 accent-primary cursor-pointer"
                      value={newProjAutomation}
                      onChange={(e) => setNewProjAutomation(parseInt(e.target.value))}
                    />
                  </div>

                  {/* Human Review */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant font-mono">Human Review Progress</span>
                      <span className="font-mono text-primary font-bold">{newProjHuman}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="w-full bg-surface-container h-2 accent-primary cursor-pointer"
                      value={newProjHuman}
                      onChange={(e) => setNewProjHuman(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 border border-outline hover:border-outline-variant hover:text-on-surface text-xs font-semibold uppercase tracking-wider rounded-lg text-on-surface-variant transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-on-primary-container px-5 py-2.5 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-all rounded-lg cursor-pointer"
                  >
                    Initialize Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toasts container */}
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
                  : toast.type === "warning"
                  ? "border-l-magenta border-outline/80 text-on-surface"
                  : toast.type === "error"
                  ? "border-l-yellow border-outline/80 text-on-surface"
                  : "border-l-outline border-outline/80 text-on-surface-variant"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Info size={14} className={toast.type === "success" ? "text-primary" : "text-magenta"} />
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

export default function QaProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex overflow-hidden bg-background text-foreground h-screen w-full">
          <Sidebar />
          <main
            style={{ marginLeft: 260 }}
            className="flex-1 h-screen overflow-y-auto bg-background"
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
      }
    >
      <QaProjectsPageContent />
    </Suspense>
  );
}
