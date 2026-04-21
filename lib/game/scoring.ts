import { getEntitiesForCategory } from "@/lib/data/entities";
import { questionById } from "@/lib/data/questions";
import type {
  AnsweredQuestion,
  EntityCategory,
  GameEntity,
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

export function toProbability(answer: keyof typeof answerProbability) {
  return answerProbability[answer];
}

function compatibility(candidateValue: keyof typeof answerProbability, playerValue: keyof typeof answerProbability) {
  const delta = Math.abs(toProbability(candidateValue) - toProbability(playerValue));
  return 0.18 + 0.82 * (1 - delta);
}

function scoreEntity(entity: GameEntity, answers: AnsweredQuestion[]) {
  if (answers.length === 0) {
    return { score: 0, matchedAnswers: 0 };
  }

  let score = 0;
  let matchedAnswers = 0;

  for (const answer of answers) {
    const entityValue = entity.attributes[answer.attributeKey];
    const weight = questionById.get(answer.questionId)?.weight ?? 1;
    const fit = compatibility(entityValue, answer.answer);

    if (fit >= 0.76) {
      matchedAnswers += 1;
    }

    score += Math.log(fit) * weight;
  }

  return { score, matchedAnswers };
}

export function rankCandidates(
  category: EntityCategory,
  answers: AnsweredQuestion[],
  rejectedGuessIds: string[],
) {
  const rejected = new Set(rejectedGuessIds);
  const candidates = getEntitiesForCategory(category).filter((entity) => !rejected.has(entity.id));

  const scored = candidates.map((entity) => {
    const entityScore = scoreEntity(entity, answers);
    return {
      entityId: entity.id,
      score: entityScore.score,
      confidence: 0,
      matchedAnswers: entityScore.matchedAnswers,
    } satisfies RankedCandidate;
  });

  if (scored.length === 0) {
    return [];
  }

  const maxScore = Math.max(...scored.map((candidate) => candidate.score));
  const weighted = scored.map((candidate) => ({
    ...candidate,
    confidence: Math.exp(candidate.score - maxScore),
  }));

  const totalConfidence = weighted.reduce((sum, candidate) => sum + candidate.confidence, 0) || 1;

  return weighted
    .map((candidate) => ({
      ...candidate,
      confidence: candidate.confidence / totalConfidence,
    }))
    .toSorted((left, right) => {
      if (right.confidence !== left.confidence) {
        return right.confidence - left.confidence;
      }

      return right.matchedAnswers - left.matchedAnswers;
    });
}

export function getTopCandidateId(rankings: RankedCandidate[], rejectedGuessIds: string[]) {
  const rejected = new Set(rejectedGuessIds);
  return rankings.find((candidate) => !rejected.has(candidate.entityId))?.entityId ?? null;
}

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

  if (leader.confidence >= config.guessConfidence && margin >= config.guessMargin) {
    return true;
  }

  if (remainingQuestions <= 2) {
    return true;
  }

  return rankings.length <= 4;
}
