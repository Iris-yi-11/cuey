import { CalendarClock } from "lucide-react";
import type { DailyWorkCue } from "../types";

interface DailyWorkCueCardProps {
  item: DailyWorkCue | null;
  error: string | null;
}

export default function DailyWorkCueCard({ item, error }: DailyWorkCueCardProps) {
  if (error) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        {error}
      </section>
    );
  }

  if (!item) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
        Loading today's Work Cue...
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-md bg-slate-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Daily Work Cue
        </span>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500">
          {item.scenario}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-slate-600">{item.chinesePrompt}</p>
      <p className="text-sm font-extrabold leading-snug text-slate-950">"{item.englishCue}"</p>
      <div className="flex flex-wrap gap-1.5">
        {item.phrases.map((phrase) => (
          <span
            key={phrase}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
          >
            {phrase}
          </span>
        ))}
      </div>
      <div className="flex items-start gap-1.5 border-t border-slate-100 pt-2 text-[10px] leading-relaxed text-slate-500">
        <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{item.reminderText} Next: {new Date(item.nextRefreshAt).toLocaleString()}</span>
      </div>
    </section>
  );
}
