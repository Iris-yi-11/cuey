# AGENTS.md

## Product Background

PM Cue is an MVP exported from Google AI Studio. It helps Chinese-speaking Product Managers convert raw Chinese workplace thoughts into work-native English expressions for meetings, PRD reviews, stakeholder updates, and product discussions.

The approved demo flow and visual design should be preserved unless the user explicitly asks for product changes.

## Current Source of Truth Files

Read these before coding:

- `project-map.md`
- `dev-handoff.md`
- `risk-register.md`
- `product-spec.md`
- `task-backlog.md`
- `README.md`
- `src/App.tsx`
- `src/components/CueDetailModal.tsx`
- `src/services/aiService.ts`
- `server.ts`
- `src/types.ts`
- `src/data/mockCues.ts`

## MVP Scope

In scope:

- Daily Cue tab with 3 curated cards
- Work Cue AI generation flow
- Cue Detail Trainer modal
- Cue Bank with save, filter, copy, listen, and practice status
- Local persistence with `localStorage`
- Server-side Gemini API route with mock fallback

## Non-Goals

- Do not add authentication unless requested.
- Do not add a database before the data migration plan is approved.
- Do not add payments, subscriptions, social sharing, teams, or analytics dashboards.
- Do not redesign the approved UI without explicit product approval.
- Do not replace the current app architecture with a new framework.

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
│   ├── release-notes.md
│   └── deployment-checklist.md
├── server.ts
├── vite.config.ts
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   ├── components/
│   ├── data/
│   └── services/
└── assets/
```

## Coding Rules

- Preserve the locked MVP user flow.
- Keep changes small and scoped.
- Prefer existing patterns before adding abstractions.
- Do not introduce new dependencies without clear need and user approval.
- Do not move approved copy, UI labels, or visual hierarchy casually.
- Keep `CueItem` changes backward-compatible unless a migration is planned.
- Avoid broad refactors before tests or manual regression coverage exists.

## UI State Rules

Every user-facing workflow must preserve these states where relevant:

- Normal
- Empty
- Loading
- Error
- Success

For the generator, preserve:

- Initial empty output state
- Disabled submit when input is empty
- Loading skeleton during generation
- Error state with retry
- Success output card

For Cue Bank, preserve:

- Empty bank state
- No results after filters state
- Saved card list state

## Environment Variable Rules

- Real secrets must never be committed.
- Use `.env.local` locally.
- Use deployment platform secret management in production.
- `.env.example` documents required variable names only.
- `GEMINI_API_KEY` is required for real AI generation.
- Mock behavior currently exists in code and must remain available for local demos.

## Security Rules

- Keep Gemini calls server-side.
- Do not expose `GEMINI_API_KEY` in frontend code.
- Do not log secrets.
- Do not commit `.env`, `.env.local`, private keys, certificates, or secret files.
- Treat user-entered Chinese thoughts as sensitive user content.

## Testing and Build Rules

Before finalizing code changes, run the lightest relevant checks available:

```bash
npm run lint
npm run build
```

If dependencies are not installed, do not install them without user approval. Report that verification is pending.

Manual smoke checks must cover:

- Daily Cue loads 3 cards
- Save to Cue Bank
- Open detail modal
- Generate Work Cue
- Save generated cue
- Filter Cue Bank
- Refresh and confirm localStorage persistence

## Documentation Update Rules

Update docs when changing:

- User flow
- Data model
- Environment variables
- API route behavior
- Deployment command
- Known limitation or risk
- Backlog status

Relevant docs:

- `README.md`
- `product-spec.md`
- `task-backlog.md`
- `risk-register.md`
- `docs/release-notes.md`
- `docs/deployment-checklist.md`

## Deployment Rules

- Build command: `npm run build`
- Start command: `npm run start`
- Required production secret: `GEMINI_API_KEY`
- Verify the Gemini model before production deployment.
- Run smoke tests after deployment.
- Do not deploy mock mode as the intended production AI path.

## What AI Agents Must Not Do

- Do not install dependencies unless the user approves.
- Do not run destructive commands.
- Do not delete existing functionality.
- Do not expose API keys or secrets.
- Do not rewrite the UI from scratch.
- Do not add unrelated features.
- Do not change the locked MVP flow without product approval.
- Do not replace localStorage with a database without a migration task.
- Do not change `src/types.ts` data contracts without updating `product-spec.md`.
