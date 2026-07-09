/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CueType } from "../types.js";
import type {
  DailyBrief,
  DailyCueItem,
  GenerateCueScenario,
  SourceCandidate,
  SourceFetchHealth,
} from "../types.js";
import { rankSourceCandidates } from "./rankingService.js";
import { fetchSourceCandidates } from "./sourceFetchService.js";
import { listManagedSources } from "./sourceManagementRepository.js";
import {
  isDailyCuePersistenceEnabled,
  readPersistedDailyCues,
  writePersistedDailyCues,
} from "./dailyCuePersistenceService.js";

const DAILY_ITEM_LIMIT = 12;
const DAILY_CACHE_TTL_MS = 30 * 60 * 1000;

const scenarioRotation: GenerateCueScenario[] = ["Meeting", "PRD Review", "Stakeholder Update"];

const categoryChineseLabels: Record<SourceCandidate["categoryId"], string> = {
  ai_models: "AI 模型更新",
  ai_products: "AI 产品信号",
  saas_devtools: "开发工具动态",
  pm_craft: "产品方法观察",
  market_signals: "市场与商业信号",
};

type DailyCueSourceMode = "live_sources" | "partial_live_sources" | "empty_live_sources";

interface DailyCueResult {
  brief: DailyBrief;
  items: DailyCueItem[];
  generatedFrom: DailyCueSourceMode;
  sourceHealth: SourceFetchHealth[];
}

let dailyCueCache: { result: DailyCueResult; cachedAt: number } | null = null;

const getBeijingDateString = (date: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const getTodayBeijingDateString = (): string => getBeijingDateString(new Date());

const getNextBeijingMidnightAsUtcIso = (date: Date): string => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return new Date(Date.UTC(year, month - 1, day + 1, -8, 0, 0, 0)).toISOString();
};

const summarizeCandidate = (candidate: SourceCandidate): string => {
  const snippet = candidate.snippet?.trim();
  if (snippet) return snippet.slice(0, 160);
  return `${candidate.sourceName} 发布了与 AI/Product 相关的新动态，值得 PM 关注其产品策略影响。`;
};

const buildPmEnglishCue = (candidate: SourceCandidate): string => {
  const headline = candidate.headline.replace(/\s+/g, " ").trim();
  return `This signal suggests PMs should reassess how "${headline}" changes user workflows, adoption risk, or product scope.`;
};

const buildChineseHeadline = (candidate: SourceCandidate): string => {
  const category = categoryChineseLabels[candidate.categoryId];
  return `${category}｜${candidate.sourceName} 新动态`;
};

const candidateToDailyCue = (candidate: SourceCandidate, index: number): DailyCueItem => {
  const scenario = scenarioRotation[index % scenarioRotation.length];

  return {
    id: `daily_${getBeijingDateString(new Date())}_${index + 1}_${candidate.sourceId}`,
    sourceType: "daily",
    cueType: CueType.AI_PRODUCT,
    categoryId: candidate.categoryId,
    headline: candidate.headline,
    chineseHeadline: buildChineseHeadline(candidate),
    sourceRef: {
      sourceName: candidate.sourceName,
      sourceUrl: candidate.sourceUrl,
      publishedAt: candidate.publishedAt,
    },
    whyItMatters: summarizeCandidate(candidate),
    pmEnglishCue: buildPmEnglishCue(candidate),
    phrases: ["user workflows", "adoption risk", "product scope"],
    scenario,
    rankingScore: candidate.rankingScore,
    createdAt: new Date().toISOString(),
  };
};

const buildBrief = (items: DailyCueItem[], generatedFrom: DailyCueSourceMode): DailyBrief => {
  const now = new Date();
  const date = getBeijingDateString(now);
  const topSources = Array.from(new Set(items.slice(0, 5).map((item) => item.sourceRef.sourceName))).join(", ");

  return {
    id: `daily_brief_${date}`,
    date,
    summary:
      items.length > 0
        ? generatedFrom === "live_sources"
          ? `今天的 AI/Product signals 主要来自 ${topSources}，重点关注 agent workflow、产品采用、开发者效率和企业级落地。`
          : `今天只拉取到部分实时来源，主要来自 ${topSources}；可同步来源或稍后刷新。`
        : "当前真实来源暂时没有可展示的 Daily Cue。请检查 Source Management 或稍后刷新。",
    itemIds: items.map((item) => item.id),
    lastUpdatedAt: now.toISOString(),
    nextRefreshAt: getNextBeijingMidnightAsUtcIso(now),
  };
};

export const refreshDailyCues = async (): Promise<DailyCueResult> => {
  try {
    const sources = await listManagedSources();
    const { candidates, health } = await fetchSourceCandidates(sources);
    const ranked = rankSourceCandidates(candidates);

    if (ranked.length === 0) {
      const result = {
        brief: buildBrief([], "empty_live_sources"),
        items: [],
        generatedFrom: "empty_live_sources" as const,
        sourceHealth: health,
      };
      dailyCueCache = { result, cachedAt: Date.now() };
      await writePersistedDailyCues(result);
      return result;
    }

    const realItems = ranked.slice(0, DAILY_ITEM_LIMIT).map(candidateToDailyCue);
    const items = realItems.slice(0, DAILY_ITEM_LIMIT);
    const generatedFrom: DailyCueSourceMode =
      realItems.length >= 10 ? "live_sources" : "partial_live_sources";
    const result = {
      brief: buildBrief(items, generatedFrom),
      items,
      generatedFrom,
      sourceHealth: health,
    };
    dailyCueCache = { result, cachedAt: Date.now() };
    await writePersistedDailyCues(result);
    return result;
  } catch (error) {
    console.error("Daily Cue refresh failed; returning no live items:", error);
    const result = {
      brief: buildBrief([], "empty_live_sources"),
      items: [],
      generatedFrom: "empty_live_sources" as const,
      sourceHealth: [
        {
          sourceId: "live_source_refresh",
          sourceName: "Live source refresh",
          status: "error" as const,
          itemCount: 0,
          checkedAt: new Date().toISOString(),
          message: error instanceof Error ? error.message : String(error),
        },
      ],
    };
    dailyCueCache = { result, cachedAt: Date.now() };
    return result;
  }
};

export const getDailyCues = async (): Promise<DailyCueResult> => {
  if (dailyCueCache && Date.now() - dailyCueCache.cachedAt < DAILY_CACHE_TTL_MS) {
    return dailyCueCache.result;
  }

  if (isDailyCuePersistenceEnabled()) {
    const persisted = await readPersistedDailyCues(getTodayBeijingDateString());
    if (persisted) {
      const result = {
        brief: persisted.brief,
        items: persisted.items,
        generatedFrom: persisted.generatedFrom,
        sourceHealth: persisted.sourceHealth,
      };
      dailyCueCache = { result, cachedAt: Date.now() };
      return result;
    }
  }

  return refreshDailyCues();
};
