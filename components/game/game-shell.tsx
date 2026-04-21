"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookHeart, BrainCircuit } from "lucide-react";

import { AmbientBackdrop } from "@/components/game/ambient-backdrop";
import { EntityGuessDialog } from "@/components/game/entity-guess-dialog";
import { GuessMyMindBoard } from "@/components/game/guess-my-mind-board";
import { PlaySetup } from "@/components/game/play-setup";
import { ReadMyMindBoard } from "@/components/game/read-my-mind-board";
import { ResultScreen } from "@/components/game/result-screen";
import { StatsPanel } from "@/components/game/stats-panel";
import { Button } from "@/components/ui/button";
import { questionById } from "@/lib/data/questions";
import {
  applyReadMyMindAnswer,
  askGuessMyMindQuestion,
  createGuessMyMindSession,
  createReadMyMindSession,
  resolveReadMyMindGuess,
  submitGuessMyMindGuess,
} from "@/lib/game/session";
import {
  defaultLearnedStore,
  loadLearnedEntities,
  prependLearnedEntity,
  saveLearnedEntities,
} from "@/lib/game/learned-storage";
import {
  applyResultToStats,
  createHistoryEntry,
  defaultSettings,
  defaultVault,
  loadVault,
  saveVault,
} from "@/lib/game/storage";
import { getTeachEntitiesForCategory } from "@/lib/game/teach";
import {
  difficulties,
  entityCategories,
  gameModes,
  type AnsweredQuestion,
  type AttributeKey,
  type GameEntity,
  type GameResult,
  type GuessMyMindSession,
  type NormalizedAnswer,
  type ReadMyMindSession,
  type StoredSettings,
  type TeachCase,
} from "@/types/game";

type ScreenState = "setup" | "play" | "result";

interface GameShellProps {
  initialMode?: string;
  initialCategory?: string;
  initialDifficulty?: string;
}

function pickValue<T extends string>(allowed: readonly T[], value: string | undefined, fallback: T) {
  return value && allowed.includes(value as T) ? (value as T) : fallback;
}

