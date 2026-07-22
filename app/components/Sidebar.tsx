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
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const SIDEBAR_EXPANDED_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 64;

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "QA Projects", icon: GitBranch, href: "/qa-projects" },
  { label: "Reports", icon: BarChart3, href: "#" },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="sticky top-0 h-screen bg-surface-container border-r border-outline-variant flex flex-col py-6 justify-between shrink-0 overflow-y-auto overflow-x-hidden"
    >
      <div className="space-y-8">
        {/* Logo / Branding + Collapse Toggle */}
        <div className={`flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="bg-primary-container/20 px-2 py-1 rounded text-primary font-bold tracking-tight text-sm whitespace-nowrap">
                <span className="text-on-surface">QA</span> Platform
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">
                  Dashboard
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="bg-primary-container/20 px-2 py-1 rounded text-primary font-bold tracking-tight text-sm">
              <span className="text-on-surface">Q</span>
            </div>
          )}
          {onToggle && !collapsed && (
            <button
              onClick={onToggle}
              className="p-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-surface-container-high flex-shrink-0"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && onToggle && (
          <div className="flex justify-center">
            <button
              onClick={onToggle}
              className="p-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-surface-container-high"
              title="Expand sidebar"
            >
              <PanelLeft size={18} strokeWidth={1.5} />
            </button>
          </div>
        )}

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
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-4 py-2 text-base transition-all duration-200 cursor-pointer ${
                    collapsed ? "justify-center px-2" : "px-4"
                  } ${
                    active
                      ? "border-l-4 border-primary bg-surface-container-high text-on-surface font-medium"
                      : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2 : 1.5}
                    className={`flex-shrink-0 ${active ? "text-on-surface" : ""}`}
                  />
                  {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* New QA Project Button */}
        <div className={collapsed ? "px-2" : "px-4"}>
          <Link href="/qa-projects/new">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full bg-primary text-on-primary-container font-semibold py-2 uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-1 rounded-lg cursor-pointer ${
                collapsed ? "text-[0px] px-0" : "text-xs px-2"
              }`}
              title={collapsed ? "New QA Project" : undefined}
            >
              <Plus size={16} strokeWidth={2} className="flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">New QA Project</span>}
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={`border-t border-outline-variant pt-6 space-y-4 ${collapsed ? "px-2" : "px-4"}`}>
        {/* User Info Row */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-9 h-9 bg-surface-container-highest neo-border rounded-lg flex items-center justify-center flex-shrink-0">
            <User size={18} strokeWidth={1.5} className="text-primary" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-on-surface truncate">Admin Engineer</p>
              <p className="text-xs text-on-surface-variant truncate">admin@qa.platform</p>
            </div>
          )}
        </div>

        {/* Settings & Logout Buttons */}
        <div className={`flex ${collapsed ? "flex-col items-center gap-2" : "gap-2"}`}>
          <button
            className={`flex items-center justify-center gap-2 py-2 bg-surface-container-low border border-outline hover:border-primary hover:text-primary transition-all text-xs font-semibold uppercase tracking-wider text-on-surface-variant rounded-lg cursor-pointer ${
              collapsed ? "w-full px-0" : "flex-1 px-3"
            }`}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings size={14} strokeWidth={1.5} className="flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>
          <button
            className={`flex items-center justify-center gap-2 py-2 bg-surface-container-low border border-outline hover:border-magenta hover:text-magenta transition-all text-xs font-semibold uppercase tracking-wider text-on-surface-variant rounded-lg cursor-pointer ${
              collapsed ? "w-full px-0" : "flex-1 px-3"
            }`}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={14} strokeWidth={1.5} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

export { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH };
