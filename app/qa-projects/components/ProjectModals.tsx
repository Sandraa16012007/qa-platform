"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Trash2, AlertTriangle } from "lucide-react";
import { Project } from "../../types";

interface ProjectModalsProps {
  editingProject: Project | null;
  setEditingProject: (p: Project | null) => void;
  onSaveEdit: (p: Project) => void;
  deletingProject: Project | null;
  setDeletingProject: (p: Project | null) => void;
  onConfirmDelete: (id: string) => void;
}

export default function ProjectModals({
  editingProject,
  setEditingProject,
  onSaveEdit,
  deletingProject,
  setDeletingProject,
  onConfirmDelete,
}: ProjectModalsProps) {
  return (
    <>
      {/* Edit Project Settings Modal */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProject(null)}
              className="absolute inset-0 bg-background/85 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-surface border border-outline rounded-xl p-6 shadow-2xl space-y-4 z-10"
            >
              <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                <h3 className="text-base font-bold text-on-surface">Edit Project Settings</h3>
                <button
                  onClick={() => setEditingProject(null)}
                  className="p-1 text-text-muted hover:text-on-surface rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={editingProject.name}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, name: e.target.value })
                    }
                    className="w-full bg-surface-container-low border border-outline rounded-lg text-xs font-semibold px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                    Product Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingProject.description}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, description: e.target.value })
                    }
                    className="w-full bg-surface-container-low border border-outline rounded-lg text-xs p-3 text-on-surface focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  onClick={() => setEditingProject(null)}
                  className="px-3.5 py-1.5 border border-outline hover:border-outline-variant text-on-surface-variant text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSaveEdit(editingProject)}
                  className="px-4 py-1.5 bg-primary text-on-primary-container text-xs font-bold uppercase tracking-wider rounded-lg hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={12} />
                  <span>Save Changes</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingProject(null)}
              className="absolute inset-0 bg-background/85 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-surface border border-magenta/40 rounded-xl p-6 shadow-2xl space-y-4 z-10"
            >
              <div className="flex items-center gap-2 text-magenta">
                <AlertTriangle size={20} />
                <h3 className="text-base font-bold text-on-surface">Confirm Deletion</h3>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Are you sure you want to delete <strong className="text-on-surface">{deletingProject.name}</strong>? This action will remove all generated QA checks, test runs, and reports.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
                <button
                  onClick={() => setDeletingProject(null)}
                  className="px-3.5 py-1.5 border border-outline text-on-surface-variant text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirmDelete(deletingProject.id)}
                  className="px-4 py-1.5 bg-magenta text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
