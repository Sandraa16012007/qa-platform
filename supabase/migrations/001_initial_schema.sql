-- ============================================================================
-- Quality AI — Initial Schema
-- Tables: projects, ai_understanding, qa_framework, human_reviews
-- Out of scope (remain on mock data): analytics, reports, test_runs, issues,
-- page_notes, authentication.
-- ============================================================================

-- ── projects ──────────────────────────────────────────────────────────────
CREATE TABLE projects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  product_type  text NOT NULL DEFAULT 'Web App',
  domain        text NOT NULL DEFAULT '',
  description   text NOT NULL DEFAULT '',
  status        text NOT NULL DEFAULT 'Draft',
  quality_score integer NOT NULL DEFAULT 0,
  version       text NOT NULL DEFAULT 'v1.0',
  owner         text NOT NULL DEFAULT '',
  repository_url text NOT NULL DEFAULT '',
  deployment_url text NOT NULL DEFAULT '',
  framework_checks_count integer NOT NULL DEFAULT 0,
  framework_progress integer NOT NULL DEFAULT 0,
  automation_progress integer NOT NULL DEFAULT 0,
  human_review_progress integer NOT NULL DEFAULT 0,
  last_run      text NOT NULL DEFAULT 'Never',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ── ai_understanding ─────────────────────────────────────────────────────
-- One row per project. Holds the editable AI-generated project understanding
-- (summary + detected lists) shown in the New Project wizard and Overview tab.
CREATE TABLE ai_understanding (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  summary           text NOT NULL DEFAULT '',
  target_users      jsonb NOT NULL DEFAULT '[]',
  core_features     jsonb NOT NULL DEFAULT '[]',
  main_workflows    jsonb NOT NULL DEFAULT '[]',
  quality_goals     jsonb NOT NULL DEFAULT '[]',
  risk_areas        jsonb NOT NULL DEFAULT '[]',
  generated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- ── qa_framework ──────────────────────────────────────────────────────────
-- NOTE: keeps BOTH `check_type` (frontend `QaCheck.type`, e.g. "A11y Audit")
-- and `automation_type` (frontend `QaCheck.automation`, "Automated" |
-- "Human Review") as distinct columns — these map to two distinct fields on
-- the frontend QaCheck type and must not be collapsed into one.
CREATE TABLE qa_framework (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  qa_level           text NOT NULL, -- 'Product QA' | 'Page QA' | 'Component QA' | 'Feature QA' | 'Release QA'
  page_name          text NOT NULL DEFAULT '',
  category           text NOT NULL,
  title              text NOT NULL,
  description        text NOT NULL DEFAULT '',
  expected_behavior  text NOT NULL DEFAULT '',
  acceptance_criteria jsonb NOT NULL DEFAULT '[]',
  check_type         text NOT NULL DEFAULT '',
  automation_type    text NOT NULL DEFAULT 'Automated', -- 'Automated' | 'Human Review'
  priority           text NOT NULL DEFAULT 'Medium',
  status             text NOT NULL DEFAULT 'Not Started',
  notes              text NOT NULL DEFAULT '',
  editable           boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- ── human_reviews ─────────────────────────────────────────────────────────
-- Every qa_framework row with automation_type = 'Human Review' gets exactly
-- one corresponding human_reviews row.
CREATE TABLE human_reviews (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_item_id  uuid NOT NULL REFERENCES qa_framework(id) ON DELETE CASCADE,
  status             text NOT NULL DEFAULT 'Needs Review',
  review_result      text,
  rating             integer,
  confidence         integer,
  notes              text NOT NULL DEFAULT '',
  screenshot_url     text,
  reviewed_by        text,
  reviewed_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE(framework_item_id)
);

-- ── Indexes for common lookups ──────────────────────────────────────────
CREATE INDEX idx_ai_understanding_project ON ai_understanding(project_id);
CREATE INDEX idx_qa_framework_project ON qa_framework(project_id);
CREATE INDEX idx_qa_framework_project_level ON qa_framework(project_id, qa_level);
CREATE INDEX idx_human_reviews_framework ON human_reviews(framework_item_id);

-- ── updated_at trigger for projects ─────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row-Level Security (permissive for now — no auth in this MVP phase) ──
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_understanding ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_framework ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ai_understanding" ON ai_understanding FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on qa_framework" ON qa_framework FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on human_reviews" ON human_reviews FOR ALL USING (true) WITH CHECK (true);
