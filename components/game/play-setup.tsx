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
    body: "Mora offers two games of thought. Choose one and let the chamber shape the rest.",
  },
  category: {
    eyebrow: "Choose the focus",
    title: "Choose a focus of thought",
    body: "Keep the chamber fixed on one domain so the reading stays clear.",
  },
  difficulty: {
    eyebrow: "Set the pressure",
    title: "Decide the pressure of the ritual",
    body: "Sharper pressure leaves less room to recover once the pattern tightens.",
  },
  review: {
    eyebrow: "Begin",
    title: "The chamber is ready",
    body: "Everything is aligned. Begin when you are ready.",
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
    ? "border-[rgba(242,226,181,0.74)] bg-[linear-gradient(180deg,rgba(145,86,196,0.66),rgba(72,39,100,0.98))] text-[#f6e7bf] shadow-[0_0_32px_rgba(177,119,219,0.28)]"
    : "border-[rgba(214,174,98,0.3)] bg-[linear-gradient(180deg,rgba(52,29,72,0.94),rgba(27,16,39,0.98))] text-[#e6d4a8] hover:border-[rgba(239,218,163,0.5)] hover:-translate-y-[2px] hover:shadow-[0_0_22px_rgba(177,119,219,0.16)]";
}

function medallion(active: boolean) {
  return active
    ? "border-[rgba(242,226,181,0.74)] bg-[radial-gradient(circle,rgba(164,100,221,0.68),rgba(66,34,94,0.98))] text-[#f7ebcb] shadow-[0_0_28px_rgba(177,119,219,0.24)]"
    : "border-[rgba(214,174,98,0.28)] bg-[radial-gradient(circle,rgba(63,35,87,0.98),rgba(27,16,39,0.98))] text-[#e6d4a8] hover:border-[rgba(239,218,163,0.48)] hover:-translate-y-[2px] hover:shadow-[0_0_20px_rgba(177,119,219,0.14)]";
}

const ritualTileClip =
  "polygon(22px 0, calc(100% - 22px) 0, 100% 26%, 100% 74%, calc(100% - 22px) 100%, 22px 100%, 0 74%, 0 26%)";

export function PlaySetup({
  settings,
  onChange,
  onStart,
  isPending,
  teachCaseCount,
  onStepChange,
}: PlaySetupProps) {
  const [step, setStep] = useState<SetupStep>("mode");
  const [previewCategory, setPreviewCategory] = useState<StoredSettings["category"] | null>(null);

  useEffect(() => {
    onStepChange?.(step);
  }, [onStepChange, step]);

  const selectedMode = modeMeta[settings.mode];
  const previewedCategory = previewCategory ?? settings.category;
  const selectedCategory = categoryMeta[settings.category];
  const visibleCategory = categoryMeta[previewedCategory];
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
  }

  function advance() {
    setStep((current) => nextStep(current));
  }

  return (
    <div className="mx-auto w-full max-w-[920px]">
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
              <SurfacePillButton
                type="button"
                tone="default"
                surface="compact"
                onClick={() => setStep((current) => previousStep(current))}
                disabled={step === "mode"}
                className="px-3 py-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </SurfacePillButton>
              <p>{step === "review" ? "Begin when the chamber feels aligned." : "Select, preview, then continue."}</p>
              {step !== "review" ? (
                <SurfacePillButton
                  type="button"
                  tone="accent"
                  surface="compact"
                  onClick={advance}
                  className="px-3 py-2"
                >
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </SurfacePillButton>
              ) : null}
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
                    "group relative overflow-hidden border px-6 py-5 text-left transition-[transform,border-color,background-color,color,box-shadow] duration-200",
                    ritualOption(active),
                  )}
                  style={{ clipPath: ritualTileClip }}
                >
                  <div
                    className="pointer-events-none absolute inset-[4px] border border-[rgba(242,226,181,0.14)]"
                    style={{ clipPath: ritualTileClip }}
                  />
                  <div className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(242,226,181,0.62),transparent)]" />
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border text-2xl shadow-[0_0_20px_rgba(0,0,0,0.22)]",
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
                const previewed = previewedCategory === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onMouseEnter={() => setPreviewCategory(id as StoredSettings["category"])}
                    onFocus={() => setPreviewCategory(id as StoredSettings["category"])}
                    onBlur={() => setPreviewCategory(null)}
                    onClick={() => {
                      const category = id as StoredSettings["category"];
                      setPreviewCategory(category);
                      choose({ category });
                    }}
                    className={cn(
                      "relative flex aspect-square flex-col items-center justify-center rounded-full border p-3 text-center transition-[transform,border-color,background-color,color,box-shadow] duration-200",
                      medallion(active || previewed),
                      active ? "ring-2 ring-[rgba(246,226,179,0.32)]" : "",
                    )}
                    aria-pressed={active}
                    aria-describedby="category-scope"
                  >
                    <div className="pointer-events-none absolute inset-[5px] rounded-full border border-[rgba(242,226,181,0.16)]" />
                    <div className="pointer-events-none absolute inset-x-[22%] top-[7px] h-px bg-[linear-gradient(90deg,transparent,rgba(242,226,181,0.52),transparent)]" />
                    <span className="text-3xl">{meta.icon}</span>
                    <span className="mt-3 text-sm font-semibold leading-5">{meta.label}</span>
                  </button>
                );
              })}
            </div>

            <div id="category-scope" className="text-center text-sm leading-6 text-[#d9caac]">
              <span className="font-semibold text-[#f6e7bf]">{visibleCategory.label}:</span>{" "}
              {visibleCategory.synopsis}
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
                    "group relative overflow-hidden border px-5 py-5 text-center transition-[transform,border-color,background-color,color,box-shadow] duration-200",
                    ritualOption(active),
                  )}
                  style={{ clipPath: ritualTileClip }}
                >
                  <div
                    className="pointer-events-none absolute inset-[4px] border border-[rgba(242,226,181,0.14)]"
                    style={{ clipPath: ritualTileClip }}
                  />
                  <div className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(242,226,181,0.62),transparent)]" />
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
            <div className="flex flex-wrap items-center justify-center gap-3">
              {summary.map((item) => (
                <span
                  key={item.label}
                  className="rounded-full border border-[rgba(214,174,98,0.22)] bg-[rgba(22,12,31,0.5)] px-4 py-2 text-sm text-[#eadbb3]"
                >
                  <span className="text-[#d8b36a]">{item.label}:</span> {item.value}
                </span>
              ))}
            </div>

            <div className="text-center text-sm leading-6 text-[#d9caac]">
              {limits.maxQuestions} questions. {limits.maxGuesses} guesses. {teachCaseCount} learned{" "}
              {teachCaseCount === 1 ? "memory" : "memories"} available in this focus.
            </div>

            <div className="flex justify-center">
              <SurfacePillButton
                tone="accent"
                surface="choice"
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
