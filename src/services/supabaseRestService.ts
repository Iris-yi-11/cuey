/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

interface SupabaseRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: string;
  body?: unknown;
  prefer?: string;
}

const getSupabaseConfig = (): SupabaseConfig | null => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  const normalizedUrl = url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  return { url: normalizedUrl, serviceRoleKey };
};

export const isSupabaseConfigured = (): boolean => Boolean(getSupabaseConfig());

export const buildSupabaseRestUrl = (tableName: string, query = ""): string => {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase is not configured.");
  }

  const path = `${config.url}/rest/v1/${encodeURIComponent(tableName)}`;
  return query ? `${path}?${query}` : path;
};

export const requestSupabaseTable = async <T>(
  tableName: string,
  options: SupabaseRequestOptions = {}
): Promise<T> => {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(buildSupabaseRestUrl(tableName, options.query), {
    method: options.method || "GET",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Supabase ${tableName} request failed with ${response.status}: ${details}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
};

export const getSupabaseUserIdFromAuthHeader = async (
  authHeader: string | undefined
): Promise<string | null> => {
  const config = getSupabaseConfig();
  if (!config || !authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return null;

  const data = await response.json().catch(() => null);
  return typeof data?.id === "string" ? data.id : null;
};
