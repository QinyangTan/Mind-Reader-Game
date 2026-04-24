# Public Deployment Checklist

Mind Reader is a standalone Next.js browser game. It can run fully local-first, or it can connect to a remote leaderboard/profile service through a single environment variable.

## Required Preflight

Run the full local gate before publishing:

```bash
npm install
npm run check:full
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
```

Leave the backend URL empty to use the same-origin `/api` backend with browser-local fallback. Set `NEXT_PUBLIC_MIND_READER_BACKEND_MODE=local` only when you want to skip public API calls during development. Set `NEXT_PUBLIC_MIND_READER_BACKEND_URL` when a separate durable backend implements the contract in `docs/LEADERBOARD_BACKEND.md`.

## Health Check

After deployment, verify the public readiness endpoint:

```bash
curl https://your-domain.example/api/health
```

The endpoint reports deployment metadata, content totals, backend storage mode, and rate-limit settings. It intentionally exposes readiness counts only; it does not expose player records or leaderboard payloads.

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

The app does not require server-side sessions, a database, or auth to launch. Player profiles are anonymous display-name records with stable local ids. A real backend can later persist score submissions and leaderboard aggregates without changing gameplay code.

## Public Game QA

Before release, manually check:

- First visit prompts for a player name before gameplay.
- Landing and encounter lead into Mode Selection.
- Chamber Memory and World Rank appear only on Mode Selection.
- Chamber Memory returns to Mode Selection and shows score, history, profile, and teachings.
- World Rank returns to Mode Selection and shows separate mode tabs.
- `/api/health` returns `status: "ok"` and expected content totals.
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
- Support polling or another near-real-time strategy for leaderboard refresh.
