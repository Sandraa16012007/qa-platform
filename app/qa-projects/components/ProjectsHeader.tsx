"use client";

import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import FilterDropdown from "../[id]/components/FilterDropdown";

interface ProjectsHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
}

export default function ProjectsHeader({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
}: ProjectsHeaderProps) {
  return (
    <div className="neo-border bg-surface p-6 rounded-xl space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">QA Projects</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage quality engineering workspaces, configure frameworks, monitor automated runs, and direct human reviews.
          </p>
        </div>

        <Link href="/qa-projects/new">
          <button className="bg-primary text-on-primary-container font-semibold py-2.5 px-4 text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 rounded-lg cursor-pointer shadow-lg whitespace-nowrap">
            <PlusCircle size={16} />
            <span>New QA Project</span>
          </button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="pt-2 border-t border-outline-variant flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="relative flex-grow max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-outline rounded-lg text-xs pl-9 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary placeholder:text-text-muted"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Status"
            options={["All", "Ready", "Testing", "Human Review", "Framework Generated"]}
            selected={statusFilter}
            onSelect={setStatusFilter}
          />

          <FilterDropdown
            label="Type"
            options={["All", "Web App", "API"]}
            selected={typeFilter}
            onSelect={setTypeFilter}
          />

          {(searchQuery || statusFilter !== "All" || typeFilter !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setTypeFilter("All");
              }}
              className="text-[10px] text-magenta hover:underline uppercase font-bold tracking-wider cursor-pointer ml-1"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
