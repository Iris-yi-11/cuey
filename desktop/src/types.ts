export const GENERATE_CUE_SCENARIOS = [
  "Meeting",
  "PRD Review",
  "Stakeholder Update",
] as const;

export type GenerateCueScenario = (typeof GENERATE_CUE_SCENARIOS)[number];

export interface GeneratedCueItem {
  id: string;
  sourceType: "work";
  cueType: "ai_product";
  title: string;
  chineseExplanation: string;
  englishOutput: string;
  phrases: string[];
  scenario: GenerateCueScenario;
  speakingPrompt: string;
  sampleAnswer: string;
  createdAt: string;
}

export interface GenerateCueResponse {
  success: boolean;
  item?: GeneratedCueItem;
  error?: string;
}

export interface DailyWorkCue {
  id: string;
  date: string;
  scenario: GenerateCueScenario;
  chinesePrompt: string;
  englishCue: string;
  phrases: string[];
  reminderText: string;
  createdAt: string;
  nextRefreshAt: string;
}

export interface DailyWorkCueResponse {
  success: boolean;
  item?: DailyWorkCue;
  error?: string;
}

export interface DesktopConfig {
  apiBaseUrl: string;
  shortcut: string;
}

export interface PMCueDesktopBridge {
  readClipboardText: () => Promise<string>;
  getConfig: () => Promise<DesktopConfig>;
  hideWindow: () => Promise<void>;
}

declare global {
  interface Window {
    pmCueDesktop?: PMCueDesktopBridge;
  }
}
