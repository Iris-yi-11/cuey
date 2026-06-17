/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import type { CueItem } from "../types";
import { 
  X, 
  Copy, 
  Check, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  HelpCircle,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CueDetailModalProps {
  item: CueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSave: (id: string) => void;
  onToggleDone: (id: string) => void;
  showToast: (message: string) => void;
}

export default function CueDetailModal({
  item,
  isOpen,
  onClose,
  onToggleSave,
  onToggleDone,
  showToast,
}: CueDetailModalProps) {
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.englishOutput);
    setCopied(true);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Speaks aloud using window.speechSynthesis (optional nice-to-have, robust check)
  const handleTTS = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.englishOutput);
      utterance.lang = "en-US";
      // Pick a natural speaking rate
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      showToast("Speaking PM Cue expression...");
    } else {
      showToast("TTS not supported in this browser.");
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 shadow-2xl"
        id="cue-modal-overlay"
      >
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
          id="cue-modal-backdrop"
        />

        {/* Modal Outer Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-[0_24px_50px_rgba(99,102,241,0.12)] overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
          id="cue-modal-wrapper"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold tracking-wide uppercase px-2.5 py-0.5 bg-indigo-50 text-indigo-750 rounded-md border border-indigo-200/50">
                {item.scenario}
              </span>
              <span className="text-xs font-mono text-slate-400">•</span>
              <span className="text-xs font-mono text-indigo-600 uppercase font-bold">
                {item.sourceType === "daily" ? "Daily Cue" : "Work Generation"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
              id="close-modal-x"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content (Scrollable) */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900 scrollbar-none">
            {/* Title / Heading */}
            <div>
              <h2 className="text-xl md:text-2xl font-display font-extrabold text-slate-900 tracking-tight leading-snug">
                {item.title}
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Core Chinese Thought Section */}
            <div className="p-4.5 bg-slate-50/75 rounded-xl border border-slate-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-1.5 font-bold">
                Chinese PM Thought - 中文语境
              </span>
              <p className="text-slate-750 font-sans text-base leading-relaxed italic">
                "{item.chineseExplanation}"
              </p>
            </div>

            {/* Core English Output Section */}
            <div className="relative p-6 bg-gradient-to-br from-indigo-50/45 to-violet-50/20 rounded-xl border border-indigo-150 relative group shadow-inner">
              <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest font-mono block mb-2 font-bold">
                Work-Native PM English - 专业地道表达
              </span>
              
              <p className="text-slate-950 font-display font-extrabold text-[19px] md:text-[21px] leading-relaxed pr-10 tracking-tight">
                {item.englishOutput}
              </p>

              {/* Float buttons in block */}
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTTS}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-indigo-650 hover:text-indigo-850 transition-colors border border-indigo-100 rounded-lg bg-white shadow-xs hover:bg-indigo-50/50 cursor-pointer"
                  title="Listen to English pronunciation"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Pronounce</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-extrabold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.2)] transition-all cursor-pointer shadow-xs"
                  id="modal-copy-btn"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Expression</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Keyword Phrases Badges Section */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-2.5 font-bold">
                Key Professional Phrases - 核心高频词块 (Max 3)
              </span>
              <div className="flex flex-wrap gap-2">
                {item.phrases.map((phrase, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-indigo-50/20 text-indigo-950 rounded-lg text-xs font-mono font-bold border border-indigo-150"
                  >
                    🚀 {phrase}
                  </span>
                ))}
                {item.phrases.length === 0 && (
                  <span className="text-xs text-slate-400 italic font-mono">No specific phrase tags provided.</span>
                )}
              </div>
            </div>

            {/* Speaking Practice Prompt / Interaction Section */}
            <div className="border border-indigo-150 bg-gradient-to-br from-indigo-50/25 to-slate-50/40 rounded-xl p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-550" />
                <span className="text-[10px] font-bold text-indigo-750 uppercase tracking-widest font-mono font-extrabold">
                  Continuous Practice - 模拟开口练习
                </span>
              </div>
              <p className="text-slate-800 text-sm font-medium italic pl-1 leading-normal">
                "{item.speakingPrompt}"
              </p>

              {/* Expandable Sample Answer Section */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSampleOpen(!isSampleOpen)}
                  className="flex items-center justify-between w-full text-left text-xs font-mono text-slate-500 hover:text-indigo-650 transition-colors cursor-pointer"
                  id="modal-expand-sample"
                >
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold">View Sample Oral Answer - 推荐口语说法</span>
                  </span>
                  {isSampleOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <AnimatePresence>
                  {isSampleOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-slate-600 text-sm leading-relaxed pl-5 pr-2 py-2.5 bg-white/70 border-l-3 border-indigo-500 font-sans rounded-r-md shadow-inner">
                        {item.sampleAnswer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4.5 border-t border-slate-105 bg-slate-50/80 gap-3">
            <div className="flex gap-2">
              {/* Bookmark Toggle */}
              <button
                type="button"
                onClick={() => {
                  onToggleSave(item.id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-extrabold border transition-all cursor-pointer ${
                  item.isSaved
                    ? "bg-amber-50 text-amber-850 border-amber-300 hover:bg-amber-100 shadow-sm"
                    : "bg-white text-slate-650 border-slate-205 hover:bg-slate-50 hover:text-slate-800"
                }`}
                id="modal-save-toggle"
              >
                {item.isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-amber-605" />
                    <span>Saved in Bank</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Save to Bank</span>
                  </>
                )}
              </button>

              {/* Complete / Unfinished Toggle */}
              <button
                type="button"
                onClick={() => {
                  onToggleDone(item.id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-extrabold border transition-all cursor-pointer ${
                  item.isDone
                    ? "bg-emerald-50 text-emerald-800 border-emerald-250 hover:bg-emerald-105 shadow-sm"
                    : "bg-white text-slate-650 border-slate-205 hover:bg-slate-50 hover:text-slate-800"
                }`}
                id="modal-done-toggle"
              >
                <CheckCircle className={`w-4 h-4 ${item.isDone ? "text-emerald-600 fill-emerald-50" : ""}`} />
                <span>{item.isDone ? "Completed Practice" : "Mark Practiced"}</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-mono font-extrabold bg-slate-900 text-white rounded-xl hover:bg-slate-950 transition-colors shadow-xs cursor-pointer"
              id="modal-dismiss-btn"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
