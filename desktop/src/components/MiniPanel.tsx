import { Minus, Sparkles } from "lucide-react";
import CaptureInput from "./CaptureInput";
import DailyWorkCueCard from "./DailyWorkCueCard";
import GeneratedCueCard from "./GeneratedCueCard";
import type { DailyWorkCue, GenerateCueScenario, GeneratedCueItem } from "../types";

interface MiniPanelProps {
  apiBaseUrl: string;
  shortcut: string;
  dailyWorkCue: DailyWorkCue | null;
  dailyWorkCueError: string | null;
  input: string;
  scenario: GenerateCueScenario;
  isGenerating: boolean;
  generatedCue: GeneratedCueItem | null;
  generationError: string | null;
  onInputChange: (value: string) => void;
  onScenarioChange: (value: GenerateCueScenario) => void;
  onCaptureClipboard: () => void;
  onGenerate: () => void;
  onCopy: () => void;
  onSpeak: () => void;
  onHide: () => void;
}

export default function MiniPanel({
  apiBaseUrl,
  shortcut,
  dailyWorkCue,
  dailyWorkCueError,
  input,
  scenario,
  isGenerating,
  generatedCue,
  generationError,
  onInputChange,
  onScenarioChange,
  onCaptureClipboard,
  onGenerate,
  onCopy,
  onSpeak,
  onHide,
}: MiniPanelProps) {
  return (
    <main className="flex h-screen flex-col overflow-hidden rounded-xl border border-slate-200 bg-[#FAFBF9] text-slate-950 shadow-2xl">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold leading-none tracking-tight">PM Cue Mini</h1>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
              {shortcut}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onHide}
          className="rounded-md border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:text-slate-950"
          title="Hide companion"
        >
          <Minus className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
        <DailyWorkCueCard item={dailyWorkCue} error={dailyWorkCueError} />
        <CaptureInput
          value={input}
          scenario={scenario}
          isGenerating={isGenerating}
          onChange={onInputChange}
          onScenarioChange={onScenarioChange}
          onCaptureClipboard={onCaptureClipboard}
          onGenerate={onGenerate}
        />
        <GeneratedCueCard
          item={generatedCue}
          error={generationError}
          onCopy={onCopy}
          onSpeak={onSpeak}
        />
      </div>

      <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-2 text-[10px] leading-relaxed text-slate-500">
        API: {apiBaseUrl}. Capture is manual only; no screen or app monitoring.
      </footer>
    </main>
  );
}
