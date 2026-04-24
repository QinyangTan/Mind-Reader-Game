import { entities } from "@/lib/data/entities";
import { allQuestions } from "@/lib/data/questions";
import {
  getPublicBackendDiagnostics,
  publicBackendLimits,
} from "@/lib/server/public-game-backend";
import { entityCategories } from "@/types/game";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      status: "ok",
      generatedAt: new Date().toISOString(),
      deployment: {
        environment: process.env.VERCEL_ENV ?? "local",
        commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      },
      content: {
        categories: entityCategories.length,
        entities: entities.length,
        questions: allQuestions.length,
      },
      backend: {
        ...getPublicBackendDiagnostics(),
        rateLimitsPerMinute: {
          profile: publicBackendLimits.profile,
          score: publicBackendLimits.score,
        },
      },
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
