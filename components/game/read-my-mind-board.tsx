"use client";

import { AnimatePresence, motion } from "framer-motion";

import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { questionById } from "@/lib/data/questions";
import { cn } from "@/lib/utils/cn";
import type { NormalizedAnswer, ReadMyMindSession } from "@/types/game";

const answerOptions: Array<{
  value: NormalizedAnswer;
  label: string;
  response: string;
  tone: string;
}> = [
  {
    value: "yes",
    label: "Yes",
    response: "That feels true.",
    tone: "border-emerald-900/18 bg-[rgba(63,108,79,0.14)] hover:bg-[rgba(63,108,79,0.2)]",
  },
  {
    value: "probably",
    label: "Probably",
    response: "Close enough to yes.",
    tone: "border-sky-900/18 bg-[rgba(74,105,126,0.14)] hover:bg-[rgba(74,105,126,0.2)]",
  },
  {
    value: "unknown",
    label: "Unknown",
    response: "I cannot tell.",
    tone: "border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.06)] hover:bg-[rgba(84,49,35,0.12)]",
  },
  {
    value: "probably_not",
    label: "Probably not",
    response: "It leans away from that.",
    tone: "border-violet-900/16 bg-[rgba(104,73,121,0.14)] hover:bg-[rgba(104,73,121,0.2)]",
  },
  {
    value: "no",
    label: "No",
    response: "That is not it.",
    tone: "border-rose-900/16 bg-[rgba(126,77,82,0.14)] hover:bg-[rgba(126,77,82,0.2)]",
  },
];

function toSpokenPrompt(prompt: string, questionIndex: number) {
  const openers = [
    "Tell me this.",
    "Stay still for a moment.",
    "No, the vision shifts. Answer this.",
    "Let me try another angle.",
    "The outline is clearer now.",
  ] as const;

  return `${openers[questionIndex % openers.length]} ${prompt}`;
}

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
  const remainingGuesses = session.config.maxGuesses - session.guessAttemptsUsed;
  const currentQuestionNumber = Math.min(session.asked.length + 1, session.config.maxQuestions);
  const progress = Math.max(8, (session.asked.length / session.config.maxQuestions) * 100);
  const spokenPrompt = question ? toSpokenPrompt(question.question, session.asked.length) : null;

  return (
    <div className="mx-auto w-full max-w-[860px]">
      <MindChamberPanel
        eyebrow={isScanningGuess ? "The reveal is gathering" : "Mora asks"}
        title={
          isScanningGuess
            ? "Be still. She has seen enough."
            : spokenPrompt ?? "The next question is arriving."
        }
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#5b4034]">
            <span>
              Question {currentQuestionNumber} of {session.config.maxQuestions}
            </span>
            <span>{remainingGuesses} guesses remain</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[rgba(95,62,40,0.12)]">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,#8a5b24,#d6a653)]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            />
          </div>

          <p className="text-center text-base leading-7 text-[#4d352c] sm:text-lg">
            {isScanningGuess
              ? "The chamber has gone quiet. Mora is turning your answers into a single name."
              : "Reply with the closest truth. The ritual only needs one clear next clue."}
          </p>

          <AnimatePresence mode="wait">
            {isScanningGuess ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-[1.2rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] px-5 py-6 text-center"
              >
                <p className="font-display text-[2rem] leading-none text-[#2d1b19] sm:text-[2.5rem]">
                  She is ready to declare.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={question?.id ?? session.asked.length}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid gap-3 md:grid-cols-2"
              >
                {answerOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => onAnswer(option.value)}
                    disabled={isPending || !session.currentQuestionId}
                    whileTap={{ scale: 0.985 }}
                    transition={{ duration: 0.12 }}
                    className={cn(
                      "rounded-[1.15rem] border px-4 py-4 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45",
                      option.tone,
                      option.value === "unknown" ? "md:col-span-2" : "",
                    )}
                  >
                    <p className="text-lg font-semibold text-[#2d1b19]">{option.label}</p>
                    <p className="mt-1 text-sm text-[#674b3d]">{option.response}</p>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </MindChamberPanel>
    </div>
  );
}
