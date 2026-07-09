/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CueSourceType = "daily" | "work";

export const CueType = {
  AI_PRODUCT: "ai_product",
  MEETING: "meeting",
  PRD_REVIEW: "prd_review",
  STAKEHOLDER_UPDATE: "stakeholder_update",
} as const;

export type CueType = (typeof CueType)[keyof typeof CueType];

export const GENERATE_CUE_SCENARIOS = [
  "Meeting",
  "PRD Review",
  "Stakeholder Update",
] as const;

export type GenerateCueScenario = (typeof GENERATE_CUE_SCENARIOS)[number];

export type PMScenario = "product discussion" | GenerateCueScenario;

export type SourceCategoryId =
  | "ai_models"
  | "ai_products"
  | "saas_devtools"
  | "pm_craft"
  | "market_signals";

export interface SourceReference {
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  author?: string;
}

export interface SourceAllowlistItem {
  id: string;
  name: string;
  categoryId: SourceCategoryId;
  homepageUrl: string;
  feedUrl?: string;
  enabled: boolean;
  authorityWeight: number;
  maxItemsPerDay: number;
  costTier?: "free" | "paid" | "manual";
  refreshMethod?: "rss" | "homepage";
}

export interface SourceCategory {
  id: SourceCategoryId;
  label: string;
  description: string;
}

export interface SourceCandidate {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  categoryId: SourceCategoryId;
  headline: string;
  snippet?: string;
  publishedAt: string;
  rankingScore: number;
  maxItemsPerDay?: number;
}

export interface SourceFetchHealth {
  sourceId: string;
  sourceName: string;
  status: "ok" | "skipped" | "error";
  itemCount: number;
  checkedAt: string;
  message?: string;
}

export interface CueItem {
  id: string;
  sourceType: CueSourceType;
  cueType: CueType;
  title: string;
  chineseExplanation: string;
  englishOutput: string;
  phrases: string[]; // max 3 elements
  scenario: PMScenario;
  speakingPrompt: string;
  sampleAnswer: string;
  isSaved: boolean;
  isDone: boolean;
  createdAt: string;
  sourceRef?: SourceReference;
  dailyCueId?: string;
}

export type GeneratedCueItem = Omit<CueItem, "isSaved" | "isDone">;

export interface DailyCueItem {
  id: string;
  sourceType: "daily";
  cueType: CueType;
  categoryId: SourceCategoryId;
  headline: string;
  chineseHeadline: string;
  sourceRef: SourceReference;
  whyItMatters: string;
  pmEnglishCue: string;
  phrases: string[];
  scenario: PMScenario;
  rankingScore: number;
  createdAt: string;
}

export interface DailyBrief {
  id: string;
  date: string;
  summary: string;
  itemIds: string[];
  lastUpdatedAt: string;
  nextRefreshAt: string;
}

export interface DailyWorkCue {
  id: string;
  date: string;
  scenario: GenerateCueScenario;
  chinesePrompt: string;
  englishCue: string;
  phrases: string[];
  reminderText: string;
  createdAt: string;
  nextRefreshAt: string;
}

export interface GenerateCueRequest {
  chineseThought: string;
  scenario: GenerateCueScenario;
}

export interface GenerateCueResponse {
  success: boolean;
  item?: GeneratedCueItem;
  error?: string;
}

export interface DailyWorkCueResponse {
  success: boolean;
  item?: DailyWorkCue;
  error?: string;
}

export interface DailyCuesResponse {
  success: boolean;
  brief?: DailyBrief;
  items?: DailyCueItem[];
  lastUpdatedAt?: string;
  nextRefreshAt?: string;
  generatedFrom?: "live_sources" | "partial_live_sources" | "empty_live_sources";
  sourceHealth?: SourceFetchHealth[];
  error?: string;
}

export interface SourcesResponse {
  success: boolean;
  categories?: SourceCategory[];
  sources?: SourceAllowlistItem[];
  error?: string;
}
