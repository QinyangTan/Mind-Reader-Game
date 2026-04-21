# Mind Reader — Version 2

Mind Reader is a local-first web guessing game with two mirrored modes that share one inference engine, one question bank, and one local memory vault. The entire experience lives in the browser — no accounts, no backend, no network calls.

- **Read My Mind** — you think of an entity, answer fixed prompts, and the chamber tries to guess it.
- **Guess My Mind** — the chamber picks a secret entity, answers from the shared question bank, and you try to uncover it.

Seeded knowledge base: **110 entities** (60 fictional characters, 50 animals) and **36 weighted questions** across the two categories. Everything else — stats, history, taught misses — is persisted locally in versioned `localStorage` keys.

## What's new in v2

- **Separate learned-entity store** with a safe v1 → v2 migration. Past `teachCases` embedded in the v1 vault are automatically moved into `mind-reader.learned.v1` (deduped by id) on first load.
- **Seeded data is now immutable.** Entity objects and their attribute records are deep-frozen at construction; top-level maps are exposed as `ReadonlyMap`. Taught entities join the runtime pools through a separate `extraEntities` path.
- **Learned entities participate in both modes.** The chamber can pick a taught entity as the Guess-My-Mind secret, and it's a valid guess target on either side. Learned candidates are tagged with a "Teach" pill in the UI.
- **Partial teach-flow attribute capture.** When the chamber misses in Read My Mind, the result screen offers a tri-state (Yes / No / Skip) refine panel for attributes the round didn't probe, so a taught entity can carry a richer signature than its trail alone.
- **Stronger inference.** Tempered softmax (T = 1.25) calibrates displayed confidence, hard yes↔no contradictions drop likelihood to ~0.025 and sink contradictors in the sort, question selection blends general entropy with a top-K pairwise-split metric that dominates in endgame, and a redesigned guess-pacing cascade replaces the "≤ 2 questions → always guess" shortcut with primary / deep-endgame / late-fallback / narrow-pool rules.
- **Expanded stats.** Wins by mode / category / difficulty, average questions before guess, chamber-accuracy and player-accuracy per side. All counters stored; all ratios derived on read.
- **Richer archive.** Every session timeline entry shows its Q / G use against the budget, and Read-My-Mind rounds carry the "strongest narrowing question" — scored by `weight × signal-strength × top-K split` against the final rankings.
- **Game-feel polish.** Per-screen transitions, scanner-line pulse on the active probe, polarity grouping + filter on the Guess-My-Mind trail, halo emoji + chromatic sheen on reveal cards, short suspense delay before results with a revealed entity.
- **Test suite + seed validator.** Vitest-based domain tests, plus a seed-integrity script wired to `npm run validate`.

## Stack

- Next.js 16 App Router (Turbopack dev)
- TypeScript (strict)
- Tailwind CSS v4
- Framer Motion for animation
- Radix UI primitives (Dialog, Progress, Slot)
- Vitest for domain and validation tests
- Local data only, persisted in `localStorage` under two versioned keys

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # Next dev server with Turbopack
npm run build        # Production build
npm run start        # Run the built app
npm run clean        # Remove .next (fixes stale / duplicated Next typegen confusing tsc)

npm run lint         # ESLint on the repo
npm run lint:fix     # ESLint with --fix
npm run typecheck    # tsc --noEmit

npm run test         # Vitest, one-shot (all tests)
npm run test:watch   # Vitest in watch mode
npm run validate     # Seed integrity only (same file as below, fast gate)

npm run check        # lint + typecheck + test (stops on first failure)
npm run check:full   # check + production build
```

`clean` uses a Unix `rm -rf`; on Windows, delete the `.next` folder manually or run the command from Git Bash / WSL if `npm run clean` is not available.

## Persistence model

Local state is split across two versioned keys so that learned-entity data lives independently from session stats.

| Key                         | Shape                   | Purpose                                               |
| --------------------------- | ----------------------- | ----------------------------------------------------- |
| `mind-reader.v1`            | `PersistedVault` v2     | settings, cumulative stats, recent history            |
| `mind-reader.learned.v1`    | `LearnedEntityStore` v1 | taught misses, capped at 64 entries                   |

Loading the vault is idempotent: a legacy v1 payload with inline `teachCases` is detected on read, those cases are merged into the learned store by id (deduped, preserving both existing and incoming entries), and the vault is rewritten at v2 without them. Corrupt JSON falls back to the default vault. Re-loads after migration are no-ops.

## Inference engine

Lives entirely in `lib/game/`. No React dependencies. The key pieces:

- **`compatibility` tiers** (`scoring.ts`) — exact match = 1.0, yes↔no hard contradiction = 0.025 (effectively eliminates), soft disagreements use a continuous distance-based score with a tight floor; entity = `unknown` gets a small demotion against confident players so "known" candidates out-rank vague ones on equal distance.
- **Confidence calibration** — tempered softmax with T = 1.25 converts log-likelihoods into displayed confidence, so a marginally better leader can't claim > 90 % certainty on thin evidence.
- **Contradiction tie-break** — candidates with at least one hard yes↔no contradiction never outrank one without, regardless of softmax mass.
- **Question selection** (`question-selection.ts`) — blends balance, spread, certainty, diversity, and a top-K pairwise-split metric. When `remainingQuestions ≤ 5` or the leader's confidence ≥ 0.32, the blend shifts to 0.60 weight on the split metric so the chamber focuses on separating the top 2–4 candidates instead of further narrowing the long tail.
- **Guess pacing** (`shouldAttemptGuess`) — ordered cascade:
  1. Below `minQuestionsBeforeGuess` → never guess.
  2. Primary: leader confidence ≥ `guessConfidence` **and** margin ≥ `guessMargin` → guess.
  3. Deep endgame (≤ 1 question remaining) → always guess.
  4. Late fallback (≤ 3 remaining): relaxed thresholds (70 % of primary confidence / 60 % of primary margin).
  5. Narrow survivor pool (≤ 3 un-rejected candidates) with margin ≥ 40 % of primary → guess.

Difficulty tweaks `maxQuestions`, `maxGuesses`, `minQuestionsBeforeGuess`, `guessConfidence`, and `guessMargin` (see `lib/game/game-config.ts`).

## Teach flow & learned entities

When the chamber loses a Read-My-Mind round (an escape), the result screen offers:

1. **Name + note** — free-text fields for the correct entity.
2. **Refine attributes** — a collapsible tri-state (Yes / No / Skip) panel listing category-relevant attributes the round didn't ask about. Skipped attributes stay `unknown`.

The resulting `TeachCase` is stored in `mind-reader.learned.v1` and — when the `useTeachCases` setting is on — joins both modes' runtime pools:

- **Read My Mind** — learned entries are ranked alongside seeded entities; if selected as a guess, the dialog labels the lock as "Memory vault" instead of "Psychic Lock".
- **Guess My Mind** — the chamber can draw the secret from the learned pool, and the picker surfaces learned entries with a "Teach" pill.

Seeded entities stay immutable, so new learned entries never mutate the seed pool.

## Project structure

```
app/                    Next.js App Router entry points
  layout.tsx, page.tsx, play/page.tsx
