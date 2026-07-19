"use client";

import { Search, Info, Bell, User } from "lucide-react";

export default function Header() {
  return (
    <header
      style={{ width: "calc(100% - 260px)" }}
      className="fixed top-0 right-0 h-16 bg-background border-b border-outline-variant z-40 flex justify-between items-center px-6 gap-6"
    >
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search
            size={18}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="SEARCH PROJECTS, RUNS, OR DOCS..."
            className="w-full bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:ring-0 focus:outline-none text-on-surface font-mono text-sm pl-10 pr-4 py-1.5 uppercase placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
          <Info size={20} strokeWidth={1.5} />
        </button>
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors relative cursor-pointer">
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary" />
        </button>
        <div className="w-8 h-8 bg-surface-container-highest neo-border rounded-lg flex items-center justify-center">
          <User size={18} strokeWidth={1.5} className="text-primary" />
        </div>
      </div>
    </header>
  );
}
