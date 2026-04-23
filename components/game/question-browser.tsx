"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Compass,
  Eye,
  Feather,
  Flame,
  Layers3,
  MoonStar,
  Sparkles,
  UserRoundSearch,
} from "lucide-react";

import { SurfacePillButton } from "@/components/game/scene-surfaces";
import { questionGroupMeta, questionStageMeta, questionStageOrder } from "@/lib/data/questions";
import { rankAvailableQuestions } from "@/lib/game/question-selection";
import { cn } from "@/lib/utils/cn";
import type {
  EntityCategory,
  GameEntity,
  LearnedInferenceModel,
  QuestionDefinition,
  QuestionGroup,
  QuestionStage,
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

const stageIndex = Object.fromEntries(
  questionStageOrder.map((stage, index) => [stage, index]),
) as Record<QuestionStage, number>;

const layerCopy: Record<
  QuestionStage,
  {
    label: string;
    plainLabel: string;
    description: string;
    icon: typeof Layers3;
  }
> = {
  broad: {
    label: "Layer A · Broad Openers",
    plainLabel: "Broad Openers",
    description: "Start with a few high-value clues that split Mora’s thought cleanly.",
    icon: Layers3,
  },
  category: {
    label: "Layer B · Identity Split",
    plainLabel: "Identity Split",
    description: "Ask structural clues once the first outline has appeared.",
    icon: UserRoundSearch,
  },
  profile: {
    label: "Layer C · Profile",
    plainLabel: "Profile",
    description: "Probe major traits, roles, use, setting, or behavior.",
    icon: Brain,
  },
  specialist: {
    label: "Layer D · Specialist",
    plainLabel: "Specialist",
    description: "Use category-specific discriminators after the field has narrowed.",
    icon: Compass,
  },
  fine: {
    label: "Layer E · Fine Detail",
    plainLabel: "Fine Detail",
    description: "Ask precise disambiguators only when the answer feels close.",
    icon: MoonStar,
  },
};

const groupIcons: Partial<Record<QuestionGroup, typeof UserRoundSearch>> = {
  identity: UserRoundSearch,
  origin: Compass,
  role: Flame,
  powers: Sparkles,
  body: Eye,
  habitat: Feather,
  diet: Feather,
  size: Eye,
  pattern: Eye,
  behavior: Brain,
  usage: Compass,
  material: Eye,
  technology: Sparkles,
  mobility: ArrowRight,
  taste: Flame,
  serving: Feather,
  era: MoonStar,
  region: Compass,
  legacy: Sparkles,
};

interface FamilyBucket {
  key: string;
  group: QuestionGroup;
  label: string;
  description: string;
  topScore: number;
  questions: QuestionDefinition[];
}

interface BrowserSelection {
  stage: QuestionStage;
  askedCount: number;
  familyKey: string | null;
  showMore: boolean;
}

function unlockDepth(askedCount: number, remainingQuestions: number, targetStage: QuestionStage) {
  const targetIndex = stageIndex[targetStage];
  const progressIndex =
    askedCount <= 0
      ? 0
      : askedCount === 1
        ? 1
        : askedCount <= 3
          ? 2
          : askedCount <= 5
            ? 3
            : 4;
  const urgencyIndex =
    remainingQuestions <= 2 ? 4 : remainingQuestions <= 4 ? 3 : remainingQuestions <= 7 ? 2 : 0;

  return Math.max(targetIndex, progressIndex, urgencyIndex);
}

function buildFamilyBuckets(
  ranked: ReturnType<typeof rankAvailableQuestions>,
  activeStage: QuestionStage,
) {
  const buckets = new Map<string, FamilyBucket>();

  for (const entry of ranked) {
    const question = entry.question;
    if (question.stage !== activeStage) {
      continue;
    }

    const key = `${question.group}:${question.family}`;
    const current = buckets.get(key);

    if (current) {
      current.questions.push(question);
      current.topScore = Math.max(current.topScore, entry.score);
      continue;
    }

    buckets.set(key, {
      key,
      group: question.group,
      label: questionGroupMeta[question.group].label,
      description: questionGroupMeta[question.group].description,
      topScore: entry.score,
      questions: [question],
    });
  }

  return [...buckets.values()].toSorted((left, right) => right.topScore - left.topScore);
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
  const targetStage = ranked[0]?.targetStage ?? "broad";
  const unlockedDepth = unlockDepth(askedQuestionIds.length, remainingQuestions, targetStage);
  const unlockedStages = questionStageOrder.filter(
    (stage) =>
      stageIndex[stage] <= unlockedDepth &&
      ranked.some((entry) => entry.question.stage === stage),
  );
  const suggestedStage =
    unlockedStages.find((stage) => stage === targetStage) ??
    unlockedStages.at(-1) ??
    "broad";
  const [requestedStage, setRequestedStage] = useState<QuestionStage>(suggestedStage);
  const [selection, setSelection] = useState<BrowserSelection>({
    stage: suggestedStage,
    askedCount: askedQuestionIds.length,
    familyKey: null,
    showMore: false,
  });
  const unlockedKey = unlockedStages.join("|");
  const activeStage = unlockedKey.split("|").includes(requestedStage)
    ? requestedStage
    : suggestedStage;
  const activeFamilyKey =
    selection.stage === activeStage && selection.askedCount === askedQuestionIds.length
      ? selection.familyKey
      : null;
  const showMore =
    selection.stage === activeStage && selection.askedCount === askedQuestionIds.length
      ? selection.showMore
      : false;

  function chooseStage(stage: QuestionStage) {
    setRequestedStage(stage);
    setSelection({
      stage,
      askedCount: askedQuestionIds.length,
      familyKey: null,
      showMore: false,
    });
  }

  const familyBuckets = useMemo(
    () => buildFamilyBuckets(ranked, activeStage),
    [activeStage, ranked],
  );
  const visibleFamilies = familyBuckets.slice(0, 4);
  const resolvedFamily =
    familyBuckets.find((bucket) => bucket.key === activeFamilyKey) ??
    familyBuckets[0] ??
    null;
  const visibleQuestions = (resolvedFamily?.questions ?? []).slice(0, showMore ? 5 : 3);
  const activeStagePosition = unlockedStages.indexOf(activeStage);
  const broaderStage = activeStagePosition > 0 ? unlockedStages[activeStagePosition - 1] : null;
  const deeperStage =
    activeStagePosition >= 0 && activeStagePosition < unlockedStages.length - 1
      ? unlockedStages[activeStagePosition + 1]
      : null;
  const LayerIcon = layerCopy[activeStage].icon;
  const FamilyIcon = resolvedFamily ? groupIcons[resolvedFamily.group] ?? Compass : Compass;

  if (ranked.length === 0 || !resolvedFamily) {
    return (
      <div className="text-center">
        <p className="text-sm text-[#d7c7a4]">The strongest lines are spent. It’s time to make your guess.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3 text-center">
        <div className="mx-auto flex max-w-[38rem] items-center justify-center gap-2 text-[#d8b36a]">
          <LayerIcon className="h-4 w-4" />
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
            {layerCopy[activeStage].label}
          </p>
        </div>
        <p className="mx-auto max-w-[34rem] text-sm leading-6 text-[#d7c7a4]">
          {layerCopy[activeStage].description}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {broaderStage ? (
          <SurfacePillButton
            type="button"
            tone="default"
            surface="compact"
            onClick={() => chooseStage(broaderStage)}
            className="px-3 py-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {layerCopy[broaderStage].plainLabel}
          </SurfacePillButton>
        ) : null}

        {activeStage !== suggestedStage ? (
          <SurfacePillButton
            type="button"
            tone="accent"
            surface="compact"
            onClick={() => chooseStage(suggestedStage)}
            className="px-3 py-2"
          >
            Mora suggests {layerCopy[suggestedStage].plainLabel}
          </SurfacePillButton>
        ) : (
          <span className="border border-[rgba(214,174,98,0.18)] bg-[rgba(22,12,31,0.42)] px-3 py-2 text-xs text-[#d7c7a4]">
            Recommended layer
          </span>
        )}

        {deeperStage ? (
          <SurfacePillButton
            type="button"
            tone="default"
            surface="compact"
            onClick={() => chooseStage(deeperStage)}
            className="px-3 py-2"
          >
            Go deeper
            <ArrowRight className="h-3.5 w-3.5" />
          </SurfacePillButton>
        ) : null}
      </div>

      {visibleFamilies.length > 1 ? (
        <div className="space-y-2">
          <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">
            Choose an inquiry path
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {visibleFamilies.map((bucket) => {
              const Icon = groupIcons[bucket.group] ?? Compass;
              const active = resolvedFamily.key === bucket.key;
              return (
                <SurfacePillButton
                  key={bucket.key}
                  type="button"
                  active={active}
                  tone={active ? "accent" : "default"}
                  surface="tab"
                  className="px-3 py-2"
                  onClick={() => {
                    setSelection({
                      stage: activeStage,
                      askedCount: askedQuestionIds.length,
                      familyKey: bucket.key,
                      showMore: false,
                    });
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {bucket.label}
                </SurfacePillButton>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 text-[#d8b36a]">
            <FamilyIcon className="h-4 w-4" />
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
              {resolvedFamily.label}
            </p>
          </div>
          <p className="mx-auto max-w-[32rem] text-sm leading-6 text-[#d7c7a4]">
            {resolvedFamily.description}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {visibleQuestions.map((question) => (
            <SurfacePillButton
              key={question.id}
              tone="accent"
              surface="choice"
              className={cn(
                "min-h-[4.2rem] px-4 py-3 text-[0.94rem] leading-5",
                visibleQuestions.length < 3 ? "sm:col-span-1" : "",
              )}
              disabled={isPending || remainingQuestions <= 0}
              onClick={() => onAskQuestion(question.id)}
            >
              {question.question}
            </SurfacePillButton>
          ))}
        </div>

        {resolvedFamily.questions.length > visibleQuestions.length ? (
          <div className="flex justify-center">
            <SurfacePillButton
              type="button"
              tone="default"
              surface="compact"
              className="px-3 py-2"
              onClick={() =>
                setSelection({
                  stage: activeStage,
                  askedCount: askedQuestionIds.length,
                  familyKey: resolvedFamily.key,
                  showMore: !showMore,
                })
              }
            >
              {showMore ? "Show fewer" : "Show two more"}
            </SurfacePillButton>
          </div>
        ) : null}
      </div>

      <div className="text-center text-xs leading-5 text-[#bcae8c]">
        {questionStageMeta[activeStage].description}
      </div>
    </div>
  );
}
