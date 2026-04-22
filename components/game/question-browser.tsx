"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { questionGroupMeta, questionStageMeta } from "@/lib/data/questions";
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

  const staged = useMemo(() => {
    const stageBuckets = new Map<
      QuestionDefinition["stage"],
      Map<QuestionDefinition["group"], QuestionDefinition[]>
    >();

    for (const entry of ranked) {
      const stageBucket = stageBuckets.get(entry.question.stage) ?? new Map();
      const current = stageBucket.get(entry.question.group) ?? [];
      current.push(entry.question);
      stageBucket.set(entry.question.group, current);
      stageBuckets.set(entry.question.stage, stageBucket);
    }

    return Array.from(stageBuckets.entries())
      .map(([stage, groups]) => ({
        stage,
        meta: questionStageMeta[stage],
        groups: Array.from(groups.entries())
          .map(([group, questions]) => ({
            group,
            meta: questionGroupMeta[group],
            questions,
          }))
          .toSorted((left, right) => left.meta.order - right.meta.order),
      }))
      .toSorted((left, right) => left.meta.order - right.meta.order);
  }, [ranked]);

  const recommended = ranked.slice(0, 3).map((entry) => entry.question);
  const firstStage = staged[0]?.stage ?? null;
  const [selectedStage, setSelectedStage] = useState<QuestionDefinition["stage"] | null>(firstStage);
  const activeStage =
    selectedStage && staged.some((entry) => entry.stage === selectedStage)
      ? selectedStage
      : firstStage;
  const stageBucket = staged.find((entry) => entry.stage === activeStage) ?? staged[0] ?? null;
  const [selectedGroup, setSelectedGroup] = useState<QuestionDefinition["group"] | null>(stageBucket?.groups[0]?.group ?? null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const activeGroup =
    selectedGroup && stageBucket?.groups.some((entry) => entry.group === selectedGroup)
      ? selectedGroup
      : stageBucket?.groups[0]?.group ?? null;

  const selectedBucket =
    stageBucket?.groups.find((entry) => entry.group === activeGroup) ??
    stageBucket?.groups[0] ??
    null;
  const selectedQuestions = selectedBucket?.questions ?? [];
  const visibleSelectedQuestions =
    expandedGroups[selectedBucket?.group ?? ""] ? selectedQuestions : selectedQuestions.slice(0, 5);

  if (ranked.length === 0) {
    return (
      <div className="rounded-[1.2rem] border border-[rgba(240,217,162,0.14)] bg-[rgba(18,10,24,0.44)] px-4 py-5 text-sm text-[#af9c83]">
        The question archive is spent for this round. It’s time to make a guess.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.2rem] border border-[rgba(214,166,83,0.18)] bg-[rgba(18,10,24,0.42)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.68rem] tracking-[0.22em] text-[#d6a653]">RECOMMENDED NEXT</p>
            <p className="mt-1 text-sm text-[#cbbda5]">
              Start with the chamber’s sharpest splits before browsing deeper.
            </p>
          </div>
          <p className="text-xs text-[#9e8e79]">{remainingQuestions} clues left</p>
        </div>

        {ranked[0] ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[rgba(240,217,162,0.16)] bg-[rgba(31,16,39,0.82)] px-3 py-1.5 text-xs text-[#dbcdb5]">
            <span className="text-[#d6a653]">Current layer</span>
            <span>{questionStageMeta[ranked[0].targetStage].label}</span>
          </div>
        ) : null}

        <div className="mt-3 grid gap-2">
          {recommended.map((question) => (
            <motion.button
              key={question.id}
              type="button"
              onClick={() => onAskQuestion(question.id)}
              disabled={isPending || remainingQuestions <= 0}
              whileTap={{ scale: 0.985 }}
              className="rounded-[1.15rem] border border-[rgba(240,217,162,0.16)] bg-[rgba(31,16,39,0.82)] px-4 py-3 text-left transition-colors duration-150 hover:border-[rgba(240,217,162,0.26)] hover:bg-[rgba(40,20,50,0.92)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-6 text-[#f7efd9]">{question.question}</p>
                  <p className="text-xs text-[#a99781]">{questionStageMeta[question.stage].shortLabel}</p>
                </div>
                <span className="shrink-0 rounded-full border border-[rgba(240,217,162,0.14)] bg-[rgba(240,217,162,0.08)] px-2 py-1 text-[0.66rem] tracking-[0.14em] text-[#d6a653]">
                  {questionGroupMeta[question.group].label}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-[1.2rem] border border-[rgba(240,217,162,0.14)] bg-[rgba(18,10,24,0.44)] p-4">
        <div>
          <p className="text-[0.68rem] tracking-[0.22em] text-[#d6a653]">QUESTION LAYERS</p>
          <p className="mt-1 text-sm text-[#cbbda5]">
            Move from broad layers to finer ones instead of scrolling one giant list.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {staged.map((entry) => (
            <button
              key={entry.stage}
              type="button"
              onClick={() => {
                setSelectedStage(entry.stage);
                setSelectedGroup(entry.groups[0]?.group ?? null);
              }}
              className={cn(
                "rounded-full border px-3 py-2 text-sm transition-colors duration-150",
                activeStage === entry.stage
                  ? "brand-paper"
                  : "border-[rgba(240,217,162,0.16)] bg-[rgba(25,13,33,0.68)] text-[#dbcdb5] hover:border-[rgba(240,217,162,0.28)]",
              )}
            >
              {entry.meta.shortLabel} ({entry.groups.reduce((sum, group) => sum + group.questions.length, 0)})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {stageBucket?.groups.map((entry) => (
            <button
              key={entry.group}
              type="button"
              onClick={() => setSelectedGroup(entry.group)}
              className={cn(
                "rounded-full border px-3 py-2 text-sm transition-colors duration-150",
                activeGroup === entry.group
                  ? "brand-paper"
                  : "border-[rgba(240,217,162,0.16)] bg-[rgba(25,13,33,0.68)] text-[#dbcdb5] hover:border-[rgba(240,217,162,0.28)]",
              )}
            >
              {entry.meta.label} ({entry.questions.length})
            </button>
          ))}
        </div>

        {selectedBucket ? (
          <div className="space-y-3 rounded-[1.05rem] border border-[rgba(240,217,162,0.12)] bg-[rgba(24,12,31,0.58)] p-4">
            <div className="space-y-1">
              {stageBucket ? (
                <p className="text-xs tracking-[0.16em] text-[#d6a653]">{stageBucket.meta.label}</p>
              ) : null}
              <p className="text-base font-semibold text-[#f7efd9]">{selectedBucket.meta.label}</p>
              <p className="text-sm text-[#cbbda5]">
                {selectedBucket.meta.description}
                {stageBucket ? ` ${stageBucket.meta.description}` : ""}
              </p>
            </div>

            <div className="grid gap-2">
              {visibleSelectedQuestions.map((question) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => onAskQuestion(question.id)}
                  disabled={isPending || remainingQuestions <= 0}
                  className="rounded-[1rem] border border-[rgba(240,217,162,0.14)] bg-[rgba(18,10,24,0.64)] px-4 py-3 text-left text-sm leading-6 text-[#f7efd9] transition-colors duration-150 hover:border-[rgba(240,217,162,0.26)] hover:bg-[rgba(30,16,40,0.9)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {question.question}
                </button>
              ))}
            </div>

            {selectedQuestions.length > 5 ? (
              <button
                type="button"
                onClick={() =>
                  setExpandedGroups((current) => ({
                    ...current,
                    [selectedBucket.group]: !current[selectedBucket.group],
                  }))
                }
                className="text-sm font-medium text-[#d6a653] transition-colors hover:text-[#f0d9a2]"
              >
                {expandedGroups[selectedBucket.group] ? "Show fewer questions" : `Show all ${selectedQuestions.length} questions`}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
