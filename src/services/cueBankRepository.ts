/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CueItem } from "../types";
import { isSupabaseConfigured, requestSupabaseTable } from "./supabaseRestService";

const CUE_BANK_TABLE = "cue_bank_items";

interface CueBankRow {
  id: string;
  client_id: string;
  user_id?: string | null;
  cue_item: CueItem;
  is_saved: boolean;
  is_done: boolean;
  updated_at?: string;
}

const encodeEq = (value: string): string => `eq.${encodeURIComponent(value)}`;

export const isCueBankRemoteEnabled = (): boolean => isSupabaseConfigured();

export const listCueBankItems = async (userId: string): Promise<CueItem[] | null> => {
  if (!isSupabaseConfigured()) return null;

  const rows = await requestSupabaseTable<CueBankRow[]>(CUE_BANK_TABLE, {
    query: `select=*&user_id=${encodeEq(userId)}&order=updated_at.desc`,
  });

  return rows.map((row) => ({
    ...row.cue_item,
    isSaved: row.is_saved,
    isDone: row.is_done,
  }));
};

export const upsertCueBankItem = async (
  userId: string,
  item: CueItem
): Promise<CueItem | null> => {
  if (!isSupabaseConfigured()) return null;

  const rows = await requestSupabaseTable<CueBankRow[]>(CUE_BANK_TABLE, {
    method: "POST",
    query: "on_conflict=id,user_id",
    prefer: "resolution=merge-duplicates,return=representation",
    body: {
      id: item.id,
      client_id: userId,
      user_id: userId,
      cue_item: item,
      is_saved: item.isSaved,
      is_done: item.isDone,
    },
  });

  const row = rows[0];
  if (!row) return item;
  return {
    ...row.cue_item,
    isSaved: row.is_saved,
    isDone: row.is_done,
  };
};

export const deleteCueBankItem = async (userId: string, itemId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  await requestSupabaseTable<null>(CUE_BANK_TABLE, {
    method: "DELETE",
    query: `id=${encodeEq(itemId)}&user_id=${encodeEq(userId)}`,
    prefer: "return=minimal",
  });

  return true;
};
