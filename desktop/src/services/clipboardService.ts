export const readClipboardText = async (): Promise<string> => {
  if (!window.pmCueDesktop) {
    throw new Error("Desktop bridge is unavailable.");
  }

  const text = await window.pmCueDesktop.readClipboardText();
  return text.trim();
};
