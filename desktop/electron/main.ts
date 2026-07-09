import { app, BrowserWindow, clipboard, globalShortcut, ipcMain, screen } from "electron";
import path from "node:path";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:3000";
const DEFAULT_SHORTCUT = "CommandOrControl+Shift+Space";

let companionWindow: BrowserWindow | null = null;

const getApiBaseUrl = () =>
  process.env.PM_CUE_API_BASE_URL || DEFAULT_API_BASE_URL;

const getRendererUrl = () => {
  if (process.env.PM_CUE_DESKTOP_DEV_URL) {
    return process.env.PM_CUE_DESKTOP_DEV_URL;
  }

  return `file://${path.join(__dirname, "../dist/index.html")}`;
};

const isAllowedRendererUrl = (targetUrl: string): boolean => {
  const rendererUrl = getRendererUrl();
  if (rendererUrl.startsWith("file://")) return targetUrl.startsWith("file://");
  return targetUrl.startsWith(rendererUrl);
};

const placeWindowBottomRight = (window: BrowserWindow) => {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;
  const windowBounds = window.getBounds();
  const x = Math.max(16, width - windowBounds.width - 24);
  const y = Math.max(16, height - windowBounds.height - 24);
  window.setPosition(x, y);
};

const createCompanionWindow = async () => {
  companionWindow = new BrowserWindow({
    width: 420,
    height: 560,
    frame: false,
    transparent: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    title: "PM Cue Companion",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  companionWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  companionWindow.webContents.on("will-navigate", (event, targetUrl) => {
    if (!isAllowedRendererUrl(targetUrl)) {
      event.preventDefault();
    }
  });

  companionWindow.setAlwaysOnTop(true, "floating");
  placeWindowBottomRight(companionWindow);

  await companionWindow.loadURL(getRendererUrl());
  companionWindow.show();

  companionWindow.on("closed", () => {
    companionWindow = null;
  });
};

const toggleCompanionWindow = async () => {
  if (!companionWindow) {
    await createCompanionWindow();
    return;
  }

  if (companionWindow.isVisible()) {
    companionWindow.hide();
  } else {
    placeWindowBottomRight(companionWindow);
    companionWindow.show();
    companionWindow.focus();
  }
};

app.whenReady().then(async () => {
  ipcMain.handle("clipboard:readText", () => clipboard.readText());
  ipcMain.handle("app:getConfig", () => ({
    apiBaseUrl: getApiBaseUrl(),
    shortcut: DEFAULT_SHORTCUT,
  }));
  ipcMain.handle("window:hide", () => companionWindow?.hide());

  globalShortcut.register(DEFAULT_SHORTCUT, () => {
    void toggleCompanionWindow();
  });

  await createCompanionWindow();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("activate", () => {
  if (!companionWindow) {
    void createCompanionWindow();
  } else {
    companionWindow.show();
  }
});
