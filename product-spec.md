# PM Cue Product Spec

## 产品一句话定义

PM Cue 是面向中文 Product Manager 的 AI 工作英语助手，把最新 AI/Product/SaaS 动态和用户真实工作片段转化为可直接使用的 work-native PM English。

## 目标用户

- 需要和海外团队协作的中文 Product Manager。
- 需要快速掌握 AI、产品、SaaS、Developer Tools 前沿动态的产品经理。
- 需要在 meeting、PRD Review、Stakeholder Update、Roadmap Discussion 中更自然表达产品判断的职场用户。
- 希望把日常工作内容沉淀成个人 PM English phrase library 的学习者。

## 核心痛点

- 用户不是缺少英文单词，而是不知道如何把中文产品判断转成自然、职业、可信的 work-native English。
- AI/Product 资讯很多，但普通新闻聚合无法告诉 PM “这件事和产品判断有什么关系”。
- 用户在真实工作场景里经常遇到值得学习的表达，但没有低摩擦方式把它捕捉、转化、保存、复习。
- 传统英语学习产品脱离 PM 真实工作语境，缺少时效性和专业感。

## 业务目标

- 让用户每天打开 PM Cue 时获得 10+ 条专业、时效、可引用的 AI/Product signals。
- 将 Daily Cue 从静态卡片升级为 Daily PM Briefing，提升复访动机。
- 将 Work Cue 从单次生成器升级为 Work Cue Capture workflow，帮助用户沉淀真实工作表达。
- 让 Work Cue 形成每日更新的学习节奏，每天给用户一个可在真实工作中练习的 PM English prompt。
- 在 P1 阶段启动 Desktop Companion / floating ball MVP，但保持用户主动触发和隐私边界清晰。
- 保持 MVP 简洁，避免过早进入自动屏幕监控、OCR 和复杂权限能力。

## MVP 范围

### 必须做

- `Daily Cue` 支持每天 10+ 条 `DailyCueItem`。
- `Daily Cue` 首屏显示 `TodayBrief`，用一句话总结当日 AI/Product signals。
- 每条 `DailyCueItem` 显示中文速览标题、`sourceName`、`sourceUrl`、`publishedAt`，并支持点击跳转原始资讯详情页。
- 建立 `SourceCategory` 和 `SourceAllowlistItem`，资讯来源必须来自 curated source allowlist。
- 建立 ranking rules，优先选择专业、时效、AI/Product relevance 高、PM actionability 强的内容。
- P1 使用低成本 source strategy：优先接入免费 RSS/Atom feed；没有稳定 feed 的专业来源保留为 `homepage/manual`，后续再扩展。
- 支持手动 `Refresh`，并显示 `loading`、`error`、`success` states。
- 支持每天北京时间 24:00 定时更新 Daily Cue feed。
- `Work Cue` 支持 Web-first capture：用户手动输入或从 clipboard 捕捉工作片段，生成 work-native PM English cue。
- `Work Cue` 支持每日更新的 `DailyWorkCue`，每天提供一个真实工作场景下可练习的 PM English prompt。
- `Work Cue` 支持桌面级 `Desktop Companion` MVP：floating ball、global shortcut、manual input、clipboard capture。
- `Work Cue` 和 `Desktop Companion` 的 capture 必须由用户主动触发，不做隐式监听。
- 保留 Cue Bank 保存、筛选、复制、听发音、标记练习状态。
- Cue Bank 使用 Supabase Auth `user.id` 进行云端同步，本地只作为 UI mirror / preview fallback。
- 前端样式优化：页面更专业、更有吸引力，但不破坏核心用户路径。

### 可以做

- Source category filter，例如 `AI Platform`、`AI Product UX`、`SaaS & DevTools`、`PM Craft`、`Market Signals`。
- Daily Cue feed 的 `lastUpdatedAt`、`nextRefreshAt`、`refreshCooldownUntil`。
- `Why PMs should care` explanation。
- `Save to Cue Bank` 后自动保留 source reference。
- `Desktop Companion` 入口展示安装说明、连接状态或本地运行提示。
- UI 增加 Daily Brief、signal cards、source badges、freshness indicator。

