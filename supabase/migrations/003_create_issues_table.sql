-- ============================================================================
-- Migration 003: Add issues table
-- Links an issue to a project and to a human review item (1-to-1 relationship).
-- Cascade deletes configured so deleting a project removes all linked issues.
-- ============================================================================

CREATE TABLE issues (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  human_review_id     uuid UNIQUE REFERENCES human_reviews(id) ON DELETE CASCADE,
  framework_item_id   uuid REFERENCES qa_framework(id) ON DELETE CASCADE,
  title               text NOT NULL,
  severity            text NOT NULL DEFAULT 'Medium',
  status              text NOT NULL DEFAULT 'Open',
  source              text NOT NULL DEFAULT 'Human Review',
  level               text NOT NULL DEFAULT 'Product QA',
  linked_page         text NOT NULL DEFAULT '',
  assigned_to         text NOT NULL DEFAULT '',
  description         text NOT NULL DEFAULT '',
  recommendation      text NOT NULL DEFAULT '',
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes for quick lookups ─────────────────────────────────────────────
CREATE INDEX idx_issues_project ON issues(project_id);
CREATE INDEX idx_issues_human_review ON issues(human_review_id);
CREATE INDEX idx_issues_framework_item ON issues(framework_item_id);

-- ── Row-Level Security ───────────────────────────────────────────────────
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on issues" ON issues FOR ALL USING (true) WITH CHECK (true);
