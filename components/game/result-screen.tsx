"use client";

import { useMemo, useState } from "react";
import { BrainCircuit, ChevronDown, ChevronUp, RotateCcw, Sparkles, Trophy, WandSparkles } from "lucide-react";

import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { entityById } from "@/lib/data/entities";
import { difficultyConfig } from "@/lib/game/game-config";
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
  { value: "yes", label: "Yes", tone: "border-emerald-900/18 bg-[rgba(63,108,79,0.14)] text-[#24432f]" },
  { value: "no", label: "No", tone: "border-rose-900/18 bg-[rgba(126,77,82,0.14)] text-[#5b3036]" },
  { value: "skip", label: "Skip", tone: "border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.08)] text-[#5a433b]" },
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
    <div className="mx-auto max-w-[800px] space-y-4">
      <MindChamberPanel eyebrow="After the reveal" title={result.title}>
        <div className="flex items-center gap-2 text-sm text-[#6a4a3c]">
          {isPlayerWin ? <Trophy className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
          <span>{isPlayerWin ? "Your victory" : "Mora's victory"}</span>
          {revealedFromTeachLibrary ? (
            <span className="rounded-full border border-[rgba(138,91,36,0.18)] bg-[rgba(255,255,255,0.28)] px-2.5 py-1 text-xs text-[#8a5b24]">
              Learned memory
            </span>
          ) : null}
        </div>

        {entity ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.4rem] border border-[rgba(138,91,36,0.18)] bg-[rgba(255,255,255,0.3)] text-5xl">
              {entity.imageEmoji}
            </div>
            <div className="min-w-0">
              <p className="font-display text-[3rem] leading-[0.9] text-[#2d1b19] sm:text-[3.6rem]">{entity.name}</p>
              <p className="mt-2 text-base leading-7 text-[#4f3830]">{entity.shortDescription}</p>
            </div>
          </div>
        ) : (
          <p className="font-display text-[3rem] leading-[0.92] text-[#2d1b19]">The thought escaped the chamber.</p>
        )}

        <p className="max-w-2xl text-base leading-7 text-[#4f3830]">
          {revealedFromTeachLibrary
            ? "This answer came from a memory you taught Mora in an earlier ritual."
            : result.message}
        </p>

        <div className="flex flex-wrap gap-2 text-sm text-[#5a433b]">
          <span className="rounded-full border border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.06)] px-3 py-2">
            {result.questionsUsed} of {limits.maxQuestions} questions used
          </span>
          <span className="rounded-full border border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.06)] px-3 py-2">
            {result.guessesUsed} of {limits.maxGuesses} guesses used
          </span>
        </div>

        {result.strongestQuestion ? (
          <div className="rounded-[1.2rem] border border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.08)] px-4 py-4">
            <p className="text-sm text-[#6a4a3c]">The biggest turning point came when Mora asked:</p>
            <p className="mt-2 text-base font-medium leading-7 text-[#2d1b19]">
              {result.strongestQuestion.questionPrompt}
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
          <div className="border-t border-[rgba(102,72,52,0.12)] pt-4">
            {!teachOpen && !teachSaved ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-sm leading-6 text-[#5a433b]">
                  If she missed the thought, you can teach Mora what escaped this ritual.
                </p>
                <Button type="button" variant="ghost" onClick={() => setTeachOpen(true)}>
                  Teach Mora
                  <WandSparkles className="h-4 w-4" />
                </Button>
              </div>
            ) : null}

            {teachOpen || teachSaved ? (
              <div className="mt-4 space-y-4 rounded-[1.2rem] border border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.08)] p-4">
                <p className="text-base font-medium text-[#2d1b19]">
                  {teachSaved ? "Mora has taken the lesson into memory." : "Name what she missed."}
                </p>

                <Input
                  value={entityName}
                  onChange={(event) => setEntityName(event.target.value)}
                  placeholder="What were you really thinking of?"
                  disabled={teachSaved}
                />

                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="One useful note Mora should remember next time"
                  rows={4}
                  disabled={teachSaved}
                  className="w-full rounded-[1rem] border border-[rgba(102,72,52,0.16)] bg-[rgba(255,255,255,0.36)] px-4 py-3 text-sm text-[#2d1b19] outline-none transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-[#8a7262] focus:border-[#c79347] focus:bg-[rgba(255,255,255,0.46)] focus:ring-2 focus:ring-[#d6a653]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {remainingAttributes.length > 0 ? (
                  <div className="rounded-[1rem] border border-[rgba(102,72,52,0.14)] bg-[rgba(255,255,255,0.24)]">
                    <button
                      type="button"
                      onClick={() => setRefineOpen((open) => !open)}
                      disabled={teachSaved}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-[#2d1b19] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span>Refine a few traits</span>
                      <span className="flex items-center gap-2 text-xs text-[#6a4a3c]">
                        {refinedCount} / {remainingAttributes.length}
                        {refineOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </button>

                    {refineOpen ? (
                      <div className="space-y-2 border-t border-[rgba(102,72,52,0.12)] px-4 py-3">
                        {remainingAttributes.map((key) => {
                          const active = extraChoiceByKey[key] ?? "skip";
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between gap-3 rounded-[0.95rem] border border-[rgba(102,72,52,0.1)] bg-[rgba(84,49,35,0.06)] px-3 py-2"
                            >
                              <span className="text-sm text-[#2d1b19]">{getAttributeLabel(key, result.category)}</span>
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
                                        "rounded-[0.8rem] border px-3 py-1 text-xs transition duration-150 disabled:cursor-not-allowed disabled:opacity-60",
                                        isActive
                                          ? choice.tone
                                          : "border-[rgba(102,72,52,0.14)] bg-[rgba(255,255,255,0.3)] text-[#5a433b] hover:border-[rgba(138,91,36,0.24)]",
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
              </div>
            ) : null}
          </div>
        ) : null}
      </MindChamberPanel>
    </div>
  );
}