### 当前不做

- 不做用户账户。
- 不做云端同步。
- 不做付费能力。
- 不做复杂推荐算法。
- 不抓取或保存完整付费文章正文。
- 不做自动屏幕监控。
- 不做 OCR、Accessibility permission、screen recording、自动读取其他 app 内容。
- 不做 Chrome extension。

## Non-goals for MVP

- 不把 PM Cue 做成普通新闻聚合器。
- 不让 AI 随机搜索互联网来源；必须使用 curated source allowlist。
- 不承诺实时新闻全覆盖。
- 不保存用户敏感工作内容到第三方数据库，除非后续有明确隐私和存储方案。
- 不在前端暴露 `GEMINI_API_KEY`。
- 不用桌面悬浮球名义暗示“自动监听用户电脑”。
- 不因为视觉优化重写整个 app 或改变已验证主流程。

## Glossary

| Term | 中文说明 |
| --- | --- |
| `Daily Cue` | 每日 PM 英语学习与资讯转化 feed |
| `Daily PM Briefing` | 面向 PM 的每日 AI/Product 动态摘要 |
| `TodayBrief` | 当日所有 Daily Cues 的一句话总结 |
| `DailyCueItem` | 一条带来源引用的每日资讯 Cue |
| `Supabase Auth` | 全局登录能力，用于绑定用户 Cue Bank |
| `DailyCueSnapshot` | 按北京时间日期保存的 Daily Cue 公共快照 |
| `Work Cue` | 用户工作片段转化为 PM English 的生成路径 |
| `Work Cue Capture` | 手动输入或 clipboard 捕捉工作片段的流程 |
| `DailyWorkCue` | 每日更新的工作场景 PM English 练习提示 |
| `Desktop Companion` | P1 桌面端助手能力，包括 floating ball、global shortcut 和用户主动 capture |
| `Floating Ball` | 桌面悬浮球入口，用于打开 mini panel 和触发 Work Cue |
| `Source Allowlist` | 允许进入 Daily Cue 的专业来源白名单 |
| `Ranking Rules` | Daily Cue 候选内容的筛选和排序规则 |
| `Source Health` | 每次刷新后记录 source 是否成功返回 feed items，帮助后续低成本扩源和排查 |
| `PM Actionability` | 一条资讯是否能转化为 PM 可用判断、表达或行动 |
| `Work-native English` | 自然、职业、符合产品团队语境的英文表达 |

## 核心用户路径

1. 用户打开 `Daily Cue`，先看 `TodayBrief`，再浏览 10+ 条来自可信来源的 AI/Product cues。
2. 用户打开一条 cue，查看 `whyItMatters`、`pmEnglishCue`、`phrases` 和 `sourceUrl`，并保存到 `Cue Bank`。
3. 用户在 `Work Cue` 或 `Desktop Companion` 中查看当天 `DailyWorkCue`，手动输入或捕捉 clipboard 工作片段，生成 work-native PM English，并保存复习。

## 页面结构与状态

### `Daily Cue`

用途：每天提供专业、时效、可引用的 AI/Product signals，并转化为 PM English 学习素材。

Normal:
- 显示 `TodayBrief`。
- 显示 10+ 条 `DailyCueItem` cards。
- 每条 card 显示 `sourceName`、`publishedAt`、`category`、`headline`、`whyItMatters`、`pmEnglishCue`、`phrases`。
- 支持 `Refresh`、打开详情、保存到 `Cue Bank`、点击 `sourceUrl`。

Empty:
- 当日 feed 尚未生成时，显示空状态。
- CTA: `Generate today's Daily Cue` 或 `Refresh now`。

Loading:
- 首次加载、手动 refresh、定时更新时显示 skeleton cards。
- Refresh button disabled，并显示 `lastUpdatedAt`。

