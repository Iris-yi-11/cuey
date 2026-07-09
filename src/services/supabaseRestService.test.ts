import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildSupabaseRestUrl,
  getSupabaseUserIdFromAuthHeader,
  isSupabaseConfigured,
  requestSupabaseTable,
} from "./supabaseRestService";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("supabaseRestService", () => {
  it("reports disabled when server-side Supabase secrets are missing", () => {
    delete process.env.SUPABASE_URL;
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(isSupabaseConfigured()).toBe(false);
    expect(() => buildSupabaseRestUrl("cue_bank_items")).toThrow("Supabase is not configured.");
  });

  it("builds PostgREST URLs without exposing service role keys in the URL", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co/";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-service-role-key";

    const url = buildSupabaseRestUrl("cue_bank_items", "select=*&limit=1");

    expect(url).toBe("https://example.supabase.co/rest/v1/cue_bank_items?select=*&limit=1");
    expect(url).not.toContain("secret-service-role-key");
  });

  it("accepts a Supabase URL that already includes /rest/v1", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co/rest/v1/";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-service-role-key";

    const url = buildSupabaseRestUrl("source_allowlist", "select=id");

    expect(url).toBe("https://example.supabase.co/rest/v1/source_allowlist?select=id");
  });

  it("sends service role credentials only in headers", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-service-role-key";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([{ id: "cue_1" }]), { status: 200 })
    );

    const result = await requestSupabaseTable<{ id: string }[]>("cue_bank_items");

    expect(result).toEqual([{ id: "cue_1" }]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/rest/v1/cue_bank_items",
      expect.objectContaining({
        headers: expect.objectContaining({
          apikey: "secret-service-role-key",
          Authorization: "Bearer secret-service-role-key",
        }),
      })
    );
  });

  it("returns null when an auth header is missing or malformed", async () => {
    await expect(getSupabaseUserIdFromAuthHeader(undefined)).resolves.toBeNull();
    await expect(getSupabaseUserIdFromAuthHeader("Basic abc")).resolves.toBeNull();
  });

  it("validates a Supabase user JWT without exposing service role keys in the URL", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-service-role-key";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "user-123" }), { status: 200 })
    );

    await expect(getSupabaseUserIdFromAuthHeader("Bearer user-token")).resolves.toBe("user-123");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/user",
      expect.objectContaining({
        headers: expect.objectContaining({
          apikey: "secret-service-role-key",
          Authorization: "Bearer user-token",
        }),
      })
    );
  });
});
