# PM Cue Product Spec

## 产品定位

PM Cue 是一个面向中文母语 Product Manager 的工作场景英语表达工具。它把用户真实的中文工作思路转成更自然、更专业、可直接用于会议和协作场景的 work-native PM English。

## 目标用户

- 需要和海外团队协作的中文 Product Manager
- 需要准备 meeting、PRD Review、Stakeholder Update 的产品经理
- 想积累高频 PM English phrases 的职场用户

## 核心问题

用户不是不会英文单词，而是不知道如何把中文产品判断转成自然、准确、有职业语境的表达。直接翻译容易显得生硬、低效或不够专业。

## MVP 目标

MVP 要验证：

- 用户是否能在 10 秒内理解 PM Cue 的核心价值
- 用户是否能在 3 分钟内完成从输入中文思路到获得英文表达的主任务
- 用户是否愿意保存并复习生成的 Cue

## Locked MVP Flow

1. 用户进入 Daily Cue。
2. 用户看到 3 张预置 Daily Cue cards。
3. 用户打开 Cue Detail Trainer，查看 Chinese context、English output、phrases、speakingPrompt、sampleAnswer。
4. 用户进入 Work Cue AI。
5. 用户输入 `chineseThought`。
6. 用户选择 `scenario`。
7. 用户点击 Generate。
8. 系统生成 `CueItem`。
9. 用户保存 Cue 到 Cue Bank。
10. 用户在 Cue Bank 中筛选、复制、听发音、标记练习状态。

## Pages And Views

- `Daily Cue`
- `Work Cue AI`
- `Cue Bank`
- `Cue Detail Modal`
- `Toast Notifications`

## Key Objects

### `CueItem`

`CueItem` 是 MVP 的核心数据对象，当前存储在 browser `localStorage` 中。

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Cue 唯一标识 |
| `sourceType` | `"daily" \| "work"` | Yes | Cue 来源，预置或用户生成 |
| `cueType` | `CueType` | Yes | Cue 类型 |
| `title` | `string` | Yes | 英文标题 |
| `chineseExplanation` | `string` | Yes | 用户中文思路或中文语境 |
| `englishOutput` | `string` | Yes | work-native English 输出 |
| `phrases` | `string[]` | Yes | 2 到 3 个核心 phrases |
| `scenario` | `PMScenario` | Yes | 使用场景 |
| `speakingPrompt` | `string` | Yes | 口语练习问题 |
| `sampleAnswer` | `string` | Yes | 示例口语回答 |
| `isSaved` | `boolean` | Yes | 是否保存到 Cue Bank |
| `isDone` | `boolean` | Yes | 是否完成练习 |
| `createdAt` | `string` | Yes | ISO 创建时间 |

### `GenerateCueRequest`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `chineseThought` | `string` | Yes | 用户输入的中文工作思路 |
| `scenario` | `GenerateCueScenario` | Yes | 目标工作场景 |

### `GenerateCueResponse`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `success` | `boolean` | Yes | 请求是否成功 |
| `item` | `GeneratedCueItem` | No | 生成结果 |
| `error` | `string` | No | 错误信息 |

## Scenario Options

当前生成器支持：

- `Meeting`
- `PRD Review`
- `Stakeholder Update`

Mock 数据中还存在：

- `product discussion`

锁定规则：`product discussion` 保留为 curated Daily Cue 使用的 `PMScenario`，但不进入 `GenerateCueScenario`。Work Cue AI 生成器只允许 `Meeting`、`PRD Review`、`Stakeholder Update`。

## Type Contracts

```ts
type CueSourceType = "daily" | "work";

const CueType = {
  AI_PRODUCT: "ai_product",
  MEETING: "meeting",
  PRD_REVIEW: "prd_review",
  STAKEHOLDER_UPDATE: "stakeholder_update",
} as const;

type CueType = (typeof CueType)[keyof typeof CueType];

type GenerateCueScenario = "Meeting" | "PRD Review" | "Stakeholder Update";

type PMScenario = "product discussion" | GenerateCueScenario;

type GeneratedCueItem = Omit<CueItem, "isSaved" | "isDone">;
```

## Storage

MVP 使用 browser `localStorage`。

- Key: `pmcue_items`
- Seed data: `src/data/mockCues.ts`
- Generated data: prepend 到同一个 `CueItem[]`

未来可迁移到 API/database，但必须保留 `CueItem` 字段语义或提供 migration。

## API Boundary

Frontend:

- `src/services/aiService.ts`
- `generatePMCue(request)`
- `POST /api/generate`

Backend:

- `server.ts`
- Express route: `/api/generate`
- Real AI path: Gemini via `@google/genai`
- Demo fallback: mock generation

## MVP Non-Goals

- 用户账户
- 云端同步
- 数据库
- 付费能力
- 团队协作
- 学习路径系统
- 长期数据分析

## Success Criteria

- 用户 10 秒内理解产品价值。
- 用户 3 分钟内完成一次生成。
- 用户能保存并再次找到 Cue。
- 用户能理解 Cue 的 Chinese context、English output、phrases 和 practice prompt。
