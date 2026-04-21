import { entityById, getEntitiesForCategory } from "@/lib/data/entities";
import { questionById } from "@/lib/data/questions";
import { difficultyConfig } from "@/lib/game/game-config";
import { selectNextQuestion } from "@/lib/game/question-selection";
import { getTopCandidateId, rankCandidates, shouldAttemptGuess } from "@/lib/game/scoring";
import type {
  GameResult,
  GuessMyMindSession,
  NormalizedAnswer,
  ReadMyMindSession,
  SetupSelection,
  SystemAnsweredQuestion,
} from "@/types/game";

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `mr-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createResult(
  selection: SetupSelection,
  detail: Omit<GameResult, keyof SetupSelection | "id" | "playedAt">,
) {
  return {
    ...selection,
    id: createId(),
    playedAt: new Date().toISOString(),
    ...detail,
  } satisfies GameResult;
}

export function createReadMyMindSession(selection: Omit<SetupSelection, "mode">): ReadMyMindSession {
  const config = difficultyConfig[selection.difficulty].readMyMind;
  const rankings = rankCandidates(selection.category, [], []);
  const firstQuestion = selectNextQuestion(selection.category, [], rankings);

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
    config,
  };
}

export function createGuessMyMindSession(selection: Omit<SetupSelection, "mode">): GuessMyMindSession {
  const pool = getEntitiesForCategory(selection.category);
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

function createReadEscapeResult(session: ReadMyMindSession, guessesUsed: number) {
  return createResult(session, {
    winner: "player",
    title: "Thought Pattern Escaped",
    message: "The chamber lost the signal before it could lock onto your secret.",
    questionsUsed: session.asked.length,
    guessesUsed,
    teachable: true,
  });
}

export function applyReadMyMindAnswer(session: ReadMyMindSession, answer: NormalizedAnswer) {
  const activeQuestion = session.currentQuestionId ? questionById.get(session.currentQuestionId) : null;

  if (!activeQuestion) {
    return {
      result: createReadEscapeResult(session, session.guessAttemptsUsed),
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

  const rankings = rankCandidates(session.category, asked, session.rejectedGuessIds);
  const remainingQuestions = session.config.maxQuestions - asked.length;
  const forcedGuessId = getTopCandidateId(rankings, session.rejectedGuessIds);

  if (remainingQuestions <= 0) {
    if (!forcedGuessId) {
      return {
        result: createReadEscapeResult(
          {
            ...session,
            asked,
            rankings,
          },
          session.guessAttemptsUsed,
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

  if (shouldAttemptGuess(rankings, session.config, asked.length, remainingQuestions) && forcedGuessId) {
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

  const nextQuestion = selectNextQuestion(
    session.category,
    asked.map((entry) => entry.questionId),
    rankings,
  );

  if (!nextQuestion) {
    if (!forcedGuessId) {
      return {
        result: createReadEscapeResult(
          {
            ...session,
            asked,
            rankings,
          },
          session.guessAttemptsUsed,
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
    } satisfies ReadMyMindSession,
  };
}

export function resolveReadMyMindGuess(session: ReadMyMindSession, guessedCorrectly: boolean) {
  const guessId = session.queuedGuessId;
  const guessedEntity = guessId ? entityById.get(guessId) : undefined;

  if (!guessId || !guessedEntity) {
    return {
      result: createReadEscapeResult(session, session.guessAttemptsUsed),
    };
  }

  if (guessedCorrectly) {
    return {
      result: createResult(session, {
        winner: "system",
        title: "Scanner Lock Confirmed",
        message: `The chamber resolved your thought signature as ${guessedEntity.name}.`,
        questionsUsed: session.asked.length,
        guessesUsed: session.guessAttemptsUsed + 1,
        revealedEntityId: guessedEntity.id,
        revealedEntityName: guessedEntity.name,
        teachable: false,
      }),
    };
  }

  const rejectedGuessIds = [...session.rejectedGuessIds, guessId];
  const guessAttemptsUsed = session.guessAttemptsUsed + 1;

  if (guessAttemptsUsed >= session.config.maxGuesses) {
    return {
      result: createReadEscapeResult(session, guessAttemptsUsed),
    };
  }

  const rankings = rankCandidates(session.category, session.asked, rejectedGuessIds);
  const remainingQuestions = session.config.maxQuestions - session.asked.length;
  const fallbackGuessId = getTopCandidateId(rankings, rejectedGuessIds);

  if (remainingQuestions <= 0) {
    if (!fallbackGuessId) {
      return {
        result: createReadEscapeResult(session, guessAttemptsUsed),
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
      } satisfies ReadMyMindSession,
    };
  }

  const nextQuestion = selectNextQuestion(
    session.category,
    session.asked.map((entry) => entry.questionId),
    rankings,
  );

  if (!nextQuestion) {
    if (!fallbackGuessId) {
      return {
        result: createReadEscapeResult(session, guessAttemptsUsed),
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
    } satisfies ReadMyMindSession,
  };
}

export function askGuessMyMindQuestion(session: GuessMyMindSession, questionId: string) {
  if (session.asked.length >= session.config.maxQuestions) {
    return session;
  }

  if (session.asked.some((entry) => entry.questionId === questionId)) {
    return session;
  }

  const secretEntity = entityById.get(session.secretEntityId);
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

export function submitGuessMyMindGuess(session: GuessMyMindSession, guessedEntityId: string) {
  const secretEntity = entityById.get(session.secretEntityId);

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
      result: createResult(session, {
        winner: "player",
        title: "You Broke the Signal",
        message: `You forced the chamber to reveal ${secretEntity.name}.`,
        questionsUsed: session.asked.length,
        guessesUsed: session.guessAttemptsUsed + 1,
        revealedEntityId: secretEntity.id,
        revealedEntityName: secretEntity.name,
        teachable: false,
      }),
    };
  }

  const guessAttemptsUsed = session.guessAttemptsUsed + 1;
  const wrongGuessIds = [...session.wrongGuessIds, guessedEntityId];

  if (guessAttemptsUsed >= session.config.maxGuesses) {
    return {
      result: createResult(session, {
        winner: "system",
        title: "The Chamber Outplayed You",
        message: `${secretEntity.name} stayed hidden until your guesses ran dry.`,
        questionsUsed: session.asked.length,
        guessesUsed: guessAttemptsUsed,
        revealedEntityId: secretEntity.id,
        revealedEntityName: secretEntity.name,
        teachable: false,
      }),
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
