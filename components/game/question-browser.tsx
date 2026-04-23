"use client";

import { useMemo, useState } from "react";
import {
  Brain,
  Compass,
  Eye,
  Feather,
  MoonStar,
  UserRoundSearch,
} from "lucide-react";

import { SurfacePillButton } from "@/components/game/scene-surfaces";
import { rankAvailableQuestions } from "@/lib/game/question-selection";
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
    icon: typeof UserRoundSearch;
  }
> = {
  identity: {
    label: "Identity",
    description: "Big early clues that split the thought quickly.",
    icon: UserRoundSearch,
  },
  nature: {
    label: "Nature",
    description: "Living, habitat, use, and what kind of thing it is.",
    icon: Feather,
  },
  appearance: {
    label: "Appearance",
    description: "Body, scale, surface, and visible form.",
    icon: Eye,
  },
  behavior: {
    label: "Behavior",
    description: "Abilities, movement, purpose, and repeated actions.",
    icon: Brain,
  },
  origin: {
    label: "Origin",
    description: "Where it comes from or what world it belongs to.",
    icon: Compass,
  },
  advanced: {
    label: "Advanced Clues",
    description: "Sharper disambiguators once the field is narrow.",
    icon: MoonStar,
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

  const recommendedCount = askedQuestionIds.length === 0 ? 4 : 3;
  const recommended = ranked.slice(0, recommendedCount).map((entry) => entry.question);
  const firstFamily = grouped[0]?.family ?? "identity";
  const [activeFamily, setActiveFamily] = useState<BrowserFamily>(firstFamily);
  const resolvedFamily = grouped.some((entry) => entry.family === activeFamily) ? activeFamily : firstFamily;
  const activeGroup = grouped.find((entry) => entry.family === resolvedFamily) ?? grouped[0] ?? null;

  if (ranked.length === 0) {
    return (
      <div className="text-center">
        <p className="text-sm text-[#d7c7a4]">The strongest lines are spent. It’s time to make your guess.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="space-y-1 text-center">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">
            {askedQuestionIds.length === 0 ? "Recommended openers" : "Best next clues"}
          </p>
          <p className="mx-auto max-w-[34rem] text-sm leading-6 text-[#d7c7a4]">
            These are ranked by expected information gain, layer fit, and recent-question variety.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {recommended.map((question) => (
            <SurfacePillButton
              key={question.id}
              tone="accent"
              surface="choice"
              className="min-w-[12rem] px-4 py-2.5 text-[0.95rem] leading-5"
              disabled={isPending || remainingQuestions <= 0}
              onClick={() => onAskQuestion(question.id)}
            >
              {question.question}
            </SurfacePillButton>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {grouped.map((entry) => {
          const Icon = familyMeta[entry.family].icon;
          return (
            <SurfacePillButton
              key={entry.family}
              active={resolvedFamily === entry.family}
              tone={resolvedFamily === entry.family ? "accent" : "default"}
              surface="tab"
              className="min-w-[8.6rem] px-4 py-2.5"
              onClick={() => setActiveFamily(entry.family)}
            >
              <div className="flex items-center justify-center gap-2.5">
                <Icon className="h-4 w-4" />
                <span>{familyMeta[entry.family].label}</span>
              </div>
            </SurfacePillButton>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="space-y-2 text-center">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">
            {familyMeta[resolvedFamily].label}
          </p>
          <p className="mx-auto max-w-[36rem] text-sm leading-6 text-[#d7c7a4]">
            {familyMeta[resolvedFamily].description}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {(activeGroup?.questions.slice(0, 6) ?? []).map((question) => {
            const recommendedQuestion = recommended.some((entry) => entry.id === question.id);

            return (
              <SurfacePillButton
                key={question.id}
                tone={recommendedQuestion ? "accent" : "default"}
                surface="choice"
                className="min-w-[11rem] px-4 py-2.5 text-[0.95rem] leading-5"
                disabled={isPending || remainingQuestions <= 0}
                onClick={() => onAskQuestion(question.id)}
              >
                {question.question}
              </SurfacePillButton>
            );
          })}
        </div>
      </div>
    </div>
  );
}
