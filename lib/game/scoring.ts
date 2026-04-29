import { getEntitiesForCategory } from "@/lib/data/entities";
import { questionById } from "@/lib/data/questions";
import {
  answerSignalStrength,
  answerToProbability,
} from "@/lib/game/answer-evidence";
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

const HARD_ANSWERS = new Set<NormalizedAnswer>(["yes", "no"]);
const HARD_CONTRADICTION_LOG_PENALTY = 1.85;
const UNKNOWN_ATTRIBUTE_LOG_PENALTY = 0.18;
const THIN_EVIDENCE_MIX_STRENGTH = 4.7;
const STATIC_PRIOR_LOG_WEIGHT = 0.08;

/**
 * Tempering factor applied in the softmax that converts log-likelihoods into
 * displayed confidence. T > 1 spreads mass so a marginally better leader
 * can't claim >90% certainty on thin evidence; the chamber still picks the
 * best candidate, just with calibrated humility.
 */
const SOFTMAX_TEMPERATURE = 1.16;

export function toProbability(answer: NormalizedAnswer) {
  return answerToProbability(answer);
}

function isHardContradiction(candidate: NormalizedAnswer, player: NormalizedAnswer) {
  return (
    candidate !== player &&
    HARD_ANSWERS.has(candidate) &&
    HARD_ANSWERS.has(player)
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getStaticEntityPriorLogBoost(entity: GameEntity) {
  const popularity = clamp(entity.popularityWeight ?? 1, 0.25, 4);
  const rarity = clamp(entity.rarityWeight ?? 1, 0.25, 4);
  return Math.log(popularity / Math.sqrt(rarity)) * STATIC_PRIOR_LOG_WEIGHT;
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
      score:
        getEntityPriorLogBoost(inferenceModel, categoryPool, entity.id) +
        getStaticEntityPriorLogBoost(entity),
      matchedAnswers: 0,
      hardContradictions: 0,
    };
  }

  let score =
    getEntityPriorLogBoost(inferenceModel, categoryPool, entity.id) +
    getStaticEntityPriorLogBoost(entity);
  let matchedAnswers = 0;
  let hardContradictions = 0;

  for (const answer of answers) {
    const entityValue = entity.attributes[answer.attributeKey];
    const weight = questionById.get(answer.questionId)?.weight ?? 1;
    const signal = answerSignalStrength(answer.answer);
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
      score -= HARD_CONTRADICTION_LOG_PENALTY * weight;
    }

    if (entityValue === "unknown" && answer.answer !== "unknown") {
      score -= UNKNOWN_ATTRIBUTE_LOG_PENALTY * signal * weight;
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

  const evidenceMass = answers.reduce((sum, answer) => {
    const question = questionById.get(answer.questionId);
    return sum + answerSignalStrength(answer.answer) * (question?.weight ?? 1);
  }, 0);
  const evidenceMix = evidenceMass / (evidenceMass + THIN_EVIDENCE_MIX_STRENGTH);
  const uniformConfidence = 1 / scored.length;

  const normalized = weighted
    .map((candidate) => ({
      ...candidate,
      confidence:
        (candidate.confidence / totalConfidence) * evidenceMix +
        uniformConfidence * (1 - evidenceMix),
    }))
    .toSorted((left, right) => {
      if (right.confidence !== left.confidence) {
        return right.confidence - left.confidence;
      }

      if (right.matchedAnswers !== left.matchedAnswers) {
        return right.matchedAnswers - left.matchedAnswers;
      }

      // Contradictions are already represented as log-likelihood penalties.
      // Keep them as a tie-breaker only so a candidate can recover from one
      // noisy answer if the rest of the trail strongly supports it.
      return left.hardContradictions - right.hardContradictions;
    });

  return normalized.map<RankedCandidate>((candidate) => ({
    entityId: candidate.entityId,
    score: candidate.score,
    confidence: candidate.confidence,
    matchedAnswers: candidate.matchedAnswers,
    hardContradictions: candidate.hardContradictions,
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

    const signal = answerSignalStrength(answer.answer);
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

const CONSERVATIVE_GUESS_CATEGORIES = new Set<EntityCategory>([
  "historical_figures",
  "objects",
  "foods",
]);

export interface GuessTimingDiagnostics {
  shouldGuess: boolean;
  reason:
    | "blocked:no_rankings"
    | "blocked:min_questions"
    | "blocked:high_uncertainty"
    | "primary"
    | "late_confident"
    | "late_stable"
    | "narrow_pool"
    | "forced_no_questions";
  questionsAsked: number;
  remainingQuestions: number;
  leaderConfidence: number;
  runnerUpConfidence: number;
  margin: number;
  normalizedEntropy: number;
  effectiveCandidateCount: number;
  minimumQuestions: number;
  requiredConfidence: number;
  requiredMargin: number;
  leaderStreak: number;
  strongAnswerCount: number;
}

export interface GuessCommitmentEvidence {
  questionsAsked?: number;
  leaderStreak?: number;
  strongAnswerCount?: number;
}

export function countStrongAnsweredTraits(answers: AnsweredQuestion[]) {
  return answers.filter((answer) => answerSignalStrength(answer.answer) >= 0.68).length;
}

function getGuessPolicy(config: ReadMyMindConfig, category?: EntityCategory) {
  const conservative = category ? CONSERVATIVE_GUESS_CATEGORIES.has(category) : false;

  return {
    minimumQuestions: config.minQuestionsBeforeGuess + (conservative ? 2 : 1),
    primaryConfidence: config.guessConfidence + (conservative ? 0.08 : 0.04),
    primaryMargin: config.guessMargin + (conservative ? 0.06 : 0.035),
    primaryEffectiveCandidateCount: conservative ? 3.2 : 3.8,
    primaryEntropy: conservative ? 0.36 : 0.42,
    lateEffectiveCandidateCount: conservative ? 4.2 : 4.8,
    lateEntropy: conservative ? 0.44 : 0.48,
    narrowEffectiveCandidateCount: conservative ? 1.9 : 2.15,
    narrowEntropy: conservative ? 0.46 : 0.5,
  };
}

/**
 * Decide whether the chamber should lock in a guess instead of asking another
 * question.
 *
 * Gating (in order):
 *   1. Below the calibrated minimum: never guess.
 *   2. Primary: leader meets confidence, margin, and uncertainty gates.
 *   3. Final exhaustion: only force a guess once no questions remain.
 *   4. Late fallback: with one or two probes left, only guess if the leader is
 *      already meaningfully ahead. The previous version guessed with one
 *      question still available, which showed up as many avoidable misses in
 *      evaluation.
 *   5. Narrow survivor pool: guess only when the effective pool is truly tiny.
 */
export function getGuessTimingDiagnostics(
  rankings: RankedCandidate[],
  config: ReadMyMindConfig,
  questionsAsked: number,
  remainingQuestions: number,
  category?: EntityCategory,
  evidence: GuessCommitmentEvidence = {},
): GuessTimingDiagnostics {
  const policy = getGuessPolicy(config, category);
  const leader = rankings[0];
  const runnerUp = rankings[1];
  const uncertainty = getUncertaintyMetrics(rankings);
  const leaderConfidence = leader?.confidence ?? 0;
  const runnerUpConfidence = runnerUp?.confidence ?? 0;
  const margin = leaderConfidence - runnerUpConfidence;
  const leaderStreak = evidence.leaderStreak ?? 0;
  const strongAnswerCount = evidence.strongAnswerCount ?? 0;
  const base = {
    questionsAsked,
    remainingQuestions,
    leaderConfidence,
    runnerUpConfidence,
    margin,
    normalizedEntropy: uncertainty.normalizedEntropy,
    effectiveCandidateCount: uncertainty.effectiveCandidateCount,
    minimumQuestions: policy.minimumQuestions,
    requiredConfidence: policy.primaryConfidence,
    requiredMargin: policy.primaryMargin,
    leaderStreak,
    strongAnswerCount,
  };

  if (rankings.length === 0) {
    return { ...base, shouldGuess: false, reason: "blocked:no_rankings" };
  }

  if (remainingQuestions <= 0) {
    return { ...base, shouldGuess: true, reason: "forced_no_questions" };
  }

  if (questionsAsked < policy.minimumQuestions) {
    return { ...base, shouldGuess: false, reason: "blocked:min_questions" };
  }

  if (
    leaderConfidence >= policy.primaryConfidence &&
    margin >= policy.primaryMargin &&
    uncertainty.effectiveCandidateCount <= policy.primaryEffectiveCandidateCount &&
    uncertainty.normalizedEntropy <= policy.primaryEntropy
  ) {
    return { ...base, shouldGuess: true, reason: "primary" };
  }

  const lateConfidence = policy.primaryConfidence * 0.92;
  const lateMargin = policy.primaryMargin * 0.88;

  if (
    remainingQuestions <= 2 &&
    leaderConfidence >= lateConfidence &&
    margin >= lateMargin &&
    uncertainty.effectiveCandidateCount <= policy.lateEffectiveCandidateCount &&
    uncertainty.normalizedEntropy <= policy.lateEntropy
  ) {
    return {
      ...base,
      shouldGuess: true,
      reason: "late_confident",
      requiredConfidence: lateConfidence,
      requiredMargin: lateMargin,
    };
  }

  const stableConfidence = category && CONSERVATIVE_GUESS_CATEGORIES.has(category) ? 0.05 : 0.042;
  const stableMargin = Math.max(
    policy.primaryMargin * 0.12,
    category && CONSERVATIVE_GUESS_CATEGORIES.has(category) ? 0.026 : 0.022,
  );
  if (
    remainingQuestions <= 2 &&
    leaderStreak >= 4 &&
    strongAnswerCount >= (category && CONSERVATIVE_GUESS_CATEGORIES.has(category) ? 8 : 7) &&
    leaderConfidence >= stableConfidence &&
    margin >= stableMargin &&
    (leader?.matchedAnswers ?? 0) >= strongAnswerCount - 1 &&
    (leader?.hardContradictions ?? 0) === 0 &&
    uncertainty.effectiveCandidateCount <= (category && CONSERVATIVE_GUESS_CATEGORIES.has(category) ? 260 : 320) &&
    uncertainty.normalizedEntropy <= (category && CONSERVATIVE_GUESS_CATEGORIES.has(category) ? 0.92 : 0.94)
  ) {
    return {
      ...base,
      shouldGuess: true,
      reason: "late_stable",
      requiredConfidence: stableConfidence,
      requiredMargin: stableMargin,
    };
  }

  if (
    questionsAsked >= policy.minimumQuestions + 2 &&
    uncertainty.effectiveCandidateCount <= policy.narrowEffectiveCandidateCount &&
    margin >= Math.max(policy.primaryMargin * 1.05, 0.16) &&
    uncertainty.normalizedEntropy <= policy.narrowEntropy
  ) {
    return { ...base, shouldGuess: true, reason: "narrow_pool" };
  }

  return { ...base, shouldGuess: false, reason: "blocked:high_uncertainty" };
}

export function shouldAttemptGuess(
  rankings: RankedCandidate[],
  config: ReadMyMindConfig,
  questionsAsked: number,
  remainingQuestions: number,
  category?: EntityCategory,
  evidence: GuessCommitmentEvidence = {},
) {
  return getGuessTimingDiagnostics(
    rankings,
    config,
    questionsAsked,
    remainingQuestions,
    category,
    evidence,
  ).shouldGuess;
}

export function shouldCommitFinalGuess(
  rankings: RankedCandidate[],
  category?: EntityCategory,
  evidence: GuessCommitmentEvidence = {},
) {
  if (rankings.length === 0) {
    return false;
  }

  const leader = rankings[0];
  const runnerUp = rankings[1];
  const margin = leader.confidence - (runnerUp?.confidence ?? 0);
  const uncertainty = getUncertaintyMetrics(rankings);
  const conservative = category ? CONSERVATIVE_GUESS_CATEGORIES.has(category) : false;
  const minimumConfidence = conservative ? 0.095 : 0.075;
  const minimumMargin = conservative ? 0.045 : 0.035;
  const maximumEffectiveCandidates = conservative ? 180 : 240;
  const maximumEntropy = conservative ? 0.84 : 0.88;
  const leaderStreak = evidence.leaderStreak ?? 0;
  const strongAnswerCount = evidence.strongAnswerCount ?? 0;
  const cleanLeader = (leader.hardContradictions ?? 0) === 0;
  const stableMinimumConfidence = conservative ? 0.035 : 0.032;
  const stableMinimumMargin = conservative ? 0.012 : 0.01;
  const stableMaximumEffectiveCandidates = conservative ? 420 : 480;
  const stableMaximumEntropy = conservative ? 0.96 : 0.97;

  const highCertainty =
    leader.confidence >= minimumConfidence &&
    margin >= minimumMargin &&
    uncertainty.effectiveCandidateCount <= maximumEffectiveCandidates &&
    uncertainty.normalizedEntropy <= maximumEntropy;

  const stableEndgame =
    leaderStreak >= 4 &&
    strongAnswerCount >= (conservative ? 8 : 7) &&
    leader.matchedAnswers >= Math.max(6, strongAnswerCount - 1) &&
    cleanLeader &&
    leader.confidence >= stableMinimumConfidence &&
    margin >= stableMinimumMargin &&
    uncertainty.effectiveCandidateCount <= stableMaximumEffectiveCandidates &&
    uncertainty.normalizedEntropy <= stableMaximumEntropy;

  return highCertainty || stableEndgame;
}
