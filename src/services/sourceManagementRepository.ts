/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sourceAllowlist } from "../data/sourceAllowlist.js";
import type { SourceAllowlistItem } from "../types.js";
import { isSupabaseConfigured, requestSupabaseTable } from "./supabaseRestService.js";

const SOURCE_ALLOWLIST_TABLE = "source_allowlist";

interface SourceAllowlistRow {
  id: string;
  name: string;
  category_id: SourceAllowlistItem["categoryId"];
  homepage_url: string;
  feed_url?: string | null;
  enabled: boolean;
  authority_weight: number;
  max_items_per_day: number;
  cost_tier?: SourceAllowlistItem["costTier"] | null;
  refresh_method?: SourceAllowlistItem["refreshMethod"] | null;
}

const rowToSource = (row: SourceAllowlistRow): SourceAllowlistItem => ({
  id: row.id,
  name: row.name,
  categoryId: row.category_id,
  homepageUrl: row.homepage_url,
  feedUrl: row.feed_url || undefined,
  enabled: row.enabled,
  authorityWeight: row.authority_weight,
  maxItemsPerDay: row.max_items_per_day,
  costTier: row.cost_tier || undefined,
  refreshMethod: row.refresh_method || undefined,
});

export const listManagedSources = async (): Promise<SourceAllowlistItem[]> => {
  if (!isSupabaseConfigured()) return sourceAllowlist;

  const rows = await requestSupabaseTable<SourceAllowlistRow[]>(SOURCE_ALLOWLIST_TABLE, {
    query: "select=*&order=category_id.asc,authority_weight.desc",
  });

  return rows.map(rowToSource);
};

export const updateManagedSourceEnabled = async (
  sourceId: string,
  enabled: boolean
): Promise<SourceAllowlistItem | null> => {
  if (!isSupabaseConfigured()) {
    const source = sourceAllowlist.find((item) => item.id === sourceId);
    return source ? { ...source, enabled } : null;
  }

  const rows = await requestSupabaseTable<SourceAllowlistRow[]>(SOURCE_ALLOWLIST_TABLE, {
    method: "PATCH",
    query: `id=eq.${encodeURIComponent(sourceId)}`,
    body: { enabled },
  });

  return rows[0] ? rowToSource(rows[0]) : null;
};
