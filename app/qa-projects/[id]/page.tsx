"use client";

import { useState, useEffect, useMemo, use, Suspense, useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Smartphone,
  Laptop,
  Cpu,
  Layers,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreVertical,
  Edit3,
  Copy,
  FileDown,
  Trash2,
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  CheckCircle2,
  X,
  Sparkles,
  Info,
  Calendar,
  Code,
  ExternalLink,
  GitBranch,
  Shield,
  Activity,
  Eye,
  FileText,
  Clock,
  User,
  Check,
  Flame,
  SlidersHorizontal,
  ArrowUpRight,
  ChevronUp,
} from "lucide-react";
import Sidebar, { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../components/Sidebar";
import Header from "../../components/Header";

// Project Type Definition
interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  qualityScore: number;
  status: string;
  frameworkProgress: number;
  automationProgress: number;
  humanReviewProgress: number;
  lastRun: string;
  lastUpdated: string;
  version: string;
  createdDate: string;
  owner: string;
  deploymentUrl: string;
  repositoryUrl: string;
}

// Activity Item
interface ActivityItem {
  id: string;
  time: string;
  icon: any;
  description: string;
  color: string;
}

// Test Run
interface TestRun {
  id: string;
  name: string;
  completed: string;
  passed: number;
  failed: number;
  warnings: number;
  status: "Completed" | "Running" | "Failed";
}

// QA Check Structure
interface QaCheck {
  id: string;
  level: string;
  title: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  type: "Visual" | "Functionality" | "Accessibility" | "Performance" | "Security" | "Content" | "UX";
  automation: "Automated" | "Human Review";
  status: "Not Started" | "In Progress" | "Passed" | "Failed" | "Skipped";
  description: string;
  expectedBehavior: string;
  acceptanceCriteria: string[];
  notes: string;
}

// Initial Project mock database
const projectDatabase: Record<string, Project> = {
  "1": {
    id: "1",
    name: "CreativeHub",
    type: "Web App",
    description: "Portfolio Platform",
    qualityScore: 87,
    status: "Human Review",
    frameworkProgress: 100,
    automationProgress: 92,
    humanReviewProgress: 45,
    lastRun: "2 hours ago",
    lastUpdated: "Today",
    version: "v1.2",
    createdDate: "Jul 22, 2026",
    owner: "Alex Rivera",
    deploymentUrl: "https://creativehub.dev.io",
    repositoryUrl: "https://github.com/engineering/creativehub",
  },
  "2": {
    id: "2",
    name: "LearnPro",
    type: "Web App",
    description: "EdTech Platform",
    qualityScore: 94,
    status: "Ready",
    frameworkProgress: 100,
    automationProgress: 100,
    humanReviewProgress: 100,
    lastRun: "1 day ago",
    lastUpdated: "Yesterday",
    version: "v2.0",
    createdDate: "Jun 14, 2026",
    owner: "Sarah Chen",
    deploymentUrl: "https://learnpro.edu",
    repositoryUrl: "https://github.com/engineering/learnpro",
  },
  "3": {
    id: "3",
    name: "API Gateway",
    type: "API",
    description: "Backend Service",
    qualityScore: 72,
    status: "Testing",
    frameworkProgress: 100,
    automationProgress: 58,
    humanReviewProgress: 0,
    lastRun: "4 hours ago",
    lastUpdated: "Today",
    version: "v1.0",
    createdDate: "May 08, 2026",
    owner: "Dave Miller",
    deploymentUrl: "https://api.gateway.local",
    repositoryUrl: "https://github.com/engineering/api-gateway",
  },
  "4": {
    id: "4",
    name: "ShopFlow",
    type: "Web App",
    description: "E-commerce",
    qualityScore: 81,
    status: "Framework Generated",
    frameworkProgress: 100,
    automationProgress: 0,
    humanReviewProgress: 0,
    lastRun: "Never",
    lastUpdated: "3 days ago",
    version: "v0.8",
    createdDate: "Apr 30, 2026",
    owner: "Emma Watson",
    deploymentUrl: "https://shopflow.shop",
    repositoryUrl: "https://github.com/engineering/shopflow",
  },
};

