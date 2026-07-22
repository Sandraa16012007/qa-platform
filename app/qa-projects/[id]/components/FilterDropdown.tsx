"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onSelect,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low border border-outline hover:border-outline-variant text-on-surface-variant hover:text-on-surface text-xs font-semibold rounded-lg transition-all cursor-pointer"
      >
        <span>{selected !== "All" && selected !== label ? `${label}: ${selected}` : label}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-44 bg-surface-container border border-outline rounded-lg shadow-xl z-50 py-1 max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onSelect(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer ${
                selected === opt
                  ? "bg-surface-container-high text-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
