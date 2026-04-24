import { rankCandidates } from "@/lib/game/scoring";
import type {
  EntityCategory,
  GameEntity,
  LearnedInferenceModel,
  RankedCandidate,
  SystemAnsweredQuestion,
} from "@/types/game";

interface RankingWorkerRequest {
  id: number;
  category: EntityCategory;
  asked: SystemAnsweredQuestion[];
  wrongGuessIds: string[];
  extraEntities: GameEntity[];
  inferenceModel?: LearnedInferenceModel;
}

interface RankingWorkerResponse {
  id: number;
  rankings?: RankedCandidate[];
  error?: string;
}

self.addEventListener("message", (event: MessageEvent<RankingWorkerRequest>) => {
  const { id, category, asked, wrongGuessIds, extraEntities, inferenceModel } = event.data;

  try {
    const rankings = rankCandidates(category, asked, wrongGuessIds, extraEntities, inferenceModel);
    self.postMessage({ id, rankings } satisfies RankingWorkerResponse);
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : "Ranking worker failed",
    } satisfies RankingWorkerResponse);
  }
});

export {};
