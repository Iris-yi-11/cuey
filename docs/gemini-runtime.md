# Gemini Runtime Verification

Date: 2026-06-17

## Runtime Boundary

- Client entry point: `src/services/aiService.ts`
- Server endpoint: `POST /api/generate`
- Server implementation: `server.ts`
- SDK: `@google/genai`
- Default model candidates: `gemini-2.5-flash`, `gemini-3.1-flash-lite`, `gemini-3.5-flash`, `gemini-2.5-flash-lite`
- Optional override: `GEMINI_MODEL` can provide one or more comma-separated real Gemini model names.
- Required secret: `GEMINI_API_KEY`

## Environment Loading

The server loads local secrets from:

1. `.env.local`
2. `.env`

Real secrets must never be committed. Use deployment platform secret management for production.

## Model Verification

The app uses real Gemini model routing only for Work Cue generation. It tries configured model candidates in order and does not return mock AI output when Gemini is missing or unavailable.

Official source: https://ai.google.dev/gemini-api/docs/models

## Verified Paths

### Missing Key

Condition:

- No `.env.local`
- No `.env`
- No valid `GEMINI_API_KEY`

Expected behavior:

- Server logs that no valid `GEMINI_API_KEY` is configured.
- `POST /api/generate` returns `success: false`.

Status: Verified by automated test in `src/services/geminiCueService.test.ts`.

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
- `GEMINI_MODEL` is either unset or configured with real Gemini model names.

Expected behavior:

- Server calls `ai.models.generateContent`.
- `/api/generate` calls `ai.models.generateContent`.
- Successful response is normalized into `GeneratedCueItem`.
- Gemini errors return `500` with `success: false`; no mock item is returned.

Status: Verified on 2026-07-07. Server initialized the real Gemini path. With no proxy, the provider request timed out on the current local network. With `HTTPS_PROXY=http://127.0.0.1:7897` and `NODE_OPTIONS=--use-env-proxy`, `/api/generate` returned `success: true` with `modelUsed: "gemini-2.5-flash"`.

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

Then run the same generation request and confirm the response includes `success: true`, a generated `item`, and `modelUsed`.

If direct Google/Gemini access times out on the local network, use the local proxy discovered during verification:

```bash
HTTPS_PROXY=http://127.0.0.1:7897 \
https_proxy=http://127.0.0.1:7897 \
NODE_OPTIONS=--use-env-proxy \
pnpm run dev
```
