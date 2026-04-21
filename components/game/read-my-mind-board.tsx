"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Gauge, Orbit, Sparkles, Target } from "lucide-react";

import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { entityById } from "@/lib/data/entities";
import { questionById } from "@/lib/data/questions";
import { cn } from "@/lib/utils/cn";
import type { NormalizedAnswer, ReadMyMindSession } from "@/types/game";

const answerOptions: Array<{
  value: NormalizedAnswer;
  label: string;
  tone: string;
  description: string;
}> = [
  {
    value: "yes",
    label: "Yes",
    tone: "from-emerald-300/35 to-cyan-300/18 hover:border-emerald-200/35",
    description: "Clear signal",
  },
  {
    value: "probably",
    label: "Probably",
    tone: "from-cyan-300/35 to-sky-300/18 hover:border-cyan-200/35",
    description: "Leaning yes",
  },
  {
    value: "unknown",
    label: "Unknown",
    tone: "from-slate-300/20 to-white/6 hover:border-white/18",
    description: "Signal fog",
  },
  {
    value: "probably_not",
    label: "Probably Not",
    tone: "from-violet-300/24 to-fuchsia-300/16 hover:border-violet-200/30",
    description: "Leaning no",
  },
  {
    value: "no",
    label: "No",
    tone: "from-rose-300/28 to-orange-300/18 hover:border-rose-200/35",
    description: "Hard reject",
  },
];

interface ReadMyMindBoardProps {
  session: ReadMyMindSession;
  onAnswer: (answer: NormalizedAnswer) => void;
  isPending: boolean;
  isScanningGuess: boolean;
}

export function ReadMyMindBoard({
  session,
  onAnswer,
  isPending,
  isScanningGuess,
}: ReadMyMindBoardProps) {
  const question = session.currentQuestionId ? questionById.get(session.currentQuestionId) : null;
  const remainingQuestions = session.config.maxQuestions - session.asked.length;
  const remainingGuesses = session.config.maxGuesses - session.guessAttemptsUsed;
  const clarity = (session.asked.length / session.config.maxQuestions) * 100;
  const topCandidates = session.rankings
    .slice(0, 4)
    .map((candidate) => {
      const entity = entityById.get(candidate.entityId);
      return entity ? { entity, confidence: candidate.confidence } : null;
    })
    .filter(Boolean);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <MindChamberPanel eyebrow="Active probe" title="Read My Mind">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Questions used</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {session.asked.length}
                <span className="text-base text-slate-400"> / {session.config.maxQuestions}</span>
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Guesses left</p>
              <p className="mt-2 text-3xl font-semibold text-white">{remainingGuesses}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Thought clarity</p>
              <p className="mt-2 text-3xl font-semibold text-white">{Math.round(clarity)}%</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.14),transparent_42%),rgba(255,255,255,0.04)] px-6 py-7">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
            <div className="mb-5 flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.28em] text-cyan-200/80">
              <BrainCircuit className="h-4 w-4" />
              {isScanningGuess ? "Scanning thought patterns..." : "Current probe"}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={question?.id ?? session.asked.length}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <p className="max-w-3xl font-display text-4xl leading-tight text-white md:text-5xl">
                  {question?.question ?? "The chamber is aligning its next guess..."}
                </p>
              </motion.div>
            </AnimatePresence>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Answer from instinct. The engine weighs exact signals, soft maybes, and uncertain haze.
            </p>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#67e8f9,#8b5cf6,#f472b6)]"
                animate={{ width: `${Math.max(8, clarity)}%` }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {answerOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onAnswer(option.value)}
                disabled={isPending || !question || isScanningGuess}
                className={cn(
                  "rounded-[1.6rem] border border-white/10 bg-white/5 px-4 py-4 text-left transition duration-300 disabled:cursor-not-allowed disabled:opacity-45",
                  "bg-gradient-to-br",
                  option.tone,
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-white">{option.label}</p>
                  <Sparkles className="h-4 w-4 text-white/70" />
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-300">{option.description}</p>
              </button>
            ))}
          </div>
        </MindChamberPanel>
      </div>

      <div className="space-y-6">
        <MindChamberPanel eyebrow="Live certainty" title="Likely identities" tone="violet">
          <div className="space-y-4">
            {topCandidates.map((entry) =>
              entry ? (
                <div key={entry.entity.id} className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">
                      <span className="mr-2">{entry.entity.imageEmoji}</span>
                      {entry.entity.name}
                    </p>
                    <span className="text-sm text-slate-300">{Math.round(entry.confidence * 100)}%</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{entry.entity.shortDescription}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#67e8f9,#8b5cf6)]"
                      style={{ width: `${Math.max(6, Math.round(entry.confidence * 100))}%` }}
                    />
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </MindChamberPanel>

        <MindChamberPanel eyebrow="Telemetry" title="Scan log" tone="emerald">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Gauge className="h-4 w-4 text-cyan-200" />
              {remainingQuestions} question{remainingQuestions === 1 ? "" : "s"} remain before the chamber runs out
              of runway.
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Target className="h-4 w-4 text-fuchsia-200" />
              {session.rejectedGuessIds.length} failed lock
              {session.rejectedGuessIds.length === 1 ? "" : "s"} so far.
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Orbit className="h-4 w-4 text-emerald-200" />
              The next question is chosen to split the strongest remaining candidates.
            </div>
          </div>

          <div className="space-y-3">
            {session.asked.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/4 px-4 py-6 text-sm text-slate-400">
                No answers yet. Once you respond, the chamber starts narrowing the field.
              </div>
            ) : (
              session.asked
                .slice(-5)
                .reverse()
                .map((entry) => (
                  <div key={`${entry.questionId}-${entry.askedAt}`} className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                    <p className="text-sm text-white">{entry.prompt}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-cyan-200/85">
                      Response: {entry.answer.replace("_", " ")}
                    </p>
                  </div>
                ))
            )}
          </div>
        </MindChamberPanel>
      </div>
    </div>
  );
}
