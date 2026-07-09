import { describe, expect, it } from "vitest";
import { loadCueBankFromStorage, mergeCueBankItemsById } from "./cueBankStorage";
import type { CueItem } from "../types";

const makeItem = (id: string, isDone = false): CueItem => ({
  id,
  sourceType: "work",
  cueType: "ai_product",
  title: id,
  chineseExplanation: id,
  englishOutput: id,
  phrases: ["scope"],
  scenario: "Meeting",
  speakingPrompt: id,
  sampleAnswer: id,
  isSaved: true,
  isDone,
  createdAt: "2026-07-05T00:00:00.000Z",
});

const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) || null,
    key: (index: number) => Array.from(store.keys())[index] || null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
};

describe("cueBankStorage", () => {
  it("loads seed items when storage is empty", () => {
    const storage = createMemoryStorage();
    const seed = [makeItem("seed")];

    expect(loadCueBankFromStorage(seed, storage)).toEqual(seed);
    expect(storage.getItem("pmcue_items")).toContain("seed");
  });

  it("merges new seed items into existing local storage", () => {
    const storage = createMemoryStorage();
    storage.setItem("pmcue_items", JSON.stringify([makeItem("existing")]));

    const result = loadCueBankFromStorage([makeItem("seed")], storage);

    expect(result.map((item) => item.id)).toEqual(["existing", "seed"]);
  });

  it("lets remote items win when merging by id", () => {
    const result = mergeCueBankItemsById(
      [makeItem("cue", false)],
      [makeItem("cue", true)]
    );

    expect(result).toHaveLength(1);
    expect(result[0].isDone).toBe(true);
  });

});
