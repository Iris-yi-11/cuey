/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle, Database, ExternalLink, RefreshCw, Settings2 } from "lucide-react";
import type { SourceAllowlistItem, SourceCategoryId } from "../types";

interface SourceManagementPanelProps {
  sources: SourceAllowlistItem[];
  categoryLabels: Record<SourceCategoryId, string>;
  isLoading: boolean;
  isSaving: boolean;
  isDailyRefreshing: boolean;
  error: string | null;
  lastSyncedAt: string | null;
  onToggleSource: (sourceId: string, enabled: boolean) => void;
  onRefreshSources: () => void;
  onRefreshDailyCues: () => void;
}

export default function SourceManagementPanel({
  sources,
  categoryLabels,
  isLoading,
  isSaving,
  isDailyRefreshing,
  error,
  lastSyncedAt,
  onToggleSource,
  onRefreshSources,
  onRefreshDailyCues,
}: SourceManagementPanelProps) {
  const enabledCount = sources.filter((source) => source.enabled).length;
  const isBusy = isLoading || isSaving;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h3 className="text-sm font-display font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-700" />
            Source Management Lite
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Curated allowlist for Daily Cue. Supabase configured后，开关会影响后端 refresh。
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <button
            type="button"
            onClick={onRefreshSources}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] font-mono font-bold text-slate-600 transition-all hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button
            type="button"
            onClick={onRefreshDailyCues}
            disabled={isBusy || isDailyRefreshing || enabledCount === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-900 bg-slate-950 px-3 py-2 text-[11px] font-mono font-bold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDailyRefreshing ? "animate-spin" : ""}`} />
            <span>{isDailyRefreshing ? "Refreshing" : "Refresh feed"}</span>
          </button>
          <div className="text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-600">
            <Database className="inline w-3.5 h-3.5 mr-1 text-emerald-600" />
            {enabledCount}/{sources.length} enabled
          </div>
        </div>
      </div>

      {lastSyncedAt && (
        <p className="text-[10px] font-mono text-slate-400">
          Last synced {new Date(lastSyncedAt).toLocaleString()}
        </p>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
          <p className="text-xs font-bold text-slate-700">No managed sources found.</p>
          <p className="mt-1 text-[11px] font-mono text-slate-500">
            Add sources in Supabase, then click Sync to update this panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900">{source.name}</p>
                  <a
                    href={source.homepageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-800"
                    title="Open source homepage"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  {categoryLabels[source.categoryId]} · {source.refreshMethod || "homepage"} · {source.costTier || "manual"}
                </p>
              </div>

              <button
                type="button"
                disabled={isBusy}
                onClick={() => onToggleSource(source.id, !source.enabled)}
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-mono font-extrabold transition-all disabled:opacity-50 ${
                  source.enabled
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-white border-slate-200 text-slate-500"
                }`}
              >
                {source.enabled ? "ON" : "OFF"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
