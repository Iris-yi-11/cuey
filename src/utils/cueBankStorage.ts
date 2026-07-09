/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CueItem } from "../types";

const CUE_BANK_STORAGE_KEY = "pmcue_items";

export const loadCueBankFromStorage = (
  seedItems: CueItem[],
  storage: Storage = localStorage
): CueItem[] => {
  const stored = storage.getItem(CUE_BANK_STORAGE_KEY);
  if (!stored) {
    storage.setItem(CUE_BANK_STORAGE_KEY, JSON.stringify(seedItems));
    return seedItems;
  }

  try {
    const parsed = JSON.parse(stored) as CueItem[];
    const merged = [...parsed];
    seedItems.forEach((seed) => {
      if (!merged.some((item) => item.id === seed.id)) {
        merged.push(seed);
      }
    });
    storage.setItem(CUE_BANK_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    storage.setItem(CUE_BANK_STORAGE_KEY, JSON.stringify(seedItems));
    return seedItems;
  }
};

export const saveCueBankToStorage = (
  items: CueItem[],
  storage: Storage = localStorage
): void => {
  storage.setItem(CUE_BANK_STORAGE_KEY, JSON.stringify(items));
};

export const mergeCueBankItemsById = (
  localItems: CueItem[],
  remoteItems: CueItem[]
): CueItem[] => {
  const byId = new Map(localItems.map((item) => [item.id, item]));
  remoteItems.forEach((item) => byId.set(item.id, item));
  return Array.from(byId.values());
};