// Initial realistic QA Checks List (30 Items)
const initialQaChecks: QaCheck[] = [
  // Product QA (Checks 1-7)
  {
    id: "check-1",
    level: "Product QA",
    title: "Navigation hierarchy is intuitive",
    category: "Navigation",
    priority: "Critical",
    type: "UX",
    automation: "Human Review",
    status: "Passed",
    description: "Verify that the main navigation path allows users to access all portal domains under 3 clicks.",
    expectedBehavior: "All portal pages should be directly accessible or reachable within a standard 3-tier click tree.",
    acceptanceCriteria: ["All pages reachable under 3 clicks", "Consistent sidebar visibility", "Valid responsive menu toggle"],
    notes: "Tested successfully across multiple user types."
  },
  {
    id: "check-2",
    level: "Product QA",
    title: "Active page is clearly highlighted",
    category: "Navigation",
    priority: "High",
    type: "Visual",
    automation: "Automated",
    status: "Passed",
    description: "Verify that the sidebar link corresponding to the current path gets visual styling (cyan indicator).",
    expectedBehavior: "Active navigation element has color primary border and brighter font weight.",
    acceptanceCriteria: ["Left cyan line highlight active", "Active item font color high contrast", "Inactive item muted text color"],
    notes: ""
  },
  {
    id: "check-3",
    level: "Product QA",
    title: "Breadcrumbs are consistent",
    category: "Navigation",
    priority: "Medium",
    type: "UX",
    automation: "Human Review",
    status: "In Progress",
    description: "Verify sub-page routes append clean, readable parent-child paths at the top left of dynamic screens.",
    expectedBehavior: "Breadcrumbs match navigation hierarchy and dynamic slug labels match item titles exactly.",
    acceptanceCriteria: ["Slugs match item titles", "All links route to parents correctly", "Muted gray styling for history levels"],
    notes: "Requires mobile layout inspection."
  },
  {
    id: "check-4",
    level: "Product QA",
    title: "Branding is consistent across all pages",
    category: "Branding",
    priority: "High",
    type: "Visual",
    automation: "Human Review",
    status: "Passed",
    description: "Confirm corporate logotype heights, spacing, alignments, and accent marks match marketing guidelines.",
    expectedBehavior: "Logo assets are identical, SVG vectors render correctly, and spacing margins match 16px layouts.",
    acceptanceCriteria: ["SVG vectors render correctly", "Identical top spacing", "Logo fits mobile screens without scaling out"],
    notes: ""
  },
  {
    id: "check-5",
    level: "Product QA",
    title: "Typography follows the design system",
    category: "Branding",
    priority: "Medium",
    type: "Visual",
    automation: "Human Review",
    status: "Not Started",
    description: "Inspect style headers to guarantee only IBM Plex Sans, IBM Plex Mono, and loaded weights are active.",
    expectedBehavior: "Fonts map to CSS variables --font-sans and --font-mono only.",
    acceptanceCriteria: ["Sans variable active", "Mono variables on code metrics", "No unmapped standard fonts loaded"],
    notes: ""
  },
  {
    id: "check-6",
    level: "Product QA",
    title: "Color palette is applied consistently",
    category: "Branding",
    priority: "High",
    type: "Visual",
    automation: "Human Review",
    status: "Passed",
    description: "Ensure primary cyan and secondary magenta highlights follow defined contrasts and usage hierarchies.",
    expectedBehavior: "Highlight accents align with mock specifications, background remains dark navy, surface remains lighter surface.",
    acceptanceCriteria: ["Background uses navy code #080B12", "Primary cyan used for positive buttons", "Magenta for deletions / warnings"],
    notes: ""
  },
  {
    id: "check-7",
    level: "Product QA",
    title: "Color contrast meets WCAG guidelines",
    category: "Accessibility",
    priority: "Critical",
    type: "Accessibility",
    automation: "Automated",
    status: "Failed",
    description: "Test page text against background colors to ensure contrast levels reach WCAG AA target (4.5:1 ratio).",
    expectedBehavior: "Muted gray text on dark cards exceeds standard AA metrics for readability.",
    acceptanceCriteria: ["Text contrast is at least 4.5:1", "Large text contrast at least 3:1", "Contrast checks validate on high contrast mode"],
    notes: "Failed on some tooltip overlays."
  },

  // Page QA (Checks 8-14)
  {
    id: "check-8",
    level: "Page QA",
    title: "Interactive elements have keyboard focus",
    category: "Accessibility",
    priority: "Critical",
    type: "Accessibility",
    automation: "Automated",
    status: "Passed",
    description: "Ensure all buttons, selects, links, and tags display focus outlines when tabbed via keyboard.",
    expectedBehavior: "Active focus creates a border outline matching WCAG recommendations.",
    acceptanceCriteria: ["Visible outline on tab focus", "Focus indicator satisfies contrast", "Tab index matches standard screen layout"],
    notes: ""
  },
  {
    id: "check-9",
    level: "Page QA",
    title: "Images include descriptive alt text",
    category: "Accessibility",
    priority: "High",
    type: "Accessibility",
    automation: "Automated",
    status: "Passed",
    description: "Validate all SVG illustrations, mockups, and dynamic images contain 'alt' descriptors for screen readers.",
    expectedBehavior: "No images trigger 'missing alt text' accessibility validation errors.",
    acceptanceCriteria: ["Alt parameters exist on images", "Null alt used for decorative SVGs", "Descriptive labels describe image details"],
    notes: ""
  },
  {
    id: "check-10",
    level: "Page QA",
    title: "Form labels are correctly associated",
    category: "Accessibility",
    priority: "High",
    type: "Accessibility",
    automation: "Automated",
    status: "Passed",
    description: "Confirm all form label tags target correct text field IDs via 'htmlFor' configurations.",
    expectedBehavior: "Screen reader targets the label text immediately when focusing the corresponding input field.",
    acceptanceCriteria: ["Label htmlFor maps to input id", "Inputs contain assistive aria tags if missing labels", "Form validation announces label name"],
    notes: ""
  },
  {
    id: "check-11",
    level: "Page QA",
    title: "Primary actions are easy to identify",
    category: "User Experience",
    priority: "Critical",
    type: "UX",
    automation: "Human Review",
    status: "Passed",
    description: "Assess layout weight to ensure primary call-to-actions (e.g. Save, Run) capture attention first.",
    expectedBehavior: "Visual hierarchy prioritizes major interactions using high contrast backgrounds.",
    acceptanceCriteria: ["Primary action holds highest contrast", "Spacing highlights primary buttons", "Secondary options use border style"],
    notes: ""
  },
  {
    id: "check-12",
    level: "Page QA",
    title: "Empty states provide useful guidance",
    category: "User Experience",
    priority: "Medium",
    type: "UX",
    automation: "Human Review",
    status: "Passed",
    description: "Verify that screens with zero entries show technical illustrations, guidance copy, and a primary CTA.",
    expectedBehavior: "User receives instructions on how to initialize data when dynamic lists are empty.",
    acceptanceCriteria: ["Centered technical illustration", "Title and descriptive paragraph present", "Immediate actionable CTA button exists"],
    notes: ""
  },
  {
    id: "check-13",
    level: "Page QA",
    title: "Loading states reduce perceived waiting time",
    category: "User Experience",
    priority: "Low",
    type: "UX",
    automation: "Human Review",
    status: "Passed",
    description: "Confirm loading sequences employ skeletons or shimmer effects rather than solid gray screens.",
    expectedBehavior: "Shimmer patterns match component layouts to keep users engaged during async operations.",
    acceptanceCriteria: ["Pulsing shimmer matches card structure", "Animation starts immediately on navigation", "Transition clears smoothly"],
    notes: ""
  },
  {
    id: "check-14",
    level: "Page QA",
    title: "Error messages clearly explain recovery",
    category: "User Experience",
    priority: "High",
    type: "UX",
    automation: "Human Review",
    status: "In Progress",
    description: "Verify form errors explain why inputs failed and offer troubleshooting steps.",
    expectedBehavior: "Error notices are specific (e.g. 'Enter valid URL format') instead of vague ('Invalid input').",
    acceptanceCriteria: ["Copy details correction steps", "Colors use magenta accents", "Error focuses accessibility readers"],
    notes: ""
  },

  // Component QA (Checks 15-21)
  {
    id: "check-15",
    level: "Component QA",
    title: "Initial page load meets performance target",
    category: "Performance",
    priority: "Critical",
    type: "Performance",
    automation: "Automated",
    status: "Passed",
    description: "Verify Largest Contentful Paint (LCP) remains under 2.5 seconds during standard network loads.",
    expectedBehavior: "Webpack modules chunk properly and components utilize static assets where possible.",
    acceptanceCriteria: ["LCP under 2.5s on 3G Fast", "Total Blocking Time under 200ms", "Zero cumulative layout shifts"],
    notes: ""
  },
  {
    id: "check-16",
    level: "Component QA",
    title: "Images are optimized",
    category: "Performance",
    priority: "Medium",
    type: "Performance",
    automation: "Automated",
    status: "Passed",
    description: "Check that all graphic assets use WebP/AVIF formats and Next.js Image sizing mechanisms.",
    expectedBehavior: "Images do not load with original high-res dimensions in production bundles.",
    acceptanceCriteria: ["Formats use modern WebP/AVIF", "Sizing matches container dimensions", "Images lazy-load automatically"],
    notes: ""
  },
  {
    id: "check-17",
    level: "Component QA",
    title: "Lazy loading is implemented where appropriate",
    category: "Performance",
    priority: "Low",
    type: "Performance",
    automation: "Automated",
    status: "Passed",
    description: "Audit dynamic components to ensure they defer imports until scrolled into viewport.",
    expectedBehavior: "Heavy visual details only fetch when their respective screens approach rendering range.",
    acceptanceCriteria: ["Dynamic imports on large modals", "Scroll-bound triggers load components", "Bundle size does not leak memory"],
    notes: ""
  },
  {
    id: "check-18",
    level: "Component QA",
    title: "Primary buttons animate on hover",
    category: "User Experience",
    priority: "Low",
    type: "Visual",
    automation: "Human Review",
    status: "Passed",
    description: "Verify primary elements scale up or glow subtly when mouse hovers over their click areas.",
    expectedBehavior: "Buttons apply framer-motion scaling transitions (1.02 hover, 0.98 tap).",
    acceptanceCriteria: ["Subtle hover scale effect", "Transition completes under 150ms", "Active tap action compresses element"],
    notes: ""
  },
  {
    id: "check-19",
    level: "Component QA",
    title: "Dropdown menus close when clicking outside",
    category: "Functionality",
    priority: "High",
    type: "Functionality",
    automation: "Automated",
    status: "Passed",
    description: "Confirm three-dot menus and filter drop-lists attach click listeners to the window for closing.",
    expectedBehavior: "Dropdown menu disappears when clicking empty surface spaces.",
    acceptanceCriteria: ["Event listener bound to window", "Click inside options does not close", "Keyboard ESC closes element"],
    notes: ""
  },
  {
    id: "check-20",
    level: "Component QA",
    title: "Dialog modals block page body scrolling",
    category: "Functionality",
    priority: "Medium",
    type: "Functionality",
    automation: "Automated",
    status: "Passed",
    description: "Verify that opening a modal appends 'overflow-hidden' styles to the HTML body container.",
    expectedBehavior: "Background contents stay fixed and scroll wheels only affect the active modal dialog.",
    acceptanceCriteria: ["Body scroll disappears on modal open", "Scroll position stays locked", "Scroll restored on modal close"],
    notes: ""
  },
  {
    id: "check-21",
    level: "Component QA",
    title: "Input fields display character limits",
    category: "User Experience",
    priority: "Low",
    type: "UX",
    automation: "Human Review",
    status: "Passed",
    description: "Ensure textareas with size caps feature active character counts showing remaining space.",
    expectedBehavior: "The layout warns the user as character counts approach max lengths.",
    acceptanceCriteria: ["Live indicator matches string length", "Visual color shifts to yellow when close to limit", "Cuts off input at max length"],
    notes: ""
  },

  // Feature QA (Checks 22-26)
  {
    id: "check-22",
    level: "Feature QA",
    title: "Primary navigation works correctly",
    category: "Functionality",
    priority: "Critical",
    type: "Functionality",
    automation: "Automated",
    status: "Passed",
    description: "Validate dashboard links mount target pages cleanly without layout fracturing.",
    expectedBehavior: "Clicking items resolves dynamic files quickly and correctly.",
    acceptanceCriteria: ["Sidebar links mount correct files", "Dynamic params fetch content", "Redirection logs zero errors"],
    notes: ""
  },
  {
    id: "check-23",
    level: "Feature QA",
    title: "Forms validate expected inputs",
    category: "Functionality",
    priority: "High",
    type: "Functionality",
    automation: "Automated",
    status: "Passed",
    description: "Confirm submit is blocked when required inputs are empty or fail domain structures.",
    expectedBehavior: "Clicking submit raises clear validation summaries below invalid fields.",
    acceptanceCriteria: ["Inputs evaluate empty states", "Regex validates email / URLs", "Submit stays locked on fail"],
    notes: ""
  },
  {
    id: "check-24",
    level: "Feature QA",
    title: "Session persistence behaves correctly",
    category: "Functionality",
    priority: "Critical",
    type: "Functionality",
    automation: "Automated",
    status: "Passed",
    description: "Confirm authentication states persist in local cookies across dynamic page reloads.",
    expectedBehavior: "Refreshing the dynamic dashboard page preserves workspace tokens and user profiles.",
    acceptanceCriteria: ["Refreshing does not sign user out", "Active tab state persists", "Cookies are secure"],
    notes: ""
  },
  {
    id: "check-25",
    level: "Feature QA",
    title: "Search query filters results dynamically",
    category: "Functionality",
    priority: "High",
    type: "Functionality",
    automation: "Automated",
    status: "Passed",
    description: "Ensure typing queries filters dynamic tables instantly via memoized calculations.",
    expectedBehavior: "Table matches titles and categories immediately with minimal latency.",
    acceptanceCriteria: ["Typing triggers immediate search filter", "Highlights query substring", "Displays empty states on no match"],
    notes: ""
  },
  {
    id: "check-26",
    level: "Feature QA",
    title: "Notification bell increments correctly",
    category: "Functionality",
    priority: "Medium",
    type: "Functionality",
    automation: "Automated",
    status: "Passed",
    description: "Verify the notification badge updates dynamically when issues are created or runs finish.",
    expectedBehavior: "A colored bubble appears on top of the notification bell with matching badge details.",
    acceptanceCriteria: ["Dot overlay appears on bell", "Count increments match events", "Clicking clears numbers"],
    notes: ""
  },

  // Release QA (Checks 27-30)
  {
    id: "check-27",
    level: "Release QA",
    title: "Terminology is consistent",
    category: "Content",
    priority: "High",
    type: "Content",
    automation: "Human Review",
    status: "Passed",
    description: "Ensure labeling variables like 'Workspace', 'QA runs', and 'Projects' align across pages.",
    expectedBehavior: "Consistency prevents user confusion during application routing.",
    acceptanceCriteria: ["Identical labels on headers", "Terms match platform documentation", "No spelling variance"],
    notes: ""
  },
  {
    id: "check-28",
    level: "Release QA",
    title: "Grammar and spelling are correct",
    category: "Content",
    priority: "Low",
    type: "Content",
    automation: "Human Review",
    status: "Passed",
    description: "Audit microcopy, descriptions, and dynamic help copy to ensure error-free grammar.",
    expectedBehavior: "Language appears professional, clean, and contains zero typos.",
    acceptanceCriteria: ["Spell check validates copy", "Punctuation is correct", "Professional developer vocabulary"],
    notes: ""
  },
  {
    id: "check-29",
    level: "Release QA",
    title: "Calls-to-action are clear",
    category: "Content",
    priority: "High",
    type: "Content",
    automation: "Human Review",
    status: "Passed",
    description: "Confirm action terms (e.g. Save, Run) explicitly state the end result.",
    expectedBehavior: "Buttons employ action verbs rather than generic text.",
    acceptanceCriteria: ["Buttons use direct action terms", "CTA has clear target outcomes", "Hover notes clarify actions"],
    notes: ""
  },
  {
    id: "check-30",
    level: "Release QA",
    title: "Final security review approval",
    category: "Functionality",
    priority: "Critical",
    type: "Security",
    automation: "Automated",
    status: "Passed",
    description: "Confirm third-party vulnerability scripts log zero high-risk exposure vulnerabilities.",
    expectedBehavior: "Build dependencies remain up to date and contain zero critical CVE warnings.",
    acceptanceCriteria: ["Vulnerability scans pass", "SSL setups redirect successfully", "Cookie variables use Secure parameters"],
    notes: ""
  }
];

