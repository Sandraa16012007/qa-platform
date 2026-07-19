"use client";

import { motion } from "framer-motion";
import {
  Home,
  GitBranch,
  BarChart3,
  Plus,
} from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, active: true },
  { label: "Projects", icon: GitBranch, active: false },
  { label: "Reports", icon: BarChart3, active: false },
];

export default function Sidebar() {
  return (
    <aside
      style={{ width: 260 }}
      className="fixed left-0 top-0 h-screen bg-surface-container border-r border-outline-variant flex flex-col py-6 z-50"
    >
      <div className="space-y-8 flex-1">
        {/* Logo / Branding */}
        <div className="px-4 flex items-center gap-2">
          <div className="bg-primary-container/20 px-2 py-1 rounded text-primary font-bold tracking-tight text-sm">
            <span className="text-on-surface">QA</span> Platform
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              Dashboard
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.a
                key={item.label}
                href="#"
                whileHover={{ x: item.active ? 0 : 2 }}
                transition={{ duration: 0.15 }}
                className={`flex items-center gap-4 px-4 py-2 text-base transition-all duration-200 ${item.active
                    ? "border-l-4 border-primary bg-surface-container-high text-on-surface"
                    : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                  }`}
              >
                <Icon
                  size={20}
                  strokeWidth={item.active ? 2 : 1.5}
                  className={item.active ? "text-on-surface" : ""}
                />
                <span>{item.label}</span>
              </motion.a>
            );
          })}
        </nav>

        {/* New Project Button */}
        <div className="px-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary text-on-primary-container text-xs font-semibold py-2 uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-1 rounded-lg cursor-pointer"
          >
            <Plus size={16} strokeWidth={2} />
            New Project
          </motion.button>
        </div>
      </div>
    </aside>
  );
}
