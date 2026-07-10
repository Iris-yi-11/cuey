/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  loadCueBankFromStorage,
  saveCueBankToStorage,
} from "./utils/cueBankStorage";
import {
  buildCueFromDailyItem,
  filterDailyCardsByCategory,
  getDailyCategoryCounts,
} from "./utils/dailyCueViewModel";
import type {
  CueItem,
  DailyBrief,
  DailyCueItem,
  DailyCuesResponse,
  DailyWorkCue,
  GenerateCueScenario,
  SourceAllowlistItem,
  SourceCategoryId,
} from "./types";
import CueDetailModal from "./components/CueDetailModal";
import AuthMenu from "./components/AuthMenu";
import SourceManagementPanel from "./components/SourceManagementPanel";
import WorkCuePanel from "./components/WorkCuePanel";
import { completeSupabaseRedirectSignIn, getSupabaseBrowserClient } from "./services/supabaseAuthClient";
import type { User } from "@supabase/supabase-js";
import {
  deleteCueBankItemFromRemote,
  fetchCueBankItems,
  fetchDailyCues,
  fetchDailyWorkCue,
  fetchManagedSources,
  generatePMCue,
  refreshDailyCuesFromApi,
  saveCueBankItem,
  updateManagedSourceEnabledFromApi,
} from "./services/aiService";
import {
  Sparkles,
  BookOpen,
  FolderHeart,
  Calendar,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Trash2,
  Volume2,
  ListFilter,
  PlayCircle,
  AlertTriangle,
  Zap,
  RefreshCw,
  ExternalLink,
  Settings2,
} from "lucide-react";

// For Toast Alerts
interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

const categoryLabels: Record<SourceCategoryId, string> = {
  ai_models: "AI Models",
  ai_products: "AI Products",
  saas_devtools: "SaaS & DevTools",
  pm_craft: "PM Craft",
  market_signals: "Market Signals",
};

