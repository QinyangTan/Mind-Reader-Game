import { questionById } from "@/lib/data/questions";
import { teachCaseToEntity } from "@/lib/game/teach";
import type {
  AnsweredQuestion,
  AttributeKey,
  CandidateUncertaintyMetrics,
  EntityCategory,
  GameEntity,
  LearnedEntityStore,
  LearnedInferenceModel,
  NormalizedAnswer,
  QuestionDefinition,
  RankedCandidate,
  TeachCase,
} from "@/types/game";

const normalizedAnswers: readonly NormalizedAnswer[] = [
  "yes",
  "no",
  "probably",
  "probably_not",
  "unknown",
];

/**
 * Base pseudo-count matrix for P(observed answer | true attribute value).
 *
 * These counts encode the prior confusion pattern before any gameplay data:
 * exact matches dominate, "probably" / "probably not" are treated as partial
 * agreement, and "unknown" stays weak rather than destructive. Learned counts
 * are added on top of this matrix, so no observation ever collapses a
 * candidate to literal zero probability.
 */
const BASE_PSEUDOCOUNTS: Record<NormalizedAnswer, Record<NormalizedAnswer, number>> = {
  yes: {
    yes: 6.5,
    probably: 2.4,
    unknown: 1.45,
    probably_not: 0.45,
    no: 0.18,
  },
  no: {
    yes: 0.18,
    probably: 0.45,
    unknown: 1.45,
    probably_not: 2.4,
    no: 6.5,
  },
  probably: {
    yes: 1.95,
    probably: 4.1,
    unknown: 1.85,
    probably_not: 0.92,
    no: 0.34,
  },
  probably_not: {
    yes: 0.34,
    probably: 0.92,
    unknown: 1.85,
    probably_not: 4.1,
    no: 1.95,
  },
  unknown: {
    yes: 1.2,
    probably: 1.35,
    unknown: 2.8,
    probably_not: 1.35,
    no: 1.2,
  },
};

const ENTITY_PRIOR_SMOOTHING = 1.5;
const ENTITY_PRIOR_LOG_WEIGHT = 0.16;
const BASE_QUESTION_ENTROPY_DROP = 0.09;
const QUESTION_UTILITY_SMOOTHING = 3;

export const defaultLearnedInferenceModel: LearnedInferenceModel = {
  version: 1,
  attributeAnswerCounts: {},
  questionStats: {},
  readEntityCounts: {},
};

