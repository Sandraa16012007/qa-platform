"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft, Info, X, CheckCircle2 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { useUiStore } from "../../stores/useUiStore";
import { useAiUnderstandingStore } from "../../stores/useAiUnderstandingStore";

import Step0Basics from "./components/Step0Basics";
import Step1Context from "./components/Step1Context";
import Step2Preferences from "./components/Step2Preferences";
import Step3AiUnderstanding, { QA_COVERAGE_OPTIONS } from "./components/Step3AiUnderstanding";
import Step4Generation, { GENERATION_STEPS } from "./components/Step4Generation";
import { UploadedFile } from "./components/UploadCard";

const STEP_LABELS = ["Project Basics", "Context", "QA Preferences", "AI Understanding"];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
  }),
};

export default function NewProjectWizard() {
  const router = useRouter();

  /* ── Navigation state (global UI store) ── */
  const currentStep = useUiStore((state) => state.wizardStep);
  const direction = useUiStore((state) => state.wizardDirection);
  const setCurrentStep = useUiStore((state) => state.setWizardStep);
  const goWizardNext = useUiStore((state) => state.goWizardNext);
  const goWizardPrev = useUiStore((state) => state.goWizardPrev);
  const isGenerating = useUiStore((state) => state.isGeneratingFramework);
  const setIsGenerating = useUiStore((state) => state.setIsGeneratingFramework);

  /* ── Toast state (global UI store) ── */
  const toasts = useUiStore((state) => state.toasts);
  const showToast = useUiStore((state) => state.showToast);
  const removeToast = useUiStore((state) => state.removeToast);

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
  const [automationPrefs, setAutomationPrefs] = useState<string[]>([
    "Automated E2E specs",
    "Visual regression checks",
    "Accessibility DOM scans",
  ]);
  const [humanReviewCats, setHumanReviewCats] = useState<string[]>([
    "Usability & Flow Intuition",
    "Visual Design Polish",
    "Content Tone & Messaging",
  ]);
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  /* ── Step 3: AI Understanding (global store — shared with Project Overview tab) ── */
  const clearAiUnderstandingProjectContext = useAiUnderstandingStore(
    (state) => state.clearProjectContext
  );
  useEffect(() => {
    // This store is shared with the Project Overview tab. Clearing the
    // persistence target here ensures wizard edits (no saved project yet)
    // never accidentally overwrite a previously-viewed project's saved data.
    clearAiUnderstandingProjectContext();
  }, [clearAiUnderstandingProjectContext]);

  const isAnalyzing = useAiUnderstandingStore((state) => state.isAnalyzing);
  const setIsAnalyzing = useAiUnderstandingStore((state) => state.setIsAnalyzing);
  const aiSummary = useAiUnderstandingStore((state) => state.summary);
  const setAiSummary = useAiUnderstandingStore((state) => state.updateSummary);
  const detectedUsers = useAiUnderstandingStore((state) => state.detectedUsers);
  const setDetectedUsers = useAiUnderstandingStore((state) => state.updateUsers);
  const detectedFeatures = useAiUnderstandingStore((state) => state.detectedFeatures);
  const setDetectedFeatures = useAiUnderstandingStore((state) => state.updateFeatures);
  const criticalWorkflows = useAiUnderstandingStore((state) => state.criticalWorkflows);
  const setCriticalWorkflows = useAiUnderstandingStore((state) => state.updateWorkflows);
  const riskAreas = useAiUnderstandingStore((state) => state.riskAreas);
  const setRiskAreas = useAiUnderstandingStore((state) => state.updateRisks);
  const qaCoverage = useAiUnderstandingStore((state) => state.qaCoverage);
  const setQaCoverage = useAiUnderstandingStore((state) => state.setQaCoverage);
  const isEditingSummary = useAiUnderstandingStore((state) => state.isEditingSummary);
  const setIsEditingSummary = useAiUnderstandingStore((state) => state.setIsEditingSummary);
  const [aiReady, setAiReady] = useState(false);

  // Seed default QA coverage selection once on mount
  useEffect(() => {
    if (qaCoverage.length === 0) {
      setQaCoverage([...QA_COVERAGE_OPTIONS]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    goWizardNext();
  }, [currentStep, validateStep0, showToast, goWizardNext]);

  const goPrev = useCallback(() => {
    goWizardPrev();
  }, [goWizardPrev]);

  /* ── Simulate AI analysis when entering step 3 ── */
  useEffect(() => {
    if (currentStep === 3 && !aiReady) {
      setIsAnalyzing(true);
      const name = projectName || "Application";
      const dom = domain || "Platform";
      const timer = setTimeout(() => {
        setAiSummary(
          `${name} is a ${dom.toLowerCase()} platform where users interact with core features, discover content, and build engagement. Based on the ${productType.toLowerCase() || "application"} architecture, the product focuses on delivering a seamless experience.`
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
  }, []);

  /* ── If generating, render generation screen ── */
  if (isGenerating) {
    return <Step4Generation genCompleted={genCompleted} />;
  }

  return (
    <div className="flex overflow-hidden w-full bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 h-screen overflow-hidden flex flex-col">
        <Header />
        <div style={{ height: 64 }} />

        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* Header Bar */}
          <div className="px-6 pt-5 pb-2 flex justify-between items-start flex-shrink-0">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-on-surface">New QA Project</h1>
              <p className="text-xs text-on-surface-variant max-w-xl">
                Configure your product parameters to automatically generate a tailored QA framework.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="neo-border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-all rounded-lg cursor-pointer"
              >
                <Save size={14} />
                Save Draft
              </button>
              <Link href="/qa-projects">
                <button className="neo-border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-all rounded-lg cursor-pointer">
                  Cancel
                </button>
              </Link>
            </div>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="px-6 py-3 flex-shrink-0">
            <div className="flex items-center justify-between max-w-2xl">
              {STEP_LABELS.map((label, idx) => {
                const isActive = idx === currentStep;
                const isDone = idx < currentStep;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isDone) {
                          setCurrentStep(idx);
                        }
                      }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all ${
                        isActive
                          ? "bg-primary text-on-primary-container glow-cyan"
                          : isDone
                          ? "bg-cyan-dim border border-cyan/30 text-primary cursor-pointer"
                          : "bg-surface-container border border-outline text-text-muted"
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={14} /> : idx + 1}
                    </button>
                    <span
                      className={`text-xs font-semibold uppercase font-mono ${
                        isActive
                          ? "text-on-surface"
                          : isDone
                          ? "text-primary"
                          : "text-text-muted"
                      }`}
                    >
                      {label}
                    </span>
                    {idx < STEP_LABELS.length - 1 && (
                      <div className="w-8 h-px bg-outline-variant mx-2 hidden sm:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Form Container */}
          <div className="px-6 pb-6 flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="h-full flex flex-col neo-border bg-surface p-6 rounded-xl overflow-hidden"
                >
                  <Step0Basics
                    projectName={projectName}
                    setProjectName={setProjectName}
                    productType={productType}
                    setProductType={setProductType}
                    domain={domain}
                    setDomain={setDomain}
                    description={description}
                    setDescription={setDescription}
                    websiteUrl={websiteUrl}
                    setWebsiteUrl={setWebsiteUrl}
                    step0Errors={step0Errors}
                    goNext={goNext}
                  />
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="h-full flex flex-col neo-border bg-surface p-6 rounded-xl overflow-hidden"
                >
                  <Step1Context
                    uploadedFiles={uploadedFiles}
                    handleFileUpload={handleFileUpload}
                    handleFileRemove={handleFileRemove}
                    githubUrl={githubUrl}
                    setGithubUrl={setGithubUrl}
                    goNext={goNext}
                    goPrev={goPrev}
                  />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="h-full flex flex-col neo-border bg-surface p-6 rounded-xl overflow-hidden"
                >
                  <Step2Preferences
                    qaDepth={qaDepth}
                    setQaDepth={setQaDepth}
                    qualityPriorities={qualityPriorities}
                    setQualityPriorities={setQualityPriorities}
                    automationPrefs={automationPrefs}
                    setAutomationPrefs={setAutomationPrefs}
                    humanReviewCats={humanReviewCats}
                    setHumanReviewCats={setHumanReviewCats}
                    additionalInstructions={additionalInstructions}
                    setAdditionalInstructions={setAdditionalInstructions}
                    goNext={goNext}
                    goPrev={goPrev}
                  />
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="h-full flex flex-col neo-border bg-surface p-6 rounded-xl overflow-hidden"
                >
                  <Step3AiUnderstanding
                    isAnalyzing={isAnalyzing}
                    aiSummary={aiSummary}
                    setAiSummary={setAiSummary}
                    isEditingSummary={isEditingSummary}
                    setIsEditingSummary={setIsEditingSummary}
                    detectedUsers={detectedUsers}
                    setDetectedUsers={setDetectedUsers}
                    detectedFeatures={detectedFeatures}
                    setDetectedFeatures={setDetectedFeatures}
                    criticalWorkflows={criticalWorkflows}
                    setCriticalWorkflows={setCriticalWorkflows}
                    riskAreas={riskAreas}
                    setRiskAreas={setRiskAreas}
                    qaCoverage={qaCoverage}
                    setQaCoverage={setQaCoverage}
                    goPrev={goPrev}
                    handleGenerate={handleGenerate}
                  />
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
              className={`p-3 rounded-lg neo-border bg-surface shadow-2xl flex items-center gap-3 text-xs border-l-4 ${
                toast.type === "success"
                  ? "border-l-primary text-on-surface"
                  : toast.type === "error"
                  ? "border-l-magenta text-on-surface"
                  : "border-l-yellow text-on-surface"
              }`}
            >
              <Info size={14} className={toast.type === "success" ? "text-primary" : "text-magenta"} />
              <span className="flex-1">{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
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
