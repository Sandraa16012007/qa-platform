"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useProjectStore } from "../stores/useProjectStore";

export default function RecentProjects() {
  const projects = useProjectStore((state) => state.projects);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Project cards grid — 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project, idx) => (
          <Link key={project.id} href={`/qa-projects/${project.id}`} className="block">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
              className="neo-border bg-surface p-6 space-y-4 group hover:border-primary transition-all cursor-pointer rounded-xl h-full flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4
                    style={{ fontSize: 24, lineHeight: 1.3 }}
                    className="font-bold text-on-surface"
                  >
                    {project.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div
                      style={{ fontSize: 10 }}
                      className="px-2 py-0.5 bg-surface-container-high border border-outline text-primary font-mono uppercase rounded"
                    >
                      {project.status}
                    </div>
                    <span
                      style={{ fontSize: 12 }}
                      className="text-on-surface-variant uppercase"
                    >
                      Updated {project.lastUpdated}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: 32 }} className="font-bold text-primary">
                    {project.qualityScore}%
                  </div>
                  <div
                    style={{ fontSize: 10, letterSpacing: "-0.04em" }}
                    className="font-semibold text-on-surface-variant uppercase"
                  >
                    Avg Score
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.qualityScore}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className="h-full bg-primary"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center text-on-surface-variant">
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={16} strokeWidth={1.5} />
                  <span className="font-mono text-sm">{project.frameworkChecksCount || 35} Tests</span>
                </div>
                <div
                  style={{ fontSize: 10 }}
                  className="bg-primary/10 group-hover:bg-primary text-primary group-hover:text-on-primary-container px-2 py-1.5 uppercase font-bold tracking-widest rounded transition-all flex items-center gap-1 cursor-pointer"
                >
                  View Project{" "}
                  <ArrowRight size={14} strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}

        {/* Create New Project — dashed card */}
        <Link href="/qa-projects/new" className="block">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="neo-border border-dashed border-outline-variant bg-transparent p-6 flex flex-col items-center justify-center space-y-4 text-on-surface-variant hover:text-primary hover:border-primary transition-all cursor-pointer group rounded-xl h-full"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <PlusCircle
                size={48}
                strokeWidth={1}
                className="group-hover:scale-110 transition-transform"
              />
            </motion.div>
            <div className="text-center">
              <h4
                style={{ fontSize: 12, letterSpacing: "0.05em" }}
                className="font-semibold uppercase"
              >
                Create New Project
              </h4>
              <p className="text-sm opacity-60 mt-1">
                Initialize a new QA environment
              </p>
            </div>
          </motion.div>
        </Link>
      </div>
    </motion.section>
  );
}
