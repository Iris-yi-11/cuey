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
- Mitigation: Refactor into focused view/state components after MVP flow is protected.
- Status: Open

## RISK-004: localStorage-only persistence

- Severity: Medium
- Area: Data
- Risk: Saved cues are browser-local and can be lost or unavailable across devices.
- Mitigation: Plan database migration when user accounts or sync become in scope.
- Status: Accepted for MVP

## RISK-005: Mock behavior may be confused with production AI

- Severity: Medium
- Area: Product / AI
- Risk: Demo fallback can make AI path appear complete when real API path is unverified.
- Mitigation: Test real `/api/generate` before production claims.
- Status: Mitigated for local development with real Gemini response through proxy

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
- Status: Open

## RISK-007: Hardcoded server port

- Severity: Low
- Area: Deployment
- Risk: Some platforms expect dynamic `PORT`.
- Mitigation: Support `process.env.PORT` before production deployment.
- Status: Open

## RISK-008: No package manager available in current shell

- Severity: Low
- Area: Dev Environment
- Risk: System `npm` is not available in the Codex desktop shell, so standard `npm run ...` commands fail unless Node/npm is installed globally.
- Mitigation: Use bundled `pnpm` with the Codex runtime `PATH`, or install Node.js/npm globally outside the project.
- Status: Mitigated for project verification with bundled `pnpm`
