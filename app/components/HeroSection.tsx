"use client";

import { motion } from "framer-motion";
import { PlusCircle, FileText } from "lucide-react";

export default function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="neo-border bg-surface p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 rounded-xl"
    >
      <div className="space-y-2 max-w-2xl">
        <h2
          style={{ fontSize: 48, lineHeight: 1.1, letterSpacing: "-0.02em" }}
          className="font-semibold text-on-surface"
        >
          AI-Powered Quality Engineering <br />
          <span className="text-primary">for Digital Products</span>
        </h2>
        <p
          style={{ fontSize: 18, lineHeight: 1.6 }}
          className="text-on-surface-variant"
        >
          Generate QA frameworks, execute tests, guide human reviews, and
          understand product quality from a single workspace.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-primary text-on-primary-container px-6 py-4 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all rounded-lg cursor-pointer"
        >
          <PlusCircle size={18} strokeWidth={1.5} />
          New QA Project
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="neo-border-primary text-primary px-6 py-4 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/10 transition-all rounded-lg cursor-pointer"
        >
          <FileText size={18} strokeWidth={1.5} />
          View Reports
        </motion.button>
      </div>
    </motion.section>
  );
}
