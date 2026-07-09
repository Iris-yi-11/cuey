/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sourceCategories } from "../../src/data/sourceAllowlist.js";
import {
  listManagedSources,
  updateManagedSourceEnabled,
} from "../../src/services/sourceManagementRepository.js";

export default async function handler(req: any, res: any) {
  try {
    if (req.method === "GET") {
      const sources = await listManagedSources();
      return res.json({ success: true, categories: sourceCategories, sources });
    }

    if (req.method === "PATCH") {
      const { sourceId, enabled } = req.body || {};
      if (!sourceId || typeof enabled !== "boolean") {
        return res.status(400).json({ success: false, error: "sourceId and enabled are required." });
      }

      const source = await updateManagedSourceEnabled(sourceId, enabled);
      if (!source) {
        return res.status(404).json({ success: false, error: "Managed source not found." });
      }
      return res.json({ success: true, source });
    }

    return res.status(405).json({ success: false, error: "Method not allowed." });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ success: false, error: message });
  }
}
