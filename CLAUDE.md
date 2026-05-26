# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Run Commands

```bash
npm start          # Start dev server (aiot start --watch)
npm run build      # Production build (aiot build)
npm run release    # Release build (aiot release)
npm run lint       # ESLint format + fix (src/ only)
```

The project uses **AIOT IDE** with `vela-pre4.0` emulator image. The entry page is `pages/index`.

All three commands (`start`, `build`, `release`) are thin wrappers around the `aiot` CLI. There are no unit tests.

## Architecture

This is a **Xiaomi Watch S3** AI chat app built on **Xiaomi Vela JS (vela-pre4.0)** — a deeply constrained JavaScript runtime for wearables. It calls DeepSeek / GLM APIs for AI chat, with local JSON storage for persistence.

### Critical Platform Constraints

1. **Callback-only JS**: `async/await`, `Promise`, and object spread (`...`) all break on pre4.0. All async code must use callback style with `function(){}.bind(this)`. If an entry page even statically imports a module chain that touches `@system.fetch` or `@system.storage` before first render, the page shows black/white screen with empty DevTools Elements. See ANGETS.md "Vela pre4.0 Debug Notes" for the full smoke-test recovery workflow.

2. **`@system.*` modules** are the only native APIs — import from `@system.fetch`, `@system.storage`, `@system.router`, `@system.prompt`, `@system.vibrator`, `@system.device`. No `XMLHttpRequest`, `WebSocket`, `SSE`, or standard browser APIs.

3. **Entry page MUST be `pages/index`** (no hyphenated paths like `chat-list` as entry) — the router config in `src/manifest.json` controls this.

4. **Single-file components (`.ux`)**: Each `.ux` file bundles `<template>` (HML markup), `<script>` (JS logic), and `<style>` (CSS) into one file. No separate `.hml`/`.js`/`.css` files.

5. **Design targets**: Circular screen 480px (`screentype="circle"`), rectangular 336px (`screentype="rect"`), pill-shaped 192px (`screentype="pill-shaped"`). All UI must leave safe margins around edges for circular screens.

### Source Layout

```
src/
├── app.ux                    # App entry (minimal: just onCreate/onDestroy logs)
├── manifest.json             # Package config, feature declarations, route table
├── pages/
│   ├── index/                # Chat list (standalone — no service imports, pre4.0-safe entry)
│   ├── chat-list/            # Chat list (alternative, uses services/chat.js)
│   ├── chat/                 # Chat page (messages + custom keyboard + API calls)
│   ├── settings/             # Settings menu (API, Model, About)
│   ├── settings-api/         # DeepSeek + GLM API key configuration
│   ├── settings-model/       # Provider toggle (DeepSeek vs GLM)
│   └── settings-about/       # About page
├── services/
│   ├── deepseek.js           # fetch POST to AI API (dual provider, reasoning fallback, timeout)
│   ├── storage.js            # getJson / writeJson wrappers around @system.storage
│   └── chat.js               # Chat CRUD: list/create/delete/get + append messages + list syncing
├── utils/
│   ├── constants.js          # Endpoints, model names, keys (from .env), max_tokens, timeouts, limits
│   ├── time.js               # now() and formatTime() helpers
│   └── uuid.js               # createId() — Math.random + Date.now based IDs
├── components/
│   ├── message-item/         # Chat bubble component
│   └── loading/              # Loading animation component
└── InputMethod/              # Custom QWERTY/T9 keyboard (Chinese + English, 3 screen types)
```

### Data Flow

```
User types → custom InputMethod keyboard
  → chat/index.ux sends via sendChatMessage() from services/deepseek.js
  → getApiConfig() reads MODE_PROVIDER + API key from @system.storage
  → fetch POST to DeepSeek/GLM endpoint (10s timeout, callback style)
  → parseResponse() extracts message.content || message.reasoning_content (GLM reasoning fallback)
  → replace loading placeholder with AI reply
  → saveChat() persists to local storage + syncs chat_list index
```

### AI Provider Routing

Two providers controlled via `STORAGE_KEYS.MODEL_PROVIDER` (settings-model page):

| Provider | Endpoint | Model | max_tokens |
|----------|----------|-------|------------|
| DeepSeek | `api.deepseek.com/chat/completions` | `deepseek-v4-flash` | 300 |
| GLM | `open.bigmodel.cn/api/paas/v4/chat/completions` | `glm-4.7` | 1024 |

GLM uses 1024 max_tokens because its reasoning models output a `reasoning_content` field that may be empty in `content`. The parser falls back: `message.content || message.reasoning_content`. Default API keys are loaded from `.env` (via `quickapp.config.js` → DefinePlugin) but users can override per-provider in the Settings > API page — custom keys are stored in `@system.storage`.

### Storage Model

`@system.storage` is key-value only. Keys used:
- `chat_list` — array of chat summaries (`{id, title, preview, updateTime}`)
- `chat_{id}` — full session object with `messages` array
- `current_chat_id` — session pointer for chat page
- `settings_api_key` / `settings_glm_api_key` — custom API keys
- `settings_model_provider` — `"deepseek"` or `"glm"`

Limits: 50 messages per chat (auto-trimmed), 200 chars per input, 10s request timeout (1 retry built in).

### Two Chat List Implementations

`pages/index/index.ux` implements storage inline (no imports from services) — this is the pre4.0-safe entry page. `pages/chat-list/index.ux` is a cleaner version that imports `services/chat.js`. The manifest routes both; the entry page (`pages/index`) is the one that works reliably on pre4.0.

### quickapp.config.js

Configures webpack/Rspack to target ES5 (`arrowFunction: false, const: false, ...`) and loads `.env` variables as `process.env.*` for injection into `constants.js`.
