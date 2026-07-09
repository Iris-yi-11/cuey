import { afterEach, describe, expect, it } from "vitest";
import {
  listManagedSources,
  updateManagedSourceEnabled,
} from "./sourceManagementRepository";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("sourceManagementRepository", () => {
  it("falls back to local source allowlist when Supabase is not configured", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const sources = await listManagedSources();

    expect(sources.length).toBeGreaterThan(10);
    expect(sources.some((source) => source.id === "openai_news")).toBe(true);
  });

  it("returns a local preview source update when Supabase is not configured", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const source = await updateManagedSourceEnabled("openai_news", false);

    expect(source?.id).toBe("openai_news");
    expect(source?.enabled).toBe(false);
  });
});
