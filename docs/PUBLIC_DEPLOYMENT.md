# Public Deployment Checklist

Mind Reader is a standalone Next.js browser game. It can run fully local-first, or it can connect to a remote leaderboard/profile service through a single environment variable.

## Required Preflight

Run the full local gate before publishing:

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

For a narrower content gate:

```bash
npm run validate
```

## Environment

Create the deployment environment from `env.example`.

```bash
NEXT_PUBLIC_MIND_READER_BACKEND_URL=
NEXT_PUBLIC_MIND_READER_BACKEND_MODE=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_MIND_READER_ANALYTICS_MODE=
NEXT_PUBLIC_MIND_READER_ANALYTICS_ENDPOINT=
```

Leave the backend URL empty to use the same-origin `/api` backend with browser-local fallback. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to make that same-origin backend durable. Set `NEXT_PUBLIC_MIND_READER_BACKEND_MODE=local` only when you want to skip public API calls during development. Set `NEXT_PUBLIC_MIND_READER_BACKEND_URL` when a separate backend implements the contract in `docs/LEADERBOARD_BACKEND.md`.

Current production source of truth is always `/api/health`. The latest verification for `https://mind-reader-game-theta.vercel.app` reports `backend.storage = "server-memory"`, `backend.durableConfigured = false`, and `backend.redisConfigured = false` because the required Upstash Redis env vars are not configured on Vercel yet.

## Health Check

After deployment, verify the public readiness endpoint:

```bash
curl https://your-domain.example/api/health
```

The endpoint reports deployment metadata, content totals, backend storage mode, and rate-limit settings. It intentionally exposes readiness counts only; it does not expose player records or leaderboard payloads.

Look for:

- `backend.storage = "upstash-redis"` and `backend.durableConfigured = true` when Redis is configured.
- `backend.storage = "server-memory"` and `backend.durableConfigured = false` for local/dev fallback.
- `backend.redisConfigured = true` only when the Redis REST URL and token are present.
- `analytics.mode` reports `disabled`, `console`, or `http` without exposing endpoint secrets.

On Vercel, add durable ranking credentials with:

```bash
npx vercel env add UPSTASH_REDIS_REST_URL production
npx vercel env add UPSTASH_REDIS_REST_TOKEN production
npx vercel deploy --prod --yes
```

## Hosting

Deploy as a normal Next.js app on Vercel, Netlify, or any Node-compatible host:

```bash
npm run build
npm run start
```

For the fastest hosted publish path once you are authenticated:

```bash
npx vercel login
npx vercel --prod
```

Or, with Netlify:

```bash
npx netlify-cli login
npx netlify-cli deploy --build --prod
```

The app does not require accounts or auth to launch. Player profiles are anonymous display-name records with stable local ids. Durable public rankings require the Redis env vars above or a separate backend pointed to by `NEXT_PUBLIC_MIND_READER_BACKEND_URL`.

## Public Game QA

Before release, manually check:

- First visit prompts for a player name before gameplay.
- Landing and encounter lead into Mode Selection.
- Chamber Memory and World Rank appear only on Mode Selection.
- Chamber Memory returns to Mode Selection and shows score, history, profile, and teachings.
- World Rank returns to Mode Selection and shows separate mode tabs.
- `/api/health` returns `status: "ok"` and expected content totals.
- `/api/health` reports the intended storage mode before launch.
- Category preview does not auto-advance on click; only Continue starts the ritual.
- Read My Mind and Guess My Mind both complete end to end.
- Guess My Mind shows one active inquiry layer with a small set of questions, not a flat bank.
- Top, left, and right ads render outside the safe gameplay area.
- Ads can close only after 15 seconds and reappear after a full page refresh.
- Mobile hides side ads and preserves the main ritual surface.
- Google AdSense is route-limited to publisher-content pages only. Do not load it on `/play`; configure Auto ads to exclude `/play*` in the AdSense dashboard.
- The homepage hero should stay free of simulated ad boxes; publisher-content sections live below the hero for review-safe context.

## Backend Adapter Notes

The client service layer uses the same-origin `/api` backend by default, a remote HTTP adapter when `NEXT_PUBLIC_MIND_READER_BACKEND_URL` is set, and a browser-local adapter as a fallback. Production backends should:

- Use player ids, not display names, as stable keys.
- Sanitize display names server-side.
- Aggregate score totals separately by mode.
- Validate submitted mode, category, difficulty, and score fields.
- Recompute score server-side and reject duplicate result ids.
- Support polling or another near-real-time strategy for leaderboard refresh.

## Accuracy Evaluation

Use the deterministic simulator to identify weak categories and overused question families:

```bash
npm run eval:accuracy
npm run eval:accuracy -- --category=historical_figures --limit=80
npm run eval:accuracy -- --category=objects --limit=100 --markdown
npm run eval:accuracy -- --category=foods --limit=100 --json
npm run eval:accuracy -- --all
```

The default run samples each category so it stays fast enough for local and CI use. It reports top-1, top-5, and top-10 accuracy, committed-guess rate, stump rate, wrong committed guesses, timing reasons, question-family usage and utility, common wrong-guess pairs, hard entities, low-coverage entities, stump evidence quality, and leader-stability diagnostics. The `--all` run is slower and better for dedicated content-tuning passes.

Interpret the trust metrics together:

- A high stump rate means Mora is too hesitant.
- A high wrong committed-guess rate means Mora is guessing without enough evidence.
- A healthy tuning pass should reduce stumps by improving endgame evidence and leader stability, not by blindly lowering early thresholds.

Run `npm run quality:content` after content changes. It includes active versus quarantined entity totals, profile-uniqueness diagnostics, highly similar entity clusters, indistinguishable pairs, and unknown-heavy entities by category. Quarantined records stay in the seed data for repair but are excluded from active candidate pools and Mora's secret choices.

## Analytics

Analytics are off by default. To inspect product events locally:

```bash
NEXT_PUBLIC_MIND_READER_ANALYTICS_MODE=console
```

For a future privacy-safe endpoint, set:

```bash
NEXT_PUBLIC_MIND_READER_ANALYTICS_MODE=http
NEXT_PUBLIC_MIND_READER_ANALYTICS_ENDPOINT=https://your-endpoint.example/events
```

Tracked events are coarse product events only, such as profile creation, mode selection, category selection, game start, question answered, guess submitted, result reached, teach flow opened, utility scene opened, and ad closed. The analytics service strips answer text, prompts, entity names/ids, notes, and free-text corrections before sending.
