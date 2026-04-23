# Mind Reader

Mind Reader is a cinematic, local-first browser guessing game set inside Mora's psychic chamber. It keeps the existing two mirrored rituals while adding a larger seed bank, personal player state, deterministic scoring, public-rank-ready services, and non-blocking ad slots.

- **Psychic Reads You** — think of an entity, answer Mora's questions, and try to survive her guesses.
- **You Read the Psychic** — Mora secretly picks an entity, you ask structured clue questions, and you try to solve her thought.

Seeded knowledge base: **3,032 entities** across **5 categories** and **159 layered questions**. Categories are **Fictional Characters**, **Animals**, **Objects**, **Foods**, and **Historical Figures**.

## Version Highlights

- **Clean chamber scenes.** The stage backgrounds use the cleaned button-free, panel-free, text-free scene plates. Center spotlight bloom and floating crest artifacts were removed from CSS overlays; the crest remains only in the real logo position.
- **First-time player profile.** New visitors enter a display name before starting. Profiles are anonymous, local-first, backed by a stable player id, and can be renamed or reset from Chamber Memory.
- **Chamber Memory dashboard.** Chamber Memory is now a dedicated archive scene with player name, cumulative score, mode totals, recent rituals, streaks, accuracy, best scores, and learned teachings.
- **World Rank.** A second header action opens a dedicated public-ranking scene with separate Read My Mind and Guess My Mind boards. It uses a provider-agnostic service with local fallback and optional remote backend endpoints.
- **Balanced scoring.** Both modes now compute deterministic scores used by results, Chamber Memory, history, and World Rank.
- **Historical Figures category.** Historical Figures now fill the fifth playable slot and include era, region, leadership, science, art, writing, philosophy, religion, exploration, invention, reform, royal, and gender question families.
- **Larger data set.** Supplemental seed files expand Fictional Characters, Animals, Objects, Foods, and Historical Figures while validation prevents malformed entries and duplicate shipped ids.
- **Massive v4 content pass.** The newest live expansion adds **538 fictional characters**, **514 animals**, **523 objects**, **551 foods**, and **517 historical figures** on top of the prior shipped catalog.
- **Guided Guess My Mind.** Reverse mode now uses layered inquiry: Broad Openers, Identity Split, Profile, Specialist, and Fine Detail. The player sees one active layer, up to four paths, and only 3-5 recommended questions at a time.
- **Category preview fix.** Category hover/focus/tap previews now update the description without advancing. Only the explicit Continue / Begin action moves the setup forward.
- **Real example ads.** Top, left, and right sponsor slots now render cached real public ad art, stay outside the safe gameplay area, and can be closed after an exact 15-second countdown. No third-party ad code is included.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # Next dev server
npm run build        # Production build
npm run start        # Run the built app
npm run clean        # Remove .next

npm run lint         # ESLint
npm run lint:fix     # ESLint with --fix
npm run typecheck    # TypeScript check

npm run test         # Vitest domain suite
npm run test:watch   # Vitest watch mode
npm run validate     # Seed integrity gate

