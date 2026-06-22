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
}

export type GeneratedCueItem = Omit<CueItem, "isSaved" | "isDone">;

export interface GenerateCueRequest {
  chineseThought: string;
  scenario: GenerateCueScenario;
}

export interface GenerateCueResponse {
  success: boolean;
  item?: GeneratedCueItem;
  error?: string;
}
