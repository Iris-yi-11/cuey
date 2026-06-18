/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const GEMINI_MODEL = "gemini-3.5-flash";
const CUE_TYPE_AI_PRODUCT = "ai_product";
const GENERATE_CUE_SCENARIOS = [
  "Meeting",
  "PRD Review",
  "Stakeholder Update",
] as const;

type GenerateCueScenario = (typeof GENERATE_CUE_SCENARIOS)[number];

interface GeneratedCueItem {
  id: string;
  sourceType: "work";
  cueType: typeof CUE_TYPE_AI_PRODUCT;
  title: string;
  chineseExplanation: string;
  englishOutput: string;
  phrases: string[];
  scenario: GenerateCueScenario;
  speakingPrompt: string;
  sampleAnswer: string;
  createdAt: string;
}

const isGenerateCueScenario = (value: unknown): value is GenerateCueScenario =>
  typeof value === "string" &&
  (GENERATE_CUE_SCENARIOS as readonly string[]).includes(value);

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
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

const buildMockCue = async (
  chineseThought: string,
  scenario: GenerateCueScenario
): Promise<GeneratedCueItem> => {
  let title = "Aligning Core Expectations";
  let englishOutput =
    "We should prioritize our core path to align expectations across the board.";
  let phrases = ["core path", "align expectations", "across the board"];
  let speakingPrompt = `How do you explain this focus during a ${scenario} sync?`;
  let sampleAnswer =
    "I would suggest we double down on the core path to align everyone's expectations.";

  if (scenario === "Meeting") {
    title = "Addressing Sync Alignment";
    englishOutput = `Regarding the synchronization, ${chineseThought} in natural English terms means: We must coordinate closely to streamline our upcoming sprints.`;
    phrases = ["coordinate closely", "streamline sprints", "project sync"];
    speakingPrompt = "How do you align multiple team schedules during a tense meeting?";
    sampleAnswer =
      "I usually open the sync by outlining our priorities to ensure tight alignment early on.";
  } else if (scenario === "PRD Review") {
    title = "Refining Product Specifications";
    englishOutput = `In our PRD context: ${chineseThought} translates to: Let's optimize this feature logic to avoid any regression on core parameters.`;
    phrases = ["feature logic", "core parameters", "avoid regression"];
    speakingPrompt =
      "What phrasing do you use to ask engineers for a simpler visual solution?";
    sampleAnswer =
      "I'd ask them if we could tackle this iteratively to address the immediate core user pain point.";
  } else if (scenario === "Stakeholder Update") {
    title = "Managing Stakeholder Priorities";
    englishOutput = `For stakeholders, this means: ${chineseThought} - We are closely monitoring our deliverable velocity to assure premium delivery.`;
    phrases = ["deliverable velocity", "premium delivery", "stakeholder consensus"];
    speakingPrompt =
      "How do you manage aggressive stakeholder feature requests during roadmapping?";
    sampleAnswer =
      "I'd explain that focusing on our core metrics first ensures our foundational launch remains highly secure.";
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    id: `cue_generated_${Date.now()}`,
    sourceType: "work",
    cueType: CUE_TYPE_AI_PRODUCT,
    title,
    chineseExplanation: chineseThought,
    englishOutput,
    phrases,
    scenario,
    speakingPrompt,
    sampleAnswer,
    createdAt: new Date().toISOString(),
  };
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  try {
    const { chineseThought, scenario } = req.body || {};

    if (!chineseThought || !chineseThought.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Chinese work thought is required." });
    }

    if (!isGenerateCueScenario(scenario)) {
      return res
        .status(400)
        .json({ success: false, error: "Unsupported PM Cue scenario." });
    }

    const ai = getGeminiClient();
    const isMockMode = process.env.NEXT_PUBLIC_MOCK_AI === "true" || !ai;

    if (isMockMode) {
      const item = await buildMockCue(chineseThought, scenario);
      return res.json({ success: true, item });
    }

    const prompt = `
      You are an expert Product Manager coach who turns raw Chinese ideas or tasks into work-native, elegant PM English.

      Look at this raw Chinese thought from a Product Manager: "${chineseThought}"
      They want to express this in a professional work context: "${scenario}" (options are: Meeting, PRD Review, Stakeholder Update).

      Convert this thought into "work-native" PM English. Avoid rigid literal translations.
      For example, instead of translating "这个需求不紧急" to "This requirement is not urgent", translate it to "This isn't on the critical path right now".
      Make it feel polished, elegant, and highly authoritative in a Silicon Valley SaaS team standard.

      Output your response as JSON conforming strictly to the requested response schema.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
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

    const parsedData = JSON.parse(response.text || "{}");
    const item: GeneratedCueItem = {
      id: `cue_generated_${Date.now()}`,
      sourceType: "work",
      cueType: CUE_TYPE_AI_PRODUCT,
      title: parsedData.title || "PM English Cue",
      chineseExplanation: parsedData.chineseExplanation || chineseThought,
      englishOutput: parsedData.englishOutput || "",
      phrases: parsedData.phrases || [],
      scenario,
      speakingPrompt:
        parsedData.speakingPrompt || "How would you state this to your team members?",
      sampleAnswer:
        parsedData.sampleAnswer ||
        "I would focus on communicating our metrics and tracking deliverables.",
      createdAt: new Date().toISOString(),
    };

    return res.json({ success: true, item });
  } catch (error: any) {
    console.error("Gemini service error during Vercel API call:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to turn thought into PM English",
    });
  }
}
