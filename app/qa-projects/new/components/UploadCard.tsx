"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, CheckCircle2, X, AlertCircle, AlertTriangle, Loader2, FileCode } from "lucide-react";

export interface UploadedFile {
  name: string;
  size: number;
  category: string;
  status?: "pending" | "extracting" | "success" | "truncated" | "empty" | "error";
  wordCount?: number;
  pageCount?: number;
  characterCount?: number;
  itemCount?: number;
  format?: string;
  error?: string;
}

interface UploadCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  accepts: string;
  acceptFileTypes?: string;
  files: UploadedFile[];
  isExtracting?: boolean;
  onUpload: (files: FileList) => void;
  onRemove: (name: string) => void;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function UploadCard({
  icon: Icon,
  title,
  description,
  accepts,
  acceptFileTypes,
  files,
  isExtracting = false,
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
      className={`neo-border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between ${
        isDragOver ? "border-primary glow-cyan" : "bg-surface hover:border-outline-variant"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div>
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
          disabled={isExtracting}
          onClick={() => inputRef.current?.click()}
          className={`w-full border border-dashed rounded-lg py-3 px-3 flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isDragOver
              ? "border-primary bg-cyan-dim text-primary"
              : isExtracting
              ? "border-outline opacity-60 cursor-not-allowed text-text-muted"
              : "border-outline text-text-muted hover:border-outline-variant hover:text-on-surface-variant"
          }`}
        >
          {isExtracting ? (
            <>
              <Loader2 size={14} className="animate-spin text-primary" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-primary">
                Extracting Document Context...
              </span>
            </>
          ) : (
            <>
              <Upload size={14} strokeWidth={1.5} />
              <span className="text-[11px] font-medium uppercase tracking-wider">{accepts}</span>
            </>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={acceptFileTypes}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onUpload(e.target.files);
              e.target.value = "";
            }
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2 mt-3 pt-2.5 border-t border-outline-variant/60">
          {files.map((f) => {
            const isError = f.status === "error" || f.status === "empty";
            const isTruncated = f.status === "truncated";
            const isSuccess = f.status === "success" || (!f.status && !f.error);

            return (
              <div
                key={f.name}
                className={`flex items-center justify-between gap-2 p-2 rounded-lg text-[11px] font-medium transition-all ${
                  isError
                    ? "bg-red-500/10 border border-red-500/30 text-red-300"
                    : isTruncated
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                    : "bg-surface-container-low border border-outline/50 text-on-surface"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {f.status === "extracting" ? (
                    <Loader2 size={13} className="animate-spin text-primary flex-shrink-0" />
                  ) : isError ? (
                    <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
                  ) : isTruncated ? (
                    <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
                  ) : isSuccess ? (
                    <CheckCircle2 size={13} className="text-primary flex-shrink-0" />
                  ) : (
                    <FileCode size={13} className="text-text-muted flex-shrink-0" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="truncate font-semibold text-on-surface">{f.name}</span>
                      <span className="text-[10px] text-text-muted flex-shrink-0">
                        ({formatBytes(f.size)})
                      </span>
                    </div>

                    {/* Metadata line */}
                    {isError ? (
                      <p className="text-[10px] text-red-400 truncate mt-0.5">
                        {f.error || "Failed to extract content"}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
                        {f.pageCount !== undefined && f.pageCount > 0 && (
                          <span>{f.pageCount} {f.pageCount === 1 ? "page" : "pages"}</span>
                        )}
                        {f.wordCount !== undefined && f.wordCount > 0 && (
                          <span>• {f.wordCount.toLocaleString()} words</span>
                        )}
                        {f.itemCount !== undefined && f.itemCount > 0 && (
                          <span>• {f.itemCount} items</span>
                        )}
                        {isTruncated && (
                          <span className="text-amber-400">• Truncated to 100k chars</span>
                        )}
                        {f.status === "success" && (
                          <span className="text-primary/90">• Extracted</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  title="Remove file"
                  onClick={() => onRemove(f.name)}
                  className="p-1 hover:text-on-surface hover:bg-surface-container-high rounded text-text-muted transition-colors cursor-pointer flex-shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