// Dynamic Quality Score Dial
function QualityCircleDashboard({
  percentage,
  animating = false,
}: {
  percentage: number;
  animating?: boolean;
}) {
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

// Editable Tags Component
function EditableTags({
  title,
  tags,
  onSave,
}: {
  title: string;
  tags: string[];
  onSave: (newTags: string[]) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [currentTags, setCurrentTags] = useState(tags);

  useEffect(() => {
    setCurrentTags(tags);
  }, [tags]);

  const handleAdd = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      const next = [...currentTags, tagInput.trim()];
      setCurrentTags(next);
      setTagInput("");
    }
  };

  const handleRemove = (tag: string) => {
    const next = currentTags.filter((t) => t !== tag);
    setCurrentTags(next);
  };

  const handleSave = () => {
    onSave(currentTags);
    setIsEditing(false);
  };

  return (
    <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
            {title}
          </h4>
          <button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="p-1 text-on-surface-variant hover:text-primary transition-all cursor-pointer"
          >
            {isEditing ? (
              <span className="text-[10px] font-bold text-primary uppercase">Save</span>
            ) : (
              <Edit3 size={12} />
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {currentTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-surface-container-low border border-outline text-[11px] text-on-surface px-2 py-0.5 rounded font-medium"
            >
              {tag}
              {isEditing && (
                <button
                  onClick={() => handleRemove(tag)}
                  className="text-magenta hover:text-on-surface transition-colors cursor-pointer"
                >
                  <X size={10} />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-1.5 mt-3 pt-2 border-t border-outline-variant">
          <input
            type="text"
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="flex-1 bg-surface-container-low border border-outline rounded px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="bg-primary text-on-primary-container px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded cursor-pointer"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

// Custom Filter Dropdown
function FilterDropdown({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
}) {
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
        <span>{label}</span>
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
              className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer ${selected === opt
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

// QA Presets Suites
const QA_SUITES = [
  {
    id: "full",
    name: "Full QA Suite",
    description: "Run comprehensive automated checks across all features and platforms.",
    icon: Sparkles,
  },
  {
    id: "smoke",
    name: "Smoke Test",
    description: "Verify critical paths and high-priority functionality to ensure basic stability.",
    icon: Shield,
  },
  {
    id: "regression",
    name: "Regression Suite",
    description: "Validate system stability and check for side effects after updates.",
    icon: RotateCw,
  },
  {
    id: "accessibility",
    name: "Accessibility Audit",
    description: "Validate WCAG compliance and accessibility rules.",
    icon: Eye,
  },
  {
    id: "performance",
    name: "Performance Check",
    description: "Measure loading metrics, Lighthouse scores, and speed degradation.",
    icon: Activity,
  },
  {
    id: "responsive",
    name: "Responsive Validation",
    description: "Test layout behavior and usability on mobile, tablet, and desktop viewports.",
    icon: Smartphone,
  },
  {
    id: "custom",
    name: "Custom Run",
    description: "Configure specific test suites, environments, and devices manually.",
    icon: SlidersHorizontal,
  },
];

// Rich Test Run Interface for the Linear table
interface DetailedTestRun {
  id: string;
  runNumber: number;
  suite: string;
  status: "Completed" | "Running" | "Failed" | "Cancelled" | "Queued";
  qualityScore: number;
  scoreTrend: {
    type: "improvement" | "decline" | "neutral";
    text: string;
  };
  passed: number;
  failed: number;
  coverage: number;
  environment: "Production" | "Staging" | "Local";
  executed: string;
  duration: string;
  scopeExecuted: string[];
  majorFailures: string[];
}

const initialDetailedRuns: DetailedTestRun[] = [
  {
    id: "run-18",
    runNumber: 18,
    suite: "Regression Suite",
    status: "Completed",
    qualityScore: 92,
    scoreTrend: { type: "improvement", text: "↑ +3 Quality Score" },
    passed: 482,
    failed: 6,
    coverage: 84,
    environment: "Production",
    executed: "2 hours ago",
    duration: "4m 12s",
    scopeExecuted: ["Product QA", "Page QA", "Component QA", "Feature QA"],
    majorFailures: [],
  },
  {
    id: "run-17",
    runNumber: 17,
    suite: "Accessibility Audit",
    status: "Completed",
    qualityScore: 88,
    scoreTrend: { type: "decline", text: "↓ -4 Accessibility" },
    passed: 312,
    failed: 14,
    coverage: 76,
    environment: "Staging",
    executed: "5 hours ago",
    duration: "2m 45s",
    scopeExecuted: ["Page QA", "Component QA"],
    majorFailures: ["Image alt text missing on main gallery viewport", "Contrast ratio below 4.5:1 on footer secondary tags"],
  },
  {
    id: "run-16",
    runNumber: 16,
    suite: "Full QA Suite",
    status: "Failed",
    qualityScore: 74,
    scoreTrend: { type: "decline", text: "↓ -8 Product QA" },
    passed: 1204,
    failed: 48,
    coverage: 82,
    environment: "Production",
    executed: "Yesterday",
    duration: "12m 30s",
    scopeExecuted: ["Product QA", "Page QA", "Component QA", "Feature QA", "Release QA"],
    majorFailures: ["Session timeout fails to redirect to login prompt", "Checkout API responds with 500 error on checkout submissions"],
  },
  {
    id: "run-15",
    runNumber: 15,
    suite: "Smoke Test",
    status: "Completed",
    qualityScore: 94,
    scoreTrend: { type: "neutral", text: "No Change" },
    passed: 85,
    failed: 0,
    coverage: 92,
    environment: "Local",
    executed: "Yesterday",
    duration: "1m 15s",
    scopeExecuted: ["Product QA", "Feature QA"],
    majorFailures: [],
  },
  {
    id: "run-14",
    runNumber: 14,
    suite: "Performance Check",
    status: "Cancelled",
    qualityScore: 0,
    scoreTrend: { type: "neutral", text: "No Change" },
    passed: 140,
    failed: 4,
    coverage: 62,
    environment: "Staging",
    executed: "2 days ago",
    duration: "35s",
    scopeExecuted: ["Component QA"],
    majorFailures: ["Manual abort by admin@qa.platform"],
  },
  {
    id: "run-13",
    runNumber: 13,
    suite: "Responsive Validation",
    status: "Completed",
    qualityScore: 90,
    scoreTrend: { type: "improvement", text: "↑ +2 Viewports" },
    passed: 420,
    failed: 2,
    coverage: 80,
    environment: "Production",
    executed: "3 days ago",
    duration: "6m 18s",
    scopeExecuted: ["Page QA", "Component QA"],
    majorFailures: [],
  },
];

function ProjectDashboardContent({ id }: { id: string }) {
  const router = useRouter();

  // Selected project database check
  const project = useMemo(() => {
    return projectDatabase[id] || projectDatabase["1"]; // Default to CreativeHub
  }, [id]);

  // Page active tab
  const [activeTab, setActiveTab] = useState("Overview");

  // Sidebar state (default collapsed inside a project page)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("qa-sidebar-collapsed");
    if (stored !== null) {
      setSidebarCollapsed(stored === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("qa-sidebar-collapsed", String(next));
      return next;
    });
  };

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  // Dynamic values
  const [currentScore, setCurrentScore] = useState(project.qualityScore);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState(
    `${project.name} is a high-performance workspace designed to deliver professional services. Currently verifying critical integrations, automated scripts, and conducting human evaluation to achieve 100% test depth.`
  );

  // Editable lists
  const [users, setUsers] = useState(["Creators", "Recruiters", "Visitors", "Administrators"]);
  const [features, setFeatures] = useState([
    "Authentication",
    "Portfolio Upload",
    "Project Discovery",
    "Comments",
    "Likes",
    "Search",
    "Notifications",
    "Analytics",
  ]);
  const [workflows, setWorkflows] = useState([
    "Create Account",
    "Upload Portfolio",
    "Browse Projects",
    "Follow Creators",
    "Manage Profile",
    "Search Content",
  ]);
  const [risks, setRisks] = useState([
    "Media Upload Reliability",
    "Search Accuracy",
    "Mobile Responsiveness",
    "Accessibility",
    "Large Content Rendering",
  ]);

  // Test Runs Tab States
  const [detailedRuns, setDetailedRuns] = useState<DetailedTestRun[]>(initialDetailedRuns);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  
  // Test Runs Filters
  const [runsSearch, setRunsSearch] = useState("");
  const [runsFilterStatus, setRunsFilterStatus] = useState("All");
  const [runsFilterSuite, setRunsFilterSuite] = useState("All");
  const [runsFilterEnv, setRunsFilterEnv] = useState("All");
  const [runsFilterBrowser, setRunsFilterBrowser] = useState("All");
  const [runsFilterDate, setRunsFilterDate] = useState("All");
  const [runsSort, setRunsSort] = useState("Newest");

  // Run QA Modal Inputs
  const [showRunModal, setShowRunModal] = useState(false);
  const [modalRunName, setModalRunName] = useState("");
  const [modalEnv, setModalEnv] = useState("Staging");
  const [modalBrowser, setModalBrowser] = useState("Chrome");
  const [modalDevice, setModalDevice] = useState("Desktop");
  const [modalScope, setModalScope] = useState<string[]>(["Product QA", "Page QA", "Component QA"]);

  // Detailed Running Simulation State
  const [isCurrentlyRunning, setIsCurrentlyRunning] = useState(false);
  const [runningProgress, setRunningProgress] = useState(0);
  const [runningStage, setRunningStage] = useState("");
  const [runningTimeRemaining, setRunningTimeRemaining] = useState("");
  const [runningSuite, setRunningSuite] = useState("");
  const [runningIntervalId, setRunningIntervalId] = useState<any>(null);

  // Simulated Test Runs State
  const [runs, setRuns] = useState<TestRun[]>([
    { id: "15", name: "Run #15", completed: "2 hours ago", passed: 412, failed: 7, warnings: 11, status: "Completed" },
    { id: "14", name: "Run #14", completed: "Yesterday", passed: 398, failed: 12, warnings: 8, status: "Completed" },
    { id: "13", name: "Run #13", completed: "3 days ago", passed: 420, failed: 2, warnings: 15, status: "Completed" },
  ]);

  // Simulated Activity State
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: "1", time: "1 hour ago", icon: AlertTriangle, description: "New issue detected in Search workflows", color: "text-magenta" },
    { id: "2", time: "3 hours ago", icon: Eye, description: "Human review submitted by Alex R.", color: "text-primary" },
    { id: "3", time: "Today", icon: Activity, description: "Accessibility run completed on Portfolio view", color: "text-primary" },
    { id: "4", time: "Today", icon: CheckCircle2, description: "Quality score updated after pipeline scan", color: "text-primary" },
    { id: "5", time: "2 days ago", icon: Sparkles, description: "QA Framework generated from PRD docs", color: "text-magenta" },
  ]);

  // Simulated state trigger toggles
  const [isSimulatingQA, setIsSimulatingQA] = useState(false);
  const [simulateEmptyState, setSimulateEmptyState] = useState(false);

  /* ─── QA FRAMEWORK WORKSPACE STATES ─── */
  const [checks, setChecks] = useState<QaCheck[]>(initialQaChecks);
  const [selectedLevel, setSelectedLevel] = useState<string>("Product QA");
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);

  // Collapse/Expand state for categories
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

  const toggleCategory = useCallback((catName: string) => {
    setCollapsedCats((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  }, []);

  // Filter parameters
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterAutomation, setFilterAutomation] = useState("All");

  // Selected check details local inputs sync
  const selectedCheck = useMemo(() => {
    return checks.find((c) => c.id === selectedCheckId) || null;
  }, [checks, selectedCheckId]);

  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState<"Critical" | "High" | "Medium" | "Low">("Low");
  const [editStatus, setEditStatus] = useState<"Not Started" | "In Progress" | "Passed" | "Failed" | "Skipped">("Not Started");
  const [editDescription, setEditDescription] = useState("");
  const [editExpected, setEditExpected] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editCriteria, setEditCriteria] = useState<string[]>([]);

  useEffect(() => {
    if (selectedCheck) {
      setEditTitle(selectedCheck.title);
      setEditCategory(selectedCheck.category);
      setEditPriority(selectedCheck.priority);
      setEditStatus(selectedCheck.status);
      setEditDescription(selectedCheck.description);
      setEditExpected(selectedCheck.expectedBehavior);
      setEditNotes(selectedCheck.notes);
      setEditCriteria([...selectedCheck.acceptanceCriteria]);
    }
  }, [selectedCheck]);

  // Dynamic Levels progress count
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
        if (runsSort === "Newest") {
          return b.runNumber - a.runNumber;
        }
        if (runsSort === "Oldest") {
          return a.runNumber - b.runNumber;
        }
        if (runsSort === "Highest Score") {
          return b.qualityScore - a.qualityScore;
        }
        if (runsSort === "Lowest Score") {
          return a.qualityScore - b.qualityScore;
        }
        return 0;
      });
  }, [detailedRuns, runsSearch, runsFilterStatus, runsFilterSuite, runsFilterEnv, runsSort]);

  // Filtered QA Checklist Memo
  const filteredChecks = useMemo(() => {
    return checks.filter((c) => {
      if (c.level !== selectedLevel) return false;

      // Live search filter
      if (searchText.trim() !== "") {
        const q = searchText.toLowerCase();
        const matches =
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Select filters
      if (filterCategory !== "All" && c.category !== filterCategory) return false;
      if (filterPriority !== "All" && c.priority !== filterPriority) return false;
      if (filterStatus !== "All" && c.status !== filterStatus) return false;
      if (filterAutomation !== "All" && c.automation !== filterAutomation) return false;

      return true;
    });
  }, [checks, selectedLevel, searchText, filterCategory, filterPriority, filterStatus, filterAutomation]);

  // Categorize checks for rendering
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

  // Save edit changes back to checklist database
  const handleSaveCheck = () => {
    if (!selectedCheckId) return;
    setChecks((prev) =>
      prev.map((c) =>
        c.id === selectedCheckId
          ? {
            ...c,
            title: editTitle,
            category: editCategory,
            priority: editPriority,
            status: editStatus,
            description: editDescription,
            expectedBehavior: editExpected,
            notes: editNotes,
            acceptanceCriteria: editCriteria,
          }
          : c
      )
    );
    showToast("QA Check details updated successfully!", "success");
  };

  // Toggle checklist subitems
  const toggleSubItem = (idx: number) => {
    setEditCriteria((prev) =>
      prev.map((c, i) => (i === idx ? (c.startsWith("✓ ") ? c.replace("✓ ", "") : `✓ ${c}`) : c))
    );
  };

  // Toasts
  const [toasts, setToasts] = useState<{ id: string; message: string; type: string }[]>([]);
  const showToast = (message: string, type: string = "success") => {
    const tid = Date.now().toString();
    setToasts((prev) => [...prev, { id: tid, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== tid));
    }, 3000);
  };

  // Effect to clean up simulated running intervals on component unmount
  useEffect(() => {
    return () => {
      if (runningIntervalId) {
        clearInterval(runningIntervalId);
      }
    };
  }, [runningIntervalId]);

  // Open modal config on Run QA clicks
  const handleRunQA = () => {
    const nextNum = detailedRuns[0] ? detailedRuns[0].runNumber + 1 : 19;
    setModalRunName(`Regression Suite #${nextNum}`);
    setShowRunModal(true);
  };

  const handleStartDetailedRun = (suiteName: string) => {
    setShowRunModal(false);
    
    // Clear any active interval
    if (runningIntervalId) {
      clearInterval(runningIntervalId);
    }
    
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
    
    // Prepend running item to detailed runs
    setDetailedRuns(prev => [newDetailedRun, ...prev]);
    
    // Add corresponding entry to overview list
    const newOverviewRun: TestRun = {
      id: nextNum.toString(),
      name: `${suiteName} #${nextNum}`,
      completed: "Just now",
      passed: 0,
      failed: 0,
      warnings: 0,
      status: "Running" as any,
    };
    setRuns(prev => [newOverviewRun, ...prev.slice(0, 2)]);

    // Add running activity
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
        
        // Randomly simulate success or minor failures
        const failedCount = Math.floor(Math.random() * 8); // 0 to 7 failures
        const passedCount = Math.floor(Math.random() * 150) + 300; // 300 to 450 passed
        const newScore = failedCount === 0 ? 98 : Math.max(72, 94 - failedCount * 3);
        const finalStatus = failedCount > 5 ? "Failed" : "Completed";
        
        // Score trend comparison
        const scoreDiff = newScore - project.qualityScore;
        const trendText = scoreDiff > 0 ? `↑ +${scoreDiff} Quality Score` : scoreDiff < 0 ? `↓ ${Math.abs(scoreDiff)} Quality Score` : "No Change";
        const trendType = scoreDiff > 0 ? "improvement" : scoreDiff < 0 ? "decline" : "neutral";
        
        setDetailedRuns(prev =>
          prev.map(run =>
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
                    ? [
                        "WCAG target color contrast mismatch on footer tags",
                        "Button interaction fails to update product store badge"
                      ]
                    : [],
                }
              : run
          )
        );
        
        // Update overview quality score
        setCurrentScore(newScore);
        setScoreAnimation(true);
        setTimeout(() => setScoreAnimation(false), 1500);
        
        // Update overview runs
        setRuns(prev =>
          prev.map(run =>
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

        // Update activities
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
        const currentStage = stages.find(s => progress <= s.maxPrg) || stages[stages.length - 1];
        setRunningStage(currentStage.stage);
        setRunningTimeRemaining(currentStage.time);
        
        // Live update progress stats in detailedRuns
        setDetailedRuns(prev =>
          prev.map(run =>
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
    
    const nextNum = detailedRuns[0] ? detailedRuns[0].runNumber : 19;
    const runningRun = detailedRuns.find(r => r.status === "Running");
    
    if (runningRun) {
      setDetailedRuns(prev =>
        prev.map(run =>
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
      
      setRuns(prev =>
        prev.map(run =>
          run.status === "Running" as any
            ? {
                ...run,
                status: "Failed" as any,
              }
            : run
        )
      );
    }
    
    showToast("Automated QA run cancelled by user.", "info");
  };

  // Badge Class Helpers
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
        return "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400";
      case "Not Started":
        return "bg-surface-container-highest border border-outline text-text-muted";
      case "In Progress":
        return "bg-yellow-dim border border-yellow/30 text-yellow";
      case "Passed":
        return "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400";
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

  return (
    <div className="flex overflow-hidden w-full bg-background min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Workspace Frame */}
      <main
        className="flex-grow h-screen overflow-y-auto"
      >
        <Header sidebarWidth={sidebarWidth} />
        <div style={{ height: 64 }} />

        {/* Dashboard Frame */}
        <div className="p-6 space-y-6">
          {/* Top Panel Actions & Simulation Switcher */}

          {/* Project Details Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="neo-border bg-surface p-6 rounded-xl flex flex-col md:flex-row justify-between gap-6"
          >
            {/* Left Info */}
            <div className="space-y-4 flex-grow">
              <div className="flex items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2
                      style={{ fontSize: 32, lineHeight: 1.1, letterSpacing: "-0.015em" }}
                      className="font-bold text-on-surface"
                    >
                      {project.name}
                    </h2>
                    <span
                      style={{ fontSize: 10, letterSpacing: "0.02em" }}
                      className={`tag font-mono py-1 px-2.5 rounded ${getStatusBadgeClass(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant uppercase font-semibold">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Metadata strip */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-on-surface-variant uppercase pt-2 border-t border-outline-variant">
                <div>
                  Last Updated: <span className="text-on-surface font-semibold">{project.lastUpdated}</span>
                </div>
                <div>
                  Framework Version: <span className="text-on-surface font-semibold">{project.version}</span>
                </div>
                <div>
                  Created: <span className="text-on-surface font-semibold">{project.createdDate}</span>
                </div>
              </div>
            </div>

            {/* Right Quality Score */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                    Overall Quality Score
                  </p>
                  <p className="text-xs text-primary font-bold mt-1 flex items-center justify-end gap-1.5">
                    <span>+5 since last assessment</span>
                  </p>
                </div>
                <QualityCircleDashboard percentage={currentScore} animating={scoreAnimation} />
              </div>

              {/* Actions CTAs */}
              <div className="flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRunQA}
                  disabled={isSimulatingQA}
                  className="bg-primary text-on-primary-container px-5 py-3 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all rounded-lg cursor-pointer min-w-32 disabled:opacity-50"
                >
                  {isSimulatingQA ? (
                    <>
                      <RotateCw size={14} className="animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="currentColor" />
                      Run QA
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => showToast("Opening workspace settings...")}
                  className="neo-border px-5 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:border-outline-variant transition-all rounded-lg cursor-pointer"
                >
                  Edit Project
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Project Horizontal Navigation Tabs */}
          <nav className="flex gap-1 border-b border-outline-variant relative z-10">
            {["Overview", "QA Framework", "Test Runs", "Human Reviews", "Issues", "Reports"].map(
              (tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all relative cursor-pointer ${isActive ? "text-primary font-bold" : "text-on-surface-variant hover:text-on-surface"
                      }`}
                  >
                    {tab}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                );
              }
            )}
          </nav>

          {/* Dynamic Active Tab View renders */}
          <div className="min-h-[400px]">
            {activeTab === "QA Framework" ? (
              /* ═══════════════════════════════════════════════
                 QA FRAMEWORK INTERACTIVE WORKSPACE
                 ═══════════════════════════════════════════════ */
              <div className="space-y-6">
                {/* Framework Summary Top Banner Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.keys(levelProgress).map((lvl) => {
                    const prog = levelProgress[lvl];
                    const isSelected = selectedLevel === lvl;
                    const LvlIcon = getLevelIcon(lvl);
                    return (
                      <motion.button
                        key={lvl}
                        onClick={() => setSelectedLevel(lvl)}
                        whileHover={{ y: -2 }}
                        className={`neo-border text-left p-4 rounded-xl transition-all cursor-pointer flex flex-col justify-between ${isSelected
                            ? "border-primary bg-cyan-dim glow-cyan"
                            : "bg-surface hover:border-outline-variant"
                          }`}
                      >
                        <div className="flex justify-between items-center w-full mb-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-primary text-on-primary-container" : "bg-surface-container-high text-primary"}`}>
                            <LvlIcon size={16} />
                          </div>
                          <span className="font-mono text-xs font-bold text-on-surface">
                            {prog.percent}%
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                            {lvl}
                          </p>
                          <h4 className="text-base font-bold text-on-surface mt-1">
                            {prog.total} Checks
                          </h4>
                        </div>
                        <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden mt-3">
                          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${prog.percent}%` }} />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* 3-Panel Layout Grid */}
                <div className="grid grid-cols-12 gap-5 items-start">

                  {/* LEFT PANEL: QA Levels Navigation (20% width / 2 cols) */}
                  <div className="col-span-12 md:col-span-3 lg:col-span-2 space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono px-2 mb-3 block">
                      QA Levels
                    </h3>
                    <div className="space-y-1">
                      {Object.keys(levelProgress).map((lvl) => {
                        const prog = levelProgress[lvl];
                        const isSelected = selectedLevel === lvl;
                        const LvlIcon = getLevelIcon(lvl);
                        return (
                          <button
                            key={lvl}
                            onClick={() => setSelectedLevel(lvl)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${isSelected
                                ? "bg-surface-container-high border-l-4 border-l-primary border-outline text-on-surface"
                                : "bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <LvlIcon size={14} className={isSelected ? "text-primary" : "text-text-muted"} />
                              <span>{lvl}</span>
                            </div>
                            <span className="font-mono text-[10px] text-text-muted">
                              {prog.passed}/{prog.total}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CENTER PANEL: Database (always full remaining width) */}
                  <div className="col-span-12 md:col-span-9 lg:col-span-10 space-y-4">

                    {/* Database Header Summary */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-on-surface">{selectedLevel}</h2>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Evaluate the overall quality, usability, accessibility, consistency, and experience of the application.
                        </p>
                      </div>

                      {/* Active Level Progress bar */}
                      <div className="text-right min-w-32">
                        <span className="text-xs font-mono font-bold text-primary">
                          {levelProgress[selectedLevel]?.percent}% Complete
                        </span>
                        <p className="text-[10px] text-text-muted font-mono uppercase mt-0.5">
                          {levelProgress[selectedLevel]?.passed} / {levelProgress[selectedLevel]?.total} checks completed
                        </p>
                        <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden mt-1.5">
                          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${levelProgress[selectedLevel]?.percent}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Filters & Search Toolbar */}
                    <div className="neo-border bg-surface p-4 rounded-xl space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Check list */}
                        <div className="relative flex-grow">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                          <input
                            type="text"
                            placeholder="Search QA checks..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline rounded-lg text-xs pl-9 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary placeholder:text-text-muted"
                          />
                        </div>
                      </div>

                      {/* Stackable Filter Chips */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Category filter dropdown or clear chip */}
                        {filterCategory !== "All" ? (
                          <span className="inline-flex items-center gap-1.5 bg-cyan-dim border border-cyan/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-lg">
                            <span>Category: {filterCategory}</span>
                            <button onClick={() => setFilterCategory("All")} className="hover:text-on-surface cursor-pointer"><X size={12} /></button>
                          </span>
                        ) : (
                          <FilterDropdown
                            label="Category"
                            options={["All", "Navigation", "Branding", "Accessibility", "User Experience", "Performance", "Content", "Functionality", "Security", "Visual"]}
                            selected={filterCategory}
                            onSelect={setFilterCategory}
                          />
                        )}

                        {/* Priority Filter */}
                        {filterPriority !== "All" ? (
                          <span className="inline-flex items-center gap-1.5 bg-cyan-dim border border-cyan/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-lg">
                            <span>Priority: {filterPriority}</span>
                            <button onClick={() => setFilterPriority("All")} className="hover:text-on-surface cursor-pointer"><X size={12} /></button>
                          </span>
                        ) : (
                          <FilterDropdown
                            label="Priority"
                            options={["All", "Critical", "High", "Medium", "Low"]}
                            selected={filterPriority}
                            onSelect={setFilterPriority}
                          />
                        )}

                        {/* Status Filter */}
                        {filterStatus !== "All" ? (
                          <span className="inline-flex items-center gap-1.5 bg-cyan-dim border border-cyan/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-lg">
                            <span>Status: {filterStatus}</span>
                            <button onClick={() => setFilterStatus("All")} className="hover:text-on-surface cursor-pointer"><X size={12} /></button>
                          </span>
                        ) : (
                          <FilterDropdown
                            label="Status"
                            options={["All", "Not Started", "In Progress", "Passed", "Failed", "Skipped"]}
                            selected={filterStatus}
                            onSelect={setFilterStatus}
                          />
                        )}

                        {/* Automation Filter */}
                        {filterAutomation !== "All" ? (
                          <span className="inline-flex items-center gap-1.5 bg-cyan-dim border border-cyan/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-lg">
                            <span>Type: {filterAutomation}</span>
                            <button onClick={() => setFilterAutomation("All")} className="hover:text-on-surface cursor-pointer"><X size={12} /></button>
                          </span>
                        ) : (
                          <FilterDropdown
                            label="Automation"
                            options={["All", "Automated", "Human Review"]}
                            selected={filterAutomation}
                            onSelect={setFilterAutomation}
                          />
                        )}
                      </div>
                    </div>

                    {/* Notion/Linear Database Checklist */}
                    <div className="space-y-4">
                      {Object.keys(checksByCategory).length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-outline bg-surface rounded-xl p-6">
                          <AlertTriangle className="text-yellow mx-auto mb-2" size={32} />
                          <h4 className="text-sm font-bold text-on-surface">No QA Checks Found</h4>
                          <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
                            No checks match the active search query or filter tags. Clear filters to restore checklist rows.
                          </p>
                        </div>
                      ) : (
                        Object.keys(checksByCategory).map((catName) => {
                          const categoryChecks = checksByCategory[catName];
                          const total = categoryChecks.length;
                          const passed = categoryChecks.filter((c) => c.status === "Passed").length;
                          const isCollapsed = collapsedCats[catName] || false;

                          return (
                            <div key={catName} className="neo-border bg-surface rounded-xl overflow-hidden">
                              {/* Category Header */}
                              <div
                                onClick={() => toggleCategory(catName)}
                                className="flex justify-between items-center p-3.5 bg-surface-container border-b border-outline-variant cursor-pointer hover:bg-surface-container-high transition-colors select-none"
                              >
                                <div className="flex items-center gap-2 text-xs font-bold text-on-surface uppercase tracking-wider font-mono">
                                  <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
                                  <span>{catName}</span>
                                </div>
                                <span className="font-mono text-[10px] text-text-muted">
                                  {passed} / {total} checks completed
                                </span>
                              </div>

                              {/* Category Checklist table */}
                              <AnimatePresence initial={false}>
                                {!isCollapsed && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "auto" }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-surface-container-low border-b border-outline text-text-muted uppercase font-mono text-[10px] tracking-wider">
                                          <th className="p-3 w-32">Status</th>
                                          <th className="p-3">QA Check</th>
                                          <th className="p-3 w-28">Priority</th>
                                          <th className="p-3 w-28">Type</th>
                                          <th className="p-3 w-32">Automation</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {categoryChecks.map((checkRow) => {
                                          const isCheckSelected = selectedCheckId === checkRow.id;
                                          return (
                                            <tr
                                              key={checkRow.id}
                                              onClick={() => setSelectedCheckId(checkRow.id)}
                                              className={`border-b border-outline last:border-b-0 cursor-pointer transition-all hover:bg-surface-container-low ${isCheckSelected ? "bg-cyan-dim/40 hover:bg-cyan-dim/50 border-l-4 border-l-primary" : ""
                                                }`}
                                            >
                                              {/* Status */}
                                              <td className="p-3 font-semibold">
                                                <span className={`tag font-mono uppercase whitespace-nowrap text-[9px] ${getStatusBadgeClass(checkRow.status)}`}>
                                                  {checkRow.status}
                                                </span>
                                              </td>

                                              {/* Title */}
                                              <td className="p-3 font-medium text-on-surface max-w-xs truncate" title={checkRow.title}>
                                                {checkRow.title}
                                              </td>

                                              {/* Priority */}
                                              <td className="p-3">
                                                <span className={`tag font-mono uppercase text-[9px] ${getPriorityBadgeClass(checkRow.priority)}`}>
                                                  {checkRow.priority}
                                                </span>
                                              </td>

                                              {/* Type */}
                                              <td className="p-3 text-on-surface-variant font-medium">
                                                {checkRow.type}
                                              </td>

                                              {/* Automation */}
                                              <td className="p-3">
                                                <div className="flex items-center gap-1.5 text-on-surface-variant">
                                                  {checkRow.automation === "Automated" ? (
                                                    <>
                                                      <Cpu size={12} className="text-primary" />
                                                      <span className="font-semibold text-[10px]">Automated</span>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <User size={12} className="text-yellow" />
                                                      <span className="font-semibold text-[10px]">Human</span>
                                                    </>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* RIGHT PANEL: Details slider editor (Linear-style fixed right-side drawer overlay) */}
                  <AnimatePresence>
                    {selectedCheck && (
                      <>
                        {/* Backdrop */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedCheckId(null)}
                          className="fixed inset-0 bg-background/60 backdrop-blur-xs z-40 cursor-pointer"
                        />
                        {/* Drawer */}
                        <motion.div
                          initial={{ x: "100%", opacity: 0.8 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: "100%", opacity: 0.8 }}
                          transition={{ type: "spring", stiffness: 320, damping: 30 }}
                          className="fixed right-0 top-0 h-screen w-[32vw] min-w-[380px] max-w-[480px] bg-surface border-l border-outline-variant p-5 space-y-4 shadow-2xl z-50 overflow-y-auto"
                        >
                        {/* Panel Header */}
                        <div className="flex justify-between items-center border-b border-outline-variant pb-2.5">
                          <div className="flex items-center gap-1.5 text-primary">
                            <Info size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                              QA Check Details
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedCheckId(null)}
                            className="p-1 text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {/* Title input */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono">
                            QA Check Title
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline rounded-lg text-xs font-semibold text-on-surface px-3 py-2 focus:outline-none focus:border-primary"
                          />
                        </div>

                        {/* Category, Priority & Status Dropdown Selectors */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono">
                                Category
                              </label>
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="w-full bg-surface-container-low border border-outline rounded-lg text-xs font-semibold px-2 py-1.5 text-on-surface cursor-pointer"
                              >
                                <option value="Navigation">Navigation</option>
                                <option value="Branding">Branding</option>
                                <option value="Accessibility">Accessibility</option>
                                <option value="User Experience">User Experience</option>
                                <option value="Performance">Performance</option>
                                <option value="Content">Content</option>
                                <option value="Functionality">Functionality</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono">
                                Priority
                              </label>
                              <select
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value as any)}
                                className="w-full bg-surface-container-low border border-outline rounded-lg text-xs font-semibold px-2 py-1.5 text-on-surface cursor-pointer"
                              >
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono">
                                Status
                              </label>
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as any)}
                                className="w-full bg-surface-container-low border border-outline rounded-lg text-xs font-semibold px-2 py-1.5 text-on-surface cursor-pointer"
                              >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Passed">Passed</option>
                                <option value="Failed">Failed</option>
                                <option value="Skipped">Skipped</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Automation indicator */}
                        <div className="flex items-center gap-2 py-1.5 border-y border-outline-variant">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono">
                            Validation Mode:
                          </span>
                          <span className={`tag font-mono text-[9px] py-0.5 px-2 rounded ${selectedCheck.automation === "Automated" ? "bg-cyan-dim text-primary border border-cyan/20" : "bg-yellow-dim text-yellow border border-yellow/20"
                            }`}>
                            {selectedCheck.automation}
                          </span>
                        </div>

                        {/* Expected Behaviors description inputs */}
                        <div className="space-y-3.5">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                              Description
                            </label>
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              rows={3}
                              className="w-full bg-surface-container-low border border-outline rounded-lg text-xs text-on-surface-variant p-2.5 focus:outline-none focus:border-primary resize-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                              Expected Outcome
                            </label>
                            <textarea
                              value={editExpected}
                              onChange={(e) => setEditExpected(e.target.value)}
                              rows={3}
                              className="w-full bg-surface-container-low border border-outline rounded-lg text-xs text-on-surface-variant p-2.5 focus:outline-none focus:border-primary resize-none"
                            />
                          </div>
                        </div>

                        {/* Interactive Acceptance Criteria Checklists */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                            Acceptance Criteria
                          </label>
                          <div className="space-y-1.5">
                            {editCriteria.map((item, idx) => {
                              const checked = item.startsWith("✓ ");
                              const labelText = checked ? item.replace("✓ ", "") : item;
                              return (
                                <label
                                  key={labelText}
                                  className="flex items-center gap-2 cursor-pointer select-none text-[11px]"
                                >
                                  <button
                                    onClick={() => toggleSubItem(idx)}
                                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${checked ? "bg-primary border-primary text-on-primary-container" : "border-outline text-transparent"
                                      }`}
                                  >
                                    {checked && <Check size={10} strokeWidth={3} />}
                                  </button>
                                  <span className={checked ? "text-on-surface line-through decoration-text-muted opacity-60" : "text-on-surface-variant"}>
                                    {labelText}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Notes editable input */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                            Implementation Notes
                          </label>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Add implementation notes..."
                            rows={3}
                            className="w-full bg-surface-container-low border border-outline rounded-lg text-xs text-on-surface p-2.5 focus:outline-none focus:border-primary resize-none"
                          />
                        </div>

                        {/* Save Action Footer */}
                        <button
                          onClick={handleSaveCheck}
                          className="w-full bg-primary text-on-primary-container py-2 text-xs font-bold uppercase tracking-widest rounded-lg cursor-pointer hover:opacity-90 transition-all text-center flex items-center justify-center gap-1.5 mt-2"
                        >
                          <CheckCircle2 size={14} />
                          Save Changes
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                </div>
              </div>
            ) : activeTab === "Test Runs" ? (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface">Test Runs</h2>
                    <p className="text-sm text-on-surface-variant mt-1">
                      Run automated QA suites, monitor execution, compare previous runs, and review quality improvements.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRunQA}
                      className="bg-primary text-on-primary-container px-4 py-2 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all rounded-lg cursor-pointer"
                    >
                      <Play size={12} fill="currentColor" />
                      Run QA
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => showToast("Opening latest generated report...", "success")}
                      className="neo-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:border-outline-variant transition-all rounded-lg cursor-pointer"
                    >
                      View Latest Report
                    </motion.button>
                  </div>
                </div>

                {/* Running Test Card (Only visible during active execution) */}
                <AnimatePresence>
                  {isCurrentlyRunning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -20 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -20 }}
                      className="neo-border bg-surface-dim p-6 rounded-xl space-y-4 glow-cyan overflow-hidden"
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-base font-bold text-on-surface">{runningSuite}</h3>
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-xs text-primary font-semibold uppercase tracking-wider font-mono">
                              Running...
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            Current Stage: <span className="text-on-surface font-semibold font-mono">{runningStage}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-text-muted uppercase tracking-wider font-mono font-bold">
                            Estimated Time
                          </p>
                          <p className="text-xs font-semibold text-on-surface font-mono">
                            {runningTimeRemaining} remaining
                          </p>
                        </div>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-on-surface-variant font-mono">
                          <span>Progress</span>
                          <span>{runningProgress}%</span>
                        </div>
                        <div className="h-2 bg-surface-container-high w-full rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300 ease-out"
                            style={{ width: `${runningProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Action buttons inside progress card */}
                      <div className="flex justify-end gap-2.5 pt-2">
                        <button
                          onClick={() => showToast("Monitoring active console stream...", "info")}
                          className="px-3.5 py-1.5 bg-surface-container-low border border-outline hover:border-outline-variant text-on-surface-variant hover:text-on-surface text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          View Progress
                        </button>
                        <button
                          onClick={handleCancelDetailedRun}
                          className="px-3.5 py-1.5 bg-surface-container-low border border-magenta/20 hover:border-magenta text-magenta text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel Run
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick QA Suites presets */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                    Quick QA Suites Presets
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {QA_SUITES.map((suite) => {
                      const SuiteIcon = suite.icon;
                      return (
                        <motion.button
                          key={suite.id}
                          whileHover={{ y: -3 }}
                          onClick={() => {
                            const nextNum = detailedRuns[0] ? detailedRuns[0].runNumber + 1 : 19;
                            setModalRunName(`${suite.name} #${nextNum}`);
                            setShowRunModal(true);
                          }}
                          className="neo-border text-left p-4 rounded-xl bg-surface hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
                        >
                          <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center mb-3">
                            <SuiteIcon size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wide leading-tight">
                              {suite.name}
                            </h4>
                            <p className="text-[10px] text-text-muted mt-1 leading-normal line-clamp-3">
                              {suite.description}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Overall Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    {
                      label: "Quality Score",
                      value: `${currentScore}%`,
                      sub: "↑ +3 since previous run",
                      color: "text-primary",
                    },
                    {
                      label: "Total Runs",
                      value: detailedRuns.length.toString(),
                      sub: "Across all environments",
                      color: "text-on-surface",
                    },
                    {
                      label: "Average Duration",
                      value: "4m 12s",
                      sub: "Standard validation run",
                      color: "text-on-surface",
                    },
                    {
                      label: "Automation Coverage",
                      value: "82%",
                      sub: "Automated checks validation",
                      color: "text-primary",
                    },
                    {
                      label: "Tests Executed",
                      value: "2,184",
                      sub: "Total assertions compiled",
                      color: "text-on-surface",
                    },
                  ].map((metric) => (
                    <div key={metric.label} className="neo-border bg-surface p-4 rounded-xl space-y-1">
                      <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">
                        {metric.label}
                      </p>
                      <h4 className={`text-xl font-bold font-mono ${metric.color}`}>{metric.value}</h4>
                      <p className="text-[10px] text-text-muted font-sans font-medium">{metric.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Filters Row */}
                <div className="neo-border bg-surface p-4 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search runs input */}
                    <div className="relative flex-grow">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input
                        type="text"
                        placeholder="Search runs..."
                        value={runsSearch}
                        onChange={(e) => setRunsSearch(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline rounded-lg text-xs pl-9 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary placeholder:text-text-muted uppercase"
                      />
                    </div>
                  </div>

                  {/* Filter chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <FilterDropdown
                      label="Status"
                      options={["All", "Completed", "Running", "Failed", "Cancelled", "Queued"]}
                      selected={runsFilterStatus}
                      onSelect={setRunsFilterStatus}
                    />
                    <FilterDropdown
                      label="Suite"
                      options={["All", "Full QA Suite", "Smoke Test", "Regression Suite", "Accessibility Audit", "Performance Check", "Responsive Validation", "Custom Run"]}
                      selected={runsFilterSuite}
                      onSelect={setRunsFilterSuite}
                    />
                    <FilterDropdown
                      label="Environment"
                      options={["All", "Production", "Staging", "Local"]}
                      selected={runsFilterEnv}
                      onSelect={setRunsFilterEnv}
                    />
                    <FilterDropdown
                      label="Sort By"
                      options={["Newest", "Oldest", "Highest Score", "Lowest Score"]}
                      selected={runsSort}
                      onSelect={setRunsSort}
                    />

                    {/* Quick clear filter chip if any filters are active */}
                    {(runsSearch || runsFilterStatus !== "All" || runsFilterSuite !== "All" || runsFilterEnv !== "All") && (
                      <button
                        onClick={() => {
                          setRunsSearch("");
                          setRunsFilterStatus("All");
                          setRunsFilterSuite("All");
                          setRunsFilterEnv("All");
                        }}
                        className="text-[10px] text-magenta hover:underline uppercase font-bold tracking-wider cursor-pointer ml-1"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Runs Table List */}
                <div className="neo-border bg-surface rounded-xl overflow-hidden">
                  {filteredRuns.length === 0 ? (
                    /* Empty state illustration if filter empty */
                    <div className="text-center py-16 p-6 space-y-4">
                      <div className="w-14 h-14 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-text-muted">
                        <AlertTriangle size={24} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-on-surface">No matching test runs</h4>
                        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                          Adjust your query filter parameters or search terms to display past records.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-surface-container-low border-b border-outline text-text-muted uppercase font-mono text-[10px] tracking-wider">
                            <th className="p-3.5 w-10"></th>
                            <th className="p-3.5">Run</th>
                            <th className="p-3.5">Suite</th>
                            <th className="p-3.5 w-24">Status</th>
                            <th className="p-3.5 w-28">Quality Score</th>
                            <th className="p-3.5 w-20">Passed</th>
                            <th className="p-3.5 w-20">Failed</th>
                            <th className="p-3.5 w-20">Coverage</th>
                            <th className="p-3.5 w-28">Environment</th>
                            <th className="p-3.5 w-32">Executed</th>
                            <th className="p-3.5 w-32">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRuns.map((run) => {
                            const isExpanded = expandedRunId === run.id;
                            return (
                              <Fragment key={run.id}>
                                <tr
                                  onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                                  className={`border-b border-outline last:border-b-0 cursor-pointer transition-colors hover:bg-surface-container-low ${
                                    isExpanded ? "bg-cyan-dim/20 hover:bg-cyan-dim/30" : ""
                                  }`}
                                >
                                  {/* Expand trigger */}
                                  <td className="p-3.5 text-center">
                                    <ChevronDown
                                      size={14}
                                      className={`text-text-muted transition-transform duration-200 ${
                                        isExpanded ? "rotate-180" : ""
                                      }`}
                                    />
                                  </td>

                                  {/* Run number */}
                                  <td className="p-3.5 font-bold font-mono text-on-surface">
                                    #{run.runNumber}
                                  </td>

                                  {/* Suite label */}
                                  <td className="p-3.5 font-medium text-on-surface">
                                    {run.suite}
                                  </td>

                                  {/* Status chip */}
                                  <td className="p-3.5">
                                    <span className={`tag font-mono uppercase text-[9px] py-0.5 px-2 rounded ${getTestStatusBadgeClass(run.status)}`}>
                                      {run.status}
                                    </span>
                                  </td>

                                  {/* Score + Trend */}
                                  <td className="p-3.5 font-bold font-mono text-on-surface">
                                    {run.status === "Cancelled" ? (
                                      <span className="text-text-muted">—</span>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span>{run.qualityScore}%</span>
                                        {run.scoreTrend && run.scoreTrend.text !== "No Change" && (
                                          <span className={`text-[9px] font-sans font-semibold py-0.5 px-1 rounded ${
                                            run.scoreTrend.type === "improvement" ? "bg-emerald-dim text-emerald-400" : "bg-magenta-dim text-magenta"
                                          }`}>
                                            {run.scoreTrend.text}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  {/* Passed */}
                                  <td className="p-3.5 font-mono text-primary font-semibold">
                                    {run.status === "Cancelled" ? "—" : run.passed}
                                  </td>

                                  {/* Failed */}
                                  <td className="p-3.5 font-mono text-magenta font-semibold">
                                    {run.status === "Cancelled" ? "—" : run.failed}
                                  </td>

                                  {/* Coverage */}
                                  <td className="p-3.5 font-mono text-on-surface-variant">
                                    {run.status === "Cancelled" ? "—" : `${run.coverage}%`}
                                  </td>

                                  {/* Env */}
                                  <td className="p-3.5 text-on-surface-variant font-medium">
                                    {run.environment}
                                  </td>

                                  {/* Executed time */}
                                  <td className="p-3.5 text-text-muted font-medium">
                                    {run.executed}
                                  </td>

                                  {/* Actions */}
                                  <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => showToast(`Opening quality report details for Run #${run.runNumber}...`, "success")}
                                        className="text-[10px] text-primary hover:underline font-bold uppercase cursor-pointer"
                                      >
                                        View Report
                                      </button>
                                      <button
                                        onClick={() => handleStartDetailedRun(run.suite)}
                                        className="text-[10px] text-primary hover:underline font-bold uppercase cursor-pointer"
                                      >
                                        Run Again
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* Expand Details Section */}
                                <AnimatePresence>
                                  {isExpanded && (
                                    <tr>
                                      <td colSpan={11} className="p-0 border-b border-outline">
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: "auto" }}
                                          exit={{ opacity: 0, height: 0 }}
                                          className="overflow-hidden bg-surface-container-lowest/40"
                                        >
                                          <div className="p-5 border-l-4 border-l-primary bg-surface-container-low/50 grid grid-cols-12 gap-6">
                                            {/* Details Left */}
                                            <div className="col-span-12 lg:col-span-7 space-y-4">
                                              <div>
                                                <h4 className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">
                                                  Execution Summary
                                                </h4>
                                                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                                                  Validation run compiled on <span className="text-on-surface font-semibold">{run.environment}</span> server node. Automated checks covered critical application parameters.
                                                </p>
                                              </div>

                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <h5 className="text-[9px] text-text-muted font-mono uppercase tracking-wider font-bold">
                                                    Duration
                                                  </h5>
                                                  <p className="text-xs text-on-surface font-semibold font-mono mt-0.5">
                                                    {run.status === "Cancelled" ? "Cancelled" : run.duration}
                                                  </p>
                                                </div>
                                                <div>
                                                  <h5 className="text-[9px] text-text-muted font-mono uppercase tracking-wider font-bold">
                                                    QA Scope Executed
                                                  </h5>
                                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {run.scopeExecuted.map((scope) => (
                                                      <span
                                                        key={scope}
                                                        className="text-[9px] font-semibold bg-surface-container border border-outline px-1.5 py-0.5 rounded text-on-surface-variant uppercase font-mono"
                                                      >
                                                        {scope}
                                                      </span>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Major failures list */}
                                              {run.status === "Failed" && run.majorFailures && run.majorFailures.length > 0 && (
                                                <div className="border border-magenta/20 bg-magenta-dim/10 rounded-lg p-3 space-y-1.5">
                                                  <h5 className="text-[9px] text-magenta font-mono uppercase tracking-wider font-bold flex items-center gap-1">
                                                    <AlertTriangle size={10} />
                                                    Major Failures ({run.majorFailures.length})
                                                  </h5>
                                                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-on-surface-variant font-medium">
                                                    {run.majorFailures.map((fail, i) => (
                                                      <li key={i}>{fail}</li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}
                                            </div>

                                            {/* Details Right */}
                                            <div className="col-span-12 lg:col-span-5 flex flex-col justify-between items-end border-l border-outline-variant/60 pl-6">
                                              <div className="text-right">
                                                <h4 className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">
                                                  Overall Quality score
                                                </h4>
                                                <div className="flex items-center gap-3 justify-end mt-1.5">
                                                  <span className="text-3xl font-mono font-bold text-on-surface">
                                                    {run.status === "Cancelled" ? "—" : `${run.qualityScore}%`}
                                                  </span>
                                                  {run.status !== "Cancelled" && (
                                                    <QualityCircleDashboard percentage={run.qualityScore} />
                                                  )}
                                                </div>
                                              </div>

                                              <button
                                                onClick={() => showToast(`Navigating to Full Quality Report for Run #${run.runNumber}...`, "success")}
                                                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer pt-4 uppercase tracking-wider"
                                              >
                                                <span>View Full Report</span>
                                                <ArrowUpRight size={14} />
                                              </button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      </td>
                                    </tr>
                                  )}
                                </AnimatePresence>
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab !== "Overview" ? (
              // Mock Workspace view for other tabs
              <div className="neo-border bg-surface rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 py-16">
                <Layers size={48} className="text-primary animate-pulse" />
                <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface">
                  {activeTab} Workspace
                </h3>
                <p className="text-sm text-on-surface-variant max-w-md">
                  Showing detailed workspaces for this category. In a production app, this is where you customize individual {activeTab.toLowerCase()} parameters.
                </p>
                <button
                  onClick={() => setActiveTab("Overview")}
                  className="bg-primary text-on-primary-container px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  Return to Overview
                </button>
              </div>
            ) : simulateEmptyState ? (
              /* EMPTY STATES SIMULATION */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Empty Framework */}
                <div className="neo-border bg-surface rounded-xl p-6 text-center space-y-4 py-12">
                  <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-primary">
                    <Layers size={20} />
                  </div>
                  <h4 className="text-base font-bold text-on-surface">No QA Framework Generated</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Generate a framework to begin evaluating your application structure.
                  </p>
                  <button
                    onClick={() => {
                      setSimulateEmptyState(false);
                      showToast("Generating framework mock...");
                    }}
                    className="bg-primary text-on-primary-container text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-lg cursor-pointer hover:opacity-90 transition-all"
                  >
                    Generate Framework
                  </button>
                </div>

                {/* Empty Test Runs */}
                <div className="neo-border bg-surface rounded-xl p-6 text-center space-y-4 py-12">
                  <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-primary">
                    <Play size={20} fill="currentColor" />
                  </div>
                  <h4 className="text-base font-bold text-on-surface">No Test Runs Yet</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Run your first automated QA test to evaluate this project.
                  </p>
                  <button
                    onClick={() => {
                      setSimulateEmptyState(false);
                      handleRunQA();
                    }}
                    className="bg-primary text-on-primary-container text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-lg cursor-pointer hover:opacity-90 transition-all"
                  >
                    Run QA
                  </button>
                </div>

                {/* Empty Reports */}
                <div className="neo-border bg-surface rounded-xl p-6 text-center space-y-4 py-12">
                  <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-primary">
                    <FileText size={20} />
                  </div>
                  <h4 className="text-base font-bold text-on-surface">No Reports Available</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Reports will appear after completing your first QA run.
                  </p>
                  <button
                    disabled
                    className="border border-outline text-text-muted text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-lg cursor-not-allowed opacity-50"
                  >
                    Reports Locked
                  </button>
                </div>
              </div>
            ) : (
              /* TWO COLUMN MAIN CONTENT */
              <div className="grid grid-cols-12 gap-5 items-start">
                {/* Main panel - 70% width (8 columns) */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  {/* Progress Overview */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                      Progress Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Metric 1 - QA Framework */}
                      <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between hover:border-primary transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                              QA Framework
                            </span>
                            <h4 className="text-xl font-bold text-on-surface mt-1">100% Complete</h4>
                          </div>
                          <span className="text-[9px] bg-cyan-dim border border-cyan/20 text-primary px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                            Finished
                          </span>
                        </div>
                        <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden my-3">
                          <div className="h-full bg-primary" style={{ width: "100%" }} />
                        </div>
                        <button
                          onClick={() => setActiveTab("QA Framework")}
                          className="self-start text-[10px] text-primary hover:underline font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer mt-1"
                        >
                          View Framework →
                        </button>
                      </div>

                      {/* Metric 2 - Automation */}
                      <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between hover:border-primary transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                              Automation
                            </span>
                            <h4 className="text-xl font-bold text-on-surface mt-1">82% Executed</h4>
                          </div>
                          <span className="text-[9px] bg-cyan-dim border border-cyan/20 text-primary px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                            Running
                          </span>
                        </div>
                        <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden my-3">
                          <div className="h-full bg-primary" style={{ width: "82%" }} />
                        </div>
                        <button
                          onClick={() => showToast("Opening test automation workspace...")}
                          className="self-start text-[10px] text-primary hover:underline font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer mt-1"
                        >
                          Run Tests →
                        </button>
                      </div>

                      {/* Metric 3 - Human Review */}
                      <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between hover:border-primary transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                              Human Review
                            </span>
                            <h4 className="text-xl font-bold text-on-surface mt-1">45% Evaluated</h4>
                          </div>
                          <span className="text-[9px] bg-yellow-dim border border-yellow/20 text-yellow px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                            Pending
                          </span>
                        </div>
                        <div className="h-1 bg-surface-container-high w-full rounded-full overflow-hidden my-3">
                          <div className="h-full bg-primary" style={{ width: "45%" }} />
                        </div>
                        <button
                          onClick={() => setActiveTab("Human Reviews")}
                          className="self-start text-[10px] text-primary hover:underline font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer mt-1"
                        >
                          Continue Review →
                        </button>
                      </div>

                      {/* Metric 4 - Reports */}
                      <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between hover:border-primary transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                              Latest Report
                            </span>
                            <h4 className="text-xl font-bold text-on-surface mt-1">v{project.version} Release</h4>
                          </div>
                          <span className="text-[9px] bg-cyan-dim border border-cyan/20 text-primary px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                            Generated
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-mono mt-3 mb-2">
                          UPDATED: YESTERDAY
                        </p>
                        <button
                          onClick={() => setActiveTab("Reports")}
                          className="self-start text-[10px] text-primary hover:underline font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer mt-1"
                        >
                          View Report →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Framework Coverage */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                      QA Framework Coverage
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        { name: "Product QA", count: 42, icon: Globe },
                        { name: "Page QA", count: 118, icon: Layers },
                        { name: "Component QA", count: 74, icon: Cpu },
                        { name: "Feature QA", count: 56, icon: Sparkles },
                        { name: "Release QA", count: 18, icon: CheckCircle2 },
                      ].map((cov) => {
                        const CovIcon = cov.icon;
                        return (
                          <div
                            key={cov.name}
                            className="neo-border bg-surface p-3 rounded-lg flex flex-col justify-between animate-fade-in"
                          >
                            <div className="w-7 h-7 bg-surface-container-high rounded flex items-center justify-center text-primary mb-2 flex-shrink-0">
                              <CovIcon size={14} />
                            </div>
                            <div>
                              <p className="text-[10px] text-on-surface-variant uppercase font-semibold">
                                {cov.name}
                              </p>
                              <h4 className="text-lg font-bold text-on-surface font-mono mt-1">
                                {cov.count} checks
                              </h4>
                            </div>
                            <span className="text-[8px] bg-cyan-dim text-primary px-1 py-0.5 rounded font-bold uppercase tracking-wider self-start mt-2">
                              Ready
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setActiveTab("QA Framework")}
                      className="text-[10px] text-primary hover:underline uppercase tracking-wider font-bold block cursor-pointer"
                    >
                      View Full Framework →
                    </button>
                  </div>

                  {/* AI Product Understanding */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                      AI Understanding
                    </h3>
                    <div className="neo-border bg-surface p-5 rounded-xl space-y-4">
                      {/* Application Summary */}
                      <div className="space-y-1 pb-3 border-b border-outline-variant">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                            Application Summary
                          </label>
                          <button
                            onClick={() => setIsEditingSummary(!isEditingSummary)}
                            className="text-[10px] text-primary hover:underline uppercase font-bold"
                          >
                            {isEditingSummary ? "Save" : "Edit"}
                          </button>
                        </div>
                        {isEditingSummary ? (
                          <textarea
                            value={summaryText}
                            onChange={(e) => setSummaryText(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline rounded-lg text-sm text-on-surface px-3 py-2 focus:outline-none focus:border-primary resize-none mt-1"
                            rows={3}
                          />
                        ) : (
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            {summaryText}
                          </p>
                        )}
                      </div>

                      {/* Breakdown columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableTags title="Detected Users" tags={users} onSave={setUsers} />
                        <EditableTags title="Detected Features" tags={features} onSave={setFeatures} />
                        <EditableTags title="Critical Workflows" tags={workflows} onSave={setWorkflows} />
                        <EditableTags title="Potential Risk Areas" tags={risks} onSave={setRisks} />
                      </div>

                      <button
                        onClick={() => showToast("Opening full settings panel...")}
                        className="text-[10px] text-primary hover:underline uppercase tracking-wider font-bold block cursor-pointer mt-2"
                      >
                        Edit Understanding →
                      </button>
                    </div>
                  </div>

                  {/* Recent Test Runs */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                      Recent Test Runs
                    </h3>
                    <div className="space-y-2">
                      {runs.map((run) => (
                        <div
                          key={run.id}
                          className="neo-border bg-surface p-4 rounded-xl flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                              <Play size={16} fill="currentColor" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-on-surface">{run.name}</h4>
                              <p className="text-[11px] text-text-muted mt-0.5">
                                Completed {run.completed}
                              </p>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex gap-4 sm:gap-8 text-center font-mono">
                            <div>
                              <p className="text-[10px] text-text-muted uppercase">Passed</p>
                              <p className="text-xs font-bold text-primary">{run.passed}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-text-muted uppercase">Failed</p>
                              <p className="text-xs font-bold text-magenta">{run.failed}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-text-muted uppercase">Warnings</p>
                              <p className="text-xs font-bold text-yellow">{run.warnings}</p>
                            </div>
                          </div>

                          {/* Action view */}
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] bg-cyan-dim border border-cyan/20 text-primary py-0.5 px-2 rounded uppercase font-bold">
                              {run.status}
                            </span>
                            <button
                              onClick={() => showToast(`Opening logs for ${run.name}...`)}
                              className="text-[10px] text-primary hover:underline font-bold uppercase cursor-pointer"
                            >
                              View Run →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveTab("Test Runs")}
                      className="text-[10px] text-primary hover:underline uppercase tracking-wider font-bold block cursor-pointer"
                    >
                      View All Test Runs →
                    </button>
                  </div>

                  {/* Human Reviews & Issues & Quality Report - Stacked Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Human Reviews */}
                    <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                        Human Reviews
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center my-3">
                        <div className="bg-surface-container-low p-2 rounded">
                          <p className="text-[10px] text-text-muted uppercase">Pending</p>
                          <p className="text-sm font-bold text-yellow">12</p>
                        </div>
                        <div className="bg-surface-container-low p-2 rounded">
                          <p className="text-[10px] text-text-muted uppercase">Active</p>
                          <p className="text-sm font-bold text-primary">4</p>
                        </div>
                        <div className="bg-surface-container-low p-2 rounded">
                          <p className="text-[10px] text-text-muted uppercase">Done</p>
                          <p className="text-sm font-bold text-emerald-400">31</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("Human Reviews")}
                        className="text-[10px] text-primary hover:underline uppercase font-bold text-left cursor-pointer"
                      >
                        View Human Reviews →
                      </button>
                    </div>

                    {/* Open Issues */}
                    <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                        Open Issues
                      </h4>
                      <div className="grid grid-cols-4 gap-1 text-center my-3">
                        <div className="bg-surface-container-low p-1.5 rounded">
                          <p className="text-[8px] text-text-muted uppercase">Critical</p>
                          <p className="text-xs font-bold text-magenta">2</p>
                        </div>
                        <div className="bg-surface-container-low p-1.5 rounded">
                          <p className="text-[8px] text-text-muted uppercase">High</p>
                          <p className="text-xs font-bold text-magenta/80">6</p>
                        </div>
                        <div className="bg-surface-container-low p-1.5 rounded">
                          <p className="text-[8px] text-text-muted uppercase">Medium</p>
                          <p className="text-xs font-bold text-yellow">14</p>
                        </div>
                        <div className="bg-surface-container-low p-1.5 rounded">
                          <p className="text-[8px] text-text-muted uppercase">Low</p>
                          <p className="text-xs font-bold text-text-muted">27</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("Issues")}
                        className="text-[10px] text-primary hover:underline uppercase font-bold text-left cursor-pointer"
                      >
                        View Issues →
                      </button>
                    </div>

                    {/* Quality Report */}
                    <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                        Latest Quality Report
                      </h4>
                      <div className="flex justify-between items-center my-3">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-text-muted uppercase">Report Version</p>
                          <p className="text-xs font-bold text-on-surface">v{project.version}</p>
                          <p className="text-[9px] text-text-muted uppercase">Yesterday</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-text-muted uppercase">Score</p>
                          <p className="text-base font-bold text-primary font-mono">{currentScore}%</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("Reports")}
                        className="text-[10px] text-primary hover:underline uppercase font-bold text-left cursor-pointer"
                      >
                        Open Report →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right panel - 30% width (4 columns) */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  {/* Recent Activity timeline */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                      Recent Activity
                    </h3>
                    <div className="neo-border bg-surface p-5 rounded-xl">
                      <div className="relative border-l border-outline-variant pl-4 space-y-5">
                        {activities.map((act) => {
                          const ActIcon = act.icon;
                          return (
                            <div key={act.id} className="relative">
                              {/* Dot marker */}
                              <div className="absolute -left-[25px] top-0.5 w-4 h-4 rounded-md bg-surface border border-outline flex items-center justify-center text-on-surface">
                                <ActIcon size={10} className={act.color} />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-text-muted uppercase font-mono">
                                  {act.time}
                                </span>
                                <p className="text-xs text-on-surface-variant leading-relaxed">
                                  {act.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Project Information Metadata */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                      Project Information
                    </h3>
                    <div className="neo-border bg-surface p-5 rounded-xl space-y-3 text-xs">
                      {[
                        { label: "Project Owner", value: project.owner, icon: User },
                        { label: "Application Type", value: project.type, icon: Laptop },
                        { label: "Domain", value: project.description, icon: Globe },
                        { label: "Created Date", value: project.createdDate, icon: Calendar },
                        { label: "Framework Version", value: project.version, icon: Code },
                        { label: "Last Updated", value: project.lastUpdated, icon: Clock },
                      ].map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <div
                            key={item.label}
                            className="flex justify-between items-center py-1.5 border-b border-outline-variant last:border-b-0"
                          >
                            <div className="flex items-center gap-2 text-on-surface-variant">
                              <ItemIcon size={12} className="text-primary" />
                              <span>{item.label}</span>
                            </div>
                            <span className="font-semibold text-on-surface text-right font-mono">{item.value}</span>
                          </div>
                        );
                      })}

                      {/* URL resources links */}
                      <div className="pt-2 flex flex-col gap-2 font-mono text-[10px]">
                        <a
                          href={project.deploymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-primary hover:underline uppercase font-bold"
                        >
                          <ExternalLink size={10} />
                          <span>Deployment URL</span>
                        </a>
                        <a
                          href={project.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-primary hover:underline uppercase font-bold"
                        >
                          <GitBranch size={10} />
                          <span>Repository URL</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Run QA Modal */}
      <AnimatePresence>
        {showRunModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRunModal(false)}
              className="absolute inset-0 bg-background/85 backdrop-blur-sm"
            />
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-lg bg-surface border border-outline rounded-xl p-6 shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-dim text-primary flex items-center justify-center">
                    <Play size={16} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">Configure Test Run</h3>
                    <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-bold">
                      Set up automated check suite parameters
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRunModal(false)}
                  className="p-1.5 text-on-surface-variant hover:text-on-surface cursor-pointer rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <div className="space-y-4 text-xs">
                {/* Run Name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                    Run Name
                  </label>
                  <input
                    type="text"
                    value={modalRunName}
                    onChange={(e) => setModalRunName(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline rounded-lg text-xs text-on-surface px-3 py-2 focus:outline-none focus:border-primary font-semibold"
                    placeholder="Enter execution suite name"
                  />
                </div>

                {/* Environment selection */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                    Environment
                  </label>
                  <div className="flex gap-2">
                    {["Production", "Staging", "Local"].map((env) => {
                      const isActive = modalEnv === env;
                      return (
                        <button
                          key={env}
                          type="button"
                          onClick={() => setModalEnv(env)}
                          className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            isActive
                              ? "bg-primary text-on-primary-container border-primary"
                              : "bg-surface-container-low border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                          }`}
                        >
                          {env}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Browser selection */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                    Target Browser
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Chrome", "Firefox", "Safari", "Edge", "All Browsers"].map((browser) => {
                      const isActive = modalBrowser === browser;
                      return (
                        <button
                          key={browser}
                          type="button"
                          onClick={() => setModalBrowser(browser)}
                          className={`px-3 py-1.5 text-center text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            isActive
                              ? "bg-primary text-on-primary-container border-primary"
                              : "bg-surface-container-low border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                          }`}
                        >
                          {browser}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Device selection */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                    Target Device
                  </label>
                  <div className="flex gap-2">
                    {["Desktop", "Tablet", "Mobile", "All Devices"].map((device) => {
                      const isActive = modalDevice === device;
                      return (
                        <button
                          key={device}
                          type="button"
                          onClick={() => setModalDevice(device)}
                          className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            isActive
                              ? "bg-primary text-on-primary-container border-primary"
                              : "bg-surface-container-low border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                          }`}
                        >
                          {device}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* QA Scope (Checkboxes) */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                    QA Scope Selection
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Product QA", "Page QA", "Component QA", "Feature QA", "Release QA"].map((scope) => {
                      const isChecked = modalScope.includes(scope);
                      return (
                        <label
                          key={scope}
                          className="flex items-center gap-2.5 p-2 bg-surface-container-low border border-outline hover:border-outline-variant rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setModalScope(prev => prev.filter(s => s !== scope));
                              } else {
                                setModalScope(prev => [...prev, scope]);
                              }
                            }}
                            className="w-3.5 h-3.5 rounded border border-outline text-primary focus:ring-0 focus:outline-none bg-surface-container accent-primary"
                          />
                          <span className="font-semibold text-on-surface-variant">{scope}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowRunModal(false)}
                  className="px-4 py-2 border border-outline hover:border-outline-variant hover:text-on-surface text-on-surface-variant text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleStartDetailedRun(modalRunName)}
                  className="px-4 py-2 bg-primary hover:opacity-90 text-on-primary-container text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play size={12} fill="currentColor" />
                  Start Test Run
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Toast notifications overlay */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-4 rounded-lg neo-border bg-surface shadow-2xl flex items-center justify-between gap-3 text-xs font-sans border-l-4 ${toast.type === "success"
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
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
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

// Params handling component
function ProjectDashboardWrapper() {
  // Extract params
  const [params, setParams] = useState<any>(null);

  useEffect(() => {
    // Dynamically retrieve URL path id segment
    const path = window.location.pathname;
    const segments = path.split("/");
    const projectId = segments[segments.length - 1] || "1";
    setParams({ id: projectId });
  }, []);

  if (!params) {
    return (
      <div className="flex overflow-hidden bg-background text-foreground h-screen w-full">
        <Sidebar />
        <main
          className="flex-grow h-screen overflow-y-auto bg-background"
        >
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
          <main
            className="flex-grow h-screen overflow-y-auto bg-background"
          >
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
