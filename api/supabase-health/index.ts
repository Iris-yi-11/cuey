/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { isSupabaseConfigured, requestSupabaseTable } from "../../src/services/supabaseRestService";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  if (!isSupabaseConfigured()) {
    return res.json({
      success: true,
      configured: false,
      message: "Supabase env vars are not configured.",
    });
  }

  try {
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
}
