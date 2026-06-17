/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CueItem } from "../types";

export const mockCues: CueItem[] = [
  {
    id: "cue_001",
    sourceType: "daily",
    cueType: "ai_product",
    title: "AI agents are becoming product teammates",
    chineseExplanation: "AI Agent 正在从工具变成工作流协作者。",
    englishOutput: "AI agents are becoming embedded teammates in daily product workflows.",
    phrases: ["embedded teammate", "workflow automation", "cross-functional"],
    scenario: "product discussion",
    speakingPrompt: "How would you explain the value of AI agents to your team?",
    sampleAnswer: "I'd position AI agents as workflow partners that help product teams reduce repetitive work.",
    isSaved: false,
    isDone: false,
    createdAt: "2026-06-16T10:00:00Z"
  },
  {
    id: "cue_002",
    sourceType: "daily",
    cueType: "meeting",
    title: "Prioritize Core Path Over Nice-to-Haves",
    chineseExplanation: "这个需求其实没有那么紧急，不用现在塞进去排期。",
    englishOutput: "This requirement isn't on the critical path right now, so we can table it for a future sprint.",
    phrases: ["critical path", "table it", "future sprint"],
    scenario: "Meeting",
    speakingPrompt: "How would you politely push back on an unurgent stakeholder request in a sync?",
    sampleAnswer: "I would say: 'Let's keep our focus on the core deliverables; since this isn't on the critical path, we can table it for a future sprint.'",
    isSaved: false,
    isDone: false,
    createdAt: "2026-06-16T11:00:00Z"
  },
  {
    id: "cue_003",
    sourceType: "daily",
    cueType: "prd_review",
    title: "Let Data Drive the Decision",
    chineseExplanation: "我们不能只凭感觉，需要看具体指标和数据表现才能做决定。",
    englishOutput: "We must let quantitative data drive this decision rather than relying solely on our intuition.",
    phrases: ["quantitative data", "drive this decision", "relying solely on intuition"],
    scenario: "PRD Review",
    speakingPrompt: "How do you direct your engineering team to wait for A/B test results before shipping?",
    sampleAnswer: "I would say: 'Before we roll this out fully, we must let quantitative data drive this decision rather than relying solely on our intuition.'",
    isSaved: false,
    isDone: false,
    createdAt: "2026-06-16T12:00:00Z"
  },
  {
    id: "cue_04",
    sourceType: "work",
    cueType: "stakeholder_update",
    title: "Managing Scope and Releases",
    chineseExplanation: "产品资源有限，这个功能推迟到下个版本再做，优先保证核心稳定性。",
    englishOutput: "We are pushing this feature to the next release cycle to safeguard our primary launch timeline and stability.",
    phrases: ["release cycle", "safeguard launch timeline", "primary stability"],
    scenario: "Stakeholder Update",
    speakingPrompt: "How do you explain a feature delay to marketing stakeholders without panicking them?",
    sampleAnswer: "I'd explain that pushing this feature to the next release cycle ensures our foundational launch is robust.",
    isSaved: false,
    isDone: false,
    createdAt: "2026-06-16T13:00:00Z"
  },
  {
    id: "cue_005",
    sourceType: "daily",
    cueType: "prd_review",
    title: "Streamlining Screen Interfaces for Activation",
    chineseExplanation: "我希望精简一下这个新用户的引导界面，减少认知偏差，提高转化率。",
    englishOutput: "We should streamline this onboarding flow to reduce cognitive load and improve our user activation rate.",
    phrases: ["onboarding flow", "cognitive load", "activation rate"],
    scenario: "PRD Review",
    speakingPrompt: "How would you justify removing 3 input fields from the registration form to a designer?",
    sampleAnswer: "I'd say: 'Let's streamline the onboarding flow to reduce cognitive load, which will ultimately drive up our activation rate.'",
    isSaved: false,
    isDone: false,
    createdAt: "2026-06-16T14:00:00Z"
  },
  {
    id: "cue_006",
    sourceType: "daily",
    cueType: "meeting",
    title: "Aligning Timelines and Spotting Blockers",
    chineseExplanation: "大家都来对一下排期，把可能延期的、需要协调的困难说一下。",
    englishOutput: "Let's align our timelines today and call out any potential blockers or cross-team dependencies.",
    phrases: ["align timelines", "potential blockers", "cross-team dependencies"],
    scenario: "Meeting",
    speakingPrompt: "What is your typical opening line when running a weekly sync meeting?",
    sampleAnswer: "I usually open with: 'Let's start by aligning our timelines and immediately calling out any potential blockers or dependencies.'",
    isSaved: false,
    isDone: false,
    createdAt: "2026-06-16T15:00:00Z"
  },
  {
    id: "cue_007",
    sourceType: "daily",
    cueType: "ai_product",
    title: "Validate Fast with Lightweight Shipping",
    chineseExplanation: "我们需要快速发布一个最简版去试一下用户反应，再做后面的迭代。",
    englishOutput: "We need to ship a lightweight version to validate user sentiment and iterate post-launch.",
    phrases: ["lightweight version", "validate user sentiment", "iterate post-launch"],
    scenario: "product discussion",
    speakingPrompt: "How do you convince stakeholders to launch an incomplete feature for feedback?",
    sampleAnswer: "I'd argue that shipping a lightweight version now lets us validate actual user sentiment and iteratively refine it based on real usage.",
    isSaved: false,
    isDone: false,
    createdAt: "2026-06-16T16:00:00Z"
  },
  {
    id: "cue_008",
    sourceType: "daily",
    cueType: "stakeholder_update",
    title: "Directing Focus to the Core Pain Point",
    chineseExplanation: "先不要画大饼谈3年规划，现在的当务之急是先把核心痛点解决了。",
    englishOutput: "Instead of focusing on long-term vision, we must double down on resolving the core user pain point immediately.",
    phrases: ["double down", "core user pain point", "long-term vision"],
    scenario: "Stakeholder Update",
    speakingPrompt: "How do you dial down expectations during an aggressive planning sync?",
    sampleAnswer: "I'd propose: 'Let's double down on explaining how we address the core pain point before expanding into broader long-term visions.'",
    isSaved: false,
    isDone: false,
    createdAt: "2026-06-16T17:00:00Z"
  }
];
