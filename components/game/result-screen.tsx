"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Sparkles, WandSparkles } from "lucide-react";

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
    <div className="mx-auto w-full max-w-[900px]">
      <MindChamberPanel
        tone={result.teachable && !teachSaved ? "memory" : "reveal"}
        eyebrow={result.teachable && !teachSaved ? "Teach the chamber" : "The ritual closes"}
        title={result.title}
      >
        <div className="space-y-5">
          {entity ? (
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[1.35rem] border border-[rgba(126,79,39,0.26)] bg-[rgba(255,255,255,0.34)] text-5xl">
                {entity.imageEmoji}
              </div>
              <p className="mt-4 font-display text-[3rem] leading-[0.9] text-[#2d1b19] sm:text-[3.7rem]">
                {entity.name}
              </p>
              <p className="mx-auto mt-3 max-w-[34rem] text-base leading-7 text-[#4f3830]">{entity.shortDescription}</p>
            </div>
          ) : (
            <p className="text-center font-display text-[3rem] leading-[0.92] text-[#2d1b19] sm:text-[3.6rem]">
              The answer slipped through the chamber.
            </p>
          )}

          <p className="text-center text-base leading-7 text-[#4f3830] sm:text-lg">
            {revealedFromTeachLibrary
              ? "This declaration came from a memory you taught Mora in an earlier ritual."
              : result.message}
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.1rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] px-4 py-4 text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8a5b24]">Questions</p>
              <p className="mt-2 text-lg font-semibold text-[#2d1b19]">
                {result.questionsUsed} / {limits.maxQuestions}
              </p>
            </div>
            <div className="rounded-[1.1rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] px-4 py-4 text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8a5b24]">Guesses</p>
              <p className="mt-2 text-lg font-semibold text-[#2d1b19]">
                {result.guessesUsed} / {limits.maxGuesses}
              </p>
            </div>
            <div className="rounded-[1.1rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] px-4 py-4 text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8a5b24]">Outcome</p>
              <p className="mt-2 text-lg font-semibold text-[#2d1b19]">
                {result.winner === "player" ? "You prevailed" : "Mora prevailed"}
              </p>
            </div>
          </div>

          {result.strongestQuestion ? (
            <div className="rounded-[1.15rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] px-5 py-4 text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8a5b24]">
                Turning point
              </p>
              <p className="mt-3 text-base font-medium leading-7 text-[#2d1b19]">
                {result.strongestQuestion.questionPrompt}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
            <div className="space-y-4 border-t border-[rgba(111,75,45,0.16)] pt-4">
              <div className="text-center">
                <p className="font-display text-[2.1rem] leading-none text-[#2d1b19] sm:text-[2.5rem]">
                  {teachSaved ? "The lesson is part of the chamber now." : "Teach Mora what she missed."}
                </p>
                <p className="mx-auto mt-2 max-w-[34rem] text-sm leading-6 text-[#5a433b]">
                  Keep it brief. One name, one useful note, and only a few traits if they truly matter.
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  value={entityName}
                  onChange={(event) => setEntityName(event.target.value)}
                  placeholder="What were you really thinking of?"
                  disabled={teachSaved}
                />

                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="One clear clue Mora should remember next time"
                  rows={4}
                  disabled={teachSaved}
                  className="w-full rounded-[1.15rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(255,255,255,0.34)] px-4 py-3 text-sm text-[#2d1b19] outline-none transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-[#8a7262] focus:border-[#c79347] focus:bg-[rgba(255,255,255,0.46)] focus:ring-2 focus:ring-[#d6a653]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {remainingAttributes.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {remainingAttributes.slice(0, 6).map((key) => {
                    const choice = extraChoiceByKey[key] ?? "skip";
                    return (
                      <div
                        key={key}
                        className="rounded-[1rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] px-3 py-3"
                      >
                        <p className="text-sm font-medium text-[#2d1b19]">{getAttributeLabel(key, result.category)}</p>
                        <div className="mt-2 flex gap-1">
                          {(["yes", "no", "skip"] as const).map((option) => (
                            <button
                              key={option}
                              type="button"
                              disabled={teachSaved}
                              onClick={() =>
                                setExtraChoiceByKey((current) => ({
                                  ...current,
                                  [key]: option,
                                }))
                              }
                              className={cn(
                                "rounded-[0.85rem] border px-3 py-1.5 text-xs transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
                                choice === option
                                  ? "border-[rgba(126,79,39,0.44)] bg-[rgba(255,255,255,0.34)] text-[#2d1b19]"
                                  : "border-[rgba(111,75,45,0.18)] bg-[rgba(255,255,255,0.22)] text-[#5a433b] hover:border-[rgba(126,79,39,0.32)]",
                              )}
                            >
                              {option === "skip" ? "Skip" : option === "yes" ? "Yes" : "No"}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {!teachSaved ? (
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    disabled={!entityName.trim()}
                    onClick={() => onTeach(entityName.trim(), note.trim(), collectExtras())}
                  >
                    Teach Mora
                    <WandSparkles className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </MindChamberPanel>
    </div>
  );
}