Error:
- source fetch、AI summary、API error 时显示错误说明。
- 保留上一版可用 feed，不清空页面。
- CTA: `Retry refresh`。

Success:
- Refresh 成功后显示 toast。
- 更新 `lastUpdatedAt` 和 `nextRefreshAt`。

### `Work Cue`

用途：把用户真实工作片段转成 work-native PM English。

Normal:
- 显示当天 `DailyWorkCue`。
- 显示 manual input。
- 显示 scenario selector。
- 显示 `Capture from Clipboard`。
- 显示 `Desktop Companion` setting module。

Empty:
- 输入为空时，Generate disabled。
- Clipboard 为空或没有权限时显示提示。

Loading:
- 生成中显示 loading state。
- 禁用重复提交。

Error:
- Gemini error、clipboard permission error、unsupported scenario 时显示可读错误。
- CTA: `Retry`。本期 Work Cue 不使用 mock AI fallback。

Success:
- 显示 generated cue card。
- 支持保存到 `Cue Bank`、复制、打开详情。
- `DailyWorkCue` 更新成功后显示 `nextRefreshAt`。

### `Cue Bank`

用途：保存、筛选、复习 Daily Cue 和 Work Cue。

Normal:
- 显示 saved cues。
- 支持 source/status/scenario filter。
- 支持 copy、listen、mark as practiced。

Empty:
- 未保存任何 cue 时显示引导。

Loading:
- 从 localStorage 或未来 API 加载时显示轻量 loading。

Error:
- localStorage 读取失败时显示恢复提示。

Success:
- 保存、复制、标记完成后显示 toast。

### `Cue Detail Modal`

用途：展示 cue 的完整学习内容与来源。

Normal:
- 显示 `chineseExplanation`、`englishOutput`、`phrases`、`speakingPrompt`、`sampleAnswer`。
- 如果 cue 来自 Daily Cue，显示 `sourceName`、`sourceUrl`、`publishedAt`。

Empty:
- 缺少详情内容时显示 fallback 文案。

Loading:
- 未来支持 lazy detail 时显示 loading。

Error:
- source link 无效或内容缺失时显示错误提示。

Success:
- 保存、复制、听发音成功后显示 toast。

### `Desktop Companion`

用途：提供桌面级 floating ball 和 mini panel，让用户在工作场景中低摩擦触发 Work Cue。

Normal:
- 显示 `Floating Ball`。
- 点击后打开 mini panel。
- 显示当天 `DailyWorkCue`。
- 支持 manual input、clipboard capture、generate、copy。

Empty:
- 没有输入或 clipboard 文本时，Generate disabled。

Loading:
- 生成 Work Cue 或刷新 `DailyWorkCue` 时显示 loading。

Error:
- API 不可用、clipboard 读取失败、daily prompt 读取失败时显示错误状态。

Success:
- 生成成功、复制成功、每日 prompt 更新成功后显示反馈。

## Source Categories And Ranking Rules

### `AI Model & Platform Updates`

Allowlist examples:
- OpenAI News / Developers
- Google AI / DeepMind / Gemini updates
- Anthropic News
- Microsoft AI Blog
- Meta AI Blog
- AWS AI
- Google Cloud AI
- Azure AI

Ranking rules:
- 官方来源优先。
- `model release`、`API capability`、`agent workflow`、`enterprise adoption` 加分。
- 纯科研且无产品影响降权。
- 同一 company 当天最多 2 条。

### `AI Product & Consumer UX`

Allowlist examples:
- The Verge AI
- TechCrunch AI
- Wired AI
- Product Hunt AI
- Apple Newsroom
- Microsoft product announcements
- Google product announcements

Ranking rules:
- 有真实 user-facing product change 加分。
- 涉及 onboarding、workflow、pricing、packaging、distribution 加分。
- 纯融资、八卦、政策争议降权。
- 能提炼出 PM lesson 的内容优先。

### `SaaS & Developer Tools`

