"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { useProjectStore } from "../../stores/useProjectStore";
import { createProjectAfterGeneration } from "../../lib/services/projects";
import { QaCheck, HumanReviewItem, Project } from "../../types";

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
  // Guards the generation effect below against firing more than once for a
  // single "Generate" click. Without this, the effect's large dependency
  // array (plus React re-running effects twice on mount in development)
  // could kick off createProjectAfterGeneration() a second time before the
  // first call finished, silently creating two duplicate projects in
  // Supabase for the same wizard input. A ref (rather than state) is used
  // so the lock survives re-renders without itself triggering one.
  const generationLockRef = useRef(false);

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
    // Only one generation run is allowed per "Generate" click. If this
    // effect fires again (dependency churn, dev-mode double-invoke, etc.)
    // while a run is already in flight or has completed, skip it entirely.
    if (generationLockRef.current) return;
    generationLockRef.current = true;

    let isCancelled = false;
    let progressTimer: NodeJS.Timeout | null = null;

    const runFrameworkGeneration = async () => {
      // Smooth progress timer while Gemini API and Supabase are generating
      let currentStepIndex = 0;
      progressTimer = setInterval(() => {
        if (currentStepIndex < GENERATION_STEPS.length - 2) {
          currentStepIndex++;
          setGenCompleted(currentStepIndex);
        }
      }, 1400);

      const targetCount = qaDepth === "quick" ? 30 : qaDepth === "comprehensive" ? 60 : 45;

      const prompt = `
You are an expert Principal QA Architect creating a highly specific, platform-aware QA Testing Framework.

APPLICATION CONTEXT:
- Name: ${projectName || "Digital Application"}
- Product Type: ${productType || "Web Application"}
- Domain: ${domain || "Software"}
- Description: ${description || "Interactive software platform"}

USER-VERIFIED PRODUCT UNDERSTANDING:
- Summary: ${aiSummary}
- Target User Personas: ${detectedUsers.join(", ")}
- Key Features: ${detectedFeatures.join(", ")}
- Critical Workflows: ${criticalWorkflows.join(", ")}
- Identified Risk Areas: ${riskAreas.join(", ")}
- QA Coverage Goals: ${qaCoverage.join(", ")}

TESTING PREFERENCES:
- Target QA Depth: ${qaDepth} (Generate approximately ${targetCount} checks)
- Quality Priorities: ${qualityPriorities.join(", ")}
- Automation Preferences: ${automationPrefs.join(", ")}
- Human Review Preferences: ${humanReviewCats.join(", ")}
- Additional Guidance: ${additionalInstructions || "None"}

STRICT CRITICAL RULES FOR CHECK TITLES & DESCRIPTIONS:
1. Every title MUST be a specific, actionable, human-readable QA verification statement describing a real user interaction, system behavior, or UX expectation.
   EXAMPLES OF HIGH QUALITY TITLES:
   - "File upload completes successfully with visual progress feedback"
   - "All interactive elements are keyboard accessible with focus indicators"
   - "Pages and screens load within acceptable performance threshold"
   - "Required form fields are validated before submission with inline errors"
   - "Success and error toasts appear for key user actions"
   - "Global navigation header is consistent across all application routes"
   - "User session tokens are invalidated upon manual logout"
   - "Responsive layout adjusts without overflow on mobile viewports"
   - "Search query filters update results list dynamically"
2. DO NOT use generic template titles like "Performance verification for Login Page" or "Navigation verification for Dashboard".
3. Write domain-specific titles tailored to ${domain} and features like ${detectedFeatures.slice(0, 4).join(", ")}.

JSON FORMAT REQUIREMENTS:
Return a single JSON object matching:
{
  "checks": [
    {
      "id": "check-1",
      "level": "Product QA",
      "pageName": "Dashboard",
      "category": "Usability and product experience",
      "title": "File upload completes successfully with visual progress feedback",
      "description": "Ensure uploading PRD files shows live percentage and confirmation toast.",
      "expectedBehavior": "Progress bar reaches 100% and success toast renders.",
      "notes": "Verify with 10MB PDF and PNG files.",
      "automation": "Human Review",
      "priority": "High",
      "status": "Not Started",
      "type": "Usability"
    }
  ]
}

Rules for JSON fields:
- "level": Distribute approximately ${targetCount} checks evenly across ["Product QA", "Page QA", "Component QA", "Feature QA", "Release QA"].
- "category": MUST be strictly one of: ["Navigation", "Forms", "Accessibility", "Visual Design", "Usability and product experience", "Responsive", "Performance", "Security", "Authentication", "Validation", "Error Handling", "Content", "Notifications", "Search", "Filters", "Dashboard", "Tables", "Media", "SEO"].
- "pageName": Infer realistic page names matching features (e.g. "Login Page", "Dashboard", "Search Page", "Settings Page", "Checkout Page").
- "automation": Set UX, Usability, Visual Design, Copy, and Flow checks to "Human Review". Set API, Validation, DOM, and Security checks to "Automated".
- "priority": One of ["Critical", "High", "Medium", "Low"].
- "status": "Not Started".
`;

      const res = await safeGenerateJSON<{ checks: Array<any> }>({
        prompt,
        systemInstruction:
          "You are a Senior Principal QA Architect. Produce a detailed QA testing framework array in strict JSON format only.",
        temperature: 0.3,
      });

      if (isCancelled) {
        if (progressTimer) clearInterval(progressTimer);
        return;
      }

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
        const specificTemplates = [
          { title: "File upload completes successfully with visual progress feedback", cat: "Forms", page: "Upload Modal", auto: "Human Review", priority: "High" },
          { title: "All interactive elements are keyboard accessible with focus indicators", cat: "Accessibility", page: "Global Navigation", auto: "Human Review", priority: "Critical" },
          { title: "Pages and screens load within acceptable performance threshold", cat: "Performance", page: "Overview Page", auto: "Automated", priority: "High" },
          { title: "Required form fields are validated before submission with inline errors", cat: "Validation", page: "Registration Page", auto: "Automated", priority: "Critical" },
          { title: "Success and error toasts appear for key user actions", cat: "Notifications", page: "Dashboard", auto: "Human Review", priority: "Medium" },
          { title: "Global navigation header is consistent across all application routes", cat: "Navigation", page: "Global Navigation", auto: "Human Review", priority: "Critical" },
          { title: "User session tokens are invalidated upon manual logout", cat: "Security", page: "Auth Module", auto: "Automated", priority: "Critical" },
          { title: "Responsive layout adjusts without overflow on mobile viewports", cat: "Responsive", page: "Overview Page", auto: "Human Review", priority: "High" },
          { title: "Search query filters update results list dynamically", cat: "Search", page: "Search Page", auto: "Automated", priority: "Medium" },
          { title: "Data table pagination and sorting maintain state across navigation", cat: "Tables", page: "Reports Page", auto: "Automated", priority: "Medium" },
        ];

        const defaultPages = ["Login Page", "Dashboard", "Search Page", "Settings Page", "User Profile"];
        for (let i = 0; i < targetCount; i++) {
          const tmpl = specificTemplates[i % specificTemplates.length];
          const featName = detectedFeatures[i % Math.max(1, detectedFeatures.length)] || "Core Feature";
          const lvl = allowedLevels[i % allowedLevels.length];

          const checkTitle = i < specificTemplates.length
            ? tmpl.title
            : `Verify ${featName} workflow executes cleanly on ${defaultPages[i % defaultPages.length]}`;

          generatedChecks.push({
            id: `gen-check-${i + 1}`,
            title: checkTitle,
            level: lvl,
            pageName: tmpl.page || defaultPages[i % defaultPages.length],
            category: tmpl.cat || "Usability and product experience",
            priority: (tmpl.priority || "Medium") as QaCheck["priority"],
            status: "Not Started",
            type: tmpl.cat || "Functional",
            automation: (tmpl.auto || "Automated") as QaCheck["automation"],
            description: `Verify ${checkTitle.toLowerCase()} under expected operational state.`,
            expectedBehavior: `Expected behavior executes without UI glitches or console errors.`,
            notes: `Perform automated assertion or human usability check.`,
          });
        }
      }

      // Persist Project, AI Understanding, QA Framework & Human Reviews to Supabase
      try {
        const result = await createProjectAfterGeneration({
          project: {
            name: projectName || "New QA Project",
            type: productType || "Web Application",
            domain: domain || "Software",
            description: description || "QA Engineering project",
            qualityScore: 0,
            status: "In Progress",
            frameworkProgress: 100,
            automationProgress: 0,
            humanReviewProgress: 0,
            version: "v1.0",
            owner: "Admin Engineer",
            repositoryUrl: githubUrl || "https://github.com/company/project",
            deploymentUrl: websiteUrl || "https://app.dev",
          },
          aiUnderstanding: {
            summary: aiSummary,
            detectedUsers,
            detectedFeatures,
            criticalWorkflows,
            riskAreas,
            qaCoverage,
          },
          qaChecks: generatedChecks,
        });

        // Hydrate stores with the newly generated Supabase UUID
        await useProjectStore.getState().loadProjects();
        await useFrameworkStore.getState().loadChecks(result.projectId);
        await useHumanReviewStore.getState().loadReviews(result.projectId);
        await useAiUnderstandingStore.getState().loadUnderstanding(result.projectId);

        if (progressTimer) clearInterval(progressTimer);

        // Smoothly complete remaining steps
        for (let s = currentStepIndex; s <= GENERATION_STEPS.length; s++) {
          if (isCancelled) return;
          setGenCompleted(s);
          await new Promise((r) => setTimeout(r, 200));
        }

        router.push(`/qa-projects/${result.projectId}`);
      } catch (saveErr: any) {
        if (progressTimer) clearInterval(progressTimer);
        console.error("Failed to save project to Supabase:", saveErr);
        showToast(`Failed to save project to database: ${saveErr?.message || "Error"}`, "error");
        generationLockRef.current = false;
        setIsGenerating(false);
      }
    };

    runFrameworkGeneration();

    return () => {
      isCancelled = true;
      if (progressTimer) clearInterval(progressTimer);
    };
    // NOTE: intentionally depending on `isGenerating` only.
    //
    // This effect must run exactly once per "Generate" click and stay alive
    // for the entire duration of that run (Gemini call + Supabase writes +
    // final store hydration + router.push). All other values it reads
    // (projectName, aiSummary, qaDepth, etc.) are read from the closure at
    // the moment the effect starts and don't need to re-trigger it.
    //
    // Previously this array included aiSummary/detectedUsers/detectedFeatures/
    // criticalWorkflows/riskAreas/qaCoverage. Those are populated by the
    // *same* zustand store (useAiUnderstandingStore) that this very run
    // hydrates at the end via `useAiUnderstandingStore.getState().loadUnderstanding(...)`.
    // That hydration call replaces the store's arrays with freshly-fetched
    // (new-reference) data, which re-triggered this effect mid-flight. React
    // then invoked the cleanup above on the *original* run, setting its
    // `isCancelled` flag to true — so the subsequent `if (isCancelled) return;`
    // check right before `router.push(...)` silently aborted the redirect,
    // even though the project had already been fully written to Supabase.
    // The `generationLockRef` guard stopped a second Gemini/Supabase run from
    // starting, but did nothing to stop the first run's own promise chain
    // from being cancelled by that spurious effect re-invocation. Restricting
    // the dependency array fixes this at the source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

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