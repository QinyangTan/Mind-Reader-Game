import {
  checkRateLimit,
  clientKeyFromRequest,
  publicBackendLimits,
  sanitizeIncomingProfile,
  submitScore,
} from "@/lib/server/public-game-backend";
import type { GameResult } from "@/types/game";

export async function POST(request: Request) {
  if (!checkRateLimit(`score:${clientKeyFromRequest(request)}`, publicBackendLimits.score)) {
    return Response.json({ error: "Too many score submissions." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as {
      profile?: unknown;
      result?: unknown;
      bestStreak?: unknown;
    };
    const profile = sanitizeIncomingProfile(body.profile);
    const bestStreak = Number.isFinite(body.bestStreak) ? Number(body.bestStreak) : 0;

    submitScore(profile, body.result as GameResult, bestStreak);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid score payload." },
      { status: 400 },
    );
  }
}
