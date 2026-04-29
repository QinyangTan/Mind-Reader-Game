import {
  checkRateLimit,
  clientKeyFromRequest,
  publicBackendLimits,
  sanitizeIncomingProfile,
  upsertPlayerProfile,
} from "@/lib/server/public-game-backend";

export async function POST(request: Request) {
  if (!checkRateLimit(`profile:${clientKeyFromRequest(request)}`, publicBackendLimits.profile)) {
    return Response.json({ error: "Too many profile updates." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as { profile?: unknown };
    const incoming = sanitizeIncomingProfile(body.profile);
    if (!checkRateLimit(`profile-player:${incoming.id}`, publicBackendLimits.profilePerPlayer)) {
      return Response.json({ error: "Too many profile updates for this player." }, { status: 429 });
    }

    const profile = await upsertPlayerProfile(incoming);
    return Response.json({ profile });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid profile payload." },
      { status: 400 },
    );
  }
}
