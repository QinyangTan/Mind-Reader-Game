import { entityById, getQuestionsForCategory } from "@/lib/data/entities";
import { questionById } from "@/lib/data/questions";
import {
  getQuestionUsefulnessMultiplier,
  getSmoothedLikelihood,
  getUncertaintyMetrics,
} from "@/lib/game/inference-model";
import { answerToProbability } from "@/lib/game/answer-evidence";
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
  profileCoverage: number;
  expectedLeaderConfidence: number;
  expectedMargin: number;
  expectedEffectiveCandidateCount: number;
  decisionQuality: number;
  targetStage: QuestionStage;
  repetitionMultiplier: number;
  layerMultiplier: number;
}

const normalizedAnswers: readonly NormalizedAnswer[] = [
  "yes",
  "no",
  "probably",
  "probably_not",
  "unknown",
];

const TOP_POOL_SIZE = 64;
const ENDGAME_TOP_K = 5;
const ENDGAME_WIDE_TOP_K = 10;
const RECENT_GROUP_WINDOW = 2;
const RECENT_FAMILY_WINDOW = 3;
const HIGH_VALUE_IG_FLOOR = 0.035;
const HIGH_VALUE_SPLIT_FLOOR = 0.055;
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
  topK = ENDGAME_TOP_K,
) {
  const top = rankedCandidates.slice(0, topK);
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
        answerToProbability(left.entity.attributes[question.attributeKey]) -
          answerToProbability(right.entity.attributes[question.attributeKey]),
      );
      const pairWeight = left.confidence * right.confidence;
      weightedDistance += distance * pairWeight;
      weightSum += pairWeight;
    }
  }

  return weightSum > 0 ? weightedDistance / weightSum : 0;
}

function topKnownCoverage(
  question: QuestionDefinition,
  rankedCandidates: RankedCandidate[],
  resolveEntity: EntityResolver,
  topK = ENDGAME_WIDE_TOP_K,
) {
  const top = rankedCandidates.slice(0, topK);
  const total = top.reduce((sum, candidate) => sum + candidate.confidence, 0) || 1;
  return (
    top.reduce((sum, candidate) => {
      const entity = resolveEntity(candidate.entityId);
      if (!entity || entity.attributes[question.attributeKey] === "unknown") {
        return sum;
      }
      return sum + candidate.confidence;
    }, 0) / total
  );
}

function directPairSeparation(
  question: QuestionDefinition,
  rankedCandidates: RankedCandidate[],
  resolveEntity: EntityResolver,
  topK = ENDGAME_TOP_K,
) {
  const top = rankedCandidates.slice(0, topK);
  let totalDistance = 0;
  let knownPairs = 0;
  let maxDistance = 0;

  for (let i = 0; i < top.length; i += 1) {
    for (let j = i + 1; j < top.length; j += 1) {
      const left = resolveEntity(top[i].entityId);
      const right = resolveEntity(top[j].entityId);
      if (!left || !right) {
        continue;
      }

      const leftValue = left.attributes[question.attributeKey];
      const rightValue = right.attributes[question.attributeKey];
      if (leftValue === "unknown" || rightValue === "unknown") {
        continue;
      }

      const distance = Math.abs(answerToProbability(leftValue) - answerToProbability(rightValue));
      totalDistance += distance;
      maxDistance = Math.max(maxDistance, distance);
      knownPairs += 1;
    }
  }

  if (knownPairs === 0) {
    return 0;
  }

  return totalDistance / knownPairs * 0.72 + maxDistance * 0.28;
}

