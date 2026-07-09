/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  CueItem,
  DailyCuesResponse,
  DailyWorkCueResponse,
  GenerateCueRequest,
  GenerateCueResponse,
  SourceAllowlistItem,
  SourcesResponse,
} from "../types";

interface CueBankResponse {
  success: boolean;
  remoteEnabled?: boolean;
  requiresAuth?: boolean;
  items?: CueItem[];
  item?: CueItem;
  deleted?: boolean;
  error?: string;
}

interface SourceManagementResponse extends SourcesResponse {
  source?: SourceAllowlistItem | null;
}

/**
 * AI Service for PM Cue app.
 * Proxies calls to the Express server-side Gemini API route.
 * Fallback / comments provided for full-fledged direct integrations.
 */
export async function generatePMCue(
  request: GenerateCueRequest
): Promise<GenerateCueResponse> {
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

export async function fetchDailyWorkCue(): Promise<DailyWorkCueResponse> {
  try {
    const response = await fetch("/api/work-cues/daily");

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch Daily Work Cue");
    }

    return response.json();
  } catch (error: any) {
    console.error("Daily Work Cue client side exception:", error);
    return {
      success: false,
      error: error.message || "Unable to load today's Work Cue. Please retry later.",
    };
  }
}

export async function fetchDailyCues(): Promise<DailyCuesResponse> {
  try {
    const response = await fetch("/api/daily-cues");

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch Daily Cues");
    }

    return response.json();
  } catch (error: any) {
    console.error("Daily Cue client side exception:", error);
    return {
      success: false,
      error: error.message || "Unable to load Daily Cues. Please retry later.",
    };
  }
}

export async function refreshDailyCuesFromApi(): Promise<DailyCuesResponse> {
  try {
    const response = await fetch("/api/daily-cues/refresh", {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to refresh Daily Cues");
    }

    return response.json();
  } catch (error: any) {
    console.error("Daily Cue refresh client side exception:", error);
    return {
      success: false,
      error: error.message || "Unable to refresh Daily Cues. Please retry later.",
    };
  }
}

export async function fetchSources(): Promise<SourcesResponse> {
  try {
    const response = await fetch("/api/sources");

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch source allowlist");
    }

    return response.json();
  } catch (error: any) {
    console.error("Source allowlist client side exception:", error);
    return {
      success: false,
      error: error.message || "Unable to load source allowlist. Please retry later.",
    };
  }
}

export async function fetchManagedSources(): Promise<SourceManagementResponse> {
  try {
    const response = await fetch("/api/source-management");

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch managed sources");
    }

    return response.json();
  } catch (error: any) {
    console.error("Managed source fetch exception:", error);
    return {
      success: false,
      error: error.message || "Unable to load managed sources.",
    };
  }
}

export async function updateManagedSourceEnabledFromApi(
  sourceId: string,
  enabled: boolean
): Promise<SourceManagementResponse> {
  try {
    const response = await fetch("/api/source-management", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sourceId, enabled }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to update managed source");
    }

    return response.json();
  } catch (error: any) {
    console.error("Managed source update exception:", error);
    return {
      success: false,
      error: error.message || "Unable to update managed source.",
    };
  }
}

export async function fetchCueBankItems(accessToken: string | null): Promise<CueBankResponse> {
  try {
    const response = await fetch("/api/cue-bank", {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch Cue Bank");
    }

    return response.json();
  } catch (error: any) {
    console.error("Cue Bank remote fetch exception:", error);
    return {
      success: false,
      error: error.message || "Unable to load remote Cue Bank.",
    };
  }
}

export async function saveCueBankItem(accessToken: string | null, item: CueItem): Promise<CueBankResponse> {
  try {
    const response = await fetch("/api/cue-bank", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ item }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to save Cue Bank item");
    }

    return response.json();
  } catch (error: any) {
    console.error("Cue Bank remote save exception:", error);
    return {
      success: false,
      error: error.message || "Unable to save remote Cue Bank item.",
    };
  }
}

export async function deleteCueBankItemFromRemote(
  accessToken: string | null,
  itemId: string
): Promise<CueBankResponse> {
  try {
    const response = await fetch(`/api/cue-bank?id=${encodeURIComponent(itemId)}`, {
      method: "DELETE",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to delete Cue Bank item");
    }

    return response.json();
  } catch (error: any) {
    console.error("Cue Bank remote delete exception:", error);
    return {
      success: false,
      error: error.message || "Unable to delete remote Cue Bank item.",
    };
  }
}
