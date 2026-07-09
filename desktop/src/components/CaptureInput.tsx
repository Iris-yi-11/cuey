import { Clipboard, Sparkles } from "lucide-react";
import { GENERATE_CUE_SCENARIOS, type GenerateCueScenario } from "../types";

interface CaptureInputProps {
  value: string;
  scenario: GenerateCueScenario;
  isGenerating: boolean;
  onChange: (value: string) => void;
  onScenarioChange: (value: GenerateCueScenario) => void;
  onCaptureClipboard: () => void;
  onGenerate: () => void;
}

export default function CaptureInput({
  value,
  scenario,
  isGenerating,
  onChange,
  onScenarioChange,
  onCaptureClipboard,
  onGenerate,
}: CaptureInputProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Capture PM Thought
        </span>
        <button
          type="button"
          onClick={onCaptureClipboard}
          disabled={isGenerating}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600 hover:border-slate-400 hover:text-slate-950 disabled:opacity-50"
        >
          <Clipboard className="h-3.5 w-3.5" />
          Clipboard
        </button>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={isGenerating}
        rows={4}
        placeholder="粘贴一句真实工作想法，例如：这个方案可以先小范围试点，不要一开始做成完整平台..."
        className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-900 outline-none transition focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
      />

      <div className="grid grid-cols-3 gap-1.5">
        {GENERATE_CUE_SCENARIOS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onScenarioChange(item)}
            disabled={isGenerating}
            className={`rounded-md border px-2 py-1.5 text-[10px] font-bold transition disabled:opacity-50 ${
              scenario === item
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
            }`}
          >
            {item === "Stakeholder Update" ? "Stakeholder" : item}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating || !value.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Sparkles className="h-4 w-4" />
        {isGenerating ? "Generating..." : "Generate Work Cue"}
      </button>
    </section>
  );
}
