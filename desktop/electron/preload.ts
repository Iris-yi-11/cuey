import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("pmCueDesktop", {
  readClipboardText: () => ipcRenderer.invoke("clipboard:readText"),
  getConfig: () => ipcRenderer.invoke("app:getConfig"),
  hideWindow: () => ipcRenderer.invoke("window:hide"),
});
