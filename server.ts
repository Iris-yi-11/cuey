/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { CueType, GENERATE_CUE_SCENARIOS } from "./src/types";
import type { GenerateCueScenario, GeneratedCueItem } from "./src/types";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = 3000;
const GEMINI_MODEL = "gemini-3.5-flash";

app.use(express.json());

const isGenerateCueScenario = (value: unknown): value is GenerateCueScenario =>
  typeof value === "string" &&
  (GENERATE_CUE_SCENARIOS as readonly string[]).includes(value);

// Initialize Gemini client strictly using Guidelines
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Error initializing Gemini client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found, running in offline/mock model mode.");
}

// REST API route for PM English Cues generation
app.post("/api/generate", async (req, res) => {
  try {
    const { chineseThought, scenario } = req.body;

    if (!chineseThought || !chineseThought.trim()) {
      return res.status(400).json({ success: false, error: "Chinese work thought is required." });
    }

    if (!isGenerateCueScenario(scenario)) {
      return res.status(400).json({ success: false, error: "Unsupported PM Cue scenario." });
    }

    const isMockMode = process.env.NEXT_PUBLIC_MOCK_AI === "true" || !ai;

    if (isMockMode) {
      console.log(`[Offline Fallback] Translating Chinese thought: "${chineseThought}" for scenario: ${scenario}`);
      // Simulated generation based on input scenario & thoughts
      // We will generate a clever dynamic mock card to provide high user experience
      let title = "Aligning Core Expectations";
      let englishOutput = "We should prioritize our core path to align expectations across the board.";
      let phrases = ["core path", "align expectations", "across the board"];
      let speakingPrompt = `How do you explain this focus during a ${scenario} sync?`;
      let sampleAnswer = `I would suggest we double down on the core path to align everyone's expectations.`;

      if (scenario === "Meeting") {
        title = "Addressing Sync Alignment";
        englishOutput = `Regarding the synchronization, ${chineseThought} in natural English terms means: We must coordinate closely to streamline our upcoming sprints.`;
        phrases = ["coordinate closely", "streamline sprints", "project sync"];
        speakingPrompt = "How do you align multiple team schedules during a tense meeting?";
        sampleAnswer = "I usually open the sync by outlining our priorities to ensure tight alignment early on.";
      } else if (scenario === "PRD Review") {
        title = "Refining Product Specifications";
        englishOutput = `In our PRD context: ${chineseThought} translates to: Let's optimize this feature logic to avoid any regression on core parameters.`;
        phrases = ["feature logic", "core parameters", "avoid regression"];
        speakingPrompt = "What phrasing do you use to ask engineers for a simpler visual solution?";
        sampleAnswer = "I'd ask them if we could tackle this iteratively to address the immediate core user pain point.";
      } else if (scenario === "Stakeholder Update") {
        title = "Managing Stakeholder Priorities";
        englishOutput = `For stakeholders, this means: ${chineseThought} - We are closely monitoring our deliverable velocity to assure premium delivery.`;
        phrases = ["deliverable velocity", "premium delivery", "stakeholder consensus"];
        speakingPrompt = "How do you manage aggressive stakeholder feature requests during roadmapping?";
        sampleAnswer = "I'd explain that focusing on our core metrics first ensures our foundational launch remains highly secure.";
      }

      // Add a small delay to simulate realistic AI generation feel
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResult: GeneratedCueItem = {
        id: `cue_generated_${Date.now()}`,
        sourceType: "work" as const,
        cueType: CueType.AI_PRODUCT,
        title,
        chineseExplanation: chineseThought,
        englishOutput,
        phrases,
        scenario,
        speakingPrompt,
        sampleAnswer,
        createdAt: new Date().toISOString(),
      };

      return res.json({ success: true, item: mockResult });
    }

    // Call real Gemini API
    console.log(`[Gemini API] Requesting AI generation for scenario: "${scenario}"`);
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
              description: "A short, elegant English title for this cue card, e.g. 'Aligning Timelines', 'Managing Scope Creep', or 'Data-Driven Consensus'.",
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
              description: "Exactly 2 or 3 high-impact professional phrases or terms used in the English output, e.g. ['critical path', 'cognitive load'].",
            },
            speakingPrompt: {
              type: Type.STRING,
              description: "A short, interactive question or prompt for the user to practice speaking, e.g. 'How would you present this timeline shift to your stakeholders?'",
            },
            sampleAnswer: {
              type: Type.STRING,
              description: "A short, natural oral response example mapping exactly how the user can answering the speaking prompt using some of the phrases.",
            },
          },
          required: ["title", "chineseExplanation", "englishOutput", "phrases", "speakingPrompt", "sampleAnswer"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");

    // Construct final CueItem format (excluding parent state tracking)
    const generatedCue: GeneratedCueItem = {
      id: `cue_generated_${Date.now()}`,
      sourceType: "work" as const,
      cueType: CueType.AI_PRODUCT,
      title: parsedData.title || "PM English Cue",
      chineseExplanation: parsedData.chineseExplanation || chineseThought,
      englishOutput: parsedData.englishOutput || "",
      phrases: parsedData.phrases || [],
      scenario: scenario,
      speakingPrompt: parsedData.speakingPrompt || "How would you state this to your team members?",
      sampleAnswer: parsedData.sampleAnswer || "I would focus on communicating our metrics and tracking deliverables.",
      createdAt: new Date().toISOString(),
    };

    return res.json({ success: true, item: generatedCue });

  } catch (error: any) {
    console.error("Gemini service error during API call:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to turn thought into PM English" });
  }
});

// Setup Vite Dev server or Serve Static files for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware integrated.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static file server active for production build.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is booting. External traffic bound to http://localhost:${PORT}`);
  });
}

startServer();
