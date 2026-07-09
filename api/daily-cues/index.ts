/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDailyCues } from "../../src/services/dailyCueService";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  const result = await getDailyCues();

  return res.json({
    success: true,
    ...result,
    lastUpdatedAt: result.brief.lastUpdatedAt,
    nextRefreshAt: result.brief.nextRefreshAt,
  });
}
