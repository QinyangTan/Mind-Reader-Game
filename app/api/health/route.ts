import { allSeedEntities, entities, quarantinedEntities } from "@/lib/data/entities";
import { allQuestions } from "@/lib/data/questions";
import {
  getPublicBackendDiagnostics,
  publicBackendLimits,
} from "@/lib/server/public-game-backend";
import packageJson from "@/package.json";
import { entityCategories } from "@/types/game";

export const dynamic = "force-dynamic";

function hasRedisCredentials() {
  return Boolean(
    (process.env.MIND_READER_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL) &&
      (process.env.MIND_READER_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN),
  );
}

export async function GET() {
  const backendDiagnostics = await getPublicBackendDiagnostics();
  const analyticsMode = process.env.NEXT_PUBLIC_MIND_READER_ANALYTICS_MODE || "disabled";

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
        activeEntities: entities.length,
        totalSeedEntities: allSeedEntities.length,
        quarantinedEntities: quarantinedEntities.length,
        questions: allQuestions.length,
      },
      backend: {
        ...backendDiagnostics,
        redisConfigured: hasRedisCredentials(),
        rateLimitsPerMinute: {
          profile: publicBackendLimits.profile,
          profilePerPlayer: publicBackendLimits.profilePerPlayer,
          score: publicBackendLimits.score,
          scorePerPlayer: publicBackendLimits.scorePerPlayer,
        },
        rateLimitWindowMs: publicBackendLimits.windowMs,
      },
      analytics: {
        mode: analyticsMode,
        httpConfigured:
          analyticsMode === "http" &&
          Boolean(process.env.NEXT_PUBLIC_MIND_READER_ANALYTICS_ENDPOINT),
      },
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
