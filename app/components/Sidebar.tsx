"use client";

import { motion } from "framer-motion";
import {
  Home,
  GitBranch,
  BarChart3,
  Plus,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "QA Projects", icon: GitBranch, href: "/qa-projects" },
  { label: "Reports", icon: BarChart3, href: "#" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ width: 260 }}
      className="fixed left-0 top-0 h-screen bg-surface-container border-r border-outline-variant flex flex-col py-6 z-50 justify-between"
    >
      <div className="space-y-8">
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
            const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <motion.div
                key={item.label}
                whileHover={{ x: active ? 0 : 2 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-2 text-base transition-all duration-200 cursor-pointer ${
                    active
                      ? "border-l-4 border-primary bg-surface-container-high text-on-surface font-medium"
                      : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2 : 1.5}
                    className={active ? "text-on-surface" : ""}
                  />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* New QA Project Button */}
        <div className="px-4">
          <Link href="/qa-projects/new">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-on-primary-container text-xs font-semibold py-2 uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-1 rounded-lg cursor-pointer"
            >
              <Plus size={16} strokeWidth={2} />
              New QA Project
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-outline-variant pt-6 px-4 space-y-4">
        {/* User Info Row */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-surface-container-highest neo-border rounded-lg flex items-center justify-center flex-shrink-0">
            <User size={18} strokeWidth={1.5} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-on-surface truncate">Admin Engineer</p>
            <p className="text-xs text-on-surface-variant truncate">admin@qa.platform</p>
          </div>
        </div>

        {/* Settings & Logout Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-surface-container-low border border-outline hover:border-primary hover:text-primary transition-all text-xs font-semibold uppercase tracking-wider text-on-surface-variant rounded-lg cursor-pointer">
            <Settings size={14} strokeWidth={1.5} />
            Settings
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-surface-container-low border border-outline hover:border-magenta hover:text-magenta transition-all text-xs font-semibold uppercase tracking-wider text-on-surface-variant rounded-lg cursor-pointer">
            <LogOut size={14} strokeWidth={1.5} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
