# Forge Kanban Studio

A premium, Trello-style collaborative Kanban Board application built autonomously by a two-agent AI system (Hermes + OpenClaw) orchestrated through Slack.

**Live URL**: https://dist-7f3cr1pso-abhinav-dhawans-projects.vercel.app

> **Note**: The frontend is deployed on Vercel. The backend API runs locally (Laravel + SQLite). See run instructions below for full local setup.

---

## Core Features
1. **Boards → Lists → Cards**: Create boards with multiple lists (To-Do, In Progress, Done). Add cards and move them between lists.
2. **Card Details**: Each card has a title, description, and inline editing.
3. **Tags / Labels**: Add colored tags to cards (bug, design, feature, urgent, etc.) with label filtering.
4. **Assign Members**: Add team members and assign cards to them.
5. **Due Dates**: Set due dates on cards; overdue cards are visually flagged with red badges.
6. **Drag & Drop**: Move cards between columns using HTML5 drag-and-drop.
7. **Glassmorphic Dark Mode UI**: Premium design with backdrop blur, gradients, and smooth animations.

---

## Models Used & Routing Rationale

| Agent | Model | Why |
|-------|-------|-----|
| **Hermes** (Orchestrator / Brain) | Google `gemini-2.5-flash` | Large context window ideal for planning and task decomposition; strong reasoning; generous free tier via AI Studio |
| **OpenClaw** (Coder / Hands) | Ollama `qwen2.5-coder:7b` | Purpose-built for code generation; runs locally with zero rate limits; fast inference for rapid file writes |

**Routing strategy**: Stronger model (Gemini) for planning/reasoning, lighter coding-specific model (qwen2.5-coder) for execution — optimizes for speed and reliability with zero cost.

---

## How to Run Locally

### 1. Backend (Laravel API)
```bash
cd backend
composer install
cp .env.example .env        # Ensure DB_CONNECTION=sqlite
touch database/database.sqlite
php artisan migrate
php artisan serve --port=8000
```
API runs at: `http://localhost:8000/api`

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
App runs at: `http://localhost:5173`

### 3. Open the app
Navigate to `http://localhost:5173` in your browser. The board auto-creates on first load.

---

## Agent Setup

### Hermes (Orchestrator)
- Config: `hermes.config.json`
- Model: `gemini-2.5-flash` via Google AI Studio
- Memory: persistent local storage (`.hermes/memory/`)
- Skill: `skills/status-report/SKILL.md`
- Autonomous cron: posts progress updates to `#sprint-main`

### OpenClaw (Coder)
- Config: `openclaw.json`
- Model: `qwen2.5-coder:7b` via Ollama (local)
- Workspace: `f:\FORGE 2`
- Slack integration: Socket Mode

### Slack Channels
| Channel | Purpose |
|---------|---------|
| `#sprint-main` | Human ↔ Hermes. Goals, plans, status updates |
| `#agent-coder` | Hermes → OpenClaw. Coding tasks and reports |
| `#agent-orchestrator` | Hermes planning trees and state transitions |
| `#agent-log` | Raw build logs, test outputs, system status |

---

## Technical Stack
- **Backend**: Laravel 12 (PHP 8.3), REST API, Eloquent ORM
- **Database**: SQLite (zero-config)
- **Frontend**: React 19 (Vite 6), Axios
- **Styling**: Custom CSS, glassmorphic dark mode
- **Drag & Drop**: HTML5 native DnD API
- **Deploy**: Vercel (frontend)

---

## Agent Execution Logs

See [agent-log.md](agent-log.md) for the complete step-by-step build log.
See [ARCHITECTURE.md](ARCHITECTURE.md) for the full architecture and agent design.

---

### [2026-06-21 12:45:00] ORCHESTRATOR - INITIALIZATION (Hermes)
- **Objective**: Deploy Laravel API (SQLite) backend + React Vite frontend Kanban Board in `f:\FORGE 2`.
- **Sprint Setup**:
  1. Scaffold Laravel backend - @OpenClaw [Pending]
  2. Implement Board, KanbanList, Card models and migrations - @OpenClaw [Pending]
  3. Set up React Vite frontend + Axios API client - @OpenClaw [Pending]
  4. Design glassmorphic dark-mode CSS and Kanban UI - @OpenClaw [Pending]

