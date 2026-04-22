"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, ChevronDown, ChevronUp, RotateCcw, Sparkles, Trophy, WandSparkles } from "lucide-react";

import { MascotScene } from "@/components/brand/mascot-scene";
import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { entityById } from "@/lib/data/entities";
import { difficultyConfig } from "@/lib/game/game-config";
import { getMascotFacing, getResultMascotState } from "@/lib/game/mascot";
import { getAttributeLabel, getTeachableAttributeKeys, isTeachEntityId } from "@/lib/game/teach";
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
  const [teachOpen, setTeachOpen] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [extraChoiceByKey, setExtraChoiceByKey] = useState<Record<string, ExtraChoice>>({});
  const isPlayerWin = result.winner === "player";
  const limits =
    result.mode === "read-my-mind"
      ? difficultyConfig[result.difficulty].readMyMind
      : difficultyConfig[result.difficulty].guessMyMind;
  const revealedFromTeachLibrary =
    !!result.revealedEntityId && isTeachEntityId(result.revealedEntityId);

  const trailAttributeKeys = useMemo(
    () => new Set(teachTrail.map((entry) => entry.attributeKey)),
    [teachTrail],
  );

  const remainingAttributes = useMemo(() => {
    return getTeachableAttributeKeys(result.category).filter((key) => !trailAttributeKeys.has(key));
  }, [result.category, trailAttributeKeys]);

  const refinedCount = useMemo(
    () =>
      remainingAttributes.reduce((count, key) => {
        const choice = extraChoiceByKey[key] ?? "skip";
        return choice === "skip" ? count : count + 1;
      }, 0),
    [remainingAttributes, extraChoiceByKey],
  );
  const mascotState = getResultMascotState({
    result,
    teachOpen,
    teachSaved,
  });

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
    <div className="mx-auto max-w-[900px] space-y-5">
      <MindChamberPanel title={result.title}>
        <div className="relative overflow-hidden rounded-[1.7rem] border border-[rgba(214,166,83,0.22)] bg-[rgba(18,10,24,0.48)] p-6 sm:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-[rgba(240,217,162,0.5)]" />

          <div className="flex items-center gap-2 text-sm text-[#f0d9a2]">
            {isPlayerWin ? <Trophy className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
            {isPlayerWin ? "Player win" : "System win"}
            {revealedFromTeachLibrary ? (
              <span className="rounded-md border border-[rgba(214,166,83,0.22)] bg-[rgba(240,217,162,0.1)] px-2 py-0.5 text-xs text-[#f0d9a2]">
                Teach memory
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
            <div>
              {entity ? (
                <div className="flex items-center gap-5">
                  <motion.div
                    aria-hidden
                    className="brand-paper flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.3rem] text-4xl sm:h-24 sm:w-24 sm:text-5xl"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {entity.imageEmoji}
                  </motion.div>

                  <div className="min-w-0">
                    <p className="font-display text-4xl leading-tight text-[#f7efd9] sm:text-5xl md:text-6xl">
                      {entity.name}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#dbcdb5]">{entity.shortDescription}</p>
                  </div>
                </div>
              ) : (
                <p className="font-display text-4xl leading-tight text-[#f7efd9] sm:text-5xl">
                  Unrevealed thought pattern
                </p>
              )}

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#dbcdb5]">
                {revealedFromTeachLibrary
                  ? "The chamber surfaced a memory you taught it in a previous round."
                  : result.message}
              </p>
            </div>

            <MascotScene
              compact
              state={mascotState}
              mode={result.mode}
              facing={getMascotFacing(result.mode)}
              className="xl:hidden"
              title={teachOpen || teachSaved ? "Mora is learning." : undefined}
            />
          </div>
        </div>

        <div className="rounded-[1.3rem] border border-[rgba(240,217,162,0.14)] bg-[rgba(18,10,24,0.46)] px-4 py-4 text-sm text-[#dbcdb5]">
          <span className="text-[#f7efd9]">{result.questionsUsed}</span> of {limits.maxQuestions} questions used
          <span className="mx-2 text-[#8e7860]">•</span>
          <span className="text-[#f7efd9]">{result.guessesUsed}</span> of {limits.maxGuesses} guesses used
          <span className="mx-2 text-[#8e7860]">•</span>
          {result.mode === "read-my-mind" ? "Read My Mind" : "Guess My Mind"}
        </div>

        {result.strongestQuestion ? (
          <div className="brand-paper rounded-[1.3rem] px-4 py-4">
            <p className="text-[0.72rem] font-semibold tracking-[0.22em] text-[#8a5b24]">STRONGEST NARROWING</p>
            <p className="mt-2 text-sm leading-6 text-[#4b3430]">{result.strongestQuestion.questionPrompt}</p>
            <p className="mt-2 text-xs text-[#7a5b46]">
              {result.strongestQuestion.questionLabel} · {result.strongestQuestion.answer.replace("_", " ")}
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

        {result.teachable ? (
          <div className="space-y-4 rounded-[1.35rem] border border-[rgba(240,217,162,0.14)] bg-[rgba(18,10,24,0.44)] p-4">
            {!teachOpen && !teachSaved ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-[#dbcdb5]">
                  Want to teach Mora what escaped this round?
                </p>
                <Button type="button" variant="ghost" onClick={() => setTeachOpen(true)}>
                  Teach Mora
                  <WandSparkles className="h-4 w-4" />
                </Button>
              </div>
            ) : null}

            {(teachOpen || teachSaved) ? (
              <div className="space-y-4">
                <MascotScene
                  compact
                  state="learning"
                  mode={result.mode}
                  facing={getMascotFacing(result.mode, true)}
                  title={teachSaved ? "Mora remembers this one." : "Teach the missing pattern."}
                />

                <Input
                  value={entityName}
                  onChange={(event) => setEntityName(event.target.value)}
                  placeholder="Correct entity name"
                  disabled={teachSaved}
                />
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="One useful note"
                  rows={4}
                  disabled={teachSaved}
                  className="w-full rounded-[1rem] border border-[rgba(214,166,83,0.28)] bg-[rgba(24,12,28,0.82)] px-4 py-3 text-sm text-[#f7efd9] outline-none transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-[#af9c83] focus:border-[#e7c977] focus:bg-[rgba(32,16,38,0.96)] focus:ring-2 focus:ring-[#d6a653]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {remainingAttributes.length > 0 ? (
                  <div className="rounded-[1.2rem] border border-[rgba(240,217,162,0.14)] bg-[rgba(18,10,24,0.48)]">
                    <button
                      type="button"
                      onClick={() => setRefineOpen((open) => !open)}
                      disabled={teachSaved}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-[#f7efd9] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span>Refine a few traits</span>
                      <span className="flex items-center gap-2 text-xs text-[#cbbda5]">
                        {refinedCount} / {remainingAttributes.length}
                        {refineOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </button>

                    {refineOpen ? (
                      <div className="space-y-2 border-t border-white/10 px-4 py-3">
                        {remainingAttributes.map((key) => {
                          const active = extraChoiceByKey[key] ?? "skip";
                          return (
                            <div
                              key={key}
                              className="brand-inset flex items-center justify-between gap-3 rounded-lg px-3 py-2"
                            >
                              <span className="text-sm text-[#f7efd9]">{getAttributeLabel(key, result.category)}</span>
                              <div className="flex items-center gap-1">
                                {extraChoices.map((choice) => {
                                  const isActive = active === choice.value;
                                  return (
                                    <button
                                      key={choice.value}
                                      type="button"
                                      disabled={teachSaved}
                                      onClick={() =>
                                        setExtraChoiceByKey((current) => ({
                                          ...current,
                                          [key]: choice.value,
                                        }))
                                      }
                                      className={cn(
                                        "rounded-md border px-3 py-1 text-xs transition duration-150 disabled:cursor-not-allowed disabled:opacity-60",
                                        isActive
                                          ? choice.tone
                                          : "border-[rgba(240,217,162,0.14)] bg-[rgba(24,12,28,0.82)] text-[#dbcdb5] hover:border-[rgba(240,217,162,0.24)]",
                                      )}
                                    >
                                      {choice.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  {!teachSaved ? (
                    <Button
                      size="lg"
                      disabled={!entityName.trim()}
                      onClick={() => onTeach(entityName.trim(), note.trim(), collectExtras())}
                    >
                      Store in memory
                      <WandSparkles className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {!teachSaved ? (
                    <Button type="button" size="lg" variant="ghost" onClick={() => setTeachOpen(false)}>
                      Not now
                    </Button>
                  ) : null}
                </div>

                {teachSaved ? (
                  <div className="rounded-[1.2rem] border border-[rgba(214,166,83,0.2)] bg-[rgba(240,217,162,0.12)] px-4 py-4 text-sm text-[#f0d9a2]">
                    Saved. The parlor now remembers this escape in local storage.
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </MindChamberPanel>
    </div>
  );
}
