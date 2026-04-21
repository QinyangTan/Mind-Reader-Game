"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Gauge, Orbit, Sparkles, Target } from "lucide-react";

import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { entityById } from "@/lib/data/entities";
import { questionById } from "@/lib/data/questions";
import { isTeachEntityId } from "@/lib/game/teach";
import { cn } from "@/lib/utils/cn";
import type { GameEntity, NormalizedAnswer, ReadMyMindSession } from "@/types/game";

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
  teachEntities?: Map<string, GameEntity>;
}

export function ReadMyMindBoard({
  session,
  onAnswer,
  isPending,
  isScanningGuess,
  teachEntities,
}: ReadMyMindBoardProps) {
  const question = session.currentQuestionId ? questionById.get(session.currentQuestionId) : null;
  const remainingQuestions = session.config.maxQuestions - session.asked.length;
  const remainingGuesses = session.config.maxGuesses - session.guessAttemptsUsed;
  const clarity = (session.asked.length / session.config.maxQuestions) * 100;
  const resolveEntity = (id: string) => entityById.get(id) ?? teachEntities?.get(id);
  const topCandidates = session.rankings
    .slice(0, 4)
    .map((candidate) => {
      const entity = resolveEntity(candidate.entityId);
      return entity
        ? { entity, confidence: candidate.confidence, fromTeachLibrary: isTeachEntityId(entity.id) }
        : null;
    })
    .filter(Boolean);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <MindChamberPanel eyebrow="Active probe" title="Read My Mind">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="rounded-[1.1rem] border border-white/10 bg-white/4 px-3 py-3 sm:rounded-[1.5rem] sm:px-4 sm:py-4">
              <p className="text-[0.58rem] uppercase tracking-[0.2em] text-slate-400 sm:text-[0.68rem] sm:tracking-[0.24em]">
                Q used
              </p>
              <p className="mt-1.5 text-2xl font-semibold text-white sm:mt-2 sm:text-3xl">
                {session.asked.length}
                <span className="text-sm text-slate-400 sm:text-base"> / {session.config.maxQuestions}</span>
              </p>
            </div>
            <div className="rounded-[1.1rem] border border-white/10 bg-white/4 px-3 py-3 sm:rounded-[1.5rem] sm:px-4 sm:py-4">
              <p className="text-[0.58rem] uppercase tracking-[0.2em] text-slate-400 sm:text-[0.68rem] sm:tracking-[0.24em]">
                G left
              </p>
              <p className="mt-1.5 text-2xl font-semibold text-white sm:mt-2 sm:text-3xl">{remainingGuesses}</p>
            </div>
            <div className="rounded-[1.1rem] border border-white/10 bg-white/4 px-3 py-3 sm:rounded-[1.5rem] sm:px-4 sm:py-4">
              <p className="text-[0.58rem] uppercase tracking-[0.2em] text-slate-400 sm:text-[0.68rem] sm:tracking-[0.24em]">
                Clarity
              </p>
              <p className="mt-1.5 text-2xl font-semibold text-white sm:mt-2 sm:text-3xl">
                {Math.round(clarity)}%
              </p>
            </div>
          </div>

          <motion.div
            animate={{
              boxShadow: isScanningGuess
                ? "0 0 0 1px rgba(103,232,249,0.35), 0 0 60px rgba(103,232,249,0.22)"
                : "0 0 0 1px rgba(255,255,255,0.06), 0 0 0 rgba(103,232,249,0)",
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.14),transparent_42%),rgba(255,255,255,0.04)] px-5 py-6 sm:px-6 sm:py-7"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent"
              initial={{ opacity: 0 }}
              animate={{
                opacity: isScanningGuess ? [0.6, 1, 0.6] : [0.15, 0.45, 0.15],
                y: [0, 140, 0],
              }}
              transition={{
                duration: isScanningGuess ? 1.4 : 3.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="mb-5 flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.28em] text-cyan-200/80">
              <BrainCircuit className="h-4 w-4" />
              {isScanningGuess ? "Scanning thought patterns..." : "Current probe"}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={question?.id ?? session.asked.length}
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="max-w-3xl font-display text-[1.85rem] leading-tight text-white sm:text-4xl md:text-5xl">
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
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-3">
            {answerOptions.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => onAnswer(option.value)}
                disabled={isPending || !question || isScanningGuess}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className={cn(
                  "rounded-[1.4rem] border border-white/10 bg-white/5 px-3 py-3 text-left transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-45 sm:rounded-[1.6rem] sm:px-4 sm:py-4",
                  "bg-gradient-to-br",
                  option.tone,
                )}
              >
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <p className="text-base font-semibold text-white sm:text-lg">{option.label}</p>
                  <Sparkles className="h-4 w-4 text-white/70" />
                </div>
                <p className="mt-1.5 text-[0.62rem] uppercase tracking-[0.2em] text-slate-300 sm:mt-2 sm:text-xs sm:tracking-[0.22em]">
                  {option.description}
                </p>
              </motion.button>
            ))}
          </div>
        </MindChamberPanel>
      </div>

      <div className="space-y-6">
        <MindChamberPanel eyebrow="Live certainty" title="Likely identities" tone="violet">
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {topCandidates.map((entry, index) =>
                entry ? (
                  <motion.div
                    key={entry.entity.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      layout: { type: "spring", stiffness: 320, damping: 30 },
                      duration: 0.25,
                      ease: "easeOut",
                    }}
                    className={cn(
                      "rounded-[1.5rem] border bg-white/4 p-4 transition-colors",
                      index === 0
                        ? "border-cyan-200/30 shadow-[0_0_0_1px_rgba(103,232,249,0.12)]"
                        : "border-white/8",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">
                        <span className="mr-2">{entry.entity.imageEmoji}</span>
                        {entry.entity.name}
                        {entry.fromTeachLibrary ? (
                          <span className="ml-2 rounded-full border border-emerald-200/30 bg-emerald-300/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.22em] text-emerald-100">
                            Teach
                          </span>
                        ) : null}
                      </p>
                      <span className="text-sm font-semibold text-slate-200">
                        {Math.round(entry.confidence * 100)}%
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{entry.entity.shortDescription}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                      <motion.div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#67e8f9,#8b5cf6)]"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.max(6, Math.round(entry.confidence * 100))}%`,
                        }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </motion.div>
                ) : null,
              )}
            </AnimatePresence>
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
