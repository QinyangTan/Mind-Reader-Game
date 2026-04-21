import { entityById, getQuestionsForCategory } from "@/lib/data/entities";
import { toProbability } from "@/lib/game/scoring";
import type {
  EntityCategory,
  GameEntity,
  QuestionDefinition,
  RankedCandidate,
} from "@/types/game";

type EntityResolver = (id: string) => GameEntity | undefined;

/**
 * Candidates considered in the endgame split metric — the question picker
 * prioritizes questions that disagree across these top-K entities.
 */
const ENDGAME_TOP_K = 4;

/**
 * When `remainingQuestions` is at or below this, we fully commit to
 * endgame scoring (prioritize top-K split over broad entropy).
 */
const ENDGAME_REMAINING_THRESHOLD = 5;

/**
 * Even mid-game, if the top candidate is already confident, treat the
 * selection as endgame-adjacent so we ask questions that break ties among
 * the final few contenders rather than questions that are only useful for
 * the long tail.
 */
const ENDGAME_LEADER_CONFIDENCE = 0.32;

function makeResolver(extraEntities: GameEntity[]): EntityResolver {
  if (extraEntities.length === 0) {
    return (id) => entityById.get(id);
  }

  const extras = new Map(extraEntities.map((entity) => [entity.id, entity] as const));
  return (id) => entityById.get(id) ?? extras.get(id);
}

function normalizedEntropy(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return 0;
  }

  const entropy = values.reduce((sum, value) => {
    if (value === 0) {
      return sum;
    }

    const share = value / total;
    return sum - share * Math.log2(share);
  }, 0);

  return entropy / Math.log2(values.length);
}

/**
 * Confidence-weighted mean pairwise distance of the top-K candidates'
 * attribute values. Returns a value in [0, 1] where 1 means the question
 * perfectly splits the leading candidates.
 */
function topKSplit(
  question: QuestionDefinition,
  rankedCandidates: RankedCandidate[],
  resolveEntity: EntityResolver,
) {
  const top = rankedCandidates.slice(0, ENDGAME_TOP_K);
  const resolved = top
    .map((candidate) => {
      const entity = resolveEntity(candidate.entityId);
      return entity
        ? { entity, confidence: candidate.confidence }
        : null;
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

  if (weightSum === 0) {
    return 0;
  }

  return weightedDistance / weightSum;
}

function scoreQuestion(
  question: QuestionDefinition,
  rankedCandidates: RankedCandidate[],
  resolveEntity: EntityResolver,
  endgame: boolean,
) {
  const pool = rankedCandidates.slice(0, 28);
  const totalWeight = pool.reduce((sum, candidate) => sum + candidate.confidence, 0) || 1;

  let weightedAverage = 0;
  let unknownWeight = 0;
  const buckets = {
    yes: 0,
    no: 0,
    probably: 0,
    probably_not: 0,
    unknown: 0,
  };

  for (const candidate of pool) {
    const entity = resolveEntity(candidate.entityId);

    if (!entity) {
      continue;
    }

    const value = entity.attributes[question.attributeKey];
    const weight = candidate.confidence;

    weightedAverage += toProbability(value) * weight;
    buckets[value] += weight;

    if (value === "unknown") {
      unknownWeight += weight;
    }
  }

  weightedAverage /= totalWeight;

  let variance = 0;

  for (const candidate of pool) {
    const entity = resolveEntity(candidate.entityId);

    if (!entity) {
      continue;
    }

    const value = entity.attributes[question.attributeKey];
    variance += candidate.confidence * (toProbability(value) - weightedAverage) ** 2;
  }

  variance /= totalWeight;

  const balance = 1 - Math.abs(weightedAverage - 0.5) * 2;
  const spread = Math.min(1, variance / 0.25);
  const certainty = 1 - unknownWeight / totalWeight;
  const diversity = normalizedEntropy(Object.values(buckets));
  const split = topKSplit(question, rankedCandidates, resolveEntity);
  const weightBonus = ((question.weight ?? 1) - 1) * 0.08;

  if (endgame) {
    // Endgame: top-K split dominates. The long tail of candidates no longer
    // matters — the chamber already knows which 2–4 entities are real
    // possibilities and needs the single question that best separates them.
    return split * 0.6 + balance * 0.18 + certainty * 0.1 + spread * 0.07 + weightBonus;
  }

  return (
    balance * 0.38 +
    spread * 0.28 +
    certainty * 0.16 +
    diversity * 0.06 +
    split * 0.12 +
    weightBonus
  );
}

function isEndgame(
  rankedCandidates: RankedCandidate[],
  remainingQuestions: number | undefined,
) {
  if (remainingQuestions !== undefined && remainingQuestions <= ENDGAME_REMAINING_THRESHOLD) {
    return true;
  }

  const leader = rankedCandidates[0];
  if (leader && leader.confidence >= ENDGAME_LEADER_CONFIDENCE) {
    return true;
  }

  return false;
}

export function selectNextQuestion(
  category: EntityCategory,
  askedQuestionIds: string[],
  rankedCandidates: RankedCandidate[],
  extraEntities: GameEntity[] = [],
  remainingQuestions?: number,
) {
  const asked = new Set(askedQuestionIds);
  const available = getQuestionsForCategory(category).filter((question) => !asked.has(question.id));

  if (available.length === 0) {
    return null;
  }

  const resolve = makeResolver(extraEntities);
  const endgame = isEndgame(rankedCandidates, remainingQuestions);

  return (
    available
      .map((question) => ({
        question,
        score: scoreQuestion(question, rankedCandidates, resolve, endgame),
      }))
      .toSorted((left, right) => right.score - left.score)[0]?.question ?? null
  );
}
