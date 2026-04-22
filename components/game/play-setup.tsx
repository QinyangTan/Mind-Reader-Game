"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Library } from "lucide-react";

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
    description: string;
  }
> = {
  mode: {
    eyebrow: "Choose the ritual",
    title: "How will this chamber begin?",
    description: "Decide whether Mora reads your hidden thought or hides one of her own for you to uncover.",
  },
  category: {
    eyebrow: "Choose the focus",
    title: "What kind of thought will the chamber follow?",
    description: "Pick one domain so the conversation can narrow quickly and stay clear.",
  },
  difficulty: {
    eyebrow: "Set the pressure",
    title: "How sharp should the ritual feel?",
    description: "More pressure means fewer chances to recover once the pattern tightens.",
  },
  review: {
    eyebrow: "Begin",
    title: "Everything is ready.",
    description: "One action starts the reading. Everything else can wait.",
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

function optionCard(active: boolean) {
  return active
    ? "border-[rgba(138,91,36,0.24)] bg-[rgba(255,255,255,0.34)] shadow-[0_14px_30px_rgba(80,52,36,0.12)]"
    : "border-[rgba(102,72,52,0.12)] bg-[rgba(72,42,30,0.08)] hover:border-[rgba(138,91,36,0.24)] hover:bg-[rgba(72,42,30,0.12)]";
}

function optionText(active: boolean, tone: "label" | "title" | "body") {
  if (tone === "label") {
    return active ? "text-[#8a5b24]" : "text-[#7d5838]";
  }

  if (tone === "title") {
    return "text-[#2d1b19]";
  }

  return active ? "text-[#4b3430]" : "text-[#5a433b]";
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

  const stepIndex = stepOrder.indexOf(step);

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
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between gap-3 text-sm text-[#d8ccb5]">
          <p>{selectedMode.label}</p>
          <div className="flex items-center gap-2" aria-label={`Step ${stepIndex + 1} of ${stepOrder.length}`}>
            {stepOrder.map((entry, index) => (
              <span
                key={entry}
                className={cn(
                  "h-2 w-8 rounded-full border transition-colors duration-150",
                  index <= stepIndex
                    ? "border-[rgba(214,166,83,0.34)] bg-[#d6a653]"
                    : "border-[rgba(240,217,162,0.14)] bg-[rgba(16,10,22,0.68)]",
                )}
              />
            ))}
          </div>
        </div>

        <MindChamberPanel eyebrow={stepCopy[step].eyebrow} title={stepCopy[step].title}>
          <p className="max-w-2xl text-base leading-7 text-[#503730]">{stepCopy[step].description}</p>

          {visibleSummary.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {visibleSummary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-full border border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.06)] px-3 py-2 text-sm text-[#4c332b]"
                >
                  <span className="mr-2 text-[0.68rem] font-semibold tracking-[0.18em] text-[#8a5b24]">
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
                    className={cn("rounded-[1.2rem] border px-5 py-5 text-left transition-colors duration-150", optionCard(active))}
                  >
                    <p className={cn("text-[0.68rem] tracking-[0.2em]", optionText(active, "label"))}>
                      {id === "read-my-mind" ? "Psychic reads you" : "You read the psychic"}
                    </p>
                    <h3 className={cn("mt-2 font-display text-[2.2rem] leading-[0.92]", optionText(active, "title"))}>
                      {meta.label}
                    </h3>
                    <p className={cn("mt-3 text-sm leading-6", optionText(active, "body"))}>{meta.description}</p>
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
                    className={cn("rounded-[1.2rem] border px-5 py-5 text-left transition-colors duration-150", optionCard(active))}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn("text-3xl", optionText(active, "title"))}>{meta.icon}</span>
                      <h3 className={cn("text-xl font-semibold", optionText(active, "title"))}>{meta.label}</h3>
                    </div>
                    <p className={cn("mt-3 text-sm leading-6", optionText(active, "body"))}>{meta.synopsis}</p>
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
                    className={cn("rounded-[1.2rem] border px-4 py-5 text-left transition-colors duration-150", optionCard(active))}
                  >
                    <p className={cn("text-[0.68rem] tracking-[0.2em]", optionText(active, "label"))}>
                      {modeLimits.maxQuestions} questions · {modeLimits.maxGuesses} guesses
                    </p>
                    <h3 className={cn("mt-2 text-xl font-semibold", optionText(active, "title"))}>{config.label}</h3>
                    <p className={cn("mt-3 text-sm leading-6", optionText(active, "body"))}>{config.description}</p>
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === "review" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {selectionSummary.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.1rem] border border-[rgba(138,91,36,0.16)] bg-[rgba(255,255,255,0.28)] px-4 py-4"
                  >
                    <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-[#8a5b24]">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-[#2b1a1e]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.1rem] border border-[rgba(102,72,52,0.12)] bg-[rgba(72,42,30,0.08)] px-4 py-4 text-sm text-[#5a433b]">
                The circle will allow {limits.maxQuestions} questions and {limits.maxGuesses} guesses in this ritual.
              </div>

              {settings.mode === "read-my-mind" ? (
                <button
                  type="button"
                  onClick={() => onChange({ useTeachCases: !settings.useTeachCases })}
                  className={cn(
                    "flex w-full items-start justify-between gap-4 rounded-[1.1rem] border px-4 py-4 text-left transition-colors duration-150",
                    settings.useTeachCases
                      ? "border-[rgba(138,91,36,0.24)] bg-[rgba(255,255,255,0.34)] shadow-[0_14px_30px_rgba(80,52,36,0.12)]"
                      : "border-[rgba(102,72,52,0.12)] bg-[rgba(72,42,30,0.08)] hover:border-[rgba(138,91,36,0.24)] hover:bg-[rgba(72,42,30,0.12)]",
                  )}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Library className={cn("h-4 w-4", settings.useTeachCases ? "text-[#8a5b24]" : "text-[#7d5838]")} />
                      <p className={cn("font-semibold", settings.useTeachCases ? "text-[#2b1a1e]" : "text-[#2d1b19]")}>
                        Let learned memories join the ritual
                      </p>
                    </div>
                    <p className={cn("text-sm leading-6", settings.useTeachCases ? "text-[#4b3430]" : "text-[#5a433b]")}>
                      {teachCaseCount > 0
                        ? `${teachCaseCount} stored memory${teachCaseCount === 1 ? "" : "ies"} can join the chamber’s candidate pool.`
                        : "No stored memories for this focus yet."}
                    </p>
                  </div>
                  <span className={cn("text-sm", settings.useTeachCases ? "text-[#8a5b24]" : "text-[#6d5348]")}>
                    {settings.useTeachCases ? "On" : "Off"}
                  </span>
                </button>
              ) : null}

              <Button size="lg" className="w-full sm:w-auto" onClick={onStart} disabled={isPending}>
                Begin the ritual
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 pt-1">
            {step === "mode" ? (
              <span />
            ) : (
              <Button type="button" variant="ghost" onClick={() => setStep((current) => previousStep(current))}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}

            {step !== "review" ? <p className="text-sm text-[#6a4a3c]">Choose one option to continue.</p> : null}
          </div>
        </MindChamberPanel>
      </motion.div>
    </div>
  );
}
