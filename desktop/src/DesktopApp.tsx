import { useEffect, useState } from "react";
import MiniPanel from "./components/MiniPanel";
import { generateDesktopCue, fetchDailyWorkCue } from "./services/desktopApi";
import { readClipboardText } from "./services/clipboardService";
import { loadDesktopConfig } from "./services/settingsService";
import type {
  DailyWorkCue,
  DesktopConfig,
  GeneratedCueItem,
  GenerateCueScenario,
} from "./types";

const fallbackConfig: DesktopConfig = {
  apiBaseUrl: "http://127.0.0.1:3000",
  shortcut: "CommandOrControl+Shift+Space",
};

export default function DesktopApp() {
  const [config, setConfig] = useState<DesktopConfig>(fallbackConfig);
  const [dailyWorkCue, setDailyWorkCue] = useState<DailyWorkCue | null>(null);
  const [dailyWorkCueError, setDailyWorkCueError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [scenario, setScenario] = useState<GenerateCueScenario>("Meeting");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCue, setGeneratedCue] = useState<GeneratedCueItem | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const nextConfig = await loadDesktopConfig();
      if (!isMounted) return;

      setConfig(nextConfig);
      const dailyResponse = await fetchDailyWorkCue(nextConfig.apiBaseUrl);
      if (!isMounted) return;

      if (dailyResponse.success && dailyResponse.item) {
        setDailyWorkCue(dailyResponse.item);
      } else {
        setDailyWorkCueError(dailyResponse.error || "Unable to load Daily Work Cue.");
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCaptureClipboard = async () => {
    try {
      const text = await readClipboardText();
      if (!text) {
        setGenerationError("Clipboard is empty. Copy a work thought first, or type manually.");
        return;
      }

      setGenerationError(null);
      setInput(text);
    } catch (error: any) {
      setGenerationError(error.message || "Clipboard capture failed.");
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedCue(null);

    const response = await generateDesktopCue(config.apiBaseUrl, input.trim(), scenario);

    if (response.success && response.item) {
      setGeneratedCue(response.item);
    } else {
      setGenerationError(response.error || "Generation failed.");
    }

    setIsGenerating(false);
  };

  const handleCopy = async () => {
    if (!generatedCue) return;
    await navigator.clipboard.writeText(generatedCue.englishOutput);
  };

  const handleSpeak = () => {
    if (!generatedCue || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(generatedCue.englishOutput);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleHide = async () => {
    await window.pmCueDesktop?.hideWindow();
  };

  return (
    <MiniPanel
      apiBaseUrl={config.apiBaseUrl}
      shortcut={config.shortcut}
      dailyWorkCue={dailyWorkCue}
      dailyWorkCueError={dailyWorkCueError}
      input={input}
      scenario={scenario}
      isGenerating={isGenerating}
      generatedCue={generatedCue}
      generationError={generationError}
      onInputChange={setInput}
      onScenarioChange={setScenario}
      onCaptureClipboard={handleCaptureClipboard}
      onGenerate={handleGenerate}
      onCopy={handleCopy}
      onSpeak={handleSpeak}
      onHide={handleHide}
    />
  );
}
