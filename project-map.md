# Project Map

## Project Overview

PM Cue is a Google AI Studio-exported MVP for Product Managers. It converts Chinese PM workplace thoughts into polished, work-native English expressions and gives users lightweight speaking practice material.

## Tech Stack

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Express
- `@google/genai`
- `lucide-react`
- `motion/react`

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
├── server.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
├── metadata.json
├── index.html
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types.ts
    ├── components/CueDetailModal.tsx
    ├── data/mockCues.ts
    └── services/aiService.ts
```

## Main Pages

This is a single-page tabbed app. There are no router files.

- Daily Cue
- Work Cue AI
- Cue Bank
- Cue Detail Modal

## Main Components

- `src/App.tsx`: app shell, tab navigation, views, state, localStorage, generator flow, toasts.
- `src/components/CueDetailModal.tsx`: detailed cue trainer and modal actions.

## Main User Flows

- Review 3 Daily Cue cards.
- Open cue details and practice.
- Generate a Work Cue from Chinese input and scenario.
- Save cues to Cue Bank.
- Filter, copy, listen, and mark cues as practiced.

## Mock Data

- Static seed data: `src/data/mockCues.ts`
- Browser persistence: `localStorage.pmcue_items`
- Mock generation fallback: `server.ts`

## API / Gemini Calls

- Client wrapper: `src/services/aiService.ts`
- Server route: `server.ts`, `POST /api/generate`
- Gemini dependency: `@google/genai`
- Current model string: `gemini-3.5-flash`
- Runtime verification: `docs/gemini-runtime.md`

## Required Environment Variables

- `GEMINI_API_KEY`

## Commands

- Local dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Type check: `npm run lint`

## Deployment Files

- `package.json`
- `server.ts`
- `vite.config.ts`
- `.env.example`
- `docs/deployment-checklist.md`

## Current Risks

See `risk-register.md`.
