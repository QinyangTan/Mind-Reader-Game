"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Crosshair,
  History,
  HelpCircle,
  MessageSquareText,
  MinusCircle,
  SearchCheck,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import { EntityPicker } from "@/components/game/entity-picker";
import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { Button } from "@/components/ui/button";
import { entityById, getQuestionsForCategory } from "@/lib/data/entities";
import { cn } from "@/lib/utils/cn";
import type {
  GameEntity,
  GuessMyMindSession,
  NormalizedAnswer,
  SystemAnsweredQuestion,
} from "@/types/game";

type Polarity = "yes" | "no" | "unknown";

const POLARITY_BY_ANSWER: Record<NormalizedAnswer, Polarity> = {
  yes: "yes",
  probably: "yes",
  unknown: "unknown",
  probably_not: "no",
  no: "no",
};

const POLARITY_META: Record<
  Polarity,
  {
    label: string;
    icon: typeof CheckCircle2;
    tone: string;
    border: string;
    accent: string;
  }
> = {
  yes: {
    label: "Yes signals",
    icon: CheckCircle2,
    tone: "text-emerald-200",
    border: "border-emerald-200/30",
    accent: "bg-emerald-300/10",
  },
  no: {
    label: "No signals",
    icon: XCircle,
    tone: "text-rose-200",
    border: "border-rose-200/28",
    accent: "bg-rose-300/10",
  },
  unknown: {
    label: "Unknown",
    icon: HelpCircle,
    tone: "text-slate-300",
    border: "border-white/15",
    accent: "bg-white/6",
  },
};

const ANSWER_BADGE: Record<NormalizedAnswer, string> = {
  yes: "border-emerald-200/30 bg-emerald-300/14 text-emerald-100",
  probably: "border-cyan-200/30 bg-cyan-300/14 text-cyan-100",
  unknown: "border-white/14 bg-white/8 text-slate-200",
  probably_not: "border-violet-200/28 bg-violet-300/14 text-violet-100",
  no: "border-rose-200/30 bg-rose-300/14 text-rose-100",
};

const ANSWER_ICON: Record<NormalizedAnswer, typeof CheckCircle2> = {
  yes: CheckCircle2,
  probably: CheckCircle2,
  unknown: HelpCircle,
  probably_not: MinusCircle,
  no: XCircle,
};

type PolarityFilter = Polarity | "all";

const FILTERS: Array<{ value: PolarityFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Unknown" },
];

interface GuessMyMindBoardProps {
  session: GuessMyMindSession;
  onAskQuestion: (questionId: string) => void;
  onSubmitGuess: (entityId: string) => void;
  isPending: boolean;
  teachEntities?: Map<string, GameEntity>;
}

