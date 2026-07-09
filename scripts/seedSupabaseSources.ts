/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sourceAllowlist } from "../src/data/sourceAllowlist";
import { isSupabaseConfigured, requestSupabaseTable } from "../src/services/supabaseRestService";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SOURCE_ALLOWLIST_TABLE = "source_allowlist";

const rows = sourceAllowlist.map((source) => ({
  id: source.id,
  name: source.name,
  category_id: source.categoryId,
  homepage_url: source.homepageUrl,
  feed_url: source.feedUrl || null,
  enabled: source.enabled,
  authority_weight: source.authorityWeight,
  max_items_per_day: source.maxItemsPerDay,
  cost_tier: source.costTier || null,
  refresh_method: source.refreshMethod || null,
}));

if (!isSupabaseConfigured()) {
  console.error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const result = await requestSupabaseTable<typeof rows>(SOURCE_ALLOWLIST_TABLE, {
  method: "POST",
  query: "on_conflict=id",
  prefer: "resolution=merge-duplicates,return=representation",
  body: rows,
});

console.log(`Seeded ${result.length} source_allowlist rows.`);
