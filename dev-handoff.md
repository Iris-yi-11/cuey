# Development Handoff

## What Codex Should Read Before Coding

- `AGENTS.md`
- `README.md`
- `project-map.md`
- `product-spec.md`
- `task-backlog.md`
- `risk-register.md`
- `docs/release-notes.md`
- `docs/deployment-checklist.md`
- `docs/gemini-runtime.md`
- `src/types.ts`
- `src/App.tsx`
- `src/components/WorkCuePanel.tsx`
- `src/components/SourceManagementPanel.tsx`
- `src/components/CueDetailModal.tsx`
- `src/services/geminiCueService.ts`
- `src/services/dailyCueService.ts`
- `src/services/sourceManagementRepository.ts`
- `src/services/cueBankRepository.ts`
- `src/services/aiService.ts`
- `server.ts`
- `api/`

## Files To Avoid Changing Unless Necessary

- `.env.local` and any secret files
- `metadata.json`
- `vite.config.ts`
- `vercel.json`
- `docs/supabase-schema.sql`
- Approved UI copy and visual hierarchy in `src/App.tsx` and `src/components/`
- `src/types.ts` unless `product-spec.md` is updated in the same change

## Current Development Priorities

1. Prepare for Vercel preview shipping with no secrets and passing checks.
2. Continue splitting `src/App.tsx` into focused Daily Cue and Cue Bank view components.
3. Add focused tests around source sync, Daily Cue no-mock behavior, and Cue Bank remote sync.

## Suggested Files For Each Task

- Preview readiness: `README.md`, `.env.example`, `docs/deployment-checklist.md`, `docs/release-notes.md`, `vercel.json`, `api/`.
- App split: `src/App.tsx`, `src/components/`, `src/utils/`.
- Daily Cue / Source Management: `src/services/dailyCueService.ts`, `src/services/sourceManagementRepository.ts`, `src/components/SourceManagementPanel.tsx`.
- Work Cue AI: `src/services/geminiCueService.ts`, `api/generate.ts`, `server.ts`, `src/components/WorkCuePanel.tsx`.
- Cue Bank sync: `src/services/cueBankRepository.ts`, `src/utils/cueBankStorage.ts`, `src/App.tsx`.

## Manual Check Steps

- Open app at `http://localhost:3007` or the configured dev port.
- Confirm Daily Cue loads live cards or a no-mock empty/error state.
- Open `Manage sources`.
- Click `Sync` and confirm Supabase source count updates.
- Toggle one source off/on and confirm it persists.
- Click `Refresh feed` and confirm Daily Cue refreshes from live sources.
- Generate one Work Cue and confirm response includes real Gemini output.
- Save generated cue to Cue Bank.
- Open detail modal.
- Copy and listen to a cue.
- Filter Cue Bank.
- Refresh browser and confirm localStorage and optional Supabase sync behavior.

## Automated Checks

Run before shipping or handing off:

```bash
pnpm run lint
pnpm run test
pnpm run build
```

Recommended API smoke checks:

```bash
curl -sS http://localhost:3007/api/source-management
curl -sS -X POST http://localhost:3007/api/daily-cues/refresh
curl -sS -X POST http://localhost:3007/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"chineseThought":"这个需求先不要塞进本轮，避免影响主路径","scenario":"Meeting"}'
```

## Development Cautions

- Work Cue AI must use real Gemini only; do not reintroduce a mock success path.
- Daily Cue feed must use live sources or no-mock empty/error states; do not reintroduce mock feed cards.
- Keep `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Do not expose Supabase service role keys in frontend code.
- Supabase source list is the source of truth when Supabase is configured.
- Keep Source Management Lite scoped to sync, toggle, and refresh unless a full CRUD task is approved.
- Keep desktop capture user-triggered; do not add automatic screen/OCR monitoring without privacy approval.
- Update docs whenever env vars, data fields, routes, or deployment behavior change.

## Dev Prep Status

Ready for preview-shipping preparation after final local smoke checks and Vercel environment verification.
