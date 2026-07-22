"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";

interface RunQaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (suiteName: string) => void;
  runName: string;
  setRunName: (val: string) => void;
  env: string;
  setEnv: (val: string) => void;
  browser: string;
  setBrowser: (val: string) => void;
  device: string;
  setDevice: (val: string) => void;
  scope: string[];
  setScope: (update: (prev: string[]) => string[]) => void;
}

export default function RunQaModal({
  isOpen,
  onClose,
  onStart,
  runName,
  setRunName,
  env,
  setEnv,
  browser,
  setBrowser,
  device,
  setDevice,
  scope,
  setScope,
}: RunQaModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/85 backdrop-blur-sm"
          />
          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-lg bg-surface border border-outline rounded-xl p-6 shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-dim text-primary flex items-center justify-center">
                  <Play size={16} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Configure Test Run</h3>
                  <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">
                    Set up automated check suite parameters
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-on-surface-variant hover:text-on-surface cursor-pointer rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Content */}
            <div className="space-y-4 text-xs">
              {/* Run Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                  Run Name
                </label>
                <input
                  type="text"
                  value={runName}
                  onChange={(e) => setRunName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline rounded-lg text-xs text-on-surface px-3 py-2 focus:outline-none focus:border-primary font-semibold"
                  placeholder="Enter execution suite name"
                />
              </div>

              {/* Environment selection */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                  Environment
                </label>
                <div className="flex gap-2">
                  {["Production", "Staging", "Local"].map((item) => {
                    const isActive = env === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setEnv(item)}
                        className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-on-primary-container border-primary"
                            : "bg-surface-container-low border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Browser selection */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                  Target Browser
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Chrome", "Firefox", "Safari", "Edge", "All Browsers"].map((item) => {
                    const isActive = browser === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setBrowser(item)}
                        className={`px-3 py-1.5 text-center text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-on-primary-container border-primary"
                            : "bg-surface-container-low border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Device selection */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                  Target Device
                </label>
                <div className="flex gap-2">
                  {["Desktop", "Tablet", "Mobile", "All Devices"].map((item) => {
                    const isActive = device === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDevice(item)}
                        className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-on-primary-container border-primary"
                            : "bg-surface-container-low border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QA Scope (Checkboxes) */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                  QA Scope Selection
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Product QA", "Page QA", "Component QA", "Feature QA", "Release QA"].map((scopeItem) => {
                    const isChecked = scope.includes(scopeItem);
                    return (
                      <label
                        key={scopeItem}
                        className="flex items-center gap-2.5 p-2 bg-surface-container-low border border-outline hover:border-outline-variant rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setScope((prev) => prev.filter((s) => s !== scopeItem));
                            } else {
                              setScope((prev) => [...prev, scopeItem]);
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border border-outline text-primary focus:ring-0 focus:outline-none bg-surface-container accent-primary"
                        />
                        <span className="font-semibold text-on-surface-variant">{scopeItem}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-outline-variant">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-outline hover:border-outline-variant hover:text-on-surface text-on-surface-variant text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onStart(runName)}
                className="px-4 py-2 bg-primary hover:opacity-90 text-on-primary-container text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Play size={12} fill="currentColor" />
                Start Test Run
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
