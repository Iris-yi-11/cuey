# Deployment Checklist

## Commands

Vercel preview deployment:

```bash
pnpm install --frozen-lockfile
pnpm run build
```

Build:

```bash
npm run build
```

With the committed `pnpm-lock.yaml`, the equivalent verified command is:

```bash
pnpm run build
```

Start:

```bash
npm run start
```

With `pnpm`:

```bash
pnpm run start
```

Optional local dev:

```bash
npm run dev
```

With `pnpm`:

```bash
pnpm run dev
```

## Required Environment Variables

- `GEMINI_API_KEY`: server-side Gemini API key. Store it in the deployment platform secret manager.
- `NEXT_PUBLIC_MOCK_AI`: optional preview flag. Use `true` only when a mock-only demo is intended.

## Gemini Runtime Notes

- Current model: `gemini-3.5-flash`
- Runtime verification: `docs/gemini-runtime.md`
- `.env.local` is supported for local secrets.
- `.env` remains supported for AI Studio-style local export behavior.
- Local verification required proxy access to Gemini provider through `127.0.0.1:7897`.
- For local proxy testing with Node 24, use `NODE_OPTIONS=--use-env-proxy` plus `HTTPS_PROXY`.

## Deployment Platform Notes

- Current preview target: Vercel.
- `vercel.json` defines Vite build settings and SPA rewrites.
- `api/generate.ts` provides the Vercel Function for `POST /api/generate`.
- The local app remains an Express server with Vite static output.
- Production entry after build: `dist/server.cjs`
- Static frontend files are served from `dist/`.
- Do not expose `.env`, `.env.local`, private keys, or secret files.
- Confirm `GEMINI_API_KEY` is configured before production rollout.
- Confirm the production platform can reach Gemini provider directly or through an approved outbound proxy.
- If deploying to Cloud Run later, confirm the app reads the platform-provided `PORT`.

## Smoke Test Checklist

- App opens successfully.
- Daily Cue tab loads 3 cards.
- User can open Cue Detail Modal.
- User can save a Daily Cue to Cue Bank.
- Cue Bank badge updates.
- Cue Bank shows saved cue.
- User can mark a cue as practiced.
- User can filter Cue Bank by source and status.
- Work Cue AI accepts Chinese input.
- Work Cue AI shows loading state.
- Work Cue AI shows success output.
- Generated cue can be saved to Cue Bank.
- Refresh preserves saved state through `localStorage`.
- Missing or invalid API key path shows a usable fallback or error state.
- Vercel preview URL opens from the Pull Request deployment status.
- `POST /api/generate` returns success in mock mode or with a valid `GEMINI_API_KEY`.

## Rollback Notes

- If deployment fails before traffic switch, keep the previous deployment active.
- If the new deployment is live and failing, roll back to the previous known-good release.
- If Gemini generation fails but the UI loads, temporarily enable mock/fallback behavior only for demos, not production learning claims.
- Preserve user-facing MVP flow during rollback.
