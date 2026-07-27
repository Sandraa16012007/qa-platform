"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Info, X, Check, CheckCircle2 } from "lucide-react";
import { QaCheck } from "../types";

interface QaCheckDrawerProps {
  selectedCheck: QaCheck | null;
  onClose: () => void;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editPageName: string;
  setEditPageName: (val: string) => void;
  editCategory: string;
  setEditCategory: (val: string) => void;
  editPriority: "Critical" | "High" | "Medium" | "Low";
  setEditPriority: (val: "Critical" | "High" | "Medium" | "Low") => void;
  editStatus: "Not Started" | "In Progress" | "Passed" | "Failed" | "Skipped";
  setEditStatus: (val: "Not Started" | "In Progress" | "Passed" | "Failed" | "Skipped") => void;
  editAutomation: "Automated" | "Human Review";
  setEditAutomation: (val: "Automated" | "Human Review") => void;
  onGoToReview: (checkId: string) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
  editExpected: string;
  setEditExpected: (val: string) => void;
  editNotes: string;
  setEditNotes: (val: string) => void;
  editCriteria: string[];
  toggleSubItem: (idx: number) => void;
  handleSaveCheck: () => void;
}

export default function QaCheckDrawer({
  selectedCheck,
  onClose,
  editTitle,
  setEditTitle,
  editPageName,
  setEditPageName,
  editCategory,
  setEditCategory,
  editPriority,
  setEditPriority,
  editStatus,
  setEditStatus,
  editAutomation,
  setEditAutomation,
  onGoToReview,
  editDescription,
  setEditDescription,
  editExpected,
  setEditExpected,
  editNotes,
  setEditNotes,
  editCriteria,
  toggleSubItem,
  handleSaveCheck,
}: QaCheckDrawerProps) {
  return (
    <AnimatePresence>
      {selectedCheck && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-xs z-40 cursor-pointer"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.8 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed right-0 top-0 h-screen w-[32vw] min-w-[380px] max-w-[480px] bg-surface border-l border-outline-variant p-5 space-y-4 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Panel Header */}
            <div className="flex justify-between items-center border-b border-outline-variant pb-2.5">
              <div className="flex items-center gap-1.5 text-primary">
                <Info size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                  QA Check Details
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Title input */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono">
                QA Check Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-surface-container-low border border-outline rounded-lg text-xs font-semibold text-on-surface px-3 py-2 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Page Name input */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono">
                Page Name
              </label>
              <input
                type="text"
                value={editPageName}
                onChange={(e) => setEditPageName(e.target.value)}
                placeholder="e.g. Landing Page, Global"
                className="w-full bg-surface-container-low border border-outline rounded-lg text-xs font-semibold text-on-surface px-3 py-2 focus:outline-none focus:border-primary placeholder:text-text-muted placeholder:font-normal"
              />
            </div>

            {/* Category, Priority & Status Selector */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline rounded-lg text-xs font-semibold px-2 py-1.5 text-on-surface cursor-pointer"
                  >
                    <option value="Navigation">Navigation</option>
                    <option value="Branding">Branding</option>
                    <option value="Accessibility">Accessibility</option>
                    <option value="User Experience">User Experience</option>
                    <option value="Performance">Performance</option>
                    <option value="Content">Content</option>
                    <option value="Functionality">Functionality</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full bg-surface-container-low border border-outline rounded-lg text-xs font-semibold px-2 py-1.5 text-on-surface cursor-pointer"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono">
                    Status
                  </label>
                  {editAutomation === "Human Review" ? (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`flex-1 text-xs font-semibold px-2 py-1.5 rounded-lg border border-outline bg-surface-container-low ${
                          editStatus === "Passed"
                            ? "text-emerald-400"
                            : editStatus === "Failed"
                            ? "text-magenta"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {editStatus}
                      </span>
                    </div>
                  ) : (
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full bg-surface-container-low border border-outline rounded-lg text-xs font-semibold px-2 py-1.5 text-on-surface cursor-pointer"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Passed">Passed</option>
                      <option value="Failed">Failed</option>
                      <option value="Skipped">Skipped</option>
                    </select>
                  )}
                  {editAutomation === "Human Review" && (
                    <p className="text-[9px] text-text-muted font-mono">
                      Set from the linked Human Review — driven by its saved result.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Validation Mode selector */}
            <div className="flex items-center justify-between gap-2 py-1.5 border-y border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono">
                  Validation Mode:
                </span>
                <select
                  value={editAutomation}
                  onChange={(e) => {
                    const next = e.target.value as "Automated" | "Human Review";
                    setEditAutomation(next);
                    // Toggling mode changes what "Status" means going forward
                    // (driven by a Human Review vs. manually set), so reset it
                    // to a clean starting point rather than carrying over a
                    // stale value from the previous mode.
                    setEditStatus("Not Started");
                  }}
                  className={`tag font-mono text-[9px] py-0.5 px-2 rounded cursor-pointer border ${
                    editAutomation === "Automated"
                      ? "bg-cyan-dim text-primary border-cyan/20"
                      : "bg-yellow-dim text-yellow border-yellow/20"
                  }`}
                >
                  <option value="Automated">Automated</option>
                  <option value="Human Review">Human Review</option>
                </select>
              </div>
              {editAutomation === "Human Review" && selectedCheck && (
                <button
                  type="button"
                  onClick={() => onGoToReview(selectedCheck.id)}
                  className="text-[9px] font-bold uppercase tracking-wider text-primary hover:underline font-mono"
                >
                  Go to review →
                </button>
              )}
            </div>

            {/* Description & Expected Behavior inputs */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-container-low border border-outline rounded-lg text-xs text-on-surface-variant p-2.5 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                  Expected Outcome
                </label>
                <textarea
                  value={editExpected}
                  onChange={(e) => setEditExpected(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-container-low border border-outline rounded-lg text-xs text-on-surface-variant p-2.5 focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            {/* Acceptance Criteria */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                Acceptance Criteria
              </label>
              <div className="space-y-1.5">
                {editCriteria.map((item, idx) => {
                  const checked = item.startsWith("✓ ");
                  const labelText = checked ? item.replace("✓ ", "") : item;
                  return (
                    <label
                      key={labelText}
                      className="flex items-center gap-2 cursor-pointer select-none text-[11px]"
                    >
                      <button
                        onClick={() => toggleSubItem(idx)}
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                          checked ? "bg-primary border-primary text-on-primary-container" : "border-outline text-transparent"
                        }`}
                      >
                        {checked && <Check size={10} strokeWidth={3} />}
                      </button>
                      <span className={checked ? "text-on-surface line-through decoration-text-muted opacity-60" : "text-on-surface-variant"}>
                        {labelText}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Implementation Notes */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                Implementation Notes
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add implementation notes..."
                rows={3}
                className="w-full bg-surface-container-low border border-outline rounded-lg text-xs text-on-surface p-2.5 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveCheck}
              className="w-full bg-primary text-on-primary-container py-2 text-xs font-bold uppercase tracking-widest rounded-lg cursor-pointer hover:opacity-90 transition-all text-center flex items-center justify-center gap-1.5 mt-2"
            >
              <CheckCircle2 size={14} />
              Save Changes
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
