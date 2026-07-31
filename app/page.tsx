"use client";

import { useEffect } from "react";
import Sidebar, { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "./components/Sidebar";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import WorkflowSection from "./components/WorkflowSection";
import MetricsPanel from "./components/MetricsPanel";
import RecentProjects from "./components/RecentProjects";
import { useUiStore } from "./stores/useUiStore";
import { useProjectStore } from "./stores/useProjectStore";

export default function Home() {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const initSidebarFromStorage = useUiStore((state) => state.initSidebarFromStorage);
  const loadProjects = useProjectStore((state) => state.loadProjects);

  useEffect(() => {
    initSidebarFromStorage();
  }, [initSidebarFromStorage]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  return (
    <div className="flex overflow-hidden w-full">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Canvas */}
      <main
        className="flex-1 h-screen overflow-y-auto"
      >
        {/* Header */}
        <Header sidebarWidth={sidebarWidth} />

        {/* Content Spacer for fixed header */}
        <div style={{ height: 64 }} />

        <div className="p-6 space-y-6">
          {/* Hero Section */}
          <HeroSection />

          {/* Main Content Grid — 12 columns */}
          <div className="grid grid-cols-12 gap-5 items-start">
            {/* Workflow + Recent Projects (8 cols) — kept in the same column
                so Recent Projects flows directly under Workflow regardless
                of how tall the Workspace sidebar column ends up being. */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <WorkflowSection />
              <RecentProjects />
            </div>

            {/* Workspace Sidebar (4 cols) */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <MetricsPanel />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-outline-variant bg-surface-container-lowest mt-8" />
      </main>
    </div>
  );
}
