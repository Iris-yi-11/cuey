/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from "dotenv";
import { generatePMCueWithGemini } from "../src/services/geminiCueService";

dotenv.config({ path: ".env.local" });
dotenv.config();

const GENERATE_CUE_SCENARIOS = [
  "Meeting",
  "PRD Review",
  "Stakeholder Update",
] as const;

type GenerateCueScenario = (typeof GENERATE_CUE_SCENARIOS)[number];

const isGenerateCueScenario = (value: unknown): value is GenerateCueScenario =>
  typeof value === "string" &&
  (GENERATE_CUE_SCENARIOS as readonly string[]).includes(value);

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

    const { item, modelUsed } = await generatePMCueWithGemini(chineseThought, scenario);
    return res.json({ success: true, item, modelUsed });
  } catch (error: any) {
    console.error("Gemini service error during Vercel API call:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to turn thought into PM English",
    });
  }
}
