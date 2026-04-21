"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Library,
  RotateCcw,
  Sparkles,
  Trophy,
  WandSparkles,
} from "lucide-react";

import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { entityById } from "@/lib/data/entities";
import { difficultyConfig } from "@/lib/game/game-config";
import {
  getAttributeLabel,
  getTeachableAttributeKeys,
  isTeachEntityId,
} from "@/lib/game/teach";
import { cn } from "@/lib/utils/cn";
import type {
  AnsweredQuestion,
  AttributeKey,
  GameEntity,
  GameResult,
  NormalizedAnswer,
} from "@/types/game";

interface ResultScreenProps {
  result: GameResult;
  onPlayAgain: () => void;
  onBackToSetup: () => void;
  onTeach: (
    entityName: string,
    note: string,
    extraAttributes: Partial<Record<AttributeKey, NormalizedAnswer>>,
  ) => void;
  teachSaved: boolean;
  teachEntities?: Map<string, GameEntity>;
  teachTrail?: AnsweredQuestion[];
}

type ExtraChoice = "yes" | "no" | "skip";

const extraChoiceToAnswer: Record<ExtraChoice, NormalizedAnswer | undefined> = {
  yes: "yes",
  no: "no",
  skip: undefined,
};

const extraChoices: Array<{ value: ExtraChoice; label: string; tone: string }> = [
  { value: "yes", label: "Yes", tone: "border-emerald-200/35 bg-emerald-300/14 text-emerald-100" },
  { value: "no", label: "No", tone: "border-rose-200/32 bg-rose-300/14 text-rose-100" },
  { value: "skip", label: "Skip", tone: "border-white/14 bg-white/6 text-slate-200" },
];

