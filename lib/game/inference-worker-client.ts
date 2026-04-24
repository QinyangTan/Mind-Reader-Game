import { rankAvailableQuestions, type RankedQuestionOption } from "@/lib/game/question-selection";
import { rankCandidates } from "@/lib/game/scoring";
import type {
  AnsweredQuestion,
  EntityCategory,
  GameEntity,
  LearnedInferenceModel,
  RankedCandidate,
} from "@/types/game";

export interface InferenceRankingInput {
  category: EntityCategory;
  asked: AnsweredQuestion[];
  rejectedGuessIds: string[];
  askedQuestionIds: string[];
  remainingQuestions: number;
  extraEntities: GameEntity[];
  inferenceModel?: LearnedInferenceModel;
}

export interface InferenceRankingResult {
  rankedCandidates: RankedCandidate[];
  rankedQuestions: RankedQuestionOption[];
  durationMs: number;
  source: "worker" | "sync" | "cache";
}

interface WorkerRequest extends InferenceRankingInput {
  requestId: number;
}

interface WorkerResponse {
  requestId: number;
  result?: Omit<InferenceRankingResult, "source">;
  error?: string;
}

let worker: Worker | null = null;
let nextRequestId = 1;
const CACHE_LIMIT = 24;
const resultCache = new Map<string, InferenceRankingResult>();
const pending = new Map<
  number,
  {
    resolve: (value: InferenceRankingResult) => void;
    reject: (reason?: unknown) => void;
  }
>();

function fingerprintModel(model: LearnedInferenceModel | undefined) {
  if (!model) {
    return "seed";
  }

  return [
    model.version,
    Object.keys(model.attributeAnswerCounts).length,
    Object.keys(model.questionStats).length,
    Object.keys(model.readEntityCounts).length,
  ].join(":");
}

function cacheKey(input: InferenceRankingInput) {
  return JSON.stringify({
    category: input.category,
    asked: input.asked.map((entry) => [entry.questionId, entry.answer]),
    rejected: input.rejectedGuessIds,
    askedQuestions: input.askedQuestionIds,
    remaining: input.remainingQuestions,
    extras: input.extraEntities.map((entity) => entity.id),
    model: fingerprintModel(input.inferenceModel),
  });
}

function rememberResult(key: string, result: InferenceRankingResult) {
  resultCache.delete(key);
  resultCache.set(key, result);

  if (resultCache.size <= CACHE_LIMIT) {
    return;
  }

  const oldest = resultCache.keys().next().value;
  if (oldest) {
    resultCache.delete(oldest);
  }
}

function cachedResult(key: string) {
  const result = resultCache.get(key);
  if (!result) {
    return null;
  }

  resultCache.delete(key);
  resultCache.set(key, result);
  return {
    ...result,
    source: "cache" as const,
    durationMs: 0,
  };
}

export function computeInferenceRankingSync(input: InferenceRankingInput): InferenceRankingResult {
  const startedAt = performance.now();
  const rankedCandidates = rankCandidates(
    input.category,
    input.asked,
    input.rejectedGuessIds,
    input.extraEntities,
    input.inferenceModel,
  );

  return {
    rankedCandidates,
    rankedQuestions: rankAvailableQuestions(
      input.category,
      input.askedQuestionIds,
      rankedCandidates,
      input.extraEntities,
      input.remainingQuestions,
      input.inferenceModel,
    ),
    durationMs: performance.now() - startedAt,
    source: "sync",
  };
}

function getWorker() {
  if (typeof Worker === "undefined") {
    return null;
  }

  if (!worker) {
    worker = new Worker(new URL("./inference.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      const entry = pending.get(event.data.requestId);
      if (!entry) {
        return;
      }

      pending.delete(event.data.requestId);

      if (event.data.error || !event.data.result) {
        entry.reject(new Error(event.data.error ?? "Worker returned no inference result"));
        return;
      }

      entry.resolve({
        ...event.data.result,
        source: "worker",
      });
    });
  }

  return worker;
}

export function computeInferenceRanking(input: InferenceRankingInput) {
  const key = cacheKey(input);
  const cached = cachedResult(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  const activeWorker = getWorker();
  if (!activeWorker) {
    const result = computeInferenceRankingSync(input);
    rememberResult(key, result);
    return Promise.resolve(result);
  }

  const requestId = nextRequestId;
  nextRequestId += 1;

  return new Promise<InferenceRankingResult>((resolve, reject) => {
    pending.set(requestId, {
      resolve: (result) => {
        rememberResult(key, result);
        resolve(result);
      },
      reject,
    });
    activeWorker.postMessage({
      ...input,
      requestId,
    } satisfies WorkerRequest);
  }).catch(() => {
    const result = computeInferenceRankingSync(input);
    rememberResult(key, result);
    return result;
  });
}