const feedModeLabels: Record<NonNullable<DailyCuesResponse["generatedFrom"]>, string> = {
  live_sources: "Live sources",
  partial_live_sources: "Partial live sources",
  empty_live_sources: "No live items",
};

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<"daily" | "work" | "bank">("daily");

  // Daily Feed Loading state for skeleton display
  const [isDailyLoading, setIsDailyLoading] = useState(true);
  const [isDailyRefreshing, setIsDailyRefreshing] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [dailyBrief, setDailyBrief] = useState<DailyBrief | null>(null);
  const [dailyCueItems, setDailyCueItems] = useState<DailyCueItem[]>([]);
  const [dailyFeedMode, setDailyFeedMode] = useState<DailyCuesResponse["generatedFrom"]>("empty_live_sources");
  const [dailyCategoryFilter, setDailyCategoryFilter] = useState<"all" | SourceCategoryId>("all");
  const [dailyWorkCue, setDailyWorkCue] = useState<DailyWorkCue | null>(null);
  const [dailyWorkCueError, setDailyWorkCueError] = useState<string | null>(null);
  const [isRemoteCueBankEnabled, setIsRemoteCueBankEnabled] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authAccessToken, setAuthAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [managedSources, setManagedSources] = useState<SourceAllowlistItem[]>([]);
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false);
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [isSourceSaving, setIsSourceSaving] = useState(false);
  const [sourceManagementError, setSourceManagementError] = useState<string | null>(null);
  const [sourceLastSyncedAt, setSourceLastSyncedAt] = useState<string | null>(null);

  // Storage array State
  const [cues, setCues] = useState<CueItem[]>([]);
  
  // Detail Modal target
  const [selectedCue, setSelectedCue] = useState<CueItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toast stack state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Trigger short professional loader when activeTab is daily
  useEffect(() => {
    if (activeTab === "daily") {
      setIsDailyLoading(true);
      const timer = setTimeout(() => {
        setIsDailyLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setIsAuthLoading(false);
      return;
    }

    let isMounted = true;
    const initializeSession = async () => {
      const redirectResult = await completeSupabaseRedirectSignIn(client);
      if (isMounted && redirectResult.error) {
        triggerToast(redirectResult.error, "error");
      }

      const { data } = await client.auth.getSession();
      if (!isMounted) return;
      setAuthUser(data.session?.user || null);
      setAuthAccessToken(data.session?.access_token || null);
      setIsAuthLoading(false);
      if (redirectResult.handled && redirectResult.success && data.session?.user) {
        triggerToast("已登录，Cue Bank 将同步到云端。", "success");
      }
    };

    initializeSession().catch((error) => {
      if (!isMounted) return;
      triggerToast(error instanceof Error ? error.message : "登录状态恢复失败。", "error");
      setIsAuthLoading(false);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
      setAuthAccessToken(session?.access_token || null);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDailyData = async () => {
      setIsDailyLoading(true);
      setDailyError(null);

      const response = await fetchDailyCues();
      if (!isMounted) return;

      if (response.success && response.items && response.brief) {
        setDailyCueItems(response.items);
        setDailyBrief(response.brief);
        setDailyFeedMode(response.generatedFrom || "empty_live_sources");
        setDailyError(null);
      } else {
        setDailyError(response.error || "Daily Cue 暂时无法加载，已保留本地默认内容。");
      }

      setIsDailyLoading(false);
    };

    const loadDailyWorkCue = async () => {
      setDailyWorkCueError(null);

      const response = await fetchDailyWorkCue();
      if (!isMounted) return;

      if (response.success && response.item) {
        setDailyWorkCue(response.item);
      } else {
        setDailyWorkCueError(response.error || "今日 Work Cue 暂时无法加载。");
      }
    };

    loadDailyData();
    loadDailyWorkCue();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadManagedSources = useCallback(async (): Promise<boolean> => {
    setIsSourceLoading(true);
    setSourceManagementError(null);
    const response = await fetchManagedSources();

    if (response.success && response.sources) {
      setManagedSources(response.sources);
      setSourceLastSyncedAt(new Date().toISOString());
      setIsSourceLoading(false);
      return true;
    }

    setSourceManagementError(response.error || "Source Management 暂时无法加载。");
    setIsSourceLoading(false);
    return false;
  }, []);

  useEffect(() => {
    void loadManagedSources();
  }, [loadManagedSources]);

  // Work Cue Form states
  const [chineseInput, setChineseInput] = useState("");
  const [scenario, setScenario] = useState<GenerateCueScenario>("Meeting");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [latestGeneratedCue, setLatestGeneratedCue] = useState<CueItem | null>(null);

  // Filter States for Cue Bank
  const [bankSourceFilter, setBankSourceFilter] = useState<"all" | "daily" | "work">("all");
  const [bankStatusFilter, setBankStatusFilter] = useState<"all" | "unfinished" | "completed">("all");

  // Use Supabase as the source of truth when the user is signed in. Local storage is only a mirror.
  useEffect(() => {
    const loadCueBank = async () => {
      const localItems = loadCueBankFromStorage([]);

      if (!authAccessToken) {
        setCues(localItems);
        setIsRemoteCueBankEnabled(false);
        return;
      }

      const response = await fetchCueBankItems(authAccessToken);
      setIsRemoteCueBankEnabled(Boolean(response.remoteEnabled));
      if (response.success && response.remoteEnabled && response.items) {
        setCues(response.items);
        saveCueBankToStorage(response.items);
      } else if (!response.success) {
        setCues(localItems);
        triggerToast(response.error || "云端 Cue Bank 暂时无法加载。", "error");
      }
    };

    loadCueBank();
  }, [authAccessToken]);

  // Save changes to localStorage whenever cues list changes
  const updateCuesInStateAndStore = (updatedList: CueItem[]) => {
    setCues(updatedList);
    saveCueBankToStorage(updatedList);

    // Also sync currently opened modal cue to avoid stale context
    if (selectedCue) {
      const refreshed = updatedList.find((item) => item.id === selectedCue.id);
      if (refreshed) {
        setSelectedCue(refreshed);
      }
    }
  };

  const saveCueBankItemToCloud = async (item: CueItem): Promise<CueItem | null> => {
    if (!authAccessToken) {
      setIsRemoteCueBankEnabled(false);
      triggerToast("请先登录，再收藏到云端 Cue Bank。", "info");
      return null;
    }

    const response = await saveCueBankItem(authAccessToken, item);
    if (response.remoteEnabled) {
      setIsRemoteCueBankEnabled(true);
    }
    if (response.success && response.item) {
      return response.item;
    }

    triggerToast(response.error || "云端 Cue Bank 保存失败，请稍后重试。", "error");
    return null;
  };

  const deleteCueBankItemFromCloud = async (id: string): Promise<boolean> => {
    if (!authAccessToken) {
      setIsRemoteCueBankEnabled(false);
      triggerToast("请先登录，再管理云端 Cue Bank。", "info");
      return false;
    }

    const response = await deleteCueBankItemFromRemote(authAccessToken, id);
    if (response.remoteEnabled) {
      setIsRemoteCueBankEnabled(true);
    }
    if (response.success) {
      return true;
    }

    triggerToast(response.error || "云端 Cue Bank 删除失败，请稍后重试。", "error");
    return false;
  };

  // Toast Generator Helper
  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove toast after 3.2 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // State actions
  const findCueForSave = (id: string): CueItem | null => {
    const existing = cues.find((item) => item.id === id || item.dailyCueId === id);
    if (existing) return existing;

    const dailyItem = dailyCueItems.find((item) => item.id === id);
    if (dailyItem) return buildCueFromDailyItem(dailyItem, cues);

    if (latestGeneratedCue?.id === id) return latestGeneratedCue;

    return null;
  };

  const handleToggleSave = async (id: string, forceToast?: string) => {
    const targetCue = findCueForSave(id);
    if (!targetCue) return;

    if (!authAccessToken) {
      triggerToast("请先登录，再收藏到云端 Cue Bank。", "info");
      return;
    }

    if (targetCue.isSaved) {
      const didDelete = await deleteCueBankItemFromCloud(targetCue.id);
      if (!didDelete) return;

      const updated = cues.map((item) =>
        item.id === targetCue.id ? { ...item, isSaved: false } : item
      );
      updateCuesInStateAndStore(updated);
      triggerToast(forceToast || "Removed from Cue Bank");
      return;
    }

    const saved = await saveCueBankItemToCloud({ ...targetCue, isSaved: true });
    if (!saved) return;

    const didUpdateExisting = cues.some((item) => item.id === saved.id);
    const updated = didUpdateExisting
      ? cues.map((item) => (item.id === saved.id ? saved : item))
      : [saved, ...cues];
    updateCuesInStateAndStore(updated);
    triggerToast(forceToast || "Saved to Cue Bank");
  };

  const handleToggleDone = (id: string) => {
    let message = "";
    let didUpdateExisting = false;
    let updated = cues.map((item) => {
      if (item.id === id) {
        didUpdateExisting = true;
        const nextDoneState = !item.isDone;
        message = nextDoneState ? "Marked as Practiced" : "Marked as Unfinished";
        return { ...item, isDone: nextDoneState };
      }
      return item;
    });

    if (!didUpdateExisting) {
      const dailyItem = dailyCueItems.find((item) => item.id === id);
      if (dailyItem) {
        updated = [{ ...buildCueFromDailyItem(dailyItem, cues), isDone: true }, ...updated];
        message = "Marked as Practiced";
      }
    }

    updateCuesInStateAndStore(updated);
    const changed = updated.find((item) => item.id === id || item.dailyCueId === id);
    if (changed?.isSaved) {
      void saveCueBankItemToCloud(changed);
    }
    if (message) {
      triggerToast(message, "info");
    }
  };

  const handleDeleteFromBank = async (id: string) => {
    const didDelete = await deleteCueBankItemFromCloud(id);
    if (!didDelete) return;

    const updated = cues.map((item) => {
      if (item.id === id) {
        return { ...item, isSaved: false };
      }
      return item;
    });
    updateCuesInStateAndStore(updated);
    triggerToast("Removed from Cue Bank", "success");
  };

  const openCueDetail = (cue: CueItem) => {
    setSelectedCue(cue);
    setIsModalOpen(true);
  };

  const handleToggleSourcePanel = () => {
    setIsSourcePanelOpen((current) => {
      const next = !current;
      if (next) {
        void loadManagedSources();
      }
      return next;
    });
  };

  const handleRefreshManagedSources = async () => {
    const didLoad = await loadManagedSources();
    triggerToast(
      didLoad ? "Sources synced from Supabase" : "Source sync failed",
      didLoad ? "success" : "error"
    );
  };

  const handleRefreshDailyCues = async () => {
    setIsDailyRefreshing(true);
    setDailyError(null);
    triggerToast("正在刷新 Daily Cue 真实来源...", "info");

    const response = await refreshDailyCuesFromApi();

    if (response.success && response.items && response.brief) {
      setDailyCueItems(response.items);
      setDailyBrief(response.brief);
      setDailyFeedMode(response.generatedFrom || "empty_live_sources");
      setDailyCategoryFilter("all");
      setDailyError(null);
      triggerToast("Daily Cue 已更新", "success");
    } else {
      setDailyError(response.error || "刷新失败，已保留上一版 Daily Cue。");
      triggerToast("Daily Cue 刷新失败，已保留上一版内容", "error");
    }

    setIsDailyRefreshing(false);
  };

  const handleToggleManagedSource = async (sourceId: string, enabled: boolean) => {
    setIsSourceSaving(true);
    setSourceManagementError(null);
    const previousSources = managedSources;
    setManagedSources((current) =>
      current.map((source) => (source.id === sourceId ? { ...source, enabled } : source))
    );

    const response = await updateManagedSourceEnabledFromApi(sourceId, enabled);
    if (response.success && response.source) {
      setManagedSources((current) =>
        current.map((source) => (source.id === response.source?.id ? response.source : source))
      );
      triggerToast("Source setting updated", "success");
    } else if (response.success) {
      triggerToast("Source setting updated for local preview", "info");
    } else {
      setManagedSources(previousSources);
      setSourceManagementError(response.error || "Source update failed.");
      triggerToast("Source update failed", "error");
      void loadManagedSources();
    }

    setIsSourceSaving(false);
  };

  // AI Generator Submit handler
  const handleCaptureClipboard = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        triggerToast("当前浏览器不支持读取剪贴板，请手动粘贴。", "info");
        return;
      }

      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        triggerToast("剪贴板里没有可用文本。", "info");
        return;
      }

      setChineseInput(text.trim());
      triggerToast("已从剪贴板捕捉工作片段", "success");
    } catch (error) {
      console.warn("Clipboard capture failed:", error);
      triggerToast("剪贴板权限受限，请手动粘贴内容。", "error");
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chineseInput || !chineseInput.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);
    setLatestGeneratedCue(null);

    try {
      const response = await generatePMCue({
        chineseThought: chineseInput,
        scenario: scenario,
      });

      if (response.success && response.item) {
        // Build the final item
        const newItem: CueItem = {
          ...response.item,
          isSaved: false, // User can manually click "Save"
          isDone: false,
        } as CueItem;

        // Append to the list so it is selectable, tracked in history, and filterable
        const updated = [newItem, ...cues];
        updateCuesInStateAndStore(updated);
        setLatestGeneratedCue(newItem);
        triggerToast("Cue generated successfully!", "success");
      } else {
        throw new Error(response.error || "Could not complete translation.");
      }
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "Failed to generate PM English Cue. Make sure the proxy is active.");
      triggerToast("Failed to generate English Cue", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Copied handler
  const handleDirectCopy = async (text: string) => {
    try {
      if (!navigator.clipboard?.writeText) {
        triggerToast("当前浏览器不支持直接复制，请手动选择文本复制。", "info");
        return;
      }

      await navigator.clipboard.writeText(text);
      triggerToast("Copied to clipboard!", "success");
    } catch (error) {
      console.error("Copy failed:", error);
      triggerToast("复制失败，请手动选择文本复制。", "error");
    }
  };

  // Speak pronunciation
  const handleSpeakExpression = (text: string) => {
    try {
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        triggerToast("当前浏览器不支持发音播放。", "info");
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.onerror = () => {
        triggerToast("发音播放失败，请稍后重试。", "error");
      };
      window.speechSynthesis.speak(utterance);
      triggerToast("Playing pronunciation guide...", "info");
    } catch (error) {
      console.error("Speech synthesis failed:", error);
      triggerToast("发音播放失败，请稍后重试。", "error");
    }
  };

  // Date formulation for dashboard
  const getFormattedDate = () => {
    const opts: Intl.DateTimeFormatOptions = { weekday: "long", month: "short", day: "numeric" };
    return new Date().toLocaleDateString("en-US", opts);
  };

  // Compute stats: "Learned Today"
  // Let's assume daily items that are marked done or saved constitute active learning cards.
  const learnedCount = cues.filter((item) => item.isDone).length;

  // Filter lists
  // Daily Cues are loaded from the P1 live feed API and can be cached server-side.
  const dailyCards = useMemo(() => cues.filter((mc) => mc.sourceType === "daily"), [cues]);
  
  const displayDailyCards = useMemo(
    () =>
      dailyCueItems.length > 0
        ? dailyCueItems.map((item) => buildCueFromDailyItem(item, cues))
        : dailyCards.slice(0, 3),
    [cues, dailyCards, dailyCueItems]
  );

  const categoryCounts = useMemo(
    () => getDailyCategoryCounts(dailyCueItems),
    [dailyCueItems]
  );

  useEffect(() => {
    if (
      dailyCategoryFilter !== "all" &&
      dailyCueItems.length > 0 &&
      (categoryCounts.get(dailyCategoryFilter) || 0) === 0
    ) {
      setDailyCategoryFilter("all");
    }
  }, [categoryCounts, dailyCategoryFilter, dailyCueItems.length]);

  const filteredDisplayDailyCards = useMemo(
    () => filterDailyCardsByCategory(displayDailyCards, dailyCueItems, dailyCategoryFilter),
    [dailyCategoryFilter, dailyCueItems, displayDailyCards]
  );

  // Cue Bank Cards: All items flagged as saved
  const savedCues = cues.filter((item) => item.isSaved);

  const filteredSavedCues = savedCues.filter((item) => {
    const matchesSource =
      bankSourceFilter === "all" || item.sourceType === bankSourceFilter;
    const matchesStatus =
      bankStatusFilter === "all" ||
      (bankStatusFilter === "unfinished" && !item.isDone) ||
      (bankStatusFilter === "completed" && item.isDone);
    return matchesSource && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#FAFBF9] font-sans text-slate-900 flex flex-col selection:bg-slate-200 selection:text-slate-950 antialiased">
      
      {/* Top Professional App Header */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 shadow-[0_2px_15px_-3px_rgba(15,23,42,0.03)] backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center text-white shadow-sm hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl tracking-tight text-slate-950">PM CUE</span>
                <span className="text-[10px] font-mono tracking-widest bg-slate-100 text-slate-700 border border-slate-200 rounded-md px-2 py-0.5 font-bold">P1</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase">AI-native PM English companion</p>
            </div>
          </div>

          {/* Active Navigation Tabs */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
          <nav className="flex bg-slate-100/80 p-1 rounded-lg self-start md:self-center border border-slate-200" id="main-navigation">
            <button
              onClick={() => setActiveTab("daily")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-bold tracking-tight transition-all duration-150 cursor-pointer ${
                activeTab === "daily"
                  ? "bg-white text-slate-950 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
              id="nav-daily-tab"
            >
              <BookOpen className={`w-4 h-4 transition-transform duration-250 ${activeTab === "daily" ? "text-slate-900 scale-110" : "text-slate-500"}`} />
              <span>Daily Cue</span>
            </button>
            <button
              onClick={() => setActiveTab("work")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-bold tracking-tight transition-all duration-150 cursor-pointer ${
                activeTab === "work"
                  ? "bg-white text-slate-950 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
              id="nav-work-tab"
            >
              <Zap className={`w-4 h-4 transition-transform duration-250 ${activeTab === "work" ? "text-amber-500 scale-110" : "text-slate-500"}`} />
              <span>Work Cue</span>
            </button>
            <button
              onClick={() => setActiveTab("bank")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-bold tracking-tight transition-all duration-150 cursor-pointer relative ${
                activeTab === "bank"
                  ? "bg-white text-slate-950 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
              id="nav-bank-tab"
            >
              <FolderHeart className={`w-4 h-4 transition-transform duration-250 ${activeTab === "bank" ? "text-rose-500 scale-110" : "text-slate-500"}`} />
              <span>Cue Bank</span>
              {savedCues.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                  {savedCues.length}
                </span>
              )}
            </button>
          </nav>
            <AuthMenu
              user={authUser}
              isLoading={isAuthLoading}
              onAuthError={(message) => triggerToast(message, "error")}
              onAuthSuccess={(message) => triggerToast(message, "success")}
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-8">
        
        {/* VIEW 1: DAILY CUE PAGE */}
        {activeTab === "daily" && (
          <div className="space-y-6" id="daily-view-container">
            {/* Daily Brief Module */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 md:p-7 shadow-[0_8px_28px_rgba(15,23,42,0.04)] space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div className="space-y-3 max-w-4xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase bg-slate-950 text-white border border-slate-800 px-2.5 py-1 rounded-md font-extrabold tracking-wider">
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      Daily Intel Summary
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                      {dailyCueItems.length || 10}+ signals
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                      Beijing 24:00 refresh
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-slate-950 leading-tight">
                    今天产品经理最值得关注的 AI / Product 信号
                  </h1>
                  <p className="text-slate-700 text-sm md:text-base font-sans max-w-3xl leading-relaxed">
                    {dailyBrief?.summary || "每天从专业来源筛选前沿动态，帮你快速判断哪些变化会影响产品策略、用户工作流和英文表达积累。"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 min-w-full sm:min-w-[300px] lg:min-w-[320px]">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">{getFormattedDate()}</span>
                    <span className="text-2xl font-display font-extrabold text-slate-950 block leading-none mt-1">
                      {learnedCount}
                    </span>
                    <span className="text-xs text-slate-500 block mt-1.5 font-semibold">practiced cues</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3.5">
                    <span className="text-[10px] font-mono text-amber-700 uppercase tracking-widest block font-bold">Feed</span>
                    <span className="text-2xl font-display font-extrabold text-slate-950 block leading-none mt-1">
                      {displayDailyCards.length}
                    </span>
                    <span className="text-xs text-amber-800/70 block mt-1.5 font-semibold">
                      {dailyFeedMode ? feedModeLabels[dailyFeedMode] : "available today"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                  {dailyBrief
                    ? `Updated ${new Date(dailyBrief.lastUpdatedAt).toLocaleString()} · Next ${new Date(dailyBrief.nextRefreshAt).toLocaleString()}`
                    : "Waiting for live source refresh."}
                </p>
                <button
                  type="button"
                  onClick={handleRefreshDailyCues}
                  disabled={isDailyRefreshing}
                  className="w-full sm:w-auto text-xs font-mono bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-wait px-3.5 py-2 rounded-lg border border-slate-900 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDailyRefreshing ? "animate-spin" : ""}`} />
                  <span>{isDailyRefreshing ? "Refreshing feed" : "Sync latest signals"}</span>
                </button>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleToggleSourcePanel}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono font-bold text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:text-slate-950"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {isSourcePanelOpen ? "Hide sources" : "Manage sources"}
              </button>
            </div>

            {isSourcePanelOpen && (
              <SourceManagementPanel
                sources={managedSources}
                categoryLabels={categoryLabels}
                isLoading={isSourceLoading}
                isSaving={isSourceSaving}
                isDailyRefreshing={isDailyRefreshing}
                error={sourceManagementError}
                lastSyncedAt={sourceLastSyncedAt}
                onToggleSource={handleToggleManagedSource}
                onRefreshSources={handleRefreshManagedSources}
                onRefreshDailyCues={handleRefreshDailyCues}
              />
            )}

            {/* Daily Feed Controls */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <PlayCircle className="w-5.5 h-5.5 text-slate-800" />
                    Today's PM Signal Feed
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    真实来源 + PM English cue + 可保存练习
                  </p>
                </div>
                <span className="text-xs font-mono bg-white text-slate-600 px-3 py-1.5 rounded-md border border-slate-200 font-bold self-start sm:self-auto">
                  Showing {filteredDisplayDailyCards.length} / {displayDailyCards.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setDailyCategoryFilter("all")}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                    dailyCategoryFilter === "all"
                      ? "bg-slate-950 border-slate-950 text-white"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  All ({displayDailyCards.length})
                </button>
                {(Object.keys(categoryLabels) as SourceCategoryId[]).map((categoryId) => {
                  const count = categoryCounts.get(categoryId) || 0;
                  return (
                    <button
                      key={categoryId}
                      type="button"
                      onClick={() => setDailyCategoryFilter(categoryId)}
                      disabled={count === 0}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        dailyCategoryFilter === categoryId
                          ? "bg-slate-950 border-slate-950 text-white"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {categoryLabels[categoryId]} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {dailyError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-xs font-sans flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{dailyError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" id="daily-cards-deck">
              {isDailyLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`daily-skeleton-${idx}`}
                    className="bg-white rounded-2xl border border-slate-200 p-0 flex flex-col justify-between overflow-hidden animate-pulse min-h-[380px] shadow-xs"
                  >
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        {/* Scenario tag badge match */}
                        <div className="h-5 bg-slate-200 rounded w-24 border border-slate-100" />
                        <div className="h-4 bg-slate-100 rounded w-10" />
                      </div>
                      
                      {/* Title match */}
                      <div className="space-y-2 pt-1">
                        <div className="h-4.5 bg-slate-205 rounded w-5/6" />
                        <div className="h-4.5 bg-slate-205 rounded w-2/3" />
                      </div>
                      
                      {/* Chinese context match */}
                      <div className="space-y-1.5 pt-1">
                        <div className="h-3 bg-slate-100 rounded w-20" />
                        <div className="h-3.5 bg-slate-100 rounded w-full" />
                      </div>
                      
                      <hr className="border-slate-100" />
                      
                      {/* English output match */}
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-205 rounded w-24" />
                        <div className="h-4 bg-slate-205 rounded w-full" />
                        <div className="h-4 bg-slate-205 rounded w-4/5" />
                      </div>
                    </div>
                    
                    {/* Footer match */}
                    <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between">
                      <div className="h-4 bg-slate-200 rounded w-20" />
                      <div className="flex gap-1.5">
                        <div className="h-7 bg-slate-200 rounded-md w-8" />
                        <div className="h-7 bg-slate-200 rounded-md w-8" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                filteredDisplayDailyCards.map((cue) => {
                  // Inline check for custom helper
                  const getSStyle = (scen: string) => {
                    const l = scen.toLowerCase();
                    if (l.includes("prd") || l.includes("review")) return "bg-rose-50 text-rose-700 border-rose-100";
                    if (l.includes("stakeholder") || l.includes("update")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
                    if (l.includes("meeting")) return "bg-sky-50 text-sky-700 border-sky-200";
                    return "bg-amber-50 text-amber-700 border-amber-100";
                  };
                  const sourceDailyItem = dailyCueItems.find((item) => item.id === cue.dailyCueId || item.id === cue.id);
                  const categoryLabel = sourceDailyItem ? categoryLabels[sourceDailyItem.categoryId] : "Daily";
                  return (
                    <div
                      key={cue.id}
                      className="group bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition-all duration-200 hover:shadow-[0_14px_32px_rgba(15,23,42,0.06)] flex flex-col justify-between overflow-hidden"
                      id={`daily-card-${cue.id}`}
                    >
                      {/* Card Head */}
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getSStyle(cue.scenario)}`}>
                              {cue.scenario}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                              {categoryLabel}
                            </span>
                          </div>
                          
                          {/* Interactive Status Indicator */}
                          {cue.isDone && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-250 font-bold">
                              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                              <span>Practiced</span>
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
                            <span>中文速览</span>
                            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                          </div>
                          <h3 className="text-slate-950 font-display font-extrabold text-[18px] leading-snug tracking-tight line-clamp-2 group-hover:text-slate-700 transition-colors">
                            {cue.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-1.5 items-center">
                          {cue.phrases.slice(0, 3).map((phrase) => (
                            <span
                              key={phrase}
                              className="text-[10px] font-sans font-medium px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded"
                            >
                              {phrase}
                            </span>
                          ))}
                        </div>

                        <div className="space-y-2 border-t border-slate-100 pt-3">
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-extrabold">
                            PM English cue
                          </p>
                          <p className="text-sm font-display font-bold text-slate-900 tracking-tight leading-snug line-clamp-3">
                            “{cue.englishOutput}”
                          </p>
                          <p className="text-slate-600 text-xs font-sans line-clamp-3 leading-relaxed">
                            {cue.chineseExplanation}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="bg-slate-50/70 border-t border-slate-100 p-4 flex items-center justify-between gap-3">
                        {/* Left: View Details link */}
                        <div className="min-w-0">
                          {cue.sourceRef ? (
                            <a
                              href={cue.sourceRef.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-500 hover:text-slate-900 transition-colors max-w-full"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{cue.sourceRef.sourceName}</span>
                            </a>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400">PM Cue</span>
                          )}
                        </div>

                        {/* Right: Save/Bookmark button */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSpeakExpression(cue.englishOutput)}
                            className="p-1 px-[7px] text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                            title="Speak expression out loud"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleToggleSave(cue.id)}
                            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                              cue.isSaved
                                ? "bg-amber-50 text-amber-850 border-amber-300 hover:bg-amber-100"
                                : "bg-white text-slate-400 hover:text-slate-800 border-slate-200 hover:shadow-xs"
                            }`}
                            id={`btn-save-${cue.id}`}
                            title={cue.isSaved ? "Remove from Cue Bank" : "Save to Cue Bank"}
                          >
                            {cue.isSaved ? (
                              <BookmarkCheck className="w-4 h-4" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openCueDetail(cue)}
                            className="p-1.5 rounded-md border bg-slate-950 text-white border-slate-950 hover:bg-slate-800 transition-all cursor-pointer"
                            id={`btn-view-${cue.id}`}
                            title="Learn details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {!isDailyLoading && filteredDisplayDailyCards.length === 0 && (
                <div className="col-span-3 text-center p-12 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-400 font-mono italic">No Daily Cue yet. Try refreshing the feed.</p>
                </div>
              )}
            </div>

            {/* Explainer Segment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-indigo-50/30 via-white to-slate-50/50 p-6.5 rounded-2xl border border-indigo-100/40 mt-10 shadow-[0_4px_24px_rgba(99,102,241,0.01)]">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-[13px] flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0 animate-pulse" />
                  What is a Work-Native Expression?
                </h3>
                <p className="text-xs text-slate-650 font-sans leading-relaxed">
                  Avoid rigid academic dictionary words. Instead of telling stakeholders "I don't have human power now", say <strong>"Our resources are heavily constrained right now"</strong>. PM CUE coaches you to say exactly what keeps team alignment professional and precise.
                </p>
              </div>
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-[13px] flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                  Maximize Your MVP Loop Setup
                </h3>
                <p className="text-xs text-slate-650 font-sans leading-relaxed">
                  Go ahead and click any card to try the **Continuous Practice** oral simulator, then jump over to **Work Cue** to translate your own real-life thoughts using our intelligent contextual translation models!
                </p>
              </div>
            </div>
          </div>
        )}        {/* VIEW 2: WORK CUE GENERATOR */}
        {activeTab === "work" && (
          <WorkCuePanel
            dailyWorkCue={dailyWorkCue}
            dailyWorkCueError={dailyWorkCueError}
            chineseInput={chineseInput}
            scenario={scenario}
            isGenerating={isGenerating}
            generationError={generationError}
            latestGeneratedCue={latestGeneratedCue}
            isLatestGeneratedCueSaved={Boolean(
              latestGeneratedCue && cues.find((item) => item.id === latestGeneratedCue.id)?.isSaved
            )}
            onChineseInputChange={setChineseInput}
            onScenarioChange={setScenario}
            onCaptureClipboard={handleCaptureClipboard}
            onGenerate={handleGenerate}
            onSpeakExpression={handleSpeakExpression}
            onDirectCopy={handleDirectCopy}
            onOpenCueDetail={openCueDetail}
            onSaveGeneratedCue={(id) => handleToggleSave(id, "Saved to Cue Bank")}
          />
        )}


        {/* VIEW 3: CUE BANK REPOSITORY */}
        {activeTab === "bank" && (
          <div className="space-y-6" id="bank-view-container">
            
            {/* Header portion */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FolderHeart className="w-5.5 h-5.5 text-rose-500 fill-rose-500" />
                  Your PM Cue Bank (收藏本)
                </h2>
                <p className="text-xs text-slate-500 font-mono">Manage all saved learning material, segment sources, and track completion progress.</p>
              </div>

              {/* Learning stats summary inside bank */}
              <div className="text-xs font-mono bg-slate-50 text-slate-800 border border-slate-200 rounded-md px-3.5 py-2">
                Total Cards: <strong className="text-sm font-sans">{savedCues.length} items</strong>
                <span className="ml-2 text-slate-500">
                  {authUser
                    ? isRemoteCueBankEnabled
                      ? "Supabase sync"
                      : "signed in"
                    : "sign in to save"}
                </span>
              </div>
            </div>

            {/* Comprehensive Dynamic Filters Section */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Left filter segment: Source Type */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <ListFilter className="w-3.5 h-3.5 text-slate-400" />
                  Source:
                </span>
                <div className="flex bg-slate-100 p-1 rounded-xl flex-grow md:flex-grow-0" id="bank-filter-source">
                  {(["all", "daily", "work"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setBankSourceFilter(filter)}
                      className={`px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-extrabold tracking-tight uppercase transition-all cursor-pointer ${
                        bankSourceFilter === filter
                          ? "bg-white text-slate-950 shadow-sm border border-slate-200/40"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right filter segment: Practice Status */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400">
                  Status:
                </span>
                <div className="flex bg-slate-100 p-1 rounded-xl flex-grow md:flex-grow-0" id="bank-filter-status">
                  {(["all", "unfinished", "completed"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setBankStatusFilter(filter)}
                      className={`px-4 py-1.5 rounded-lg text-[11px] font-mono font-extrabold tracking-tight uppercase transition-all cursor-pointer ${
                        bankStatusFilter === filter
                          ? "bg-white text-slate-950 shadow-sm border border-slate-200/40"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {filter === "all" && "All State"}
                      {filter === "unfinished" && "Unfinished"}
                      {filter === "completed" && "Completed ✅"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List Screen / Collection cards */}
            <div className="space-y-4" id="cue-bank-cards-list">
              
              {/* If Cue Bank has no saved items, trigger Empty State with redirect CTA buttons */}
              {savedCues.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-slate-205 p-12 text-center space-y-6 py-16 shadow-xs relative overflow-hidden" id="bank-empty-state">
                  <div className="absolute -left-20 -top-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-2xl" />
                  <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-450 flex items-center justify-center mx-auto border border-slate-100 animate-pulse">
                    <FolderHeart className="w-7 h-7 text-indigo-500" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="font-display font-extrabold text-slate-900 text-base leading-tight">Your Cue Bank is currently empty</h3>
                    <p className="text-xs text-slate-650 font-sans leading-relaxed">
                      Start building your customized playbook. Save curated daily expressions or dynamically generate expressions for your upcoming meetings.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab("daily")}
                      className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-mono font-extrabold tracking-wide uppercase transition-all duration-300 shadow-[0_4px_14px_rgba(99,102,241,0.2)] cursor-pointer"
                      id="btn-empty-go-daily"
                    >
                      ⚡ Explore Daily Cards
                    </button>
                    <button
                      onClick={() => setActiveTab("work")}
                      className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-mono font-extrabold tracking-wide uppercase transition-all duration-300 border border-slate-250 hover:border-slate-350 cursor-pointer shadow-xs"
                      id="btn-empty-go-work"
                    >
                      🪄 Make a Work Cue
                    </button>
                  </div>
                </div>
              )}
                 {/* If items are saved, but filters resolve to 0 match */}
              {savedCues.length > 0 && filteredSavedCues.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3 shadow-xs">
                  <p className="text-sm font-extrabold text-slate-900 font-display">No card matched the active filters.</p>
                  <p className="text-xs text-slate-500 font-sans">Try changing your Source or Completion buttons above to find your saved items.</p>
                  <button
                    onClick={() => {
                      setBankSourceFilter("all");
                      setBankStatusFilter("all");
                    }}
                    className="mt-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-indigo-600 hover:text-indigo-850 hover:bg-indigo-50/50 transition-all cursor-pointer underline decoration-dotted"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Items Render Grid */}
              {filteredSavedCues.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSavedCues.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-205 hover:border-indigo-200 hover:shadow-[0_8px_30px_rgba(99,102,241,0.03)] transition-all duration-300 p-5 shadow-xs flex flex-col justify-between gap-4 group/card"
                      id={`bank-card-item-${item.id}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* Source tag badge */}
                            <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border font-extrabold ${
                              item.sourceType === "daily" 
                                ? "bg-indigo-50 text-indigo-750 border-indigo-200" 
                                : "bg-violet-50 text-violet-755 border-violet-200"
                            }`}>
                              {item.sourceType === "daily" ? "Daily" : "Work"}
                            </span>
                            
                            {/* Scenario badge */}
                            <span className="text-[10px] font-mono text-slate-550 font-bold">
                              {item.scenario}
                            </span>
                          </div>

                          {/* Action toggle checkbox done */}
                          <button
                            type="button"
                            onClick={() => handleToggleDone(item.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-tight font-extrabold border transition-colors cursor-pointer ${
                              item.isDone
                                ? "bg-emerald-50 text-emerald-800 border-emerald-250"
                                : "bg-white text-slate-400 hover:text-slate-800 border-slate-205"
                            }`}
                            title="Toggle practiced status"
                          >
                            <Check className={`w-3.5 h-3.5 ${item.isDone ? "text-emerald-650 stroke-[2.5]" : ""}`} />
                            <span>{item.isDone ? "Practiced" : "Mark practiced"}</span>
                          </button>
                        </div>

                        {/* Title expression */}
                        <div onClick={() => openCueDetail(item)} className="cursor-pointer space-y-1.5 group">
                          <h4 className="font-display font-extrabold text-slate-900 group-hover/card:text-indigo-650 text-[15px] transition-colors line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-slate-500 text-xs italic font-sans truncate">
                            "{item.chineseExplanation}"
                          </p>
                          <p className="text-slate-950 font-display font-extrabold text-sm line-clamp-2 mt-2 leading-relaxed group-hover/card:text-indigo-900 transition-colors">
                            {item.englishOutput}
                          </p>
                        </div>
                      </div>

                      {/* Footer containing interaction buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => openCueDetail(item)}
                          className="text-xs font-mono font-extrabold text-indigo-650 hover:text-indigo-850 transition-colors cursor-pointer"
                        >
                          Launch Oral Practice →
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSpeakExpression(item.englishOutput)}
                            className="p-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-white text-slate-500 hover:text-indigo-650 font-mono text-[10px] inline-flex items-center gap-1 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDirectCopy(item.englishOutput)}
                            className="p-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-white text-slate-500 hover:text-indigo-650 font-mono text-[10px] inline-flex items-center gap-1 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </button>

                          {/* Delete button (instantly removes from storage, triggers Toast, no confirm) */}
                          <button
                            type="button"
                            onClick={() => handleDeleteFromBank(item.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            id={`btn-delete-${item.id}`}
                            title="Delete card from bank"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* Shared Footer block */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-10 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="font-display font-bold text-white tracking-widest text-sm">PM CUE</span>
            </div>
            <p className="text-xs text-slate-500">Transforming Product Management English into spontaneous precision.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-mono">
            {/* Target users summary check */}
            <span className="text-slate-500">Designed for Global Product Managers</span>
            <span className="hidden sm:inline text-slate-800">|</span>
            <span className="text-slate-400">Powered by server-side Gemini AI models</span>
          </div>
        </div>
      </footer>

      {/* Floating toast notification stack */}
      <div 
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none" 
        id="toast-notifications-container"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-xs font-mono font-bold tracking-tight transition-all duration-300 transform translate-y-0 opacity-100 flex items-center justify-between gap-3 text-white ${
              toast.type === "error"
                ? "bg-rose-600 border-rose-500"
                : toast.type === "info"
                ? "bg-slate-900 border-slate-800"
                : "bg-emerald-600 border-emerald-500"
            }`}
            id={`toast-msg-${toast.id}`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" && "✅"}
              {toast.type === "error" && "⚠️"}
              {toast.type === "info" && "💡"}
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Shared Detail Modal overlay */}
      <CueDetailModal
        item={selectedCue}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCue(null);
        }}
        onToggleSave={handleToggleSave}
        onToggleDone={handleToggleDone}
        showToast={(m) => triggerToast(m, "success")}
      />

    </div>
  );
}
