"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, MotionConfig, type Variants } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Brain,
  Sparkles,
  FlaskConical,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";

// Shared motion presets — keep entrance motion small and quick.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const urlError = searchParams.get("error");
  const urlMessage = searchParams.get("message");

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation & feedback state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);

  const { user, signIn, signUp, isLoading, error: authError, clearError, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleTabSwitch = (newMode: "login" | "signup") => {
    setMode(newMode);
    setValidationErrors({});
    clearError();
    setConfirmationSentTo(null);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (mode === "signup") {
      if (!name.trim()) {
        errors.name = "Full name is required.";
      } else if (name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters.";
      }

      if (!confirmPassword) {
        errors.confirmPassword = "Confirm password is required.";
      } else if (confirmPassword !== password) {
        errors.confirmPassword = "Passwords do not match.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (!error) {
        router.replace("/");
      }
    } else {
      const { error, needsConfirmation } = await signUp(name, email, password);
      if (!error) {
        if (needsConfirmation) {
          setConfirmationSentTo(email.trim());
        } else {
          router.replace("/");
        }
      }
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen w-full flex bg-background text-on-surface">
        {/* ── LEFT PANEL: QA Workflow Illustration & Value Prop ── */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 border-r border-outline bg-surface-container-lowest overflow-hidden">
          {/* Subtle decorative grid background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"
          />

          {/* Ambient glow patches */}
          <motion.div
            animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.06, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.05, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-magenta/10 rounded-full blur-3xl pointer-events-none"
          />

          {/* Top Branding */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary-container/20 px-3 py-1.5 rounded-md text-primary font-bold tracking-tight text-base border border-primary/30">
                <span className="text-on-surface">QA</span> Platform
              </div>
            </div>
          </motion.div>

          {/* Center: QA Workflow Illustration */}
          <div className="relative z-10 my-auto py-8">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
              className="space-y-4 max-w-lg mb-8"
            >
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-on-surface leading-tight">
                AI-Powered Quality Engineering{" "}
                <span className="text-primary block mt-1">for Digital Products</span>
              </h1>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Generate comprehensive QA frameworks, orchestrate automated tests, guide human
                usability reviews, and monitor quality scores from a unified workspace.
              </p>
            </motion.div>

            {/* Interactive Workflow Diagram Cards */}
            <div className="grid grid-cols-2 gap-3 max-w-lg">
              {/* Step 1: Understand */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, transition: { duration: 0.2, delay: 0 } }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.25 }}
                className="p-4 rounded-xl bg-surface-container/60 border border-outline relative group hover:border-magenta/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-magenta font-semibold tracking-wider">
                    01 // Context
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-magenta/10 flex items-center justify-center text-magenta border border-magenta/20">
                    <Brain size={14} />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-on-surface">Understand</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                  Extract PRDs, web targets, user journeys & edge cases.
                </p>
              </motion.div>

              {/* Step 2: Generate */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, transition: { duration: 0.2, delay: 0 } }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.31 }}
                className="p-4 rounded-xl bg-surface-container/60 border border-outline relative group hover:border-yellow/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-yellow font-semibold tracking-wider">
                    02 // Synthesis
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-yellow/10 flex items-center justify-center text-yellow border border-yellow/20">
                    <Sparkles size={14} />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-on-surface">Generate</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                  Produce 35+ verified QA checks across 5 quality levels.
                </p>
              </motion.div>

              {/* Step 3: Test */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, transition: { duration: 0.2, delay: 0 } }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.37 }}
                className="p-4 rounded-xl bg-surface-container/60 border border-outline relative group hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-primary font-semibold tracking-wider">
                    03 // Verification
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <FlaskConical size={14} />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-on-surface">Test & Evaluate</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                  Automated assertions blended with human review workflows.
                </p>
              </motion.div>

              {/* Step 4: Report */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, transition: { duration: 0.2, delay: 0 } }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.43 }}
                className="p-4 rounded-xl bg-surface-container/60 border border-outline relative group hover:border-emerald/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-emerald font-semibold tracking-wider">
                    04 // Intelligence
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-dim flex items-center justify-center text-emerald border border-emerald/20">
                    <Terminal size={14} />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-on-surface">Score & Fix</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                  Track dynamic Quality Scores, log issues & remediation notes.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Bottom Feature Badges */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.5 }}
            className="relative z-10 flex items-center gap-6 pt-6 border-t border-outline/50 text-xs text-on-surface-variant font-mono"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              <span>Multi-Tenant RLS Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald" />
              <span>Dedicated User Workspaces</span>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL: Auth Form ── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}
            className="w-full max-w-md space-y-6"
          >
            {/* Mobile Branding Header */}
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="bg-primary-container/20 px-2.5 py-1 rounded text-primary font-bold text-sm">
                <span className="text-on-surface">QA</span> Platform
              </div>
            </div>

            {/* Card Container */}
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.12 }}
              className="neo-border bg-surface rounded-xl p-8 shadow-2xl relative overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                {/* Confirmation Email Sent State */}
                {confirmationSentTo ? (
                  <motion.div
                    key="confirmation"
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.18 } }}
                    variants={{
                      hidden: { opacity: 0, scale: 0.97 },
                      show: {
                        opacity: 1,
                        scale: 1,
                        transition: { duration: 0.3, ease: EASE, staggerChildren: 0.06 },
                      },
                    }}
                    className="text-center py-4 space-y-5"
                  >
                    <motion.div
                      variants={fadeUp}
                      className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto text-primary"
                    >
                      <Mail size={32} />
                    </motion.div>

                    <motion.div variants={fadeUp} className="space-y-2">
                      <h3 className="text-xl font-bold text-on-surface">Check your email</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        We sent a verification link to{" "}
                        <span className="font-semibold text-primary">{confirmationSentTo}</span>.
                        Please click the link in your email to confirm your account and access your
                        QA workspace.
                      </p>
                    </motion.div>

                    <motion.div
                      variants={fadeUp}
                      className="p-3.5 rounded-lg bg-surface-container-low border border-outline text-xs text-text-muted text-left space-y-1"
                    >
                      <p className="font-semibold text-on-surface">Didn&apos;t receive the email?</p>
                      <p>Check your spam or junk folder. The link will remain active for 24 hours.</p>
                    </motion.div>

                    <motion.button
                      variants={fadeUp}
                      whileHover={{ y: -1, transition: { duration: 0.15, delay: 0 } }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => handleTabSwitch("login")}
                      className="w-full py-2.5 bg-primary text-on-primary-container font-semibold uppercase tracking-wider font-mono text-xs rounded-lg hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Return to Log In
                      <ArrowRight size={14} />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Mode Toggle Switch */}
                    <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline mb-6">
                      <button
                        type="button"
                        onClick={() => handleTabSwitch("login")}
                        className="relative flex-1 py-2 text-xs font-mono font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer"
                      >
                        {mode === "login" && (
                          <motion.span
                            layoutId="auth-mode-indicator"
                            transition={{ type: "spring", stiffness: 400, damping: 34 }}
                            className="absolute inset-0 rounded-md bg-primary shadow-sm"
                          />
                        )}
                        <span
                          className={`relative z-10 transition-colors ${
                            mode === "login"
                              ? "text-on-primary-container"
                              : "text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          Log In
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTabSwitch("signup")}
                        className="relative flex-1 py-2 text-xs font-mono font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer"
                      >
                        {mode === "signup" && (
                          <motion.span
                            layoutId="auth-mode-indicator"
                            transition={{ type: "spring", stiffness: 400, damping: 34 }}
                            className="absolute inset-0 rounded-md bg-primary shadow-sm"
                          />
                        )}
                        <span
                          className={`relative z-10 transition-colors ${
                            mode === "signup"
                              ? "text-on-primary-container"
                              : "text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          Sign Up
                        </span>
                      </button>
                    </div>

                    {/* Form Title & Subtitle */}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: EASE }}
                        className="mb-6"
                      >
                        <h2 className="text-2xl font-bold text-on-surface">
                          {mode === "login" ? "Welcome back" : "Create your account"}
                        </h2>
                        <p className="text-xs text-on-surface-variant mt-1.5">
                          {mode === "login"
                            ? "Enter your credentials to access your quality workspace"
                            : "Start generating and executing AI-powered QA frameworks"}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* URL alerts or Auth errors */}
                    <AnimatePresence>
                      {(authError || urlError) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: EASE }}
                          className="mb-5 p-3 rounded-lg bg-magenta/10 border border-magenta/30 flex items-start gap-2.5 text-xs text-magenta overflow-hidden"
                        >
                          <AlertCircle size={16} className="shrink-0 mt-0.5" />
                          <span>{authError || urlError}</span>
                        </motion.div>
                      )}
                      {urlMessage && !authError && !urlError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: EASE }}
                          className="mb-5 p-3 rounded-lg bg-emerald/10 border border-emerald/30 flex items-start gap-2.5 text-xs text-emerald overflow-hidden"
                        >
                          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                          <span>{urlMessage}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Authentication Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name (Sign-up only) */}
                      <AnimatePresence initial={false}>
                        {mode === "signup" && (
                          <motion.div
                            key="name-field"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <label className="block text-[11px] font-mono uppercase tracking-wider text-on-surface-variant mb-1.5">
                              Full Name
                            </label>
                            <div className="relative">
                              <User
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60"
                              />
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                  setName(e.target.value);
                                  if (validationErrors.name) {
                                    setValidationErrors((prev) => ({ ...prev, name: "" }));
                                  }
                                }}
                                placeholder="Jane Doe"
                                className={`w-full bg-surface-container-low border ${
                                  validationErrors.name ? "border-magenta" : "border-outline"
                                } rounded-lg pl-9 pr-3.5 py-2 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors`}
                              />
                            </div>
                            {validationErrors.name && (
                              <motion.p
                                initial={{ opacity: 0, y: -2 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.18 }}
                                className="text-[11px] text-magenta mt-1"
                              >
                                {validationErrors.name}
                              </motion.p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Email */}
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
                      >
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-on-surface-variant mb-1.5">
                          Work Email
                        </label>
                        <div className="relative">
                          <Mail
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60"
                          />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (validationErrors.email) {
                                setValidationErrors((prev) => ({ ...prev, email: "" }));
                              }
                            }}
                            placeholder="engineer@company.com"
                            className={`w-full bg-surface-container-low border ${
                              validationErrors.email ? "border-magenta" : "border-outline"
                            } rounded-lg pl-9 pr-3.5 py-2 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors`}
                          />
                        </div>
                        {validationErrors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -2 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.18 }}
                            className="text-[11px] text-magenta mt-1"
                          >
                            {validationErrors.email}
                          </motion.p>
                        )}
                      </motion.div>

                      {/* Password */}
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
                      >
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-on-surface-variant mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <Lock
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60"
                          />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (validationErrors.password) {
                                setValidationErrors((prev) => ({ ...prev, password: "" }));
                              }
                            }}
                            placeholder="••••••••"
                            className={`w-full bg-surface-container-low border ${
                              validationErrors.password ? "border-magenta" : "border-outline"
                            } rounded-lg pl-9 pr-10 py-2 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors cursor-pointer"
                            tabIndex={-1}
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              <motion.span
                                key={showPassword ? "hide" : "show"}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                                className="block"
                              >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </motion.span>
                            </AnimatePresence>
                          </button>
                        </div>
                        {validationErrors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -2 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.18 }}
                            className="text-[11px] text-magenta mt-1"
                          >
                            {validationErrors.password}
                          </motion.p>
                        )}
                      </motion.div>

                      {/* Confirm Password (Sign-up only) */}
                      <AnimatePresence initial={false}>
                        {mode === "signup" && (
                          <motion.div
                            key="confirm-password-field"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <label className="block text-[11px] font-mono uppercase tracking-wider text-on-surface-variant mb-1.5">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <Lock
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60"
                              />
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => {
                                  setConfirmPassword(e.target.value);
                                  if (validationErrors.confirmPassword) {
                                    setValidationErrors((prev) => ({
                                      ...prev,
                                      confirmPassword: "",
                                    }));
                                  }
                                }}
                                placeholder="••••••••"
                                className={`w-full bg-surface-container-low border ${
                                  validationErrors.confirmPassword
                                    ? "border-magenta"
                                    : "border-outline"
                                } rounded-lg pl-9 pr-10 py-2 text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors cursor-pointer"
                                tabIndex={-1}
                              >
                                <AnimatePresence mode="wait" initial={false}>
                                  <motion.span
                                    key={showConfirmPassword ? "hide" : "show"}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.15 }}
                                    className="block"
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOff size={16} />
                                    ) : (
                                      <Eye size={16} />
                                    )}
                                  </motion.span>
                                </AnimatePresence>
                              </button>
                            </div>
                            {validationErrors.confirmPassword && (
                              <motion.p
                                initial={{ opacity: 0, y: -2 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.18 }}
                                className="text-[11px] text-magenta mt-1"
                              >
                                {validationErrors.confirmPassword}
                              </motion.p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={
                          isLoading
                            ? undefined
                            : { y: -1, transition: { duration: 0.15, delay: 0 } }
                        }
                        whileTap={isLoading ? undefined : { scale: 0.99 }}
                        transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
                        className="w-full mt-2 py-2.5 bg-primary text-on-primary-container font-semibold uppercase tracking-wider font-mono text-xs rounded-lg hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={isLoading ? "loading" : mode}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center justify-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <RotateCw size={14} className="animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <span>{mode === "login" ? "Log In" : "Create Account"}</span>
                                <ArrowRight size={14} />
                              </>
                            )}
                          </motion.span>
                        </AnimatePresence>
                      </motion.button>
                    </form>

                    {/* Bottom Toggle Note */}
                    <div className="mt-6 pt-5 border-t border-outline text-center text-xs text-on-surface-variant">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={mode}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.18 }}
                        >
                          {mode === "login" ? (
                            <p>
                              Don&apos;t have an account yet?{" "}
                              <button
                                type="button"
                                onClick={() => handleTabSwitch("signup")}
                                className="text-primary hover:underline font-semibold cursor-pointer"
                              >
                                Sign Up
                              </button>
                            </p>
                          ) : (
                            <p>
                              Already have an account?{" "}
                              <button
                                type="button"
                                onClick={() => handleTabSwitch("login")}
                                className="text-primary hover:underline font-semibold cursor-pointer"
                              >
                                Log In
                              </button>
                            </p>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <RotateCw className="animate-spin text-primary" size={28} />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
