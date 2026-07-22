"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X, RotateCw } from "lucide-react";
import Sidebar, { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../components/Sidebar";
import Header from "../components/Header";
import { Project, Toast } from "../types";
import { allProjectsList } from "../mockData";

import ProjectsHeader from "./components/ProjectsHeader";
import ProjectCardItem from "./components/ProjectCardItem";
import ProjectModals from "./components/ProjectModals";

function ProjectsContent() {
  const searchParams = useSearchParams();

  // Sidebar Collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("qa-sidebar-collapsed");
    if (stored !== null) {
      setSidebarCollapsed(stored === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("qa-sidebar-collapsed", String(next));
      return next;
    });
  };

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  // Projects State initialized from centralized mockData single source of truth
  const [projects, setProjects] = useState<Project[]>(allProjectsList);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Modals State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Toast System
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (message: string, type: Toast["type"] = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (typeFilter !== "All" && p.type !== typeFilter) return false;
      return true;
    });
  }, [projects, searchQuery, statusFilter, typeFilter]);

  // Modal Action Handlers
  const handleSaveEdit = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingProject(null);
    showToast(`Updated settings for "${updated.name}"!`, "success");
  };

  const handleDuplicate = (target: Project) => {
    const copyId = Date.now().toString();
    const duplicated: Project = {
      ...target,
      id: copyId,
      name: `${target.name} (Copy)`,
      createdDate: "Just now",
      lastUpdated: "Just now",
      status: "Draft",
    };
    setProjects((prev) => [duplicated, ...prev]);
    showToast(`Duplicated "${target.name}"!`, "info");
  };

  const handleExport = (target: Project) => {
    showToast(`Exporting QA Framework for "${target.name}"...`, "success");
  };

  const handleConfirmDelete = (id: string) => {
    const target = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeletingProject(null);
    if (target) {
      showToast(`Deleted project "${target.name}"`, "warning");
    }
  };

  return (
    <div className="flex overflow-hidden w-full bg-background min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <main className="flex-grow h-screen overflow-y-auto">
        <Header sidebarWidth={sidebarWidth} />
        <div style={{ height: 64 }} />

        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Header Controls & Filters */}
          <ProjectsHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
          />

          {/* Projects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full neo-border bg-surface p-12 rounded-xl text-center space-y-3">
                <AlertTriangle size={36} className="text-yellow mx-auto" />
                <h3 className="text-base font-bold text-on-surface">No matching projects</h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Try clearing filter tags or search terms to display project workspaces.
                </p>
              </div>
            ) : (
              filteredProjects.map((proj) => (
                <ProjectCardItem
                  key={proj.id}
                  project={proj}
                  onEdit={setEditingProject}
                  onDuplicate={handleDuplicate}
                  onDelete={setDeletingProject}
                  onExport={handleExport}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Edit & Delete Dialog Modals */}
      <ProjectModals
        editingProject={editingProject}
        setEditingProject={setEditingProject}
        onSaveEdit={handleSaveEdit}
        deletingProject={deletingProject}
        setDeletingProject={setDeletingProject}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Toast Notifications Overlay */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-3.5 rounded-lg neo-border bg-surface shadow-2xl flex items-center justify-between gap-3 text-xs border-l-4 ${
                toast.type === "success"
                  ? "border-l-primary text-on-surface"
                  : toast.type === "warning"
                  ? "border-l-yellow text-on-surface"
                  : "border-l-magenta text-on-surface"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Info size={14} className={toast.type === "success" ? "text-primary" : "text-yellow"} />
                <span className="truncate">{toast.message}</span>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-text-muted hover:text-on-surface cursor-pointer"
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
        <div className="flex overflow-hidden bg-background h-screen w-full">
          <Sidebar />
          <main className="flex-grow h-screen overflow-y-auto bg-background">
            <Header />
            <div className="p-6 flex items-center justify-center h-[calc(100vh-64px)]">
              <div className="flex flex-col items-center gap-3">
                <RotateCw className="w-8 h-8 text-primary animate-spin" />
                <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
                  Loading projects...
                </p>
              </div>
            </div>
          </main>
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}
