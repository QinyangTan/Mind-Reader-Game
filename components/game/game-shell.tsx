"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookHeart } from "lucide-react";

import { AdSlot } from "@/components/brand/ad-slot";
import { BrandLogo } from "@/components/brand/brand-logo";
import { MediaAdCard } from "@/components/brand/media-ad-card";
import { SponsorRail } from "@/components/brand/sponsor-rail";
import { AmbientBackdrop } from "@/components/game/ambient-backdrop";
import { EntityGuessDialog } from "@/components/game/entity-guess-dialog";
import { ParlorStage } from "@/components/game/parlor-stage";
import { GuessMyMindBoard } from "@/components/game/guess-my-mind-board";
import { PlaySetup, type SetupStep } from "@/components/game/play-setup";
import { ReadMyMindBoard } from "@/components/game/read-my-mind-board";
import { ResultScreen } from "@/components/game/result-screen";
import { SceneCaption } from "@/components/game/scene-caption";
import { StageHostRail } from "@/components/game/stage-host-rail";
import { StatsPanel } from "@/components/game/stats-panel";
import { Button } from "@/components/ui/button";
import { entityById } from "@/lib/data/entities";
import { questionById } from "@/lib/data/questions";
import { categoryMeta, difficultyConfig, modeMeta } from "@/lib/game/game-config";
import {
  applyQuestionEntropyDrops,
  applyResolvedEntityAnswers,
  applyTeachCaseLearning,
  mergeLearnedModel,
  recordReadEntityConfirmation,
  replayEntropyDrops,
} from "@/lib/game/inference-model";
import {
  getMascotFacing,
  getSetupMascotState,
  getQuestionMascotState,
  getResultMascotState,
} from "@/lib/game/mascot";
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

function resolveEntity(extraEntities: GameEntity[], id: string) {
  return entityById.get(id) ?? extraEntities.find((entity) => entity.id === id);
}

