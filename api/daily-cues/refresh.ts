/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { refreshDailyCues } from "../../src/services/dailyCueService";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  const result = await refreshDailyCues();

  return res.json({
    success: true,
    ...result,
    lastUpdatedAt: result.brief.lastUpdatedAt,
    nextRefreshAt: result.brief.nextRefreshAt,
  });
}
