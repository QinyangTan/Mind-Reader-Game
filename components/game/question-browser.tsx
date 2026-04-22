"use client";

import { useMemo, useState } from "react";

import { rankAvailableQuestions } from "@/lib/game/question-selection";
import { cn } from "@/lib/utils/cn";
import type {
  EntityCategory,
  GameEntity,
  LearnedInferenceModel,
  QuestionDefinition,
  RankedCandidate,
} from "@/types/game";

interface QuestionBrowserProps {
  category: EntityCategory;
  askedQuestionIds: string[];
  rankedCandidates: RankedCandidate[];
  remainingQuestions: number;
  onAskQuestion: (questionId: string) => void;
  isPending: boolean;
  extraEntities?: GameEntity[];
  inferenceModel?: LearnedInferenceModel;
}

type BrowserFamily = "identity" | "nature" | "appearance" | "behavior" | "origin" | "advanced";

const familyMeta: Record<
  BrowserFamily,
  {
    label: string;
    description: string;
  }
> = {
  identity: {
    label: "Identity",
    description: "Big early clues that split the thought quickly.",
  },
  nature: {
    label: "Nature",
    description: "Living, usage, habitat, and what kind of thing it is.",
  },
  appearance: {
    label: "Appearance",
    description: "Body, size, surface, and visual form.",
  },
  behavior: {
    label: "Behavior",
    description: "Abilities, movement, purpose, and common actions.",
  },
  origin: {
    label: "Origin",
    description: "Where it comes from or what world it belongs to.",
  },
  advanced: {
    label: "Advanced Clues",
    description: "Sharper disambiguators once the field is small.",
  },
};

function familyForQuestion(question: QuestionDefinition): BrowserFamily {
  if (question.stage === "fine" || question.stage === "specialist") {
    return "advanced";
  }

  switch (question.group) {
    case "identity":
    case "role":
      return "identity";
    case "body":
    case "size":
    case "pattern":
    case "material":
      return "appearance";
    case "powers":
    case "behavior":
    case "mobility":
    case "transport":
      return "behavior";
    case "origin":
      return "origin";
    default:
      return "nature";
  }
}

export function QuestionBrowser({
  category,
  askedQuestionIds,
  rankedCandidates,
  remainingQuestions,
  onAskQuestion,
  isPending,
  extraEntities = [],
  inferenceModel,
}: QuestionBrowserProps) {
  const ranked = useMemo(
    () =>
      rankAvailableQuestions(
        category,
        askedQuestionIds,
        rankedCandidates,
        extraEntities,
        remainingQuestions,
        inferenceModel,
      ),
    [category, askedQuestionIds, rankedCandidates, extraEntities, remainingQuestions, inferenceModel],
  );

  const grouped = useMemo(() => {
    const buckets = new Map<BrowserFamily, QuestionDefinition[]>();

    for (const entry of ranked) {
      const family = familyForQuestion(entry.question);
      const current = buckets.get(family) ?? [];
      current.push(entry.question);
      buckets.set(family, current);
    }

    return (Object.keys(familyMeta) as BrowserFamily[])
      .map((family) => ({
        family,
        questions: buckets.get(family) ?? [],
      }))
      .filter((entry) => entry.questions.length > 0);
  }, [ranked]);

  const recommended = ranked.slice(0, 3).map((entry) => entry.question);
  const firstFamily = grouped[0]?.family ?? "identity";
  const [activeFamily, setActiveFamily] = useState<BrowserFamily>(firstFamily);
  const resolvedFamily = grouped.some((entry) => entry.family === activeFamily) ? activeFamily : firstFamily;

  const activeGroup = grouped.find((entry) => entry.family === resolvedFamily) ?? grouped[0] ?? null;

  if (ranked.length === 0) {
    return (
      <div className="rounded-[1.1rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] px-4 py-5 text-sm text-[#5a433b]">
        The strongest lines of questioning are spent. It’s time to make your guess.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.15rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] p-4">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8a5b24]">Best opening clues</p>
        <div className="mt-3 grid gap-2">
          {recommended.map((question) => (
            <button
              key={question.id}
              type="button"
              onClick={() => onAskQuestion(question.id)}
              disabled={isPending || remainingQuestions <= 0}
              className="rounded-[1rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(255,255,255,0.3)] px-4 py-3 text-left text-sm leading-6 text-[#2d1b19] transition-colors duration-150 hover:border-[rgba(126,79,39,0.38)] hover:bg-[rgba(255,255,255,0.4)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {question.question}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {grouped.map((entry) => (
            <button
              key={entry.family}
              type="button"
              onClick={() => setActiveFamily(entry.family)}
              className={cn(
                "rounded-full border px-3 py-2 text-sm transition-colors duration-150",
                resolvedFamily === entry.family
                  ? "border-[rgba(126,79,39,0.5)] bg-[rgba(255,255,255,0.34)] text-[#2d1b19]"
                  : "border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] text-[#5a433b] hover:border-[rgba(126,79,39,0.32)]",
              )}
            >
              {familyMeta[entry.family].label}
            </button>
          ))}
        </div>

        {activeGroup ? (
          <div className="rounded-[1.15rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] p-4">
            <p className="text-sm text-[#6a4a3c]">{familyMeta[activeGroup.family].description}</p>
            <div className="mt-3 grid gap-2">
              {activeGroup.questions.slice(0, 8).map((question) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => onAskQuestion(question.id)}
                  disabled={isPending || remainingQuestions <= 0}
                  className="rounded-[1rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(255,255,255,0.28)] px-4 py-3 text-left text-sm leading-6 text-[#2d1b19] transition-colors duration-150 hover:border-[rgba(126,79,39,0.38)] hover:bg-[rgba(255,255,255,0.38)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {question.question}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
