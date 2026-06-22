/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { mockCues } from "./data/mockCues";
import { GENERATE_CUE_SCENARIOS } from "./types";
import type { CueItem, GenerateCueScenario } from "./types";
import CueDetailModal from "./components/CueDetailModal";
import { generatePMCue } from "./services/aiService";
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
  RotateCcw,
  Zap
} from "lucide-react";

// For Toast Alerts
interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<"daily" | "work" | "bank">("daily");

  // Daily Feed Loading state for skeleton display
  const [isDailyLoading, setIsDailyLoading] = useState(true);

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

  // Work Cue Form states
  const [chineseInput, setChineseInput] = useState("");
  const [scenario, setScenario] = useState<GenerateCueScenario>("Meeting");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [latestGeneratedCue, setLatestGeneratedCue] = useState<CueItem | null>(null);

  // Filter States for Cue Bank
  const [bankSourceFilter, setBankSourceFilter] = useState<"all" | "daily" | "work">("all");
  const [bankStatusFilter, setBankStatusFilter] = useState<"all" | "unfinished" | "completed">("all");

  // Load and merge initial cues from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("pmcue_items");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CueItem[];
        // To make sure any new updates to initial seed mock values also exist or are merged elegantly,
        // we can identify cues from parsed. Any cue missing from parsed is appended.
        const merged = [...parsed];
        mockCues.forEach((mc) => {
          if (!merged.some((item) => item.id === mc.id)) {
            merged.push(mc);
          }
        });
        setCues(merged);
        localStorage.setItem("pmcue_items", JSON.stringify(merged));
      } catch (e) {
        console.error("Failed to parse local storage items", e);
        setCues(mockCues);
        localStorage.setItem("pmcue_items", JSON.stringify(mockCues));
      }
    } else {
      setCues(mockCues);
      localStorage.setItem("pmcue_items", JSON.stringify(mockCues));
    }
  }, []);

  // Save changes to localStorage whenever cues list changes
  const updateCuesInStateAndStore = (updatedList: CueItem[]) => {
    setCues(updatedList);
    localStorage.setItem("pmcue_items", JSON.stringify(updatedList));

    // Also sync currently opened modal cue to avoid stale context
    if (selectedCue) {
      const refreshed = updatedList.find((item) => item.id === selectedCue.id);
      if (refreshed) {
        setSelectedCue(refreshed);
      }
    }
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
  const handleToggleSave = (id: string, forceToast?: string) => {
    let message = "";
    const updated = cues.map((item) => {
      if (item.id === id) {
        const nextSavedState = !item.isSaved;
        message = nextSavedState ? "Saved to Cue Bank" : "Removed from Cue Bank";
        return { ...item, isSaved: nextSavedState };
      }
      return item;
    });

    updateCuesInStateAndStore(updated);
    if (forceToast || message) {
      triggerToast(forceToast || message);
    }
  };

  const handleToggleDone = (id: string) => {
    let message = "";
    const updated = cues.map((item) => {
      if (item.id === id) {
        const nextDoneState = !item.isDone;
        message = nextDoneState ? "Marked as Practiced" : "Marked as Unfinished";
        return { ...item, isDone: nextDoneState };
      }
      return item;
    });

    updateCuesInStateAndStore(updated);
    if (message) {
      triggerToast(message, "info");
    }
  };

  const handleDeleteFromBank = (id: string) => {
    // Soft removal or Unsaving from the bank
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

  // AI Generator Submit handler
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
  const handleDirectCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast("Copied to clipboard!", "success");
  };

  // Speak pronunciation
  const handleSpeakExpression = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      triggerToast("Playing pronunciation guide...", "info");
    } else {
      triggerToast("TTS Speech not supported in this browser.", "info");
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
  // Daily Cues are precisely daily cards. Let's output original daily subset (the first 3 daily cards in mockup)
  const dailyCards = cues.filter((mc) => mc.sourceType === "daily");
  
  // Seed the screen with exactly 3 default cards
  const displayDailyCards = dailyCards.slice(0, 3);

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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-950 antialiased">
      
      {/* Top Professional App Header */}
      <header className="sticky top-0 z-40 bg-white/90 border-b border-slate-200/70 shadow-[0_2px_15px_-3px_rgba(99,102,241,0.03)] backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer">
              <Sparkles className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-950">PM CUE</span>
                <span className="text-[10px] font-mono tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-200/50 rounded-md px-2 py-0.5 font-bold">MVP</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase">Work-Native PM English Expression Engine</p>
            </div>
          </div>

          {/* Active Navigation Tabs */}
          <nav className="flex bg-slate-100/80 p-1.5 rounded-2xl self-start sm:self-center border border-slate-200/40" id="main-navigation">
            <button
              onClick={() => setActiveTab("daily")}
              className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-mono font-bold tracking-tight transition-all duration-150 cursor-pointer ${
                activeTab === "daily"
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200/30"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
              id="nav-daily-tab"
            >
              <BookOpen className={`w-4 h-4 transition-transform duration-250 ${activeTab === "daily" ? "text-indigo-650 scale-110" : "text-slate-500"}`} />
              <span>Daily Cue</span>
            </button>
            <button
              onClick={() => setActiveTab("work")}
              className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-mono font-bold tracking-tight transition-all duration-150 cursor-pointer ${
                activeTab === "work"
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200/30"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
              id="nav-work-tab"
            >
              <Zap className={`w-4 h-4 transition-transform duration-250 ${activeTab === "work" ? "text-amber-500 scale-110 animate-bounce" : "text-slate-500"}`} />
              <span>Work Cue AI</span>
            </button>
            <button
              onClick={() => setActiveTab("bank")}
              className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-mono font-bold tracking-tight transition-all duration-150 cursor-pointer relative ${
                activeTab === "bank"
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200/30"
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
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-8">
        
        {/* VIEW 1: DAILY CUE PAGE */}
        {activeTab === "daily" && (
          <div className="space-y-6" id="daily-view-container">
            {/* Value / Onboarding Banner (First 10s Understanding requirement) */}
            <div className="bg-slate-950 text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-[0_12px_45px_-8px_rgba(0,0,0,0.18)] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-violet-500/5 to-transparent rounded-full blur-3xl -z-10" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-gradient-to-tr from-indigo-600/10 to-transparent rounded-full blur-3xl -z-10" />
              
              <div className="space-y-3 max-w-2xl">
                <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-md font-extrabold tracking-wider inline-block">
                  🎯 Product value in 10s
                </span>
                <h1 className="text-2xl md:text-3.5xl font-display font-extrabold tracking-tight text-white leading-tight">
                  Stop translated English. Speak <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-200 underline decoration-indigo-500 decoration-2 underline-offset-4">Work-Native</span> PM terms.
                </h1>
                <p className="text-slate-400 text-sm md:text-base font-sans max-w-xl leading-relaxed">
                  Turn stiff literal phrases into authentic Silicon Valley expressions. Practice and save expressions instantly to built your high-activation playbook.
                </p>
              </div>

              {/* Lightweight Stats counter */}
              <div className="flex items-center gap-4 bg-white/[0.04] backdrop-blur-md p-4.5 rounded-2xl border border-white/10 min-w-[210px] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.06)]" id="learning-summary-widget">
                <div className="p-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/25 rounded-xl">
                  <Calendar className="w-5.5 h-5.5 text-indigo-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest block font-bold">{getFormattedDate()}</span>
                  <span className="text-2xl font-display font-extrabold text-white block leading-none mt-1">
                    {learnedCount} Cues
                  </span>
                  <span className="text-xs text-slate-400 block mt-1.5 font-semibold font-mono">accomplished today</span>
                </div>
              </div>
            </div>

            {/* Daily Card Deck Title */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <PlayCircle className="w-5.5 h-5.5 text-indigo-600" />
                  Today's Daily PM Expressions
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Exactly 3 pre-loaded dynamic cues for deep integration</p>
              </div>
              <span className="text-xs font-mono bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md border border-indigo-150/45 font-bold">
                100% Focused
              </span>
            </div>

            {/* Exactly 3 preloaded cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="daily-cards-deck">
              {isDailyLoading ? (
                // 3-card loading state with explicit animate-pulse matching normal state heights
                Array.from({ length: 3 }).map((_, idx) => (
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
                displayDailyCards.map((cue) => {
                  // Inline check for custom helper
                  const getSStyle = (scen: string) => {
                    const l = scen.toLowerCase();
                    if (l.includes("prd") || l.includes("review")) return "bg-rose-50 text-rose-700 border-rose-200";
                    if (l.includes("stakeholder") || l.includes("update")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
                    if (l.includes("meeting")) return "bg-sky-50 text-sky-700 border-sky-200";
                    return "bg-amber-50 text-amber-700 border-amber-200";
                  };
                  return (
                    <div
                      key={cue.id}
                      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition-all duration-300 hover:shadow-[0_12px_30px_rgba(99,102,241,0.06)] hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden vibrant-glow-card"
                      id={`daily-card-${cue.id}`}
                    >
                      {/* Card Head */}
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${getSStyle(cue.scenario)}`}>
                            {cue.scenario}
                          </span>
                          
                          {/* Interactive Status Indicator */}
                          {cue.isDone && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-250 font-bold">
                              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                              <span>Practiced</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-display font-bold text-slate-900 tracking-tight leading-snug group-hover:text-indigo-650 transition-colors line-clamp-2">
                          {cue.title}
                        </h3>

                        <div className="space-y-1.5">
                          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Chinese Context</div>
                          <p className="text-slate-600 text-xs font-sans line-clamp-2 italic leading-relaxed">
                            "{cue.chineseExplanation}"
                          </p>
                        </div>

                        <hr className="border-slate-100" />

                        <div className="space-y-1.5">
                          <div className="text-[10px] font-mono text-indigo-600 uppercase tracking-widest font-extrabold flex items-center gap-1">
                            <span>English Expression</span>
                            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                          </div>
                          <p className="text-slate-950 font-display font-extrabold text-[17px] leading-relaxed tracking-tight line-clamp-3 group-hover:text-indigo-900 transition-colors">
                            {cue.englishOutput}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="bg-slate-50/70 border-t border-slate-100 p-4 flex items-center justify-between gap-3">
                        {/* Left: View Details link */}
                        <button
                          onClick={() => openCueDetail(cue)}
                          className="flex items-center gap-1 text-xs font-mono font-bold text-slate-700 hover:text-indigo-650 transition-colors py-1 cursor-pointer"
                          id={`btn-view-${cue.id}`}
                        >
                          <span>Learn details</span>
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 duration-200" />
                        </button>

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
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {!isDailyLoading && displayDailyCards.length === 0 && (
                <div className="col-span-3 text-center p-12 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-400 font-mono italic">No Daily Cue yet.</p>
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
                  Go ahead and click any card to try the **Continuous Practice** oral simulator, then jump over to **Work Cue AI** to translate your own real-life thoughts using our intelligent contextual translation models!
                </p>
              </div>
            </div>
          </div>
        )}        {/* VIEW 2: WORK CUE GENERATOR */}
        {activeTab === "work" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="work-view-container">
            
            {/* Left Column: Form entry */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5.5 h-5.5 text-indigo-500 fill-indigo-500 animate-pulse" />
                  Contextual Work Cue Generator
                </h2>
                <p className="text-xs text-slate-500 font-mono">Convert raw product concepts/thoughts into powerful professional English.</p>
              </div>

              {/* Formulation Box */}
              <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-6 shadow-[0_8px_30px_rgba(99,102,241,0.02)]" id="cue-generator-form">
                
                {/* Chinese input area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 font-bold" htmlFor="chineseThought">
                      PM Thought in Chinese (中文思路)
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">Avoid formal dictionary translation</span>
                  </div>
                  <textarea
                    id="chineseThought"
                    value={chineseInput}
                    onChange={(e) => setChineseInput(e.target.value)}
                    placeholder="e.g. 这个需求其实没那么急，不用现在塞进去，免得打乱当前的计划..."
                    className="w-full min-h-[140px] px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-sans transition-all leading-relaxed placeholder:text-slate-400 outline-none"
                    disabled={isGenerating}
                  />
                </div>

                {/* Scenario Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block font-bold">
                    Choose Targeted Scenario (应用场景)
                  </label>
                  <div className="grid grid-cols-3 gap-2" id="scenario-selector-grid">
                    {GENERATE_CUE_SCENARIOS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setScenario(tag)}
                        className={`px-3 py-3 rounded-xl text-xs font-mono font-extrabold text-center border transition-all cursor-pointer ${
                          scenario === tag
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white hover:text-indigo-600 hover:border-indigo-300"
                        }`}
                        id={`scenario-tag-${tag.replace(" ", "")}`}
                        disabled={isGenerating}
                      >
                        {tag === "Meeting" && "🎙️ Meeting"}
                        {tag === "PRD Review" && "📝 PRD Review"}
                        {tag === "Stakeholder Update" && "🤝 Stakeholder"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generation CTA Button */}
                <button
                  type="submit"
                  disabled={isGenerating || !chineseInput.trim()}
                  className={`w-full py-4 px-4 rounded-xl text-xs font-mono font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    !chineseInput.trim()
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50"
                      : isGenerating
                      ? "bg-indigo-600 text-white border border-transparent cursor-wait animate-pulse"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-[0_4px_20px_rgba(99,102,241,0.2)]"
                  }`}
                  id="btn-generate-cue"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing raw thought...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Core PM Cue</span>
                    </>
                  )}
                </button>
              </form>

              {/* Custom validation feedback or hints */}
              <div className="bg-indigo-50/50 border border-indigo-150 p-4.5 rounded-2xl text-xs text-slate-650 font-sans space-y-1.5 shadow-[0_4px_12px_rgba(99,102,241,0.01)]">
                <span className="font-mono font-extrabold block text-indigo-900 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  💡 Dynamic Cue Tip:
                </span>
                <p className="leading-relaxed">
                  Slightly explain safety limits, parameters, resources, or timing in your Chinese thought to prompt the model into creating Silicon Valley style expressions containing terms like **"critical path"**, **"safeguard deliverables"**, or **"onboarding latency"**.
                </p>
              </div>
            </div>

            {/* Right Column: Production Output & Sandbox */}
            <div className="lg:col-span-7 flex flex-col justify-start">
              
              {/* Skeleton Screen or Loading Indicator state */}
              {isGenerating && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 h-full min-h-[460px] flex flex-col justify-between shadow-xs" id="generator-skeleton-state">
                  <div className="space-y-6">
                    {/* Header spinner */}
                    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 animate-pulse">
                      <div className="w-4 h-4 bg-slate-200 rounded" />
                      <div className="h-4 bg-slate-205 rounded w-1/4" />
                    </div>
                    {/* Skeleton 3 lines */}
                    <div className="space-y-3 pt-3">
                      <div className="h-4 bg-slate-100 rounded w-2/5 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-7 bg-slate-100 rounded w-full animate-pulse" />
                        <div className="h-7 bg-slate-100 rounded w-5/6 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-3 pt-2">
                      <div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-7 bg-slate-100 rounded-md w-24 animate-pulse" />
                        <div className="h-7 bg-slate-100 rounded-md w-32 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/65 text-center flex flex-col items-center justify-center gap-1 shadow-inner">
                    <span className="text-[10px] font-mono text-indigo-600 font-bold tracking-widest uppercase">LIVE AI TRANSCRIPTION SERVICE</span>
                    <p className="text-sm font-sans font-extrabold color-pulsing-text">Turning your work thought into PM English...</p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {generationError && !isGenerating && (
                <div className="bg-white rounded-2xl border border-red-200 p-8 text-center space-y-5 shadow-xs h-full min-h-[460px] flex flex-col justify-center items-center" id="generator-error-state">
                  <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h3 className="font-display font-extrabold text-slate-900 text-lg">AI Generation Failed</h3>
                    <p className="text-sm text-slate-500 font-sans leading-relaxed">
                      {generationError}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGenerate()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-mono font-bold transition-all mx-auto cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                    id="btn-retry-generation"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retry Generation</span>
                  </button>

                  <p className="text-[10px] text-slate-400 font-mono max-w-sm">
                    In mock mode, a local failover system is used automatically if the API key is not configured.
                  </p>
                </div>
              )}

              {/* Initial Normal state (Blank state prior to generation) */}
              {!isGenerating && !generationError && !latestGeneratedCue && (
                <div className="bg-white rounded-2xl border border-dashed border-indigo-250 p-12 text-center space-y-5 h-full min-h-[460px] flex flex-col justify-center items-center shadow-xs bg-gradient-to-br from-white to-slate-50/40 relative overflow-hidden" id="generator-initial-state">
                  <div className="absolute -right-20 -top-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-2xl" />
                  <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 animate-pulse">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h3 className="font-display font-bold text-slate-900 text-base tracking-tight leading-tight">Perfect expression, zero latency</h3>
                    <p className="text-xs text-slate-650 font-sans leading-relaxed">
                      Input your direct workspace point of view in Chinese on the left side, select a functional scenario, and click **Generate** to reveal its professional counterpart.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-lg border border-indigo-150">
                    🪄 Runs fully contextual PM English models
                  </div>
                </div>
              )}

              {/* Normal State: Output Successful Cue display */}
              {!isGenerating && !generationError && latestGeneratedCue && (
                <div className="bg-white rounded-2xl border border-indigo-150/90 p-6.5 space-y-6 flex flex-col justify-between h-full min-h-[460px] shadow-[0_12px_40px_rgba(99,102,241,0.06)] relative overflow-hidden vibrant-glow-card" id="generator-output-state">
                  
                  {/* Output Header */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-indigo-50 text-indigo-750 rounded-md border border-indigo-200/50">
                          {latestGeneratedCue.scenario}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">•</span>
                        <span className="text-[10px] font-mono text-indigo-600 uppercase font-extrabold flex items-center gap-1">
                          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Generated Cue
                        </span>
                      </div>
                      
                      {/* Pronounce link top right */}
                      <button
                        type="button"
                        onClick={() => handleSpeakExpression(latestGeneratedCue.englishOutput)}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-indigo-650 hover:text-indigo-850 hover:bg-indigo-50/50 rounded-md transition-all border border-indigo-100 cursor-pointer"
                        title="Listen pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Pronounce</span>
                      </button>
                    </div>

                    {/* Output Card Core Title */}
                    <div>
                      <h3 className="text-base font-display font-extrabold text-slate-900 leading-tight">
                        {latestGeneratedCue.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">Synthesized via professional guidelines</p>
                    </div>

                    {/* Core Generated Output */}
                    <div className="p-5.5 bg-gradient-to-br from-indigo-50/45 to-violet-50/20 rounded-xl border border-indigo-100/90 relative group shadow-inner">
                      <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest font-mono block mb-2">Work-Native Expression (专业地道口语)</span>
                      
                      <p className="text-slate-950 font-display font-extrabold text-[18px] leading-relaxed pr-10 text-slate-950 tracking-tight">
                        {latestGeneratedCue.englishOutput}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleDirectCopy(latestGeneratedCue.englishOutput)}
                        className="absolute right-4 top-4 p-2.5 rounded-lg bg-white hover:bg-slate-50 text-indigo-650 hover:text-indigo-805 shadow-sm transition-all border border-indigo-100 cursor-pointer"
                        title="Copy text of expression"
                        id="output-copy-pinnable"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Keywords Tagging */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Keyword Phrases (核心表达词块)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {latestGeneratedCue.phrases.map((ph, tagIdx) => (
                          <span
                            key={tagIdx}
                            className="bg-slate-50 text-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono font-bold border border-slate-200"
                          >
                            ⭐ {ph}
                          </span>
                        ))}
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Speaking prompt */}
                    <div className="space-y-1 bg-gradient-to-br from-violet-50/30 to-slate-50/50 p-4.5 rounded-xl border border-violet-100/40 shadow-xs">
                      <span className="text-[10px] font-bold text-indigo-750 uppercase tracking-widest font-mono block">Simulated Practice Prompt</span>
                      <p className="text-xs font-sans font-medium text-slate-700 italic leading-relaxed">
                        "{latestGeneratedCue.speakingPrompt}"
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 bg-slate-50/55 p-4 -mx-6.5 -mb-6.5 rounded-b-2xl">
                    <button
                      type="button"
                      onClick={() => openCueDetail(latestGeneratedCue)}
                      className="px-4 py-2.5 border border-slate-250 hover:bg-slate-100 text-slate-800 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer"
                      id="output-learn-more"
                    >
                      Open Full Trainer
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSave(latestGeneratedCue.id, "Saved to Cue Bank")}
                      className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                        cues.find((i) => i.id === latestGeneratedCue.id)?.isSaved
                          ? "bg-amber-50 text-amber-850 border border-amber-350"
                          : "bg-indigo-650 text-white hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                      }`}
                      id="output-save-bank"
                    >
                      {cues.find((i) => i.id === latestGeneratedCue.id)?.isSaved ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 text-amber-650" />
                          <span>Saved correctly</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4 text-white" />
                          <span>Save to Cue Bank</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
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
                📂 Total Cards: <strong className="text-sm font-sans">{savedCues.length} items</strong> saved in permanent local storage
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