components/
  game/                 Game-specific React components
  ui/                   Primitives (button, dialog, input)
lib/
  data/                 Seeded entities, questions, seed helpers
  game/                 Pure domain logic (no React, no DOM)
    scoring.ts              inference model, ranking, guess pacing, narrowing
    question-selection.ts   next-question picker with endgame blend
    session.ts              Read-My-Mind / Guess-My-Mind state machines
    storage.ts              vault v2 + migration + derived metrics
    learned-storage.ts      separate learned-entity store (v1)
    teach.ts                teach-case → GameEntity synthesis
    game-config.ts          mode / difficulty / category metadata
  utils/                cn helper
scripts/
  validate-seeds.ts     seed-data integrity check
tests/                  Vitest suite (domain + validation)
types/
  game.ts               all shared types
```

## Test suite

Coverage focuses on pure-domain modules and on data integrity. UI component tests are intentionally not in scope here — all tests run in the `node` environment without a DOM.

| File                                   | What it exercises                                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `tests/scoring.test.ts`                | `toProbability` monotonicity, `rankCandidates` ordering + confidence sum, hard-contradiction sink, `shouldAttemptGuess` cascade, `strongestNarrowingQuestion` |
| `tests/question-selection.test.ts`     | Fresh-round selection, exhausted question bank, asked-question exclusion                                            |
| `tests/storage.test.ts`                | v1 → v2 vault migration (idempotent + corrupt-payload fallback), `applyResultToStats` per-mode attribution, streak behavior, derived-metric zero-safety |
| `tests/learned-storage.test.ts`        | Entry-shape sanitization, `extraAttributes` value filtering, `mergeLegacyTeachCases` dedupe, prepend + save-cap       |
| `tests/teach.test.ts`                  | `teachCaseToEntity` attribute synthesis (marker + answers + extras), category filtering, blank-name fallback        |
| `tests/session.test.ts`                | End-to-end Read-My-Mind answer → result, Guess-My-Mind secret + correct / wrong submit                              |
| `tests/validation.test.ts`             | Shipped seeds: zero `validateSeeds` errors; fixtures for duplicate ids, empty fields, bad weights, missing category coverage |

Quick stats: **7 test files, 55 tests** (all passing in CI-style `npm run check`).

## Seed validator

`scripts/validate-seeds.ts` exports a pure `validateSeeds(input?)` returning `{ errors, warnings }`. With no argument it validates the bundled `entities` and `allQuestions` modules; tests can pass `{ entities, questions }` slices to assert specific error codes. Run the fast gate via `npm run validate` (Vitest on `tests/validation.test.ts` only).

Checks (errors unless noted):

- unique entity and question ids
- non-empty trimmed strings for entity `id` / `name` / `shortDescription` / `imageEmoji`, and for question `id` / `label` / `question`
- optional question `weight`: when present, must be a finite number greater than zero
- every entity carries a value for every `AttributeKey`, with a valid `NormalizedAnswer`
- every question references a known `AttributeKey` and at least one valid category; categories on each question must exist
- every category has at least one entity and at least one supporting question
- **warnings:** entity has ≤ 2 non-unknown attributes (weak ranking signal)

The validator runs in-process via Vitest, so no ts-node / tsx dependency is required.

## Known gaps

Transparent list of things that are stored, declared, or partially shipped but not fully wired. These are surfaced in the codebase but not surfaced in the UI.

- **`StoredSettings.soundEnabled`** is persisted and hydrated but has no UI toggle and no audio layer consumes it. Pending an audio feedback pass.
- **`GameStats.lastMode` / `lastCategory` / `lastPlayedAt`** are written by `applyResultToStats` but currently not surfaced in the stats panel.
- **`teachCaseFillRate`** in `lib/game/teach.ts` is defined but currently unused — intended for a "completeness" indicator on the Escaped Entities panel.
- **UI component tests** are not included in the current suite. Domain and data integrity are covered; visual / interaction coverage is manual.
- **Cursor Browser-based visual validation** is currently unavailable due to a Node 25 incompatibility in the browser-plugin CLI. Manual browser testing remains the only way to validate UI changes end-to-end.
