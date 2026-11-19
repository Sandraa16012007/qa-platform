# QA Platform

An AI-powered Quality Assurance platform that generates structured, context-aware QA frameworks for web and mobile applications. Instead of manually creating QA plans, the platform uses **Google Gemini** to understand an application and automatically generate editable QA checklists across multiple QA levels.

Built as a Phase 1 prototype, the platform focuses on AI-assisted QA planning, human review workflows, and project management rather than automated test execution.

---

## Features

- AI-generated application understanding (derived from description of the application, domain, user preferences, website content extraction)
- AI-generated QA frameworks
- Multi-level QA planning
  - Product QA
  - Page QA
  - Component QA
  - Feature QA
  - Release QA
- Editable QA checklist items
- Human review workflow
- Issue tracking
- Project notes
- Persistent project storage with Supabase
- Modern dashboard for managing QA projects
### Implemented

- **AI Understanding Generation** — Gemini-powered product analysis (users, features, workflows, risk areas)
- **QA Framework Generation** — Structured, domain-specific QA checklists across five levels
- **Multi-level QA Planning** — Product QA, Page QA, Component QA, Feature QA, Release QA
- **Context Engine** — Manual questionnaire + live website crawl merged into unified context
- **Website Crawling** — Playwright-based crawler extracts pages, forms, buttons, components, navigation
- **Document Extraction** — PDF and DOCX PRD/specification context extraction via API
- **Editable QA Checklists** — All generated items are fully editable in-app
- **Human Review Workflow** — Dedicated human review items with approval/rejection tracking
- **Issue Tracking** — Per-project issue management
- **Project Notes** — Page-level notes
- **Persistent Storage** — Full Supabase (PostgreSQL) backend with RLS
- **Authentication** — Supabase email/password and OAuth with protected routes
- **Gemini Reliability** — Bounded retries, exponential backoff, model fallback, rate limiting

### Not Yet Implemented (Planned)

- Groq/alternative LLM provider integration
- PRD structured extraction via AI
- GitHub repository context ingestion
- Figma / design file analysis
- Browser automation agents (Playwright / Selenium)
- Automated test execution
- Quality analytics and dashboards
- CI/CD integration

---

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Zustand (state management)
- Framer Motion (animations)

### Backend
- Supabase (PostgreSQL)
- Playwright
- Supabase (PostgreSQL + Auth + RLS)
- Next.js API Routes

### AI
- Google Gemini (`@google/genai` SDK v2)
- **Primary Model:** `gemini-2.5-flash`
- **Fallback Model:** `gemini-3.5-flash-lite`

---

## Workflow

1. Create a new QA project.
2. Enter project basics and optionally provide a website URL for live crawling.
3. Upload PRD or specification documents (PDF, DOCX, YAML, Markdown).
4. Set QA depth and preferences.
5. AI generates a structured **Product Understanding** (users, features, workflows, risks).
6. Review and edit the AI-generated understanding.
7. Click **Generate QA Framework** to produce domain-specific checks.
8. Review, edit, and manage QA checklist items.
9. Perform Human Reviews.
10. Track issues and project progress.

---

## Project Structure

```
qa-platform/
├── app/
│   ├── api/
│   │   ├── gemini/            # Server-side Gemini proxy route
│   │   └── context/           # Document & website extraction routes
│   ├── auth/                  # Login / signup page
│   ├── qa-projects/
│   │   └── new/               # New project wizard (Steps 0-4)
│   └── ...
├── lib/
│   ├── gemini.ts              # Core Gemini service (retries, fallback, rate limiting)
│   ├── context-engine/        # Context extraction & merging engine
│   │   ├── types.ts
│   │   ├── merge.ts
│   │   ├── questionnaire.ts
│   │   └── website.ts
│   └── services/              # Supabase data services
├── scripts/
│   └── diagnose-gemini.ts     # Server-side Gemini diagnostic script
├── supabase/
│   └── migrations/            # PostgreSQL schema migrations
├── .env.example               # Environment variable template
└── README.md
```

---

## Database (Supabase)

