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
import { safeGenerateJSON } from "../../lib/gemini";
import { useFrameworkStore } from "../../stores/useFrameworkStore";
import { useHumanReviewStore } from "../../stores/useHumanReviewStore";
import { QaCheck, HumanReviewItem } from "../../types";

interface AiUnderstandingGenResult {
  summary: string;
  detectedUsers: string[];
  detectedFeatures: string[];
  criticalWorkflows: string[];
  riskAreas: string[];
  qaCoverage: string[];
}

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

  /* ── Derived Framework Metrics ── */
  const [estimatedChecks, setEstimatedChecks] = useState(450);
  const [estimatedAutomation, setEstimatedAutomation] = useState(78);
  const [estimatedHumanReview, setEstimatedHumanReview] = useState(22);

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

  /* ── Calculate Derived Metrics from Understanding & QA Depth ── */
  const calculateDerivedMetrics = useCallback(
    (
      depth: "quick" | "balanced" | "comprehensive",
      featuresCount: number,
      workflowsCount: number,
      autoPrefsCount: number,
      humanCatsCount: number
    ) => {
      const checks = depth === "quick" ? 30 : depth === "comprehensive" ? 60 : 45;

      const depthAutoBase = depth === "quick" ? 85 : depth === "comprehensive" ? 65 : 75;
      const autoTotal = autoPrefsCount + humanCatsCount || 1;
      const autoRatio = Math.round((autoPrefsCount / autoTotal) * 100);
      const autoPct = Math.min(90, Math.max(50, Math.round((depthAutoBase + autoRatio) / 2)));
      const humanPct = 100 - autoPct;

      setEstimatedChecks(checks);
      setEstimatedAutomation(autoPct);
      setEstimatedHumanReview(humanPct);
    },
    []
  );

  /* ── Generate AI Product Understanding via Gemini ── */
  useEffect(() => {
    if (currentStep === 3 && !aiReady) {
      let isCancelled = false;

      const runAiAnalysis = async () => {
        setIsAnalyzing(true);

        const prompt = `
Analyze the following product parameters to generate a structured QA Product Understanding JSON.

Product Context:
- Project Name: ${projectName || "Unnamed Application"}
- Product Type: ${productType || "Web Application"}
- Domain: ${domain || "Software Service"}
- Description: ${description || "Application for digital users"}
- QA Depth: ${qaDepth}
- Quality Priorities: ${qualityPriorities.join(", ") || "General Quality"}
- Automation Preferences: ${automationPrefs.join(", ") || "Automated testing"}
- Human Review Preferences: ${humanReviewCats.join(", ") || "Usability"}
- Additional Instructions: ${additionalInstructions || "None"}

Return a single strict JSON object matching this structure:
{
  "summary": "Concise 2-3 sentence overview of application and QA strategy focus",
  "detectedUsers": ["List of 3-5 target user roles"],
  "detectedFeatures": ["List of 6-8 core product features"],
  "criticalWorkflows": ["List of 4-6 critical user workflows"],
  "riskAreas": ["List of 4-5 high-priority technical/functional risk areas"],
  "qaCoverage": ["3-6 recommended coverage items chosen from: Product QA (High-level architecture & brand), Page QA (Per-page layout, specs & responsive), Component QA (Design system tokens & states), Feature QA (User workflows & state trees), Accessibility QA (WCAG 2.1 AA compliance), UX & Content QA (Tone, microcopy & usability)"]
}
`;

        const res = await safeGenerateJSON<AiUnderstandingGenResult>({
          prompt,
          systemInstruction:
            "You are a Senior Quality Architect. Produce concise, highly accurate product QA analysis in strict JSON only.",
          setLoading: setIsAnalyzing,
          temperature: 0.2,
        });

        if (isCancelled) return;

        if (res.success && res.data) {
          const d = res.data;
          setAiSummary(d.summary || `${projectName || "Application"} QA Analysis.`);
          setDetectedUsers(d.detectedUsers || ["End Users", "Administrators"]);
          setDetectedFeatures(d.detectedFeatures || ["Authentication", "Dashboard"]);
          setCriticalWorkflows(d.criticalWorkflows || ["User Registration", "Core Flow"]);
          setRiskAreas(d.riskAreas || ["Data Reliability", "Performance"]);
          if (d.qaCoverage && d.qaCoverage.length > 0) {
            setQaCoverage(d.qaCoverage);
          }

          calculateDerivedMetrics(
            qaDepth,
            d.detectedFeatures?.length || 6,
            d.criticalWorkflows?.length || 4,
            automationPrefs.length,
            humanReviewCats.length
          );
        } else {
          showToast(res.error || "Gemini API error. Falling back to default analysis.", "warning");
          setAiSummary(
            `${projectName || "Application"} is a ${domain.toLowerCase() || "digital"} product (${productType.toLowerCase() || "web app"}). Focuses on delivering reliable workflows and seamless user experience.`
          );
          setDetectedUsers(["End Users", "Administrators", "Power Users", "Visitors"]);
          setDetectedFeatures([
            "Authentication",
            "Dashboard",
            "Content Management",
            "Search & Filter",
            "Notifications",
            "Settings",
          ]);
          setCriticalWorkflows([
            "User Registration",
            "Core Feature Usage",
            "Content Creation",
            "Navigation Flow",
          ]);
          setRiskAreas([
            "Media Upload Reliability",
            "Mobile Responsiveness",
            "Accessibility",
            "Data Validation",
          ]);
          calculateDerivedMetrics(qaDepth, 6, 4, automationPrefs.length, humanReviewCats.length);
        }

        setAiReady(true);
      };

      runAiAnalysis();

      return () => {
        isCancelled = true;
      };
    }
  }, [
    currentStep,
    aiReady,
    projectName,
    domain,
    productType,
    description,
    qaDepth,
    qualityPriorities,
    automationPrefs,
    humanReviewCats,
    additionalInstructions,
    setIsAnalyzing,
    setAiSummary,
    setDetectedUsers,
    setDetectedFeatures,
    setCriticalWorkflows,
    setRiskAreas,
    setQaCoverage,
    calculateDerivedMetrics,
    showToast,
  ]);

  /* ── Gemini QA Framework Generation ── */
  useEffect(() => {
    if (!isGenerating) return;
    let isCancelled = false;

    const runFrameworkGeneration = async () => {
      const targetCount = qaDepth === "quick" ? 30 : qaDepth === "comprehensive" ? 60 : 45;

      const prompt = `
Generate a tailored, production-grade QA Testing Framework for the following application context.

Product Parameters:
- Name: ${projectName || "Unnamed Project"}
- Type: ${productType || "Web Application"}
- Domain: ${domain || "Software"}
- Description: ${description || "Application platform"}

AI Product Understanding (User Reviewed):
- Application Summary: ${aiSummary}
- Target Users: ${detectedUsers.join(", ")}
- Core Features: ${detectedFeatures.join(", ")}
- Critical Workflows: ${criticalWorkflows.join(", ")}
- Risk Areas: ${riskAreas.join(", ")}
- Selected QA Coverage: ${qaCoverage.join(", ")}

Testing Preferences:
- Target QA Depth: ${qaDepth} (Must generate approximately ${targetCount} checks)
- Quality Priorities: ${qualityPriorities.join(", ")}
- Automation Preferences: ${automationPrefs.join(", ")}
- Human Review Preferences: ${humanReviewCats.join(", ")}
- Additional Instructions: ${additionalInstructions || "None"}

Requirements:
Return a single JSON object matching:
{
  "checks": [
    {
      "id": "check-1",
      "level": "Product QA",
      "pageName": "Dashboard",
      "category": "Usability and product experience",
      "title": "Check Title",
      "description": "Verification description",
      "expectedBehavior": "Expected result or acceptance criterion",
      "notes": "Testing notes or spec guidance",
      "automation": "Human Review",
      "priority": "High",
      "status": "Not Started",
      "type": "Usability"
    }
  ]
}
Generate approximately ${targetCount} items evenly distributed across the 5 QA levels ("Product QA", "Page QA", "Component QA", "Feature QA", "Release QA").
IMPORTANT Rules:
1. "category" MUST be strictly one of: ["Navigation", "Forms", "Accessibility", "Visual Design", "Usability and product experience", "Responsive", "Performance", "Security", "Authentication", "Validation", "Error Handling", "Content", "Notifications", "Search", "Filters", "Dashboard", "Tables", "Media", "SEO"].
2. "pageName": Infer realistic page names based on description and detected features (e.g. "Login Page", "Dashboard", "Search Page", "Settings Page", "Overview Page").
3. "automation": Either "Automated" or "Human Review". Place special emphasis on setting UX, Usability, Visual Polish, Brand Tone, Microcopy, and Product Experience checks to "Human Review".
4. "priority": One of ["Critical", "High", "Medium", "Low"].
5. "status": "Not Started".
`;

      const res = await safeGenerateJSON<{ checks: Array<any> }>({
        prompt,
        systemInstruction:
          "You are a Senior Principal QA Architect. Produce a detailed QA testing framework array in strict JSON format only.",
        temperature: 0.2,
      });

      if (isCancelled) return;

      const allowedCategories = [
        "Navigation", "Forms", "Accessibility", "Visual Design", "Usability and product experience",
        "Responsive", "Performance", "Security", "Authentication", "Validation", "Error Handling",
        "Content", "Notifications", "Search", "Filters", "Dashboard", "Tables", "Media", "SEO"
      ];
      const allowedLevels: Array<QaCheck["level"]> = [
        "Product QA", "Page QA", "Component QA", "Feature QA", "Release QA"
      ];

      let generatedChecks: QaCheck[] = [];

      if (res.success && res.data && Array.isArray(res.data.checks) && res.data.checks.length > 0) {
        generatedChecks = res.data.checks.map((item, idx) => {
          const isHuman =
            item.automation === "Human Review" ||
            item.category?.toLowerCase().includes("usability") ||
            item.category?.toLowerCase().includes("visual") ||
            item.category?.toLowerCase().includes("ux") ||
            item.title?.toLowerCase().includes("experience");

          return {
            id: item.id || `gen-check-${idx + 1}`,
            title: item.title || `Verification check ${idx + 1}`,
            level: allowedLevels.includes(item.level) ? item.level : allowedLevels[idx % allowedLevels.length],
            pageName: item.pageName || "Overview Page",
            category: allowedCategories.includes(item.category) ? item.category : "Usability and product experience",
            priority: (["Critical", "High", "Medium", "Low"].includes(item.priority) ? item.priority : "Medium") as QaCheck["priority"],
            status: "Not Started",
            type: item.type || item.category || "Functional",
            automation: isHuman ? "Human Review" : "Automated",
            description: item.description || "Verify expected feature behavior and state transitions.",
            expectedBehavior: item.expectedBehavior || "Component behaves according to UX and functional specifications.",
            notes: item.notes || "Execute testing spec or manual review.",
          };
        });
      } else {
        showToast("Using built-in QA framework template checks.", "warning");
        const defaultPages = ["Login Page", "Dashboard", "Search Page", "Settings Page", "User Profile"];
        for (let i = 0; i < targetCount; i++) {
          const isHuman = i % 3 === 0 || i % 4 === 0;
          const lvl = allowedLevels[i % allowedLevels.length];
          const cat = allowedCategories[i % allowedCategories.length];
          const pg = defaultPages[i % defaultPages.length];
          generatedChecks.push({
            id: `gen-check-${i + 1}`,
            title: `${cat} verification for ${pg}`,
            level: lvl,
            pageName: pg,
            category: cat,
            priority: i % 5 === 0 ? "Critical" : i % 2 === 0 ? "High" : "Medium",
            status: "Not Started",
            type: cat,
            automation: isHuman ? "Human Review" : "Automated",
            description: `Verify ${cat.toLowerCase()} behavior and responsive compliance on ${pg}.`,
            expectedBehavior: `Expected ${cat.toLowerCase()} flow executes without errors.`,
            notes: `Perform automated assertion or human usability check.`,
          });
        }
      }

      // 1. Populate Framework Store
      useFrameworkStore.setState({ checks: generatedChecks, currentProjectId: "1" });

      // 2. Populate Human Reviews Store (only framework items where automation === "Human Review")
      const humanReviews: HumanReviewItem[] = generatedChecks
        .filter((c) => c.automation === "Human Review")
        .map((c, idx) => ({
          id: `hr-${c.id || idx}`,
          checkId: c.id,
          title: c.title,
          level: c.level,
          category: c.category,
          priority: c.priority,
          status: "Needs Review",
          automation: "Human Review",
          description: c.description,
          expectedBehavior: c.expectedBehavior,
          notes: c.notes,
        }));

      useHumanReviewStore.setState({ humanReviews, currentProjectId: "1" });

      // Step animation
      for (let s = 0; s <= GENERATION_STEPS.length; s++) {
        if (isCancelled) return;
        setGenCompleted(s);
        await new Promise((r) => setTimeout(r, 200));
      }

      router.push("/qa-projects/1");
    };

    runFrameworkGeneration();

    return () => {
      isCancelled = true;
    };
  }, [
    isGenerating,
    projectName,
    productType,
    domain,
    description,
    aiSummary,
    detectedUsers,
    detectedFeatures,
    criticalWorkflows,
    riskAreas,
    qaCoverage,
    qaDepth,
    qualityPriorities,
    automationPrefs,
    humanReviewCats,
    additionalInstructions,
    router,
    showToast,
  ]);

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
                    estimatedChecks={estimatedChecks}
                    estimatedAutomation={estimatedAutomation}
                    estimatedHumanReview={estimatedHumanReview}
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
