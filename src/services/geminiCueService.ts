/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { CueType } from "../types";
import type { GeneratedCueItem, GenerateCueScenario } from "../types";

const DEFAULT_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-2.5-flash-lite",
];

interface GeminiCueResult {
  item: GeneratedCueItem;
  modelUsed: string;
}

export const getGeminiModelCandidates = (): string[] => {
  const configured = process.env.GEMINI_MODEL;
  if (!configured) return DEFAULT_GEMINI_MODELS;

  const models = configured
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  return models.length > 0 ? models : DEFAULT_GEMINI_MODELS;
};

export const isGeminiConfigured = (): boolean => {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey !== "MY_GEMINI_API_KEY");
};

const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is required for Work Cue generation.");
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

const buildPrompt = (
  chineseThought: string,
  scenario: GenerateCueScenario
): string => `
  You are an expert Product Manager coach who turns raw Chinese ideas or tasks into work-native, elegant PM English.

  Look at this raw Chinese thought from a Product Manager: "${chineseThought}"
  They want to express this in a professional work context: "${scenario}" (options are: Meeting, PRD Review, Stakeholder Update).

  Convert this thought into "work-native" PM English. Avoid rigid literal translations.
  For example, instead of translating "这个需求不紧急" to "This requirement is not urgent", translate it to "This isn't on the critical path right now".
  Make it feel polished, elegant, and highly authoritative in a Silicon Valley SaaS team standard.

  Output your response as JSON conforming strictly to the requested response schema.
`;

const parseGeminiCue = (
  responseText: string,
  chineseThought: string,
  scenario: GenerateCueScenario
): GeneratedCueItem => {
  const parsedData = JSON.parse(responseText || "{}");

  return {
    id: `cue_generated_${Date.now()}`,
    sourceType: "work",
    cueType: CueType.AI_PRODUCT,
    title: parsedData.title || "PM English Cue",
    chineseExplanation: parsedData.chineseExplanation || chineseThought,
    englishOutput: parsedData.englishOutput || "",
    phrases: Array.isArray(parsedData.phrases) ? parsedData.phrases : [],
    scenario,
    speakingPrompt:
      parsedData.speakingPrompt || "How would you state this to your team members?",
    sampleAnswer:
      parsedData.sampleAnswer ||
      "I would focus on communicating our metrics and tracking deliverables.",
    createdAt: new Date().toISOString(),
  };
};

export const generatePMCueWithGemini = async (
  chineseThought: string,
  scenario: GenerateCueScenario
): Promise<GeminiCueResult> => {
  const ai = getGeminiClient();
  const prompt = buildPrompt(chineseThought, scenario);
  const modelCandidates = getGeminiModelCandidates();
  const errors: string[] = [];

  for (const model of modelCandidates) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description:
                  "A short, elegant English title for this cue card, e.g. 'Aligning Timelines', 'Managing Scope Creep', or 'Data-Driven Consensus'.",
              },
              chineseExplanation: {
                type: Type.STRING,
                description: "The original Chinese workspace thought provided by the user.",
              },
              englishOutput: {
                type: Type.STRING,
                description: "The polished, authentic work-native PM English equivalent.",
              },
              phrases: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  "Exactly 2 or 3 high-impact professional phrases or terms used in the English output, e.g. ['critical path', 'cognitive load'].",
              },
              speakingPrompt: {
                type: Type.STRING,
                description:
                  "A short, interactive question or prompt for the user to practice speaking, e.g. 'How would you present this timeline shift to your stakeholders?'",
              },
              sampleAnswer: {
                type: Type.STRING,
                description:
                  "A short, natural oral response example mapping exactly how the user can answering the speaking prompt using some of the phrases.",
              },
            },
            required: [
              "title",
              "chineseExplanation",
              "englishOutput",
              "phrases",
              "speakingPrompt",
              "sampleAnswer",
            ],
          },
        },
      });

      return {
        item: parseGeminiCue(response.text || "{}", chineseThought, scenario),
        modelUsed: model,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${model}: ${message}`);
      console.warn(`Gemini model failed: ${model}`);
    }
  }

  throw new Error(`Gemini generation failed for all configured models. ${errors.join(" | ")}`);
};
