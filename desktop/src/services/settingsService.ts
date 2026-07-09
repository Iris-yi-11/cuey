import type { DesktopConfig } from "../types";

const defaultConfig: DesktopConfig = {
  apiBaseUrl: "http://127.0.0.1:3000",
  shortcut: "CommandOrControl+Shift+Space",
};

export const loadDesktopConfig = async (): Promise<DesktopConfig> => {
  if (!window.pmCueDesktop) return defaultConfig;

  try {
    return await window.pmCueDesktop.getConfig();
  } catch {
    return defaultConfig;
  }
};
