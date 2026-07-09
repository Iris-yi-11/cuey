/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SourceAllowlistItem, SourceCandidate, SourceFetchHealth } from "../types";

const FETCH_TIMEOUT_MS = 7000;
const MAX_ITEMS_PER_SOURCE = 5;
const MAX_PUBLIC_SNIPPET_CHARS = 220;

const decodeXmlEntities = (value: string): string =>
  value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .trim();

const stripHtml = (value: string): string =>
  decodeXmlEntities(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " "));

const clampPublicSnippet = (value: string): string => {
  const normalized = stripHtml(value);
  if (normalized.length <= MAX_PUBLIC_SNIPPET_CHARS) return normalized;
  return `${normalized.slice(0, MAX_PUBLIC_SNIPPET_CHARS).trim()}...`;
};

const getTagValue = (block: string, tag: string): string => {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripHtml(match[1]) : "";
};

const getAtomLink = (block: string): string => {
  const hrefMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (hrefMatch?.[1]) return decodeXmlEntities(hrefMatch[1]);
  return getTagValue(block, "link");
};

const normalizeDate = (raw: string): string => {
  const date = raw ? new Date(raw) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
};

const parseRssItems = (xml: string, source: SourceAllowlistItem): SourceCandidate[] => {
  const itemBlocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  return itemBlocks.slice(0, MAX_ITEMS_PER_SOURCE).flatMap((block, index) => {
    const headline = getTagValue(block, "title");
    const sourceUrl = getTagValue(block, "link");
    if (!headline || !sourceUrl) return [];

    const snippet = clampPublicSnippet(getTagValue(block, "description") || getTagValue(block, "content:encoded"));
    const publishedAt = normalizeDate(getTagValue(block, "pubDate") || getTagValue(block, "dc:date"));

    return [{
      id: `candidate_${source.id}_${index}_${publishedAt}`,
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl,
      categoryId: source.categoryId,
      headline,
      snippet,
      publishedAt,
      rankingScore: source.authorityWeight * 100,
      maxItemsPerDay: source.maxItemsPerDay,
    }];
  });
};

const parseAtomEntries = (xml: string, source: SourceAllowlistItem): SourceCandidate[] => {
  const entryBlocks = [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
  return entryBlocks.slice(0, MAX_ITEMS_PER_SOURCE).flatMap((block, index) => {
    const headline = getTagValue(block, "title");
    const sourceUrl = getAtomLink(block);
    if (!headline || !sourceUrl) return [];

    const snippet = clampPublicSnippet(getTagValue(block, "summary") || getTagValue(block, "content"));
    const publishedAt = normalizeDate(getTagValue(block, "updated") || getTagValue(block, "published"));

    return [{
      id: `candidate_${source.id}_${index}_${publishedAt}`,
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl,
      categoryId: source.categoryId,
      headline,
      snippet,
      publishedAt,
      rankingScore: source.authorityWeight * 100,
      maxItemsPerDay: source.maxItemsPerDay,
    }];
  });
};

const fetchFeedText = async (feedUrl: string): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(feedUrl, {
      headers: {
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
        "User-Agent": "pm-cue-daily-refresh/0.2",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Feed request failed with ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeoutId);
  }
};

export const fetchSourceCandidates = async (
  sources: SourceAllowlistItem[]
): Promise<{ candidates: SourceCandidate[]; health: SourceFetchHealth[] }> => {
  const enabledSources = sources.filter((source) => source.enabled);
  const results = await Promise.all(
    enabledSources.map(async (source) => {
      const checkedAt = new Date().toISOString();
      if (!source.feedUrl) {
        return {
          candidates: [],
          health: {
            sourceId: source.id,
            sourceName: source.name,
            status: "skipped" as const,
            itemCount: 0,
            checkedAt,
            message: "No stable RSS/Atom feed configured; kept in allowlist for later low-cost expansion.",
          },
        };
      }

      try {
        const xml = await fetchFeedText(source.feedUrl);
        const candidates = xml.includes("<entry")
          ? parseAtomEntries(xml, source)
          : parseRssItems(xml, source);

        return {
          candidates,
          health: {
            sourceId: source.id,
            sourceName: source.name,
            status: candidates.length > 0 ? ("ok" as const) : ("error" as const),
            itemCount: candidates.length,
            checkedAt,
            message: candidates.length > 0 ? undefined : "Feed returned no parseable items.",
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Failed to fetch source feed for ${source.name}: ${message}`);
        return {
          candidates: [],
          health: {
            sourceId: source.id,
            sourceName: source.name,
            status: "error" as const,
            itemCount: 0,
            checkedAt,
            message,
          },
        };
      }
    })
  );

  return {
    candidates: results.flatMap((result) => result.candidates),
    health: results.map((result) => result.health),
  };
};
