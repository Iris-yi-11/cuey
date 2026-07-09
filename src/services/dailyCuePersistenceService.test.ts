import { afterEach, describe, expect, it, vi } from "vitest";

const payload = {
  brief: {
    id: "daily_brief_2026-07-07",
    date: "2026-07-07",
    summary: "今日摘要",
    itemIds: ["daily_1"],
    lastUpdatedAt: "2026-07-07T00:00:00.000Z",
    nextRefreshAt: "2026-07-07T16:00:00.000Z",
  },
  items: [],
  generatedFrom: "live_sources" as const,
  sourceHealth: [],
};

describe("dailyCuePersistenceService", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.doUnmock("./supabaseRestService");
  });

  it("reads persisted Daily Cue snapshots from Supabase", async () => {
    vi.doMock("./supabaseRestService", () => ({
      isSupabaseConfigured: () => true,
      requestSupabaseTable: vi.fn().mockResolvedValue([{ date: "2026-07-07", payload }]),
    }));

    const { readPersistedDailyCues } = await import("./dailyCuePersistenceService");

    await expect(readPersistedDailyCues("2026-07-07")).resolves.toEqual(payload);
  });

  it("writes Daily Cue snapshots to Supabase when KV is not configured", async () => {
    const requestSupabaseTable = vi.fn().mockResolvedValue([{ date: "2026-07-07", payload }]);
    vi.doMock("./supabaseRestService", () => ({
      isSupabaseConfigured: () => true,
      requestSupabaseTable,
    }));

    const { writePersistedDailyCues } = await import("./dailyCuePersistenceService");

    await expect(writePersistedDailyCues(payload)).resolves.toBe(true);
    expect(requestSupabaseTable).toHaveBeenCalledWith(
      "daily_cue_snapshots",
      expect.objectContaining({
        method: "POST",
        query: "on_conflict=date",
        body: expect.objectContaining({
          date: "2026-07-07",
          generated_from: "live_sources",
          item_count: 0,
        }),
      })
    );
  });
});
