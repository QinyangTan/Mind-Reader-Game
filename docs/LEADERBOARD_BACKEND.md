# Leaderboard Backend Contract

Mind Reader now ships with a same-origin public-game backend and a browser-local fallback. In production, the default client target is:

```text
/api/players
/api/scores
/api/leaderboard
```

Those route handlers validate anonymous player profiles, recompute submitted score payloads, rate-limit submissions, reject duplicate result ids, and aggregate separate rankings per mode. The bundled implementation now uses a repository layer:

- `MemoryLeaderboardRepository` for local/dev fallback.
- `UpstashRedisLeaderboardRepository` for durable production storage when Redis REST env vars are configured.

For a separate backend adapter, point the browser client at another implementation of this same contract:

```bash
NEXT_PUBLIC_MIND_READER_BACKEND_URL=https://your-backend.example
```

For local-only development, force the browser fallback:

```bash
NEXT_PUBLIC_MIND_READER_BACKEND_MODE=local
```

The client expects either the same-origin API or the configured backend to expose these endpoints.

## Same-Origin Durable Storage

Configure Upstash Redis REST or Vercel KV compatible variables on the deployed app:

```bash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

Optional project-specific aliases are also supported:

```bash
MIND_READER_REDIS_REST_URL=https://...
MIND_READER_REDIS_REST_TOKEN=...
MIND_READER_REDIS_PREFIX=mind-reader
```

Set `MIND_READER_LEADERBOARD_STORAGE=memory` to force the memory adapter for previews. Without Redis env vars, the same-origin API automatically falls back to memory storage.

For the deployed Vercel project, add the durable credentials with:

```bash
npx vercel env add UPSTASH_REDIS_REST_URL production
npx vercel env add UPSTASH_REDIS_REST_TOKEN production
npx vercel deploy --prod --yes
```

Verify after deploy:

```bash
curl https://mind-reader-game-theta.vercel.app/api/health
```

Production durability is active only when the health payload reports `backend.storage: "upstash-redis"`, `backend.durableConfigured: true`, and `backend.redisConfigured: true`.

## Save Profile

`POST /players`

Request body:

```json
{
  "profile": {
    "version": 1,
    "id": "player_...",
    "displayName": "MoraFan",
    "createdAt": "2026-04-23T00:00:00.000Z",
    "updatedAt": "2026-04-23T00:00:00.000Z"
  }
}
```

The backend sanitizes the display name, keeps the stable anonymous `player.id`, and never treats a display name as a primary key.

## Submit Score

`POST /scores`

Request body:

```json
{
  "profile": {
    "id": "player_...",
    "displayName": "MoraFan",
    "createdAt": "2026-04-23T00:00:00.000Z",
    "updatedAt": "2026-04-23T00:00:00.000Z"
  },
  "result": {
    "id": "result_...",
    "mode": "read-my-mind",
    "category": "fictional_characters",
    "difficulty": "normal",
    "winner": "player",
    "score": 320
  },
  "bestStreak": 4,
  "proof": {
    "startedAt": "2026-04-23T00:00:00.000Z",
    "answers": [
      {
        "questionId": "animal-mammal",
        "attributeKey": "mammal",
        "prompt": "Is it a mammal?",
        "answer": "yes",
        "askedAt": "2026-04-23T00:00:12.000Z"
      }
    ]
  }
}
```

The same-origin backend recomputes the deterministic score with `lib/game/score.ts`, verifies the submitted `scoreBreakdown`, rejects impossible counts/timestamps, rejects unknown-entity rarity claims, and rejects duplicate `player.id + result.id` submissions. Full cryptographic session signing is intentionally left for a future account-backed backend.

## Fetch Leaderboard

`GET /leaderboard?mode=read-my-mind`

Response body:

```json
{
  "mode": "read-my-mind",
  "generatedAt": "2026-04-23T00:00:00.000Z",
  "source": "remote",
  "entries": [
    {
      "playerId": "player_...",
      "displayName": "MoraFan",
      "mode": "read-my-mind",
      "totalScore": 4210,
      "gamesPlayed": 16,
      "wins": 11,
      "bestStreak": 5,
      "averageScore": 263.125,
      "updatedAt": "2026-04-23T00:00:00.000Z"
    }
  ]
}
```

## Recommended Production Behavior

- Use a stable anonymous `playerId`; do not use display names as unique keys.
- Sanitize display names server-side with the same 2-18 character policy used by the client.
- Store separate aggregates per mode so Read My Mind and Guess My Mind rankings stay independent.
- Recompute score totals against deterministic result breakdowns before accepting submissions.
- Use durable storage such as the included Upstash Redis REST adapter, Postgres, Redis, KV, or a managed document store behind the same endpoint contract.
- Keep rate limiting on both profile and score endpoints. The shipped same-origin API uses one-minute client and per-player buckets.
- Use polling, server-sent events, or WebSockets for near-real-time updates. The shipped client polls every 12 seconds.
- Keep the local fallback enabled for development and offline play.
