"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Cpu,
  User,
  PlusCircle,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { IssueItem, PageNote, Toast } from "../../types";
import FilterDropdown from "../FilterDropdown";
import { Trash2, Check } from "lucide-react";

interface IssuesTabProps {
  issues: IssueItem[];
  setIssues: React.Dispatch<React.SetStateAction<IssueItem[]>>;
  pageNotes: PageNote[];
  setPageNotes: React.Dispatch<React.SetStateAction<PageNote[]>>;
  onNavigateToCheck: (checkId: string) => void;
  onNavigateToReview: (reviewId: string) => void;
  showToast: (msg: string, type?: Toast["type"]) => void;
  onAddPageNote?: (note: { pageName: string; content: string }) => void;
  onDeletePageNote?: (id: string) => void;
}

export default function IssuesTab({
  issues,
  setIssues,
  pageNotes,
  setPageNotes,
  onNavigateToCheck,
  onNavigateToReview,
  showToast,
  onAddPageNote,
  onDeletePageNote,
}: IssuesTabProps) {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(
    issues[0]?.id || "issue-1"
  );

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  // New Page Note Form State
  const [newNotePage, setNewNotePage] = useState("General Page Note");
  const [newNoteContent, setNewNoteContent] = useState("");

  const handleAddPageNote = () => {
    if (!newNoteContent.trim()) return;
    const pageName = newNotePage.trim() || "General Page Note";
    const content = newNoteContent.trim();

    if (onAddPageNote) {
      onAddPageNote({ pageName, content });
    } else {
      const newNote: PageNote = {
        id: `note-${Date.now()}`,
        pageName,
        author: "Admin Engineer",
        date: "Just now",
        content,
      };
      setPageNotes((prev) => [newNote, ...prev]);
    }

    setNewNoteContent("");
    showToast(`Added page note for "${pageName}"`, "success");
  };

  const handleDeletePageNote = (id: string) => {
    if (onDeletePageNote) {
      onDeletePageNote(id);
    } else {
      setPageNotes((prev) => prev.filter((n) => n.id !== id));
    }
    showToast("Resolved page note", "info");
  };

  // Selected Issue
  const activeIssue = useMemo(() => {
    return issues.find((i) => i.id === selectedIssueId) || issues[0] || null;
  }, [issues, selectedIssueId]);

  // Filtered Issues list
  const filteredIssues = useMemo(() => {
    return issues.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.recommendation.toLowerCase().includes(q) ||
          item.linkedPage.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (statusFilter !== "All" && item.status !== statusFilter) return false;
      if (severityFilter !== "All" && item.severity !== severityFilter) return false;
      if (levelFilter !== "All" && item.level !== levelFilter) return false;
      if (sourceFilter !== "All" && item.source !== sourceFilter) return false;

      return true;
    });
  }, [issues, searchQuery, statusFilter, severityFilter, levelFilter, sourceFilter]);

  // Toggle issue status
  const handleToggleResolve = (issueId: string) => {
    const target = issues.find((item) => item.id === issueId);
    if (!target) return;
    const nextStatus = target.status === "Resolved" ? "Open" : "Resolved";

    setIssues((prev) =>
      prev.map((item) => (item.id === issueId ? { ...item, status: nextStatus } : item))
    );

    showToast(
      nextStatus === "Resolved"
        ? `Marked "${target.title}" as resolved!`
        : `Reopened issue "${target.title}"`,
      nextStatus === "Resolved" ? "success" : "info"
    );
  };

  // Badge Helpers
  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-magenta-dim border border-magenta/30 text-magenta font-bold";
      case "High":
        return "bg-yellow-dim border border-yellow/30 text-yellow font-bold";
      case "Medium":
        return "bg-cyan-dim border border-cyan/30 text-primary font-bold";
      default:
        return "bg-surface-container border border-outline text-text-muted";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-dim border border-emerald/30 text-emerald-400 font-bold";
      case "In Progress":
        return "bg-cyan-dim border border-cyan/30 text-cyan font-bold";
      case "Open":
        return "bg-magenta-dim border border-magenta/30 text-magenta font-bold";
      default:
        return "bg-surface-container border border-outline text-text-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Toolbar */}
      <div className="neo-border bg-surface p-6 rounded-xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">QA Issues</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Track, inspect, and resolve issues generated directly from failed automated QA runs and human reviews.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-on-surface bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline">
              Open Issues: <span className="text-magenta">{issues.filter((i) => i.status !== "Resolved").length}</span>
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="pt-2 border-t border-outline-variant flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div className="relative flex-grow max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline rounded-lg text-xs pl-9 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary placeholder:text-text-muted"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Status"
              options={["All", "Open", "In Progress", "Resolved"]}
              selected={statusFilter}
              onSelect={setStatusFilter}
            />
            <FilterDropdown
              label="Severity"
              options={["All", "Critical", "High", "Medium", "Low"]}
              selected={severityFilter}
              onSelect={setSeverityFilter}
            />
            <FilterDropdown
              label="QA Level"
              options={["All", "Product QA", "Page QA", "Component QA", "Feature QA", "Release QA"]}
              selected={levelFilter}
              onSelect={setLevelFilter}
            />
            <FilterDropdown
              label="Source"
              options={["All", "Automation", "Human Review"]}
              selected={sourceFilter}
              onSelect={setSourceFilter}
            />

            {(searchQuery || statusFilter !== "All" || severityFilter !== "All" || levelFilter !== "All" || sourceFilter !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setSeverityFilter("All");
                  setLevelFilter("All");
                  setSourceFilter("All");
                }}
                className="text-[10px] text-magenta hover:underline uppercase font-bold tracking-wider cursor-pointer ml-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Issue List (~45% width / 5 cols) */}
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
              Issues List ({filteredIssues.length})
            </h3>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
            {filteredIssues.length === 0 ? (
              <div className="neo-border bg-surface p-8 rounded-xl text-center space-y-3">
                <CheckCircle2 size={32} className="text-primary mx-auto" />
                <h4 className="text-sm font-bold text-on-surface">No matching issues</h4>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                  Adjust filter queries to display logged issue entries.
                </p>
              </div>
            ) : (
              filteredIssues.map((item) => {
                const isSelected = activeIssue?.id === item.id;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ x: isSelected ? 0 : 2 }}
                    onClick={() => setSelectedIssueId(item.id)}
                    className={`neo-border p-4 rounded-xl cursor-pointer transition-all space-y-3 ${
                      isSelected
                        ? "bg-surface-container-high border-l-4 border-l-magenta border-outline glow-cyan"
                        : "bg-surface hover:border-outline-variant"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`text-xs font-bold text-on-surface leading-snug ${item.status === "Resolved" ? "line-through opacity-60" : ""}`}>
                        {item.title}
                      </h4>
                      <span className={`tag font-mono uppercase text-[9px] py-0.5 px-2 rounded shrink-0 ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/50 text-[9px] font-mono">
                      <span className={`tag uppercase py-0.5 px-1.5 rounded ${getSeverityBadgeClass(item.severity)}`}>
                        {item.severity}
                      </span>
                      <span className="bg-surface-container border border-outline px-1.5 py-0.5 rounded text-text-muted">
                        {item.level}
                      </span>
                      <span className="bg-surface-container border border-outline px-1.5 py-0.5 rounded text-text-muted flex items-center gap-1">
                        {item.source === "Automation" ? <Cpu size={10} className="text-primary" /> : <User size={10} className="text-yellow" />}
                        {item.source}
                      </span>
                      <span className="text-text-muted ml-auto font-sans font-medium">
                        {item.createdDate}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Issue Details (~55% width / 7 cols) */}
        <div className="col-span-12 lg:col-span-7 neo-border bg-surface p-6 rounded-xl space-y-5 sticky top-[80px] h-[calc(100vh-140px)] overflow-y-auto shadow-2xl">
          {activeIssue ? (
            <>
              {/* Header */}
              <div className="border-b border-outline-variant pb-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`tag font-mono text-[9px] uppercase px-2 py-0.5 rounded ${getSeverityBadgeClass(activeIssue.severity)}`}>
                      {activeIssue.severity} Severity
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase bg-surface-container border border-outline text-on-surface-variant px-2 py-0.5 rounded">
                      {activeIssue.level}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase bg-surface-container border border-outline text-on-surface-variant px-2 py-0.5 rounded flex items-center gap-1">
                      {activeIssue.source === "Automation" ? <Cpu size={10} className="text-primary" /> : <User size={10} className="text-yellow" />}
                      Generated from {activeIssue.source}
                    </span>
                  </div>

                  <span className={`tag font-mono text-[9px] uppercase px-2.5 py-0.5 rounded ${getStatusBadgeClass(activeIssue.status)}`}>
                    {activeIssue.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-on-surface leading-snug">
                  {activeIssue.title}
                </h3>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold font-mono text-text-muted uppercase tracking-wider">
                  Issue Description
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed p-3 bg-surface-container-low rounded-lg border border-outline">
                  {activeIssue.description}
                </p>
              </div>

              {/* Recommendation Callout */}
              <div className="neo-border bg-surface-container-low p-4 rounded-xl space-y-1.5 border-l-4 border-l-primary">
                <h4 className="text-[10px] font-bold font-mono text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} />
                  Recommended Resolution
                </h4>
                <p className="text-xs text-on-surface leading-relaxed font-medium">
                  {activeIssue.recommendation}
                </p>
              </div>

              {/* Metadata Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-surface-container-low rounded-lg border border-outline font-mono">
                <div>
                  <span className="text-[9px] text-text-muted uppercase block font-bold">Assigned To</span>
                  <span className="text-on-surface font-semibold">{activeIssue.assignedTo}</span>
                </div>
                <div>
                  <span className="text-[9px] text-text-muted uppercase block font-bold">Linked Route / Component</span>
                  <span className="text-primary font-semibold truncate block">{activeIssue.linkedPage}</span>
                </div>
                <div>
                  <span className="text-[9px] text-text-muted uppercase block font-bold">Created Date</span>
                  <span className="text-on-surface font-semibold">{activeIssue.createdDate}</span>
                </div>
                <div>
                  <span className="text-[9px] text-text-muted uppercase block font-bold">Originating Source</span>
                  <span className="text-on-surface font-semibold">{activeIssue.source}</span>
                </div>
              </div>

              {/* Contextual Action Buttons */}
              <div className="pt-3 border-t border-outline-variant space-y-3">
                <div className="flex flex-wrap gap-2.5">
                  {/* Link to QA Check */}
                  {activeIssue.linkedCheckId && (
                    <button
                      type="button"
                      onClick={() => onNavigateToCheck(activeIssue.linkedCheckId!)}
                      className="flex-1 py-2 px-3 bg-surface-container-low border border-outline hover:border-primary hover:text-primary text-on-surface text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink size={12} />
                      <span>View Linked QA Check</span>
                    </button>
                  )}

                  {/* Link to Human Review */}
                  {activeIssue.linkedReviewId && (
                    <button
                      type="button"
                      onClick={() => onNavigateToReview(activeIssue.linkedReviewId!)}
                      className="flex-1 py-2 px-3 bg-surface-container-low border border-outline hover:border-primary hover:text-primary text-on-surface text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink size={12} />
                      <span>Go to Human Review</span>
                    </button>
                  )}

                  {/* Fallback general view link if neither specific ID attached */}
                  {!activeIssue.linkedCheckId && !activeIssue.linkedReviewId && (
                    <button
                      type="button"
                      onClick={() => onNavigateToCheck("check-1")}
                      className="flex-1 py-2 px-3 bg-surface-container-low border border-outline hover:border-primary hover:text-primary text-on-surface text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink size={12} />
                      <span>Go to QA Check</span>
                    </button>
                  )}

                  {/* Mark Resolved Toggle CTA */}
                  <button
                    type="button"
                    onClick={() => handleToggleResolve(activeIssue.id)}
                    className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeIssue.status === "Resolved"
                        ? "bg-surface-container border border-outline text-on-surface-variant hover:text-on-surface"
                        : "bg-primary text-on-primary-container hover:opacity-90 shadow-lg"
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>{activeIssue.status === "Resolved" ? "Reopen Issue" : "Mark as Resolved"}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 space-y-3">
              <AlertTriangle size={32} className="text-text-muted mx-auto" />
              <h4 className="text-sm font-bold text-on-surface">No Issue Selected</h4>
              <p className="text-xs text-on-surface-variant">
                Select an issue card from the queue to view details and recommendations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Page Notes & Observations Section */}
      <div className="neo-border bg-surface p-6 rounded-xl space-y-4">
        <div className="flex justify-between items-center border-b border-outline-variant pb-3">
          <div>
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider font-mono">
              Page Notes & Miscellaneous Observations
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Record layout notes, design feedback, or team observations not tied to a specific checklist item.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-text-muted bg-surface-container-low px-2.5 py-1 rounded border border-outline">
            {pageNotes.length} Notes Recorded
          </span>
        </div>

        {/* Add Note Form */}
        <div className="space-y-3 bg-surface-container-low p-4 rounded-xl border border-outline">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Target Page Name (e.g., Dashboard Overview)..."
              value={newNotePage}
              onChange={(e) => setNewNotePage(e.target.value)}
              className="sm:w-64 bg-surface border border-outline rounded-lg text-xs text-on-surface px-3 py-2 focus:outline-none focus:border-primary font-semibold"
            />
            <input
              type="text"
              placeholder="Enter observation notes..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="flex-grow bg-surface border border-outline rounded-lg text-xs text-on-surface px-3 py-2 focus:outline-none focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && handleAddPageNote()}
            />
            <button
              type="button"
              onClick={handleAddPageNote}
              className="bg-primary text-on-primary-container text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <PlusCircle size={14} />
              <span>Add Page Note</span>
            </button>
          </div>
        </div>

        {/* Existing Notes List */}
        <div className="space-y-2.5">
          {pageNotes.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">No additional page notes</p>
          ) : (
            pageNotes.map((note) => (
              <div
                key={note.id}
                className="p-3.5 bg-surface-container-low rounded-lg border border-outline flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs group"
              >
                <div className="space-y-1 flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary font-mono">{note.pageName}</span>
                    <span className="text-[10px] text-text-muted font-mono">• {note.author}</span>
                  </div>
                  <p className="text-on-surface-variant">{note.content}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-text-muted font-mono">{note.date}</span>
                  <button
                    type="button"
                    onClick={() => handleDeletePageNote(note.id)}
                    title="Resolve / Delete Page Note"
                    className="p-1.5 text-text-muted hover:text-magenta hover:bg-magenta-dim/30 rounded transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
