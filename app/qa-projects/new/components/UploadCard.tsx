"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, CheckCircle2, X } from "lucide-react";

export interface UploadedFile {
  name: string;
  size: number;
  category: string;
}

interface UploadCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  accepts: string;
  files: UploadedFile[];
  onUpload: (files: FileList) => void;
  onRemove: (name: string) => void;
}

export default function UploadCard({
  icon: Icon,
  title,
  description,
  accepts,
  files,
  onUpload,
  onRemove,
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        onUpload(e.dataTransfer.files);
      }
    },
    [onUpload]
  );

  return (
    <div
      className={`neo-border rounded-xl p-4 transition-all duration-200 ${
        isDragOver ? "border-primary glow-cyan" : "bg-surface hover:border-outline-variant"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
          <Icon size={16} strokeWidth={1.5} className="text-primary" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-on-surface">{title}</h4>
          <p className="text-[11px] text-text-muted mt-0.5">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full border border-dashed rounded-lg py-3 px-3 flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isDragOver
            ? "border-primary bg-cyan-dim text-primary"
            : "border-outline text-text-muted hover:border-outline-variant hover:text-on-surface-variant"
        }`}
      >
        <Upload size={14} strokeWidth={1.5} />
        <span className="text-[11px] font-medium uppercase tracking-wider">{accepts}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files);
            e.target.value = "";
          }
        }}
      />

      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {files.map((f) => (
            <span
              key={f.name}
              className="inline-flex items-center gap-1.5 bg-cyan-dim border border-cyan/20 text-primary text-[10px] font-semibold px-2 py-1 rounded"
            >
              <CheckCircle2 size={10} strokeWidth={2} />
              {f.name}
              <button
                type="button"
                onClick={() => onRemove(f.name)}
                className="hover:text-on-surface transition-colors cursor-pointer"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
