"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Sparkles, WandSparkles } from "lucide-react";

import {
  RevealSurface,
  ResponseWell,
  SurfacePillButton,
  TeachSurface,
} from "@/components/game/scene-surfaces";
import { entityById } from "@/lib/data/entities";
import { difficultyConfig } from "@/lib/game/game-config";
import { getAttributeLabel, getTeachableAttributeKeys, isTeachEntityId } from "@/lib/game/teach";
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
    <div className="mx-auto w-full max-w-[900px] space-y-6">
      <RevealSurface
        eyebrow="The ritual closes"
        title={result.title}
        description={revealedFromTeachLibrary ? "This declaration rose from a memory you taught Mora in an earlier ritual." : result.message}
      >
        <div className="space-y-6">
          {entity ? (
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(214,174,98,0.3)] bg-[rgba(255,255,255,0.08)] text-5xl">
                {entity.imageEmoji}
              </div>
              <p className="mt-4 font-display text-[3rem] leading-[0.9] text-[#f6e7bf] sm:text-[3.8rem]">
                {entity.name}
              </p>
              <p className="mx-auto mt-3 max-w-[38rem] text-base leading-7 text-[#d8c8a8]">{entity.shortDescription}</p>
            </div>
          ) : (
            <p className="text-center font-display text-[3rem] leading-[0.92] text-[#f6e7bf] sm:text-[3.6rem]">
              The answer slipped through the chamber.
            </p>
          )}

          <p className="text-center text-sm leading-6 text-[#eadbb3]">
            {result.questionsUsed} of {limits.maxQuestions} questions used. {result.guessesUsed} of {limits.maxGuesses} guesses used.{" "}
            {result.winner === "player" ? "You prevailed." : "Mora prevailed."}
          </p>

          {result.strongestQuestion ? (
            <ResponseWell>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">Turning point</p>
              <p className="mt-3 text-base leading-7 text-[#eadbb3]">{result.strongestQuestion.questionPrompt}</p>
            </ResponseWell>
          ) : null}

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <SurfacePillButton tone="accent" surface="choice" className="min-w-[14rem] px-6 py-3 text-base" onClick={onPlayAgain}>
              Play again
              <RotateCcw className="h-4 w-4" />
            </SurfacePillButton>
            <SurfacePillButton tone="default" surface="choice" className="min-w-[14rem] px-6 py-3 text-base" onClick={onBackToSetup}>
              Choose another ritual
              <Sparkles className="h-4 w-4" />
            </SurfacePillButton>
          </div>
        </div>
      </RevealSurface>

      {result.teachable ? (
        <TeachSurface
          eyebrow="Teach the chamber"
          title={teachSaved ? "The lesson is part of the chamber now." : "Teach Mora what she missed."}
          description="Keep it brief. One name, one clear note, and only a few traits if they truly matter."
        >
          <div className="space-y-5">
            <div className="grid gap-3">
              <input
                value={entityName}
                onChange={(event) => setEntityName(event.target.value)}
                placeholder="What were you really thinking of?"
                disabled={teachSaved}
                className="flex h-12 w-full border border-[rgba(214,174,98,0.32)] bg-[linear-gradient(180deg,rgba(45,24,62,0.94),rgba(21,12,30,0.98))] px-5 text-sm text-[#f6e7bf] outline-none transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-[#a99976] focus:border-[rgba(242,226,181,0.58)] focus:shadow-[0_0_20px_rgba(177,119,219,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  clipPath:
                    "polygon(16px 0, calc(100% - 16px) 0, 100% 30%, 100% 70%, calc(100% - 16px) 100%, 16px 100%, 0 70%, 0 30%)",
                }}
              />

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="One clear clue Mora should remember next time"
                rows={4}
                disabled={teachSaved}
                className="w-full border border-[rgba(214,174,98,0.28)] bg-[linear-gradient(180deg,rgba(38,20,53,0.94),rgba(21,12,30,0.98))] px-5 py-4 text-sm text-[#f6e7bf] outline-none transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-[#a99976] focus:border-[rgba(242,226,181,0.58)] focus:shadow-[0_0_20px_rgba(177,119,219,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  clipPath:
                    "polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px)",
                }}
              />
            </div>

            {remainingAttributes.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {remainingAttributes.slice(0, 6).map((key) => {
                  const choice = extraChoiceByKey[key] ?? "skip";
                  return (
                    <div
                      key={key}
                      className="relative overflow-hidden border border-[rgba(214,174,98,0.22)] bg-[rgba(22,12,31,0.58)] px-4 py-4"
                      style={{
                        clipPath:
                          "polygon(16px 0, calc(100% - 16px) 0, 100% 24%, 100% 76%, calc(100% - 16px) 100%, 16px 100%, 0 76%, 0 24%)",
                      }}
                    >
                      <div
                        className="pointer-events-none absolute inset-[4px] border border-[rgba(242,226,181,0.12)]"
                        style={{
                          clipPath:
                            "polygon(16px 0, calc(100% - 16px) 0, 100% 24%, 100% 76%, calc(100% - 16px) 100%, 16px 100%, 0 76%, 0 24%)",
                        }}
                      />
                      <p className="relative text-sm font-medium text-[#f6e7bf]">{getAttributeLabel(key, result.category)}</p>
                      <div className="relative mt-3 flex flex-wrap gap-2">
                        {(["yes", "no", "skip"] as const).map((option) => (
                          <SurfacePillButton
                            key={option}
                            tone={choice === option ? "accent" : "default"}
                            surface="compact"
                            className="px-3 py-2"
                            disabled={teachSaved}
                            onClick={() =>
                              setExtraChoiceByKey((current) => ({
                                ...current,
                                [key]: option,
                              }))
                            }
                          >
                            {option === "skip" ? "Skip" : option === "yes" ? "Yes" : "No"}
                          </SurfacePillButton>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="flex justify-center">
              {!teachSaved ? (
                <SurfacePillButton
                  tone="accent"
                  surface="choice"
                  className="min-w-[15rem] px-6 py-3 text-base"
                  disabled={!entityName.trim()}
                  onClick={() => onTeach(entityName.trim(), note.trim(), collectExtras())}
                >
                  Teach Mora
                  <WandSparkles className="h-4 w-4" />
                </SurfacePillButton>
              ) : (
                <ResponseWell tone="muted" className="max-w-[24rem]">
                  <p className="text-sm text-[#d7c7a4]">The chamber will remember this lesson in future rituals.</p>
                </ResponseWell>
              )}
            </div>
          </div>
        </TeachSurface>
      ) : null}
    </div>
  );
}
