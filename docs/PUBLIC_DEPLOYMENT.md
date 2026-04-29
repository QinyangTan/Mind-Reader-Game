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

## Health Check

After deployment, verify the public readiness endpoint:

```bash
curl https://your-domain.example/api/health
```

The endpoint reports deployment metadata, content totals, backend storage mode, and rate-limit settings. It intentionally exposes readiness counts only; it does not expose player records or leaderboard payloads.

Look for:

- `backend.storage = "upstash-redis"` and `backend.durableConfigured = true` when Redis is configured.
- `backend.storage = "server-memory"` and `backend.durableConfigured = false` for local/dev fallback.

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
npm run eval:accuracy -- --all
```

The default run samples each category so it stays fast enough for local and CI use. The `--all` run is slower and better for dedicated content-tuning passes.

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

Tracked events are coarse product events only, such as mode selection, category selection, game start, result reached, utility scene opened, and ad closed. The game does not send private answer content by default.
