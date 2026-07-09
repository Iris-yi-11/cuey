/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from "react";
import {
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Clipboard,
  Copy,
  RotateCcw,
  Sparkles,
  Volume2,
  Zap,
} from "lucide-react";
import { GENERATE_CUE_SCENARIOS } from "../types";
import type { CueItem, DailyWorkCue, GenerateCueScenario } from "../types";

interface WorkCuePanelProps {
  dailyWorkCue: DailyWorkCue | null;
  dailyWorkCueError: string | null;
  chineseInput: string;
  scenario: GenerateCueScenario;
  isGenerating: boolean;
  generationError: string | null;
  latestGeneratedCue: CueItem | null;
  isLatestGeneratedCueSaved: boolean;
  onChineseInputChange: (value: string) => void;
  onScenarioChange: (scenario: GenerateCueScenario) => void;
  onCaptureClipboard: () => void;
  onGenerate: (event?: React.FormEvent) => void;
  onSpeakExpression: (text: string) => void;
  onDirectCopy: (text: string) => void;
  onOpenCueDetail: (cue: CueItem) => void;
  onSaveGeneratedCue: (id: string) => void;
}

export default function WorkCuePanel({
  dailyWorkCue,
  dailyWorkCueError,
  chineseInput,
  scenario,
  isGenerating,
  generationError,
  latestGeneratedCue,
  isLatestGeneratedCueSaved,
  onChineseInputChange,
  onScenarioChange,
  onCaptureClipboard,
  onGenerate,
  onSpeakExpression,
  onDirectCopy,
  onOpenCueDetail,
  onSaveGeneratedCue,
}: WorkCuePanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="work-view-container">
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5.5 h-5.5 text-slate-900 fill-amber-100" />
            Instant PM Thought Converter
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            每日提示 + 真实工作片段 capture，转成 work-native PM English。
          </p>
        </div>

        {dailyWorkCue && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-mono uppercase bg-slate-950 text-white border border-slate-900 px-2.5 py-1 rounded-md font-extrabold tracking-wider">
                Daily Work Cue
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
                {dailyWorkCue.scenario}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{dailyWorkCue.chinesePrompt}</p>
            <p className="text-base font-display font-extrabold leading-snug text-slate-950">
              “{dailyWorkCue.englishCue}”
            </p>
            <div className="flex flex-wrap gap-1.5">
              {dailyWorkCue.phrases.map((phrase) => (
                <span
                  key={phrase}
                  className="text-[10px] font-mono font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5"
                >
                  {phrase}
                </span>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-500 leading-relaxed">
              {dailyWorkCue.reminderText} · Next refresh{" "}
              {new Date(dailyWorkCue.nextRefreshAt).toLocaleString()}
            </div>
          </div>
        )}

        {dailyWorkCueError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-xs font-sans flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{dailyWorkCueError}</span>
          </div>
        )}

        <form
          onSubmit={onGenerate}
          className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
          id="cue-generator-form"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 font-bold"
                htmlFor="chineseThought"
              >
                PM Thought in Chinese (中文思路)
              </label>
              <button
                type="button"
                onClick={onCaptureClipboard}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-600 hover:text-slate-950 bg-slate-50 border border-slate-200 hover:border-slate-400 px-2.5 py-1 rounded-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Capture from Clipboard</span>
              </button>
            </div>
            <textarea
              id="chineseThought"
              value={chineseInput}
              onChange={(event) => onChineseInputChange(event.target.value)}
              placeholder="e.g. 这个需求其实没那么急，不用现在塞进去，免得打乱当前的计划..."
              className="w-full min-h-[140px] px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 text-sm font-sans transition-all leading-relaxed placeholder:text-slate-400 outline-none"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block font-bold">
              Choose Targeted Scenario (应用场景)
            </label>
            <div className="grid grid-cols-3 gap-2" id="scenario-selector-grid">
              {GENERATE_CUE_SCENARIOS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onScenarioChange(tag)}
                  className={`px-3 py-3 rounded-xl text-xs font-mono font-extrabold text-center border transition-all cursor-pointer ${
                    scenario === tag
                      ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-950 hover:border-slate-400"
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

          <button
            type="submit"
            disabled={isGenerating || !chineseInput.trim()}
            className={`w-full py-4 px-4 rounded-xl text-xs font-mono font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              !chineseInput.trim()
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50"
                : isGenerating
                ? "bg-indigo-600 text-white border border-transparent cursor-wait animate-pulse"
                : "bg-slate-950 text-white hover:bg-slate-800 hover:shadow-[0_4px_20px_rgba(15,23,42,0.16)]"
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

        <div className="bg-indigo-50/50 border border-indigo-150 p-4.5 rounded-2xl text-xs text-slate-650 font-sans space-y-1.5 shadow-[0_4px_12px_rgba(99,102,241,0.01)]">
          <span className="font-mono font-extrabold block text-indigo-900 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            💡 Dynamic Cue Tip:
          </span>
          <p className="leading-relaxed">
            Slightly explain safety limits, parameters, resources, or timing in your Chinese thought to
            prompt the model into creating Silicon Valley style expressions containing terms like
            **"critical path"**, **"safeguard deliverables"**, or **"onboarding latency"**.
          </p>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col justify-start">
        {isGenerating && (
          <div
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 h-full min-h-[460px] flex flex-col justify-between shadow-xs"
            id="generator-skeleton-state"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 animate-pulse">
                <div className="w-4 h-4 bg-slate-200 rounded" />
                <div className="h-4 bg-slate-205 rounded w-1/4" />
              </div>
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
              <span className="text-[10px] font-mono text-indigo-600 font-bold tracking-widest uppercase">
                LIVE AI TRANSCRIPTION SERVICE
              </span>
              <p className="text-sm font-sans font-extrabold color-pulsing-text">
                Turning your work thought into PM English...
              </p>
            </div>
          </div>
        )}

        {generationError && !isGenerating && (
          <div
            className="bg-white rounded-2xl border border-red-200 p-8 text-center space-y-5 shadow-xs h-full min-h-[460px] flex flex-col justify-center items-center"
            id="generator-error-state"
          >
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="font-display font-extrabold text-slate-900 text-lg">
                AI Generation Failed
              </h3>
              <p className="text-sm text-slate-500 font-sans leading-relaxed">{generationError}</p>
            </div>
            <button
              type="button"
              onClick={() => onGenerate()}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-mono font-bold transition-all mx-auto cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
              id="btn-retry-generation"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Generation</span>
            </button>

            <p className="text-[10px] text-slate-400 font-mono max-w-sm">
              Work Cue generation now requires a reachable Gemini API path. No mock AI fallback is
              used in this build.
            </p>
          </div>
        )}

        {!isGenerating && !generationError && !latestGeneratedCue && (
          <div
            className="bg-white rounded-2xl border border-dashed border-indigo-250 p-12 text-center space-y-5 h-full min-h-[460px] flex flex-col justify-center items-center shadow-xs bg-gradient-to-br from-white to-slate-50/40 relative overflow-hidden"
            id="generator-initial-state"
          >
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-2xl" />
            <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="font-display font-bold text-slate-900 text-base tracking-tight leading-tight">
                Perfect expression, zero latency
              </h3>
              <p className="text-xs text-slate-650 font-sans leading-relaxed">
                Input your direct workspace point of view in Chinese on the left side, select a
                functional scenario, and click **Generate** to reveal its professional counterpart.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-lg border border-indigo-150">
              🪄 Runs fully contextual PM English models
            </div>
          </div>
        )}

        {!isGenerating && !generationError && latestGeneratedCue && (
          <div
            className="bg-white rounded-2xl border border-indigo-150/90 p-6.5 space-y-6 flex flex-col justify-between h-full min-h-[460px] shadow-[0_12px_40px_rgba(99,102,241,0.06)] relative overflow-hidden vibrant-glow-card"
            id="generator-output-state"
          >
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

                <button
                  type="button"
                  onClick={() => onSpeakExpression(latestGeneratedCue.englishOutput)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-indigo-650 hover:text-indigo-850 hover:bg-indigo-50/50 rounded-md transition-all border border-indigo-100 cursor-pointer"
                  title="Listen pronunciation"
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Pronounce</span>
                </button>
              </div>

              <div>
                <h3 className="text-base font-display font-extrabold text-slate-900 leading-tight">
                  {latestGeneratedCue.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Synthesized via professional guidelines
                </p>
              </div>

              <div className="p-5.5 bg-gradient-to-br from-indigo-50/45 to-violet-50/20 rounded-xl border border-indigo-100/90 relative group shadow-inner">
                <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest font-mono block mb-2">
                  Work-Native Expression (专业地道口语)
                </span>

                <p className="text-slate-950 font-display font-extrabold text-[18px] leading-relaxed pr-10 text-slate-950 tracking-tight">
                  {latestGeneratedCue.englishOutput}
                </p>

                <button
                  type="button"
                  onClick={() => onDirectCopy(latestGeneratedCue.englishOutput)}
                  className="absolute right-4 top-4 p-2.5 rounded-lg bg-white hover:bg-slate-50 text-indigo-650 hover:text-indigo-805 shadow-sm transition-all border border-indigo-100 cursor-pointer"
                  title="Copy text of expression"
                  id="output-copy-pinnable"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                  Keyword Phrases (核心表达词块)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {latestGeneratedCue.phrases.map((phrase, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-slate-50 text-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono font-bold border border-slate-200"
                    >
                      ⭐ {phrase}
                    </span>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-1 bg-gradient-to-br from-violet-50/30 to-slate-50/50 p-4.5 rounded-xl border border-violet-100/40 shadow-xs">
                <span className="text-[10px] font-bold text-indigo-750 uppercase tracking-widest font-mono block">
                  Simulated Practice Prompt
                </span>
                <p className="text-xs font-sans font-medium text-slate-700 italic leading-relaxed">
                  "{latestGeneratedCue.speakingPrompt}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 bg-slate-50/55 p-4 -mx-6.5 -mb-6.5 rounded-b-2xl">
              <button
                type="button"
                onClick={() => onOpenCueDetail(latestGeneratedCue)}
                className="px-4 py-2.5 border border-slate-250 hover:bg-slate-100 text-slate-800 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer"
                id="output-learn-more"
              >
                Open Full Trainer
              </button>

              <button
                type="button"
                onClick={() => onSaveGeneratedCue(latestGeneratedCue.id)}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  isLatestGeneratedCueSaved
                    ? "bg-amber-50 text-amber-850 border border-amber-350"
                    : "bg-indigo-650 text-white hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                }`}
                id="output-save-bank"
              >
                {isLatestGeneratedCueSaved ? (
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
  );
}
