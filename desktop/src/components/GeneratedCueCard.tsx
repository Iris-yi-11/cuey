import { Copy, Volume2 } from "lucide-react";
import type { GeneratedCueItem } from "../types";

interface GeneratedCueCardProps {
  item: GeneratedCueItem | null;
  error: string | null;
  onCopy: () => void;
  onSpeak: () => void;
}

export default function GeneratedCueCard({
  item,
  error,
  onCopy,
  onSpeak,
}: GeneratedCueCardProps) {
  if (error) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs leading-relaxed text-red-700">
        {error}
      </section>
    );
  }

  if (!item) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-xs leading-relaxed text-slate-500">
        捕捉一段工作想法后，PM Cue 会在这里生成 work-native English。
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Generated
        </span>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500">
          {item.scenario}
        </span>
      </div>
      <h3 className="text-sm font-extrabold text-slate-950">{item.title}</h3>
      <p className="text-sm font-bold leading-relaxed text-slate-900">"{item.englishOutput}"</p>
      <div className="flex flex-wrap gap-1.5">
        {item.phrases.slice(0, 3).map((phrase) => (
          <span
            key={phrase}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600"
          >
            {phrase}
          </span>
        ))}
      </div>
      <div className="flex gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onSpeak}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          <Volume2 className="h-3.5 w-3.5" />
          Listen
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>
    </section>
  );
}
