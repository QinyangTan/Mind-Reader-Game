import { getEntitiesForCategory } from "@/lib/data/entities";
import { questionById } from "@/lib/data/questions";
import {
  getEntityPriorLogBoost,
  getSmoothedLikelihood,
  getUncertaintyMetrics,
} from "@/lib/game/inference-model";
import type {
  AnsweredQuestion,
  EntityCategory,
  GameEntity,
  LearnedInferenceModel,
  NormalizedAnswer,
  RankedCandidate,
  ReadMyMindConfig,
} from "@/types/game";

const answerProbability = {
  yes: 1,
  probably: 0.72,
  unknown: 0.5,
  probably_not: 0.28,
  no: 0,
} as const;

const HARD_ANSWERS = new Set<NormalizedAnswer>(["yes", "no"]);

/**
 * Tempering factor applied in the softmax that converts log-likelihoods into
 * displayed confidence. T > 1 spreads mass so a marginally better leader
 * can't claim >90% certainty on thin evidence; the chamber still picks the
 * best candidate, just with calibrated humility.
 */
const SOFTMAX_TEMPERATURE = 1.25;

export function toProbability(answer: NormalizedAnswer) {
  return answerProbability[answer];
}

function isHardContradiction(candidate: NormalizedAnswer, player: NormalizedAnswer) {
  return (
    candidate !== player &&
    HARD_ANSWERS.has(candidate) &&
    HARD_ANSWERS.has(player)
  );
}

interface EntityScore {
  score: number;
  matchedAnswers: number;
  hardContradictions: number;
}

function scoreEntity(
  entity: GameEntity,
  answers: AnsweredQuestion[],
  category: EntityCategory,
  categoryPool: readonly GameEntity[],
  inferenceModel?: LearnedInferenceModel,
): EntityScore {
  if (answers.length === 0) {
    return {
      score: getEntityPriorLogBoost(inferenceModel, categoryPool, entity.id),
      matchedAnswers: 0,
      hardContradictions: 0,
    };
  }

  let score = getEntityPriorLogBoost(inferenceModel, categoryPool, entity.id);
  let matchedAnswers = 0;
  let hardContradictions = 0;

  for (const answer of answers) {
    const entityValue = entity.attributes[answer.attributeKey];
    const weight = questionById.get(answer.questionId)?.weight ?? 1;
    const fit = getSmoothedLikelihood(
      inferenceModel,
      category,
      answer.attributeKey,
      entityValue,
      answer.answer,
    );

    if (Math.abs(toProbability(entityValue) - toProbability(answer.answer)) <= 0.24) {
      matchedAnswers += 1;
    }

    if (isHardContradiction(entityValue, answer.answer)) {
      hardContradictions += 1;
    }

    score += Math.log(fit) * weight;
  }

  return { score, matchedAnswers, hardContradictions };
}

export function rankCandidates(
  category: EntityCategory,
  answers: AnsweredQuestion[],
  rejectedGuessIds: string[],
  extraEntities: GameEntity[] = [],
  inferenceModel?: LearnedInferenceModel,
): RankedCandidate[] {
  const rejected = new Set(rejectedGuessIds);
  const seeded = getEntitiesForCategory(category);
  const extras = extraEntities.filter((entity) => entity.category === category);
  const seenIds = new Set(seeded.map((entity) => entity.id));
  const dedupedExtras = extras.filter((entity) => !seenIds.has(entity.id));
  const candidates = [...seeded, ...dedupedExtras].filter((entity) => !rejected.has(entity.id));

  interface InternalCandidate {
    entityId: string;
    score: number;
    confidence: number;
    matchedAnswers: number;
    hardContradictions: number;
  }

  const scored: InternalCandidate[] = candidates.map((entity) => {
    const entityScore = scoreEntity(entity, answers, category, candidates, inferenceModel);
    return {
      entityId: entity.id,
      score: entityScore.score,
      confidence: 0,
      matchedAnswers: entityScore.matchedAnswers,
      hardContradictions: entityScore.hardContradictions,
    };
  });

  if (scored.length === 0) {
    return [];
  }

  const maxScore = Math.max(...scored.map((candidate) => candidate.score));
  const weighted = scored.map((candidate) => ({
    ...candidate,
    confidence: Math.exp((candidate.score - maxScore) / SOFTMAX_TEMPERATURE),
  }));

  const totalConfidence = weighted.reduce((sum, candidate) => sum + candidate.confidence, 0) || 1;

  const normalized = weighted
    .map((candidate) => ({
      ...candidate,
      confidence: candidate.confidence / totalConfidence,
    }))
    .toSorted((left, right) => {
      // Hard contradictions dominate the ordering: a candidate that directly
      // disagrees with a yes/no answer never out-ranks one that doesn't,
      // even if softmax gave it a scrap of mass.
      if (left.hardContradictions !== right.hardContradictions) {
        return left.hardContradictions - right.hardContradictions;
      }

      if (right.confidence !== left.confidence) {
        return right.confidence - left.confidence;
      }

      return right.matchedAnswers - left.matchedAnswers;
    });

  return normalized.map<RankedCandidate>((candidate) => ({
    entityId: candidate.entityId,
    score: candidate.score,
    confidence: candidate.confidence,
    matchedAnswers: candidate.matchedAnswers,
  }));
}

