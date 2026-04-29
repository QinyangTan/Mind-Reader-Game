import { entityById, getEntitiesForCategory } from "@/lib/data/entities";
import { questionById } from "@/lib/data/questions";
import { difficultyConfig } from "@/lib/game/game-config";
import { selectNextQuestion } from "@/lib/game/question-selection";
import { calculateGameScore } from "@/lib/game/score";
import {
  countHighValueAnsweredTraits,
  countStrongAnsweredTraits,
  countUnknownAnswers,
  getTopCandidateId,
  rankCandidates,
  shouldCommitFinalGuess,
  shouldAttemptGuess,
  strongestNarrowingQuestion,
} from "@/lib/game/scoring";
import type {
  AnsweredQuestion,
  GameEntity,
  GameResult,
  GuessMyMindSession,
  LearnedInferenceModel,
  NormalizedAnswer,
  ReadMyMindSession,
  SetupSelection,
  StrongestNarrowingQuestion,
  SystemAnsweredQuestion,
} from "@/types/game";

type ReadMyMindOutcome =
  | { session: ReadMyMindSession; result?: undefined }
  | { result: GameResult; session?: undefined };

function resolveExtraEntity(extraEntities: GameEntity[], id: string) {
  return entityById.get(id) ?? extraEntities.find((entity) => entity.id === id);
}

function leaderStabilityFor(
  session: ReadMyMindSession,
  rankings: ReturnType<typeof rankCandidates>,
) {
  const leaderId = rankings[0]?.entityId ?? null;
  const leaderStreak =
    leaderId && leaderId === session.leadingCandidateId ? session.leaderStreak + 1 : leaderId ? 1 : 0;

  return { leaderId, leaderStreak };
}

function guessEvidence(
  asked: AnsweredQuestion[],
  leaderStreak: number,
) {
  return {
    questionsAsked: asked.length,
    leaderStreak,
    strongAnswerCount: countStrongAnsweredTraits(asked),
    unknownAnswerCount: countUnknownAnswers(asked),
    highValueAnswerCount: countHighValueAnsweredTraits(asked),
  };
}