Core tables with Row Level Security (RLS) enabled:

| Table | Description |
|---|---|
| `projects` | QA projects, owned by `auth.uid()` |
| `ai_understanding` | AI-generated understanding per project |
| `qa_framework` | Generated QA checks per project |
| `human_reviews` | Human review items linked to QA checks |
| `issues` | Per-project issue tracking |
| `page_notes` | Per-project page-level notes |
| `profiles` | User profile synced from `auth.users` |

All tables enforce **user-specific RLS policies** — users can only read and write their own data.

---

## Current Scope (Phase 1)

Implemented:
- AI Understanding generation
- QA Framework generation
- Editable QA framework
- Human review management
- Issue tracking
- Persistent storage
- Project dashboard
- Website crawling

Not yet implemented:
- Browser automation agents
- Automated testing
- Playwright/Selenium integration
- GitHub/Figma/PRD context
- Analytics
- AI-generated reports
- Quality Engineering (QE) workflows
## Authentication & Protected Routes

Authentication is handled by **Supabase Auth** (email/password + OAuth).

The Next.js middleware (`middleware.ts`) enforces:
- Unauthenticated users → redirected to `/auth`
- Authenticated users on `/auth` → redirected to `/`
- All `/api/*` routes return `401 Unauthorized` for unauthenticated requests
- `/auth/callback` is always allowed (OAuth return)

---

## Gemini AI Configuration

### Environment Variables

```env
# Required
GEMINI_API_KEY=your-gemini-api-key-here

# Model configuration (optional — defaults shown)
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite
GEMINI_MAX_RETRIES=2
GEMINI_REQUESTS_PER_MINUTE=4
```

> **Note:** `GEMINI_API_KEY` must remain strictly server-side. Do **not** use `NEXT_PUBLIC_GEMINI_API_KEY` — the browser always proxies through `/api/gemini`.

### Reliability Model

```
Request
  └─► Primary Model (gemini-2.5-flash)
        ├─ [Success] → Return result
        ├─ [503/404/500 Service Error] → Retry with exponential backoff (up to 2x)
        │     └─ [All retries exhausted] → Fallback to gemini-3.5-flash-lite
        │           ├─ [Success] → Return result (logged)
        │           └─ [Fail] → Return clear error message
        ├─ [400/401/403 Client Error] → Fail immediately (no retry, no fallback)
        └─ [429 Rate Limited] → Retry with Retry-After / backoff
```

**Fallback is used ONLY for model/service failures** (503 high demand, 404 deprecated, 500 internal). It is **not** used for invalid API keys, malformed requests, or quota exhaustion.

**Rate limiting:** Max 4 requests per 60-second window with a minimum 15-second spacing enforced server-side.

### Diagnostic Script

```bash
npm run test:gemini
```

Verifies environment, runs live AI Understanding + QA Framework generation, and simulates fallback resiliency.

---

## Running Locally

```bash
git clone <repository-url>
cd qa-platform
npm install
```

Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

Fill in your Supabase and Gemini credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

Apply database migrations via Supabase CLI or dashboard, then:

```bash
npm run dev
```

**Verify Gemini is working:**

```bash
npm run test:gemini
```

---

## Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Copy your project URL and anon key to `.env.local`.
3. Run migrations from `supabase/migrations/` in order (001 → 004) in the SQL editor.
4. Enable Email Auth (and optionally Google/GitHub OAuth) in the Supabase dashboard.

> Migration `004_auth_and_user_authorization.sql` enables RLS on all tables and creates per-user policies.

---

## Future Roadmap

- Browser automation agents
- Selenium integration
- File and repository context ingestion
- Playwright / Selenium integration
- File and repository context ingestion (GitHub)
- Design analysis (Figma)
- Automated test execution
- Quality analytics
- CI/CD integration
- AI-powered quality recommendations

---

## License

This project was developed as part of a research and development initiative exploring AI-assisted Quality Assurance and Quality Engineering workflows.

Developed as part of a research and development initiative exploring AI-assisted Quality Assurance and Quality Engineering workflows.
