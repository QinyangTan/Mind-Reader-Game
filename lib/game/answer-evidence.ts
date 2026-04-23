import type { NormalizedAnswer } from "@/types/game";

/**
 * Canonical soft-evidence mapping used by scoring, question selection, and
 * UI-side narrowing summaries. Values intentionally avoid hard elimination:
 * "probably" answers are partial evidence and "unknown" is noisy / neutral.
 */
export const answerEvidenceStrength: Record<NormalizedAnswer, number> = {
  yes: 1,
  probably: 0.58,
  unknown: 0,
  probably_not: -0.58,
  no: -1,
};

export const answerProbability: Record<NormalizedAnswer, number> = {
  yes: 1,
  probably: 0.72,
  unknown: 0.5,
  probably_not: 0.28,
  no: 0,
};

export function answerToProbability(answer: NormalizedAnswer) {
  return answerProbability[answer];
}

export function answerSignalStrength(answer: NormalizedAnswer) {
  return Math.abs(answerEvidenceStrength[answer]);
}
