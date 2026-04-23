# Leaderboard Backend Contract

Mind Reader ships with a browser-local leaderboard fallback. For production public rankings, set:

```bash
NEXT_PUBLIC_MIND_READER_BACKEND_URL=https://your-backend.example
```

The client expects the configured backend to expose these endpoints.

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
- Use polling, server-sent events, or WebSockets for near-real-time updates. The shipped client polls every 12 seconds.
- Keep the local fallback enabled for development and offline play.

