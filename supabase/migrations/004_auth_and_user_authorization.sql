-- ============================================================================
-- Migration 004: Supabase Authentication and User-Specific Authorization
--
-- 1. Adds user_id (referencing auth.users.id) to the projects table.
-- 2. Creates the profiles table and auth synchronization trigger.
-- 3. Enables strict, restrictive Row Level Security (RLS) policies on:
--    - projects (direct ownership: user_id = auth.uid())
--    - ai_understanding (parent ownership via project_id)
--    - qa_framework (parent ownership via project_id)
--    - human_reviews (indirect ownership via framework_item_id -> qa_framework -> projects)
--    - page_notes (parent ownership via project_id)
--    - issues (parent ownership via project_id)
--
-- Safe & idempotent: Does NOT delete, drop, or arbitrarily reassign legacy rows.
-- ============================================================================

-- ── 1. Add user_id to projects ──────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.projects
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- ── 2. User Profiles ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Trigger to automatically create or update profile from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = CASE 
      WHEN EXCLUDED.name IS NOT NULL AND EXCLUDED.name <> '' THEN EXCLUDED.name 
      ELSE profiles.name 
    END,
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 3. RLS for projects ─────────────────────────────────────────────────────

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ── 4. RLS for ai_understanding (Direct Child) ──────────────────────────────

ALTER TABLE public.ai_understanding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on ai_understanding" ON public.ai_understanding;
DROP POLICY IF EXISTS "Users can view own project ai_understanding" ON public.ai_understanding;
DROP POLICY IF EXISTS "Users can insert own project ai_understanding" ON public.ai_understanding;
DROP POLICY IF EXISTS "Users can update own project ai_understanding" ON public.ai_understanding;
DROP POLICY IF EXISTS "Users can delete own project ai_understanding" ON public.ai_understanding;

CREATE POLICY "Users can view own project ai_understanding" ON public.ai_understanding
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = ai_understanding.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project ai_understanding" ON public.ai_understanding
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = ai_understanding.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project ai_understanding" ON public.ai_understanding
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = ai_understanding.project_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = ai_understanding.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project ai_understanding" ON public.ai_understanding
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = ai_understanding.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- ── 5. RLS for qa_framework (Direct Child) ──────────────────────────────────

ALTER TABLE public.qa_framework ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on qa_framework" ON public.qa_framework;
DROP POLICY IF EXISTS "Users can view own project qa_framework" ON public.qa_framework;
DROP POLICY IF EXISTS "Users can insert own project qa_framework" ON public.qa_framework;
DROP POLICY IF EXISTS "Users can update own project qa_framework" ON public.qa_framework;
DROP POLICY IF EXISTS "Users can delete own project qa_framework" ON public.qa_framework;

CREATE POLICY "Users can view own project qa_framework" ON public.qa_framework
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = qa_framework.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project qa_framework" ON public.qa_framework
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = qa_framework.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project qa_framework" ON public.qa_framework
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = qa_framework.project_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = qa_framework.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project qa_framework" ON public.qa_framework
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = qa_framework.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- ── 6. RLS for human_reviews (Indirect Child) ───────────────────────────────

ALTER TABLE public.human_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on human_reviews" ON public.human_reviews;
DROP POLICY IF EXISTS "Users can view own project human_reviews" ON public.human_reviews;
DROP POLICY IF EXISTS "Users can insert own project human_reviews" ON public.human_reviews;
DROP POLICY IF EXISTS "Users can update own project human_reviews" ON public.human_reviews;
DROP POLICY IF EXISTS "Users can delete own project human_reviews" ON public.human_reviews;

CREATE POLICY "Users can view own project human_reviews" ON public.human_reviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.qa_framework
      JOIN public.projects ON projects.id = qa_framework.project_id
      WHERE qa_framework.id = human_reviews.framework_item_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project human_reviews" ON public.human_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.qa_framework
      JOIN public.projects ON projects.id = qa_framework.project_id
      WHERE qa_framework.id = human_reviews.framework_item_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project human_reviews" ON public.human_reviews
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.qa_framework
      JOIN public.projects ON projects.id = qa_framework.project_id
      WHERE qa_framework.id = human_reviews.framework_item_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.qa_framework
      JOIN public.projects ON projects.id = qa_framework.project_id
      WHERE qa_framework.id = human_reviews.framework_item_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project human_reviews" ON public.human_reviews
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.qa_framework
      JOIN public.projects ON projects.id = qa_framework.project_id
      WHERE qa_framework.id = human_reviews.framework_item_id
        AND projects.user_id = auth.uid()
    )
  );

-- ── 7. RLS for page_notes (Direct Child) ────────────────────────────────────

ALTER TABLE public.page_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on page_notes" ON public.page_notes;
DROP POLICY IF EXISTS "Users can view own project page_notes" ON public.page_notes;
DROP POLICY IF EXISTS "Users can insert own project page_notes" ON public.page_notes;
DROP POLICY IF EXISTS "Users can update own project page_notes" ON public.page_notes;
DROP POLICY IF EXISTS "Users can delete own project page_notes" ON public.page_notes;

CREATE POLICY "Users can view own project page_notes" ON public.page_notes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = page_notes.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project page_notes" ON public.page_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = page_notes.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project page_notes" ON public.page_notes
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = page_notes.project_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = page_notes.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project page_notes" ON public.page_notes
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = page_notes.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- ── 8. RLS for issues (Direct Child) ────────────────────────────────────────

ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on issues" ON public.issues;
DROP POLICY IF EXISTS "Users can view own project issues" ON public.issues;
DROP POLICY IF EXISTS "Users can insert own project issues" ON public.issues;
DROP POLICY IF EXISTS "Users can update own project issues" ON public.issues;
DROP POLICY IF EXISTS "Users can delete own project issues" ON public.issues;

CREATE POLICY "Users can view own project issues" ON public.issues
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = issues.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project issues" ON public.issues
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = issues.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project issues" ON public.issues
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = issues.project_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = issues.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project issues" ON public.issues
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = issues.project_id
        AND projects.user_id = auth.uid()
    )
  );
