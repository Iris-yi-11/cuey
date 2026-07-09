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
- Acceptance criteria: App opens at `http://localhost:3000`, Daily Cue displays, Work Cue returns a clear error without real Gemini and succeeds only through the real Gemini path.
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
- Affected pages/components: `server.ts`, `api/generate.ts`, `src/services/aiService.ts`, Work Cue.
- Acceptance criteria: Missing key, real Gemini path, model fallback behavior, and error states are documented and manually checked.
- Status: Done

### PM-CUE-P0-005

- Task name: Prepare Vercel preview deployment
- Type: Infra
- User story: 作为产品负责人，我希望 PM Cue 有一个可公开访问的 demo link，并能通过 GitHub/Vercel 继续迭代。
- Scope: Add Vercel config, Vercel Function route, deployment docs, and environment variable setup.
- Out of scope: Production hardening, paid plans, database, auth.
- Affected pages/components: `vercel.json`, `api/generate.ts`, `README.md`, `docs/deployment-checklist.md`.
- Acceptance criteria: Public demo URL opens, `/api/generate` works through real Gemini path, no secrets are committed.
- Status: Done

## P1 Improvement Tasks

### PM-CUE-P1-001

- Task name: Split App into focused view components
- Type: Refactor
- User story: 作为开发者，我希望把 `App.tsx` 拆成更小的模块，降低后续 Daily Cue 和 Work Cue 扩展风险。
- Scope: Extract Daily Cue, Work Cue, Cue Bank, toast, modal orchestration, and state helpers without changing behavior.
- Out of scope: Visual redesign, new feature logic, data model replacement.
- Affected pages/components: `src/App.tsx`, `src/components/`.
- Acceptance criteria: Existing UI and flow remain identical, component boundaries are easier for Codex to modify.
- Status: In Progress

### PM-CUE-P1-002

- Task name: Improve browser API error handling
- Type: Fix
- User story: 作为用户，我希望复制、发音、clipboard capture 失败时能看到清晰反馈。
- Scope: Add safe handling for clipboard, speech synthesis, permission failure, and unsupported browser cases.
- Out of scope: Custom audio engine, recording, speech scoring.
- Affected pages/components: `src/App.tsx`, `src/components/CueDetailModal.tsx`, Work Cue capture controls.
- Acceptance criteria: Copy/listen/capture failures show user-friendly toasts and do not break the app.
- Status: Done

### PM-CUE-P1-003

- Task name: Add manual smoke test checklist to release flow
- Type: Docs
- User story: 作为产品负责人，我希望每次改动后都能按固定路径检查 MVP 主流程。
- Scope: Maintain smoke checklist in deployment docs and release notes.
- Out of scope: Automated test setup.
- Affected pages/components: `docs/deployment-checklist.md`, `docs/release-notes.md`.
- Acceptance criteria: Checklist covers Daily Cue, Work Cue, Cue Bank, modal, localStorage, and Vercel API path.
- Status: Done

### PM-CUE-P1-004

- Task name: Define Daily Cue source allowlist and ranking rules
- Type: Data
- User story: 作为产品负责人，我希望 Daily Cue 的资讯来自专业、时效、可信的来源，而不是 AI 随机搜索。
- Scope: Create source categories, allowlist records, ranking rules, source diversity caps, and copyright-safe storage rules.
- Out of scope: Full crawler implementation, paid content scraping, recommendation personalization.
- Affected pages/components: `product-spec.md`, `src/data/`, future Daily Cue API, Daily Cue page.
- Acceptance criteria: Source categories include AI Model & Platform Updates, AI Product & Consumer UX, SaaS & Developer Tools, Product Strategy & PM Craft, Market/Regulation Signals; each category has allowlist examples and ranking rules.
- Status: Done

### PM-CUE-P1-005

