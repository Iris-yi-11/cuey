/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CueItem } from "../../src/types";
import {
  deleteCueBankItem,
  isCueBankRemoteEnabled,
  listCueBankItems,
  upsertCueBankItem,
} from "../../src/services/cueBankRepository";
import { getSupabaseUserIdFromAuthHeader } from "../../src/services/supabaseRestService";

export default async function handler(req: any, res: any) {
  try {
    const authHeader = Array.isArray(req.headers.authorization)
      ? req.headers.authorization[0]
      : req.headers.authorization;
    const userId = await getSupabaseUserIdFromAuthHeader(authHeader);

    if (req.method === "GET") {
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
    }

    if (req.method === "POST") {
      if (!userId) {
        return res.status(401).json({ success: false, error: "Sign in is required for Cue Bank sync." });
      }

      const item = req.body?.item as CueItem | undefined;
      if (!item?.id) {
        return res.status(400).json({ success: false, error: "Cue item is required." });
      }

      const saved = await upsertCueBankItem(userId, item);
      return res.json({
        success: true,
        remoteEnabled: isCueBankRemoteEnabled(),
        item: saved || item,
      });
    }

    if (req.method === "DELETE") {
      if (!userId) {
        return res.status(401).json({ success: false, error: "Sign in is required for Cue Bank sync." });
      }

      const itemId = String(req.query?.id || req.body?.id || "");
      if (!itemId) {
        return res.status(400).json({ success: false, error: "Cue item id is required." });
      }

      const deleted = await deleteCueBankItem(userId, itemId);
      return res.json({ success: true, remoteEnabled: isCueBankRemoteEnabled(), deleted });
    }

    return res.status(405).json({ success: false, error: "Method not allowed." });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ success: false, error: message });
  }
}
