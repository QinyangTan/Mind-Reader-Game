import { entityById, getQuestionsForCategory } from "@/lib/data/entities";
import { questionById } from "@/lib/data/questions";
import {
  getQuestionUsefulnessMultiplier,
  getSmoothedLikelihood,
  getUncertaintyMetrics,
} from "@/lib/game/inference-model";
import { toProbability } from "@/lib/game/scoring";
import type {
  EntityCategory,
  GameEntity,
  LearnedInferenceModel,
  NormalizedAnswer,
  QuestionDefinition,
  QuestionStage,
  RankedCandidate,
} from "@/types/game";

type EntityResolver = (id: string) => GameEntity | undefined;

export interface RankedQuestionOption {
  question: QuestionDefinition;
  score: number;
  informationGain: number;
  predictedAnswerEntropy: number;
  targetStage: QuestionStage;
}

const normalizedAnswers: readonly NormalizedAnswer[] = [
  "yes",
  "no",
  "probably",
  "probably_not",
  "unknown",
];

const TOP_POOL_SIZE = 40;
const ENDGAME_TOP_K = 5;
const RECENT_GROUP_WINDOW = 2;
const RECENT_FAMILY_WINDOW = 3;
const stageOrder: QuestionStage[] = [
  "broad",
  "category",
  "profile",
  "specialist",
  "fine",
];

const stageIndex = Object.fromEntries(
  stageOrder.map((stage, index) => [stage, index]),
) as Record<QuestionStage, number>;

function makeResolver(extraEntities: GameEntity[]): EntityResolver {
  if (extraEntities.length === 0) {
    return (id) => entityById.get(id);
  }

  const extras = new Map(extraEntities.map((entity) => [entity.id, entity] as const));
  return (id) => entityById.get(id) ?? extras.get(id);
}

function entropy(values: number[]) {
  const filtered = values.filter((value) => value > 0);
  if (filtered.length === 0) {
    return 0;
  }

  return -filtered.reduce((sum, value) => sum + value * Math.log2(value), 0);
}

function normalizedEntropy(values: number[]) {
  if (values.length <= 1) {
    return 0;
  }
  return entropy(values) / Math.log2(values.length);
}

function topKSplit(
  question: QuestionDefinition,
  rankedCandidates: RankedCandidate[],
  resolveEntity: EntityResolver,
) {
  const top = rankedCandidates.slice(0, ENDGAME_TOP_K);
  const resolved = top
    .map((candidate) => {
      const entity = resolveEntity(candidate.entityId);
      return entity ? { entity, confidence: candidate.confidence } : null;
    })
    .filter((entry): entry is { entity: GameEntity; confidence: number } => entry !== null);

  if (resolved.length < 2) {
    return 0;
  }

  let weightedDistance = 0;
  let weightSum = 0;

  for (let i = 0; i < resolved.length; i += 1) {
    for (let j = i + 1; j < resolved.length; j += 1) {
      const left = resolved[i];
      const right = resolved[j];
      const distance = Math.abs(
        toProbability(left.entity.attributes[question.attributeKey]) -
          toProbability(right.entity.attributes[question.attributeKey]),
      );
      const pairWeight = left.confidence * right.confidence;
      weightedDistance += distance * pairWeight;
      weightSum += pairWeight;
    }
  }

  return weightSum > 0 ? weightedDistance / weightSum : 0;
}

function determineTargetStage(
  rankedCandidates: RankedCandidate[],
  questionsAsked: number,
  remainingQuestions: number | undefined,
) {
  if (questionsAsked === 0) {
    return "broad";
  }

  const metrics = getUncertaintyMetrics(rankedCandidates);

  if (
    remainingQuestions !== undefined &&
    remainingQuestions <= 1
  ) {
    return "fine";
  }

  if (metrics.effectiveCandidateCount <= 2.2 || metrics.normalizedEntropy <= 0.1) {
    return "fine";
  }

  if (
    (remainingQuestions !== undefined && remainingQuestions <= 3) ||
    metrics.effectiveCandidateCount <= 4.4 ||
    metrics.normalizedEntropy <= 0.24
  ) {
    return "specialist";
  }

  if (metrics.effectiveCandidateCount <= 8.2 || metrics.normalizedEntropy <= 0.42) {
    return "profile";
  }

  if (questionsAsked >= 2 || metrics.normalizedEntropy <= 0.66) {
    return "category";
  }

  return "broad";
}

function stageMultiplier(
  stage: QuestionStage,
  targetStage: QuestionStage,
) {
  const distance = Math.abs(stageIndex[stage] - stageIndex[targetStage]);
  const distanceWeights = [1.18, 1.04, 0.82, 0.62, 0.46];
  let multiplier = distanceWeights[distance] ?? 0.46;

  if (stageIndex[stage] < stageIndex[targetStage] && distance === 1) {
    multiplier += 0.04;
  }

  return multiplier;
}

function repetitionMultiplier(
  question: QuestionDefinition,
  askedQuestionIds: string[],
) {
  const recent = askedQuestionIds
    .slice(-RECENT_FAMILY_WINDOW)
    .map((id) => questionById.get(id))
    .filter((entry): entry is QuestionDefinition => !!entry);

  if (recent.length === 0) {
    return 1.05;
  }

  const recentFamilies = new Set(recent.map((entry) => entry.family));
  const recentGroups = recent.slice(-RECENT_GROUP_WINDOW).map((entry) => entry.group);
  const recentStages = recent.slice(-RECENT_GROUP_WINDOW).map((entry) => entry.stage);
  const last = recent[recent.length - 1];

  let multiplier = 1;

  if (last.family === question.family) {
    multiplier *= 0.42;
  } else if (recentFamilies.has(question.family)) {
    multiplier *= 0.74;
  }

  if (recentGroups.includes(question.group)) {
    multiplier *= 0.86;
  } else {
    multiplier *= 1.03;
  }

  if (recentStages.includes(question.stage)) {
    multiplier *= 0.94;
  } else {
    multiplier *= 1.02;
  }

  return multiplier;
}

