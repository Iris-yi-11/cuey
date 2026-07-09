/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GENERATE_CUE_SCENARIOS } from "./src/types";
import type { GenerateCueScenario } from "./src/types";
import { sourceCategories } from "./src/data/sourceAllowlist";
import { getDailyCues, refreshDailyCues } from "./src/services/dailyCueService";
import { buildDailyWorkCue } from "./src/services/dailyWorkCueService";
import { generatePMCueWithGemini, isGeminiConfigured } from "./src/services/geminiCueService";
import {
  deleteCueBankItem,
  isCueBankRemoteEnabled,
  listCueBankItems,
  upsertCueBankItem,
} from "./src/services/cueBankRepository";
import {
  listManagedSources,
  updateManagedSourceEnabled,
} from "./src/services/sourceManagementRepository";
import {
  getSupabaseUserIdFromAuthHeader,
  isSupabaseConfigured,
  requestSupabaseTable,
} from "./src/services/supabaseRestService";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

const isGenerateCueScenario = (value: unknown): value is GenerateCueScenario =>
  typeof value === "string" &&
  (GENERATE_CUE_SCENARIOS as readonly string[]).includes(value);

if (isGeminiConfigured()) {
  console.log("Gemini API key configured. Work Cue generation will use real Gemini models only.");
} else {
  console.log("No valid GEMINI_API_KEY found. Work Cue generation will return an error.");
}

app.get("/api/daily-cues", async (_req, res) => {
  const result = await getDailyCues();
  return res.json({
    success: true,
    ...result,
    lastUpdatedAt: result.brief.lastUpdatedAt,
    nextRefreshAt: result.brief.nextRefreshAt,
  });
});

app.post("/api/daily-cues/refresh", async (_req, res) => {
  const result = await refreshDailyCues();
  return res.json({
    success: true,
    ...result,
    lastUpdatedAt: result.brief.lastUpdatedAt,
    nextRefreshAt: result.brief.nextRefreshAt,
  });
});

app.get("/api/work-cues/daily", (_req, res) => {
  return res.json({ success: true, item: buildDailyWorkCue() });
});

app.get("/api/sources", async (_req, res) => {
  const sources = await listManagedSources();
  return res.json({
    success: true,
    categories: sourceCategories,
    sources,
  });
});

app.get("/api/cue-bank", async (req, res) => {
  try {
    const userId = await getSupabaseUserIdFromAuthHeader(req.headers.authorization);
    if (!userId) {
      return res.json({
        success: true,
        remoteEnabled: isCueBankRemoteEnabled(),
        requiresAuth: true,
        items: [],
      });
    }

    const items = await listCueBankItems(userId);
    return res.json({
      success: true,
      remoteEnabled: isCueBankRemoteEnabled(),
      items: items || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ success: false, error: message });
  }
});

app.post("/api/cue-bank", async (req, res) => {
  try {
    const userId = await getSupabaseUserIdFromAuthHeader(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Sign in is required for Cue Bank sync." });
    }

    const item = req.body?.item;
    if (!item?.id) {
      return res.status(400).json({ success: false, error: "Cue item is required." });
    }

    const saved = await upsertCueBankItem(userId, item);
    return res.json({
      success: true,
      remoteEnabled: isCueBankRemoteEnabled(),
      item: saved || item,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ success: false, error: message });
  }
});

app.delete("/api/cue-bank", async (req, res) => {
  try {
    const userId = await getSupabaseUserIdFromAuthHeader(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Sign in is required for Cue Bank sync." });
    }

    const itemId = String(req.query?.id || req.body?.id || "");
    if (!itemId) {
      return res.status(400).json({ success: false, error: "Cue item id is required." });
    }

    const deleted = await deleteCueBankItem(userId, itemId);
    return res.json({ success: true, remoteEnabled: isCueBankRemoteEnabled(), deleted });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ success: false, error: message });
  }
});

app.get("/api/source-management", async (_req, res) => {
  try {
    const sources = await listManagedSources();
    return res.json({ success: true, categories: sourceCategories, sources });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ success: false, error: message });
  }
});

app.patch("/api/source-management", async (req, res) => {
  try {
    const { sourceId, enabled } = req.body || {};
    if (!sourceId || typeof enabled !== "boolean") {
      return res.status(400).json({ success: false, error: "sourceId and enabled are required." });
    }

    const source = await updateManagedSourceEnabled(sourceId, enabled);
    if (!source) {
      return res.status(404).json({ success: false, error: "Managed source not found." });
    }
    return res.json({ success: true, source });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ success: false, error: message });
  }
});

app.get("/api/supabase-health", async (_req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.json({
        success: true,
        configured: false,
        message: "Supabase env vars are not configured.",
      });
    }

    const sources = await requestSupabaseTable<{ id: string }[]>("source_allowlist", {
      query: "select=id&limit=1",
    });
    const cueItems = await requestSupabaseTable<{ id: string }[]>("cue_bank_items", {
      query: "select=id&limit=1",
    });
    const dailySnapshots = await requestSupabaseTable<{ date: string }[]>("daily_cue_snapshots", {
      query: "select=date&limit=1",
    });

    return res.json({
      success: true,
      configured: true,
      tables: {
        source_allowlist: "ok",
        cue_bank_items: "ok",
        daily_cue_snapshots: "ok",
      },
      sampleCounts: {
        source_allowlist: sources.length,
        cue_bank_items: cueItems.length,
        daily_cue_snapshots: dailySnapshots.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ success: false, configured: true, error: message });
  }
});

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

    console.log(`[Gemini API] Requesting real AI generation for scenario: "${scenario}"`);
    const { item, modelUsed } = await generatePMCueWithGemini(chineseThought, scenario);

    return res.json({ success: true, item, modelUsed });

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
