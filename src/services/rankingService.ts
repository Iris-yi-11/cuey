/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SourceCandidate } from "../types.js";

const RECENCY_WINDOW_HOURS = 48;
const DAILY_ITEM_LIMIT = 12;
const DEFAULT_MAX_PER_SOURCE = 2;

const relevanceKeywords = [
  "agent",
  "ai",
  "api",
  "automation",
  "assistant",
  "claude",
  "copilot",
  "developer",
  "enterprise",
  "gemini",
  "launch",
  "model",
  "product",
  "release",
  "workflow",
];

const actionabilityKeywords = [
  "adoption",
  "customer",
  "design",
  "experiment",
  "feedback",
  "pricing",
  "productivity",
  "roadmap",
  "security",
  "team",
  "user",
];

const hoursSince = (publishedAt: string): number => {
  const publishedTime = new Date(publishedAt).getTime();
  if (Number.isNaN(publishedTime)) return RECENCY_WINDOW_HOURS;
  return Math.max(0, (Date.now() - publishedTime) / (1000 * 60 * 60));
};

const keywordScore = (text: string, keywords: string[], weight: number): number => {
  const lower = text.toLowerCase();
  const matches = keywords.filter((keyword) => lower.includes(keyword)).length;
  return Math.min(matches * weight, weight * 4);
};

const normalizeUrl = (url: string): string => url.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/$/, "");

export const scoreSourceCandidate = (candidate: SourceCandidate): number => {
  const text = `${candidate.headline} ${candidate.snippet || ""}`;
  const recencyScore = Math.max(0, 25 - (hoursSince(candidate.publishedAt) / RECENCY_WINDOW_HOURS) * 25);
  const relevanceScore = keywordScore(text, relevanceKeywords, 6);
  const actionabilityScore = keywordScore(text, actionabilityKeywords, 4);
  const baseScore = candidate.rankingScore * 0.5;

  return Math.round((baseScore + recencyScore + relevanceScore + actionabilityScore) * 10) / 10;
};

export const rankSourceCandidates = (candidates: SourceCandidate[]): SourceCandidate[] => {
  const byUrl = new Map<string, SourceCandidate>();

  for (const candidate of candidates) {
    const key = normalizeUrl(candidate.sourceUrl);
    const scored = {
      ...candidate,
      rankingScore: scoreSourceCandidate(candidate),
    };
    const existing = byUrl.get(key);
    if (!existing || scored.rankingScore > existing.rankingScore) {
      byUrl.set(key, scored);
    }
  }

  const sourceCounts = new Map<string, number>();
  const ranked: SourceCandidate[] = [];

  for (const candidate of Array.from(byUrl.values()).sort((a, b) => {
    if (b.rankingScore !== a.rankingScore) return b.rankingScore - a.rankingScore;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  })) {
    const count = sourceCounts.get(candidate.sourceId) || 0;
    const maxPerSource = candidate.maxItemsPerDay || DEFAULT_MAX_PER_SOURCE;
    if (count >= maxPerSource) continue;
    sourceCounts.set(candidate.sourceId, count + 1);
    ranked.push(candidate);
    if (ranked.length >= DAILY_ITEM_LIMIT) break;
  }

  return ranked;
};