export function GuessMyMindBoard({
  session,
  onAskQuestion,
  onSubmitGuess,
  isPending,
  teachEntities,
}: GuessMyMindBoardProps) {
  const [selectedGuessId, setSelectedGuessId] = useState<string | null>(null);
  const [filter, setFilter] = useState<PolarityFilter>("all");

  const availableQuestions = getQuestionsForCategory(session.category).filter(
    (question) => !session.asked.some((entry) => entry.questionId === question.id),
  );
  const extraEntities = teachEntities ? Array.from(teachEntities.values()) : [];
  const resolveEntity = (id: string) => entityById.get(id) ?? teachEntities?.get(id);
  const remainingQuestions = session.config.maxQuestions - session.asked.length;
  const remainingGuesses = session.config.maxGuesses - session.guessAttemptsUsed;

  const polarityCounts = useMemo(() => {
    const counts: Record<Polarity, number> = { yes: 0, no: 0, unknown: 0 };
    for (const entry of session.asked) {
      counts[POLARITY_BY_ANSWER[entry.entityAnswer]] += 1;
    }
    return counts;
  }, [session.asked]);

  const orderedTrail: SystemAnsweredQuestion[] = useMemo(() => {
    const reversed = session.asked.slice().reverse();
    if (filter === "all") {
      return reversed;
    }
    return reversed.filter((entry) => POLARITY_BY_ANSWER[entry.entityAnswer] === filter);
  }, [session.asked, filter]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.05fr_0.95fr]">
      <MindChamberPanel
        eyebrow="Question bank"
        title="Interrogate the signal"
        className="order-1"
      >
        <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Questions left</p>
            <p className="text-2xl font-semibold text-white">{remainingQuestions}</p>
          </div>
          <MessageSquareText className="h-5 w-5 text-cyan-200" />
        </div>

        <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
          {availableQuestions.map((question) => (
            <motion.button
              key={question.id}
              type="button"
              onClick={() => onAskQuestion(question.id)}
              disabled={isPending || remainingQuestions <= 0}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-left transition-colors duration-300 hover:border-cyan-300/30 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{question.label}</p>
              <p className="mt-2 text-sm leading-7 text-white">{question.question}</p>
            </motion.button>
          ))}
        </div>

        {remainingQuestions <= 0 ? (
          <div className="mt-4 rounded-[1.5rem] border border-fuchsia-300/18 bg-fuchsia-300/8 px-4 py-4 text-sm text-fuchsia-100">
            No more questions. The chamber will answer only to guesses now.
          </div>
        ) : null}
      </MindChamberPanel>

      {/* Guess chamber appears second on mobile (right after question bank) so
          the player's active intent is always near the top, and trail pushes
          to the bottom where it's reviewed less often. On XL it stays in its
          original visual position via order utilities. */}
      <MindChamberPanel
        eyebrow="Guess chamber"
        title="Name the hidden entity"
        tone="emerald"
        className="order-2 xl:order-3"
      >
        <div className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_42%),rgba(255,255,255,0.04)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Guesses left</p>
              <p className="text-3xl font-semibold text-white">{remainingGuesses}</p>
            </div>
            <Crosshair className="h-5 w-5 text-emerald-200" />
          </div>
          <p className="text-sm leading-7 text-slate-300">
            Search the archive, choose one entity, and fire your guess whenever the clues feel strong enough.
          </p>
        </div>

        <EntityPicker
          category={session.category}
          excludedIds={session.wrongGuessIds}
          selectedId={selectedGuessId}
          onSelect={setSelectedGuessId}
          extraEntities={extraEntities}
        />

        <Button
          size="lg"
          className="w-full"
          disabled={!selectedGuessId || isPending || remainingGuesses <= 0}
          onClick={() => {
            if (!selectedGuessId) {
              return;
            }

            onSubmitGuess(selectedGuessId);
            setSelectedGuessId(null);
          }}
        >
          Submit guess
          <SearchCheck className="h-4 w-4" />
        </Button>

        <div className="space-y-3">
          {session.wrongGuessIds.length > 0 ? (
            <div className="rounded-[1.5rem] border border-rose-200/12 bg-rose-300/8 px-4 py-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-rose-100">
                <ShieldAlert className="h-4 w-4" />
                Missed guesses
              </div>
              <div className="flex flex-wrap gap-2">
                {session.wrongGuessIds.map((guessId) => (
                  <span
                    key={guessId}
                    className="rounded-full border border-rose-200/18 bg-rose-300/12 px-3 py-1 text-xs uppercase tracking-[0.22em] text-rose-100"
                  >
                    {resolveEntity(guessId)?.name ?? "Unknown"}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </MindChamberPanel>

      <MindChamberPanel
        eyebrow="Answer trail"
        title="What the chamber has admitted"
        tone="violet"
        className="order-3 xl:order-2"
      >
        {/* Polarity summary — a quick density gauge so the player can scan
            "what do I know?" without reading every entry */}
        <div className="grid grid-cols-3 gap-2 rounded-[1.5rem] border border-white/10 bg-white/4 p-2">
          {(Object.keys(POLARITY_META) as Polarity[]).map((polarity) => {
            const meta = POLARITY_META[polarity];
            const Icon = meta.icon;
            return (
              <div
                key={polarity}
                className={cn(
                  "flex items-center justify-between rounded-[1.1rem] border px-3 py-2",
                  meta.border,
                  meta.accent,
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", meta.tone)} />
                  <span className={cn("text-[0.6rem] uppercase tracking-[0.22em]", meta.tone)}>
                    {meta.label.replace(" signals", "")}
                  </span>
                </div>
                <span className="text-lg font-semibold text-white">
                  {polarityCounts[polarity]}
                </span>
              </div>
            );
          })}
        </div>

        {session.asked.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[0.62rem] uppercase tracking-[0.22em] transition-colors duration-200",
                    active
                      ? "border-cyan-200/40 bg-cyan-300/14 text-cyan-100"
                      : "border-white/10 bg-white/4 text-slate-300 hover:border-white/18",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
          {session.asked.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/4 px-4 py-6 text-sm text-slate-400">
              Ask a question from the bank and the chamber will answer with a calibrated signal.
            </div>
          ) : orderedTrail.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/4 px-4 py-6 text-sm text-slate-400">
              No answers in this polarity yet.
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {orderedTrail.map((entry) => {
                const polarity = POLARITY_BY_ANSWER[entry.entityAnswer];
                const meta = POLARITY_META[polarity];
                const Icon = ANSWER_ICON[entry.entityAnswer];
                return (
                  <motion.div
                    key={`${entry.questionId}-${entry.askedAt}`}
                    layout
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className={cn(
                      "rounded-[1.3rem] border-l-2 border border-white/8 bg-white/4 p-3 sm:p-4",
                      meta.border,
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm leading-6 text-white">{entry.prompt}</p>
                      <span
                        className={cn(
                          "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.22em]",
                          ANSWER_BADGE[entry.entityAnswer],
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {entry.entityAnswer.replace("_", " ")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <History className="h-3.5 w-3.5 text-cyan-200" />
            Wrong guesses stay unavailable so you do not burn the same attempt twice.
          </div>
        </div>
      </MindChamberPanel>
    </div>
  );
}
