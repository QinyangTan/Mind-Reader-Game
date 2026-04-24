/// <reference lib="webworker" />

import { rankAvailableQuestions } from "@/lib/game/question-selection";
import { rankCandidates } from "@/lib/game/scoring";
import type {
  AnsweredQuestion,
  EntityCategory,
  GameEntity,
  LearnedInferenceModel,
} from "@/types/game";

interface InferenceWorkerRequest {
  requestId: number;
  category: EntityCategory;
  asked: AnsweredQuestion[];
  rejectedGuessIds: string[];
  askedQuestionIds: string[];
  remainingQuestions: number;
  extraEntities: GameEntity[];
  inferenceModel?: LearnedInferenceModel;
}

self.addEventListener("message", (event: MessageEvent<InferenceWorkerRequest>) => {
  const startedAt = performance.now();

  try {
    const rankedCandidates = rankCandidates(
      event.data.category,
      event.data.asked,
      event.data.rejectedGuessIds,
      event.data.extraEntities,
      event.data.inferenceModel,
    );
    const rankedQuestions = rankAvailableQuestions(
      event.data.category,
      event.data.askedQuestionIds,
      rankedCandidates,
      event.data.extraEntities,
      event.data.remainingQuestions,
      event.data.inferenceModel,
    );

    self.postMessage({
      requestId: event.data.requestId,
      result: {
        rankedCandidates,
        rankedQuestions,
        durationMs: performance.now() - startedAt,
      },
    });
  } catch (error) {
    self.postMessage({
      requestId: event.data.requestId,
      error: error instanceof Error ? error.message : "Unknown inference worker error",
    });
  }
});

export {};
