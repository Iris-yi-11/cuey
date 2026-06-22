# Task Backlog

## P0 MVP Tasks

### PM-CUE-P0-001

- Task name: Extract and baseline project in Git
- Type: Infra
- User story: 作为产品负责人，我希望 AI Studio demo 能成为一个可被 GitHub 和 Codex 接手的正式项目。
- Scope: Materialize project files, keep source unchanged, confirm docs and env samples are present.
- Out of scope: Installing dependencies, feature changes, UI redesign.
- Affected pages/components: Repository root, docs.
- Acceptance criteria: Project files exist in repo, docs are present, no secrets are committed.
- Status: Done

### PM-CUE-P0-002

- Task name: Verify local development startup
- Type: Infra
- User story: 作为开发者，我希望能在本地启动 demo，并确认主流程可以运行。
- Scope: Run local setup after dependency install is approved, confirm `npm run dev` starts the app.
- Out of scope: Dependency upgrades, production deployment.
- Affected pages/components: `server.ts`, `package.json`.
- Acceptance criteria: App opens at `http://localhost:3000`, Daily Cue displays, Work Cue AI can generate in mock or real mode.
- Status: Done

### PM-CUE-P0-003

- Task name: Lock data model against product spec
- Type: Data
- User story: 作为产品负责人，我希望 `CueItem` 字段在开发前被锁定，避免后续功能开发中数据混乱。
- Scope: Review `src/types.ts`, `src/data/mockCues.ts`, `product-spec.md`, and API response shape.
- Out of scope: Database migration, analytics schema.
- Affected pages/components: `src/types.ts`, `src/data/mockCues.ts`, `server.ts`, `product-spec.md`.
- Acceptance criteria: `CueItem`, `GenerateCueRequest`, and `GenerateCueResponse` are documented and consistent.
- Status: Done

### PM-CUE-P0-004

- Task name: Verify Gemini runtime path
- Type: Fix
- User story: 作为产品负责人，我希望确认真实 AI 生成路径可用，而不是只依赖 mock demo。
- Scope: Validate required env var, model name, `/api/generate` behavior, and error states.
- Out of scope: Prompt redesign, model comparison, cost optimization.
- Affected pages/components: `server.ts`, `src/services/aiService.ts`, Work Cue AI.
- Acceptance criteria: Missing key, mock path, and real Gemini path are documented and manually checked.
- Status: Done

## P1 Improvement Tasks

### PM-CUE-P1-001

- Task name: Split App into focused view components
- Type: Refactor
- User story: 作为开发者，我希望把 `App.tsx` 拆成更小的模块，降低后续开发风险。
- Scope: Extract Daily Cue, Work Cue AI, Cue Bank, toast, and state helpers without changing UI.
- Out of scope: Visual redesign, new features, data model changes.
- Affected pages/components: `src/App.tsx`, `src/components/`.
- Acceptance criteria: Existing UI and flow remain identical, code is easier to maintain.
- Status: Todo

### PM-CUE-P1-002

- Task name: Improve browser API error handling
- Type: Fix
- User story: 作为用户，我希望复制和发音功能失败时能看到清晰反馈。
- Scope: Add safe handling for clipboard and speech synthesis failures.
- Out of scope: Custom audio engine, recording, speech scoring.
- Affected pages/components: `src/App.tsx`, `src/components/CueDetailModal.tsx`.
- Acceptance criteria: Copy/listen failures show user-friendly toasts and do not break the app.
- Status: Todo

### PM-CUE-P1-003

- Task name: Add manual smoke test checklist to release flow
- Type: Docs
- User story: 作为产品负责人，我希望每次改动后都能按固定路径检查 MVP 主流程。
- Scope: Maintain smoke checklist in deployment docs and release notes.
- Out of scope: Automated test setup.
- Affected pages/components: `docs/deployment-checklist.md`, `docs/release-notes.md`.
- Acceptance criteria: Checklist covers Daily Cue, Work Cue AI, Cue Bank, modal, localStorage.
- Status: Done

## P2 Future Tasks

### PM-CUE-P2-001

- Task name: Plan backend persistence
- Type: Data
- User story: 作为长期用户，我希望保存的 Cue 能跨设备同步。
- Scope: Define database candidate, migration from `localStorage`, user identity requirements.
- Out of scope: Implementing database now.
- Affected pages/components: Future API, Cue Bank.
- Acceptance criteria: Migration proposal exists before any storage replacement.
- Status: Todo

### PM-CUE-P2-002

- Task name: Add learning progress analytics
- Type: Feature
- User story: 作为学习者，我希望看到自己练习了多少 Cue，以及哪些场景还需要加强。
- Scope: Define metrics and UI concept for practice progress.
- Out of scope: Production analytics SDK, dashboards for teams.
- Affected pages/components: Cue Bank, future progress view.
- Acceptance criteria: Metrics are defined without disturbing MVP flow.
- Status: Todo

### PM-CUE-P2-003

- Task name: Expand scenario taxonomy
- Type: Feature
- User story: 作为产品经理，我希望覆盖更多真实工作场景，比如 Roadmap Review、Design Critique 和 Launch Update。
- Scope: Research and define new scenario options.
- Out of scope: Prompt rewrite before current three scenarios are stable.
- Affected pages/components: Work Cue AI, `CueItem.scenario`, mock data.
- Acceptance criteria: New scenarios are spec-approved before implementation.
- Status: Todo