- Task name: Build Daily Cue Intelligence Feed v1
- Type: Feature
- User story: 作为产品经理，我希望每天看到 10+ 条 AI/Product/SaaS 前沿动态，并获得可直接使用的 PM English cue。
- Scope: Add `DailyBrief`, `DailyCueItem`, feed rendering, 10+ cards, source references, source link click-through, save to Cue Bank.
- Out of scope: User accounts, cloud sync, personalization, complete news crawling.
- Affected pages/components: `src/App.tsx`, Daily Cue view, `src/types.ts`, `src/data/`, `CueDetailModal`.
- Acceptance criteria: Daily Cue page shows `TodayBrief`, 10+ items, source metadata, `whyItMatters`, `pmEnglishCue`, `phrases`, and save action; old Cue Bank flow still works.
- Status: Done

### PM-CUE-P1-006

- Task name: Add Daily Cue refresh workflow
- Type: Feature
- User story: 作为用户，我希望 Daily Cue 每天自动更新，也可以手动刷新获得新内容。
- Scope: Add refresh API contract, manual refresh UI, cooldown, `lastUpdatedAt`, `nextRefreshAt`, loading/error/success states, and scheduled refresh design for Beijing 24:00.
- Out of scope: High-frequency real-time news, infinite scraping, paid scheduler dependency unless approved.
- Affected pages/components: Daily Cue page, future `/api/daily-cues/refresh`, deployment config.
- Acceptance criteria: Manual refresh is visible, guarded by cooldown, preserves last good feed on error, and documents UTC conversion for Beijing 24:00 schedule.
- Status: Done

### PM-CUE-P1-007

- Task name: Build Work Cue Web Capture v1
- Type: Feature
- User story: 作为产品经理，我希望把剪贴板或手动输入的真实工作片段快速转成 work-native PM English。
- Scope: Add manual capture and `Capture from Clipboard`, scenario selection, `WorkCueCaptureRequest`, generated cue output, save to Cue Bank.
- Out of scope: Desktop floating ball, OCR, automatic screen monitoring, browser extension.
- Affected pages/components: Work Cue page, `src/services/aiService.ts`, `api/generate.ts`, `src/types.ts`.
- Acceptance criteria: User can capture text manually or from clipboard, see loading/error/success states, generate a cue, and save it to Cue Bank.
- Status: Done

### PM-CUE-P1-008

- Task name: Build Desktop Companion MVP
- Type: Feature
- User story: 作为产品经理，我希望通过桌面级 floating ball 或 global shortcut 快速打开 Work Cue，降低在真实工作中积累英文表达的成本。
- Scope: Create Electron desktop app, floating ball, mini panel, global shortcut, manual input, clipboard capture, and secure call to Web `/api/generate`.
- Out of scope: App Store release, auto update, OCR, screen recording, automatic desktop monitoring, hidden capture.
- Affected pages/components: `desktop/`, Work Cue API boundary, `api/generate.ts`, `server.ts`, `product-spec.md`.
- Acceptance criteria: Desktop app launches locally; floating ball stays above normal windows; global shortcut opens mini panel; user can manually input or capture clipboard; generated cue is returned from `/api/generate`; no `GEMINI_API_KEY` is exposed in desktop renderer.
- Status: In Progress

### PM-CUE-P1-009

- Task name: Visual polish for Daily Brief and Work Capture
- Type: UI
- User story: 作为用户，我希望页面更专业、更有吸引力，让我愿意每天打开 PM Cue。
- Scope: Improve visual hierarchy, Daily Brief header, signal cards, source badges, freshness indicator, Work Cue capture panel, and Cue Bank readability.
- Out of scope: Full redesign, animation-heavy landing page, changing core flow.
- Affected pages/components: `src/App.tsx`, `src/index.css`, Daily Cue page, Work Cue page, Cue Bank.
- Acceptance criteria: UI feels like a professional Daily PM Briefing, text remains readable on mobile/desktop, and existing smoke tests still pass.
- Status: Done

### PM-CUE-P1-010

- Task name: Update product docs for P1 idea stage
- Type: Docs
- User story: 作为产品负责人，我希望 P1 的 Daily Cue、Work Cue Capture 和视觉优化方向被整理成适合 vibe coding 的上下文文件。
- Scope: Update `product-spec.md` and `task-backlog.md` with P1 scope, data models, states, source rules, and acceptance criteria.
- Out of scope: Implementing product code.
- Affected pages/components: `product-spec.md`, `task-backlog.md`.
- Acceptance criteria: Docs contain product definition, MVP scope, glossary, user flow, page states, data models, and P0/P1/P2 backlog.
- Status: Done