function coverageMultiplier(
  question: QuestionDefinition,
  askedQuestionIds: string[],
) {
  const askedQuestions = askedQuestionIds
    .map((id) => questionById.get(id))
    .filter((entry): entry is QuestionDefinition => !!entry);

  if (askedQuestions.every((asked) => asked.group !== question.group)) {
    return 1.05;
  }

  return 1;
}

function expectedEntropyMetrics(
  category: EntityCategory,
  question: QuestionDefinition,
  rankedCandidates: RankedCandidate[],
  resolveEntity: EntityResolver,
  inferenceModel?: LearnedInferenceModel,
) {
  const pool = rankedCandidates.slice(0, TOP_POOL_SIZE);
  if (pool.length === 0) {
    return {
      informationGain: 0,
      predictedAnswerEntropy: 0,
      certainty: 0,
    };
  }

  const normalizedPoolMass =
    pool.reduce((sum, candidate) => sum + candidate.confidence, 0) || 1;
  const priors = pool.map((candidate) => candidate.confidence / normalizedPoolMass);
  const currentEntropy = entropy(priors);
  const answerMass = Object.fromEntries(
    normalizedAnswers.map((answer) => [answer, 0]),
  ) as Record<NormalizedAnswer, number>;
  const posteriorWeights = Object.fromEntries(
    normalizedAnswers.map((answer) => [answer, [] as number[]]),
  ) as Record<NormalizedAnswer, number[]>;

  for (let index = 0; index < pool.length; index += 1) {
    const candidate = pool[index];
    const entity = resolveEntity(candidate.entityId);
    if (!entity) {
      continue;
    }

    const prior = priors[index];
    const trueValue = entity.attributes[question.attributeKey];

    for (const observedAnswer of normalizedAnswers) {
      const mass =
        prior *
        getSmoothedLikelihood(
          inferenceModel,
          category,
          question.attributeKey,
          trueValue,
          observedAnswer,
        );

      answerMass[observedAnswer] += mass;
      posteriorWeights[observedAnswer].push(mass);
    }
  }

  const answerProbabilities = normalizedAnswers.map((answer) => answerMass[answer]);
  const predictedAnswerEntropy = normalizedEntropy(answerProbabilities);
  const certainty = 1 - answerMass.unknown;

  let expectedPosteriorEntropy = 0;

  for (const observedAnswer of normalizedAnswers) {
    const mass = answerMass[observedAnswer];
    if (mass <= 0) {
      continue;
    }

    const posterior = posteriorWeights[observedAnswer].map((value) => value / mass);
    expectedPosteriorEntropy += mass * entropy(posterior);
  }

  return {
    informationGain: Math.max(0, currentEntropy - expectedPosteriorEntropy),
    predictedAnswerEntropy,
    certainty,
  };
}

export function rankAvailableQuestions(
  category: EntityCategory,
  askedQuestionIds: string[],
  rankedCandidates: RankedCandidate[],
  extraEntities: GameEntity[] = [],
  remainingQuestions?: number,
  inferenceModel?: LearnedInferenceModel,
) {
  const asked = new Set(askedQuestionIds);
  const available = getQuestionsForCategory(category).filter((question) => !asked.has(question.id));

  if (available.length === 0) {
    return [];
  }

  const resolve = makeResolver(extraEntities);
  const questionsAsked = askedQuestionIds.length;
  const targetStage = determineTargetStage(rankedCandidates, questionsAsked, remainingQuestions);
  const uncertainty = getUncertaintyMetrics(rankedCandidates);

  return available
    .map<RankedQuestionOption>((question) => {
      const metrics = expectedEntropyMetrics(
        category,
        question,
        rankedCandidates,
        resolve,
        inferenceModel,
      );
      const split = topKSplit(question, rankedCandidates, resolve);
      const weightBonus = ((question.weight ?? 1) - 1) * 0.07;
      const baseScore =
        metrics.informationGain * 0.58 +
        metrics.predictedAnswerEntropy * 0.16 +
        split * 0.16 +
        metrics.certainty * 0.08 +
        weightBonus;
      const structural =
        stageMultiplier(question.stage, targetStage) *
        repetitionMultiplier(question, askedQuestionIds) *
        coverageMultiplier(question, askedQuestionIds) *
        getQuestionUsefulnessMultiplier(inferenceModel, question.id);
      const earlyNarrowPenalty =
        uncertainty.normalizedEntropy > 0.7 &&
        stageIndex[question.stage] > stageIndex[targetStage] + 1
          ? 0.7
          : 1;

      return {
        question,
        score: baseScore * structural * earlyNarrowPenalty,
        informationGain: metrics.informationGain,
        predictedAnswerEntropy: metrics.predictedAnswerEntropy,
        targetStage,
      };
    })
    .toSorted((left, right) => right.score - left.score);
}

export function selectNextQuestion(
  category: EntityCategory,
  askedQuestionIds: string[],
  rankedCandidates: RankedCandidate[],
  extraEntities: GameEntity[] = [],
  remainingQuestions?: number,
  inferenceModel?: LearnedInferenceModel,
) {
  return rankAvailableQuestions(
    category,
    askedQuestionIds,
    rankedCandidates,
    extraEntities,
    remainingQuestions,
    inferenceModel,
  )[0]?.question ?? null;
}
