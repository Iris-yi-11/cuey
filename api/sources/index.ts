/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sourceCategories } from "../../src/data/sourceAllowlist";
import { listManagedSources } from "../../src/services/sourceManagementRepository";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  const sources = await listManagedSources();

  return res.json({
    success: true,
    categories: sourceCategories,
    sources,
  });
}