export function determineTargetQuestionStage(
  rankedCandidates: RankedCandidate[],
  questionsAsked: number,
  remainingQuestions: number | undefined,
) {
  if (questionsAsked === 0) {
    return "broad";
  }

  const metrics = getUncertaintyMetrics(rankedCandidates);

  if (remainingQuestions !== undefined && remainingQuestions <= 1) {
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

  if (questionsAsked >= 3 || metrics.normalizedEntropy <= 0.62) {
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
    multiplier *= 0.32;
  } else if (recentFamilies.has(question.family)) {
    multiplier *= 0.68;
  }

  if (recentGroups.includes(question.group)) {
    multiplier *= 0.82;
  } else {
    multiplier *= 1.03;
  }

  if (last.group === question.group) {
    multiplier *= 0.88;
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

  const groupIsFresh = askedQuestions.every((asked) => asked.group !== question.group);
  const familyIsFresh = askedQuestions.every((asked) => asked.family !== question.family);

  if (groupIsFresh && familyIsFresh) {
    return 1.1;
  }

  if (familyIsFresh) {
    return 1.05;
  }

  if (groupIsFresh) {
    return 1.03;
  }

  return 1;
}

function prerequisiteMultiplier(
  question: QuestionDefinition,
  askedQuestionIds: string[],
) {
  if (!question.requiredBefore || question.requiredBefore.length === 0) {
    return 1;
  }

  const asked = new Set(askedQuestionIds);
  return question.requiredBefore.every((id) => asked.has(id)) ? 1 : 0;
}

function discriminatorMultiplier(
  question: QuestionDefinition,
  rankedCandidates: RankedCandidate[],
  resolveEntity: EntityResolver,
) {
  if (!question.discriminatorFor || question.discriminatorFor.length === 0) {
    return 1;
  }

  const top = rankedCandidates.slice(0, ENDGAME_TOP_K);
  const signals = question.discriminatorFor.map((attributeKey) => {
    const values = top
      .map((candidate) => resolveEntity(candidate.entityId)?.attributes[attributeKey])
      .filter(Boolean);
    return new Set(values).size;
  });
  const hasUsefulDiscriminator = signals.some((count) => count > 1);

  return hasUsefulDiscriminator ? 1.06 : 0.92;
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
      profileCoverage: 0,
      certainty: 0,
      expectedLeaderConfidence: 0,
      expectedMargin: 0,
      expectedEffectiveCandidateCount: rankedCandidates.length,
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
  let profileCoverage = 0;

  for (let index = 0; index < pool.length; index += 1) {
    const candidate = pool[index];
    const entity = resolveEntity(candidate.entityId);
    if (!entity) {
      continue;
    }

    const prior = priors[index];
    const trueValue = entity.attributes[question.attributeKey];

    if (trueValue !== "unknown") {
      profileCoverage += prior;
    }

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
  let expectedLeaderConfidence = 0;
  let expectedMargin = 0;
  let expectedEffectiveCandidateCount = 0;

  for (const observedAnswer of normalizedAnswers) {
    const mass = answerMass[observedAnswer];
    if (mass <= 0) {
      continue;
    }

    const posterior = posteriorWeights[observedAnswer].map((value) => value / mass);
    expectedPosteriorEntropy += mass * entropy(posterior);

    const sortedPosterior = [...posterior].toSorted((left, right) => right - left);
    const leader = sortedPosterior[0] ?? 0;
    const runnerUp = sortedPosterior[1] ?? 0;
    const concentration = posterior.reduce((sum, value) => sum + value ** 2, 0);
    expectedLeaderConfidence += mass * leader;
    expectedMargin += mass * (leader - runnerUp);
    expectedEffectiveCandidateCount +=
      mass * (concentration > 0 ? 1 / concentration : pool.length);
  }

  return {
    informationGain: Math.max(0, currentEntropy - expectedPosteriorEntropy),
    predictedAnswerEntropy,
    profileCoverage,
    certainty,
    expectedLeaderConfidence,
    expectedMargin,
    expectedEffectiveCandidateCount,
  };
}

function evidenceCoverageMultiplier(profileCoverage: number) {
  if (profileCoverage >= 0.84) {
    return 1.08;
  }

  if (profileCoverage >= 0.62) {
    return 1.02;
  }

  if (profileCoverage >= 0.42) {
    return 0.88;
  }

  if (profileCoverage >= 0.24) {
    return 0.68;
  }

  return 0.46;
}

function highValueMultiplier(
  metrics: ReturnType<typeof expectedEntropyMetrics>,
  split: number,
  targetStage: QuestionStage,
) {
  const canBeNarrow =
    targetStage === "specialist" ||
    targetStage === "fine" ||
    metrics.expectedEffectiveCandidateCount <= 5;

  if (
    metrics.informationGain >= HIGH_VALUE_IG_FLOOR ||
    split >= HIGH_VALUE_SPLIT_FLOOR ||
    (canBeNarrow && metrics.expectedMargin >= 0.14)
  ) {
    return 1;
  }

  if (metrics.informationGain < 0.015 && split < 0.025) {
    return 0.58;
  }

  return 0.78;
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
  const askedAttributes = new Set(
    askedQuestionIds
      .map((id) => questionById.get(id)?.attributeKey)
      .filter((attributeKey): attributeKey is QuestionDefinition["attributeKey"] => !!attributeKey),
  );
  const available = getQuestionsForCategory(category).filter((question) => {
    if (asked.has(question.id)) {
      return false;
    }

    if (askedAttributes.has(question.attributeKey)) {
      return false;
    }

    return prerequisiteMultiplier(question, askedQuestionIds) > 0;
  });

  if (available.length === 0) {
    return [];
  }

  const resolve = makeResolver(extraEntities);
  const questionsAsked = askedQuestionIds.length;
  const targetStage = determineTargetQuestionStage(rankedCandidates, questionsAsked, remainingQuestions);
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
      const wideSplit = topKSplit(question, rankedCandidates, resolve, ENDGAME_WIDE_TOP_K);
      const pairSeparation = directPairSeparation(question, rankedCandidates, resolve);
      const endgameMode = remainingQuestions !== undefined && remainingQuestions <= 3;
      const leaderCoverage = topKnownCoverage(question, rankedCandidates, resolve);
      const weightBonus = ((question.weight ?? 1) - 1) * 0.07;
      const layerMultiplier = stageMultiplier(question.stage, targetStage);
      const repeatMultiplier = repetitionMultiplier(question, askedQuestionIds);
      const endgameFocus =
        endgameMode ||
        uncertainty.effectiveCandidateCount <= 8.2 ||
        uncertainty.normalizedEntropy <= 0.42;
      const informationWeight = endgameMode ? 0.24 : endgameFocus ? 0.46 : 0.62;
      const splitWeight = endgameMode ? 0.36 : endgameFocus ? 0.23 : 0.13;
      const convergenceWeight = endgameMode ? 0.28 : endgameFocus ? 0.21 : 0.08;
      const balanceWeight = endgameMode ? 0.04 : endgameFocus ? 0.1 : 0.15;
      const certaintyWeight = endgameMode ? 0.02 : endgameFocus ? 0.04 : 0.07;
      const coverageWeight = endgameMode ? 0.12 : endgameFocus ? 0.08 : 0.06;
      const convergenceScore =
        metrics.expectedMargin * 0.58 +
        metrics.expectedLeaderConfidence * 0.26 +
        (metrics.expectedEffectiveCandidateCount > 0
          ? (1 / metrics.expectedEffectiveCandidateCount) * 0.16
          : 0);
      const leaderSeparationScore =
        pairSeparation * 0.42 +
        wideSplit * 0.34 +
        split * 0.16 +
        leaderCoverage * 0.08;
      const baseScore =
        metrics.informationGain * informationWeight +
        metrics.predictedAnswerEntropy * balanceWeight +
        (endgameMode ? leaderSeparationScore : split) * splitWeight +
        convergenceScore * convergenceWeight +
        metrics.certainty * certaintyWeight +
        (endgameMode ? leaderCoverage : metrics.profileCoverage) * coverageWeight +
        weightBonus;
      const endgameStageMultiplier = !endgameMode
        ? 1
        : question.stage === "fine"
          ? 1.42
          : question.stage === "specialist"
            ? 1.34
            : question.stage === "profile"
              ? 0.96
              : question.stage === "category"
                ? leaderSeparationScore >= 0.22
                  ? 0.92
                  : 0.66
                : leaderSeparationScore >= 0.26
                  ? 0.78
                  : 0.5;
      const endgameCoverageMultiplier = !endgameMode
        ? 1
        : leaderCoverage >= 0.82
          ? 1.12
          : leaderCoverage >= 0.58
            ? 0.92
            : leaderCoverage >= 0.35
              ? 0.62
              : 0.36;
      const structural =
        layerMultiplier *
        repeatMultiplier *
        coverageMultiplier(question, askedQuestionIds) *
        evidenceCoverageMultiplier(metrics.profileCoverage) *
        discriminatorMultiplier(question, rankedCandidates, resolve) *
        getQuestionUsefulnessMultiplier(inferenceModel, question.id) *
        highValueMultiplier(metrics, endgameMode ? Math.max(split, wideSplit) : split, targetStage) *
        (endgameMode && pairSeparation >= 0.32 ? 1.18 : 1) *
        endgameStageMultiplier *
        endgameCoverageMultiplier;
      const earlyNarrowPenalty =
        uncertainty.normalizedEntropy > 0.7 &&
        stageIndex[question.stage] > stageIndex[targetStage] + 1
          ? 0.62
          : 1;

      return {
        question,
        score: baseScore * structural * earlyNarrowPenalty,
        informationGain: metrics.informationGain,
        predictedAnswerEntropy: metrics.predictedAnswerEntropy,
        profileCoverage: metrics.profileCoverage,
        expectedLeaderConfidence: metrics.expectedLeaderConfidence,
        expectedMargin: metrics.expectedMargin,
        expectedEffectiveCandidateCount: metrics.expectedEffectiveCandidateCount,
        decisionQuality:
          metrics.informationGain * 0.42 +
          split * 0.2 +
          metrics.expectedMargin * 0.18 +
          metrics.profileCoverage * 0.14 +
          metrics.predictedAnswerEntropy * 0.06,
        targetStage,
        repetitionMultiplier: repeatMultiplier,
        layerMultiplier,
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