export function GameShell({ initialMode, initialCategory, initialDifficulty }: GameShellProps) {
  const queryOverrides = {
    mode: pickValue(gameModes, initialMode, defaultSettings.mode),
    category: pickValue(entityCategories, initialCategory, defaultSettings.category),
    difficulty: pickValue(difficulties, initialDifficulty, defaultSettings.difficulty),
  } satisfies Pick<StoredSettings, "mode" | "category" | "difficulty">;
  const initialOverridesRef = useRef(queryOverrides);

  const [settings, setSettings] = useState<StoredSettings>({
    ...defaultSettings,
    ...queryOverrides,
  });
  const [vault, setVault] = useState(defaultVault);
  const [learnedStore, setLearnedStore] = useState(defaultLearnedStore);
  const [hydrated, setHydrated] = useState(false);
  const [screen, setScreen] = useState<ScreenState>("setup");
  const [readSession, setReadSession] = useState<ReadMyMindSession | null>(null);
  const [guessSession, setGuessSession] = useState<GuessMyMindSession | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);
  const [guessDialogOpen, setGuessDialogOpen] = useState(false);
  const [guessDialogCandidateId, setGuessDialogCandidateId] = useState<string | null>(null);
  const [teachSaved, setTeachSaved] = useState(false);
  const [readTrailSnapshot, setReadTrailSnapshot] = useState<AnsweredQuestion[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const recordedResults = useRef<Set<string>>(new Set());
  const revealTimeoutRef = useRef<number | null>(null);

  function clearRevealTimeout() {
    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      clearRevealTimeout();
    };
  }, []);

  useEffect(() => {
    const stored = loadVault();
    const storedLearned = loadLearnedEntities();
    const frame = window.requestAnimationFrame(() => {
      setVault(stored);
      setLearnedStore(storedLearned);
      setSettings({
        ...stored.settings,
        ...initialOverridesRef.current,
        soundEnabled: stored.settings.soundEnabled,
      });
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveVault({
      ...vault,
      settings,
    });
  }, [hydrated, settings, vault]);

  const activeTeachEntities: GameEntity[] = useMemo(() => {
    if (!settings.useTeachCases) {
      return [];
    }

    return getTeachEntitiesForCategory(learnedStore.entries, settings.category);
  }, [settings.useTeachCases, settings.category, learnedStore.entries]);

  const activeTeachEntityById = useMemo(() => {
    return new Map(activeTeachEntities.map((entity) => [entity.id, entity] as const));
  }, [activeTeachEntities]);

  const teachCasesForCategory = useMemo(
    () => learnedStore.entries.filter((tc) => tc.category === settings.category).length,
    [learnedStore.entries, settings.category],
  );

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveLearnedEntities(learnedStore);
  }, [hydrated, learnedStore]);

  const persistResult = useEffectEvent((gameResult: GameResult) => {
    setVault((previous) => ({
      ...previous,
      stats: applyResultToStats(previous.stats, gameResult),
      history: [createHistoryEntry(gameResult), ...previous.history].slice(0, 16),
    }));
  });

  useEffect(() => {
    if (!result || recordedResults.current.has(result.id)) {
      return;
    }

    recordedResults.current.add(result.id);
    persistResult(result);
  }, [result]);

  useEffect(() => {
    if (screen !== "play" || !readSession?.queuedGuessId) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setGuessDialogCandidateId(readSession.queuedGuessId!);
      setGuessDialogOpen(true);
    }, 1050);

    return () => window.clearTimeout(timeout);
  }, [readSession?.queuedGuessId, screen]);

  function updateSettings(patch: Partial<StoredSettings>) {
    startTransition(() => {
      setSettings((current) => ({
        ...current,
        ...patch,
      }));
    });
  }

  function launchSession(nextSettings: StoredSettings = settings) {
    clearRevealTimeout();
    setIsRevealing(false);

    startTransition(() => {
      setTeachSaved(false);
      setResult(null);
      setGuessDialogOpen(false);
      setGuessDialogCandidateId(null);
      setReadTrailSnapshot([]);

      const teachPool = nextSettings.useTeachCases
        ? getTeachEntitiesForCategory(learnedStore.entries, nextSettings.category)
        : [];

      if (nextSettings.mode === "read-my-mind") {
        setReadSession(
          createReadMyMindSession(
            {
              category: nextSettings.category,
              difficulty: nextSettings.difficulty,
            },
            teachPool,
          ),
        );
        setGuessSession(null);
      } else {
        setGuessSession(
          createGuessMyMindSession(
            {
              category: nextSettings.category,
              difficulty: nextSettings.difficulty,
            },
            teachPool,
          ),
        );
        setReadSession(null);
      }

      setScreen("play");
    });
  }

  /**
   * Short suspense beat before the result screen appears. Only applied when
   * there's an actual entity reveal to linger on — escapes with no revealed
   * entity transition immediately so we never introduce dead air.
   */
  const REVEAL_DELAY_MS = 700;

  function finalizeResult(nextResult: GameResult) {
    setGuessDialogOpen(false);
    setGuessDialogCandidateId(null);
    clearRevealTimeout();

    const hasReveal = !!nextResult.revealedEntityId;

    if (!hasReveal) {
      setResult(nextResult);
      setScreen("result");
      return;
    }

    setIsRevealing(true);
    revealTimeoutRef.current = window.setTimeout(() => {
      revealTimeoutRef.current = null;
      setIsRevealing(false);
      setResult(nextResult);
      setScreen("result");
    }, REVEAL_DELAY_MS);
  }

  function handleReadAnswer(answer: AnsweredQuestion["answer"]) {
    if (!readSession) {
      return;
    }

    const currentQuestion = readSession.currentQuestionId ? questionById.get(readSession.currentQuestionId) : null;
    const trailSnapshot = currentQuestion
      ? [
          ...readSession.asked,
          {
            questionId: currentQuestion.id,
            attributeKey: currentQuestion.attributeKey,
            prompt: currentQuestion.question,
            answer,
            askedAt: new Date().toISOString(),
          },
        ]
      : readSession.asked;

    startTransition(() => {
      const outcome = applyReadMyMindAnswer(readSession, answer, activeTeachEntities);

      if (outcome.result) {
        setReadTrailSnapshot(trailSnapshot);
        finalizeResult(outcome.result);
        return;
      }

      if (outcome.session) {
        setReadSession(outcome.session);
      }
    });
  }

  function handleResolveGuess(guessedCorrectly: boolean) {
    if (!readSession) {
      return;
    }

    setGuessDialogOpen(false);
    setGuessDialogCandidateId(null);

    startTransition(() => {
      const outcome = resolveReadMyMindGuess(readSession, guessedCorrectly, activeTeachEntities);

      if (outcome.result) {
        setReadTrailSnapshot(readSession.asked);
        finalizeResult(outcome.result);
        return;
      }

      if (outcome.session) {
        setReadSession(outcome.session);
      }
    });
  }

  function handleAskQuestion(questionId: string) {
    if (!guessSession) {
      return;
    }

    startTransition(() => {
      setGuessSession(askGuessMyMindQuestion(guessSession, questionId, activeTeachEntities));
    });
  }

  function handleSubmitGuess(entityId: string) {
    if (!guessSession) {
      return;
    }

    startTransition(() => {
      const outcome = submitGuessMyMindGuess(guessSession, entityId, activeTeachEntities);

      if (outcome.result) {
        finalizeResult(outcome.result);
        return;
      }

      if (outcome.session) {
        setGuessSession(outcome.session);
      }
    });
  }

  function handleBackToSetup() {
    clearRevealTimeout();
    setIsRevealing(false);

    startTransition(() => {
      setScreen("setup");
      setGuessDialogOpen(false);
      setGuessDialogCandidateId(null);
    });
  }

  function handlePlayAgain() {
    if (!result) {
      launchSession();
      return;
    }

    const nextSettings: StoredSettings = {
      ...settings,
      mode: result.mode,
      category: result.category,
      difficulty: result.difficulty,
    };

    setSettings(nextSettings);
    launchSession(nextSettings);
  }

  function handleTeach(
    entityName: string,
    note: string,
    extraAttributes: Partial<Record<AttributeKey, NormalizedAnswer>>,
  ) {
    const memory: TeachCase = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `teach-${Date.now()}`,
      createdAt: new Date().toISOString(),
      category: settings.category,
      difficulty: settings.difficulty,
      entityName,
      note,
      answers: readTrailSnapshot,
      ...(Object.keys(extraAttributes).length > 0 ? { extraAttributes } : {}),
    };

    setLearnedStore((previous) => prependLearnedEntity(previous, memory));
    setTeachSaved(true);
  }

  const dialogConfidence =
    readSession?.rankings.find((candidate) => candidate.entityId === guessDialogCandidateId)?.confidence ?? 0;
  const isGuessScanning =
    screen === "play" && settings.mode === "read-my-mind" && !!readSession?.queuedGuessId && !guessDialogOpen;

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <AmbientBackdrop />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-200/80">Mind Reader</p>
            <h1 className="font-display text-3xl text-white sm:text-4xl">Psychic Chamber</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="ghost">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Landing
              </Link>
            </Button>
            <Button variant="secondary" onClick={() => setStatsOpen(true)}>
              <BookHeart className="h-4 w-4" />
              Archive
            </Button>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur-xl">
          <BrainCircuit className="h-4 w-4 text-cyan-200" />
          Local only. No accounts. Shared knowledge base across both modes.
          <span className="hidden text-slate-500 sm:inline">•</span>
          <span>{hydrated ? `${vault.stats.totalGames} archived session${vault.stats.totalGames === 1 ? "" : "s"}` : "Loading archive..."}</span>
          <span className="hidden text-slate-500 sm:inline">•</span>
          <span>{settings.mode === "read-my-mind" ? "Machine guesses you" : "You guess the machine"}</span>
        </div>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            {screen === "setup" ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <PlaySetup
                  settings={settings}
                  onChange={updateSettings}
                  onStart={() => launchSession(settings)}
                  isPending={isPending}
                  teachCaseCount={teachCasesForCategory}
                />
              </motion.div>
            ) : null}

            {screen === "play" && settings.mode === "read-my-mind" && readSession ? (
              <motion.div
                key={`play-read-${readSession.startedAt}`}
                initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <ReadMyMindBoard
                  session={readSession}
                  onAnswer={handleReadAnswer}
                  isPending={isPending || isRevealing}
                  isScanningGuess={isGuessScanning || isRevealing}
                  teachEntities={activeTeachEntityById}
                />
              </motion.div>
            ) : null}

            {screen === "play" && settings.mode === "guess-my-mind" && guessSession ? (
              <motion.div
                key={`play-guess-${guessSession.startedAt}`}
                initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <GuessMyMindBoard
                  session={guessSession}
                  onAskQuestion={handleAskQuestion}
                  onSubmitGuess={handleSubmitGuess}
                  isPending={isPending || isRevealing}
                  teachEntities={activeTeachEntityById}
                />
              </motion.div>
            ) : null}

            {screen === "result" && result ? (
              <motion.div
                key={`result-${result.id}`}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                  scale: { type: "spring", stiffness: 220, damping: 22 },
                }}
              >
                <ResultScreen
                  result={result}
                  onPlayAgain={handlePlayAgain}
                  onBackToSetup={handleBackToSetup}
                  onTeach={handleTeach}
                  teachSaved={teachSaved}
                  teachEntities={activeTeachEntityById}
                  teachTrail={readTrailSnapshot}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>
      </div>

      <EntityGuessDialog
        open={guessDialogOpen}
        candidateId={guessDialogCandidateId}
        confidence={dialogConfidence}
        guessesRemaining={Math.max(0, (readSession?.config.maxGuesses ?? 0) - (readSession?.guessAttemptsUsed ?? 0) - 1)}
        onConfirm={() => handleResolveGuess(true)}
        onReject={() => handleResolveGuess(false)}
        teachEntities={activeTeachEntityById}
      />

      <StatsPanel
        open={statsOpen}
        onOpenChange={setStatsOpen}
        stats={vault.stats}
        history={vault.history}
        learnedEntities={learnedStore.entries}
      />
    </div>
  );
}
