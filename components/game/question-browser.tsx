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
  QuestionGroup,
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
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<QuestionDefinition["stage"] | null>(firstStage);
  const activeStage =
    selectedStage && staged.some((entry) => entry.stage === selectedStage)
      ? selectedStage
      : firstStage;
  const stageBucket = staged.find((entry) => entry.stage === activeStage) ?? staged[0] ?? null;
  const [selectedGroup, setSelectedGroup] = useState<QuestionGroup | null>(stageBucket?.groups[0]?.group ?? null);
  const activeGroup =
    selectedGroup && stageBucket?.groups.some((entry) => entry.group === selectedGroup)
      ? selectedGroup
      : stageBucket?.groups[0]?.group ?? null;
  const selectedBucket =
    stageBucket?.groups.find((entry) => entry.group === activeGroup) ??
    stageBucket?.groups[0] ??
    null;

  if (ranked.length === 0) {
    return (
      <div className="rounded-[1.1rem] border border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.08)] px-4 py-5 text-sm text-[#5a433b]">
        The strongest lines of questioning are spent. It’s time to make your guess.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-[#8a5b24]">Best next questions</p>
            <p className="mt-1 text-sm text-[#5a433b]">Ask one of these first if you want the quickest clue.</p>
          </div>
          {ranked[0] ? (
            <span className="rounded-full border border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.06)] px-3 py-1 text-xs text-[#6a4a3c]">
              {questionStageMeta[ranked[0].targetStage].label}
            </span>
          ) : null}
        </div>

        <div className="grid gap-2">
          {recommended.map((question) => (
            <motion.button
              key={question.id}
              type="button"
              onClick={() => onAskQuestion(question.id)}
              disabled={isPending || remainingQuestions <= 0}
              whileTap={{ scale: 0.985 }}
              className="rounded-[1.1rem] border border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.08)] px-4 py-3 text-left transition-colors duration-150 hover:border-[rgba(138,91,36,0.24)] hover:bg-[rgba(84,49,35,0.12)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-6 text-[#2d1b19]">{question.question}</p>
                <p className="text-xs text-[#6e5243]">
                  {questionGroupMeta[question.group].label} · {questionStageMeta[question.stage].shortLabel}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="border-t border-[rgba(102,72,52,0.12)] pt-4">
        <button
          type="button"
          onClick={() => setArchiveOpen((current) => !current)}
          className="text-sm font-medium text-[#6a452a] transition-colors hover:text-[#8a5b24]"
        >
          {archiveOpen ? "Hide the deeper archive" : "Browse deeper lines of questioning"}
        </button>

        {archiveOpen ? (
          <div className="mt-4 space-y-4 rounded-[1.2rem] border border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.06)] p-4">
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
                      ? "border-[rgba(138,91,36,0.22)] bg-[rgba(255,255,255,0.34)] text-[#2d1b19]"
                      : "border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.06)] text-[#5a433b] hover:border-[rgba(138,91,36,0.24)]",
                  )}
                >
                  {entry.meta.shortLabel}
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
                      ? "border-[rgba(138,91,36,0.22)] bg-[rgba(255,255,255,0.34)] text-[#2d1b19]"
                      : "border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.06)] text-[#5a433b] hover:border-[rgba(138,91,36,0.24)]",
                  )}
                >
                  {entry.meta.label}
                </button>
              ))}
            </div>

            {selectedBucket ? (
              <div className="grid gap-2">
                {selectedBucket.questions.slice(0, 6).map((question) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => onAskQuestion(question.id)}
                    disabled={isPending || remainingQuestions <= 0}
                    className="rounded-[1rem] border border-[rgba(102,72,52,0.14)] bg-[rgba(255,255,255,0.24)] px-4 py-3 text-left text-sm leading-6 text-[#2d1b19] transition-colors duration-150 hover:border-[rgba(138,91,36,0.24)] hover:bg-[rgba(255,255,255,0.34)] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {question.question}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
