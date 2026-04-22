"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { Button } from "@/components/ui/button";
import { categoryMeta, difficultyConfig, modeMeta } from "@/lib/game/game-config";
import { cn } from "@/lib/utils/cn";
import type { StoredSettings } from "@/types/game";

interface PlaySetupProps {
  settings: StoredSettings;
  onChange: (patch: Partial<StoredSettings>) => void;
  onStart: () => void;
  isPending: boolean;
  teachCaseCount: number;
  onStepChange?: (step: SetupStep) => void;
}

export type SetupStep = "mode" | "category" | "difficulty" | "review";

const stepOrder: SetupStep[] = ["mode", "category", "difficulty", "review"];

const stepCopy: Record<
  SetupStep,
  {
    eyebrow: string;
    title: string;
    body: string;
  }
> = {
  mode: {
    eyebrow: "Choose the ritual",
    title: "How should Mora begin?",
    body: "Pick one ritual and the chamber will guide the rest.",
  },
  category: {
    eyebrow: "Choose the focus",
    title: "What kind of thought will you follow?",
    body: "Choose a single domain so the reading stays sharp.",
  },
  difficulty: {
    eyebrow: "Set the pressure",
    title: "How much room should the ritual allow?",
    body: "Higher pressure means fewer mistakes and faster declarations.",
  },
  review: {
    eyebrow: "Begin the session",
    title: "The chamber is ready.",
    body: "One step remains. Begin when the focus feels right.",
  },
};

function nextStep(step: SetupStep) {
  return stepOrder[Math.min(stepOrder.indexOf(step) + 1, stepOrder.length - 1)];
}

function previousStep(step: SetupStep) {
  return stepOrder[Math.max(stepOrder.indexOf(step) - 1, 0)];
}

function optionClasses(active: boolean) {
  return active
    ? "border-[rgba(126,79,39,0.82)] bg-[rgba(255,255,255,0.38)] text-[#2d1b19] shadow-[0_12px_28px_rgba(52,29,18,0.14)]"
    : "border-[rgba(111,75,45,0.22)] bg-[rgba(98,62,40,0.08)] text-[#4e362d] hover:border-[rgba(126,79,39,0.4)] hover:bg-[rgba(98,62,40,0.12)]";
}

export function PlaySetup({
  settings,
  onChange,
  onStart,
  isPending,
  teachCaseCount,
  onStepChange,
}: PlaySetupProps) {
  const [step, setStep] = useState<SetupStep>("mode");

  useEffect(() => {
    onStepChange?.(step);
  }, [onStepChange, step]);

  const stepIndex = stepOrder.indexOf(step);
  const selectedMode = modeMeta[settings.mode];
  const selectedCategory = categoryMeta[settings.category];
  const selectedDifficulty = difficultyConfig[settings.difficulty];
  const limits =
    settings.mode === "read-my-mind"
      ? selectedDifficulty.readMyMind
      : selectedDifficulty.guessMyMind;

  const summary = useMemo(
    () => [
      { label: "Ritual", value: selectedMode.label },
      { label: "Focus", value: selectedCategory.label },
      { label: "Pressure", value: selectedDifficulty.label },
    ],
    [selectedCategory.label, selectedDifficulty.label, selectedMode.label],
  );

  function choose(patch: Partial<StoredSettings>) {
    onChange(patch);
    setStep((current) => nextStep(current));
  }

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <MindChamberPanel eyebrow={stepCopy[step].eyebrow} title={stepCopy[step].title}>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-center text-sm leading-6 text-[#5b4034] sm:text-left">{stepCopy[step].body}</p>
            <div className="flex items-center gap-2" aria-label={`Step ${stepIndex + 1} of ${stepOrder.length}`}>
              {stepOrder.map((entry, index) => (
                <span
                  key={entry}
                  className={cn(
                    "h-2.5 w-9 rounded-full border transition-colors duration-150",
                    index <= stepIndex
                      ? "border-[rgba(152,103,47,0.32)] bg-[#d6a653]"
                      : "border-[rgba(118,80,46,0.18)] bg-[rgba(93,60,38,0.08)]",
                  )}
                />
              ))}
            </div>
          </div>

          {step === "mode" ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(modeMeta).map(([id, meta]) => {
                const active = settings.mode === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => choose({ mode: id as StoredSettings["mode"] })}
                    className={cn("rounded-[1.35rem] border px-5 py-5 text-left transition-colors duration-150", optionClasses(active))}
                  >
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8a5b24]">
                      {id === "read-my-mind" ? "Let Mora read you" : "Read Mora instead"}
                    </p>
                    <h3 className="mt-3 font-display text-[2.25rem] leading-[0.94]">{meta.label}</h3>
                    <p className="mt-3 text-sm leading-6">{meta.description}</p>
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === "category" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(categoryMeta).map(([id, meta]) => {
                const active = settings.category === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => choose({ category: id as StoredSettings["category"] })}
                    className={cn("rounded-[1.25rem] border px-4 py-4 text-left transition-colors duration-150", optionClasses(active))}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl text-[#8a5b24]">{meta.icon}</span>
                      <div>
                        <p className="text-lg font-semibold text-[#2d1b19]">{meta.label}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a5b24]">Focus domain</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6">{meta.synopsis}</p>
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === "difficulty" ? (
            <div className="grid gap-3 md:grid-cols-3">
              {Object.entries(difficultyConfig).map(([id, config]) => {
                const active = settings.difficulty === id;
                const modeLimits =
                  settings.mode === "read-my-mind" ? config.readMyMind : config.guessMyMind;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => choose({ difficulty: id as StoredSettings["difficulty"] })}
                    className={cn("rounded-[1.25rem] border px-4 py-5 text-left transition-colors duration-150", optionClasses(active))}
                  >
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#8a5b24]">
                      {modeLimits.maxQuestions} questions · {modeLimits.maxGuesses} guesses
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-[#2d1b19]">{config.label}</h3>
                    <p className="mt-2 text-sm leading-6">{config.description}</p>
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === "review" ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {summary.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.15rem] border border-[rgba(111,75,45,0.2)] bg-[rgba(98,62,40,0.08)] px-4 py-4 text-center"
                  >
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8a5b24]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#2d1b19]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.15rem] border border-[rgba(111,75,45,0.2)] bg-[rgba(98,62,40,0.08)] px-4 py-4 text-sm leading-6 text-[#4e362d]">
                {limits.maxQuestions} questions. {limits.maxGuesses} guesses. {teachCaseCount} learned{" "}
                {teachCaseCount === 1 ? "memory" : "memories"} available in this focus.
              </div>

              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep("difficulty")}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#6b4728] transition-colors hover:text-[#8a5b24]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Adjust the setup
                </button>

                <Button size="lg" onClick={onStart} disabled={isPending}>
                  Begin the ritual
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}

          {step !== "review" ? (
            <div className="flex items-center justify-between gap-3 border-t border-[rgba(111,75,45,0.16)] pt-1">
              <button
                type="button"
                onClick={() => setStep((current) => previousStep(current))}
                disabled={step === "mode"}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#6b4728] transition-colors hover:text-[#8a5b24] disabled:pointer-events-none disabled:opacity-35"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <p className="text-sm text-[#6d5040]">Choose one option to continue.</p>
            </div>
          ) : null}
        </div>
      </MindChamberPanel>
    </div>
  );
}
