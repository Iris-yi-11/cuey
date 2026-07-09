/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DailyWorkCue, GenerateCueScenario } from "../types";

const scenarioRotation: GenerateCueScenario[] = ["Meeting", "PRD Review", "Stakeholder Update"];

const dailyWorkCueTemplates = [
  {
    chinesePrompt: "今天练习如何在同步会上说明：这个需求不在本轮主路径上。",
    englishCue:
      "This is not on the critical path for this sprint, so we should avoid pulling it into the current scope.",
    phrases: ["critical path", "current scope", "pull it into"],
    reminderText: "今天遇到需求插入时，试着用 critical path 解释取舍。",
  },
  {
    chinesePrompt: "今天练习如何在 PRD Review 中提出降 scope 建议。",
    englishCue:
      "Can we narrow the initial scope so we can validate the riskiest assumption first?",
    phrases: ["narrow the initial scope", "validate the riskiest assumption", "first"],
    reminderText: "今天找一次真实 PRD / review 场景，尝试使用这句话。",
  },
  {
    chinesePrompt: "今天练习如何向 stakeholder 解释排期风险。",
    englishCue:
      "If we add this now, we risk diluting focus and pushing out the launch-critical work.",
    phrases: ["diluting focus", "pushing out", "launch-critical work"],
    reminderText: "今天做进度沟通时，尝试把风险说成 trade-off。",
  },
];

const getBeijingDateString = (date: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

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

export const buildDailyWorkCue = (date: Date = new Date()): DailyWorkCue => {
  const beijingDate = getBeijingDateString(date);
  const daySeed = Math.floor(Date.parse(`${beijingDate}T00:00:00.000Z`) / 86_400_000);
  const template = dailyWorkCueTemplates[daySeed % dailyWorkCueTemplates.length];
  const scenario = scenarioRotation[daySeed % scenarioRotation.length];

  return {
    id: `daily_work_cue_${beijingDate.replace(/-/g, "_")}`,
    date: beijingDate,
    scenario,
    chinesePrompt: template.chinesePrompt,
    englishCue: template.englishCue,
    phrases: template.phrases,
    reminderText: template.reminderText,
    createdAt: date.toISOString(),
    nextRefreshAt: getNextBeijingMidnightAsUtcIso(date),
  };
};
