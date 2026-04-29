import { getLeaderboardSnapshot } from "@/lib/server/public-game-backend";
import { gameModes, type GameMode } from "@/types/game";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");

  if (!mode || !gameModes.includes(mode as GameMode)) {
    return Response.json({ error: "Invalid leaderboard mode." }, { status: 400 });
  }

  return Response.json(await getLeaderboardSnapshot(mode as GameMode), {
    headers: {
      "cache-control": "no-store",
    },
  });
}