export function ResultScreen({
  result,
  onPlayAgain,
  onBackToSetup,
  onTeach,
  teachSaved,
  teachEntities,
  teachTrail = [],
}: ResultScreenProps) {
  const entity = result.revealedEntityId
    ? entityById.get(result.revealedEntityId) ?? teachEntities?.get(result.revealedEntityId) ?? null
    : null;
  const [entityName, setEntityName] = useState("");
  const [note, setNote] = useState("");
  const [extraChoiceByKey, setExtraChoiceByKey] = useState<Record<string, ExtraChoice>>({});
  const [refineOpen, setRefineOpen] = useState(false);
  const isPlayerWin = result.winner === "player";
  const revealedFromTeachLibrary =
    !!result.revealedEntityId && isTeachEntityId(result.revealedEntityId);

  const modeLimits =
    result.mode === "read-my-mind"
      ? difficultyConfig[result.difficulty].readMyMind
      : difficultyConfig[result.difficulty].guessMyMind;
  const narrowing = result.strongestQuestion;

  const trailAttributeKeys = useMemo(
    () => new Set(teachTrail.map((entry) => entry.attributeKey)),
    [teachTrail],
  );

  const remainingAttributes = useMemo(() => {
    return getTeachableAttributeKeys(result.category).filter(
      (key) => !trailAttributeKeys.has(key),
    );
  }, [result.category, trailAttributeKeys]);

  const refinedCount = useMemo(
    () =>
      remainingAttributes.reduce((count, key) => {
        const choice = extraChoiceByKey[key] ?? "skip";
        return choice === "skip" ? count : count + 1;
      }, 0),
    [remainingAttributes, extraChoiceByKey],
  );

  function collectExtras(): Partial<Record<AttributeKey, NormalizedAnswer>> {
    const extras: Partial<Record<AttributeKey, NormalizedAnswer>> = {};

    for (const key of remainingAttributes) {
      const choice = extraChoiceByKey[key];
      const answer = choice ? extraChoiceToAnswer[choice] : undefined;

      if (answer) {
        extras[key] = answer;
      }
    }

    return extras;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <MindChamberPanel eyebrow="Session outcome" title={result.title} tone={isPlayerWin ? "violet" : "cyan"}>
        <div
          className={cn(
            "relative overflow-hidden rounded-[2rem] border p-6 sm:p-7",
            isPlayerWin
              ? "border-emerald-200/24 bg-[radial-gradient(circle_at_20%_0%,rgba(52,211,153,0.22),transparent_48%),radial-gradient(circle_at_80%_100%,rgba(139,92,246,0.18),transparent_44%),rgba(255,255,255,0.04)]"
              : "border-cyan-200/22 bg-[radial-gradient(circle_at_80%_0%,rgba(103,232,249,0.22),transparent_48%),radial-gradient(circle_at_20%_100%,rgba(217,70,239,0.16),transparent_44%),rgba(255,255,255,0.04)]",
          )}
        >
          {/* Chromatic sheen sweep — runs once on mount to punctuate the reveal */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-x-20 top-0 h-full bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.18)_50%,transparent_65%)]"
            initial={{ x: "-110%" }}
            animate={{ x: "110%" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />

          <div className="relative flex flex-wrap items-center gap-3 text-[0.66rem] uppercase tracking-[0.28em] text-slate-300">
            {isPlayerWin ? (
              <Trophy className="h-4 w-4 text-emerald-200" />
            ) : (
              <BrainCircuit className="h-4 w-4 text-cyan-200" />
            )}
            <span className={isPlayerWin ? "text-emerald-100" : "text-cyan-100"}>
              {isPlayerWin ? "Player victory" : "System victory"}
            </span>
            {revealedFromTeachLibrary ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/30 bg-emerald-300/10 px-3 py-1 text-emerald-100">
                <Library className="h-3.5 w-3.5" />
                From your teach library
              </span>
            ) : null}
          </div>

          {entity ? (
            <div className="relative mt-5 flex items-center gap-5 sm:gap-6">
              {/* Emoji halo — a spring-scaled focal piece with a soft radial glow */}
              <motion.div
                aria-hidden
                className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.6rem] border border-white/10 bg-white/6 shadow-[inset_0_0_40px_rgba(255,255,255,0.08)] sm:h-24 sm:w-24"
                initial={{ scale: 0.7, opacity: 0, rotate: -6 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              >
                <span
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-[1.6rem] blur-2xl opacity-70",
                    isPlayerWin
                      ? "bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.55),transparent_65%)]"
                      : "bg-[radial-gradient(circle_at_center,rgba(103,232,249,0.55),transparent_65%)]",
                  )}
                />
                <span className="relative text-4xl sm:text-5xl">{entity.imageEmoji}</span>
              </motion.div>

              <div className="min-w-0 flex-1">
                <motion.p
                  className="font-display text-3xl leading-tight text-white sm:text-4xl md:text-5xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                >
                  {entity.name}
                </motion.p>
                <p className="mt-2 text-sm text-slate-400">{entity.shortDescription}</p>
              </div>
            </div>
          ) : (
            <p className="relative mt-4 max-w-2xl font-display text-4xl leading-tight text-white sm:text-5xl">
              Unrevealed thought pattern
            </p>
          )}

          <p className="relative mt-5 max-w-2xl text-sm leading-7 text-slate-300">
            {revealedFromTeachLibrary
              ? "The chamber surfaced a memory you taught it — stored locally from a past escape."
              : result.message}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Questions used</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {result.questionsUsed}
              <span className="ml-1 text-base text-slate-400">/ {modeLimits.maxQuestions}</span>
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Guesses used</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {result.guessesUsed}
              <span className="ml-1 text-base text-slate-400">/ {modeLimits.maxGuesses}</span>
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Mode</p>
            <p className="mt-2 text-lg font-semibold text-white">{result.mode === "read-my-mind" ? "Read My Mind" : "Guess My Mind"}</p>
          </div>
        </div>

        {narrowing ? (
          <div className="rounded-[1.5rem] border border-cyan-200/18 bg-cyan-300/8 px-4 py-4">
            <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.24em] text-cyan-200/80">
              <Sparkles className="h-3.5 w-3.5" />
              Strongest narrowing · {narrowing.questionLabel}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-200">{narrowing.questionPrompt}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">
              Your answer: {narrowing.answer.replace("_", " ")}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={onPlayAgain}>
            Play again
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="secondary" onClick={onBackToSetup}>
            Change ritual
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </MindChamberPanel>

      <MindChamberPanel eyebrow="After-action memory" title={result.teachable ? "Teach the chamber" : "Signal residue"} tone="emerald">
        {result.teachable ? (
          <div className="space-y-4">
            <p className="text-sm leading-7 text-slate-300">
              The chamber missed. Tell it who you were thinking of and add one useful note so this round lives in
              its local memory vault.
            </p>
            <Input
              value={entityName}
              onChange={(event) => setEntityName(event.target.value)}
              placeholder="Correct entity name"
              disabled={teachSaved}
            />
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="One distinguishing note or useful trait"
              rows={4}
              disabled={teachSaved}
              className="w-full rounded-[1.6rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-slate-100 outline-none transition duration-300 placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10 focus:ring-2 focus:ring-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            {remainingAttributes.length > 0 ? (
              <div className="rounded-[1.6rem] border border-white/12 bg-white/4">
                <button
                  type="button"
                  onClick={() => setRefineOpen((open) => !open)}
                  disabled={teachSaved}
                  aria-expanded={refineOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-200" />
                    Refine what the chamber knows
                  </span>
                  <span className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-slate-400">
                    {refinedCount} / {remainingAttributes.length} refined
                    {refineOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {refineOpen ? (
                  <div className="space-y-2 border-t border-white/10 px-4 py-3">
                    <p className="text-xs leading-6 text-slate-400">
                      Optional. Answer attributes the chamber didn&apos;t probe. Blank entries stay unknown so the
                      memory only carries what you&apos;re sure about.
                    </p>
                    <div className="max-h-60 overflow-y-auto pr-1">
                      <ul className="space-y-1.5">
                        {remainingAttributes.map((key) => {
                          const active = extraChoiceByKey[key] ?? "skip";
                          return (
                            <li
                              key={key}
                              className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-white/8 bg-white/3 px-3 py-2"
                            >
                              <span className="text-sm text-slate-200">
                                {getAttributeLabel(key, result.category)}
                              </span>
                              <div
                                role="radiogroup"
                                aria-label={getAttributeLabel(key, result.category)}
                                className="flex items-center gap-1"
                              >
                                {extraChoices.map((choice) => {
                                  const isActive = active === choice.value;
                                  return (
                                    <button
                                      key={choice.value}
                                      type="button"
                                      role="radio"
                                      aria-checked={isActive}
                                      disabled={teachSaved}
                                      onClick={() =>
                                        setExtraChoiceByKey((current) => ({
                                          ...current,
                                          [key]: choice.value,
                                        }))
                                      }
                                      className={cn(
                                        "rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em] transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                                        isActive
                                          ? choice.tone
                                          : "border-white/10 bg-white/4 text-slate-300 hover:border-white/20",
                                      )}
                                    >
                                      {choice.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <Button
              size="lg"
              className="w-full"
              disabled={!entityName.trim() || teachSaved}
              onClick={() => onTeach(entityName.trim(), note.trim(), collectExtras())}
            >
              <WandSparkles className="h-4 w-4" />
              {teachSaved ? "Stored in the archive" : "Store in memory"}
            </Button>
            {teachSaved ? (
              <div className="rounded-[1.5rem] border border-emerald-200/16 bg-emerald-300/10 px-4 py-4 text-sm text-emerald-100">
                Saved. The chamber now remembers this escape in local storage.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4 rounded-[1.8rem] border border-white/10 bg-white/4 p-5">
            <p className="text-sm leading-7 text-slate-300">
              The signal ended cleanly. Run another round to build streaks, sharpen your archive, and pressure-test
              the chamber again.
            </p>
            {entity ? (
              <div className="rounded-[1.5rem] border border-white/8 bg-white/4 px-4 py-4">
                <p className="font-medium text-white">
                  {entity.imageEmoji} {entity.name}
                </p>
                <p className="mt-2 text-sm text-slate-400">{entity.shortDescription}</p>
              </div>
            ) : null}
          </div>
        )}
      </MindChamberPanel>
    </div>
  );
}
