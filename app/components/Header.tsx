"use client";

import { Search, Info, Bell, User, Settings, LogOut } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "./Sidebar";
import VideoModal from "./VideoModal";
import { useAuthStore } from "../stores/useAuthStore";

interface HeaderContentProps {
  sidebarWidth?: number;
}

function HeaderContent({ sidebarWidth = SIDEBAR_EXPANDED_WIDTH }: HeaderContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [localValue, setLocalValue] = useState(query);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "Admin Engineer");
  const displayEmail = user?.email || "admin@qa.platform";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await signOut();
    router.replace("/auth");
  };

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
        <button
          onClick={() => setIsVideoModalOpen(true)}
          aria-label="Watch product walkthrough"
          className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <Info size={20} strokeWidth={1.5} />
        </button>
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors relative cursor-pointer">
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary" />
        </button>
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
          <Settings size={20} strokeWidth={1.5} />
        </button>
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-label="User menu"
            className="w-8 h-8 bg-surface-container-highest neo-border rounded-lg flex items-center justify-center hover:border-primary transition-colors cursor-pointer"
          >
            <User size={18} strokeWidth={1.5} className="text-primary" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container border border-outline rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1.5 border-b border-outline mb-2">
                <p className="text-sm font-semibold text-on-surface truncate">{displayName}</p>
                <p className="text-xs text-on-surface-variant truncate">{displayEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-magenta hover:bg-magenta/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut size={14} strokeWidth={1.5} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoSrc="/videos/product-demo.mp4"
        title="Product Walkthrough"
      />
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