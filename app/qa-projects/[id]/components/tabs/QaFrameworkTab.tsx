"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  AlertTriangle,
  X,
  Cpu,
  User,
} from "lucide-react";
import { QaCheck } from "../../types";
import FilterDropdown from "../FilterDropdown";

interface QaFrameworkTabProps {
  levelProgress: Record<string, { total: number; passed: number; percent: number }>;
  selectedLevel: string;
  setSelectedLevel: (lvl: string) => void;
  getLevelIcon: (lvl: string) => any;
  searchText: string;
  setSearchText: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterPriority: string;
  setFilterPriority: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterAutomation: string;
  setFilterAutomation: (val: string) => void;
  checksByCategory: Record<string, QaCheck[]>;
  collapsedCats: Record<string, boolean>;
  toggleCategory: (cat: string) => void;
  selectedCheckId: string | null;
  setSelectedCheckId: (id: string | null) => void;
  getStatusBadgeClass: (status: string) => string;
  getPriorityBadgeClass: (priority: string) => string;
}

export default function QaFrameworkTab({
  levelProgress,
  selectedLevel,
  setSelectedLevel,
  getLevelIcon,
  searchText,
  setSearchText,
  filterCategory,
  setFilterCategory,
  filterPriority,
  setFilterPriority,
  filterStatus,
  setFilterStatus,
  filterAutomation,
  setFilterAutomation,
  checksByCategory,
  collapsedCats,
  toggleCategory,
  selectedCheckId,
  setSelectedCheckId,
  getStatusBadgeClass,
  getPriorityBadgeClass,
}: QaFrameworkTabProps) {
  return (
    <div className="space-y-6">
      {/* Framework Summary Top Banner Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.keys(levelProgress).map((lvl) => {
          const prog = levelProgress[lvl];
          const isSelected = selectedLevel === lvl;
          const LvlIcon = getLevelIcon(lvl);
          return (
            <motion.button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              whileHover={{ y: -2 }}
              className={`neo-border text-left p-4 rounded-xl transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-primary bg-cyan-dim glow-cyan"
                  : "bg-surface hover:border-outline-variant"
              }`}
            >
              <div className="flex justify-between items-center w-full mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-primary text-on-primary-container" : "bg-surface-container-high text-primary"}`}>
                  <LvlIcon size={16} />
                </div>
                <span className="font-mono text-xs font-bold text-on-surface">
                  {prog.percent}%
                </span>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                  {lvl}
                </p>
                <h4 className="text-base font-bold text-on-surface mt-1">
                  {prog.total} Checks
                </h4>
              </div>
              <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden mt-3">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${prog.percent}%` }} />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* 3-Panel Layout Grid */}
      <div className="grid grid-cols-12 gap-5 items-start">
        {/* LEFT PANEL: QA Levels Navigation (2 cols) */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2 space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono px-2 mb-3 block">
            QA Levels
          </h3>
          <div className="space-y-1">
            {Object.keys(levelProgress).map((lvl) => {
              const prog = levelProgress[lvl];
              const isSelected = selectedLevel === lvl;
              const LvlIcon = getLevelIcon(lvl);
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-surface-container-high border-l-4 border-l-primary border-outline text-on-surface"
                      : "bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LvlIcon size={14} className={isSelected ? "text-primary" : "text-text-muted"} />
                    <span>{lvl}</span>
                  </div>
                  <span className="font-mono text-[10px] text-text-muted">
                    {prog.passed}/{prog.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER PANEL: Database (10 cols - full remaining width) */}
        <div className="col-span-12 md:col-span-9 lg:col-span-10 space-y-4">
          {/* Database Header Summary */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-xl font-bold text-on-surface">{selectedLevel}</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Evaluate the overall quality, usability, accessibility, consistency, and experience of the application.
              </p>
            </div>

            {/* Active Level Progress bar */}
            <div className="text-right min-w-32">
              <span className="text-xs font-mono font-bold text-primary">
                {levelProgress[selectedLevel]?.percent}% Complete
              </span>
              <p className="text-[10px] text-text-muted font-mono uppercase mt-0.5">
                {levelProgress[selectedLevel]?.passed} / {levelProgress[selectedLevel]?.total} checks completed
              </p>
              <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${levelProgress[selectedLevel]?.percent}%` }} />
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="neo-border bg-surface p-4 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search QA checks..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline rounded-lg text-xs pl-9 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary placeholder:text-text-muted"
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <FilterDropdown
                label="Category"
                options={["All", "Navigation", "Branding", "Accessibility", "User Experience", "Performance", "Content", "Functionality", "Security", "Visual"]}
                selected={filterCategory}
                onSelect={setFilterCategory}
              />
              <FilterDropdown
                label="Priority"
                options={["All", "Critical", "High", "Medium", "Low"]}
                selected={filterPriority}
                onSelect={setFilterPriority}
              />
              <FilterDropdown
                label="Status"
                options={["All", "Not Started", "In Progress", "Passed", "Failed", "Skipped"]}
                selected={filterStatus}
                onSelect={setFilterStatus}
              />
              <FilterDropdown
                label="Automation"
                options={["All", "Automated", "Human Review"]}
                selected={filterAutomation}
                onSelect={setFilterAutomation}
              />

              {(searchText || filterCategory !== "All" || filterPriority !== "All" || filterStatus !== "All" || filterAutomation !== "All") && (
                <button
                  onClick={() => {
                    setSearchText("");
                    setFilterCategory("All");
                    setFilterPriority("All");
                    setFilterStatus("All");
                    setFilterAutomation("All");
                  }}
                  className="text-[10px] text-magenta hover:underline uppercase font-bold tracking-wider cursor-pointer ml-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Checklist Tables Categorized */}
          <div className="space-y-4">
            {Object.keys(checksByCategory).length === 0 ? (
              <div className="text-center py-12 border border-dashed border-outline bg-surface rounded-xl p-6">
                <AlertTriangle className="text-yellow mx-auto mb-2" size={32} />
                <h4 className="text-sm font-bold text-on-surface">No QA Checks Found</h4>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
                  No checks match the active search query or filter tags. Clear filters to restore checklist rows.
                </p>
              </div>
            ) : (
              Object.keys(checksByCategory).map((catName) => {
                const categoryChecks = checksByCategory[catName];
                const total = categoryChecks.length;
                const passed = categoryChecks.filter((c) => c.status === "Passed").length;
                const isCollapsed = collapsedCats[catName] || false;

                return (
                  <div key={catName} className="neo-border bg-surface rounded-xl overflow-hidden">
                    {/* Category Header */}
                    <div
                      onClick={() => toggleCategory(catName)}
                      className="flex justify-between items-center p-3.5 bg-surface-container border-b border-outline-variant cursor-pointer hover:bg-surface-container-high transition-colors select-none"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-on-surface uppercase tracking-wider font-mono">
                        <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
                        <span>{catName}</span>
                      </div>
                      <span className="font-mono text-[10px] text-text-muted">
                        {passed} / {total} checks completed
                      </span>
                    </div>

                    {/* Category Checklist table */}
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-surface-container-low border-b border-outline text-text-muted uppercase font-mono text-[10px] tracking-wider">
                                <th className="p-3 w-32">Status</th>
                                <th className="p-3">QA Check</th>
                                <th className="p-3 w-28">Priority</th>
                                <th className="p-3 w-28">Type</th>
                                <th className="p-3 w-32">Automation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categoryChecks.map((checkRow) => {
                                const isCheckSelected = selectedCheckId === checkRow.id;
                                return (
                                  <tr
                                    key={checkRow.id}
                                    onClick={() => setSelectedCheckId(checkRow.id)}
                                    className={`border-b border-outline last:border-b-0 cursor-pointer transition-all hover:bg-surface-container-low ${
                                      isCheckSelected ? "bg-cyan-dim/40 hover:bg-cyan-dim/50 border-l-4 border-l-primary" : ""
                                    }`}
                                  >
                                    <td className="p-3 font-semibold">
                                      <span className={`tag font-mono uppercase whitespace-nowrap text-[9px] ${getStatusBadgeClass(checkRow.status)}`}>
                                        {checkRow.status}
                                      </span>
                                    </td>
                                    <td className="p-3 font-medium text-on-surface max-w-xs truncate" title={checkRow.title}>
                                      {checkRow.title}
                                      {checkRow.pageName ? (
                                        <div className="text-[9px] font-mono uppercase tracking-wider text-text-muted mt-0.5 truncate">
                                          {checkRow.pageName}
                                        </div>
                                      ) : null}
                                    </td>
                                    <td className="p-3">
                                      <span className={`tag font-mono uppercase text-[9px] ${getPriorityBadgeClass(checkRow.priority)}`}>
                                        {checkRow.priority}
                                      </span>
                                    </td>
                                    <td className="p-3 text-on-surface-variant font-medium">
                                      {checkRow.type}
                                    </td>
                                    <td className="p-3">
                                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                                        {checkRow.automation === "Automated" ? (
                                          <>
                                            <Cpu size={12} className="text-primary" />
                                            <span className="font-semibold text-[10px]">Automated</span>
                                          </>
                                        ) : (
                                          <>
                                            <User size={12} className="text-yellow" />
                                            <span className="font-semibold text-[10px]">Human</span>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
