/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

const getAuthConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
};

export const isSupabaseAuthConfigured = (): boolean => Boolean(getAuthConfig());

export const getAuthRedirectUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_PUBLIC_SITE_URL;
  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    const url = isLocalhost && configuredUrl ? configuredUrl : origin;
    return url.endsWith("/") ? url : `${url}/`;
  }

  const url = configuredUrl || "http://localhost:3000";
  return url.endsWith("/") ? url : `${url}/`;
};

export interface SupabaseAuthProviderStatus {
  google: boolean;
  email: boolean;
}

export const fetchSupabaseAuthProviderStatus = async (): Promise<SupabaseAuthProviderStatus | null> => {
  const config = getAuthConfig();
  if (!config) return null;

  const response = await fetch(`${config.url.replace(/\/$/, "")}/auth/v1/settings`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
    },
  });

  if (!response.ok) return null;

  const settings = (await response.json()) as {
    external?: Record<string, boolean>;
  };

  return {
    google: Boolean(settings.external?.google),
    email: Boolean(settings.external?.email),
  };
};

export const readSupabaseAuthErrorFromUrl = (): string | null => {
  if (typeof window === "undefined") return null;

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);
  const description =
    hashParams.get("error_description") ||
    searchParams.get("error_description") ||
    hashParams.get("error") ||
    searchParams.get("error");

  return description ? decodeURIComponent(description.replace(/\+/g, " ")) : null;
};

export const getSupabaseBrowserClient = (): SupabaseClient | null => {
  const config = getAuthConfig();
  if (!config) return null;

  if (!cachedClient) {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return cachedClient;
};
