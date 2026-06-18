# PM Cue

PM Cue is a work-native English learning tool for Product Managers who need to turn Chinese workplace thoughts into polished, usable PM English.

PM Cue 是面向产品经理的工作场景英语表达工具，帮助用户把中文工作思路转成自然、专业、可直接使用的英文表达。

## Target Users

- Chinese-speaking Product Managers working with global teams
- PMs preparing for meetings, PRD reviews, stakeholder updates, and product discussions
- PMs who want reusable English expressions instead of literal translation

## Key Features

- Daily Cue: 3 curated PM English expression cards
- Work Cue AI: generate a PM English cue from a Chinese thought and scenario
- Cue Detail Trainer: view explanation, key phrases, speaking prompt, and sample answer
- Cue Bank: save useful cues, filter them, copy expressions, listen to pronunciation, and mark practice status
- Mock AI fallback for local demos when `GEMINI_API_KEY` is unavailable

## MVP Scope

In scope:

- Single-page tabbed app with Daily Cue, Work Cue AI, and Cue Bank
- Local browser persistence through `localStorage`
- Server-side Gemini route at `/api/generate`
- Mock data and mock generation for demo continuity

Out of scope:

- User accounts
- Cloud database
- Payments
- Team sharing
- Advanced learning analytics
- Mobile app shell

## Tech Stack

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Express
- `@google/genai`
- `lucide-react`
- `motion/react`

## Local Setup

Prerequisites:

- Node.js
- npm
- Gemini API key for real AI generation

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
npm run preview
npm run lint
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

Current server-side Gemini model:

```text
gemini-3.5-flash
```

Optional runtime behavior currently exists in `server.ts` for mock mode, but `.env.example` intentionally documents required variables only.

## Deployment Notes

- Preview platform: Vercel
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm run build`
- Output directory: `dist`
- Vercel API route: `api/generate.ts`
- Local production server still serves `dist/` through `dist/server.cjs`
- Configure `GEMINI_API_KEY` in the deployment platform secret manager
- Set `NEXT_PUBLIC_MOCK_AI=true` only for mock demo previews
- See `docs/gemini-runtime.md` for Gemini runtime verification

## Public Demo Link

Public demo link: `TBD`

AI Studio source link: https://ai.studio/apps/a161340c-d376-4df4-97aa-708948d3d10e

## Development Docs

- `project-map.md`
- `dev-handoff.md`
- `risk-register.md`
- `product-spec.md`
- `task-backlog.md`
- `AGENTS.md`
