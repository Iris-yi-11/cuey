import { describe, expect, it } from "vitest";
import { CueType } from "../types";
import type { CueItem, DailyCueItem } from "../types";
import {
  buildCueFromDailyItem,
  filterDailyCardsByCategory,
  getDailyCategoryCounts,
} from "./dailyCueViewModel";

const makeDailyItem = (id: string, categoryId: DailyCueItem["categoryId"]): DailyCueItem => ({
  id,
  sourceType: "daily",
  cueType: CueType.AI_PRODUCT,
  categoryId,
  headline: `${id} headline`,
  chineseHeadline: `${id} 中文标题`,
  sourceRef: {
    sourceName: "OpenAI News",
    sourceUrl: "https://openai.com/news/",
    publishedAt: "2026-07-07T00:00:00.000Z",
  },
  whyItMatters: `${id} matters`,
  pmEnglishCue: `${id} English cue`,
  phrases: ["product scope", "adoption risk"],
  scenario: "Meeting",
  rankingScore: 90,
  createdAt: "2026-07-07T00:00:00.000Z",
});

const savedCue: CueItem = {
  id: "daily_1",
  sourceType: "daily",
  cueType: CueType.AI_PRODUCT,
  title: "saved",
  chineseExplanation: "saved",
  englishOutput: "saved",
  phrases: ["saved"],
  scenario: "Meeting",
  speakingPrompt: "saved",
  sampleAnswer: "saved",
  isSaved: true,
  isDone: true,
  createdAt: "2026-07-07T00:00:00.000Z",
  dailyCueId: "daily_1",
};

describe("dailyCueViewModel", () => {
  it("builds a CueItem from a DailyCueItem while preserving saved practice state", () => {
    const cue = buildCueFromDailyItem(makeDailyItem("daily_1", "ai_models"), [savedCue]);

    expect(cue.title).toBe("daily_1 中文标题");
    expect(cue.englishOutput).toBe("daily_1 English cue");
    expect(cue.isSaved).toBe(true);
    expect(cue.isDone).toBe(true);
    expect(cue.dailyCueId).toBe("daily_1");
  });

  it("counts Daily Cue categories", () => {
    const counts = getDailyCategoryCounts([
      makeDailyItem("daily_1", "ai_models"),
      makeDailyItem("daily_2", "ai_models"),
      makeDailyItem("daily_3", "saas_devtools"),
    ]);

    expect(counts.get("ai_models")).toBe(2);
    expect(counts.get("saas_devtools")).toBe(1);
  });

  it("filters display cards by the original DailyCueItem category", () => {
    const dailyItems = [
      makeDailyItem("daily_1", "ai_models"),
      makeDailyItem("daily_2", "saas_devtools"),
    ];
    const cards = dailyItems.map((item) => buildCueFromDailyItem(item, []));

    const filtered = filterDailyCardsByCategory(cards, dailyItems, "saas_devtools");

    expect(filtered.map((item) => item.id)).toEqual(["daily_2"]);
  });
});
