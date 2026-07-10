# Release Notes

## v0.2.0-p1-foundation

Date: 2026-07-09

### Changed Features

- Added Daily Cue Intelligence Feed v1 with 10+ cards, `TodayBrief`, source references, category filtering, and save-to-bank support.
- Added curated source allowlist, source ranking, RSS/Atom ingestion, no-mock empty/error states, and `/api/sources`.
- Added `/api/daily-cues`, `/api/daily-cues/refresh`, and Vercel cron schedule for Beijing 24:00 / UTC 16:00.
- Upgraded `GET /api/daily-cues` to load real curated feed data with a 30-minute lightweight server cache.
- Added low-cost source expansion metadata: free RSS/Atom sources, manual homepage sources, and source health reporting.
- Added Daily Work Cue API and Work Cue page display with daily refresh metadata.
- Added Web Work Cue clipboard capture and generation flow while preserving the existing Cue Bank flow.
- Removed Work Cue mock AI success path; `/api/generate` now requires real Gemini and tries real model candidates only.
- Replaced mock Daily Work Cue API data with date-based daily Work Cue generation.
- Added browser API guards for copy, speech synthesis, and clipboard failure states.
- Added dynamic `PORT` support for deployment platforms.
- Hardened Desktop Companion renderer settings with sandboxing and navigation guards.
- Capped Daily Cue public snippets to avoid storing full article body content.
- Added optional KV REST persistence for Daily Cue public preview freshness without adding dependencies.
- Added server-side Supabase REST adapters and schema draft for Source Management and Cue Bank storage.
- Added Source Management Lite UI for reviewing and toggling curated Daily Cue sources.
- Added Source Management Sync so frontend source lists can refresh after Supabase add/delete changes, and Supabase empty lists no longer fall back to local defaults.
- Added Source Management feed refresh action so source changes can immediately regenerate Daily Cue results.
- Added Supabase source seed script and `/api/supabase-health` setup check.
- Added Supabase `daily_cue_snapshots` persistence so Daily Cue can be stable and identical for all users by Beijing date.
- Added Chinese Daily Cue card headlines for faster browsing.
- Renamed the main navigation label from `Work Cue AI` to `Work Cue`.
- Added global Supabase Auth module with email magic link and 6-digit OTP code entry points.
- Added Supabase Auth provider detection, local/public redirect support, deployed-origin redirects, and redirect error handling for preview login readiness.
- Hardened Supabase Auth callback handling so `code` redirects exchange into browser sessions and mobile-blocked email links can fall back to visible OTP entry.
- Replaced Cue Bank Cloud Profile userId sync with authenticated Supabase user sync.
- Changed Cue Bank save/delete behavior to cloud-first after sign-in; the UI updates only after Supabase confirms the operation.
- Added Vitest test runner and initial service tests for development-stage verification.
- Extracted Daily Cue display view-model helpers with unit coverage to reduce `App.tsx` change risk.
- Extracted Work Cue generator UI into `WorkCuePanel` while preserving existing state and user flow.
- Added P1 visual polish for Daily Brief, signal cards, source badges, and Work Cue capture.
- Added initial Electron Desktop Companion scaffold under `desktop/` with mini panel, global shortcut, manual input, clipboard capture, and secure web API boundary.

### Known Limitations

- Stable shared Daily Cue requires running `docs/supabase-schema.sql` so `daily_cue_snapshots` exists.
- KV REST persistence remains optional compatibility; Supabase snapshots are the recommended shipping path.
- Source management is API/Supabase ready, but not a full authenticated admin dashboard.
- Supabase Auth Email provider and redirect URL settings must be configured in the Supabase Dashboard before public login testing.
- Google OAuth login is intentionally deferred from this phase.
- `src/App.tsx` is partially decomposed but still needs Daily Cue and Cue Bank view-level extraction before larger UI changes.
- Desktop Companion dependencies are installed and build-verified; GUI runtime smoke test is still pending.
- Desktop Companion is local-development only; packaging, signing, notarization, auto update, and production distribution are not implemented.
- Automatic desktop monitoring, OCR, screen recording, and hidden capture remain intentionally out of scope.

### Deployment Notes

- Daily Cue refresh uses Beijing 24:00 / UTC 16:00 schedule in `vercel.json`.
- Required production secret remains `GEMINI_API_KEY`.
- Public shared Daily Cue freshness requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the `daily_cue_snapshots` table.
- Desktop Companion is not deployed through Vercel; it should be verified separately after desktop dependency installation is approved.

## v0.1.0-demo-prep

Date: 2026-06-17

### Changed Features

- Materialized the Google AI Studio export as a Git-ready project.
- Added AI-agent development guidance in `AGENTS.md`.
- Added product specification, task backlog, project map, development handoff, and risk register.
- Updated README for development setup, MVP scope, commands, environment variables, and deployment notes.
- Simplified `.env.example` to required environment variable names only.
- Expanded `.gitignore` for dependencies, build outputs, logs, and secret files.
- Locked the MVP data contract for `CueItem`, `GenerateCueRequest`, and `GenerateCueResponse`.
- Added server-side scenario validation for `/api/generate`.
- Installed dependencies with bundled `pnpm`, generated `pnpm-lock.yaml`, and verified local dev startup.
- Verified early Daily Cue and Work Cue local generation path before P1 real-Gemini/no-mock enforcement.
- Verified Gemini runtime boundaries and documented missing-key, invalid-scenario, real-key, and no-mock error paths.
- Added `.env.local` loading support in `server.ts`.
- Verified Gemini SDK error path with a non-secret fake key.
- Verified live successful Gemini generation through local proxy access.
- Added Vercel preview deployment configuration and `POST /api/generate` Vercel Function.

### Known Limitations

- System `npm` is not available in the Codex desktop shell; local verification used bundled `pnpm`.
- Vitest test coverage is configured for key service boundaries.
- Cue Bank now supports optional Supabase sync with browser `localStorage` fallback.
- Local Gemini access depends on reachable provider network or local proxy configuration.
- `src/App.tsx` remains large, but Daily Cue view-model logic now has focused helpers and tests.
- Local Express route and Vercel Function share the server-side Gemini generation service.

### Deployment Notes

- Preview platform: Vercel
- Build command: `pnpm run build`
- Output directory: `dist`
- Required environment variable: `GEMINI_API_KEY`
- Do not deploy real production traffic until Gemini path and smoke tests pass.
