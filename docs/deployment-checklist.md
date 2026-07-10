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
- `GEMINI_MODEL`: optional comma-separated real Gemini model candidates. Leave unset to use the app defaults.
- `SUPABASE_URL`: server-side Supabase project URL for Source Management, Daily Cue snapshots, and Cue Bank.
- `SUPABASE_SERVICE_ROLE_KEY`: server-side Supabase service role key. Never expose it in frontend code.
- `VITE_SUPABASE_URL`: browser Supabase Auth project URL. Safe for frontend.
- `VITE_SUPABASE_ANON_KEY`: browser Supabase Auth anon key. Never use the service role key here.
- `VITE_PUBLIC_SITE_URL`: optional canonical public demo URL for local Supabase Auth testing; browser deployments redirect to the current page origin.

## Gemini Runtime Notes

- Default model candidates: `gemini-2.5-flash`, `gemini-3.1-flash-lite`, `gemini-3.5-flash`, `gemini-2.5-flash-lite`
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
- Local and server deployment read `PORT` from the platform environment, defaulting to `3000`.
- Do not expose `.env`, `.env.local`, private keys, or secret files.
- Confirm `GEMINI_API_KEY` is configured before production rollout.
- Confirm the production platform can reach Gemini provider directly or through an approved outbound proxy.
- If deploying to Cloud Run later, confirm the app reads the platform-provided `PORT`.

## P1 Daily Cue Refresh

- Build command: `pnpm run build`
- Read endpoint: `/api/daily-cues`
- Refresh endpoint: `/api/daily-cues/refresh`
- Cron schedule: `0 16 * * *` for Beijing 24:00
- Low-cost source strategy:
  - use free RSS/Atom feeds first,
  - keep high-quality homepage-only sources in allowlist as `manual`,
  - expand by editing `src/data/sourceAllowlist.ts`,
  - inspect `sourceHealth` from `/api/daily-cues` or `/api/daily-cues/refresh`.
- Required environment variables:
  - `GEMINI_API_KEY`
- Optional KV compatibility variables:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
  - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are also supported.
- Persistence behavior:
  - Supabase configured with `daily_cue_snapshots`: read/write one shared Daily Cue snapshot per Beijing date,
  - KV configured: optional read/write compatibility path with a 2-day TTL,
  - no durable store configured: in-memory cache plus on-demand live refresh only, not suitable for "all users see the same feed" claims.

## P1.5 Supabase Storage

- Schema file: `docs/supabase-schema.sql`
- Required tables:
  - `source_allowlist`
  - `cue_bank_items`
  - `daily_cue_snapshots`
- Seed command after schema creation:
  - `pnpm run supabase:seed-sources`
- Health check:
  - `GET /api/supabase-health`
- Server APIs:
  - `GET /api/source-management`
  - `PATCH /api/source-management`
  - `GET /api/cue-bank`
  - `POST /api/cue-bank`
  - `DELETE /api/cue-bank`
- Current MVP validates the Supabase Auth user token and stores Cue Bank rows by `user_id`.
- Supabase Auth setup:
  - enable Email provider in Supabase Dashboard,
  - set Site URL to the canonical public demo URL, for example `https://cuey-sigma.vercel.app`,
  - add local redirect URLs `http://localhost:3009/**` and `http://localhost:3000/**`,
  - add Vercel preview wildcard `https://*-<vercel-account-or-team-slug>.vercel.app/**`,
  - add the exact production/public demo URL, for example `https://cuey-sigma.vercel.app/**`,
  - keep `VITE_PUBLIC_SITE_URL` optional; Vercel preview pages use their current preview origin for email redirects,
  - update the Magic Link email template to include `{{ .Token }}` if users should sign in by entering a 6-digit code instead of clicking the email link.
- Recommended Magic Link template body:
  - keep the `{{ .ConfirmationURL }}` link,
  - add visible text such as `验证码 / Code: {{ .Token }}`,
  - keep the code short-lived and remind users it can only be used once.
- Cue Bank shipping rule: after sign-in, Supabase is the source of truth; local storage is only a browser mirror for UI continuity.

## P1 Desktop Companion

- Desktop source lives in `desktop/`.
- Desktop app must call Web backend APIs.
- Do not store `GEMINI_API_KEY` in desktop renderer.
- Capture must be user-triggered.
- Local API default: `http://127.0.0.1:3000`
- Desktop dev command after approved dependency install:
  - `cd desktop`
  - `pnpm run dev`
  - `pnpm run electron:dev`
- Desktop build command after approved dependency install:
  - `cd desktop`
  - `pnpm run build`
- Smoke test: floating ball, global shortcut, clipboard capture, generation, copy output.

## Smoke Test Checklist

- App opens successfully.
- Daily Cue tab loads 10+ cards.
- Daily Cue shows `TodayBrief`.
- Daily Cue source links open the original source.
- Daily Cue manual refresh keeps last good feed on error.
- User can open Cue Detail Modal.
- User can save a Daily Cue to Cue Bank.
- Cue Bank badge updates.
- Cue Bank shows saved cue.
- User can mark a cue as practiced.
- User can filter Cue Bank by source and status.
- Header shows Sign in when logged out and account state when logged in.
- Email login sends a login email when Supabase Auth URL settings are configured.
- Email OTP code login works when the Supabase Magic Link email template includes `{{ .Token }}`.
- Saved cues are available for the same authenticated Supabase user on another browser/device.
- Work Cue accepts Chinese input.
- Work Cue shows Daily Work Cue.
- Work Cue can capture clipboard text when permission is available.
- Work Cue shows loading state.
- Work Cue shows success output.
- Generated cue can be saved to Cue Bank.
- Refresh preserves saved state through Supabase Auth when Supabase is configured.
- Missing or invalid API key path shows an error state.
- Vercel preview URL opens from the Pull Request deployment status.
- If preview deployments are protected by Vercel, use the public alias for external review.
- `POST /api/generate` returns success only through real Gemini generation with a valid `GEMINI_API_KEY`.

## Rollback Notes

- If deployment fails before traffic switch, keep the previous deployment active.
- If the new deployment is live and failing, roll back to the previous known-good release.
- If Gemini generation fails but the UI loads, show the error state and keep Daily Cue / Cue Bank usable.
- Preserve user-facing MVP flow during rollback.
