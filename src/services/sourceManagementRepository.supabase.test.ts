import { afterEach, describe, expect, it, vi } from "vitest";

describe("sourceManagementRepository with Supabase configured", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.doUnmock("./supabaseRestService");
  });

  it("returns the Supabase source list even when it is empty", async () => {
    vi.doMock("./supabaseRestService", () => ({
      isSupabaseConfigured: () => true,
      requestSupabaseTable: vi.fn().mockResolvedValue([]),
    }));

    const { listManagedSources } = await import("./sourceManagementRepository");

    await expect(listManagedSources()).resolves.toEqual([]);
  });
});
