# Mind Reader

Mind Reader is a cinematic, local-first browser guessing game set inside Mora's psychic chamber. It keeps the existing two mirrored rituals while adding a larger seed bank, personal player state, deterministic scoring, public-rank-ready services, and non-blocking ad slots.

- **Psychic Reads You** — think of an entity, answer Mora's questions, and try to survive her guesses.
- **You Read the Psychic** — Mora secretly picks an entity, you ask structured clue questions, and you try to solve her thought.

Seeded knowledge base: **2,970 active entities** across **5 categories**, with **3,024 total seed records**, **54 quarantined repair candidates**, and **471 layered questions**. Categories are **Fictional Characters**, **Animals**, **Objects**, **Foods**, and **Historical Figures**.

## Live Project

Play the published web game here:

[https://mind-reader-game-theta.vercel.app](https://mind-reader-game-theta.vercel.app)

## Version Highlights

- **Clean chamber scenes.** The stage backgrounds use the cleaned button-free, panel-free, text-free scene plates. Center spotlight bloom and floating crest artifacts were removed from CSS overlays; the crest remains only in the real logo position.
- **First-time player profile.** New visitors enter a display name before starting. Profiles are anonymous, local-first, backed by a stable player id, and can be renamed or reset from Chamber Memory.
- **Chamber Memory dashboard.** Chamber Memory is now a dedicated archive scene with player name, cumulative score, mode totals, recent rituals, streaks, accuracy, best scores, and learned teachings.
- **World Rank.** A second header action opens a dedicated public-ranking scene with separate Read My Mind and Guess My Mind boards. It uses a provider-agnostic service with local fallback and optional remote backend endpoints.
- **Balanced scoring.** Both modes now compute deterministic scores used by results, Chamber Memory, history, and World Rank.
- **Historical Figures category.** Historical Figures now fill the fifth playable slot and include era, region, leadership, science, art, writing, philosophy, religion, exploration, invention, reform, royal, and gender question families.
- **Larger data set.** Supplemental seed files expand Fictional Characters, Animals, Objects, Foods, and Historical Figures while validation prevents malformed entries and duplicate shipped ids.
- **Massive v4 content pass.** The newest live expansion adds **538 fictional characters**, **514 animals**, **523 objects**, **551 foods**, and **517 historical figures** on top of the prior shipped catalog.
- **Coverage-aware decision quality.** Mora now demotes questions when likely candidates mostly have unknown values for that trait, uses endgame top-candidate separation, and only relaxes final guesses when leader stability, evidence quality, and contradiction checks support it.
- **Denser question bank.** Recent production passes add targeted specialist and fine-grained discriminators, especially for Historical Figures, Objects, and Foods.
- **Content quarantine.** Non-playable seeds such as events, organizations, topic pages, broad style categories, and misplaced records remain in the repo for repair but are excluded from active candidate pools and Mora's secret choices.
- **Guided Guess My Mind.** Reverse mode now uses layered inquiry: Broad Openers, Identity Split, Profile, Specialist, and Fine Detail. The player sees one active layer, one chosen family, only 2 recommended questions by default, and a short guidance hint explaining why that path is useful.
- **Worker-backed inference.** Both gameplay modes use the shared inference-worker client for candidate/question ranking where the browser supports workers, with deterministic synchronous fallback and a small request cache so the chamber stays responsive as content grows.
- **Same-origin public backend.** Profile and leaderboard calls now default to `/api/players`, `/api/scores`, and `/api/leaderboard`, with validation, rate limiting, server-side score recomputation, durable Redis storage when configured, and local fallback.
- **Production health check.** `/api/health` reports deployment, content totals, backend storage mode, Redis configuration state, analytics mode, and rate-limit settings for monitoring.
- **Accuracy and content tooling.** `npm run eval:accuracy` simulates inference quality with per-category top-1, top-5, and top-10 accuracy, stump rate, committed-guess rate, timing diagnostics, wrong-pair samples, and weak-profile reporting. `npm run quality:content` reports coverage, weak profiles, duplicate aliases, family balance, and profile-uniqueness clusters.
- **CI-ready gate.** GitHub Actions runs lint, typecheck, tests, validation, content quality, accuracy evaluation, and build checks on the repo.
- **Category preview fix.** Category hover/focus/tap previews now update the description without advancing. Only the explicit Continue / Begin action moves the setup forward.
- **AdSense-safe public ads.** Google AdSense is loaded only on content-rich public pages, never globally and never inside `/play`. Top, left, and right in-game sponsor slots remain cached non-Google example creatives outside the safe gameplay area.

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
npm run test:e2e     # Playwright browser flow suite
npm run test:watch   # Vitest watch mode
npm run validate     # Seed integrity gate
npm run quality:content # Content coverage and duplicate report
npm run eval:accuracy   # Deterministic inference accuracy simulation

npm run check        # lint + typecheck + test
npm run check:full   # check + production build
```

## Environment

Copy `env.example` if you want to configure leaderboard/profile behavior:

```bash
NEXT_PUBLIC_MIND_READER_BACKEND_URL=
NEXT_PUBLIC_MIND_READER_BACKEND_MODE=
MIND_READER_LEADERBOARD_STORAGE=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_MIND_READER_ANALYTICS_MODE=
NEXT_PUBLIC_MIND_READER_ANALYTICS_ENDPOINT=
```

By default, the browser uses this app's same-origin `/api` backend and falls back to browser-local rankings if a request fails. The same-origin backend uses memory storage locally and automatically switches to durable Upstash Redis storage when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured. Set `NEXT_PUBLIC_MIND_READER_BACKEND_URL` to point at a separate backend, or set `NEXT_PUBLIC_MIND_READER_BACKEND_MODE=local` to force local-only development. See [docs/LEADERBOARD_BACKEND.md](docs/LEADERBOARD_BACKEND.md).

Analytics are privacy-safe by default. Leave `NEXT_PUBLIC_MIND_READER_ANALYTICS_MODE` blank for no-op tracking, set it to `console` for local debugging, or set it to `http` with `NEXT_PUBLIC_MIND_READER_ANALYTICS_ENDPOINT` to send sanitized product events. The client tracks only coarse metadata such as mode, category, difficulty, question count, winner, score bucket, and source screen; it filters answer text, entity names/ids, prompts, notes, and free-text corrections.

## Quality Gate

The full production gate is:

```bash
npm install
npm run clean
npm run lint
npm run typecheck
npm run test
npm run validate
npm run quality:content
npm run eval:accuracy
npm run test:e2e
npm run build
```

GitHub Actions runs the same core gate on push and pull request. Playwright e2e runs on pull requests and manual workflow dispatch.

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
- `question-selection.ts` selects decision-tree-style questions using entropy reduction, split balance, known-profile coverage, layer fit, anti-repetition penalties, and endgame top-K separation.
- `inference-worker-client.ts` moves heavy candidate/question ranking for both modes into a worker when available.
- `session.ts` owns both gameplay state machines and result creation.
- `score.ts` computes deterministic public-game scores.

Question metadata uses `stage`, `group`, and `family` so Mora asks broad, high-information questions first, then narrows into category, profile, specialist, and fine-grained clues.

Final guesses are intentionally trust-first. Early-game thresholds remain conservative; late-game commitment can use leader stability, top-candidate margin, entropy, effective candidate count, strong answered traits, and contradiction checks so Mora earns more guesses without returning to brittle early guesses.

## Accuracy Evaluation

Use the simulator when tuning intelligence quality:

```bash
npm run eval:accuracy
npm run eval:accuracy -- --category=objects --limit=100
npm run eval:accuracy -- --category=foods --limit=100 --markdown
npm run eval:accuracy -- --all --json
```

The default deterministic sample currently reports top-1 accuracy around **0.305**, top-5 accuracy around **0.450**, top-10 accuracy around **0.540**, committed-guess rate around **0.240**, stump rate around **0.760**, and wrong committed guesses at **0**. Those numbers are diagnostic, not marketing claims: the current priority is still reducing stump rate by improving entity profiles and endgame separators while keeping wrong committed guesses very low.

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
- per-category question density, family balance, and weak-entity summaries
- profile uniqueness diagnostics, including nearest-neighbor clusters, indistinguishable pairs, and unknown-heavy entities

## Ads

`TimedAdSlot` renders the public-game ad placements:

- top leaderboard/banner slot
- left side slot
- right side slot

Each slot is non-blocking and closes only after a visible 15-second countdown. Dismissal is page-lifecycle only, so sponsor slots reappear on a full page refresh as expected for a public web game. Side ads are desktop-only; smaller screens preserve the gameplay area. Sample media sources are documented in [docs/AD_SOURCES.md](docs/AD_SOURCES.md).

Google AdSense is intentionally not loaded in `app/layout.tsx`. The controlled `AdSenseLoader` component is mounted only on publisher-content routes: `/`, `/about`, `/faq`, `/press`, `/privacy`, `/terms`, `/legal`, and `/contact`. It is excluded from `/play`, profile gates, Chamber Memory, World Rank, gameplay, reveal/result screens, modals, and other ritual-only surfaces. Auto ads should also exclude `/play*` in the AdSense dashboard. See [docs/ADSENSE_POLICY.md](docs/ADSENSE_POLICY.md).

## Production Notes

- No account system is required; player profiles are anonymous display-name profiles.
- The leaderboard service is adapter-based: browser-local fallback, same-origin memory fallback, same-origin Upstash Redis durability when configured, and optional remote HTTP adapter support.
- `/api/health` is available for uptime checks and basic deployment/content diagnostics.
- The app has production metadata, social preview metadata, `env.example`, deterministic score tests, server-side score verification tests, profile tests, storage migration tests, domain tests, Playwright e2e, seed validation, content quality reporting, and accuracy evaluation.
- Deploy as a normal Next.js app. For durable same-origin rankings, configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; for a separate backend, implement the endpoints in [docs/LEADERBOARD_BACKEND.md](docs/LEADERBOARD_BACKEND.md), set `NEXT_PUBLIC_MIND_READER_BACKEND_URL`, and follow the production checklist in [docs/PUBLIC_DEPLOYMENT.md](docs/PUBLIC_DEPLOYMENT.md).
