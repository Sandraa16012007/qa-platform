"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Save,
  FileText,
  Palette,
  GitBranch,
  FolderOpen,
  Upload,
  X,
  Check,
  CheckCircle2,
  ChevronDown,
  Zap,
  Scale,
  Layers,
  Shield,
  Eye,
  Gauge,
  PenTool,
  Search,
  Accessibility,
  Smartphone,
  Globe,
  Activity,
  Sparkles,
  RotateCw,
  Edit3,
  AlertTriangle,
  Info,
  Plus,
  Minus,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

/* ─── Types ─── */
interface UploadedFile {
  name: string;
  size: number;
  category: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

/* ─── Constants ─── */
const STEP_LABELS = ["Project Basics", "Context", "QA Preferences", "AI Understanding"];

const PRODUCT_TYPES = [
  "Web Application",
  "Mobile Application",
  "Desktop Application",
  "API",
  "SaaS",
  "Internal Tool",
  "Other",
];

const DOMAINS = [
  "EdTech",
  "Healthcare",
  "Portfolio",
  "E-commerce",
  "Finance",
  "Enterprise",
  "Productivity",
  "Social",
  "Other",
];

const QUALITY_PRIORITIES = [
  "Accessibility",
  "Performance",
  "User Experience",
  "Visual Design",
  "Security",
  "Content Quality",
  "SEO",
  "Compliance",
  "Mobile Experience",
  "Scalability",
];

const AUTOMATION_PREFS = [
  "Functional Testing",
  "Accessibility",
  "Responsive",
  "API Testing",
  "Performance",
  "Regression",
];

const HUMAN_REVIEW_CATS = [
  "UX & Usability",
  "Product Experience",
  "Visual Design",
  "Content Quality",
];

const GENERATION_STEPS = [
  "Understanding product context",
  "Processing uploaded documents",
  "Mapping user journeys",
  "Building Product QA",
  "Building Page QA",
  "Building Component QA",
  "Building Feature QA",
  "Building Release Checklist",
  "Preparing Human Review Guide",
  "Finalizing Framework",
];

const QA_COVERAGE_OPTIONS = [
  "Product QA",
  "Page QA",
  "Component QA",
  "Feature QA",
  "Accessibility",
  "Responsive",
  "Performance",
  "Human Review",
  "Visual QA",
  "Release QA",
];

/* ─── Slide animation variants ─── */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

/* ─── Progress Indicator ─── */
function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0 w-full max-w-2xl mx-auto py-4">
      {STEP_LABELS.map((label, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isFuture = i > currentStep;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-500 border ${isCompleted
                    ? "bg-primary border-primary text-on-primary-container"
                    : isCurrent
                      ? "bg-cyan-dim border-primary text-primary"
                      : "bg-surface-container border-outline text-text-muted"
                  }`}
              >
                {isCompleted ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${isCompleted
                    ? "text-primary"
                    : isCurrent
                      ? "text-on-surface"
                      : "text-text-muted"
                  }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEP_LABELS.length - 1 && (
              <div className="flex-1 h-px mx-3 mt-[-18px] relative">
                <div className="absolute inset-0 bg-outline" />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={false}
                  animate={{ width: isCompleted ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Upload Card ─── */
function UploadCard({
  icon: Icon,
  title,
  description,
  accepts,
  files,
  onUpload,
  onRemove,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accepts: string;
  files: UploadedFile[];
  onUpload: (files: FileList) => void;
  onRemove: (name: string) => void;
}) {
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
      className={`neo-border rounded-xl p-4 transition-all duration-200 ${isDragOver ? "border-primary glow-cyan" : "bg-surface hover:border-outline-variant"
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

      {/* Upload zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full border border-dashed rounded-lg py-3 px-3 flex items-center justify-center gap-2 transition-all cursor-pointer ${isDragOver
            ? "border-primary bg-cyan-dim text-primary"
            : "border-outline text-text-muted hover:border-outline-variant hover:text-on-surface-variant"
          }`}
      >
        <Upload size={14} strokeWidth={1.5} />
        <span className="text-[11px] font-medium uppercase tracking-wider">
          {accepts}
        </span>
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

      {/* Uploaded file chips */}
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

/* ─── Editable Tag List ─── */
function EditableTagList({
  items,
  onChange,
  color = "primary",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  color?: "primary" | "magenta" | "yellow";
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState("");

  const colorClasses = {
    primary: "bg-cyan-dim border-cyan/20 text-primary",
    magenta: "bg-magenta-dim border-magenta/20 text-magenta",
    yellow: "bg-yellow-dim border-yellow/20 text-yellow",
  };

  const handleAdd = () => {
    if (newTag.trim() && !items.includes(newTag.trim())) {
      onChange([...items, newTag.trim()]);
      setNewTag("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded border ${colorClasses[color]}`}
          >
            {item}
            {isEditing && (
              <button
                type="button"
                onClick={() => onChange(items.filter((i) => i !== item))}
                className="hover:text-on-surface transition-colors cursor-pointer"
              >
                <X size={9} />
              </button>
            )}
          </span>
        ))}
        {isEditing && (
          <span className="inline-flex items-center gap-1">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
              placeholder="Add..."
              className="bg-surface-container-low border border-outline rounded text-[10px] text-on-surface px-2 py-1 w-20 focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="text-primary hover:text-on-surface cursor-pointer"
            >
              <Plus size={12} />
            </button>
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setIsEditing(!isEditing)}
        className="text-[10px] text-text-muted hover:text-primary mt-1.5 flex items-center gap-1 cursor-pointer transition-colors uppercase font-semibold tracking-wider"
      >
        <Edit3 size={10} />
        {isEditing ? "Done" : "Edit"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN WIZARD COMPONENT
   ═══════════════════════════════════════════════ */
export default function NewProjectWizard() {
  const router = useRouter();

  /* ── Navigation state ── */
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  /* ── Toast state ── */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now().toString();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  /* ── Step 0: Project Basics ── */
  const [projectName, setProjectName] = useState("");
  const [productType, setProductType] = useState("");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [step0Errors, setStep0Errors] = useState<Record<string, boolean>>({});

  /* ── Step 1: Context & Assets ── */
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({
    prd: [],
    design: [],
    additional: [],
  });
  const [githubUrl, setGithubUrl] = useState("");

  /* ── Step 2: QA Preferences ── */
  const [qaDepth, setQaDepth] = useState<"quick" | "balanced" | "comprehensive">("balanced");
  const [qualityPriorities, setQualityPriorities] = useState<string[]>([
    "Accessibility",
    "Performance",
    "User Experience",
  ]);
  const [automationPrefs, setAutomationPrefs] = useState<string[]>([...AUTOMATION_PREFS]);
  const [humanReviewCats, setHumanReviewCats] = useState<string[]>([...HUMAN_REVIEW_CATS]);
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  /* ── Step 3: AI Understanding ── */
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [detectedUsers, setDetectedUsers] = useState<string[]>([]);
  const [detectedFeatures, setDetectedFeatures] = useState<string[]>([]);
  const [criticalWorkflows, setCriticalWorkflows] = useState<string[]>([]);
  const [riskAreas, setRiskAreas] = useState<string[]>([]);
  const [qaCoverage, setQaCoverage] = useState<string[]>([...QA_COVERAGE_OPTIONS]);
  const [aiReady, setAiReady] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  /* ── Step 4: Generation ── */
  const [genCompleted, setGenCompleted] = useState(0);

  /* ── File upload handler ── */
  const handleFileUpload = useCallback(
    (category: string) => (fileList: FileList) => {
      const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({
        name: f.name,
        size: f.size,
        category,
      }));
      setUploadedFiles((prev) => ({
        ...prev,
        [category]: [...(prev[category] || []), ...newFiles],
      }));
    },
    []
  );

  const handleFileRemove = useCallback(
    (category: string) => (name: string) => {
      setUploadedFiles((prev) => ({
        ...prev,
        [category]: prev[category].filter((f) => f.name !== name),
      }));
    },
    []
  );

  /* ── Step validation ── */
  const validateStep0 = useCallback(() => {
    const errors: Record<string, boolean> = {};
    if (!projectName.trim()) errors.projectName = true;
    if (!productType) errors.productType = true;
    if (!domain) errors.domain = true;
    if (!description.trim()) errors.description = true;
    setStep0Errors(errors);
    return Object.keys(errors).length === 0;
  }, [projectName, productType, domain, description]);

  /* ── Navigation ── */
  const goNext = useCallback(() => {
    if (currentStep === 0 && !validateStep0()) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    setDirection(1);
    setCurrentStep((p) => Math.min(p + 1, 3));
  }, [currentStep, validateStep0, showToast]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentStep((p) => Math.max(p - 1, 0));
  }, []);

  /* ── Simulate AI analysis when entering step 3 ── */
  useEffect(() => {
    if (currentStep === 3 && !aiReady) {
      setIsAnalyzing(true);
      const name = projectName || "Application";
      const dom = domain || "Platform";
      const timer = setTimeout(() => {
        setAiSummary(
          `${name} appears to be a ${dom.toLowerCase()} platform where users interact with core features, discover content, and build engagement. Based on the ${productType.toLowerCase() || "application"} architecture and provided context, the product focuses on delivering a seamless experience across its primary workflows.`
        );
        setDetectedUsers(["End Users", "Administrators", "Power Users", "Visitors"]);
        setDetectedFeatures([
          "Authentication",
          "Dashboard",
          "Content Management",
          "Search & Filter",
          "Notifications",
          "User Profiles",
          "Settings",
          "Analytics",
        ]);
        setCriticalWorkflows([
          "User Registration",
          "Core Feature Usage",
          "Content Creation",
          "Navigation Flow",
          "Profile Management",
          "Search & Discovery",
        ]);
        setRiskAreas([
          "Media Upload Reliability",
          "Search Accuracy",
          "Mobile Responsiveness",
          "Accessibility",
          "Large Content Rendering",
        ]);
        setIsAnalyzing(false);
        setAiReady(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [currentStep, aiReady, projectName, domain, productType]);

  /* ── Generation timeline ── */
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setGenCompleted((prev) => {
        if (prev >= GENERATION_STEPS.length) {
          clearInterval(interval);
          setTimeout(() => router.push("/qa-projects/1"), 1200);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [isGenerating, router]);

  /* ── Save Draft ── */
  const handleSaveDraft = useCallback(() => {
    const draft = {
      projectName,
      productType,
      domain,
      description,
      websiteUrl,
      githubUrl,
      qaDepth,
      qualityPriorities,
      automationPrefs,
      humanReviewCats,
      additionalInstructions,
      currentStep,
    };
    localStorage.setItem("qa-project-draft", JSON.stringify(draft));
    showToast("Draft saved successfully");
  }, [
    projectName, productType, domain, description, websiteUrl, githubUrl,
    qaDepth, qualityPriorities, automationPrefs, humanReviewCats,
    additionalInstructions, currentStep, showToast,
  ]);

  /* ── Start generation ── */
  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setGenCompleted(0);
  }, []);

  /* ── Toggle helper for arrays ── */
  const toggleItem = useCallback((list: string[], setList: (l: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }, []);

  /* ═══ GENERATION SCREEN ═══ */
  if (isGenerating) {
    return (
      <div className="flex overflow-hidden w-full">
        <Sidebar />
        <main
          className="flex-1 h-screen overflow-y-auto bg-background"
        >
          <Header />
          <div style={{ height: 64 }} />
          <div className="flex items-center justify-center h-[calc(100vh-64px)]">
            <div className="flex flex-col items-center max-w-md w-full">
              {/* Illustration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-on-surface-variant/30">
                  <rect x="10" y="16" width="60" height="48" rx="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 28H70" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="18" cy="22" r="2" fill="var(--color-primary)" />
                  <circle cx="25" cy="22" r="2" fill="var(--color-magenta)" />
                  <circle cx="32" cy="22" r="2" fill="var(--color-yellow)" />
                  <path d="M24 40H56" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M24 46H48" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                  <path d="M24 52H40" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
                </svg>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-on-surface mb-2 text-center"
              >
                Generating Your QA Framework
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-on-surface-variant text-center mb-8"
              >
                Understanding your product and building a customized quality strategy.
              </motion.p>

              {/* Timeline */}
              <div className="w-full space-y-0">
                {GENERATION_STEPS.map((step, i) => {
                  const isComplete = i < genCompleted;
                  const isCurrent = i === genCompleted;
                  return (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isCurrent || isComplete ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                      className="flex items-center gap-3 py-2"
                    >
                      {/* Line connector */}
                      <div className="flex flex-col items-center w-5">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300 ${isComplete
                              ? "bg-primary text-on-primary-container"
                              : isCurrent
                                ? "border border-primary text-primary animate-pulse"
                                : "border border-outline text-text-muted"
                            }`}
                        >
                          {isComplete ? (
                            <Check size={11} strokeWidth={3} />
                          ) : isCurrent ? (
                            <RotateCw size={10} className="animate-spin" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium transition-colors duration-300 ${isComplete
                            ? "text-primary"
                            : isCurrent
                              ? "text-on-surface"
                              : "text-text-muted"
                          }`}
                      >
                        {step}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ═══ WIZARD SHELL ═══ */
  return (
    <div className="flex overflow-hidden w-full">
      <Sidebar />
      <main
        className="flex-1 h-screen overflow-hidden"
      >
        <Header />
        <div style={{ height: 64 }} />

        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* ── Page Header ── */}
          <div className="px-6 pt-5 pb-2 flex justify-between items-start flex-shrink-0">
            <div className="space-y-1">
              <h1
                style={{ fontSize: 28, lineHeight: 1.2, letterSpacing: "-0.015em" }}
                className="font-bold text-on-surface"
              >
                New QA Project
              </h1>
              <p className="text-sm text-on-surface-variant max-w-xl">
                Provide a little context about your application and we&apos;ll design a QA framework tailored specifically to your product.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveDraft}
              className="neo-border px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-primary hover:border-primary transition-all flex items-center gap-2 rounded-lg cursor-pointer flex-shrink-0"
            >
              <Save size={14} strokeWidth={1.5} />
              Save Draft
            </motion.button>
          </div>

          {/* ── Progress Indicator ── */}
          <div className="px-6 flex-shrink-0">
            <ProgressIndicator currentStep={currentStep} />
          </div>

          {/* ── Step Content ── */}
          <div className="flex-1 min-h-0 px-6 pb-2 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {/* ═══ STEP 0: PROJECT BASICS ═══ */}
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="h-full flex flex-col"
                >
                  <div className="neo-border bg-surface rounded-xl p-5 flex-1 overflow-y-auto">
                    <div className="mb-4">
                      <h2 className="text-base font-bold text-on-surface">About Your Product</h2>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Tell us the basics about the application you&apos;d like to evaluate.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Project Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono flex items-center gap-1">
                          Project Name <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="CreativeHub"
                          value={projectName}
                          onChange={(e) => {
                            setProjectName(e.target.value);
                            if (e.target.value.trim()) setStep0Errors((p) => ({ ...p, projectName: false }));
                          }}
                          className={`w-full bg-surface-container-low border rounded-lg focus:border-primary focus:outline-none text-on-surface text-sm px-4 py-2.5 placeholder:text-text-muted/50 ${step0Errors.projectName ? "border-magenta" : "border-outline"
                            }`}
                        />
                        {step0Errors.projectName && (
                          <p className="text-[10px] text-magenta font-medium">Required field</p>
                        )}
                      </div>

                      {/* Domain */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono flex items-center gap-1">
                          Domain <span className="text-primary">*</span>
                        </label>
                        <select
                          value={domain}
                          onChange={(e) => {
                            setDomain(e.target.value);
                            if (e.target.value) setStep0Errors((p) => ({ ...p, domain: false }));
                          }}
                          className={`w-full bg-surface-container-low border rounded-lg focus:border-primary focus:outline-none text-on-surface text-sm px-4 py-2.5 cursor-pointer ${step0Errors.domain ? "border-magenta" : "border-outline"
                            } ${!domain ? "text-text-muted/50" : ""}`}
                        >
                          <option value="">Select domain...</option>
                          {DOMAINS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        {step0Errors.domain && (
                          <p className="text-[10px] text-magenta font-medium">Required field</p>
                        )}
                      </div>

                      {/* Product Type */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono flex items-center gap-1">
                          Product Type <span className="text-primary">*</span>
                        </label>
                        <select
                          value={productType}
                          onChange={(e) => {
                            setProductType(e.target.value);
                            if (e.target.value) setStep0Errors((p) => ({ ...p, productType: false }));
                          }}
                          className={`w-full bg-surface-container-low border rounded-lg focus:border-primary focus:outline-none text-on-surface text-sm px-4 py-2.5 cursor-pointer ${step0Errors.productType ? "border-magenta" : "border-outline"
                            } ${!productType ? "text-text-muted/50" : ""}`}
                        >
                          <option value="">Select type...</option>
                          {PRODUCT_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        {step0Errors.productType && (
                          <p className="text-[10px] text-magenta font-medium">Required field</p>
                        )}
                      </div>

                      {/* Website URL */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                          Website URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://yourapp.com"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          className="w-full bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface text-sm px-4 py-2.5 placeholder:text-text-muted/50"
                        />
                        <p className="text-[10px] text-text-muted">
                          Providing a live URL enables future automated analysis.
                        </p>
                      </div>

                      {/* Description — full width */}
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono flex items-center gap-1">
                          Product Description <span className="text-primary">*</span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Describe your application, what it does, who it's for, and the main problems it solves."
                          value={description}
                          onChange={(e) => {
                            setDescription(e.target.value);
                            if (e.target.value.trim()) setStep0Errors((p) => ({ ...p, description: false }));
                          }}
                          className={`w-full bg-surface-container-low border rounded-lg focus:border-primary focus:outline-none text-on-surface text-sm px-4 py-2.5 resize-none placeholder:text-text-muted/50 ${step0Errors.description ? "border-magenta" : "border-outline"
                            }`}
                        />
                        {step0Errors.description && (
                          <p className="text-[10px] text-magenta font-medium">Required field</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom buttons */}
                  <div className="flex justify-end py-3 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={goNext}
                      className="bg-primary text-on-primary-container px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all rounded-lg cursor-pointer"
                    >
                      Continue
                      <ArrowRight size={14} strokeWidth={2} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 1: CONTEXT & ASSETS ═══ */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="h-full flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto">
                    <div className="mb-4">
                      <h2 className="text-base font-bold text-on-surface">Additional Context</h2>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Upload supporting documents to help AI better understand your product. These are optional but improve framework quality.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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

                      {/* GitHub Repository — URL input */}
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
                          className="w-full bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface text-sm px-4 py-2.5 placeholder:text-text-muted/50"
                        />
                        <p className="text-[10px] text-text-muted mt-1.5">
                          Direct integration can be added later.
                        </p>
                      </div>

                      <UploadCard
                        icon={FolderOpen}
                        title="Additional Documents"
                        description="Architecture, user flows, research, etc."
                        accepts="Any document"
                        files={uploadedFiles.additional}
                        onUpload={handleFileUpload("additional")}
                        onRemove={handleFileRemove("additional")}
                      />
                    </div>
                  </div>

                  {/* Bottom buttons */}
                  <div className="flex justify-between py-3 flex-shrink-0">
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
                      Continue
                      <ArrowRight size={14} strokeWidth={2} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 2: QA PREFERENCES ═══ */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="h-full flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    <div>
                      <h2 className="text-base font-bold text-on-surface">Quality Preferences</h2>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Tell us how you&apos;d like the QA framework to be generated.
                      </p>
                    </div>

                    {/* QA Depth */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2 block">
                        QA Depth
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {([
                          { key: "quick" as const, label: "Quick", desc: "Essential quality checks only.", icon: Zap, accent: "yellow" },
                          { key: "balanced" as const, label: "Balanced", desc: "Recommended for most applications.", icon: Scale, accent: "primary" },
                          { key: "comprehensive" as const, label: "Comprehensive", desc: "Maximum coverage with deeper edge-case analysis.", icon: Layers, accent: "magenta" },
                        ]).map((opt) => {
                          const isActive = qaDepth === opt.key;
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => setQaDepth(opt.key)}
                              className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${isActive
                                  ? opt.accent === "primary"
                                    ? "neo-border-primary bg-cyan-dim"
                                    : opt.accent === "magenta"
                                      ? "border-magenta bg-magenta-dim"
                                      : "border-yellow bg-yellow-dim"
                                  : "neo-border hover:border-outline-variant"
                                }`}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <Icon
                                  size={14}
                                  strokeWidth={1.5}
                                  className={
                                    isActive
                                      ? opt.accent === "primary"
                                        ? "text-primary"
                                        : opt.accent === "magenta"
                                          ? "text-magenta"
                                          : "text-yellow"
                                      : "text-text-muted"
                                  }
                                />
                                <span className={`text-xs font-bold ${isActive ? "text-on-surface" : "text-on-surface-variant"}`}>
                                  {opt.label}
                                </span>
                                {opt.key === "balanced" && (
                                  <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-text-muted leading-relaxed">{opt.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quality Priorities */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2 block">
                        Quality Priorities
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {QUALITY_PRIORITIES.map((p) => {
                          const isSelected = qualityPriorities.includes(p);
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => toggleItem(qualityPriorities, setQualityPriorities, p)}
                              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${isSelected
                                  ? "bg-cyan-dim border-cyan/30 text-primary"
                                  : "bg-surface-container border-outline text-text-muted hover:text-on-surface-variant hover:border-outline-variant"
                                }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Automation & Human Review — side by side */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Automation Preferences */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2 block">
                          Automation Preferences
                        </label>
                        <div className="space-y-1.5">
                          {AUTOMATION_PREFS.map((item) => {
                            const checked = automationPrefs.includes(item);
                            return (
                              <label
                                key={item}
                                className="flex items-center gap-2.5 cursor-pointer group"
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleItem(automationPrefs, setAutomationPrefs, item)}
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${checked
                                      ? "bg-primary border-primary"
                                      : "border-outline group-hover:border-outline-variant"
                                    }`}
                                >
                                  {checked && <Check size={10} strokeWidth={3} className="text-on-primary-container" />}
                                </button>
                                <span className={`text-xs ${checked ? "text-on-surface" : "text-on-surface-variant"}`}>
                                  {item}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Human Review Categories */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2 block">
                          Human Review Categories
                        </label>
                        <div className="space-y-1.5">
                          {HUMAN_REVIEW_CATS.map((item) => {
                            const checked = humanReviewCats.includes(item);
                            return (
                              <label
                                key={item}
                                className="flex items-center gap-2.5 cursor-pointer group"
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleItem(humanReviewCats, setHumanReviewCats, item)}
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${checked
                                      ? "bg-primary border-primary"
                                      : "border-outline group-hover:border-outline-variant"
                                    }`}
                                >
                                  {checked && <Check size={10} strokeWidth={3} className="text-on-primary-container" />}
                                </button>
                                <span className={`text-xs ${checked ? "text-on-surface" : "text-on-surface-variant"}`}>
                                  {item}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Additional Instructions */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-1.5 block">
                        Additional Instructions
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Example: Prioritize accessibility, onboarding experience, and mobile usability. Ignore payment workflows for this release."
                        value={additionalInstructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface text-sm px-4 py-2.5 resize-none placeholder:text-text-muted/50"
                      />
                    </div>
                  </div>

                  {/* Bottom buttons */}
                  <div className="flex justify-between py-3 flex-shrink-0">
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
                      Continue
                      <ArrowRight size={14} strokeWidth={2} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 3: AI PRODUCT UNDERSTANDING ═══ */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="h-full flex flex-col"
                >
                  {isAnalyzing ? (
                    /* Analyzing spinner */
                    <div className="flex-1 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                        <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
                          Analyzing your product...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                      <div>
                        <h2 className="text-base font-bold text-on-surface">AI Product Understanding</h2>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Based on the information provided, we&apos;ve analyzed your product and inferred the following. Review and edit anything before generating your QA framework.
                        </p>
                      </div>

                      {/* Two-column AI analysis */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Application Summary */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="neo-border bg-surface rounded-xl p-4 col-span-2"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                              Application Summary
                            </h3>
                            <button
                              type="button"
                              onClick={() => setIsEditingSummary(!isEditingSummary)}
                              className="text-[10px] text-text-muted hover:text-primary flex items-center gap-1 cursor-pointer transition-colors uppercase font-semibold tracking-wider"
                            >
                              <Edit3 size={10} />
                              {isEditingSummary ? "Done" : "Edit"}
                            </button>
                          </div>
                          {isEditingSummary ? (
                            <textarea
                              rows={3}
                              value={aiSummary}
                              onChange={(e) => setAiSummary(e.target.value)}
                              className="w-full bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface text-sm px-3 py-2 resize-none"
                            />
                          ) : (
                            <p className="text-sm text-on-surface-variant leading-relaxed">{aiSummary}</p>
                          )}
                        </motion.div>

                        {/* Detected Users */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="neo-border bg-surface rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                              Detected Users
                            </h3>
                            <span className="text-[9px] bg-cyan-dim border border-cyan/20 text-primary px-1.5 py-0.5 rounded font-bold">
                              95% Confidence
                            </span>
                          </div>
                          <EditableTagList items={detectedUsers} onChange={setDetectedUsers} />
                        </motion.div>

                        {/* Detected Features */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="neo-border bg-surface rounded-xl p-4"
                        >
                          <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2">
                            Detected Features
                          </h3>
                          <EditableTagList items={detectedFeatures} onChange={setDetectedFeatures} />
                        </motion.div>

                        {/* Critical Workflows */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="neo-border bg-surface rounded-xl p-4"
                        >
                          <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2">
                            Critical Workflows
                          </h3>
                          <EditableTagList items={criticalWorkflows} onChange={setCriticalWorkflows} color="magenta" />
                        </motion.div>

                        {/* Potential Risk Areas */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="neo-border bg-surface rounded-xl p-4"
                        >
                          <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2">
                            Potential Risk Areas
                          </h3>
                          <EditableTagList items={riskAreas} onChange={setRiskAreas} color="yellow" />
                        </motion.div>
                      </div>

                      {/* Recommended QA Coverage */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="neo-border bg-surface rounded-xl p-4"
                      >
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-2">
                          Recommended QA Coverage
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {QA_COVERAGE_OPTIONS.map((opt) => {
                            const isSelected = qaCoverage.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => toggleItem(qaCoverage, setQaCoverage, opt)}
                                className={`px-2.5 py-1 text-[10px] font-semibold rounded border transition-all cursor-pointer ${isSelected
                                    ? "bg-cyan-dim border-cyan/30 text-primary"
                                    : "bg-surface-container border-outline text-text-muted hover:border-outline-variant"
                                  }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>

                      {/* Estimated Framework */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="neo-border bg-surface rounded-xl p-4"
                      >
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-3">
                          Estimated Framework
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { label: "QA Checks", value: "~450", icon: Activity },
                            { label: "Automation", value: "~78%", icon: Zap },
                            { label: "Human Review", value: "~22%", icon: Eye },
                            { label: "Generation Time", value: "~30s", icon: RotateCw },
                          ].map((m) => {
                            const MIcon = m.icon;
                            return (
                              <div
                                key={m.label}
                                className="bg-surface-container-low border border-outline rounded-lg p-3 text-center"
                              >
                                <MIcon size={14} strokeWidth={1.5} className="text-primary mx-auto mb-1.5" />
                                <p className="text-sm font-bold text-on-surface font-mono">{m.value}</p>
                                <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">
                                  {m.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Bottom buttons */}
                  {!isAnalyzing && (
                    <div className="flex justify-between py-3 flex-shrink-0">
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
                        onClick={handleGenerate}
                        className="bg-primary text-on-primary-container px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all rounded-lg cursor-pointer"
                      >
                        <Sparkles size={14} strokeWidth={2} />
                        Generate QA Framework
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-3 rounded-lg neo-border bg-surface shadow-2xl flex items-center gap-3 text-xs border-l-4 ${toast.type === "success"
                  ? "border-l-primary text-on-surface"
                  : toast.type === "error"
                    ? "border-l-magenta text-on-surface"
                    : "border-l-yellow text-on-surface"
                }`}
            >
              <Info size={14} className={toast.type === "success" ? "text-primary" : "text-magenta"} />
              <span className="flex-1">{toast.message}</span>
              <button
                onClick={() => setToasts((p) => p.filter((t) => t.id !== toast.id))}
                className="text-text-muted hover:text-on-surface cursor-pointer"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
