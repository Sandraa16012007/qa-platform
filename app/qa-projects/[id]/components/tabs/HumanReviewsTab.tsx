"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  User,
  Star,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  ArrowRight,
  PlusCircle,
  Shield,
  Layers,
  Globe,
  Cpu,
  Sparkles,
  Check,
} from "lucide-react";
import { HumanReviewItem, IssueItem, Toast } from "../../types";
import FilterDropdown from "../FilterDropdown";

interface HumanReviewsTabProps {
  humanReviews: HumanReviewItem[];
  setHumanReviews: React.Dispatch<React.SetStateAction<HumanReviewItem[]>>;
  showToast: (msg: string, type?: Toast["type"]) => void;
  onSaveReviewResult?: (
    id: string,
    checkId: string,
    result: HumanReviewItem["reviewResult"],
    rating: number,
    notes: string,
    screenshotUrl?: string | null
  ) => void;
  initialSelectedReviewId?: string | null;
  onNavigateToCheck?: (checkId: string) => void;
  setIssues?: React.Dispatch<React.SetStateAction<IssueItem[]>>;
}

export default function HumanReviewsTab({
  humanReviews,
  setHumanReviews,
  showToast,
  onSaveReviewResult,
  initialSelectedReviewId,
  onNavigateToCheck,
  setIssues,
}: HumanReviewsTabProps) {
  // Navigation & Hierarchy Selection State
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>("All");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(
    humanReviews[0]?.id || null
  );

  useEffect(() => {
    if (initialSelectedReviewId) {
      setSelectedReviewId(initialSelectedReviewId);
    }
  }, [initialSelectedReviewId]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");

  // Collapsible hierarchy sections state
  const [collapsedLevels, setCollapsedLevels] = useState<Record<string, boolean>>({});

  const toggleLevelAccordion = (lvl: string) => {
    setCollapsedLevels((prev) => ({ ...prev, [lvl]: !prev[lvl] }));
  };

  // Active Review Item Selection
  const activeReview = useMemo(() => {
    return humanReviews.find((r) => r.id === selectedReviewId) || humanReviews[0] || null;
  }, [humanReviews, selectedReviewId]);

  // Form State for Active Review — default to null (N/A) and 0 stars for unreviewed items
  const [formStatus, setFormStatus] = useState<
    "Pass" | "Needs Improvement" | "Fail" | "Not Applicable" | null
  >(null);
  const [formRating, setFormRating] = useState<number>(0);
  const [formNotes, setFormNotes] = useState<string>("");
  const [formScreenshot, setFormScreenshot] = useState<string | null>(null);

  // Sync form state when active review changes
  const handleSelectReview = (item: HumanReviewItem) => {
    setSelectedReviewId(item.id);
    setFormStatus((item.reviewResult as any) || null);
    setFormRating(item.rating || 0);
    setFormNotes(item.notes || "");
    setFormScreenshot(item.screenshotUrl || null);
  };

  // Sync initial review when activeReview mounts or changes
  useEffect(() => {
    if (activeReview) {
      setFormStatus((activeReview.reviewResult as any) || null);
      setFormRating(activeReview.rating || 0);
      setFormNotes(activeReview.notes || "");
      setFormScreenshot(activeReview.screenshotUrl || null);
    }
  }, [activeReview?.id]);

  // Save active review
  const handleSaveReview = () => {
    if (!activeReview) return;
    const saveResult = formStatus || "Pass";

    let computedStatus: HumanReviewItem["status"] = "Completed";
    if (saveResult === "Needs Improvement") computedStatus = "Needs Improvement";
    if (saveResult === "Fail") computedStatus = "Failed";
    if (saveResult === "Not Applicable") computedStatus = "Not Applicable";

    if (onSaveReviewResult) {
      onSaveReviewResult(activeReview.id, activeReview.checkId, saveResult, formRating, formNotes, formScreenshot);
    } else {
      setHumanReviews((prev) =>
        prev.map((item) =>
          item.id === activeReview.id
            ? {
                ...item,
                status: computedStatus,
                reviewResult: saveResult,
                rating: formRating,
                notes: formNotes,
                screenshotUrl: formScreenshot,
                lastUpdated: "Just now",
                reviewedBy: "Admin Engineer",
              }
            : item
        )
      );
    }

    showToast(`Saved review for "${activeReview.title}"!`, "success");
  };

  // Advance to next review item
  const handleNextReview = () => {
    if (!activeReview) return;
    const currentIndex = filteredReviews.findIndex((r) => r.id === activeReview.id);
    if (currentIndex !== -1 && currentIndex < filteredReviews.length - 1) {
      const nextItem = filteredReviews[currentIndex + 1];
      handleSelectReview(nextItem);
    } else if (filteredReviews.length > 0) {
      handleSelectReview(filteredReviews[0]);
    }
  };

  // Create issue from review item
  const handleCreateIssue = () => {
    if (!activeReview) return;
    const newIssue: IssueItem = {
      id: `issue-${Date.now()}`,
      title: `Review Finding: ${activeReview.title}`,
      severity: activeReview.priority,
      status: "Open",
      source: "Human Review",
      level: activeReview.level,
      linkedPage: activeReview.category || "General",
      assignedTo: "Admin Engineer",
      description: formNotes || activeReview.notes || activeReview.description,
      recommendation: `Address human review feedback for ${activeReview.title}`,
      createdDate: "Just now",
      linkedCheckId: activeReview.checkId,
      linkedReviewId: activeReview.id,
    };

    if (setIssues) {
      setIssues((prev) => [newIssue, ...prev]);
    }
    showToast(`Created issue for "${activeReview.title}"!`, "warning");
  };

  // Hierarchy tree calculation
  const hierarchyData = useMemo(() => {
    const levels = ["Product QA", "Page QA", "Component QA", "Feature QA", "Release QA"];
    const tree: Record<string, { categories: Record<string, number>; total: number }> = {};

    levels.forEach((lvl) => {
      tree[lvl] = { categories: {}, total: 0 };
      const itemsInLvl = humanReviews.filter((r) => r.level === lvl);
      tree[lvl].total = itemsInLvl.length;
      itemsInLvl.forEach((r) => {
        tree[lvl].categories[r.category] = (tree[lvl].categories[r.category] || 0) + 1;
      });
    });

    return tree;
  }, [humanReviews]);

  // Filtered Queue list calculation
  const filteredReviews = useMemo(() => {
    return humanReviews.filter((item) => {
      // Tree selection
      if (selectedLevelFilter !== "All" && item.level !== selectedLevelFilter) return false;
      if (selectedCategoryFilter !== "All" && item.category !== selectedCategoryFilter)
        return false;

      // Top search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.notes.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Top filters
      if (statusFilter !== "All" && item.status !== statusFilter) return false;
      if (priorityFilter !== "All" && item.priority !== priorityFilter) return false;
      if (levelFilter !== "All" && item.level !== levelFilter) return false;

      return true;
    });
  }, [
    humanReviews,
    selectedLevelFilter,
    selectedCategoryFilter,
    searchQuery,
    statusFilter,
    priorityFilter,
    levelFilter,
  ]);

  // Overall Stats
  const completedCount = useMemo(() => {
    return humanReviews.filter(
      (r) => r.status === "Completed" || r.status === "Passed" || r.reviewResult === "Pass"
    ).length;
  }, [humanReviews]);

  const progressPercentage = useMemo(() => {
    return humanReviews.length > 0
      ? Math.round((completedCount / humanReviews.length) * 100)
      : 0;
  }, [completedCount, humanReviews.length]);

  // Badge Helpers
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Completed":
      case "Passed":
      case "Pass":
        return "bg-emerald-dim border border-emerald/30 text-emerald-400";
      case "In Progress":
        return "bg-cyan-dim border border-cyan/30 text-cyan";
      case "Needs Review":
        return "bg-yellow-dim border border-yellow/30 text-yellow";
      case "Needs Improvement":
        return "bg-magenta-dim border border-magenta/30 text-magenta";
      case "Failed":
      case "Fail":
        return "bg-magenta-dim border border-magenta/30 text-magenta";
      default:
        return "bg-surface-container border border-outline text-text-muted";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-magenta-dim border border-magenta/30 text-magenta";
      case "High":
        return "bg-yellow-dim border border-yellow/30 text-yellow";
      case "Medium":
        return "bg-cyan-dim border border-cyan/30 text-primary";
      default:
        return "bg-surface-container border border-outline text-text-muted";
    }
  };

  const getLevelIcon = (lvl: string) => {
    switch (lvl) {
      case "Product QA":
        return Globe;
      case "Page QA":
        return Layers;
      case "Component QA":
        return Cpu;
      case "Feature QA":
        return Sparkles;
      default:
        return CheckCircle2;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Top Summary Card */}
      <div className="neo-border bg-surface p-6 rounded-xl space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Human Reviews</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Complete human-centric evaluations for usability, visual quality, content consistency, and overall product experience.
            </p>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-outline min-w-[280px] space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-on-surface-variant font-bold uppercase">Human Review Progress</span>
              <span className="text-primary font-bold">{progressPercentage}%</span>
            </div>
            <div className="flex justify-between text-[11px] text-text-muted font-mono">
              <span>{completedCount} / {humanReviews.length} Reviews Completed</span>
            </div>
            <div className="h-1.5 bg-surface-container-high w-full rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="pt-3 border-t border-outline-variant flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div className="relative flex-grow max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline rounded-lg text-xs pl-9 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary placeholder:text-text-muted"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Status"
              options={["All", "Needs Review", "In Progress", "Completed", "Needs Improvement", "Failed"]}
              selected={statusFilter}
              onSelect={setStatusFilter}
            />
            <FilterDropdown
              label="Priority"
              options={["All", "Critical", "High", "Medium", "Low"]}
              selected={priorityFilter}
              onSelect={setPriorityFilter}
            />
            <FilterDropdown
              label="QA Level"
              options={["All", "Product QA", "Page QA", "Component QA", "Feature QA", "Release QA"]}
              selected={levelFilter}
              onSelect={setLevelFilter}
            />

            {(searchQuery || statusFilter !== "All" || priorityFilter !== "All" || levelFilter !== "All" || selectedLevelFilter !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setPriorityFilter("All");
                  setLevelFilter("All");
                  setSelectedLevelFilter("All");
                  setSelectedCategoryFilter("All");
                }}
                className="text-[10px] text-magenta hover:underline uppercase font-bold tracking-wider cursor-pointer ml-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-12 gap-5 items-start">
        {/* COLUMN 1: QA Hierarchy (Left Panel ~22% width / 3 cols) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 neo-border bg-surface p-4 rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
              QA Hierarchy Navigation
            </h3>
            <button
              onClick={() => {
                setSelectedLevelFilter("All");
                setSelectedCategoryFilter("All");
              }}
              className={`text-[9px] font-bold font-mono uppercase hover:underline cursor-pointer ${
                selectedLevelFilter === "All" ? "text-primary" : "text-text-muted"
              }`}
            >
              All Items ({humanReviews.length})
            </button>
          </div>

          <div className="space-y-2">
            {Object.keys(hierarchyData).map((lvl) => {
              const data = hierarchyData[lvl];
              const isCollapsed = collapsedLevels[lvl] || false;
              const isLevelActive = selectedLevelFilter === lvl && selectedCategoryFilter === "All";
              const LvlIcon = getLevelIcon(lvl);

              return (
                <div key={lvl} className="space-y-1">
                  {/* Level Header Button */}
                  <div
                    onClick={() => {
                      setSelectedLevelFilter(selectedLevelFilter === lvl ? "All" : lvl);
                      setSelectedCategoryFilter("All");
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                      isLevelActive
                        ? "bg-cyan-dim/40 border-primary text-on-surface font-bold"
                        : "bg-surface-container-low border-outline text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLevelAccordion(lvl);
                        }}
                        className="text-text-muted hover:text-on-surface p-0.5 cursor-pointer"
                      >
                        <ChevronDown
                          size={12}
                          className={`transition-transform duration-200 ${
                            isCollapsed ? "-rotate-90" : ""
                          }`}
                        />
                      </button>
                      <LvlIcon size={14} className={isLevelActive ? "text-primary" : "text-text-muted"} />
                      <span>{lvl}</span>
                    </div>
                    <span className="font-mono text-[10px] text-text-muted bg-surface-container px-1.5 py-0.5 rounded border border-outline">
                      {data.total}
                    </span>
                  </div>

                  {/* Subcategories list */}
                  <AnimatePresence initial={false}>
                    {!isCollapsed && Object.keys(data.categories).length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-6 space-y-1 overflow-hidden"
                      >
                        {Object.keys(data.categories).map((cat) => {
                          const isCatActive =
                            selectedLevelFilter === lvl && selectedCategoryFilter === cat;
                          return (
                            <button
                              key={cat}
                              onClick={() => {
                                setSelectedLevelFilter(lvl);
                                setSelectedCategoryFilter(cat);
                              }}
                              className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded text-xs transition-colors cursor-pointer text-left ${
                                isCatActive
                                  ? "bg-surface-container-high text-primary font-bold"
                                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                              }`}
                            >
                              <span className="truncate">{cat}</span>
                              <span className="font-mono text-[9px] opacity-70">
                                {data.categories[cat]}
                              </span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: Review Queue (Center Panel ~43% width / 5 cols) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-5 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
              Review Queue ({filteredReviews.length})
            </h3>
            {selectedLevelFilter !== "All" && (
              <span className="text-[10px] text-primary font-mono font-semibold">
                Filtering: {selectedLevelFilter} {selectedCategoryFilter !== "All" ? `> ${selectedCategoryFilter}` : ""}
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {filteredReviews.length === 0 ? (
              <div className="neo-border bg-surface p-8 rounded-xl text-center space-y-3">
                <AlertTriangle size={32} className="text-yellow mx-auto" />
                <h4 className="text-sm font-bold text-on-surface">No reviews match selection</h4>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                  Try clearing top search or category filters to list evaluation queue entries.
                </p>
              </div>
            ) : (
              filteredReviews.map((item) => {
                const isSelected = activeReview?.id === item.id;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ x: isSelected ? 0 : 2 }}
                    onClick={() => handleSelectReview(item)}
                    className={`neo-border p-4 rounded-xl cursor-pointer transition-all space-y-3 ${
                      isSelected
                        ? "bg-surface-container-high border-l-4 border-l-primary border-outline glow-cyan"
                        : "bg-surface hover:border-outline-variant"
                    }`}
                  >
                    {/* Top title & status badge */}
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-on-surface leading-snug">
                        {item.title}
                      </h4>
                      <span className={`tag font-mono uppercase text-[9px] py-0.5 px-2 rounded shrink-0 ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    {/* Description preview */}
                    <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Metadata Badges strip */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/50">
                      <span className="text-[9px] bg-surface-container border border-outline px-1.5 py-0.5 rounded text-text-muted font-mono font-semibold">
                        {item.level}
                      </span>
                      <span className="text-[9px] bg-surface-container border border-outline px-1.5 py-0.5 rounded text-text-muted font-mono">
                        {item.category}
                      </span>
                      <span className={`tag font-mono text-[9px] py-0.5 px-1.5 rounded ${getPriorityBadgeClass(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className="text-[9px] bg-yellow-dim border border-yellow/20 text-yellow px-1.5 py-0.5 rounded font-mono font-semibold flex items-center gap-1 ml-auto">
                        <User size={10} />
                        Human
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: Review Panel (Right Panel ~35% width / 4 cols) */}
        <div className="col-span-12 lg:col-span-4 neo-border bg-surface p-5 rounded-xl space-y-5 sticky top-[80px] h-[calc(100vh-140px)] overflow-y-auto shadow-2xl">
          {activeReview ? (
            <>
              {/* Header */}
              <div className="border-b border-outline-variant pb-3 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase bg-cyan-dim border border-cyan/20 text-primary px-2 py-0.5 rounded">
                    {activeReview.level}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`tag font-mono text-[9px] ${getPriorityBadgeClass(activeReview.priority)}`}>
                      {activeReview.priority} Priority
                    </span>
                    {onNavigateToCheck && activeReview.checkId && (
                      <button
                        type="button"
                        onClick={() => onNavigateToCheck(activeReview.checkId)}
                        className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/20"
                      >
                        <span>View QA Check</span>
                        <ArrowRight size={10} />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-on-surface leading-snug">
                  {activeReview.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {activeReview.description}
                </p>
              </div>

              {/* Expected Behaviour Callout */}
              <div className="neo-border bg-surface-container-low p-3.5 rounded-xl space-y-1.5 border-l-4 border-l-primary">
                <h4 className="text-[10px] font-bold font-mono text-primary uppercase tracking-wider">
                  Expected Behaviour
                </h4>
                <p className="text-xs text-on-surface leading-relaxed font-medium">
                  {activeReview.expectedBehavior || "Users should always understand where they are and navigate intuitively."}
                </p>
              </div>

              {/* Editable Review Form */}
              <div className="space-y-4 pt-1">
                {/* Status Selection Buttons */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                    Review Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "Pass", label: "Pass", style: "bg-emerald-dim border-emerald/40 text-emerald-400" },
                      { key: "Needs Improvement", label: "Needs Imprv.", style: "bg-yellow-dim border-yellow/40 text-yellow" },
                      { key: "Fail", label: "Fail", style: "bg-magenta-dim border-magenta/40 text-magenta" },
                      { key: "Not Applicable", label: "N / A", style: "bg-surface-container-high border-outline text-text-muted" },
                    ].map((btn) => {
                      const isActive = formStatus === btn.key;
                      return (
                        <button
                          key={btn.key}
                          type="button"
                          onClick={() => setFormStatus(btn.key as any)}
                          className={`py-2 px-2 text-center text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isActive
                              ? `${btn.style} border-2 font-bold shadow-lg`
                              : "bg-surface-container-low border-outline text-on-surface-variant hover:border-outline-variant"
                          }`}
                        >
                          {isActive && <Check size={12} strokeWidth={3} />}
                          <span>{btn.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Confidence 5-Star Rating */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono">
                      Confidence Rating
                    </label>
                    <span className="text-xs font-mono font-bold text-primary">
                      {formRating > 0 ? `${formRating} / 5 Stars` : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-surface-container-low border border-outline rounded-lg justify-center">
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <button
                        key={starNum}
                        type="button"
                        onClick={() => setFormRating(starNum)}
                        className="p-1 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star
                          size={20}
                          className={
                            starNum <= formRating
                              ? "text-yellow fill-yellow"
                              : "text-text-muted/40"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Observations / Notes Textarea */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                    Observations & Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Add observations..."
                    className="w-full bg-surface-container-low border border-outline rounded-lg text-xs text-on-surface p-3 focus:outline-none focus:border-primary resize-none placeholder:text-text-muted"
                  />
                </div>

                {/* Screenshot Upload Placeholder UI */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                    Visual Evidence / Screenshot
                  </label>
                  <div className="neo-border border-dashed bg-surface-container-low p-4 rounded-xl text-center space-y-2">
                    <UploadCloud size={24} className="text-text-muted mx-auto" />
                    <p className="text-xs text-on-surface-variant font-medium">
                      {formScreenshot ? "Screenshot attached" : "No screenshot attached"}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormScreenshot("https://qa-platform.dev/assets/screenshot-mock.png");
                        showToast("Attached proof screenshot placeholder", "info");
                      }}
                      className="px-3 py-1.5 bg-surface border border-outline hover:border-primary hover:text-primary text-[10px] font-bold uppercase tracking-wider text-on-surface-variant rounded-lg transition-all cursor-pointer"
                    >
                      Attach Screenshot
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-outline-variant space-y-2">
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="w-full bg-primary hover:opacity-90 text-on-primary-container py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <CheckCircle2 size={14} />
                  Save Review
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateIssue}
                    className="flex-1 py-2 bg-surface-container-low border border-outline hover:border-magenta hover:text-magenta text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle size={12} />
                    Create Issue
                  </button>
                  <button
                    type="button"
                    onClick={handleNextReview}
                    className="flex-1 py-2 bg-surface-container-low border border-outline hover:border-primary hover:text-primary text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Next Review</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 space-y-3">
              <User size={32} className="text-text-muted mx-auto" />
              <h4 className="text-sm font-bold text-on-surface">No Review Selected</h4>
              <p className="text-xs text-on-surface-variant">
                Select a review card from the queue to start human evaluation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
