import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...import.meta.env };

beforeEach(() => {
  vi.resetModules();
  delete (import.meta.env as Record<string, string | undefined>).VITE_SUPABASE_URL;
  delete (import.meta.env as Record<string, string | undefined>).VITE_SUPABASE_ANON_KEY;
  delete (import.meta.env as Record<string, string | undefined>).VITE_PUBLIC_SITE_URL;
});

afterEach(() => {
  Object.assign(import.meta.env, originalEnv);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("supabaseAuthClient", () => {
  it("reports disabled when frontend Supabase Auth env vars are missing", async () => {
    const { isSupabaseAuthConfigured } = await import("./supabaseAuthClient");

    expect(isSupabaseAuthConfigured()).toBe(false);
  });

  it("reports enabled when frontend Supabase Auth env vars are present", async () => {
    (import.meta.env as Record<string, string>).VITE_SUPABASE_URL = "https://example.supabase.co";
    (import.meta.env as Record<string, string>).VITE_SUPABASE_ANON_KEY = "anon-key";
    const { isSupabaseAuthConfigured } = await import("./supabaseAuthClient");

    expect(isSupabaseAuthConfigured()).toBe(true);
  });

  it("uses configured public site URL for localhost auth redirects", async () => {
    (import.meta.env as Record<string, string>).VITE_PUBLIC_SITE_URL = "https://cuey.example.com";
    vi.stubGlobal("window", {
      location: {
        origin: "http://localhost:3009",
        hostname: "localhost",
      },
    });
    const { getAuthRedirectUrl } = await import("./supabaseAuthClient");

    expect(getAuthRedirectUrl()).toBe("https://cuey.example.com/");
  });

  it("uses current origin for deployed auth redirects", async () => {
    (import.meta.env as Record<string, string>).VITE_PUBLIC_SITE_URL = "https://cuey.example.com";
    vi.stubGlobal("window", {
      location: {
        origin: "https://cuey-preview.vercel.app",
        hostname: "cuey-preview.vercel.app",
      },
    });
    const { getAuthRedirectUrl } = await import("./supabaseAuthClient");

    expect(getAuthRedirectUrl()).toBe("https://cuey-preview.vercel.app/");
  });

  it("reads enabled auth providers from Supabase settings", async () => {
    (import.meta.env as Record<string, string>).VITE_SUPABASE_URL = "https://example.supabase.co";
    (import.meta.env as Record<string, string>).VITE_SUPABASE_ANON_KEY = "anon-key";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ external: { google: false, email: true } }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    const { fetchSupabaseAuthProviderStatus } = await import("./supabaseAuthClient");

    await expect(fetchSupabaseAuthProviderStatus()).resolves.toEqual({
      google: false,
      email: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/settings",
      expect.objectContaining({
        headers: expect.objectContaining({
          apikey: "anon-key",
          Authorization: "Bearer anon-key",
        }),
      })
    );
  });

  it("exchanges auth code redirects for a browser session and clears the url", async () => {
    const replaceState = vi.fn();
    vi.stubGlobal("window", {
      location: {
        pathname: "/",
        search: "?code=auth-code",
        hash: "",
      },
      history: {
        replaceState,
      },
    });
    const client = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
        getSession: vi.fn(),
      },
    };
    const { completeSupabaseRedirectSignIn } = await import("./supabaseAuthClient");

    await expect(completeSupabaseRedirectSignIn(client as any)).resolves.toEqual({
      success: true,
      handled: true,
    });
    expect(client.auth.exchangeCodeForSession).toHaveBeenCalledWith("auth-code");
    expect(replaceState).toHaveBeenCalledWith(null, "", "/");
  });

  it("returns Supabase auth redirect errors and clears the url", async () => {
    const replaceState = vi.fn();
    vi.stubGlobal("window", {
      location: {
        pathname: "/",
        search: "?error_description=Email+link+expired",
        hash: "",
      },
      history: {
        replaceState,
      },
    });
    const client = {
      auth: {
        exchangeCodeForSession: vi.fn(),
        getSession: vi.fn(),
      },
    };
    const { completeSupabaseRedirectSignIn } = await import("./supabaseAuthClient");

    await expect(completeSupabaseRedirectSignIn(client as any)).resolves.toEqual({
      success: false,
      handled: true,
      error: "Email link expired",
    });
    expect(client.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(replaceState).toHaveBeenCalledWith(null, "", "/");
  });
});