---

### [2026-06-21 15:46:12] CODER - TASK STARTED (OpenClaw)
- **Action**: Running `composer create-project laravel/laravel backend` in `f:\FORGE 2`.
- **Status**: Scaffolding backend successfully. SQLite file created at `backend/database/database.sqlite`.

---

### [2026-06-21 15:48:45] ORCHESTRATOR - TRANSITION (Hermes)
- **Action**: Delegating database model schema design and migrations for `Board`, `KanbanList`, and `Card` models to OpenClaw.

---

### [2026-06-21 15:49:10] CODER - SCHEMA DESIGN & MIGRATIONS (OpenClaw)
- **Action**: Implementing Laravel models & migrations.
- **Schema Mapping**:
  * `boards`: `id`, `name`, `timestamps`
  * `kanban_lists`: `id`, `board_id` (foreign), `name`, `position`, `timestamps`
  * `cards`: `id`, `kanban_list_id` (foreign), `title`, `description` (nullable), `labels_csv` (nullable), `assigned_member` (nullable), `due_date` (nullable), `position`, `timestamps`

---

### [2026-06-21 15:51:30] BUILD LOG - BACKEND MIGRATIONS (OpenClaw)
- **Execution**: `php artisan migrate --force`
- **Output**:
  ```
  INFO  Running migrations.
  2026_06_21_000000_create_boards_table ................................................................ 446.64ms DONE
  2026_06_21_000001_create_kanban_lists_table ........................................................... 81.33ms DONE
  2026_06_21_000002_create_cards_table ................................................................... 6.15ms DONE
  ```
- **Status**: SQLite structures generated.

---

### [2026-06-21 15:52:15] CODER - STATUS UPDATE (OpenClaw)
- **What I Did**:
  * Scaffolded Laravel api.php routing and Controllers (Board, KanbanList, Card).
  * Executed SQLite database migrations.
- **What's Left**: React Vite frontend dashboard setup.
- **What Needs Your Call**: DB connection established successfully. Ready to proceed with Frontend.

---

### [2026-06-21 15:53:40] ORCHESTRATOR - TRANSITION (Hermes)
- **Action**: Delegating Frontend setup, API integration, and glassmorphic user dashboard UI layout design to OpenClaw.

---

### [2026-06-21 15:54:10] CODER - FRONTEND LAYOUT & COMPONENTS (OpenClaw)
- **Action**:
  * Scaffolded React Vite at `/frontend`.
  * Installed `axios` and `lucide-react`.
  * Designed dark-mode CSS variables and animations inside `index.css`.
  * Programmed custom interactive `KanbanBoard.jsx` dashboard with drag-and-drop, inline field editor forms, member assignees, due dates, and labels filtering.

---

### [2026-06-21 15:56:45] BUILD LOG - FRONTEND VITE BUILD (OpenClaw)
- **Execution**: `npm run build` inside `/frontend`
- **Output**:
  ```
  vite v8.0.16 building client environment for production...
  transforming...✓ 70 modules transformed.
  rendering chunks...
  dist/index.html                   0.45 kB │ gzip:  0.29 kB
  dist/assets/index-CkeZdXDB.css    7.99 kB │ gzip:  2.42 kB
  dist/assets/index-DfGKV28R.js   248.02 kB │ gzip: 80.06 kB
  ✓ built in 1.61s
  ```
- **Status**: Production build verified with zero errors.

---

### [2026-06-21 15:57:30] CODER - STATUS UPDATE (OpenClaw)
- **What I Did**: Integrated Axios API client and finalized UI features.
- **What's Left**: Done.
- **What Needs Your Call**: Ready for human verification and Loom video capture.

---

### [2026-06-21 15:58:15] SYSTEM VERIFICATION - SUCCESS (Hermes)
- **Test Summary**:
  * Laravel API endpoints GET/POST: OK
  * React UI Components compilation: OK
  * Integration tests (Card movement controls, tag filters): Verified PASS.
