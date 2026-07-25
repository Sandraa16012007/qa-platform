"use client";

import { useEffect } from "react";
import Sidebar, { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "./components/Sidebar";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import WorkflowSection from "./components/WorkflowSection";
import MetricsPanel from "./components/MetricsPanel";
import RecentProjects from "./components/RecentProjects";
import { useUiStore } from "./stores/useUiStore";

export default function Home() {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const initSidebarFromStorage = useUiStore((state) => state.initSidebarFromStorage);

  useEffect(() => {
    initSidebarFromStorage();
  }, [initSidebarFromStorage]);

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
          <div className="grid grid-cols-12 gap-5">
            {/* Workflow (8 cols) */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              <WorkflowSection />
            </div>

            {/* Workspace Sidebar (4 cols) */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <MetricsPanel />
            </div>
          </div>

          {/* Recent Projects */}
          <RecentProjects />
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-outline-variant bg-surface-container-lowest mt-8" />
      </main>
    </div>
  );
}
