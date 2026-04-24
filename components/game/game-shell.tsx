"use client";

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookHeart } from "lucide-react";

import { ChamberSceneShell } from "@/components/game/chamber-scene-shell";
import { EncounterScene } from "@/components/game/encounter-scene";
import { EntityGuessDialog } from "@/components/game/entity-guess-dialog";
import {
  type ScreenState,
  useRevealController,
  useUtilitySceneController,
} from "@/components/game/game-shell-controllers";
import { GuessMyMindBoard } from "@/components/game/guess-my-mind-board";
import { PlaySetup, type SetupStep } from "@/components/game/play-setup";
import { PlayerNameGate } from "@/components/game/player-name-gate";
import { ReadMyMindBoard } from "@/components/game/read-my-mind-board";
import { ResultScreen } from "@/components/game/result-screen";
import { SurfacePillButton } from "@/components/game/scene-surfaces";
import { StatsPanel } from "@/components/game/stats-panel";
import { WorldRankPanel } from "@/components/game/world-rank-panel";
import { SiteFooter } from "@/components/site/site-footer";
import { entityById } from "@/lib/data/entities";
import { questionById } from "@/lib/data/questions";
import {
  applyQuestionEntropyDrops,
  applyCompletedEntityLearning,
  applyTeachCaseLearning,
  mergeLearnedModel,
  replayEntropyDrops,
} from "@/lib/game/inference-model";
import {
  getSetupMascotState,
  getQuestionMascotState,
  getResultMascotState,
} from "@/lib/game/mascot";
import { createPublicGameServices } from "@/lib/game/leaderboard-service";
import {
  clearPlayerProfile,
  loadPlayerProfile,
  renamePlayerProfile,
  savePlayerProfile,
} from "@/lib/game/player-profile";
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
import { rankCandidates } from "@/lib/game/scoring";
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
  type PlayerProfile,
  type ReadMyMindSession,
  type StoredSettings,
  type TeachCase,
} from "@/types/game";

interface GameShellProps {
  initialMode?: string;
  initialCategory?: string;
  initialDifficulty?: string;
}

function pickValue<T extends string>(allowed: readonly T[], value: string | undefined, fallback: T) {
  return value && allowed.includes(value as T) ? (value as T) : fallback;
}

function resolveEntity(extraEntities: GameEntity[], id: string) {
  return entityById.get(id) ?? extraEntities.find((entity) => entity.id === id);
}

