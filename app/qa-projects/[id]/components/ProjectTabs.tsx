"use client";

import { motion } from "framer-motion";

interface ProjectTabsProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function ProjectTabs({ tabs, activeTab, setActiveTab }: ProjectTabsProps) {
  return (
    <div className="border-b border-outline-variant">
      <nav className="flex space-x-2 overflow-x-auto">
        {tabs.map((tab) => {
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
        })}
      </nav>
    </div>
  );
}