function buildSceneCopy(options: {
  screen: ScreenState;
  mode: StoredSettings["mode"];
  setupStep: SetupStep;
  isGuessScanning: boolean;
  isRevealing: boolean;
  result: GameResult | null;
}) {
  if (options.screen === "setup") {
    switch (options.setupStep) {
      case "mode":
        return {
          id: "setup-mode",
          eyebrow: "Threshold scene",
          title: "A ritual waits to be chosen",
          detail: "Mora has opened the chamber. Pick the kind of mind-reading contest that will shape the rest of the night.",
        };
      case "category":
        return {
          id: "setup-category",
          eyebrow: "Focus scene",
          title: "The room asks what kind of thought you carry",
          detail: "Name the domain, and the chamber will begin to narrow its questions around that single thread.",
        };
      case "difficulty":
        return {
          id: "setup-difficulty",
          eyebrow: "Pressure scene",
          title: "The stakes settle into place",
          detail: "Set how much room either side gets to recover once the ritual sharpens.",
        };
      case "review":
        return {
          id: "setup-review",
          eyebrow: "Invocation scene",
          title: "The circle is almost closed",
          detail: "Everything important is chosen. One final action starts the reading.",
        };
    }
  }

  if (options.screen === "play") {
    if (options.mode === "read-my-mind") {
      if (options.isGuessScanning || options.isRevealing) {
        return {
          id: "play-read-reveal",
          eyebrow: "Revelation scene",
          title: "The chamber falls silent around her answer",
          detail: "Mora has stopped asking and started deciding. The next beat is a declaration.",
        };
      }

      return {
        id: "play-read-question",
        eyebrow: "Reading scene",
        title: "Mora listens for the shape of your thought",
        detail: "Each reply becomes part of the ritual. Keep the truth simple and let her tighten the pattern.",
      };
    }

    return {
      id: "play-guess-question",
      eyebrow: "Contest scene",
      title: "You question the psychic while she guards her secret",
      detail: "Pull one clue at a time. Her answers are calm on the surface, but the pattern still leaks through.",
    };
  }

  if (options.result?.teachable && options.result.winner === "player") {
    return {
      id: "result-teach",
      eyebrow: "Aftermath scene",
      title: "The chamber pauses to learn what escaped",
      detail: "A missed thought is not the end of the ritual. You can teach Mora what slipped beyond her reach.",
    };
  }

  return {
    id: options.result?.winner === "player" ? "result-player" : "result-system",
    eyebrow: "Aftermath scene",
    title:
      options.result?.winner === "player"
        ? "The veil breaks and the room gives the point to you"
        : "Mora holds the room with the certainty of a finished reveal",
    detail: "The ritual is over. Take in the result, then decide whether to step back into the circle.",
  };
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
  const [mascotReactionKey, setMascotReactionKey] = useState(0);
  const [setupStep, setSetupStep] = useState<SetupStep>("mode");
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

  function pulseMascot() {
    setMascotReactionKey((current) => current + 1);
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

    pulseMascot();
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

    pulseMascot();
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

    pulseMascot();
    startTransition(() => {
      setGuessSession(askGuessMyMindQuestion(guessSession, questionId, activeTeachEntities));
    });
  }

  function handleSubmitGuess(entityId: string) {
    if (!guessSession) {
      return;
    }

    pulseMascot();
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

    setLearnedStore((previous) =>
      mergeLearnedModel(previous, (model) =>
        applyQuestionEntropyDrops(
          model,
          replayEntropyDrops(session.category, trail, (replayedTrail) =>
            rankCandidates(session.category, replayedTrail, [], activeTeachEntities, model),
          ),
        ),
      ),
    );
  }

  function applyResolvedReadLearning(session: ReadMyMindSession, entityId: string) {
    const entity = resolveEntity(activeTeachEntities, entityId);
    if (!entity) {
      return;
    }

    setLearnedStore((previous) =>
      mergeLearnedModel(previous, (model) =>
        recordReadEntityConfirmation(
          applyResolvedEntityAnswers(model, session.category, entity, session.asked),
          entity.id,
        ),
      ),
    );
  }

  const dialogConfidence =
    readSession?.rankings.find((candidate) => candidate.entityId === guessDialogCandidateId)?.confidence ?? 0;
  const isGuessScanning =
    screen === "play" && settings.mode === "read-my-mind" && !!readSession?.queuedGuessId && !guessDialogOpen;
  const setupSubtitle = `${settings.mode === "read-my-mind" ? "Read My Mind" : "Guess My Mind"} · ${settings.difficulty}`;
  const stageContext =
    screen === "setup" ? "setup" : screen === "result" ? "result" : settings.mode === "read-my-mind" ? "read" : "guess";
  const stageMascotState =
    guessDialogOpen
      ? "confident"
      : screen === "result" && result
        ? getResultMascotState({ result, teachSaved })
        : screen === "play"
          ? getQuestionMascotState({
              mode: settings.mode,
              isPending: isPending || isRevealing,
              isScanningGuess: isGuessScanning || isRevealing,
            })
          : getSetupMascotState(setupStep);
  const stageHostTitle =
    screen === "setup"
      ? setupStep === "mode"
        ? "The chamber wakes."
        : setupStep === "category"
          ? "Choose the focus."
          : setupStep === "difficulty"
            ? "Decide the stakes."
            : "The circle is set."
      : screen === "play"
        ? settings.mode === "read-my-mind"
          ? isGuessScanning || isRevealing
            ? "Her answer is forming."
            : "Let her read you."
          : "Read her, if you can."
        : result?.winner === "player"
          ? "You broke the veil."
          : "Mora takes the bow.";
  const stageHostCue =
    screen === "setup"
      ? setupStep === "mode"
        ? "Choose which ritual you want to begin. Once that is decided, the rest of the chamber falls into place."
        : setupStep === "category"
          ? "Name the kind of thought we are hunting. One focus is enough to sharpen everything that follows."
          : setupStep === "difficulty"
            ? "Decide how much pressure you want in the room. More pressure means fewer recoveries."
            : "Everything is in place. Start when you are ready to let the chamber speak."
      : screen === "play"
        ? settings.mode === "read-my-mind"
          ? isGuessScanning || isRevealing
            ? "Stay still for one breath. Mora is drawing your answers into a single declaration."
            : "Keep your eyes on her question and answer with the closest truth."
          : "Ask one clear question, listen to her reply, and move to a guess only when the pattern truly narrows."
        : result?.teachable
          ? teachSaved
            ? "That lesson is tucked safely into memory. Another ritual can begin whenever you like."
            : "If this ritual slipped, teach Mora what she missed after you take in the result."
          : "Take the result, then decide whether you want to step back into the chamber.";
  const stageHostNextAction =
    screen === "setup"
      ? setupStep === "mode"
        ? "Choose one ritual"
        : setupStep === "category"
          ? "Choose one category"
        : setupStep === "difficulty"
            ? "Choose one pressure level"
            : "Begin the ritual"
      : screen === "play"
        ? settings.mode === "read-my-mind"
          ? isGuessScanning || isRevealing
            ? "Wait for the reveal"
            : "Use the answer buttons below"
          : "Ask one question or make your guess"
        : result?.teachable && !teachSaved
          ? "Play again or teach Mora"
          : "Play again";
  const stageHostDetail =
    screen === "setup"
      ? setupStep === "mode"
        ? "The chamber starts with a single story choice, not a wall of controls."
        : setupStep === "category"
          ? "Only the focus domain stays in front of you while Mora holds the rest of the atmosphere."
          : setupStep === "difficulty"
            ? "Choose the pressure, then let the room commit. Limits stay clear without turning this into a dashboard."
            : "One main button starts the ritual. Everything else steps politely back."
      : screen === "play"
        ? settings.mode === "read-my-mind"
          ? "The spoken question stays central while Mora studies you from the left side of the room."
          : "The clue flow stays conversational, and the guessing move stays separate so the path never blurs."
        : result?.teachable
          ? "The ritual resolves first. Corrections and memory work only come forward after the reveal lands."
          : "The result lands quickly, reads quickly, and gives you one clear next move.";
  const activeLimits =
    settings.mode === "read-my-mind"
      ? difficultyConfig[settings.difficulty].readMyMind
      : difficultyConfig[settings.difficulty].guessMyMind;
  const sceneCopy = buildSceneCopy({
    screen,
    mode: settings.mode,
    setupStep,
    isGuessScanning,
    isRevealing,
    result,
  });

  return (
    <div className="relative min-h-screen overflow-hidden text-[#f7efd9]">
      <AmbientBackdrop />

      <ParlorStage
        header={
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <BrandLogo compact withTagline />
                {screen === "setup" ? <p className="text-sm text-[#dbcdb5]">{setupSubtitle}</p> : null}
                {screen === "play" ? (
                  <p className="text-sm text-[#dbcdb5]">
                    {settings.mode === "read-my-mind"
                      ? "Stay in the exchange and answer her cleanly."
                      : "Follow the conversation until you are ready to confront her with a guess."}
                  </p>
                ) : null}
                {screen === "result" ? <p className="text-sm text-[#dbcdb5]">The ritual has resolved.</p> : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {screen === "setup" ? (
                  <Button size="sm" variant="ghost" onClick={() => setStatsOpen(true)}>
                    <BookHeart className="h-4 w-4" />
                    Chamber memory
                  </Button>
                ) : null}

                {screen === "play" ? (
                  <Button size="sm" variant="ghost" onClick={handleBackToSetup}>
                    <ArrowLeft className="h-4 w-4" />
                    Step out
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="hidden lg:block xl:hidden">
              <AdSlot
                size="leaderboard"
                label="Chamber notice"
                title="Reserved upper banner"
                fallbackVariant={screen === "result" ? "featured" : "supporter"}
              >
                <MediaAdCard
                  creativeId="midnight-platform-poster"
                  size="leaderboard"
                  fallbackVariant={screen === "result" ? "featured" : "supporter"}
                />
              </AdSlot>
            </div>
          </div>
        }
        host={
          <StageHostRail
            state={stageMascotState}
            mode={settings.mode}
            facing={getMascotFacing(settings.mode)}
            reactionKey={mascotReactionKey}
            title={stageHostTitle}
            detail={stageHostDetail}
            cue={stageHostCue}
            nextAction={stageHostNextAction}
          >
            <div className="rounded-[1.15rem] border border-[rgba(240,217,162,0.14)] bg-[rgba(18,10,24,0.46)] px-4 py-4 text-sm text-[#dbcdb5]">
              <p className="text-[0.68rem] tracking-[0.22em] text-[#d6a653]">RITUAL SUMMARY</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span>Ritual</span>
                  <span className="text-[#f7efd9]">{modeMeta[settings.mode].label}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Category</span>
                  <span className="text-[#f7efd9]">{categoryMeta[settings.category].label}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Pressure</span>
                  <span className="text-[#f7efd9]">{difficultyConfig[settings.difficulty].label}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Limits</span>
                  <span className="text-[#f7efd9]">
                    {activeLimits.maxQuestions}Q / {activeLimits.maxGuesses}G
                  </span>
                </div>
              </div>
            </div>
          </StageHostRail>
        }
        support={<SponsorRail context={stageContext} className="sticky top-5" />}
        footer={
          <div className="space-y-3">
            <div className="rounded-[1.05rem] border border-[rgba(240,217,162,0.12)] bg-[rgba(18,10,24,0.52)] px-4 py-3 text-xs text-[#cbbda5] sm:text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>The chamber keeps the ritual in the center, Mora on the left, and everything secondary at the edges.</span>
                <span className="text-[#f0d9a2]">Local-first. Story-led. One decision at a time.</span>
              </div>
            </div>

            <div className="xl:hidden">
              <AdSlot
                size="mobile"
                label="Chamber notice"
                title="Reserved mobile banner"
                fallbackVariant={screen === "play" ? "nightly-challenge" : "supporter"}
              >
                <MediaAdCard
                  creativeId="midnight-platform-poster"
                  size="mobile"
                  fallbackVariant={screen === "play" ? "nightly-challenge" : "supporter"}
                />
              </AdSlot>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <SceneCaption
            sceneId={sceneCopy.id}
            eyebrow={sceneCopy.eyebrow}
            title={sceneCopy.title}
            detail={sceneCopy.detail}
          />

          <AnimatePresence mode="wait" initial={false}>
            {screen === "setup" ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <ReadMyMindBoard
                  session={readSession}
                  onAnswer={handleReadAnswer}
                  isPending={isPending || isRevealing}
                  isScanningGuess={isGuessScanning || isRevealing}
                  teachEntities={activeTeachEntityById}
                  mascotReactionKey={mascotReactionKey}
                />
              </motion.div>
            ) : null}

            {screen === "play" && settings.mode === "guess-my-mind" && guessSession ? (
              <motion.div
                key={`play-guess-${guessSession.startedAt}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <GuessMyMindBoard
                  session={guessSession}
                  onAskQuestion={handleAskQuestion}
                  onSubmitGuess={handleSubmitGuess}
                  isPending={isPending || isRevealing}
                  teachEntities={activeTeachEntityById}
                  mascotReactionKey={mascotReactionKey}
                  inferenceModel={learnedStore.model}
                />
              </motion.div>
            ) : null}

            {screen === "result" && result ? (
              <motion.div
                key={`result-${result.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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
        </div>
      </ParlorStage>

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
