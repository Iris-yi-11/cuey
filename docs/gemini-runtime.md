# Gemini Runtime Verification

Date: 2026-06-17

## Runtime Boundary

- Client entry point: `src/services/aiService.ts`
- Server endpoint: `POST /api/generate`
- Server implementation: `server.ts`
- SDK: `@google/genai`
- Current model: `gemini-3.5-flash`
- Required secret: `GEMINI_API_KEY`

## Environment Loading

The server loads local secrets from:

1. `.env.local`
2. `.env`

Real secrets must never be committed. Use deployment platform secret management for production.

## Model Verification

Google's official Gemini API models page lists Gemini 3.5 Flash as stable and gives `gemini-3.5-flash` as a stable model string example. The page was last updated on 2026-06-15 UTC.

Official source: https://ai.google.dev/gemini-api/docs/models

## Verified Paths

### Missing Key / Mock Path

Condition:

- No `.env.local`
- No `.env`
- No valid `GEMINI_API_KEY`

Expected behavior:

- Server logs offline/mock mode.
- `POST /api/generate` returns `success: true` with generated mock `item`.

Status: Verified.

### Invalid Scenario

Condition:

- `scenario` is not one of `Meeting`, `PRD Review`, `Stakeholder Update`

Expected behavior:

- `POST /api/generate` returns `400 Bad Request`.
- Response body includes `success: false`.

Status: Verified.

### Real Gemini Path

Condition:

- `GEMINI_API_KEY` is configured with a non-placeholder value.
- Mock mode is not forced.

Expected behavior:

- Server initializes `GoogleGenAI`.
- `/api/generate` calls `ai.models.generateContent`.
- Successful response is normalized into `GeneratedCueItem`.
- Gemini errors return `500` with `success: false`.

Status: Verified with a real key and reachable provider network through local proxy `127.0.0.1:7897`. Server initialized `GoogleGenAI`, entered the `[Gemini API]` branch, and returned `200` with `success: true`.

Observed real-key response shape:

```json
{
  "success": true,
  "item": {
    "sourceType": "work",
    "cueType": "ai_product",
    "scenario": "Meeting"
  }
}
```

The generated response included `title`, `chineseExplanation`, `englishOutput`, `phrases`, `speakingPrompt`, `sampleAnswer`, and `createdAt`.

## Manual Test Commands

Start local server:

```bash
pnpm run dev
```

Mock generation:

```bash
curl -i -X POST http://127.0.0.1:3000/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"chineseThought":"这个需求没那么急，可以放到下个版本","scenario":"Meeting"}'
```

Invalid scenario:

```bash
curl -i -X POST http://127.0.0.1:3000/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"chineseThought":"测试非法场景","scenario":"Invalid"}'
```

Real Gemini path:

```bash
GEMINI_API_KEY="your-real-key" pnpm run dev
```

Then run the same mock generation request and confirm the response content is produced through Gemini, not offline fallback.

If direct Google/Gemini access times out on the local network, use the local proxy discovered during verification:

```bash
HTTPS_PROXY=http://127.0.0.1:7897 \
https_proxy=http://127.0.0.1:7897 \
NODE_OPTIONS=--use-env-proxy \
pnpm run dev
```