Allowlist examples:
- Vercel Blog
- GitHub Blog
- Cloudflare Blog
- Stripe Blog
- Figma Blog
- Linear Blog
- Notion Blog
- Intercom Blog

Ranking rules:
- 涉及 AI workflow、developer productivity、collaboration、automation 加分。
- 有 launch notes、changelog、customer use case 加分。
- 纯底层工程更新但难以转成 PM cue 时降权。
- 优先选择能映射到 roadmap、release、pricing、UX、adoption 的内容。

### `Product Strategy & PM Craft`

Allowlist examples:
- Lenny's Newsletter
- Reforge Blog
- First Round Review
- a16z AI / Enterprise
- HBR Technology / Innovation
- Intercom product essays
- Stripe product essays
- Figma product essays

Ranking rules:
- 有 PM judgment、product strategy、growth、collaboration、roadmap 相关内容加分。
- 太宏观、无 PM action 的投资人观点降权。
- 适合沉淀 reusable PM phrases 的内容加分。
- 每日最多 3 条，避免 feed 失去时效感。

### `Market, Regulation & Business Signals`

Allowlist examples:
- The Information
- Bloomberg Technology
- Financial Times Technology
- CNBC Technology
- McKinsey Technology
- Gartner public reports
- Forrester public reports
- EU AI Act official pages
- FTC official pages

Ranking rules:
- 影响 product strategy、pricing、compliance、enterprise adoption 加分。
- 纯股价或财报细节降权。
- Paywall source 只保存标题、链接、公开摘要，不抓正文。
- 每日最多 1-2 条。

### Ranking Formula

```text
score =
  sourceAuthority * 0.30 +
  recency * 0.25 +
  aiProductRelevance * 0.25 +
  pmActionability * 0.15 +
  sourceDiversity * 0.05
```

Required filters:
- 必须来自 `SourceAllowlistItem`。
- 必须有 `sourceUrl`。
- 必须有 `publishedAt`。
- 不保存完整正文。
- 同一 `sourceUrl` 不重复入库。
- 每条内容必须能回答：`Why should a PM care?`

## 数据模型

### `CueItem`

| Field | Type | Required | Example data |
| --- | --- | --- | --- |
| `id` | `string` | Yes | `"cue_2026_06_22_001"` |
| `sourceType` | `"daily" \| "work"` | Yes | `"daily"` |
| `cueType` | `CueType` | Yes | `"ai_product"` |
| `title` | `string` | Yes | `"Framing Agent Workflow Ownership"` |
| `chineseExplanation` | `string` | Yes | `"AI 产品正在从功能演示走向工作流所有权。"` |
| `englishOutput` | `string` | Yes | `"AI products are moving from feature demos to workflow ownership."` |
| `phrases` | `string[]` | Yes | `["workflow ownership", "feature demos", "adoption path"]` |
| `scenario` | `PMScenario` | Yes | `"Stakeholder Update"` |
| `speakingPrompt` | `string` | Yes | `"How would you explain this trend in a roadmap review?"` |
| `sampleAnswer` | `string` | Yes | `"I would frame this as a shift from isolated AI features to owning the full workflow."` |
| `isSaved` | `boolean` | Yes | `false` |
| `isDone` | `boolean` | Yes | `false` |
| `createdAt` | `string` | Yes | `"2026-06-22T00:00:00.000Z"` |
| `sourceRef` | `SourceReference` | No | `{ "sourceName": "OpenAI News", "sourceUrl": "https://openai.com/news/", "publishedAt": "2026-06-22T00:00:00.000Z" }` |

### `DailyBrief`

| Field | Type | Required | Example data |
| --- | --- | --- | --- |
| `id` | `string` | Yes | `"brief_2026_06_22"` |
| `briefDate` | `string` | Yes | `"2026-06-22"` |
| `summary` | `string` | Yes | `"Today’s PM signal: AI products are shifting from feature launches to workflow-level adoption."` |
| `cueIds` | `string[]` | Yes | `["daily_001", "daily_002"]` |
| `lastUpdatedAt` | `string` | Yes | `"2026-06-22T16:00:00.000Z"` |
| `nextRefreshAt` | `string` | Yes | `"2026-06-23T16:00:00.000Z"` |

