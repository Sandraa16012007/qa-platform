"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Info, X, Check, CheckCircle2 } from "lucide-react";
import { QaCheck } from "../types";

interface QaCheckDrawerProps {
  selectedCheck: QaCheck | null;
  onClose: () => void;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editCategory: string;
  setEditCategory: (val: string) => void;
  editPriority: "Critical" | "High" | "Medium" | "Low";
  setEditPriority: (val: "Critical" | "High" | "Medium" | "Low") => void;
  editStatus: "Not Started" | "In Progress" | "Passed" | "Failed" | "Skipped";
  setEditStatus: (val: "Not Started" | "In Progress" | "Passed" | "Failed" | "Skipped") => void;
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
  editCategory,
  setEditCategory,
  editPriority,
  setEditPriority,
  editStatus,
  setEditStatus,
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
                </div>
              </div>
            </div>

            {/* Automation indicator */}
            <div className="flex items-center gap-2 py-1.5 border-y border-outline-variant">
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono">
                Validation Mode:
              </span>
              <span className={`tag font-mono text-[9px] py-0.5 px-2 rounded ${
                selectedCheck.automation === "Automated"
                  ? "bg-cyan-dim text-primary border border-cyan/20"
                  : "bg-yellow-dim text-yellow border border-yellow/20"
              }`}>
                {selectedCheck.automation}
              </span>
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
