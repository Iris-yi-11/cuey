# Development Handoff

## What Codex Should Read Before Coding

- `AGENTS.md`
- `README.md`
- `project-map.md`
- `product-spec.md`
- `task-backlog.md`
- `risk-register.md`
- `src/App.tsx`
- `src/components/CueDetailModal.tsx`
- `src/services/aiService.ts`
- `server.ts`
- `src/types.ts`
- `src/data/mockCues.ts`

## Files To Avoid Changing Unless Necessary

- `metadata.json`
- `vite.config.ts`
- `src/data/mockCues.ts`
- Approved UI copy and layout in `src/App.tsx`
- `src/components/CueDetailModal.tsx`

## Recommended First 3 Development Tasks

1. Verify local development startup.
2. Lock `CueItem` and generation response shape against `product-spec.md`.
3. Verify Gemini real API path and mock fallback behavior.

## Suggested Files For Each Task

- Startup: `package.json`, `server.ts`, `.env.example`, `README.md`
- Data model: `src/types.ts`, `src/data/mockCues.ts`, `product-spec.md`
- Gemini path: `server.ts`, `src/services/aiService.ts`, `docs/deployment-checklist.md`

## Manual Check Steps

- Open app at `http://localhost:3000`.
- Confirm Daily Cue loads 3 cards.
- Save one Daily Cue.
- Open Cue Bank.
- Open detail modal.
- Generate one Work Cue.
- Save generated cue to Cue Bank.
- Filter Cue Bank.
- Refresh and confirm localStorage persistence.

## Development Cautions

- Do not redesign the approved UI during Dev Prep.
- Do not add dependencies before confirming need.
- Keep Gemini key server-side only.
- Keep mock mode usable for demos.
- Do not replace localStorage without migration planning.
- Update documentation whenever env vars, data fields, or routes change.

## Dev Prep Status

Ready for AI-assisted Dev Prep. Not yet verified by install/build/test.
