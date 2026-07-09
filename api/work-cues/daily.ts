/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { buildDailyWorkCue } from "../../src/services/dailyWorkCueService";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  return res.json({ success: true, item: buildDailyWorkCue() });
}
