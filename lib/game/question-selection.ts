import { entityById, getQuestionsForCategory } from "@/lib/data/entities";
import { toProbability } from "@/lib/game/scoring";
import type {
  EntityCategory,
  QuestionDefinition,
  RankedCandidate,
} from "@/types/game";

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

function scoreQuestion(question: QuestionDefinition, rankedCandidates: RankedCandidate[]) {
  const pool = rankedCandidates.slice(0, 28);
  const totalWeight = pool.reduce((sum, candidate) => sum + candidate.confidence, 0) || 1;

  let weightedAverage = 0;
  let variance = 0;
  let unknownWeight = 0;
  const buckets = {
    yes: 0,
    no: 0,
    probably: 0,
    probably_not: 0,
    unknown: 0,
  };

  for (const candidate of pool) {
    const entity = entityById.get(candidate.entityId);

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

  for (const candidate of pool) {
    const entity = entityById.get(candidate.entityId);

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
  const weightBonus = ((question.weight ?? 1) - 1) * 0.08;

  return balance * 0.42 + spread * 0.33 + certainty * 0.18 + diversity * 0.07 + weightBonus;
}

export function selectNextQuestion(
  category: EntityCategory,
  askedQuestionIds: string[],
  rankedCandidates: RankedCandidate[],
) {
  const asked = new Set(askedQuestionIds);
  const available = getQuestionsForCategory(category).filter((question) => !asked.has(question.id));

  if (available.length === 0) {
    return null;
  }

  return available
    .map((question) => ({
      question,
      score: scoreQuestion(question, rankedCandidates),
    }))
    .toSorted((left, right) => right.score - left.score)[0]?.question ?? null;
}
