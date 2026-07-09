# PM Cue Desktop Companion

Lightweight Electron companion for Work Cue. It is a P1 desktop prototype that keeps capture manual: users can paste or read clipboard text, then call the existing PM Cue web API for work-native English suggestions.

## Local Development

Run the main web app first, because the desktop companion calls its API:

```bash
npm run dev
```

Then install and run the desktop package after dependency installation is approved:

```bash
cd desktop
pnpm install
pnpm run dev
pnpm run electron:dev
```

## Build

```bash
cd desktop
pnpm run build
pnpm run electron
```

## Configuration

- `PM_CUE_API_BASE_URL`: backend API base URL. Defaults to `http://127.0.0.1:3000`.
- `PM_CUE_DESKTOP_DEV_URL`: renderer dev URL. Used by `pnpm run electron:dev`.

## Safety Notes

- No screen monitoring is enabled.
- Clipboard capture is user-triggered only.
- Gemini API calls stay in the existing server/API layer.
- Do not commit local secrets or packaged desktop artifacts.
