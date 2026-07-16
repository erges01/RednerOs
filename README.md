# Redner Studio (Web)

Redner Studio is a web‑first, AI‑native creative IDE for content creators. Think **"Cursor for Content Creation"**: a professional workspace that treats a timeline like an AST and allows specialized tools (and eventually agents) to manipulate projects, assets, and timeline state in a structured way.

This repository contains the **browser‑first MVP**: a dark IDE‑style interface with project management, local persistence, asset ingestion, and a rich timeline/editor foundation.

---

## ✨ What’s Live Today

### Core (Phase 1)
- **Full‑screen IDE layout** (VS Code‑inspired)
- **Projects & assets** stored locally (IndexedDB)
- **Asset ingestion** via File API (`URL.createObjectURL`)
- **Project switching + persistence** across refreshes
- **Timeline editor foundation** (tracks, clips, drag/resize)
- **Preview stage** (video/image/audio playback)

### Experimental / Future‑Facing (Already Scaffolded)
> These are in the codebase but not required for Phase 1.
- **AI chat panel + command review pipeline** (requires backend)
- **Creative interview + blueprint compiler**
- **Creator identity profiles (personas, brand/voice presets)**
- **Performance Studio (director clips + behavior profiles)**

---

## 🧱 Tech Stack

- **React + TypeScript + Vite**
- **TailwindCSS** (dark IDE styling)
- **Zustand** (global state)
- **IndexedDB** (local projects + media vault)
- **Lucide React** (icons)

---

## 🗂️ Project Structure (High Level)

```
src/
  features/
    workspace/     # Timeline editor, preview, layout shell
    ai/            # AI chat + command review (experimental)
    intelligence/  # Interview → blueprint → timeline compiler
    creator/       # Persona + brand/voice identity system
    performance/   # Performance Studio (director track)
  stores/
    projectStore.ts
  utils/
    storage.ts     # IndexedDB project metadata
  lib/
    mediaVault.ts  # IndexedDB media blobs
  types/
    index.ts       # Project + Asset models
```

---

## 🧠 Local Persistence Architecture

### 1) Project Metadata (IndexedDB)
- **DB:** `RednerStudioDB`
- **Store:** `projects`
- Saves project JSON (name, timestamps, assets, timeline metadata)

### 2) Media Vault (IndexedDB)
- **DB:** `RednerMediaVault`
- **Store:** `media_blobs`
- Saves the **raw file blobs** for each asset
- Asset metadata includes a `vaultKey` to rehydrate blobs later

### 3) Session Memory
- `localStorage` remembers the last opened project
- Creator profiles / preferences are persisted via Zustand

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open the URL from Vite (default: `http://localhost:5173`).

---

## ✅ Usage (Phase 1 Core Flow)

1. **Boot the app**
2. **Create a project** (toolbar or Explorer panel)
3. **Import assets** into the Asset Bin
4. **Select assets** to view details in the Inspector
5. **Drag assets** to the timeline (if timeline editor is active)
6. **Preview playback** from the Preview Stage

---

## 🔌 Backend Notes (Optional)

The UI contains optional integrations for AI/chat and timeline autosave:

- `/api/projects` — project creation
- `/api/projects/:id/editor` — editor hydrate
- `/api/projects/:id/timeline` — autosave
- `/api/ai/*` — AI chat / copilot

These endpoints are **not required** for Phase 1, but the UI will call them if enabled.

---

## 📌 Scripts

```bash
npm run dev      # Start local dev server
npm run build    # Type-check + build
npm run lint     # Lint
npm run preview  # Preview production build
```

---

## 🧭 Roadmap (High Level)

- **Phase 1:** Local IDE foundation ✅
- **Phase 2:** Timeline AST + multi‑track sequencing
- **Phase 3:** AI agents (Script / Voice / Video)
- **Phase 4:** Collaboration + cloud‑sync

---

## 🖤 Design Goals

- Desktop‑grade UX in the browser
- Fast local persistence
- Modular architecture for AI‑native editing
- Familiar IDE mental model for creators

---

If you want, I can also add docs for API contracts, editor commands, or contributor setup.