### PM-CUE-P1-011

- Task name: Build Daily Cue real source ingestion v1
- Type: Feature
- User story: 作为产品经理，我希望 Daily Cue 使用真实、专业、前沿的 AI/Product/SaaS 信息来源，而不是静态 mock 数据。
- Scope: Add source allowlist config, fetch current source candidates, normalize source metadata, deduplicate URLs, and keep source links clickable.
- Out of scope: Paid content scraping, full article storage, unrestricted web search, personalization, user accounts.
- Affected pages/components: `src/types.ts`, `src/data/`, `server.ts`, `api/`, Daily Cue service layer.
- Acceptance criteria: Feed candidates come from curated allowlist; every candidate has `sourceName`, `sourceUrl`, `publishedAt`, `headline`; failures show an empty/error state without mock Daily Cue cards.
- Status: Done

### PM-CUE-P1-012

- Task name: Add scheduled Daily Cue refresh API
- Type: Feature
- User story: 作为用户，我希望 Daily Cue 每天北京时间 24:00 自动更新，也可以手动刷新。
- Scope: Add refresh endpoint, UTC cron schedule, refresh metadata, cooldown, loading/error/success states, and last-good-feed behavior.
- Out of scope: High-frequency real-time refresh, paid scheduler dependency unless approved, complex recommendation engine.
- Affected pages/components: `api/daily-cues/refresh.ts`, `server.ts`, `vercel.json`, Daily Cue page, deployment docs.
- Acceptance criteria: Scheduled refresh is documented as Beijing 24:00 / UTC 16:00; manual refresh works; previous successful feed remains visible on refresh error.
- Status: Done

### PM-CUE-P1-013

- Task name: Build Daily Work Cue refresh v1
- Type: Feature
- User story: 作为产品经理，我希望 Work Cue 每天更新一个适合真实工作场景练习的 PM English prompt，帮助我形成每日积累习惯。
- Scope: Add `DailyWorkCue` model, daily Work Cue API, scenario rotation, `nextRefreshAt`, local cache, and display in Web Work Cue and Desktop Companion.
- Out of scope: Automatic desktop monitoring, OCR, user behavior profiling, calendar/email integration.
- Affected pages/components: `src/types.ts`, `api/work-cues/daily.ts`, `server.ts`, Work Cue page, `desktop/`.
- Acceptance criteria: Work Cue shows one daily updated prompt; desktop mini panel shows the same daily prompt; refresh aligns with Beijing 24:00; API error keeps last cached prompt.
- Status: Done

### PM-CUE-P1-014

- Task name: Add Source Management Lite
- Type: Data
- User story: 作为产品负责人，我希望能管理 Daily Cue 的来源列表，确保资讯来源专业、前沿、可信。
- Scope: Add structured source config, Supabase-backed source list, and lite source panel for category, enabled state, ranking weight, feed URL, source cap, and manual sync after Supabase add/delete changes.
- Out of scope: Authentication, role-based admin permissions, full create/edit/delete source UI, public admin dashboard.
- Affected pages/components: `src/data/`, Daily Cue source service, optional source management panel.
- Acceptance criteria: Sources can be reviewed and toggled in lite UI; disabled sources are excluded from refresh; source category and ranking weight are visible; Supabase add/delete changes can be synced to the frontend source panel.
- Status: Done

### PM-CUE-P1-015

- Task name: Harden Daily Cue and Cue Bank for preview shipping
- Type: Data
- User story: 作为产品负责人，我希望 Daily Cue 对所有用户稳定一致，Cue Bank 能按用户身份云端同步，而不是依赖单个浏览器设备。
- Scope: Add Supabase-backed `daily_cue_snapshots`, add Daily Cue Chinese card headlines, rename `Work Cue AI` navigation to `Work Cue`, add Supabase Auth-backed Cue Bank sync, and update shipping docs.
- Out of scope: Team accounts, role-based admin permissions, enterprise SSO.
- Affected pages/components: `src/services/dailyCuePersistenceService.ts`, `src/services/dailyCueService.ts`, `src/App.tsx`, `api/cue-bank`, `server.ts`, `docs/supabase-schema.sql`.
- Acceptance criteria: Daily Cue can persist one shared Beijing-date snapshot in Supabase; source management still reads Supabase source list; cards show Chinese browsing titles; Cue Bank remote API requires authenticated Supabase user token; Work Cue tab label does not include `AI`.
- Status: Done

