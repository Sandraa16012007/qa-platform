"use client";

import { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Layers,
  Cpu,
  Sparkles,
  RotateCw,
  CheckCircle2,
  X,
  Info,
  AlertTriangle,
  Play,
  Activity,
} from "lucide-react";

import Sidebar, { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../components/Sidebar";
import Header from "../../components/Header";

// Types and Mock Data
import {
  Project,
  ActivityItem,
  TestRun,
  QaCheck,
  DetailedTestRun,
  IssueItem,
  PageNote,
} from "./types";
import {
  initialDetailedRuns,
  initialIssues,
  initialPageNotes,
} from "./mockData";

// Global stores
import { useUiStore } from "../../stores/useUiStore";
import { useProjectStore } from "../../stores/useProjectStore";
import { useFrameworkStore } from "../../stores/useFrameworkStore";
import { useHumanReviewStore } from "../../stores/useHumanReviewStore";
import { useAiUnderstandingStore } from "../../stores/useAiUnderstandingStore";
import { useIssuesStore } from "../../stores/useIssuesStore";
import { usePageNotesStore } from "../../stores/usePageNotesStore";
import * as projectsService from "../../lib/services/projects";

// Components
import ProjectHeader from "./components/ProjectHeader";
import ProjectTabs from "./components/ProjectTabs";
import RunQaModal from "./components/RunQaModal";
import QaCheckDrawer from "./components/QaCheckDrawer";

// Tabs
import OverviewTab from "./components/tabs/OverviewTab";
import QaFrameworkTab from "./components/tabs/QaFrameworkTab";
import TestRunsTab from "./components/tabs/TestRunsTab";
import HumanReviewsTab from "./components/tabs/HumanReviewsTab";
import IssuesTab from "./components/tabs/IssuesTab";
import ReportsTab from "./components/tabs/ReportsTab";

function ProjectDashboardContent({ id }: { id: string }) {
  const router = useRouter();

  // Selected project (global project store — single source of truth)
  const projects = useProjectStore((state) => state.projects);
  const selectProjectInStore = useProjectStore((state) => state.selectProject);
  const loadProjectsInStore = useProjectStore((state) => state.loadProjects);
  const isProjectsLoading = useProjectStore((state) => state.isLoading);
  const isProjectsLoaded = useProjectStore((state) => state.isLoaded);

  const [isInitializing, setIsInitializing] = useState(true);
  const [projectNotFound, setProjectNotFound] = useState(false);

  const project = useMemo(() => {
    return projects.find((p) => p.id === id) || null;
  }, [projects, id]);

  // Load this project's QA Framework, Human Reviews, and AI Understanding
  // from Supabase whenever the project id changes.
  const loadChecks = useFrameworkStore((state) => state.loadChecks);
  const loadReviews = useHumanReviewStore((state) => state.loadReviews);
  const loadUnderstanding = useAiUnderstandingStore((state) => state.loadUnderstanding);
  const loadIssues = useIssuesStore((state) => state.loadIssues);
  const loadPageNotes = usePageNotesStore((state) => state.loadPageNotes);
  const isChecksLoading = useFrameworkStore((state) => state.isLoading);
  const isReviewsLoading = useHumanReviewStore((state) => state.isLoading);

  useEffect(() => {
    let isCancelled = false;

    const initDashboard = async () => {
      setIsInitializing(true);
      selectProjectInStore(id);

      // Hydrate all stores for this project
      loadUnderstanding(id);
      loadChecks(id);
      loadReviews(id);
      loadIssues(id);
      loadPageNotes(id);

      // Ensure projects list is loaded from Supabase
      await loadProjectsInStore();

      // Check if project exists in store or directly in Supabase
      const storeProjects = useProjectStore.getState().projects;
      const foundInStore = storeProjects.find((p) => p.id === id);

      if (!foundInStore) {
        try {
          const directProject = await projectsService.fetchProjectById(id);
          if (!directProject && !isCancelled) {
            setProjectNotFound(true);
          }
        } catch {
          if (!isCancelled) setProjectNotFound(true);
        }
      }

      if (!isCancelled) setIsInitializing(false);
    };

    if (id) {
      initDashboard();
    }

    return () => {
      isCancelled = true;
    };
  }, [id, selectProjectInStore, loadProjectsInStore, loadUnderstanding, loadChecks, loadReviews, loadIssues, loadPageNotes]);

  useEffect(() => {
    if (projectNotFound) {
      notFound();
    }
  }, [projectNotFound]);

  // Tab State (global UI store)
  const activeTab = useUiStore((state) => state.activeTab);
  const setActiveTab = useUiStore((state) => state.setActiveTab);

  // Sidebar State (global UI store — defaults to collapsed on project detail page)
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const initSidebarFromStorage = useUiStore((state) => state.initSidebarFromStorage);

  useEffect(() => {
    initSidebarFromStorage();
  }, [initSidebarFromStorage]);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  // Quality Score States — the live value is derived from real QA Framework
  // + Human Review stats below (see `derivedQualityScore`), once `checks`
  // and `humanReviews` are loaded from their stores.
  const [currentScore, setCurrentScore] = useState(0);
  const [scoreAnimation, setScoreAnimation] = useState(false);

  // AI Understanding / Project Summary (global store — shared with the New Project wizard)
  const isEditingSummary = useAiUnderstandingStore((state) => state.isEditingSummary);
  const setIsEditingSummary = useAiUnderstandingStore((state) => state.setIsEditingSummary);
  const summaryFromStore = useAiUnderstandingStore((state) => state.summary);
  const setSummaryText = useAiUnderstandingStore((state) => state.updateSummary);
  const summaryText =
    summaryFromStore ||
    (project
      ? `${project.name} is a high-performance ${project.type} optimized for user engagement. Features modular navigation structure, robust UI components, and integrated platform security.`
      : "");


  // Editable lists (global store — shared with the New Project wizard's AI Understanding step)
  const detectedUsersFromStore = useAiUnderstandingStore((state) => state.detectedUsers);
  const setUsers = useAiUnderstandingStore((state) => state.updateUsers);
  const users =
    detectedUsersFromStore.length > 0
      ? detectedUsersFromStore
      : ["Creators", "Recruiters", "Visitors", "Administrators"];

  const detectedFeaturesFromStore = useAiUnderstandingStore((state) => state.detectedFeatures);
  const setFeatures = useAiUnderstandingStore((state) => state.updateFeatures);
  const features =
    detectedFeaturesFromStore.length > 0
      ? detectedFeaturesFromStore
      : [
          "Authentication",
          "Portfolio Upload",
          "Project Discovery",
          "Comments",
          "Likes",
          "Search",
          "Notifications",
          "Analytics",
        ];

  const criticalWorkflowsFromStore = useAiUnderstandingStore((state) => state.criticalWorkflows);
  const setWorkflows = useAiUnderstandingStore((state) => state.updateWorkflows);
  const workflows =
    criticalWorkflowsFromStore.length > 0
      ? criticalWorkflowsFromStore
      : [
          "Create Account",
          "Upload Portfolio",
          "Browse Projects",
          "Follow Creators",
          "Manage Profile",
          "Search Content",
        ];

  const riskAreasFromStore = useAiUnderstandingStore((state) => state.riskAreas);
  const setRisks = useAiUnderstandingStore((state) => state.updateRisks);
  const risks =
    riskAreasFromStore.length > 0
      ? riskAreasFromStore
      : [
          "Media Upload Reliability",
          "Search Accuracy",
          "Mobile Responsiveness",
          "Accessibility",
          "Large Content Rendering",
        ];

  // Overview Runs & Activities States
  const [runs, setRuns] = useState<TestRun[]>([
    { id: "15", name: "Run #15", completed: "2 hours ago", passed: 412, failed: 7, warnings: 11, status: "Completed" },
    { id: "14", name: "Run #14", completed: "Yesterday", passed: 398, failed: 12, warnings: 8, status: "Completed" },
    { id: "13", name: "Run #13", completed: "3 days ago", passed: 420, failed: 2, warnings: 15, status: "Completed" },
  ]);

  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: "1", time: "1 hour ago", icon: AlertTriangle, description: "New issue detected in Search workflows", color: "text-magenta" },
    { id: "2", time: "3 hours ago", icon: RotateCw, description: "Human review evaluation updated by Alex R.", color: "text-primary" },
    { id: "3", time: "Today", icon: Activity, description: "Accessibility run completed on Portfolio view", color: "text-primary" },
    { id: "4", time: "Today", icon: CheckCircle2, description: "Quality score updated after pipeline scan", color: "text-primary" },
    { id: "5", time: "2 days ago", icon: Sparkles, description: "QA Framework generated from PRD docs", color: "text-magenta" },
  ]);

  // QA Framework States (global store)
  const checks = useFrameworkStore((state) => state.checks);
  const updateCheckInStore = useFrameworkStore((state) => state.updateCheck);
  const selectedLevel = useFrameworkStore((state) => state.selectedLevel);
  const setSelectedLevel = useFrameworkStore((state) => state.selectLevel);
  const selectedCheckId = useFrameworkStore((state) => state.selectedCheckId);
  const setSelectedCheckId = useFrameworkStore((state) => state.selectCheck);
  const collapsedCats = useFrameworkStore((state) => state.collapsedCats);
  const toggleCategory = useFrameworkStore((state) => state.toggleCategory);

  const searchText = useFrameworkStore((state) => state.searchText);
  const setSearchText = useFrameworkStore((state) => state.setSearchText);
  const filterCategory = useFrameworkStore((state) => state.filterCategory);
  const setFilterCategory = useFrameworkStore((state) => state.setFilterCategory);
  const filterPriority = useFrameworkStore((state) => state.filterPriority);
  const setFilterPriority = useFrameworkStore((state) => state.setFilterPriority);
  const filterStatus = useFrameworkStore((state) => state.filterStatus);
  const setFilterStatus = useFrameworkStore((state) => state.setFilterStatus);
  const filterAutomation = useFrameworkStore((state) => state.filterAutomation);
  const setFilterAutomation = useFrameworkStore((state) => state.setFilterAutomation);

  const selectedCheck = useMemo(() => {
    return checks.find((c) => c.id === selectedCheckId) || null;
  }, [checks, selectedCheckId]);

  const [editTitle, setEditTitle] = useState("");
  const [editPageName, setEditPageName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState<"Critical" | "High" | "Medium" | "Low">("Low");
  const [editStatus, setEditStatus] = useState<"Not Started" | "In Progress" | "Passed" | "Failed" | "Skipped">("Not Started");
  const [editAutomation, setEditAutomation] = useState<"Automated" | "Human Review">("Automated");
  const [editDescription, setEditDescription] = useState("");
  const [editExpected, setEditExpected] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (selectedCheck) {
      setEditTitle(selectedCheck.title);
      setEditPageName(selectedCheck.pageName || "");
      setEditCategory(selectedCheck.category);
      setEditPriority(selectedCheck.priority);
      setEditStatus(selectedCheck.status);
      setEditAutomation(selectedCheck.automation);
      setEditDescription(selectedCheck.description);
      setEditExpected(selectedCheck.expectedBehavior);
      setEditNotes(selectedCheck.notes);
    }
  }, [selectedCheck]);

  // Level progress calculator
  const levelProgress = useMemo(() => {
    const levels = ["Product QA", "Page QA", "Component QA", "Feature QA", "Release QA"];
    const progress: Record<string, { total: number; passed: number; percent: number }> = {};

    levels.forEach((lvl) => {
      const lvlChecks = checks.filter((c) => c.level === lvl);
      const total = lvlChecks.length;
      const passed = lvlChecks.filter((c) => c.status === "Passed").length;
      const percent = total > 0 ? Math.round((passed / total) * 100) : 0;
      progress[lvl] = { total, passed, percent };
    });

    return progress;
  }, [checks]);

  // Filtered QA Checklist Memo
  const filteredChecks = useMemo(() => {
    return checks.filter((c) => {
      if (c.level !== selectedLevel) return false;
      if (searchText.trim() !== "") {
        const q = searchText.toLowerCase();
        const matches =
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterCategory !== "All" && c.category !== filterCategory) return false;
      if (filterPriority !== "All" && c.priority !== filterPriority) return false;
      if (filterStatus !== "All" && c.status !== filterStatus) return false;
      if (filterAutomation !== "All" && c.automation !== filterAutomation) return false;
      return true;
    });
  }, [checks, selectedLevel, searchText, filterCategory, filterPriority, filterStatus, filterAutomation]);

  const checksByCategory = useMemo(() => {
    const groups: Record<string, QaCheck[]> = {};
    filteredChecks.forEach((c) => {
      if (!groups[c.category]) {
        groups[c.category] = [];
      }
      groups[c.category].push(c);
    });
    return groups;
  }, [filteredChecks]);

  // Test Runs Tab States
  const [detailedRuns, setDetailedRuns] = useState<DetailedTestRun[]>(initialDetailedRuns);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [runsSearch, setRunsSearch] = useState("");
  const [runsFilterStatus, setRunsFilterStatus] = useState("All");
  const [runsFilterSuite, setRunsFilterSuite] = useState("All");
  const [runsFilterEnv, setRunsFilterEnv] = useState("All");
  const [runsSort, setRunsSort] = useState("Newest");

  // Run QA Modal Inputs
  const [showRunModal, setShowRunModal] = useState(false);
  const [modalRunName, setModalRunName] = useState("");
  const [modalEnv, setModalEnv] = useState("Staging");
  const [modalBrowser, setModalBrowser] = useState("Chrome");
  const [modalDevice, setModalDevice] = useState("Desktop");
  const [modalScope, setModalScope] = useState<string[]>(["Product QA", "Page QA", "Component QA"]);

  // Running Simulation State
  const [isCurrentlyRunning, setIsCurrentlyRunning] = useState(false);
  const [runningProgress, setRunningProgress] = useState(0);
  const [runningStage, setRunningStage] = useState("");
  const [runningTimeRemaining, setRunningTimeRemaining] = useState("");
  const [runningSuite, setRunningSuite] = useState("");
  const [runningIntervalId, setRunningIntervalId] = useState<any>(null);

  // Human Reviews Tab State (global store)
  const humanReviews = useHumanReviewStore((state) => state.humanReviews);
  const setHumanReviews = useHumanReviewStore((state) => state.setHumanReviews);
  const saveReviewResultInStore = useHumanReviewStore((state) => state.saveReviewResult);

  // Live Quality Score — derived from actual QA Framework + Human Review
  // results instead of the static project.qualityScore field, so it
  // reflects real pass rates as checks get executed and reviews get
  // completed. Combines: (automated checks that Passed) + (human reviews
  // whose result was "Pass") over the total number of evaluable items.
  const derivedQualityScore = useMemo(() => {
    const automatedChecks = checks.filter((c) => c.automation === "Automated");
    const automatedPassed = automatedChecks.filter((c) => c.status === "Passed").length;
    const humanPassed = humanReviews.filter((r) => r.reviewResult === "Pass").length;
    const totalEvaluable = automatedChecks.length + humanReviews.length;
    if (totalEvaluable === 0) return 0;
    return Math.round(((automatedPassed + humanPassed) / totalEvaluable) * 100);
  }, [checks, humanReviews]);

  useEffect(() => {
    setCurrentScore(derivedQualityScore);

    // Backfill: projects created before quality-score syncing existed (or
    // that simply haven't had a check/review edited since) still have a
    // stale `quality_score` of 0 in Supabase, even though this page can
    // already derive the real value from loaded checks + human reviews.
    // Persist it here too so the QA Projects list page (which reads
    // project.qualityScore straight from the DB) reflects the same number
    // without requiring the user to make an edit first.
    if (project?.id && (checks.length > 0 || humanReviews.length > 0)) {
      projectsService
        .recomputeQualityScore(project.id)
        .then((score) =>
          useProjectStore.getState().patchProjectLocal(project.id, {
            qualityScore: score,
          })
        )
        .catch((err) => console.error("recomputeQualityScore failed:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedQualityScore, project?.id]);

  // Issues Tab & Page Notes State (global stores populated from Supabase)
  const issues = useIssuesStore((state) => state.issues);
  const setIssues = useIssuesStore((state) => state.setIssues);
  const updateIssueInStore = useIssuesStore((state) => state.updateIssue);

  const pageNotes = usePageNotesStore((state) => state.pageNotes);
  const setPageNotes = usePageNotesStore((state) => state.setPageNotes);
  const addPageNoteInStore = usePageNotesStore((state) => state.addPageNote);
  const deletePageNoteInStore = usePageNotesStore((state) => state.deletePageNote);

  const handleNavigateToCheck = (checkId: string) => {
    setActiveTab("QA Framework");
    setSelectedCheckId(checkId);
  };

  const handleNavigateToReview = (reviewId: string) => {
    setActiveTab("Human Reviews");
  };

  // Jump from a QA Framework checklist item (in the drawer) to its linked
  // Human Review entry.
  const [targetReviewId, setTargetReviewId] = useState<string | null>(null);
  const handleGoToReview = (checkId: string) => {
    const linkedReview = humanReviews.find((r) => r.checkId === checkId);
    if (!linkedReview) {
      showToast("No linked human review found for this check yet.", "warning");
      return;
    }
    setTargetReviewId(linkedReview.id);
    setSelectedCheckId(null);
    setActiveTab("Human Reviews");
  };

  // Toast System (global UI store)
  const toasts = useUiStore((state) => state.toasts);
  const showToast = useUiStore((state) => state.showToast);
  const removeToast = useUiStore((state) => state.removeToast);

  // Filtered & Sorted Test Runs memo
  const filteredRuns = useMemo(() => {
    return detailedRuns
      .filter((run) => {
        if (runsSearch.trim() !== "") {
          const q = runsSearch.toLowerCase();
          const matches =
            run.suite.toLowerCase().includes(q) ||
            `#${run.runNumber}`.includes(q) ||
            run.environment.toLowerCase().includes(q) ||
            run.status.toLowerCase().includes(q);
          if (!matches) return false;
        }
        if (runsFilterStatus !== "All" && run.status !== runsFilterStatus) return false;
        if (runsFilterSuite !== "All" && run.suite !== runsFilterSuite) return false;
        if (runsFilterEnv !== "All" && run.environment !== runsFilterEnv) return false;
        return true;
      })
      .sort((a, b) => {
        if (runsSort === "Newest") return b.runNumber - a.runNumber;
        if (runsSort === "Oldest") return a.runNumber - b.runNumber;
        if (runsSort === "Highest Score") return b.qualityScore - a.qualityScore;
        if (runsSort === "Lowest Score") return a.qualityScore - b.qualityScore;
        return 0;
      });
  }, [detailedRuns, runsSearch, runsFilterStatus, runsFilterSuite, runsFilterEnv, runsSort]);

  // Clean up running interval on unmount
  useEffect(() => {
    return () => {
      if (runningIntervalId) {
        clearInterval(runningIntervalId);
      }
    };
  }, [runningIntervalId]);

  // Trigger modal config on Run QA clicks
  const handleRunQA = () => {
    const nextNum = detailedRuns[0] ? detailedRuns[0].runNumber + 1 : 19;
    setModalRunName(`Regression Suite #${nextNum}`);
    setShowRunModal(true);
  };

  // Test Run Simulation
  const handleStartDetailedRun = (suiteName: string) => {
    setShowRunModal(false);
    if (runningIntervalId) clearInterval(runningIntervalId);

    setIsCurrentlyRunning(true);
    setRunningProgress(0);
    setRunningSuite(suiteName);
    setRunningStage("Initializing Test Environment...");
    setRunningTimeRemaining("5 min");

    const nextNum = detailedRuns[0] ? detailedRuns[0].runNumber + 1 : 19;
    const newRunId = `run-${nextNum}`;

    const newDetailedRun: DetailedTestRun = {
      id: newRunId,
      runNumber: nextNum,
      suite: suiteName,
      status: "Running",
      qualityScore: 0,
      scoreTrend: { type: "neutral", text: "No Change" },
      passed: 0,
      failed: 0,
      coverage: 0,
      environment: modalEnv as any,
      executed: "Just now",
      duration: "0s",
      scopeExecuted: [...modalScope],
      majorFailures: [],
    };

    setDetailedRuns((prev) => [newDetailedRun, ...prev]);

    const newOverviewRun: TestRun = {
      id: nextNum.toString(),
      name: `${suiteName} #${nextNum}`,
      completed: "Just now",
      passed: 0,
      failed: 0,
      warnings: 0,
      status: "Running" as any,
    };
    setRuns((prev) => [newOverviewRun, ...prev.slice(0, 2)]);

    const runningAct: ActivityItem = {
      id: Date.now().toString(),
      time: "Just now",
      icon: RotateCw,
      description: `${suiteName} #${nextNum} initialized on ${modalEnv}`,
      color: "text-yellow animate-spin",
    };
    setActivities((prev) => [runningAct, ...prev]);

    let progress = 0;
    const stages = [
      { maxPrg: 15, stage: "Provisioning dynamic container nodes...", time: "4 min 30s" },
      { maxPrg: 35, stage: "Checking repository branch & dependencies...", time: "3 min" },
      { maxPrg: 55, stage: "Executing automated product & page specs...", time: "2 min" },
      { maxPrg: 75, stage: "Analyzing component states & rendering trees...", time: "1 min" },
      { maxPrg: 90, stage: "Verifying accessibility WCAG standards...", time: "30s" },
      { maxPrg: 98, stage: "Aggregating metrics & report data...", time: "10s" },
      { maxPrg: 100, stage: "Test execution finished.", time: "0s" },
    ];

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 3;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsCurrentlyRunning(false);
        setRunningIntervalId(null);

        const failedCount = Math.floor(Math.random() * 8);
        const passedCount = Math.floor(Math.random() * 150) + 300;
        const newScore = failedCount === 0 ? 98 : Math.max(72, 94 - failedCount * 3);
        const finalStatus = failedCount > 5 ? "Failed" : "Completed";

        const scoreDiff = newScore - currentScore;
        const trendText = scoreDiff > 0 ? `↑ +${scoreDiff} Quality Score` : scoreDiff < 0 ? `↓ ${Math.abs(scoreDiff)} Quality Score` : "No Change";
        const trendType = scoreDiff > 0 ? "improvement" : scoreDiff < 0 ? "decline" : "neutral";

        setDetailedRuns((prev) =>
          prev.map((run) =>
            run.id === newRunId
              ? {
                  ...run,
                  status: finalStatus as any,
                  qualityScore: newScore,
                  scoreTrend: { type: trendType, text: trendText },
                  passed: passedCount,
                  failed: failedCount,
                  coverage: Math.floor(Math.random() * 8) + 82,
                  duration: "4m 12s",
                  majorFailures: failedCount > 0
                    ? ["WCAG color contrast mismatch on footer tags", "Button state toggle fails sync"]
                    : [],
                }
              : run
          )
        );

        setCurrentScore(newScore);
        setScoreAnimation(true);
        setTimeout(() => setScoreAnimation(false), 1500);

        setRuns((prev) =>
          prev.map((run) =>
            run.id === nextNum.toString()
              ? {
                  ...run,
                  status: (finalStatus === "Completed" ? "Completed" : "Failed") as any,
                  passed: passedCount,
                  failed: failedCount,
                  warnings: Math.floor(Math.random() * 12) + 2,
                }
              : run
          )
        );

        const completeAct: ActivityItem = {
          id: Date.now().toString(),
          time: "Just now",
          icon: CheckCircle2,
          description: `${suiteName} #${nextNum} completed on ${modalEnv} with ${newScore}% Quality Score`,
          color: "text-primary",
        };
        setActivities((prev) => [completeAct, ...prev.filter((act) => act.id !== runningAct.id)]);

        showToast(`${suiteName} #${nextNum} finished. Quality Score: ${newScore}%`, finalStatus === "Completed" ? "success" : "warning");
      } else {
        setRunningProgress(progress);
        const currentStage = stages.find((s) => progress <= s.maxPrg) || stages[stages.length - 1];
        setRunningStage(currentStage.stage);
        setRunningTimeRemaining(currentStage.time);

        setDetailedRuns((prev) =>
          prev.map((run) =>
            run.id === newRunId
              ? {
                  ...run,
                  passed: Math.floor(progress * 3.8),
                  failed: progress > 50 ? Math.floor(progress / 20) : 0,
                  coverage: Math.min(84, Math.floor(progress * 0.84)),
                }
              : run
          )
        );
      }
    }, 350);

    setRunningIntervalId(interval);
  };

  const handleCancelDetailedRun = () => {
    if (runningIntervalId) {
      clearInterval(runningIntervalId);
      setRunningIntervalId(null);
    }
    setIsCurrentlyRunning(false);

    setDetailedRuns((prev) =>
      prev.map((run) =>
        run.status === "Running"
          ? {
              ...run,
              status: "Cancelled" as any,
              scoreTrend: { type: "neutral", text: "No Change" },
              majorFailures: ["Manual cancellation by user"],
            }
          : run
      )
    );

    setRuns((prev) =>
      prev.map((run) =>
        run.status === "Running" as any
          ? {
              ...run,
              status: "Failed" as any,
            }
          : run
      )
    );

    showToast("Automated QA run cancelled by user.", "info");
  };

  // Save QA Check details edit
  const handleSaveCheck = () => {
    if (!selectedCheckId) return;
    updateCheckInStore(selectedCheckId, {
      title: editTitle,
      pageName: editPageName,
      category: editCategory,
      priority: editPriority,
      status: editStatus,
      automation: editAutomation,
      description: editDescription,
      expectedBehavior: editExpected,
      notes: editNotes,
    });
    showToast("QA Check details updated successfully!", "success");
  };

  // Badge Helpers
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-magenta-dim border border-magenta/30 text-magenta";
      case "High":
        return "bg-yellow-dim border border-yellow/30 text-yellow";
      case "Medium":
        return "bg-cyan-dim border border-cyan/30 text-primary";
      default:
        return "bg-surface-container border border-outline text-text-muted";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-surface-container-highest border border-outline text-text-muted";
      case "Framework Generated":
        return "bg-magenta-dim border border-magenta/30 text-magenta";
      case "Testing":
        return "bg-cyan-dim border border-cyan/30 text-cyan";
      case "Human Review":
        return "bg-yellow-dim border border-yellow/30 text-yellow";
      case "Ready":
      case "Passed":
        return "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400";
      case "Not Started":
        return "bg-surface-container-highest border border-outline text-text-muted";
      case "In Progress":
        return "bg-yellow-dim border border-yellow/30 text-yellow";
      case "Failed":
        return "bg-magenta-dim border border-magenta/30 text-magenta";
      case "Skipped":
        return "bg-surface-container-high border border-outline text-text-muted/80";
      default:
        return "bg-surface-container border border-outline text-on-surface-variant";
    }
  };

  const getTestStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-dim border border-emerald/30 text-emerald-400";
      case "Running":
        return "bg-yellow-dim border border-yellow/30 text-yellow animate-pulse";
      case "Failed":
        return "bg-magenta-dim border border-magenta/30 text-magenta";
      case "Cancelled":
        return "bg-surface-container border border-outline text-text-muted";
      case "Queued":
        return "bg-purple-dim border border-purple/30 text-purple";
      default:
        return "bg-surface-container border border-outline text-on-surface-variant";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "Product QA":
        return Globe;
      case "Page QA":
        return Layers;
      case "Component QA":
        return Cpu;
      case "Feature QA":
        return Sparkles;
      default:
        return CheckCircle2;
    }
  };

  const tabs = ["Overview", "QA Framework", "Test Runs", "Human Reviews", "Issues", "Reports"];

  // Guard against direct navigation / refresh before the project list has
  // finished loading from Supabase, and against a genuinely unknown id.
  if (!project || isInitializing) {
    if (isInitializing || isProjectsLoading || !isProjectsLoaded) {
      return (
        <div className="flex overflow-hidden bg-background text-foreground h-screen w-full">
          <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          <main
            className="flex-grow h-screen overflow-y-auto bg-background"
            style={{ marginLeft: sidebarWidth }}
          >
            <Header sidebarWidth={sidebarWidth} />
            <div className="p-6 flex items-center justify-center h-[calc(100vh-64px)]">
              <div className="flex flex-col items-center gap-3">
                <RotateCw className="w-8 h-8 text-primary animate-spin" />
                <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
                  Loading project...
                </p>
              </div>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="flex overflow-hidden bg-background text-foreground h-screen w-full">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main
          className="flex-grow h-screen overflow-y-auto bg-background"
          style={{ marginLeft: sidebarWidth }}
        >
          <Header sidebarWidth={sidebarWidth} />
          <div className="p-6 flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-3">
            <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
              Project not found.
            </p>
            <Link href="/qa-projects" className="text-primary text-xs font-semibold hover:underline">
              ← Back to QA Projects
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden w-full bg-background min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Workspace Frame */}
      <main className="flex-grow h-screen overflow-y-auto">
        <Header sidebarWidth={sidebarWidth} />
        <div style={{ height: 64 }} />

        <div className="p-6 space-y-6">
          {/* Project Details Header */}
          <ProjectHeader
            project={project}
            currentScore={currentScore}
            scoreAnimation={scoreAnimation}
            handleRunQA={handleRunQA}
            showToast={showToast}
          />

          {/* Project Navigation Tabs */}
          <ProjectTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Dynamic Active Tab View Render */}
          <div className="min-h-[400px]">
            {activeTab === "Overview" ? (
              <OverviewTab
                project={project}
                currentScore={currentScore}
                runs={runs}
                activities={activities}
                summaryText={summaryText}
                setSummaryText={setSummaryText}
                isEditingSummary={isEditingSummary}
                setIsEditingSummary={setIsEditingSummary}
                users={users}
                setUsers={setUsers}
                features={features}
                setFeatures={setFeatures}
                workflows={workflows}
                setWorkflows={setWorkflows}
                risks={risks}
                setRisks={setRisks}
                setActiveTab={setActiveTab}
                showToast={showToast}
              />
            ) : activeTab === "QA Framework" ? (
              isChecksLoading && checks.length === 0 ? (
                <div className="neo-border bg-surface rounded-xl p-16 flex flex-col items-center justify-center gap-3">
                  <RotateCw className="w-6 h-6 text-primary animate-spin" />
                  <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
                    Loading QA framework...
                  </p>
                </div>
              ) : (
              <QaFrameworkTab
                levelProgress={levelProgress}
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
                getLevelIcon={getLevelIcon}
                searchText={searchText}
                setSearchText={setSearchText}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                filterPriority={filterPriority}
                setFilterPriority={setFilterPriority}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterAutomation={filterAutomation}
                setFilterAutomation={setFilterAutomation}
                checksByCategory={checksByCategory}
                collapsedCats={collapsedCats}
                toggleCategory={toggleCategory}
                selectedCheckId={selectedCheckId}
                setSelectedCheckId={setSelectedCheckId}
                getStatusBadgeClass={getStatusBadgeClass}
                getPriorityBadgeClass={getPriorityBadgeClass}
              />
              )
            ) : activeTab === "Test Runs" ? (
              <TestRunsTab
                detailedRuns={detailedRuns}
                isCurrentlyRunning={isCurrentlyRunning}
                runningSuite={runningSuite}
                runningStage={runningStage}
                runningProgress={runningProgress}
                runningTimeRemaining={runningTimeRemaining}
                handleCancelDetailedRun={handleCancelDetailedRun}
                handleRunQA={handleRunQA}
                handleStartDetailedRun={handleStartDetailedRun}
                currentScore={currentScore}
                runsSearch={runsSearch}
                setRunsSearch={setRunsSearch}
                runsFilterStatus={runsFilterStatus}
                setRunsFilterStatus={setRunsFilterStatus}
                runsFilterSuite={runsFilterSuite}
                setRunsFilterSuite={setRunsFilterSuite}
                runsFilterEnv={runsFilterEnv}
                setRunsFilterEnv={setRunsFilterEnv}
                runsSort={runsSort}
                setRunsSort={setRunsSort}
                filteredRuns={filteredRuns}
                expandedRunId={expandedRunId}
                setExpandedRunId={setExpandedRunId}
                getTestStatusBadgeClass={getTestStatusBadgeClass}
                showToast={showToast}
              />
            ) : activeTab === "Human Reviews" ? (
              isReviewsLoading && humanReviews.length === 0 ? (
                <div className="neo-border bg-surface rounded-xl p-16 flex flex-col items-center justify-center gap-3">
                  <RotateCw className="w-6 h-6 text-primary animate-spin" />
                  <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
                    Loading human reviews...
                  </p>
                </div>
              ) : (
              <HumanReviewsTab
                humanReviews={humanReviews}
                setHumanReviews={setHumanReviews}
                onSaveReviewResult={saveReviewResultInStore}
                initialSelectedReviewId={targetReviewId}
                showToast={showToast}
                onNavigateToCheck={handleNavigateToCheck}
                setIssues={setIssues}
              />
              )
            ) : activeTab === "Issues" ? (
              <IssuesTab
                issues={issues}
                setIssues={setIssues}
                pageNotes={pageNotes}
                setPageNotes={setPageNotes}
                onNavigateToCheck={handleNavigateToCheck}
                onNavigateToReview={handleNavigateToReview}
                showToast={showToast}
                onAddPageNote={(note) => addPageNoteInStore(project.id, note)}
                onDeletePageNote={(noteId) => deletePageNoteInStore(noteId)}
                onUpdateIssueStatus={(issueId, status) => updateIssueInStore(issueId, { status })}
              />
            ) : activeTab === "Reports" ? (
              <ReportsTab
                project={project}
                currentScore={currentScore}
                showToast={showToast}
              />
            ) : (
              <div className="neo-border bg-surface rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 py-16">
                <Layers size={48} className="text-primary animate-pulse" />
                <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface">
                  {activeTab} Workspace
                </h3>
                <p className="text-sm text-on-surface-variant max-w-md">
                  Showing detailed workspace for {activeTab}. Customize individual parameters and view generated reports here.
                </p>
                <button
                  onClick={() => setActiveTab("Overview")}
                  className="bg-primary text-on-primary-container px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer hover:opacity-90 transition-all"
                >
                  Return to Overview
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* QA Check Details Drawer Overlay */}
      <QaCheckDrawer
        selectedCheck={selectedCheck}
        onClose={() => setSelectedCheckId(null)}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editPageName={editPageName}
        setEditPageName={setEditPageName}
        editCategory={editCategory}
        setEditCategory={setEditCategory}
        editPriority={editPriority}
        setEditPriority={setEditPriority}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        editAutomation={editAutomation}
        setEditAutomation={setEditAutomation}
        onGoToReview={handleGoToReview}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editExpected={editExpected}
        setEditExpected={setEditExpected}
        editNotes={editNotes}
        setEditNotes={setEditNotes}
        handleSaveCheck={handleSaveCheck}
      />

      {/* Run QA Modal */}
      <RunQaModal
        isOpen={showRunModal}
        onClose={() => setShowRunModal(false)}
        onStart={handleStartDetailedRun}
        runName={modalRunName}
        setRunName={setModalRunName}
        env={modalEnv}
        setEnv={setModalEnv}
        browser={modalBrowser}
        setBrowser={setModalBrowser}
        device={modalDevice}
        setDevice={setModalDevice}
        scope={modalScope}
        setScope={setModalScope}
      />

      {/* Dynamic Toast notifications overlay */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-4 rounded-lg neo-border bg-surface shadow-2xl flex items-center justify-between gap-3 text-xs font-sans border-l-4 ${
                toast.type === "success"
                  ? "border-l-primary border-outline/80 text-on-surface"
                  : toast.type === "info"
                  ? "border-l-yellow border-outline/80 text-on-surface"
                  : "border-l-magenta border-outline/80 text-on-surface"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Info size={14} className={toast.type === "success" ? "text-primary" : "text-yellow"} />
                <span className="truncate">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-on-surface-variant hover:text-on-surface text-xs cursor-pointer"
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

// Params handling wrapper component
function ProjectDashboardWrapper() {
  const [params, setParams] = useState<any>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split("/");
    const projectId = segments[segments.length - 1] || "1";
    setParams({ id: projectId });
  }, []);

  if (!params) {
    return (
      <div className="flex overflow-hidden bg-background text-foreground h-screen w-full">
        <Sidebar />
        <main className="flex-grow h-screen overflow-y-auto bg-background">
          <Header />
          <div className="p-6 flex items-center justify-center h-[calc(100vh-64px)]">
            <div className="flex flex-col items-center gap-3">
              <RotateCw className="w-8 h-8 text-primary animate-spin" />
              <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
                Loading workspace...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <ProjectDashboardContent id={params.id} />;
}

export default function ProjectDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex overflow-hidden bg-background text-foreground h-screen w-full">
          <Sidebar />
          <main className="flex-grow h-screen overflow-y-auto bg-background">
            <Header />
            <div className="p-6 flex items-center justify-center h-[calc(100vh-64px)]">
              <div className="flex flex-col items-center gap-3">
                <RotateCw className="w-8 h-8 text-primary animate-spin" />
                <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">
                  Loading dashboard...
                </p>
              </div>
            </div>
          </main>
        </div>
      }
    >
      <ProjectDashboardWrapper />
    </Suspense>
  );
}