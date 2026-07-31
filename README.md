# QA Platform

An AI-powered Quality Assurance platform that generates structured, context-aware QA frameworks for web and mobile applications. Instead of manually creating QA plans, the platform uses **Google Gemini 2.5 Flash** to understand an application and automatically generate editable QA checklists across multiple QA levels.

Built as a Phase 1 prototype, the platform focuses on AI-assisted QA planning, human review workflows, and project management rather than automated test execution.

---

## Features

- AI-generated application understanding
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

---

## Tech Stack

### Frontend
- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Zustand

### Backend
- Supabase (PostgreSQL)

### AI
- Google Gemini 2.5 Flash

---

## Workflow

1. Create a new QA project.
2. Enter project details and QA preferences.
3. Generate an AI Understanding of the application.
4. Review and edit the AI-generated understanding.
5. Generate a complete QA Framework.
6. Review, edit, and manage QA checklist items.
7. Perform Human Reviews.
8. Track issues and project progress.

---

## Project Structure

```
src/
├── app/
├── components/
├── stores/
├── services/
├── lib/
├── hooks/
├── types/
└── data/
```

---

## Database

The application uses **Supabase** with the following core tables:

- `projects`
- `ai_understanding`
- `qa_framework`
- `human_reviews`
- `issues`
- `page_notes`

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

Not yet implemented:
- Browser automation agents
- Automated testing
- Playwright/Selenium integration
- GitHub/Figma/PRD context
- Website crawling
- Analytics
- AI-generated reports
- Quality Engineering (QE) workflows

---

## Running Locally

```bash
git clone <repository-url>

cd qa-platform

npm install

npm run dev
```

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...
```

---

## Future Roadmap

- Browser automation agents
- Playwright integration
- Selenium integration
- File and repository context ingestion
- Design analysis (Figma)
- Automated testing
- Quality analytics
- CI/CD integration
- AI-powered quality recommendations

---

## License

This project was developed as part of a research and development initiative exploring AI-assisted Quality Assurance and Quality Engineering workflows.