## P2 Future Tasks

### PM-CUE-P2-001

- Task name: Harden production authentication and user-owned RLS
- Type: Data
- User story: 作为长期用户，我希望登录、权限和数据迁移更适合正式生产环境。
- Scope: Add production auth hardening, account recovery review, user-owned RLS verification, and migration handling for any legacy preview Cue Bank records.
- Out of scope: Payments, teams, enterprise SSO.
- Affected pages/components: Future API, Cue Bank, Daily Cue, Work Cue, Supabase schema.
- Acceptance criteria: Users authenticate before accessing personal Cue Bank data; RLS prevents cross-user reads/writes; service role remains server-only.
- Status: Todo

### PM-CUE-P2-002

- Task name: Add learning progress analytics
- Type: Feature
- User story: 作为学习者，我希望看到自己练习了多少 Cue，以及哪些工作场景还需要加强。
- Scope: Define metrics for saved cues, practiced cues, scenarios, source categories, and streaks.
- Out of scope: Production analytics SDK, dashboards for teams.
- Affected pages/components: Cue Bank, future progress view.
- Acceptance criteria: Metrics are defined without disturbing MVP flow.
- Status: Todo

### PM-CUE-P2-003

- Task name: Expand scenario taxonomy
- Type: Feature
- User story: 作为产品经理，我希望覆盖更多真实工作场景，比如 Roadmap Review、Design Critique 和 Launch Update。
- Scope: Research and define new scenario options, prompt behavior, and backward-compatible `PMScenario` updates.
- Out of scope: Prompt rewrite before current scenarios are stable.
- Affected pages/components: Work Cue, `CueItem.scenario`, Daily Cue generation, mock data.
- Acceptance criteria: New scenarios are spec-approved before implementation.
- Status: Todo

### PM-CUE-P2-004

- Task name: Harden Desktop Companion distribution
- Type: Feature
- User story: 作为重度用户，我希望 Desktop Companion 更稳定、更容易安装，并符合桌面应用的基本安全要求。
- Scope: Plan packaging, signing/notarization, auto update, menu bar icon polish, crash handling, and user-facing permission copy.
- Out of scope: Automatic screen monitoring, OCR, hidden capture.
- Affected pages/components: Future Electron app, Work Cue settings, API boundary.
- Acceptance criteria: Distribution plan exists before sharing desktop builds outside local development.
- Status: Todo

### PM-CUE-P2-005

- Task name: Add advanced Desktop Companion capture modes
- Type: Feature
- User story: 作为重度用户，我希望在明确授权的情况下，让 Desktop Companion 支持更多捕捉方式。
- Scope: Explore OCR, selected text capture, app-specific shortcuts, and save handoff after privacy review.
- Out of scope: Hidden monitoring, automatic screen surveillance, capture without explicit consent.
- Affected pages/components: Electron app, Work Cue API, Desktop Companion settings.
- Acceptance criteria: Advanced capture proposal documents permissions, privacy boundaries, and fallback behavior before implementation.
- Status: Todo

### PM-CUE-P2-006

- Task name: Add context rules for proactive reminders
- Type: Feature
- User story: 作为学习者，我希望 PM Cue 在合适的工作时刻提醒我积累表达，但不要让我感觉被监控。
- Scope: Define user-triggered reminder rules based on time, clipboard capture, scenario tags, and user settings.
- Out of scope: Automatic screen surveillance, reading private app contents, hidden monitoring.
- Affected pages/components: Desktop Companion, Work Cue settings, notification rules.
- Acceptance criteria: Reminder system is opt-in, transparent, and can be fully disabled.
- Status: Todo
