"use client";

import { Search, Info, Bell, User, Settings } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "./Sidebar";

interface HeaderContentProps {
  sidebarWidth?: number;
}

function HeaderContent({ sidebarWidth = SIDEBAR_EXPANDED_WIDTH }: HeaderContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [localValue, setLocalValue] = useState(query);

  // Sync local input with URL search param changes
  useEffect(() => {
    setLocalValue(query);
  }, [query]);

  const handleSearch = (val: string) => {
    setLocalValue(val);
    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set("q", val);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const isQaProjects = pathname === "/qa-projects";
  const placeholder = isQaProjects
    ? "SEARCH QA PROJECTS..."
    : "SEARCH PROJECTS, RUNS, OR DOCS...";

  return (
    <header
      style={{
        width: `calc(100% - ${sidebarWidth}px)`,
        transition: "width 0.2s ease-in-out",
      }}
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
            value={localValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
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
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
          <Settings size={20} strokeWidth={1.5} />
        </button>
        <div className="w-8 h-8 bg-surface-container-highest neo-border rounded-lg flex items-center justify-center">
          <User size={18} strokeWidth={1.5} className="text-primary" />
        </div>
      </div>
    </header>
  );
}

interface HeaderProps {
  sidebarWidth?: number;
}

export default function Header({ sidebarWidth }: HeaderProps) {
  return (
    <Suspense fallback={
      <header
        className="sticky top-0 h-16 bg-background/80 backdrop-blur border-b border-outline-variant z-40 flex justify-between items-center px-6 gap-6 w-full"
      >
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input type="text" disabled placeholder="LOADING..." className="w-full bg-surface-container-low border border-outline rounded-lg text-on-surface font-mono text-sm pl-10 pr-4 py-1.5 uppercase opacity-50" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-surface-container-highest opacity-50" />
        </div>
      </header>
    }>
      <HeaderContent sidebarWidth={sidebarWidth} />
    </Suspense>
  );
}
