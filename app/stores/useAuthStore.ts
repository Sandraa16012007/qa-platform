import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase/client";
import { useProjectStore } from "./useProjectStore";
import { useFrameworkStore } from "./useFrameworkStore";
import { useHumanReviewStore } from "./useHumanReviewStore";
import { useIssuesStore } from "./useIssuesStore";
import { usePageNotesStore } from "./usePageNotesStore";
import { useAiUnderstandingStore } from "./useAiUnderstandingStore";

/** Clears all user-specific cache and stores to avoid data leakage across accounts. */
export function clearAllUserStores() {
  useProjectStore.getState().reset();
  useFrameworkStore.getState().reset();
  useHumanReviewStore.getState().reset();
  useIssuesStore.getState().reset();
  usePageNotesStore.getState().reset();
  useAiUnderstandingStore.getState().reset();
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error: Error | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  let authListenerInitialized = false;

  return {
    user: null,
    session: null,
    isLoading: true,
    isInitialized: false,
    error: null,

    initialize: async () => {
      if (get().isInitialized) return;

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error retrieving initial session:", error);
        }

        const user = session?.user ?? null;
        set({
          user,
          session,
          isLoading: false,
          isInitialized: true,
        });

        // Setup persistent auth state change listener once
        if (!authListenerInitialized) {
          authListenerInitialized = true;
          supabase.auth.onAuthStateChange(async (event, nextSession) => {
            const currentUser = get().user;
            const nextUser = nextSession?.user ?? null;

            if (event === "SIGNED_OUT") {
              clearAllUserStores();
              set({ user: null, session: null, isLoading: false });
            } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
              // If account switched, clear previous user stores first
              if (currentUser && nextUser && currentUser.id !== nextUser.id) {
                clearAllUserStores();
              }
              set({ user: nextUser, session: nextSession, isLoading: false });
              // Hydrate projects for the signed in user
              if (nextUser) {
                useProjectStore.getState().loadProjects().catch(() => {});
              }
            }
          });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Authentication error";
        console.error("Auth initialize error:", err);
        set({ isLoading: false, isInitialized: true, error: errorMsg });
      }
    },

    signIn: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          set({ isLoading: false, error: error.message });
          return { error };
        }

        set({
          user: data.user,
          session: data.session,
          isLoading: false,
          error: null,
        });

        // Load authorized projects immediately
        useProjectStore.getState().loadProjects().catch(() => {});

        return { error: null };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Log in failed";
        set({ isLoading: false, error: message });
        return { error: err instanceof Error ? err : new Error(message) };
      }
    },

    signUp: async (name: string, email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const cleanName = name.trim();
        const cleanEmail = email.trim();

        const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
        const emailRedirectTo = siteUrl ? `${siteUrl}/auth/callback` : undefined;

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              name: cleanName,
            },
            emailRedirectTo,
          },
        });

        if (error) {
          set({ isLoading: false, error: error.message });
          return { error, needsConfirmation: false };
        }

        // Check if email confirmation is required:
        // When email confirmation is required, Supabase returns a user but session is null.
        const needsConfirmation = !data.session;

        set({
          user: data.user,
          session: data.session,
          isLoading: false,
          error: null,
        });

        if (data.session) {
          useProjectStore.getState().loadProjects().catch(() => {});
        }

        return { error: null, needsConfirmation };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Sign up failed";
        set({ isLoading: false, error: message });
        return { error: err instanceof Error ? err : new Error(message), needsConfirmation: false };
      }
    },

    signOut: async () => {
      set({ isLoading: true });
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Sign out error:", err);
      } finally {
        clearAllUserStores();
        set({ user: null, session: null, isLoading: false, error: null });
      }
    },

    clearError: () => set({ error: null }),
  };
});
