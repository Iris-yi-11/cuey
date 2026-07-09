import { afterEach, describe, expect, it } from "vitest";
import { generatePMCueWithGemini, getGeminiModelCandidates } from "./geminiCueService";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("geminiCueService", () => {
  it("uses configured model candidates in order", () => {
    process.env.GEMINI_MODEL = "gemini-a, gemini-b";

    expect(getGeminiModelCandidates()).toEqual(["gemini-a", "gemini-b"]);
  });

  it("does not generate a mock cue when GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(
      generatePMCueWithGemini("这个需求先不要塞进本轮", "Meeting")
    ).rejects.toThrow("GEMINI_API_KEY is required");
  });
});
