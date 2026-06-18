# Release Notes

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
- Verified Daily Cue renders 3 cards and Work Cue AI can generate a mock cue locally.
- Verified Gemini runtime boundaries and documented missing-key, mock, invalid-scenario, and real-key paths.
- Added `.env.local` loading support in `server.ts`.
- Verified Gemini SDK error path with a non-secret fake key.
- Verified live successful Gemini generation through local proxy access.
- Added Vercel preview deployment configuration and `POST /api/generate` Vercel Function.

### Known Limitations

- System `npm` is not available in the Codex desktop shell; local verification used bundled `pnpm`.
- Tests are not yet configured.
- The app still persists data only in browser `localStorage`.
- Local Gemini access depends on reachable provider network or local proxy configuration.
- `src/App.tsx` remains large and should be refactored after MVP flow is protected.
- Local Express route and Vercel Function currently duplicate generation logic.

### Deployment Notes

- Preview platform: Vercel
- Build command: `pnpm run build`
- Output directory: `dist`
- Required environment variable: `GEMINI_API_KEY`
- Do not deploy real production traffic until Gemini path and smoke tests pass.
