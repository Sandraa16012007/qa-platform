"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Folder, Play, AlertTriangle } from "lucide-react";

function QualityRing({ percentage }: { percentage: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (percentage / 100) * circumference;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => setOffset(targetOffset), 300);
    return () => clearTimeout(timer);
  }, [targetOffset]);

  return (
    <div className="flex flex-col items-center justify-center py-4 space-y-4">
      <div style={{ width: 160, height: 160 }} className="relative">
        <svg className="w-full h-full quality-ring" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            strokeWidth="8"
            className="quality-ring-bg"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            strokeWidth="8"
            className="quality-ring-fill"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="butt"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            style={{ fontSize: 48, lineHeight: 1.1, letterSpacing: "-0.02em" }}
            className="font-semibold text-on-surface"
          >
            {percentage}%
          </span>
          <span
            style={{ fontSize: 12, letterSpacing: "0.05em" }}
            className="font-semibold text-on-surface-variant uppercase"
          >
            Quality Score
          </span>
        </div>
      </div>
    </div>
  );
}

const metrics = [
  {
    label: "Projects",
    value: "12",
    icon: Folder,
    color: "text-on-surface-variant",
    valueColor: "text-primary",
    hoverBorder: "hover:border-primary",
  },
  {
    label: "QA Runs",
    value: "48",
    icon: Play,
    color: "text-magenta",
    valueColor: "text-magenta",
    hoverBorder: "hover:border-magenta",
  },
  {
    label: "Open Issues",
    value: "134",
    icon: AlertTriangle,
    color: "text-yellow",
    valueColor: "text-yellow",
    hoverBorder: "hover:border-yellow",
  },
];

export default function MetricsPanel() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3
          style={{ fontSize: 24, lineHeight: 1.3 }}
          className="font-bold text-on-surface uppercase tracking-tight whitespace-nowrap"
        >
          Workspace
        </h3>
        <div className="h-px flex-1 ml-4 bg-outline-variant" />
      </div>

      {/* Main card */}
      <div className="neo-border bg-surface p-6 space-y-6 rounded-xl flex flex-col mt-4">
        {/* Quality Score Circle */}
        <QualityRing percentage={87} />

        {/* Metric rows */}
        <div className="space-y-2 flex-1">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.35 + index * 0.08 }}
                className={`flex justify-between items-center p-4 neo-border bg-surface-container-low group ${metric.hoverBorder} transition-all rounded-lg`}
              >
                <div className="flex items-center gap-4">
                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    className={metric.color}
                  />
                  <span className="text-base text-on-surface">
                    {metric.label}
                  </span>
                </div>
                <span
                  className={`font-mono text-sm font-bold ${metric.valueColor}`}
                >
                  {metric.value}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
}