function combineCategoryPool(
  seeded: readonly GameEntity[],
  extraEntities: GameEntity[],
  category: GameEntity["category"],
) {
  if (extraEntities.length === 0) {
    return seeded;
  }

  const seenIds = new Set(seeded.map((entity) => entity.id));
  const dedupedExtras = extraEntities.filter(
    (entity) => entity.category === category && !seenIds.has(entity.id),
  );

  if (dedupedExtras.length === 0) {
    return seeded;
  }

  return [...seeded, ...dedupedExtras];
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `mr-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createResult(
  selection: SetupSelection,
  detail: Omit<GameResult, keyof SetupSelection | "id" | "playedAt" | "score" | "scoreBreakdown">,
  scoringContext: {
    answers?: AnsweredQuestion[];
    entity?: GameEntity | null;
  } = {},
) {
  const scoreBreakdown = calculateGameScore({
    mode: selection.mode,
    difficulty: selection.difficulty,
    winner: detail.winner,
    questionsUsed: detail.questionsUsed,
    guessesUsed: detail.guessesUsed,
    answers: scoringContext.answers,
    entity: scoringContext.entity,
  });

  return {
    ...selection,
    id: createId(),
    playedAt: new Date().toISOString(),
    score: scoreBreakdown.total,
    scoreBreakdown,
    ...detail,
  } satisfies GameResult;
}

export function createReadMyMindSession(
  selection: Omit<SetupSelection, "mode">,
  extraEntities: GameEntity[] = [],
  inferenceModel?: LearnedInferenceModel,
): ReadMyMindSession {
  const config = difficultyConfig[selection.difficulty].readMyMind;
  const rankings = rankCandidates(selection.category, [], [], extraEntities, inferenceModel);
  const firstQuestion = selectNextQuestion(
    selection.category,
    [],
    rankings,
    extraEntities,
    config.maxQuestions,
    inferenceModel,
  );

  return {
    ...selection,
    mode: "read-my-mind",
    startedAt: new Date().toISOString(),
    currentQuestionId: firstQuestion?.id ?? null,
    asked: [],
    rankings,
    rejectedGuessIds: [],
    guessAttemptsUsed: 0,
    queuedGuessId: null,
    leadingCandidateId: null,
    leaderStreak: 0,
    config,
  };
}

export function createGuessMyMindSession(
  selection: Omit<SetupSelection, "mode">,
  extraEntities: GameEntity[] = [],
): GuessMyMindSession {
  const seeded = getEntitiesForCategory(selection.category);
  const pool = combineCategoryPool(seeded, extraEntities, selection.category);
  const randomIndex = Math.floor(Math.random() * pool.length);
  const secretEntity = pool[randomIndex];

  return {
    ...selection,
    mode: "guess-my-mind",
    startedAt: new Date().toISOString(),
    secretEntityId: secretEntity.id,
    asked: [],
    wrongGuessIds: [],
    guessAttemptsUsed: 0,
    config: difficultyConfig[selection.difficulty].guessMyMind,
  };
}

/**
 * Resolver closure used to look up entities from a candidate id across the
 * seeded bank + any learned entities that were in play this round. Needed
 * by the narrowing computation, which reads attribute values off the top
 * rankings.
 */
function buildEntityResolver(extraEntities: GameEntity[]) {
  if (extraEntities.length === 0) {
    return (id: string) => entityById.get(id);
  }
  const extras = new Map(extraEntities.map((entity) => [entity.id, entity] as const));
  return (id: string) => entityById.get(id) ?? extras.get(id);
}

function computeRmmNarrowing(
  session: ReadMyMindSession,
  extraEntities: GameEntity[],
): StrongestNarrowingQuestion | undefined {
  const resolve = buildEntityResolver(extraEntities);
  const best = strongestNarrowingQuestion(session.asked, session.rankings, resolve);

  if (!best) {
    return undefined;
  }

  const question = questionById.get(best.questionId);
  if (!question) {
    return undefined;
  }

  return {
    questionLabel: question.label,
    questionPrompt: question.question,
    answer: best.answer,
  };
}

function createReadEscapeResult(
  session: ReadMyMindSession,
  guessesUsed: number,
  extraEntities: GameEntity[] = [],
) {
  const strongestQuestion = computeRmmNarrowing(session, extraEntities);

  return createResult(
    session,
    {
      winner: "player",
      title: "Thought Pattern Escaped",
      message:
        "The vision stayed too divided. Mora will not lie with a false reading; teach her the path she missed.",
      questionsUsed: session.asked.length,
      guessesUsed,
      teachable: true,
      ...(strongestQuestion ? { strongestQuestion } : {}),
    },
    { answers: session.asked },
  );
}

function advanceReadMyMindAfterAnswer(
  session: ReadMyMindSession,
  asked: AnsweredQuestion[],
  rankings: ReturnType<typeof rankCandidates>,
  extraEntities: GameEntity[] = [],
  inferenceModel?: LearnedInferenceModel,
  preselectedQuestionId?: string | null,
): ReadMyMindOutcome {
  const remainingQuestions = session.config.maxQuestions - asked.length;
  const forcedGuessId = getTopCandidateId(rankings, session.rejectedGuessIds);
  const stability = leaderStabilityFor(session, rankings);
  const evidence = guessEvidence(asked, stability.leaderStreak);

  if (remainingQuestions <= 0) {
    if (!forcedGuessId || !shouldCommitFinalGuess(rankings, session.category, evidence)) {
      return {
        result: createReadEscapeResult(
          {
            ...session,
            asked,
            rankings,
            leadingCandidateId: stability.leaderId,
            leaderStreak: stability.leaderStreak,
          },
          session.guessAttemptsUsed,
          extraEntities,
        ),
      };
    }

    return {
      session: {
        ...session,
        asked,
        rankings,
        currentQuestionId: null,
        queuedGuessId: forcedGuessId,
        leadingCandidateId: stability.leaderId,
        leaderStreak: stability.leaderStreak,
      } satisfies ReadMyMindSession,
    };
  }

  if (
    shouldAttemptGuess(
      rankings,
      session.config,
      asked.length,
      remainingQuestions,
      session.category,
      evidence,
    ) &&
    forcedGuessId
  ) {
    return {
      session: {
        ...session,
        asked,
        rankings,
        currentQuestionId: null,
        queuedGuessId: forcedGuessId,
        leadingCandidateId: stability.leaderId,
        leaderStreak: stability.leaderStreak,
      } satisfies ReadMyMindSession,
    };
  }

  const nextQuestion =
    preselectedQuestionId ? questionById.get(preselectedQuestionId) ?? null : selectNextQuestion(
      session.category,
      asked.map((entry) => entry.questionId),
      rankings,
      extraEntities,
      remainingQuestions,
      inferenceModel,
    );

  if (!nextQuestion) {
    if (!forcedGuessId) {
      return {
        result: createReadEscapeResult(
          {
            ...session,
            asked,
            rankings,
            leadingCandidateId: stability.leaderId,
            leaderStreak: stability.leaderStreak,
          },
          session.guessAttemptsUsed,
          extraEntities,
        ),
      };
    }

    return {
      session: {
        ...session,
        asked,
        rankings,
        currentQuestionId: null,
        queuedGuessId: forcedGuessId,
      } satisfies ReadMyMindSession,
    };
  }

  return {
    session: {
      ...session,
      asked,
      rankings,
      currentQuestionId: nextQuestion.id,
      queuedGuessId: null,
      leadingCandidateId: stability.leaderId,
      leaderStreak: stability.leaderStreak,
    } satisfies ReadMyMindSession,
  };
}

export function applyReadMyMindAnswer(
  session: ReadMyMindSession,
  answer: NormalizedAnswer,
  extraEntities: GameEntity[] = [],
  inferenceModel?: LearnedInferenceModel,
): ReadMyMindOutcome {
  const activeQuestion = session.currentQuestionId ? questionById.get(session.currentQuestionId) : null;

  if (!activeQuestion) {
    return {
      result: createReadEscapeResult(session, session.guessAttemptsUsed, extraEntities),
    };
  }

  const asked = [
    ...session.asked,
    {
      questionId: activeQuestion.id,
      attributeKey: activeQuestion.attributeKey,
      prompt: activeQuestion.question,
      answer,
      askedAt: new Date().toISOString(),
    },
  ];

  const rankings = rankCandidates(
    session.category,
    asked,
    session.rejectedGuessIds,
    extraEntities,
    inferenceModel,
  );
  return advanceReadMyMindAfterAnswer(session, asked, rankings, extraEntities, inferenceModel);
}

export function applyReadMyMindAnswerWithRankings(
  session: ReadMyMindSession,
  answer: NormalizedAnswer,
  rankings: ReturnType<typeof rankCandidates>,
  extraEntities: GameEntity[] = [],
  inferenceModel?: LearnedInferenceModel,
  preselectedQuestionId?: string | null,
): ReadMyMindOutcome {
  const activeQuestion = session.currentQuestionId ? questionById.get(session.currentQuestionId) : null;

  if (!activeQuestion) {
    return {
      result: createReadEscapeResult(session, session.guessAttemptsUsed, extraEntities),
    };
  }

  const asked = [
    ...session.asked,
    {
      questionId: activeQuestion.id,
      attributeKey: activeQuestion.attributeKey,
      prompt: activeQuestion.question,
      answer,
      askedAt: new Date().toISOString(),
    },
  ];

  return advanceReadMyMindAfterAnswer(
    session,
    asked,
    rankings,
    extraEntities,
    inferenceModel,
    preselectedQuestionId,
  );
}

export function resolveReadMyMindGuess(
  session: ReadMyMindSession,
  guessedCorrectly: boolean,
  extraEntities: GameEntity[] = [],
  inferenceModel?: LearnedInferenceModel,
): ReadMyMindOutcome {
  const guessId = session.queuedGuessId;
  const guessedEntity = guessId ? resolveExtraEntity(extraEntities, guessId) : undefined;

  if (!guessId || !guessedEntity) {
    return {
      result: createReadEscapeResult(session, session.guessAttemptsUsed, extraEntities),
    };
  }

  if (guessedCorrectly) {
    const strongestQuestion = computeRmmNarrowing(session, extraEntities);

    return {
      result: createResult(
        session,
        {
          winner: "system",
          title: "Scanner Lock Confirmed",
          message: `The chamber resolved your thought signature as ${guessedEntity.name}.`,
          questionsUsed: session.asked.length,
          guessesUsed: session.guessAttemptsUsed + 1,
          revealedEntityId: guessedEntity.id,
          revealedEntityName: guessedEntity.name,
          teachable: false,
          ...(strongestQuestion ? { strongestQuestion } : {}),
        },
        { answers: session.asked, entity: guessedEntity },
      ),
    };
  }

  const rejectedGuessIds = [...session.rejectedGuessIds, guessId];
  const guessAttemptsUsed = session.guessAttemptsUsed + 1;

  if (guessAttemptsUsed >= session.config.maxGuesses) {
    return {
      result: createReadEscapeResult(session, guessAttemptsUsed, extraEntities),
    };
  }

  const rankings = rankCandidates(
    session.category,
    session.asked,
    rejectedGuessIds,
    extraEntities,
    inferenceModel,
  );
  const remainingQuestions = session.config.maxQuestions - session.asked.length;
  const fallbackGuessId = getTopCandidateId(rankings, rejectedGuessIds);
  const stability = leaderStabilityFor({ ...session, rejectedGuessIds }, rankings);
  const evidence = guessEvidence(session.asked, stability.leaderStreak);

  if (remainingQuestions <= 0) {
    if (!fallbackGuessId || !shouldCommitFinalGuess(rankings, session.category, evidence)) {
      return {
        result: createReadEscapeResult(
          {
            ...session,
            rankings,
            leadingCandidateId: stability.leaderId,
            leaderStreak: stability.leaderStreak,
          },
          guessAttemptsUsed,
          extraEntities,
        ),
      };
    }

    return {
      session: {
        ...session,
        rankings,
        rejectedGuessIds,
        guessAttemptsUsed,
        queuedGuessId: fallbackGuessId,
        currentQuestionId: null,
        leadingCandidateId: stability.leaderId,
        leaderStreak: stability.leaderStreak,
      } satisfies ReadMyMindSession,
    };
  }

  const nextQuestion = selectNextQuestion(
    session.category,
    session.asked.map((entry) => entry.questionId),
    rankings,
    extraEntities,
    remainingQuestions,
    inferenceModel,
  );

  if (!nextQuestion) {
    if (!fallbackGuessId || !shouldCommitFinalGuess(rankings, session.category, evidence)) {
      return {
        result: createReadEscapeResult(
          {
            ...session,
            rankings,
            leadingCandidateId: stability.leaderId,
            leaderStreak: stability.leaderStreak,
          },
          guessAttemptsUsed,
          extraEntities,
        ),
      };
    }

    return {
      session: {
        ...session,
        rankings,
        rejectedGuessIds,
        guessAttemptsUsed,
        queuedGuessId: fallbackGuessId,
        currentQuestionId: null,
        leadingCandidateId: stability.leaderId,
        leaderStreak: stability.leaderStreak,
      } satisfies ReadMyMindSession,
    };
  }

  return {
    session: {
      ...session,
      rankings,
      rejectedGuessIds,
      guessAttemptsUsed,
      queuedGuessId: null,
      currentQuestionId: nextQuestion.id,
      leadingCandidateId: stability.leaderId,
      leaderStreak: stability.leaderStreak,
    } satisfies ReadMyMindSession,
  };
}

export function resolveReadMyMindGuessWithRankings(
  session: ReadMyMindSession,
  guessedCorrectly: boolean,
  rankings: ReturnType<typeof rankCandidates>,
  extraEntities: GameEntity[] = [],
  inferenceModel?: LearnedInferenceModel,
  preselectedQuestionId?: string | null,
): ReadMyMindOutcome {
  if (guessedCorrectly) {
    return resolveReadMyMindGuess(session, true, extraEntities, inferenceModel);
  }

  const guessId = session.queuedGuessId;
  const guessedEntity = guessId ? resolveExtraEntity(extraEntities, guessId) : undefined;

  if (!guessId || !guessedEntity) {
    return {
      result: createReadEscapeResult(session, session.guessAttemptsUsed, extraEntities),
    };
  }

  const rejectedGuessIds = [...session.rejectedGuessIds, guessId];
  const guessAttemptsUsed = session.guessAttemptsUsed + 1;

  if (guessAttemptsUsed >= session.config.maxGuesses) {
    return {
      result: createReadEscapeResult(session, guessAttemptsUsed, extraEntities),
    };
  }

  const remainingQuestions = session.config.maxQuestions - session.asked.length;
  const fallbackGuessId = getTopCandidateId(rankings, rejectedGuessIds);
  const stability = leaderStabilityFor({ ...session, rejectedGuessIds }, rankings);
  const evidence = guessEvidence(session.asked, stability.leaderStreak);

  if (remainingQuestions <= 0) {
    if (!fallbackGuessId || !shouldCommitFinalGuess(rankings, session.category, evidence)) {
      return {
        result: createReadEscapeResult(
          {
            ...session,
            rankings,
            leadingCandidateId: stability.leaderId,
            leaderStreak: stability.leaderStreak,
          },
          guessAttemptsUsed,
          extraEntities,
        ),
      };
    }

    return {
      session: {
        ...session,
        rankings,
        rejectedGuessIds,
        guessAttemptsUsed,
        queuedGuessId: fallbackGuessId,
        currentQuestionId: null,
        leadingCandidateId: stability.leaderId,
        leaderStreak: stability.leaderStreak,
      } satisfies ReadMyMindSession,
    };
  }

  const nextQuestion =
    preselectedQuestionId ? questionById.get(preselectedQuestionId) ?? null : selectNextQuestion(
      session.category,
      session.asked.map((entry) => entry.questionId),
      rankings,
      extraEntities,
      remainingQuestions,
      inferenceModel,
    );

  if (!nextQuestion) {
    if (!fallbackGuessId || !shouldCommitFinalGuess(rankings, session.category, evidence)) {
      return {
        result: createReadEscapeResult(
          {
            ...session,
            rankings,
            leadingCandidateId: stability.leaderId,
            leaderStreak: stability.leaderStreak,
          },
          guessAttemptsUsed,
          extraEntities,
        ),
      };
    }

    return {
      session: {
        ...session,
        rankings,
        rejectedGuessIds,
        guessAttemptsUsed,
        queuedGuessId: fallbackGuessId,
        currentQuestionId: null,
        leadingCandidateId: stability.leaderId,
        leaderStreak: stability.leaderStreak,
      } satisfies ReadMyMindSession,
    };
  }

  return {
    session: {
      ...session,
      rankings,
      rejectedGuessIds,
      guessAttemptsUsed,
      queuedGuessId: null,
      currentQuestionId: nextQuestion.id,
      leadingCandidateId: stability.leaderId,
      leaderStreak: stability.leaderStreak,
    } satisfies ReadMyMindSession,
  };
}

export function askGuessMyMindQuestion(
  session: GuessMyMindSession,
  questionId: string,
  extraEntities: GameEntity[] = [],
) {
  if (session.asked.length >= session.config.maxQuestions) {
    return session;
  }

  if (session.asked.some((entry) => entry.questionId === questionId)) {
    return session;
  }

  const secretEntity = resolveExtraEntity(extraEntities, session.secretEntityId);
  const question = questionById.get(questionId);

  if (!secretEntity || !question) {
    return session;
  }

  const entityAnswer = secretEntity.attributes[question.attributeKey];
  const askedQuestion: SystemAnsweredQuestion = {
    questionId: question.id,
    attributeKey: question.attributeKey,
    prompt: question.question,
    answer: entityAnswer,
    entityAnswer,
    askedAt: new Date().toISOString(),
  };

  return {
    ...session,
    asked: [...session.asked, askedQuestion],
  };
}

export function submitGuessMyMindGuess(
  session: GuessMyMindSession,
  guessedEntityId: string,
  extraEntities: GameEntity[] = [],
) {
  const secretEntity = resolveExtraEntity(extraEntities, session.secretEntityId);

  if (!secretEntity) {
    return {
      result: createResult(session, {
        winner: "system",
        title: "Signal Collapse",
        message: "The chamber lost its own secret and claimed the round.",
        questionsUsed: session.asked.length,
        guessesUsed: session.guessAttemptsUsed,
        teachable: false,
      }),
    };
  }

  if (guessedEntityId === session.secretEntityId) {
    return {
      result: createResult(
        session,
        {
          winner: "player",
          title: "You Broke the Signal",
          message: `You forced the chamber to reveal ${secretEntity.name}.`,
          questionsUsed: session.asked.length,
          guessesUsed: session.guessAttemptsUsed + 1,
          revealedEntityId: secretEntity.id,
          revealedEntityName: secretEntity.name,
          teachable: false,
        },
        { answers: session.asked, entity: secretEntity },
      ),
    };
  }

  const guessAttemptsUsed = session.guessAttemptsUsed + 1;
  const wrongGuessIds = [...session.wrongGuessIds, guessedEntityId];

  if (guessAttemptsUsed >= session.config.maxGuesses) {
    return {
      result: createResult(
        session,
        {
          winner: "system",
          title: "The Chamber Outplayed You",
          message: `${secretEntity.name} stayed hidden until your guesses ran dry.`,
          questionsUsed: session.asked.length,
          guessesUsed: guessAttemptsUsed,
          revealedEntityId: secretEntity.id,
          revealedEntityName: secretEntity.name,
          teachable: false,
        },
        { answers: session.asked, entity: secretEntity },
      ),
    };
  }

  return {
    session: {
      ...session,
      guessAttemptsUsed,
      wrongGuessIds,
    },
  };
}
