-- ============================================================================
-- Migration 002: Add page_notes table, drop acceptance_criteria from qa_framework
-- ============================================================================

-- ── page_notes ───────────────────────────────────────────────────────────
-- Miscellaneous observations / design notes recorded per project, not tied
-- to a specific checklist item. Shown in the Issues tab.
CREATE TABLE page_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  page_name   text NOT NULL DEFAULT 'General Page Note',
  author      text NOT NULL DEFAULT 'Admin Engineer',
  content     text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_notes_project ON page_notes(project_id);

ALTER TABLE page_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on page_notes" ON page_notes FOR ALL USING (true) WITH CHECK (true);

-- ── Drop acceptance_criteria from qa_framework ───────────────────────────
ALTER TABLE qa_framework DROP COLUMN IF EXISTS acceptance_criteria;
