import type {
  DailyWorkCueResponse,
  GenerateCueResponse,
  GenerateCueScenario,
} from "../types";

export const fetchDailyWorkCue = async (
  apiBaseUrl: string
): Promise<DailyWorkCueResponse> => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/work-cues/daily`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch Daily Work Cue.");
    }

    return response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unable to load Daily Work Cue.",
    };
  }
};

export const generateDesktopCue = async (
  apiBaseUrl: string,
  chineseThought: string,
  scenario: GenerateCueScenario
): Promise<GenerateCueResponse> => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chineseThought, scenario }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to generate Work Cue.");
    }

    return response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unable to reach PM Cue Web API.",
    };
  }
};
