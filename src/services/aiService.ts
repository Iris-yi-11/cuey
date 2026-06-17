/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { GenerateCueRequest, GenerateCueResponse } from "../types";

/**
 * AI Service for PM Cue app.
 * Proxies calls to the Express server-side Gemini API route.
 * Fallback / comments provided for full-fledged direct integrations.
 */
export async function generatePMCue(
  request: GenerateCueRequest
): Promise<GenerateCueResponse> {
  // TODO: Integrate actual production endpoint or swap to self-contained cloud functions here
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to generate PM Cue");
    }

    const data = await response.json();
    return {
      success: true,
      item: data.item,
    };
  } catch (error: any) {
    console.error("AI service client side exception:", error);
    return {
      success: false,
      error: error.message || "Unable to reach the PM Cue translation server. Please check your connection or retry.",
    };
  }
}
