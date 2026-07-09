/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CueItem, DailyCueItem, SourceCategoryId } from "../types";

const DAILY_CUE_SPEAKING_PROMPT =
  "How would you explain why this signal matters to your product team?";

export const buildCueFromDailyItem = (
  item: DailyCueItem,
  existingCues: CueItem[]
): CueItem => {
  const existing = existingCues.find((cue) => cue.id === item.id || cue.dailyCueId === item.id);

  return {
    id: item.id,
    sourceType: "daily",
    cueType: item.cueType,
    title: item.chineseHeadline || item.headline,
    chineseExplanation: item.whyItMatters,
    englishOutput: item.pmEnglishCue,
    phrases: item.phrases,
    scenario: item.scenario,
    speakingPrompt: DAILY_CUE_SPEAKING_PROMPT,
    sampleAnswer: item.pmEnglishCue,
    isSaved: existing?.isSaved || false,
    isDone: existing?.isDone || false,
    createdAt: item.createdAt,
    sourceRef: item.sourceRef,
    dailyCueId: item.id,
  };
};

export const getDailyCategoryCounts = (
  dailyCueItems: DailyCueItem[]
): Map<SourceCategoryId, number> => {
  const counts = new Map<SourceCategoryId, number>();
  dailyCueItems.forEach((item) => {
    counts.set(item.categoryId, (counts.get(item.categoryId) || 0) + 1);
  });
  return counts;
};

export const filterDailyCardsByCategory = (
  cards: CueItem[],
  dailyCueItems: DailyCueItem[],
  filter: "all" | SourceCategoryId
): CueItem[] => {
  if (filter === "all") return cards;

  return cards.filter((cue) => {
    const source = dailyCueItems.find((item) => item.id === cue.dailyCueId || item.id === cue.id);
    return source?.categoryId === filter;
  });
};
