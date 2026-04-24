"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import type { SetupStep } from "@/components/game/play-setup";
import type { GameResult } from "@/types/game";

export type ScreenState =
  | "profile"
  | "encounter"
  | "setup"
  | "play"
  | "result"
  | "memory"
  | "world-rank";

export type ReturnableScreenState = Exclude<
  ScreenState,
  "memory" | "world-rank" | "profile"
>;

const REVEAL_DELAY_MS = 700;

interface RevealControllerOptions {
  onBeforeFinalize: () => void;
  onImmediateResult: (result: GameResult) => void;
  onDelayedResult: (result: GameResult) => void;
}

export function useRevealController({
  onBeforeFinalize,
  onImmediateResult,
  onDelayedResult,
}: RevealControllerOptions) {
  const [isRevealing, setIsRevealing] = useState(false);
  const revealTimeoutRef = useRef<number | null>(null);

  const clearRevealTimeout = useCallback(() => {
    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearRevealTimeout, [clearRevealTimeout]);

  const finalizeResult = useCallback(
    (nextResult: GameResult) => {
      onBeforeFinalize();
      clearRevealTimeout();

      if (!nextResult.revealedEntityId) {
        setIsRevealing(false);
        onImmediateResult(nextResult);
        return;
      }

      setIsRevealing(true);
      revealTimeoutRef.current = window.setTimeout(() => {
        revealTimeoutRef.current = null;
        setIsRevealing(false);
        onDelayedResult(nextResult);
      }, REVEAL_DELAY_MS);
    },
    [clearRevealTimeout, onBeforeFinalize, onDelayedResult, onImmediateResult],
  );

  return {
    isRevealing,
    setIsRevealing,
    clearRevealTimeout,
    finalizeResult,
  };
}

interface UtilitySceneControllerOptions {
  setScreen: (screen: ScreenState) => void;
  setSetupStep: (step: SetupStep) => void;
}

export function useUtilitySceneController({
  setScreen,
  setSetupStep,
}: UtilitySceneControllerOptions) {
  const [memoryReturnScreen, setMemoryReturnScreen] =
    useState<ReturnableScreenState>("encounter");
  const [, startTransition] = useTransition();

  const openUtilityScene = useCallback(
    (screen: "memory" | "world-rank") => {
      startTransition(() => {
        setSetupStep("mode");
        setMemoryReturnScreen("setup");
        setScreen(screen);
      });
    },
    [setScreen, setSetupStep],
  );

  const closeUtilityScene = useCallback(() => {
    startTransition(() => {
      if (memoryReturnScreen === "setup") {
        setSetupStep("mode");
      }
      setScreen(memoryReturnScreen);
    });
  }, [memoryReturnScreen, setScreen, setSetupStep]);

  return {
    memoryReturnScreen,
    openMemory: () => openUtilityScene("memory"),
    openWorldRank: () => openUtilityScene("world-rank"),
    closeMemory: closeUtilityScene,
    closeWorldRank: closeUtilityScene,
  };
}
