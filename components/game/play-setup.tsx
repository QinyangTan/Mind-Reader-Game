"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  RitualChoiceSurface,
  RitualProgress,
  SurfacePillButton,
} from "@/components/game/scene-surfaces";
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
    title: "Choose your ritual",
    body: "Mora offers two games of thought. Choose one and the chamber will shape the rest.",
  },
  category: {
    eyebrow: "Choose the focus",
    title: "Choose a focus of thought",
    body: "Keep the chamber fixed on one domain so the reading remains clear and direct.",
  },
  difficulty: {
    eyebrow: "Set the pressure",
    title: "Decide the pressure of the ritual",
    body: "Sharper pressure means fewer chances to recover once the pattern tightens.",
  },
  review: {
    eyebrow: "Begin",
    title: "The chamber is ready",
    body: "Everything is aligned. Begin the reading when you are ready to enter it fully.",
  },
};

function nextStep(step: SetupStep) {
  return stepOrder[Math.min(stepOrder.indexOf(step) + 1, stepOrder.length - 1)];
}

function previousStep(step: SetupStep) {
  return stepOrder[Math.max(stepOrder.indexOf(step) - 1, 0)];
}

function ritualOption(active: boolean) {
  return active
    ? "border-[rgba(242,226,181,0.72)] bg-[linear-gradient(180deg,rgba(145,86,196,0.58),rgba(72,39,100,0.96))] text-[#f6e7bf] shadow-[0_0_28px_rgba(177,119,219,0.22)]"
    : "border-[rgba(214,174,98,0.26)] bg-[linear-gradient(180deg,rgba(52,29,72,0.88),rgba(27,16,39,0.94))] text-[#e6d4a8] hover:border-[rgba(239,218,163,0.42)] hover:-translate-y-[1px]";
}

function medallion(active: boolean) {
  return active
    ? "border-[rgba(242,226,181,0.72)] bg-[radial-gradient(circle,rgba(164,100,221,0.62),rgba(66,34,94,0.96))] text-[#f7ebcb] shadow-[0_0_24px_rgba(177,119,219,0.2)]"
    : "border-[rgba(214,174,98,0.24)] bg-[radial-gradient(circle,rgba(63,35,87,0.94),rgba(27,16,39,0.98))] text-[#e6d4a8] hover:border-[rgba(239,218,163,0.42)] hover:-translate-y-[1px]";
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
    <div className="mx-auto w-full max-w-[980px]">
      <RitualChoiceSurface
        eyebrow={stepCopy[step].eyebrow}
        title={stepCopy[step].title}
        description={stepCopy[step].body}
        footer={
          <div className="space-y-4 pt-1">
            {step === "review" ? (
              <RitualProgress label={`${stepOrder.length} of ${stepOrder.length} scene alignments complete`} value={100} />
            ) : (
              <RitualProgress
                label={`${stepOrder.indexOf(step) + 1} of ${stepOrder.length} scene alignments complete`}
                value={((stepOrder.indexOf(step) + 1) / stepOrder.length) * 100}
              />
            )}

            <div className="flex items-center justify-between gap-3 text-sm text-[#d1c09a]">
              <button
                type="button"
                onClick={() => setStep((current) => previousStep(current))}
                disabled={step === "mode"}
                className="inline-flex items-center gap-2 transition-colors hover:text-[#f4e7c7] disabled:pointer-events-none disabled:opacity-35"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <p>{step === "review" ? "Begin when the chamber feels aligned." : "Choose one path to continue."}</p>
            </div>
          </div>
        }
      >
        {step === "mode" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(modeMeta).map(([id, meta]) => {
              const active = settings.mode === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => choose({ mode: id as StoredSettings["mode"] })}
                  className={cn(
                    "rounded-[999px] border px-6 py-5 text-left transition-[transform,border-color,background-color,color,box-shadow] duration-150",
                    ritualOption(active),
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-16 w-16 shrink-0 items-center justify-center rounded-full border text-2xl",
                        active
                          ? "border-[rgba(247,235,203,0.64)] bg-[rgba(255,255,255,0.12)]"
                          : "border-[rgba(214,174,98,0.24)] bg-[rgba(255,255,255,0.04)]",
                      )}
                    >
                      {id === "read-my-mind" ? "🔮" : "🌙"}
                    </div>
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">
                        {id === "read-my-mind" ? "Let Mora read you" : "Read Mora instead"}
                      </p>
                      <h3 className="mt-2 font-display text-[2rem] leading-[0.94] sm:text-[2.3rem]">{meta.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#d9caac]">{meta.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {step === "category" ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Object.entries(categoryMeta).map(([id, meta]) => {
                const active = settings.category === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => choose({ category: id as StoredSettings["category"] })}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center rounded-full border p-3 text-center transition-[transform,border-color,background-color,color,box-shadow] duration-150",
                      medallion(active),
                    )}
                  >
                    <span className="text-3xl">{meta.icon}</span>
                    <span className="mt-3 text-sm font-semibold leading-5">{meta.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[1.6rem] border border-[rgba(214,174,98,0.2)] bg-[rgba(22,12,31,0.54)] px-5 py-4 text-center text-sm leading-6 text-[#d9caac]">
              {selectedCategory.synopsis}
            </div>
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
                  className={cn(
                    "rounded-[2rem] border px-5 py-5 text-center transition-[transform,border-color,background-color,color,box-shadow] duration-150",
                    ritualOption(active),
                  )}
                >
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">
                    {modeLimits.maxQuestions} questions · {modeLimits.maxGuesses} guesses
                  </p>
                  <h3 className="mt-3 font-display text-[2rem] leading-none">{config.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#d9caac]">{config.description}</p>
                </button>
              );
            })}
          </div>
        ) : null}

        {step === "review" ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              {summary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.8rem] border border-[rgba(214,174,98,0.22)] bg-[linear-gradient(180deg,rgba(45,24,62,0.82),rgba(21,12,30,0.94))] px-5 py-5 text-center"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">
                    {item.label}
                  </p>
                  <p className="mt-3 text-lg font-medium text-[#f6e7bf]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.8rem] border border-[rgba(214,174,98,0.2)] bg-[rgba(22,12,31,0.54)] px-5 py-4 text-center text-sm leading-6 text-[#d9caac]">
              {limits.maxQuestions} questions. {limits.maxGuesses} guesses. {teachCaseCount} learned{" "}
              {teachCaseCount === 1 ? "memory" : "memories"} available in this focus.
            </div>

            <div className="flex justify-center">
              <SurfacePillButton
                tone="accent"
                className="min-w-[16rem] px-7 py-3.5 text-base font-semibold"
                onClick={onStart}
                disabled={isPending}
              >
                Begin the ritual
                <ArrowRight className="h-4 w-4" />
              </SurfacePillButton>
            </div>
          </div>
        ) : null}
      </RitualChoiceSurface>
    </div>
  );
}
