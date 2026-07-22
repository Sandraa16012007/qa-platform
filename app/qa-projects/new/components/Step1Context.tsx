"use client";

import { motion } from "framer-motion";
import { FileText, Palette, FolderOpen, GitBranch, ArrowRight, ArrowLeft } from "lucide-react";
import UploadCard, { UploadedFile } from "./UploadCard";

interface Step1ContextProps {
  uploadedFiles: Record<string, UploadedFile[]>;
  handleFileUpload: (cat: string) => (files: FileList) => void;
  handleFileRemove: (cat: string) => (name: string) => void;
  githubUrl: string;
  setGithubUrl: (val: string) => void;
  goNext: () => void;
  goPrev: () => void;
}

export default function Step1Context({
  uploadedFiles,
  handleFileUpload,
  handleFileRemove,
  githubUrl,
  setGithubUrl,
  goNext,
  goPrev,
}: Step1ContextProps) {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-4 overflow-y-auto pr-1">
        <div>
          <h2 className="text-base font-bold text-on-surface">Additional Context</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Upload supporting documents to help AI better understand your product. These are optional but improve framework quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UploadCard
            icon={FileText}
            title="Product Requirements (PRD)"
            description="PDF, DOCX, Markdown"
            accepts="PDF / DOCX / MD"
            files={uploadedFiles.prd}
            onUpload={handleFileUpload("prd")}
            onRemove={handleFileRemove("prd")}
          />

          <UploadCard
            icon={Palette}
            title="Design Files"
            description="Figma export, PDF, Images, ZIP"
            accepts="Figma / PDF / IMG / ZIP"
            files={uploadedFiles.design}
            onUpload={handleFileUpload("design")}
            onRemove={handleFileRemove("design")}
          />

          {/* GitHub Repository */}
          <div className="neo-border rounded-xl p-4 bg-surface hover:border-outline-variant transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <GitBranch size={16} strokeWidth={1.5} className="text-primary" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-on-surface">GitHub Repository</h4>
                <p className="text-[11px] text-text-muted mt-0.5">Paste your repository URL</p>
              </div>
            </div>
            <input
              type="url"
              placeholder="https://github.com/company/project"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface text-sm px-4 py-2.5 placeholder:text-text-muted/50 font-medium"
            />
            <p className="text-[10px] text-text-muted mt-1.5">Direct integration can be added later.</p>
          </div>

          <UploadCard
            icon={FolderOpen}
            title="Additional Specification Assets"
            description="API Specs, Swagger, Postman"
            accepts="JSON / YAML / PDF"
            files={uploadedFiles.additional}
            onUpload={handleFileUpload("additional")}
            onRemove={handleFileRemove("additional")}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4 flex-shrink-0 border-t border-outline-variant mt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goPrev}
          className="neo-border px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-on-surface flex items-center gap-2 transition-all rounded-lg cursor-pointer"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Previous
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goNext}
          className="bg-primary text-on-primary-container px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all rounded-lg cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight size={14} strokeWidth={2} />
        </motion.button>
      </div>
    </div>
  );
}
