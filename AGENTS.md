<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Change boundaries (default)

Unless a **test fixture absolutely requires** a production change, **do not modify**:

- **Gameplay** — behavior, rules, or flows of the game as implemented (especially under `lib/game/`).
- **UI** — `app/`, `components/`.
- **Session** — `lib/game/session.ts`.
- **Scoring** — `lib/game/scoring.ts`.
- **Question selection** — `lib/game/question-selection.ts`.
- **Storage** — `lib/game/storage.ts`.
- **Shared types** — `types/` (e.g. `types/game.ts`).

Prefer tests, scripts, docs, and tooling that stay outside these surfaces. If a fixture cannot be written without touching one of these, keep the diff minimal and limited to what the test forces.

## Workflow

- **Incremental** — ship small, reviewable steps; avoid wide refactors or scope creep unrelated to the task.
- **This repo only** — do all work inside this repository; do not assume companion repos, unpublished packages, or external codebases unless the task explicitly says otherwise.
