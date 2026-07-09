# Risk Register

## RISK-001: No dependency lockfile

- Severity: High
- Area: Build / Infra
- Risk: Installs may resolve different dependency versions across machines.
- Mitigation: Generate and commit a lockfile during approved setup.
- Status: Mitigated with `pnpm-lock.yaml`

## RISK-002: Gemini model not verified

- Severity: High
- Area: AI / API
- Risk: Current model string may not match intended production availability or cost profile.
- Mitigation: Verify model choice before production deployment.
- Status: Mitigated with live successful call through local proxy

## RISK-003: Large `App.tsx`

- Severity: Medium
- Area: Maintainability
- Risk: Main app file owns too many workflows, increasing regression risk.
- Mitigation: Refactor into focused view/state components after MVP flow is protected. Daily Cue display transformation and category filtering have been extracted into tested view-model helpers as the first safe step.
- Status: Partially mitigated

## RISK-004: localStorage-only persistence

- Severity: Medium
- Area: Data
- Risk: Saved cues can become fragmented or exposed if they are only tied to browser storage or an unverified user identifier.
- Mitigation: P1.5 adds global Supabase Auth and stores Cue Bank rows by authenticated `user_id`, while keeping localStorage only as a UI mirror / preview fallback.
- Status: Mitigated for preview after Supabase Auth provider settings and redirect URLs are configured

## RISK-005: Mock behavior may be confused with production AI

- Severity: Medium
- Area: Product / AI
- Risk: Demo fallback can make AI path appear complete when real API path is unverified.
- Mitigation: Remove Work Cue mock AI success path and Daily Cue mock feed fallback; test real `/api/generate` before production claims.
- Status: Mitigated for P1 with real Gemini response through proxy and no-mock API paths

## RISK-009: Gemini provider requires proxy on current local network

- Severity: Medium
- Area: Dev Environment / AI
- Risk: Direct access to Google and Gemini endpoints times out on the current local network, so Gemini calls fail unless a working outbound proxy is configured.
- Mitigation: Use local proxy `127.0.0.1:7897` with `NODE_OPTIONS=--use-env-proxy` during local development, or deploy to an environment with direct Gemini provider access.
- Status: Open for production environment confirmation

## RISK-006: Browser APIs may fail silently

- Severity: Low
- Area: UX
- Risk: Clipboard and speech synthesis may fail based on browser permissions/support.
- Mitigation: Add defensive handling and user-friendly toasts.
- Status: Mitigated for P1 with clipboard and speech synthesis guards

## RISK-007: Hardcoded server port

- Severity: Low
- Area: Deployment
- Risk: Some platforms expect dynamic `PORT`.
- Mitigation: Support `process.env.PORT` before production deployment.
- Status: Mitigated with `process.env.PORT || 3000`

## RISK-008: No package manager available in current shell

- Severity: Low
- Area: Dev Environment
- Risk: System `npm` is not available in the Codex desktop shell, so standard `npm run ...` commands fail unless Node/npm is installed globally.
- Mitigation: Use bundled `pnpm` with the Codex runtime `PATH`, or install Node.js/npm globally outside the project.
- Status: Mitigated for project verification with bundled `pnpm`

## RISK-010: Real source feeds may be unreliable or unavailable

- Severity: High
- Area: Daily Cue / Data
- Risk: Some professional AI/Product sources may not provide stable RSS feeds or public APIs, and pages can change without notice.
- Mitigation: Use a curated allowlist with free RSS/Atom sources first, mark homepage-only sources as manual, expose `sourceHealth`, and show empty/error states when live sources fail.
- Status: Mitigated for P1; monitor source health before production claims

## RISK-011: Copyright and paid-content handling

- Severity: High
- Area: Daily Cue / Legal
- Risk: Storing or summarizing full copyrighted or paywalled article bodies can create legal and product trust risk.
- Mitigation: Store only source metadata, URLs, headlines, short public snippets capped in code, and generated PM learning cues; never store full paid article text.
- Status: Mitigated for P1 feed ingestion

## RISK-012: Scheduled refresh needs shared persistence

- Severity: Medium
- Area: Backend / Deployment
- Risk: A Vercel cron refresh cannot provide a shared public latest feed unless refreshed Daily Cue data is stored somewhere durable.
- Mitigation: P1.5 writes one shared Beijing-date snapshot to Supabase `daily_cue_snapshots`; optional KV REST support remains as compatibility.
- Status: Mitigated for preview after `docs/supabase-schema.sql` is run and `/api/supabase-health` reports `daily_cue_snapshots: ok`

## RISK-013: Desktop Companion expands app surface area

- Severity: High
- Area: Desktop / Security
- Risk: Electron introduces desktop permissions, IPC, packaging, and renderer security concerns that do not exist in the current Web-only MVP.
- Mitigation: Keep `GEMINI_API_KEY` server-side, use `contextIsolation: true`, enable renderer sandbox, avoid renderer Node access, deny external window navigation, and keep capture user-triggered.
- Status: Partially mitigated; desktop build verified, full packaged runtime verification pending

## RISK-014: Desktop floating ball may feel like monitoring

- Severity: High
- Area: Product / Privacy
- Risk: A desktop-level floating ball and daily reminders may create the perception that PM Cue is watching the user's work.
- Mitigation: Use explicit opt-in copy, make reminders dismissible, do not perform automatic screen/OCR capture in P1, and keep all capture actions user-triggered.
- Status: Mitigated for P1 scope; revisit before automatic capture/OCR

## RISK-015: Daily Work Cue could become generic without personalization

- Severity: Medium
- Area: Work Cue / Product
- Risk: A daily Work Cue prompt generated only from scenario rotation may feel repetitive or disconnected from the user's actual work.
- Mitigation: Start with high-quality PM scenario rotation, allow manual capture to contextualize output, and defer personalization until privacy/storage design is approved.
- Status: Open
