import { entities } from "@/lib/data/entities";
import { allQuestions } from "@/lib/data/questions";
import {
  getPublicBackendDiagnostics,
  publicBackendLimits,
} from "@/lib/server/public-game-backend";
import packageJson from "@/package.json";
import { entityCategories } from "@/types/game";

export const dynamic = "force-dynamic";

export async function GET() {
  const backendDiagnostics = await getPublicBackendDiagnostics();

  return Response.json(
    {
      status: "ok",
      app: {
        name: packageJson.name,
        version: packageJson.version,
      },
      generatedAt: new Date().toISOString(),
      deployment: {
        environment: process.env.VERCEL_ENV ?? "local",
        commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
        nodeEnv: process.env.NODE_ENV ?? "unknown",
      },
      content: {
        categories: entityCategories.length,
        entities: entities.length,
        questions: allQuestions.length,
      },
      backend: {
        ...backendDiagnostics,
        rateLimitsPerMinute: {
          profile: publicBackendLimits.profile,
          profilePerPlayer: publicBackendLimits.profilePerPlayer,
          score: publicBackendLimits.score,
          scorePerPlayer: publicBackendLimits.scorePerPlayer,
        },
        rateLimitWindowMs: publicBackendLimits.windowMs,
      },
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
