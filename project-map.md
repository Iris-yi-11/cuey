# Project Map

## Project Overview

PM Cue is a Google AI Studio-exported MVP for Chinese-speaking Product Managers. It turns live AI/Product signals and raw Chinese workplace thoughts into work-native PM English cues for meetings, PRD reviews, stakeholder updates, and daily practice.

## Tech Stack

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Express
- Vercel Functions / Vercel Cron
- `@google/genai`
- Supabase REST API
- `lucide-react`
- `motion/react`
- Electron scaffold for local desktop companion

## Folder Structure

```text
/
├── README.md
├── AGENTS.md
├── product-spec.md
├── task-backlog.md
├── project-map.md
├── dev-handoff.md
├── risk-register.md
├── docs/
├── api/
│   ├── cue-bank/
│   ├── daily-cues/
│   ├── source-management/
│   ├── sources/
│   ├── supabase-health/
│   └── work-cues/
├── desktop/
├── scripts/
├── server.ts
├── vercel.json
├── vite.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types.ts
    ├── components/
    ├── data/
    ├── services/
    └── utils/
```

## Main Pages

This is a single-page tabbed app. There are no router files.

- Daily Cue
- Work Cue AI
- Cue Bank
- Cue Detail Modal
- Source Management Lite panel inside Daily Cue

## Main Components

- `src/App.tsx`: app shell, shared state, tab navigation, persistence orchestration, Daily Cue view, Cue Bank view, toasts.
- `src/components/WorkCuePanel.tsx`: Work Cue input, loading, error, success output, Daily Work Cue display.
- `src/components/SourceManagementPanel.tsx`: Supabase source list, source toggles, source sync, feed refresh action.
- `src/components/CueDetailModal.tsx`: detailed cue trainer and modal actions.

## Main Services

- `src/services/geminiCueService.ts`: server-side real Gemini generation with model candidates; no mock AI success path.
- `src/services/dailyCueService.ts`: live Daily Cue source refresh and no-mock empty/error states.
- `src/services/sourceFetchService.ts`: RSS/Atom source fetching.
- `src/services/rankingService.ts`: source candidate ranking.
- `src/services/sourceManagementRepository.ts`: Supabase-backed source allowlist.
- `src/services/cueBankRepository.ts`: optional Supabase Cue Bank sync.
- `src/services/supabaseRestService.ts`: server-side Supabase REST helper.
- `src/services/aiService.ts`: frontend API client wrappers.

## Main User Flows

- Review 10+ live Daily Cue cards when source feeds are available.
- Sync Supabase source list, toggle enabled sources, and refresh Daily Cue feed.
- Open cue details and practice.
- Generate a Work Cue from Chinese input and scenario through real Gemini.
- Save cues to Cue Bank.
- Filter, copy, listen, and mark cues as practiced.

## Data Sources

- Live source config: `src/data/sourceAllowlist.ts` and Supabase `source_allowlist`.
- Static seed cue data for local Cue Bank/demo continuity: `src/data/mockCues.ts`.
- Browser persistence: `localStorage.pmcue_items`.
- Optional remote Cue Bank: Supabase `cue_bank_items`.
- No mock API success path for Work Cue AI or Daily Cue feed.

## API / Gemini Calls

- Client wrapper: `src/services/aiService.ts`
- Local Express route: `server.ts`, `POST /api/generate`
- Vercel Function: `api/generate.ts`
- Gemini service: `src/services/geminiCueService.ts`
- Default model candidates: `gemini-2.5-flash`, `gemini-3.1-flash-lite`, `gemini-3.5-flash`, `gemini-2.5-flash-lite`
- Runtime verification: `docs/gemini-runtime.md`

## Required Environment Variables

- `GEMINI_API_KEY`

Optional:

- `GEMINI_MODEL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

## Commands

- Local dev: `pnpm run dev`
- Build: `pnpm run build`
- Start: `pnpm run start`
- Type check: `pnpm run lint`
- Tests: `pnpm run test`
- Seed Supabase sources: `pnpm run supabase:seed-sources`

## Deployment Files

- `package.json`
- `server.ts`
- `api/`
- `vercel.json`
- `vite.config.ts`
- `.env.example`
- `docs/deployment-checklist.md`

## Current Risks

See `risk-register.md`.
