# PM Cue

PM Cue is a work-native English learning tool for Product Managers who need to turn Chinese workplace thoughts into polished, usable PM English.

PM Cue 是面向产品经理的工作场景英语表达工具，帮助用户把中文工作思路转成自然、专业、可直接使用的英文表达。

## Target Users

- Chinese-speaking Product Managers working with global teams
- PMs preparing for meetings, PRD reviews, stakeholder updates, and product discussions
- PMs who want reusable English expressions instead of literal translation

## Key Features

- Daily Cue: 10+ live AI/Product/SaaS signals from curated sources, refreshed manually or by schedule
- Source Management Lite: sync Supabase-managed sources, toggle sources on/off, and refresh the Daily Cue feed
- Work Cue: generate a PM English cue from a Chinese thought and scenario through real Gemini only
- Daily Work Cue: date-based daily prompt for PM English practice
- Cue Detail Trainer: view explanation, key phrases, speaking prompt, and sample answer
- Global Auth: sign in with Supabase Auth through email magic link
- Cue Bank: save useful cues, filter them, copy expressions, listen to pronunciation, and mark practice status, with Supabase Auth user sync

## MVP Scope

In scope:

- Single-page tabbed app with Daily Cue, Work Cue, and Cue Bank
- Real Daily Cue source ingestion from curated allowlist sources
- Server-side Gemini route at `/api/generate`
- Server-side Supabase REST for Source Management, Daily Cue snapshots, and Cue Bank sync
- Browser Supabase Auth for global login and user-owned Cue Bank records
- Local browser persistence through `localStorage` only as a UI mirror / preview fallback
- No mock API success path for Work Cue or Daily Cue feed

Out of scope:

- Payments
- Team sharing
- Advanced learning analytics
- Mobile app shell
- Full admin dashboard for source CRUD
- Automatic screen/OCR monitoring

## Tech Stack

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Express
- `@google/genai`
- Supabase REST API
- `lucide-react`
- `motion/react`
- Electron scaffold for local desktop companion

## Local Setup

Prerequisites:

- Node.js
- pnpm or npm
- `GEMINI_API_KEY` for Work Cue
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for Source Management, Daily Cue snapshots, and server-side Cue Bank sync
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for browser login

Setup:

```bash
npm install
cp .env.example .env.local
npm run dev
```

If system `npm` is unavailable in the Codex desktop shell, use the bundled package manager path:

```bash
env PATH=/Users/xiaoyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/xiaoyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/usr/bin:/bin:/usr/sbin:/sbin /Users/xiaoyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm install
env PATH=/Users/xiaoyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/xiaoyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/usr/bin:/bin:/usr/sbin:/sbin /Users/xiaoyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm run dev
```

The app runs through the Express/Vite server at:

```text
http://localhost:3000
```

## Common Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run supabase:seed-sources
```

The same scripts can be run with `pnpm run <script>` when using the bundled Codex runtime.

Do not run `npm run clean` unless you intentionally want to remove build output.

If Gemini provider access times out locally but a local proxy is available, run:

```bash
HTTPS_PROXY=http://127.0.0.1:7897 \
https_proxy=http://127.0.0.1:7897 \
NODE_OPTIONS=--use-env-proxy \
pnpm run dev
```

## Environment Variables

Required:

```text
GEMINI_API_KEY
```

Use `.env.local` for local secrets. Never commit real API keys.

Optional:

```text
GEMINI_MODEL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_PUBLIC_SITE_URL
KV_REST_API_URL
KV_REST_API_TOKEN
```

Default Gemini model candidates:

```text
gemini-2.5-flash,gemini-3.1-flash-lite,gemini-3.5-flash,gemini-2.5-flash-lite
```

Work Cue does not return mock AI output. Missing or unreachable Gemini returns an error state.

## Deployment Notes

- Preview platform: Vercel
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm run build`
- Output directory: `dist`
- Vercel API route: `api/generate.ts`
- Local production server still serves `dist/` through `dist/server.cjs`
- Configure `GEMINI_API_KEY` in the deployment platform secret manager
- Configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for Source Management, Daily Cue snapshots, and Cue Bank sync
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Supabase Auth in the browser
- Configure `VITE_PUBLIC_SITE_URL` only when local email-login testing should redirect back to the canonical public demo URL; deployed preview/production pages redirect back to their current origin
- Configure Supabase Auth URL settings before public preview login testing:
  - Site URL: the canonical public demo URL
  - Redirect URLs: local dev URL, Vercel preview wildcard, and production/public demo URL
- Enable Supabase Auth Email provider for MVP login; Google OAuth is intentionally deferred
- Add `{{ .Token }}` to the Supabase Magic Link email template so users can enter a 6-digit code in the app when mobile email clients block the link redirect
- Cue Bank saves are cloud-first after sign-in; local storage is only a UI mirror and should not be treated as production data
- Run `docs/supabase-schema.sql` before shipping preview if Daily Cue should be stable and identical for all users
- Configure `KV_REST_API_URL` and `KV_REST_API_TOKEN` only if you also want optional Upstash/KV compatibility
- See `docs/gemini-runtime.md` for Gemini runtime verification

## Public Demo Link

Public demo link: https://cuey-sigma.vercel.app

AI Studio source link: https://ai.studio/apps/a161340c-d376-4df4-97aa-708948d3d10e

## Development Docs

- `project-map.md`
- `dev-handoff.md`
- `risk-register.md`
- `product-spec.md`
- `task-backlog.md`
- `AGENTS.md`