### `DailyCueItem`

| Field | Type | Required | Example data |
| --- | --- | --- | --- |
| `id` | `string` | Yes | `"daily_2026_06_22_001"` |
| `category` | `SourceCategoryName` | Yes | `"AI Model & Platform Updates"` |
| `headline` | `string` | Yes | `"OpenAI expands agent workflow capabilities"` |
| `chineseHeadline` | `string` | Yes | `"AI 产品信号｜OpenAI News 新动态"` |
| `sourceName` | `string` | Yes | `"OpenAI News"` |
| `sourceUrl` | `string` | Yes | `"https://openai.com/news/"` |
| `publishedAt` | `string` | Yes | `"2026-06-22T08:30:00.000Z"` |
| `summary` | `string` | Yes | `"A platform update that may change how PMs scope AI workflows."` |
| `whyItMatters` | `string` | Yes | `"PMs need to think beyond single AI features and design end-to-end workflows."` |
| `pmEnglishCue` | `string` | Yes | `"This shifts the product conversation from feature parity to workflow ownership."` |
| `phrases` | `string[]` | Yes | `["workflow ownership", "feature parity", "adoption path"]` |
| `scenario` | `PMScenario` | Yes | `"PRD Review"` |
| `rankingScore` | `number` | Yes | `0.86` |
| `createdAt` | `string` | Yes | `"2026-06-22T16:00:00.000Z"` |

### `DailyCueSnapshot`

| Field | Type | Required | Example data |
| --- | --- | --- | --- |
| `date` | `string` | Yes | `"2026-07-07"` |
| `payload` | `RefreshDailyCueResponse` | Yes | `{ "generatedFrom": "live_sources", "items": [] }` |
| `generatedFrom` | `"live_sources" \| "partial_live_sources" \| "empty_live_sources"` | Yes | `"live_sources"` |
| `itemCount` | `number` | Yes | `12` |
| `updatedAt` | `string` | Yes | `"2026-07-07T16:00:00.000Z"` |

### `AuthUser`

| Field | Type | Required | Example data |
| --- | --- | --- | --- |
| `id` | `string` | Yes | `"0d4d4db4-0000-4000-9000-000000000000"` |
| `email` | `string` | No | `"pm.user@example.com"` |
| `provider` | `"email"` | No | `"email"` |
| `accessToken` | `string` | Yes | `"supabase-user-jwt"` |

### `SourceCategory`

| Field | Type | Required | Example data |
| --- | --- | --- | --- |
| `id` | `string` | Yes | `"ai_model_platform"` |
| `name` | `SourceCategoryName` | Yes | `"AI Model & Platform Updates"` |
| `description` | `string` | Yes | `"Official AI model, API, agent, and enterprise platform updates."` |
| `dailyLimit` | `number` | Yes | `3` |
| `rankingRules` | `string[]` | Yes | `["Official source first", "Model release gets priority"]` |

### `SourceAllowlistItem`

| Field | Type | Required | Example data |
| --- | --- | --- | --- |
| `id` | `string` | Yes | `"openai_news"` |
| `name` | `string` | Yes | `"OpenAI News"` |
| `categoryId` | `SourceCategoryId` | Yes | `"ai_models"` |
| `homepageUrl` | `string` | Yes | `"https://openai.com/news/"` |
| `feedUrl` | `string` | No | `"https://openai.com/news/rss.xml"` |
| `enabled` | `boolean` | Yes | `true` |
| `authorityWeight` | `number` | Yes | `1` |
| `maxItemsPerDay` | `number` | Yes | `2` |
| `costTier` | `"free" \| "paid" \| "manual"` | No | `"free"` |
| `refreshMethod` | `"rss" \| "homepage"` | No | `"rss"` |

### `SourceFetchHealth`