function answerCountKey(
  category: EntityCategory,
  attributeKey: AttributeKey,
  trueValue: NormalizedAnswer,
  observedAnswer: NormalizedAnswer,
) {
  return `${category}|${attributeKey}|${trueValue}|${observedAnswer}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function recordAttributeObservation(
  model: LearnedInferenceModel,
  category: EntityCategory,
  attributeKey: AttributeKey,
  trueValue: NormalizedAnswer,
  observedAnswer: NormalizedAnswer,
  count = 1,
) {
  const key = answerCountKey(category, attributeKey, trueValue, observedAnswer);
  return {
    ...model,
    attributeAnswerCounts: {
      ...model.attributeAnswerCounts,
      [key]: (model.attributeAnswerCounts[key] ?? 0) + count,
    },
  };
}

export function recordQuestionEntropyDrop(
  model: LearnedInferenceModel,
  questionId: string,
  entropyDrop: number,
) {
  const current = model.questionStats[questionId] ?? {
    askedCount: 0,
    totalEntropyDrop: 0,
  };

  return {
    ...model,
    questionStats: {
      ...model.questionStats,
      [questionId]: {
        askedCount: current.askedCount + 1,
        totalEntropyDrop: current.totalEntropyDrop + Math.max(0, entropyDrop),
      },
    },
  };
}

export function recordReadEntityConfirmation(
  model: LearnedInferenceModel,
  entityId: string,
) {
  return {
    ...model,
    readEntityCounts: {
      ...model.readEntityCounts,
      [entityId]: (model.readEntityCounts[entityId] ?? 0) + 1,
    },
  };
}

export function getSmoothedLikelihood(
  model: LearnedInferenceModel | undefined,
  category: EntityCategory,
  attributeKey: AttributeKey,
  trueValue: NormalizedAnswer,
  observedAnswer: NormalizedAnswer,
) {
  const priors = BASE_PSEUDOCOUNTS[trueValue];
  let numerator = priors[observedAnswer];
  let denominator = 0;

  for (const candidateAnswer of normalizedAnswers) {
    const key = answerCountKey(category, attributeKey, trueValue, candidateAnswer);
    denominator += priors[candidateAnswer] + (model?.attributeAnswerCounts[key] ?? 0);
  }

  numerator += model?.attributeAnswerCounts[
    answerCountKey(category, attributeKey, trueValue, observedAnswer)
  ] ?? 0;

  return numerator / denominator;
}

export function getEntityPriorLogBoost(
  model: LearnedInferenceModel | undefined,
  categoryPool: readonly GameEntity[],
  entityId: string,
) {
  if (!model || categoryPool.length === 0) {
    return 0;
  }

  const total = categoryPool.reduce(
    (sum, entity) => sum + (model.readEntityCounts[entity.id] ?? 0),
    0,
  );
  const count = model.readEntityCounts[entityId] ?? 0;
  const numerator = count + ENTITY_PRIOR_SMOOTHING;
  const denominator = total + ENTITY_PRIOR_SMOOTHING * categoryPool.length;
  const uniform = 1 / categoryPool.length;
  const smoothedPrior = numerator / denominator;

  return Math.log(smoothedPrior / uniform) * ENTITY_PRIOR_LOG_WEIGHT;
}

function entropyFromProbabilities(probabilities: number[]) {
  const filtered = probabilities.filter((value) => value > 0);
  if (filtered.length === 0) {
    return 0;
  }

  return -filtered.reduce((sum, value) => sum + value * Math.log2(value), 0);
}

export function getUncertaintyMetrics(
  rankings: RankedCandidate[],
): CandidateUncertaintyMetrics {
  if (rankings.length === 0) {
    return {
      entropy: 0,
      normalizedEntropy: 0,
      effectiveCandidateCount: 0,
    };
  }

  const total = rankings.reduce((sum, candidate) => sum + candidate.confidence, 0) || 1;
  const probabilities = rankings.map((candidate) => candidate.confidence / total);
  const entropy = entropyFromProbabilities(probabilities);
  const normalizedEntropy =
    rankings.length <= 1 ? 0 : entropy / Math.log2(rankings.length);
  const concentration = probabilities.reduce(
    (sum, candidate) => sum + candidate ** 2,
    0,
  );

  return {
    entropy,
    normalizedEntropy,
    effectiveCandidateCount: concentration > 0 ? 1 / concentration : rankings.length,
  };
}

export function getQuestionUsefulnessMultiplier(
  model: LearnedInferenceModel | undefined,
  questionId: string,
) {
  const stat = model?.questionStats[questionId];
  if (!stat) {
    return 1;
  }

  const meanEntropyDrop =
    (stat.totalEntropyDrop + BASE_QUESTION_ENTROPY_DROP * QUESTION_UTILITY_SMOOTHING) /
    (stat.askedCount + QUESTION_UTILITY_SMOOTHING);

  return clamp(0.94 + meanEntropyDrop * 0.7, 0.94, 1.14);
}

export function replayEntropyDrops(
  category: EntityCategory,
  asked: AnsweredQuestion[],
  rankCandidatesForTrail: (trail: AnsweredQuestion[]) => RankedCandidate[],
) {
  const drops: Array<{ questionId: string; entropyDrop: number }> = [];
  let trail: AnsweredQuestion[] = [];
  let previousMetrics = getUncertaintyMetrics(rankCandidatesForTrail(trail));

  for (const answer of asked) {
    trail = [...trail, answer];
    const currentMetrics = getUncertaintyMetrics(rankCandidatesForTrail(trail));
    drops.push({
      questionId: answer.questionId,
      entropyDrop: Math.max(0, previousMetrics.entropy - currentMetrics.entropy),
    });
    previousMetrics = currentMetrics;
  }

  return drops;
}

export function applyQuestionEntropyDrops(
  model: LearnedInferenceModel,
  drops: Array<{ questionId: string; entropyDrop: number }>,
) {
  let next = model;

  for (const drop of drops) {
    next = recordQuestionEntropyDrop(next, drop.questionId, drop.entropyDrop);
  }

  return next;
}

export function applyResolvedEntityAnswers(
  model: LearnedInferenceModel,
  category: EntityCategory,
  entity: GameEntity,
  asked: AnsweredQuestion[],
) {
  let next = model;

  for (const answer of asked) {
    next = recordAttributeObservation(
      next,
      category,
      answer.attributeKey,
      entity.attributes[answer.attributeKey],
      answer.answer,
    );
  }

  return next;
}

export function applyCompletedEntityLearning(
  model: LearnedInferenceModel,
  category: EntityCategory,
  entity: GameEntity,
  asked: AnsweredQuestion[],
) {
  return recordReadEntityConfirmation(
    applyResolvedEntityAnswers(model, category, entity, asked),
    entity.id,
  );
}

export function applyTeachCaseLearning(
  model: LearnedInferenceModel,
  teachCase: TeachCase,
) {
  const entity = teachCaseToEntity(teachCase);
  return applyCompletedEntityLearning(model, teachCase.category, entity, teachCase.answers);
}

export function mergeLearnedModel(
  store: LearnedEntityStore,
  update: (model: LearnedInferenceModel) => LearnedInferenceModel,
) {
  return {
    ...store,
    model: update(store.model),
  };
}

export function getQuestionStatSummary(
  model: LearnedInferenceModel,
  category: EntityCategory,
) {
  return Object.entries(model.questionStats)
    .map(([questionId, stat]) => {
      const question = questionById.get(questionId);
      if (!question || !question.supportedCategories.includes(category)) {
        return null;
      }

      const averageEntropyDrop =
        stat.askedCount > 0 ? stat.totalEntropyDrop / stat.askedCount : 0;

      return {
        questionId,
        askedCount: stat.askedCount,
        averageEntropyDrop,
        question,
      };
    })
    .filter(
      (
        entry,
      ): entry is {
        questionId: string;
        askedCount: number;
        averageEntropyDrop: number;
        question: QuestionDefinition;
      } => entry !== null,
    )
    .toSorted((left, right) => right.averageEntropyDrop - left.averageEntropyDrop);
}