export function getTopCandidateId(rankings: RankedCandidate[], rejectedGuessIds: string[]) {
  const rejected = new Set(rejectedGuessIds);
  return rankings.find((candidate) => !rejected.has(candidate.entityId))?.entityId ?? null;
}

/**
 * Signal strength of a player's answer — how much actual information the
 * answer carries for narrowing. Unknown answers contribute nothing.
 */
const NARROWING_SIGNAL: Record<NormalizedAnswer, number> = {
  yes: 1,
  no: 1,
  probably: 0.55,
  probably_not: 0.55,
  unknown: 0,
};

const NARROWING_TOP_N = 5;

/**
 * Confidence-weighted mean pairwise distance of the top candidates on a
 * single attribute — mirrors the top-K split metric used by question
 * selection, but operates against the final post-round rankings so we can
 * rank answered questions by how much they distinguished the round's
 * surviving contenders.
 */
function attributeSplit(
  attributeKey: AnsweredQuestion["attributeKey"],
  rankings: RankedCandidate[],
  resolveEntity: (id: string) => GameEntity | undefined,
) {
  const top = rankings.slice(0, NARROWING_TOP_N);
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
        toProbability(left.entity.attributes[attributeKey]) -
          toProbability(right.entity.attributes[attributeKey]),
      );
      const pairWeight = left.confidence * right.confidence;
      weightedDistance += distance * pairWeight;
      weightSum += pairWeight;
    }
  }

  return weightSum > 0 ? weightedDistance / weightSum : 0;
}

/**
 * Pick the answered question that most narrowed the candidate pool by the
 * end of the round. Scored as:
 *
 *   question.weight × signalStrength(answer) × topKSplit(attribute)
 *
 * Returns `null` when no answer carried real narrowing information (e.g.,
 * the round ended with only unknown answers, or rankings has < 2 entries).
 */
export function strongestNarrowingQuestion(
  answers: AnsweredQuestion[],
  rankings: RankedCandidate[],
  resolveEntity: (id: string) => GameEntity | undefined,
): AnsweredQuestion | null {
  if (answers.length === 0 || rankings.length < 2) {
    return null;
  }

  let best: { answer: AnsweredQuestion; score: number } | null = null;

  for (const answer of answers) {
    const question = questionById.get(answer.questionId);
    if (!question) {
      continue;
    }

    const signal = NARROWING_SIGNAL[answer.answer];
    if (signal === 0) {
      continue;
    }

    const split = attributeSplit(answer.attributeKey, rankings, resolveEntity);
    if (split === 0) {
      continue;
    }

    const weight = question.weight ?? 1;
    const score = signal * split * weight;

    if (!best || score > best.score) {
      best = { answer, score };
    }
  }

  return best ? best.answer : null;
}

/**
 * Decide whether the chamber should lock in a guess instead of asking another
 * question.
 *
 * Gating (in order):
 *   1. Below `minQuestionsBeforeGuess`: never guess.
 *   2. Primary: leader meets both `guessConfidence` and `guessMargin`.
 *   3. Deep endgame (≤ 1 question left): always guess, take the best shot.
 *   4. Late fallback (≤ 3 questions left): guess with a relaxed
 *      confidence/margin (70% / 60% of primary), so we don't waste the last
 *      probes if the leader is already reasonably ahead.
 *   5. Narrow survivor pool (≤ 3 un-rejected candidates): guess as soon as
 *      there's any real margin — further questions can't prune much.
 */
export function shouldAttemptGuess(
  rankings: RankedCandidate[],
  config: ReadMyMindConfig,
  questionsAsked: number,
  remainingQuestions: number,
) {
  if (rankings.length === 0 || questionsAsked < config.minQuestionsBeforeGuess) {
    return false;
  }

  const leader = rankings[0];
  const runnerUp = rankings[1];
  const margin = leader.confidence - (runnerUp?.confidence ?? 0);
  const uncertainty = getUncertaintyMetrics(rankings);

  if (
    leader.confidence >= config.guessConfidence &&
    margin >= config.guessMargin &&
    uncertainty.effectiveCandidateCount <= 4.8 &&
    uncertainty.normalizedEntropy <= 0.38
  ) {
    return true;
  }

  if (remainingQuestions <= 1) {
    return true;
  }

  const lateWindow = 3;
  if (remainingQuestions <= lateWindow) {
    const lateConfidence = config.guessConfidence * 0.7;
    const lateMargin = config.guessMargin * 0.6;

    if (
      leader.confidence >= lateConfidence &&
      margin >= lateMargin &&
      uncertainty.effectiveCandidateCount <= 6.2 &&
      uncertainty.normalizedEntropy <= 0.48
    ) {
      return true;
    }
  }

  if (
    (rankings.length <= 3 || uncertainty.effectiveCandidateCount <= 2.6) &&
    margin >= config.guessMargin * 0.38 &&
    uncertainty.normalizedEntropy <= 0.78
  ) {
    return true;
  }

  return false;
}