| Field | Type | Required | Example data |
| --- | --- | --- | --- |
| `sourceId` | `string` | Yes | `"techcrunch_ai"` |
| `sourceName` | `string` | Yes | `"TechCrunch AI"` |
| `status` | `"ok" \| "skipped" \| "error"` | Yes | `"ok"` |
| `itemCount` | `number` | Yes | `5` |
| `checkedAt` | `string` | Yes | `"2026-07-03T16:00:00.000Z"` |
| `message` | `string` | No | `"No stable RSS/Atom feed configured."` |

### `WorkCueCaptureRequest`

| Field | Type | Required | Example data |
| --- | --- | --- | --- |
| `rawText` | `string` | Yes | `"这个需求先不放进本期范围，但可以作为下一版候选项。"` |
| `captureSource` | `"manual" \| "clipboard" \| "desktop_companion"` | Yes | `"clipboard"` |
| `scenario` | `GenerateCueScenario` | Yes | `"PRD Review"` |
| `userIntent` | `string` | No | `"需要更委婉地和工程师沟通 scope"` |

### `WorkCueCaptureSettings`

| Field | Type | Required | Example data |
| --- | --- | --- | --- |
| `webCaptureEnabled` | `boolean` | Yes | `true` |
| `desktopCompanionStatus` | `"off" \| "coming_soon" \| "connected"` | Yes | `"coming_soon"` |
| `floatingBallEnabled` | `boolean` | Yes | `false` |
| `clipboardCaptureEnabled` | `boolean` | Yes | `true` |
| `privacyMode` | `"manual_trigger_only"` | Yes | `"manual_trigger_only"` |
| `globalShortcut` | `string` | No | `"Command+Shift+C"` |

### `RefreshDailyCueResponse`

| Field | Type | Required | Example data |
| --- | --- | --- | --- |
| `success` | `boolean` | Yes | `true` |
| `brief` | `DailyBrief` | Yes | `{ "briefDate": "2026-06-22", "summary": "Today’s PM signal..." }` |
| `items` | `DailyCueItem[]` | Yes | `[]` |
| `generatedFrom` | `"live_sources" \| "partial_live_sources" \| "empty_live_sources"` | Yes | `"live_sources"` |
| `sourceHealth` | `SourceFetchHealth[]` | No | `[]` |
| `error` | `string` | No | `"Failed to fetch source feed."` |

## 验收标准

### 产品验收

- 用户 10 秒内理解 PM Cue 已从静态学习卡片升级为 Daily PM Briefing。
- 用户能看到当日 10+ 条专业、时效、可引用的 AI/Product cues。
- 用户能理解每条资讯为什么和 PM 有关。
- 用户能从 Daily Cue 或 Work Cue 保存内容到 Cue Bank。
- 用户登录同一个 Supabase Auth 账号后，可以在不同设备读取同一份 Cue Bank。
- 用户不会误以为 Web 版已经自动监控桌面。

### 交互验收

- `Daily Cue` 页面有清晰的 `TodayBrief`。
- 每条 Daily Cue card 都有来源、发布时间、PM relevance、English cue、phrases。
- Refresh 有明确 loading、error、success feedback。
- Source link 可点击跳转。
- `Work Cue` 中 clipboard capture 有权限失败和空剪贴板提示。
- `Desktop Companion` 开关模块清楚表达当前 Web 能力与未来桌面能力边界。
- 页面视觉更专业、有吸引力，但不牺牲可读性和主流程效率。

### 技术验收

- `GEMINI_API_KEY` 不出现在前端 bundle。
- Daily refresh API 不保存完整文章正文。
- Source fetch 只接受 allowlist。
- 定时任务按北京时间 24:00 语义执行；如部署平台使用 UTC，必须明确转换。
- 手动 refresh 有节流，避免高频 API 消耗。
- 旧版 `CueItem` 数据仍可在 `Cue Bank` 正常显示。
- `normal`、`empty`、`loading`、`error`、`success` states 均可手动验证。
