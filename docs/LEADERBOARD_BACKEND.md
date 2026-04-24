# Leaderboard Backend Contract

Mind Reader now ships with a same-origin public-game backend and a browser-local fallback. In production, the default client target is:

```text
/api/players
/api/scores
/api/leaderboard
```

Those route handlers validate anonymous player profiles, validate score payloads, rate-limit submissions, and aggregate separate rankings per mode. The bundled implementation is intentionally small and server-memory backed, which is useful for previews and single-instance demos. For durable shared rankings across serverless instances, point the client at a persistent backend adapter:

```bash
NEXT_PUBLIC_MIND_READER_BACKEND_URL=https://your-backend.example
```

For local-only development, force the browser fallback:

```bash
NEXT_PUBLIC_MIND_READER_BACKEND_MODE=local
```

The client expects either the same-origin API or the configured backend to expose these endpoints.

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
  "bestStreak": 4
}
```

The backend should validate the mode/category/difficulty values, recompute or verify score if it owns scoring authority, then upsert an aggregate leaderboard row by `player.id + result.mode`.

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
- Validate score totals against deterministic result breakdowns before accepting submissions.
- Add durable storage such as Postgres, Redis, KV, or a managed document store behind the same endpoint contract.
- Keep rate limiting on both profile and score endpoints. The shipped same-origin API uses one-minute client buckets.
- Use polling, server-sent events, or WebSockets for near-real-time updates. The shipped client polls every 12 seconds.
- Keep the local fallback enabled for development and offline play.