const sceneTransitionProps = {
  initial: { opacity: 0, y: 22, scale: 0.985, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -18, scale: 0.99, filter: "blur(8px)" },
  transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
} as const;

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
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [screen, setScreen] = useState<ScreenState>("encounter");
  const [readSession, setReadSession] = useState<ReadMyMindSession | null>(null);
  const [guessSession, setGuessSession] = useState<GuessMyMindSession | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [guessDialogOpen, setGuessDialogOpen] = useState(false);
  const [guessDialogCandidateId, setGuessDialogCandidateId] = useState<string | null>(null);
  const [teachSaved, setTeachSaved] = useState(false);
  const [readTrailSnapshot, setReadTrailSnapshot] = useState<AnsweredQuestion[]>([]);
  const [setupStep, setSetupStep] = useState<SetupStep>("mode");
  const [isPending, startTransition] = useTransition();
  const publicServices = useMemo(() => createPublicGameServices(), []);
  const recordedResults = useRef<Set<string>>(new Set());
  const resetGuessDialog = useCallback(() => {
    setGuessDialogOpen(false);
    setGuessDialogCandidateId(null);
  }, []);
  const { isRevealing, setIsRevealing, clearRevealTimeout, finalizeResult } =
    useRevealController({
      onBeforeFinalize: resetGuessDialog,
      onImmediateResult: (nextResult) => {
        setResult(nextResult);
        setScreen("result");
      },
      onDelayedResult: (nextResult) => {
        setResult(nextResult);
        setScreen("result");
      },
    });
  const {
    openMemory: handleOpenMemory,
    openWorldRank: handleOpenWorldRank,
    closeMemory: handleCloseMemory,
    closeWorldRank: handleCloseWorldRank,
  } = useUtilitySceneController({ setScreen, setSetupStep });

  useEffect(() => {
    const stored = loadVault();
    const storedLearned = loadLearnedEntities();
    const storedProfile = loadPlayerProfile();
    const frame = window.requestAnimationFrame(() => {
      setVault(stored);
      setLearnedStore(storedLearned);
      setPlayerProfile(storedProfile);
      setSettings({
        ...stored.settings,
        ...initialOverridesRef.current,
        soundEnabled: stored.settings.soundEnabled,
      });
      if (!storedProfile) {
        setScreen("profile");
      }
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
    const projectedStats = applyResultToStats(vault.stats, gameResult);
    setVault((previous) => ({
      ...previous,
      stats: applyResultToStats(previous.stats, gameResult),
      history: [createHistoryEntry(gameResult), ...previous.history].slice(0, 16),
    }));

    if (playerProfile) {
      void publicServices.submitResult(playerProfile, gameResult, projectedStats.bestStreak);
    }
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
            learnedStore.model,
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
      const outcome = applyReadMyMindAnswer(
        readSession,
        answer,
        activeTeachEntities,
        learnedStore.model,
      );

      if (outcome.result) {
        applyReadRoundQuestionLearning({
          ...readSession,
          asked: trailSnapshot,
        });
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
      const outcome = resolveReadMyMindGuess(
        readSession,
        guessedCorrectly,
        activeTeachEntities,
        learnedStore.model,
      );

      if (outcome.result) {
        applyReadRoundQuestionLearning(readSession);
        if (guessedCorrectly && readSession.queuedGuessId) {
          applyResolvedReadLearning(readSession, readSession.queuedGuessId);
        }
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
        applyGuessRoundQuestionLearning(guessSession);
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
      setSetupStep("mode");
      setScreen("setup");
      setGuessDialogOpen(false);
      setGuessDialogCandidateId(null);
    });
  }

  function handleCreateProfile(profile: PlayerProfile) {
    savePlayerProfile(profile);
    setPlayerProfile(profile);
    void publicServices.saveProfile(profile);
    setScreen("encounter");
  }

  function handleRenameProfile(displayName: string) {
    if (!playerProfile) {
      return;
    }

    const renamed = renamePlayerProfile(playerProfile, displayName);
    savePlayerProfile(renamed);
    setPlayerProfile(renamed);
    void publicServices.saveProfile(renamed);
  }

  function handleResetProfile() {
    clearPlayerProfile();
    setPlayerProfile(null);
    setVault(defaultVault);
    setSettings(defaultSettings);
    saveVault(defaultVault);
    setScreen("profile");
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

    setLearnedStore((previous) =>
      mergeLearnedModel(prependLearnedEntity(previous, memory), (model) =>
        applyTeachCaseLearning(model, memory),
      ),
    );
    setTeachSaved(true);
  }

  function applyReadRoundQuestionLearning(session: ReadMyMindSession) {
    setLearnedStore((previous) =>
      mergeLearnedModel(previous, (model) =>
        applyQuestionEntropyDrops(
          model,
          replayEntropyDrops(session.category, session.asked, (trail) =>
            rankCandidates(session.category, trail, [], activeTeachEntities, model),
          ),
        ),
      ),
    );
  }

  function applyGuessRoundQuestionLearning(session: GuessMyMindSession) {
    const trail: AnsweredQuestion[] = session.asked.map((entry) => ({
      questionId: entry.questionId,
      attributeKey: entry.attributeKey,
      prompt: entry.prompt,
      answer: entry.answer,
      askedAt: entry.askedAt,
    }));
    const secretEntity = resolveEntity(activeTeachEntities, session.secretEntityId);

    setLearnedStore((previous) =>
      mergeLearnedModel(previous, (model) => {
        let next = applyQuestionEntropyDrops(
          model,
          replayEntropyDrops(session.category, trail, (replayedTrail) =>
            rankCandidates(session.category, replayedTrail, [], activeTeachEntities, model),
          ),
        );

        if (secretEntity && trail.length > 0) {
          next = applyCompletedEntityLearning(next, session.category, secretEntity, trail);
        }

        return next;
      }),
    );
  }

  function applyResolvedReadLearning(session: ReadMyMindSession, entityId: string) {
    const entity = resolveEntity(activeTeachEntities, entityId);
    if (!entity) {
      return;
    }

    setLearnedStore((previous) =>
      mergeLearnedModel(previous, (model) =>
        applyCompletedEntityLearning(model, session.category, entity, session.asked),
      ),
    );
  }

  const dialogConfidence =
    readSession?.rankings.find((candidate) => candidate.entityId === guessDialogCandidateId)?.confidence ?? 0;
  const isGuessScanning =
    screen === "play" && settings.mode === "read-my-mind" && !!readSession?.queuedGuessId && !guessDialogOpen;
  const stageMascotState =
    screen === "memory" || screen === "world-rank"
      ? "observing"
      : screen === "profile"
        ? "welcome"
      : guessDialogOpen
      ? "confident"
      : screen === "result" && result
        ? getResultMascotState({ result, teachSaved })
        : screen === "play"
          ? getQuestionMascotState({
              mode: settings.mode,
              isPending: isPending || isRevealing,
              isScanningGuess: isGuessScanning || isRevealing,
            })
          : screen === "encounter"
            ? "welcome"
            : getSetupMascotState(setupStep);
  const shellScene =
    screen === "memory" || screen === "world-rank"
      ? "archive"
      : screen === "profile"
        ? "encounter"
      : guessDialogOpen
      ? "reveal"
      : screen === "encounter"
        ? "encounter"
        : screen === "setup"
          ? setupStep === "mode"
            ? "mode-selection"
            : "category-selection"
        : screen === "play"
          ? settings.mode === "read-my-mind"
              ? "read-my-mind"
              : guessSession && guessSession.asked.length > 0
                ? "clue-browser"
                : "guess-my-mind"
            : result?.teachable && !teachSaved
              ? "teach-flow"
            : "result";
  const showModeUtilities = screen === "setup" && setupStep === "mode";
  const showSiteFooter = showModeUtilities || screen === "memory" || screen === "world-rank";

  return (
    <>
    <ChamberSceneShell
      scene={shellScene}
      mood={stageMascotState}
      footer={showSiteFooter ? <SiteFooter variant="play" className="pt-3" /> : null}
      header={
        <div className="mx-auto flex w-full max-w-[1320px] items-start justify-between gap-4 pt-1">
          <div className="flex flex-col items-start gap-2">
            {showModeUtilities ? (
              <>
              <SurfacePillButton tone="default" surface="compact" className="px-3 py-1.5 opacity-82" onClick={handleOpenMemory}>
                <BookHeart className="h-4 w-4" />
                Chamber memory
              </SurfacePillButton>
              <SurfacePillButton tone="default" surface="compact" className="px-3 py-1.5 opacity-82" onClick={handleOpenWorldRank}>
                <BookHeart className="h-4 w-4" />
                World Rank
              </SurfacePillButton>
              </>
            ) : null}
          </div>

          <div className="flex justify-end">
            {screen === "memory" ? (
              <SurfacePillButton tone="default" surface="compact" className="px-3 py-1.5 opacity-80" onClick={handleCloseMemory}>
                <ArrowLeft className="h-4 w-4" />
                Return
              </SurfacePillButton>
            ) : screen === "world-rank" ? (
              <SurfacePillButton tone="default" surface="compact" className="px-3 py-1.5 opacity-80" onClick={handleCloseWorldRank}>
                <ArrowLeft className="h-4 w-4" />
                Return
              </SurfacePillButton>
            ) : screen === "play" || screen === "result" ? (
              <SurfacePillButton tone="default" surface="compact" className="px-3 py-1.5 opacity-80" onClick={handleBackToSetup}>
                <ArrowLeft className="h-4 w-4" />
                Leave ritual
              </SurfacePillButton>
            ) : null}
          </div>
        </div>
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {screen === "profile" ? (
          <motion.div
            key="profile"
            {...sceneTransitionProps}
          >
            <PlayerNameGate onCreateProfile={handleCreateProfile} />
          </motion.div>
        ) : null}

        {screen === "encounter" ? (
          <motion.div
            key="encounter"
            {...sceneTransitionProps}
          >
            <EncounterScene onContinue={() => setScreen("setup")} />
          </motion.div>
        ) : null}

        {screen === "setup" ? (
          <motion.div
            key="setup"
            {...sceneTransitionProps}
          >
            <PlaySetup
              settings={settings}
              onChange={updateSettings}
              onStart={() => launchSession(settings)}
              isPending={isPending}
              teachCaseCount={teachCasesForCategory}
              onStepChange={setSetupStep}
            />
          </motion.div>
        ) : null}

        {screen === "play" && settings.mode === "read-my-mind" && readSession ? (
          <motion.div
            key={`play-read-${readSession.startedAt}`}
            {...sceneTransitionProps}
          >
            <ReadMyMindBoard
              session={readSession}
              onAnswer={handleReadAnswer}
              isPending={isPending || isRevealing}
              isScanningGuess={isGuessScanning || isRevealing}
            />
          </motion.div>
        ) : null}

        {screen === "play" && settings.mode === "guess-my-mind" && guessSession ? (
          <motion.div
            key={`play-guess-${guessSession.startedAt}`}
            {...sceneTransitionProps}
          >
            <GuessMyMindBoard
              session={guessSession}
              onAskQuestion={handleAskQuestion}
              onSubmitGuess={handleSubmitGuess}
              isPending={isPending || isRevealing}
              teachEntities={activeTeachEntityById}
              inferenceModel={learnedStore.model}
            />
          </motion.div>
        ) : null}

        {screen === "result" && result ? (
          <motion.div
            key={`result-${result.id}`}
            {...sceneTransitionProps}
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

        {screen === "memory" ? (
          <motion.div
            key="memory"
            {...sceneTransitionProps}
          >
            <StatsPanel
              onClose={handleCloseMemory}
              stats={vault.stats}
              history={vault.history}
              learnedEntities={learnedStore.entries}
              profile={playerProfile}
              onRenameProfile={handleRenameProfile}
              onResetProfile={handleResetProfile}
            />
          </motion.div>
        ) : null}

        {screen === "world-rank" ? (
          <motion.div
            key="world-rank"
            {...sceneTransitionProps}
          >
            <WorldRankPanel
              profile={playerProfile}
              onClose={handleCloseWorldRank}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </ChamberSceneShell>

      <EntityGuessDialog
        open={guessDialogOpen}
        candidateId={guessDialogCandidateId}
        confidence={dialogConfidence}
        guessesRemaining={Math.max(0, (readSession?.config.maxGuesses ?? 0) - (readSession?.guessAttemptsUsed ?? 0) - 1)}
        onConfirm={() => handleResolveGuess(true)}
        onReject={() => handleResolveGuess(false)}
        teachEntities={activeTeachEntityById}
      />

    </>
  );
}