npm run check        # lint + typecheck + test
npm run check:full   # check + production build
```

## Environment

Copy `.env.example` if you want to configure a remote leaderboard/profile service:

```bash
NEXT_PUBLIC_MIND_READER_BACKEND_URL=
```

Leave it empty for the browser-local fallback. When set, the client calls the configured backend for score submission and leaderboard fetches. See [docs/LEADERBOARD_BACKEND.md](docs/LEADERBOARD_BACKEND.md).

## Scoring Formulas

Scores are calculated in `lib/game/score.ts` and stored with each result. Difficulty multipliers are:

| Difficulty | Multiplier |
| --- | ---: |
| Easy | 1.00 |
| Normal | 1.35 |
| Hard | 1.75 |

### Read My Mind

The player scores by surviving Mora's reading and scores much higher if Mora is stumped.

```text
base = 40
difficultyBonus = round(30 * difficultyMultiplier)
successBonus = 135 if player stumps Mora, else 24
questionBonus = round(questionsUsed * 8 * difficultyMultiplier)
efficiencyBonus = round((questionsUsed / maxQuestions) * 25)
rarityBonus = entity rarity/popularity bonus, capped at 38
contradictionPenalty = answer-trail contradiction penalty, capped at 60
guessPenalty = max(0, guessesUsed - 1) * 10
score = clamp(sum, 0, 480)
```

### Guess My Mind

The player scores by solving Mora's thought efficiently.

```text
base = 35
difficultyBonus = round(30 * difficultyMultiplier)
successBonus = 185 if player solves, else 16
questionBonus = solved ? round(remainingQuestions * 11 * difficultyMultiplier) : 0
efficiencyBonus = solved ? round((1 - questionsUsed / maxQuestions) * 55 * difficultyMultiplier) : 0
rarityBonus = entity rarity/popularity bonus, capped at 38
guessPenalty = max(0, guessesUsed - 1) * 18
score = clamp(sum, 0, 500)
```

These formulas reward difficulty, meaningful endurance, efficient solving, and consistency while capping farming.

## Persistence Model

Local state is split across versioned keys:

| Key | Purpose |
| --- | --- |
| `mind-reader.v1` | settings, stats, history, score totals |
| `mind-reader.learned.v1` | taught entities and the learned inference model |
| `mind-reader.player-profile.v1` | anonymous player id and display name |
| `mind-reader.leaderboard.v1` | local fallback leaderboard entries |

Seed data remains immutable. Learned entities and model counts live in separate persisted layers and merge into runtime pools safely.

## Inference Engine

Domain logic lives in `lib/game/` with no React dependency:

- `scoring.ts` ranks candidates with smoothed probabilistic evidence.
- `inference-model.ts` keeps additive smoothing counts and learned question usefulness.
- `question-selection.ts` selects decision-tree-style questions using entropy reduction, split balance, layer fit, and anti-repetition penalties.
- `session.ts` owns both gameplay state machines and result creation.
- `score.ts` computes deterministic public-game scores.

Question metadata uses `stage`, `group`, and `family` so Mora asks broad, high-information questions first, then narrows into category, profile, specialist, and fine-grained clues.

## Content And Validation

Seed content is split by category and supplemental expansion files:

```text
lib/data/fictional-characters.ts
lib/data/animals.ts
lib/data/objects.ts
lib/data/foods.ts
lib/data/historical-figures.ts
lib/data/content-expansion.ts
lib/data/content-expansion-v2.ts
lib/data/content-expansion-v3.ts
lib/data/content-expansion-v4.ts
lib/data/bulk/*.ts
lib/data/question-bank/*.ts
```

Run `npm run validate` to check:

- duplicate entity/question ids
- malformed names/descriptions/emoji fields
- invalid categories and attributes
- invalid answer values
- missing category question coverage
- weak-profile warnings

## Ads

`TimedAdSlot` renders the public-game ad placements:

- top leaderboard/banner slot
- left side slot
- right side slot

Each slot is non-blocking and closes only after a visible 15-second countdown. Dismissal is page-lifecycle only, so sponsor slots reappear on a full page refresh as expected for a public web game. Side ads are desktop-only; smaller screens preserve the gameplay area. Sample media sources are documented in [docs/AD_SOURCES.md](docs/AD_SOURCES.md).

## Production Notes

- No account system is required; player profiles are anonymous display-name profiles.
- The leaderboard service is adapter-based: local fallback for development, remote HTTP adapter for production.
- The app has production metadata, social preview metadata, `.env.example`, deterministic score tests, profile tests, storage migration tests, domain tests, and seed validation.
- Deploy as a normal Next.js app. If you enable a real backend, implement the endpoints in [docs/LEADERBOARD_BACKEND.md](docs/LEADERBOARD_BACKEND.md), set `NEXT_PUBLIC_MIND_READER_BACKEND_URL`, and follow the production checklist in [docs/PUBLIC_DEPLOYMENT.md](docs/PUBLIC_DEPLOYMENT.md).
