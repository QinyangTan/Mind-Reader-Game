"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Library } from "lucide-react";

import { MascotScene } from "@/components/brand/mascot-scene";
import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { Button } from "@/components/ui/button";
import { categoryMeta, difficultyConfig, modeMeta } from "@/lib/game/game-config";
import { getMascotFacing, getSetupMascotState } from "@/lib/game/mascot";
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
    description: string;
  }
> = {
  mode: {
    eyebrow: "Step 1",
    title: "Choose the ritual",
    description: "Pick how this round should work.",
  },
  category: {
    eyebrow: "Step 2",
    title: "Choose the focus",
    description: "Narrow the cast before the round begins.",
  },
  difficulty: {
    eyebrow: "Step 3",
    title: "Choose the pressure",
    description: "Set how long the room has to get there.",
  },
  review: {
    eyebrow: "Step 4",
    title: "Start the round",
    description: "Check the setup, then begin.",
  },
};

function nextStep(current: SetupStep) {
  const index = stepOrder.indexOf(current);
  return stepOrder[Math.min(index + 1, stepOrder.length - 1)];
}

function previousStep(current: SetupStep) {
  const index = stepOrder.indexOf(current);
  return stepOrder[Math.max(index - 1, 0)];
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
  const selectedMode = modeMeta[settings.mode];
  const selectedCategory = categoryMeta[settings.category];
  const selectedDifficulty = difficultyConfig[settings.difficulty];
  const limits =
    settings.mode === "read-my-mind"
      ? selectedDifficulty.readMyMind
      : selectedDifficulty.guessMyMind;

  const stepIndex = stepOrder.indexOf(step) + 1;

  const selectionSummary = useMemo(
    () => [
      { label: "Ritual", value: selectedMode.label },
      { label: "Category", value: selectedCategory.label },
      { label: "Difficulty", value: selectedDifficulty.label },
    ],
    [selectedCategory.label, selectedDifficulty.label, selectedMode.label],
  );
  const visibleSummary = useMemo(() => {
    if (step === "category") {
      return selectionSummary.slice(0, 1);
    }

    if (step === "difficulty") {
      return selectionSummary.slice(0, 2);
    }

    if (step === "review") {
      return selectionSummary;
    }

    return [];
  }, [selectionSummary, step]);

  useEffect(() => {
    onStepChange?.(step);
  }, [onStepChange, step]);

  function handleStepChoice(patch: Partial<StoredSettings>) {
    onChange(patch);
    setStep((current) => nextStep(current));
  }

  return (
    <div className="mx-auto max-w-[860px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between gap-3 text-sm text-[#dbcdb5]">
          <p>
            Step {stepIndex} of {stepOrder.length}
          </p>
          <div className="flex items-center gap-2">
            {stepOrder.map((entry, index) => (
              <span
                key={entry}
                className={cn(
                  "h-2.5 w-8 rounded-full border transition-colors duration-150",
                  index < stepIndex
                    ? "border-[rgba(214,166,83,0.38)] bg-[#d6a653]"
                    : "border-[rgba(240,217,162,0.16)] bg-[rgba(18,10,24,0.48)]",
                )}
              />
            ))}
          </div>
        </div>

        <MindChamberPanel eyebrow={stepCopy[step].eyebrow} title={stepCopy[step].title}>
          <MascotScene
            compact
            state={getSetupMascotState(step)}
            mode={settings.mode}
            facing={getMascotFacing(settings.mode)}
            className="xl:hidden"
            title={
              step === "mode"
                ? "Mora opens the curtain."
                : step === "review"
                  ? "Mora is ready to begin."
                  : undefined
            }
          />

          <p className="max-w-2xl text-sm leading-6 text-[#dbcdb5]">{stepCopy[step].description}</p>

          {visibleSummary.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {visibleSummary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-full border border-[rgba(240,217,162,0.16)] bg-[rgba(18,10,24,0.38)] px-3 py-2 text-sm text-[#e6dcc7]"
                >
                  <span className="mr-2 text-[0.68rem] font-semibold tracking-[0.18em] text-[#d6a653]">
                    {item.label}
                  </span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          ) : null}

          {step === "mode" ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(modeMeta).map(([id, meta]) => {
                const active = settings.mode === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleStepChoice({ mode: id as StoredSettings["mode"] })}
                    className={cn(
                      "rounded-[1.25rem] border px-5 py-5 text-left transition-colors duration-150",
                      active ? "brand-paper" : "brand-velvet hover:border-[rgba(240,217,162,0.28)]",
                    )}
                  >
                    <h3 className={cn("font-display text-4xl leading-none", active ? "text-[#2b1a1e]" : "text-[#f7efd9]")}>
                      {meta.label}
                    </h3>
                    <p className={cn("mt-3 text-sm leading-6", active ? "text-[#4b3430]" : "text-[#d8ceb8]")}>
                      {meta.description}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === "category" ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(categoryMeta).map(([id, meta]) => {
                const active = settings.category === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleStepChoice({ category: id as StoredSettings["category"] })}
                    className={cn(
                      "rounded-[1.25rem] border px-5 py-5 text-left transition-colors duration-150",
                      active ? "brand-paper" : "brand-velvet hover:border-[rgba(240,217,162,0.28)]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn("text-3xl", active ? "text-[#8a5b24]" : "text-[#f7efd9]")}>{meta.icon}</span>
                      <h3 className={cn("text-xl font-semibold", active ? "text-[#2b1a1e]" : "text-[#f7efd9]")}>{meta.label}</h3>
                    </div>
                    <p className={cn("mt-3 text-sm leading-6", active ? "text-[#4b3430]" : "text-[#d8ceb8]")}>{meta.synopsis}</p>
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
                    onClick={() => handleStepChoice({ difficulty: id as StoredSettings["difficulty"] })}
                    className={cn(
                      "rounded-[1.25rem] border px-4 py-5 text-left transition-colors duration-150",
                      active ? "brand-paper" : "brand-velvet hover:border-[rgba(240,217,162,0.28)]",
                    )}
                  >
                    <h3 className={cn("text-xl font-semibold", active ? "text-[#2b1a1e]" : "text-[#f7efd9]")}>{config.label}</h3>
                    <p className={cn("mt-3 text-sm leading-6", active ? "text-[#4b3430]" : "text-[#d8ceb8]")}>{config.description}</p>
                    <p className={cn("mt-4 text-sm", active ? "text-[#8a5b24]" : "text-[#bba98e]")}>
                      {modeLimits.maxQuestions} questions • {modeLimits.maxGuesses} guesses
                    </p>
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === "review" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {selectionSummary.map((item) => (
                  <div key={item.label} className="brand-paper rounded-[1.1rem] px-4 py-4">
                    <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-[#8a5b24]">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-[#2b1a1e]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="brand-inset rounded-[1.1rem] px-4 py-4 text-sm text-[#dbcdb5]">
                {limits.maxQuestions} questions · {limits.maxGuesses} guesses
              </div>

              {settings.mode === "read-my-mind" ? (
                <button
                  type="button"
                  onClick={() => onChange({ useTeachCases: !settings.useTeachCases })}
                  className={cn(
                    "flex w-full items-start justify-between gap-4 rounded-[1.2rem] border px-4 py-4 text-left transition-colors duration-150",
                    settings.useTeachCases
                      ? "brand-paper"
                      : "brand-velvet hover:border-[rgba(240,217,162,0.28)]",
                  )}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Library className={cn("h-4 w-4", settings.useTeachCases ? "text-[#8a5b24]" : "text-[#d6a653]")} />
                      <p className={cn("font-semibold", settings.useTeachCases ? "text-[#2b1a1e]" : "text-[#f7efd9]")}>
                        Use past teach cases
                      </p>
                    </div>
                    <p className={cn("text-sm leading-6", settings.useTeachCases ? "text-[#4b3430]" : "text-[#d8ceb8]")}>
                      {teachCaseCount > 0
                        ? `${teachCaseCount} stored memory${teachCaseCount === 1 ? "" : "ies"} can join the candidate pool.`
                        : "No stored memories for this category yet."}
                    </p>
                  </div>
                  <span className={cn("text-sm", settings.useTeachCases ? "text-[#8a5b24]" : "text-[#bba98e]")}>
                    {settings.useTeachCases ? "On" : "Off"}
                  </span>
                </button>
              ) : null}

              <Button size="lg" className="w-full sm:w-auto" onClick={onStart} disabled={isPending}>
                {selectedMode.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 pt-1">
            {step === "mode" ? <span /> : (
              <Button type="button" variant="ghost" onClick={() => setStep((current) => previousStep(current))}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}

            {step !== "review" ? <p className="text-sm text-[#cbbda5]">Select one option to continue</p> : null}
          </div>
        </MindChamberPanel>
      </motion.div>
    </div>
  );
}
