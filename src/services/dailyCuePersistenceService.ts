/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DailyCuesResponse } from "../types.js";
import { isSupabaseConfigured, requestSupabaseTable } from "./supabaseRestService.js";

const DAILY_CUE_KV_KEY_PREFIX = "pm-cue:daily-cues";
const DAILY_CUE_SNAPSHOT_TABLE = "daily_cue_snapshots";
const KV_CACHE_TTL_SECONDS = 60 * 60 * 24 * 2;

interface DailyCuePersistedPayload {
  brief: NonNullable<DailyCuesResponse["brief"]>;
  items: NonNullable<DailyCuesResponse["items"]>;
  generatedFrom: NonNullable<DailyCuesResponse["generatedFrom"]>;
  sourceHealth: NonNullable<DailyCuesResponse["sourceHealth"]>;
  persistedAt: string;
}

interface DailyCueSnapshotRow {
  date: string;
  payload: DailyCuePersistedPayload;
}

const getKvConfig = () => {
  const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!restUrl || !token) return null;
  return { restUrl: restUrl.replace(/\/$/, ""), token };
};

export const isDailyCuePersistenceEnabled = (): boolean =>
  Boolean(getKvConfig()) || isSupabaseConfigured();

export const getDailyCuePersistenceKey = (date: string): string =>
  `${DAILY_CUE_KV_KEY_PREFIX}:${date}`;

export const readPersistedDailyCues = async (
  date: string
): Promise<DailyCuePersistedPayload | null> => {
  const kvPayload = await readPersistedDailyCuesFromKv(date);
  if (kvPayload) return kvPayload;

  return readPersistedDailyCuesFromSupabase(date);
};

const readPersistedDailyCuesFromKv = async (
  date: string
): Promise<DailyCuePersistedPayload | null> => {
  const config = getKvConfig();
  if (!config) return null;

  try {
    const response = await fetch(
      `${config.restUrl}/get/${encodeURIComponent(getDailyCuePersistenceKey(date))}`,
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`KV read failed with ${response.status}`);
    }

    const data = await response.json();
    if (!data.result) return null;

    return typeof data.result === "string" ? JSON.parse(data.result) : data.result;
  } catch (error) {
    console.warn("Daily Cue KV read failed; falling back to live refresh:", error);
    return null;
  }
};

const readPersistedDailyCuesFromSupabase = async (
  date: string
): Promise<DailyCuePersistedPayload | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const rows = await requestSupabaseTable<DailyCueSnapshotRow[]>(DAILY_CUE_SNAPSHOT_TABLE, {
      query: `select=date,payload&date=eq.${encodeURIComponent(date)}&limit=1`,
    });

    return rows[0]?.payload || null;
  } catch (error) {
    console.warn("Daily Cue Supabase snapshot read failed; falling back to live refresh:", error);
    return null;
  }
};

export const writePersistedDailyCues = async (
  payload: Omit<DailyCuePersistedPayload, "persistedAt">
): Promise<boolean> => {
  const persistedPayload: DailyCuePersistedPayload = {
    ...payload,
    persistedAt: new Date().toISOString(),
  };
  const kvSaved = await writePersistedDailyCuesToKv(persistedPayload);
  const supabaseSaved = await writePersistedDailyCuesToSupabase(persistedPayload);
  return kvSaved || supabaseSaved;
};

const writePersistedDailyCuesToKv = async (
  persistedPayload: DailyCuePersistedPayload
): Promise<boolean> => {
  const config = getKvConfig();
  if (!config) return false;

  try {
    const body = JSON.stringify([
      [
        "SET",
        getDailyCuePersistenceKey(persistedPayload.brief.date),
        JSON.stringify(persistedPayload),
        "EX",
        KV_CACHE_TTL_SECONDS,
      ],
    ]);

    const response = await fetch(`${config.restUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`KV write failed with ${response.status}`);
    }

    return true;
  } catch (error) {
    console.warn("Daily Cue KV write failed; continuing with in-memory cache:", error);
    return false;
  }
};

const writePersistedDailyCuesToSupabase = async (
  persistedPayload: DailyCuePersistedPayload
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    await requestSupabaseTable<DailyCueSnapshotRow[]>(DAILY_CUE_SNAPSHOT_TABLE, {
      method: "POST",
      query: "on_conflict=date",
      prefer: "resolution=merge-duplicates,return=representation",
      body: {
        date: persistedPayload.brief.date,
        payload: persistedPayload,
        generated_from: persistedPayload.generatedFrom,
        item_count: persistedPayload.items.length,
      },
    });

    return true;
  } catch (error) {
    console.warn("Daily Cue Supabase snapshot write failed; continuing with live data:", error);
    return false;
  }
};
