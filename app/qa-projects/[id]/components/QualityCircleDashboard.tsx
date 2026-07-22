"use client";

import { useState, useEffect } from "react";

interface QualityCircleDashboardProps {
  percentage: number;
  animating?: boolean;
}

export default function QualityCircleDashboard({
  percentage,
  animating = false,
}: QualityCircleDashboardProps) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (percentage / 100) * circumference;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => setOffset(targetOffset), 200);
    return () => clearTimeout(timer);
  }, [targetOffset, percentage]);

  let strokeColor = "stroke-primary"; // Cyan
  if (percentage < 80) {
    strokeColor = "stroke-yellow"; // Yellow warning
  } else if (percentage < 70) {
    strokeColor = "stroke-magenta"; // Magenta critical
  }

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="transparent"
          strokeWidth="4"
          className="stroke-outline-variant"
        />
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="transparent"
          strokeWidth="4"
          className={`${strokeColor} transition-all duration-1000 ease-out`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-mono font-bold text-on-surface ${animating ? "animate-pulse" : ""}`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}
