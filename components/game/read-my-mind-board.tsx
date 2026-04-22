"use client";

import { AnimatePresence, motion } from "framer-motion";

import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { questionById } from "@/lib/data/questions";
import { cn } from "@/lib/utils/cn";
import type { GameEntity, NormalizedAnswer, ReadMyMindSession } from "@/types/game";

const answerOptions: Array<{
  value: NormalizedAnswer;
  label: string;
  response: string;
  tone: string;
}> = [
  {
    value: "yes",
    label: "Yes",
    response: "Yes, it is",
    tone: "border-emerald-900/18 bg-[rgba(63,108,79,0.14)] hover:bg-[rgba(63,108,79,0.2)]",
  },
  {
    value: "probably",
    label: "Probably",
    response: "I think so",
    tone: "border-sky-900/18 bg-[rgba(74,105,126,0.14)] hover:bg-[rgba(74,105,126,0.2)]",
  },
  {
    value: "unknown",
    label: "Unknown",
    response: "I can't tell",
    tone: "border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.06)] hover:bg-[rgba(84,49,35,0.12)]",
  },
  {
    value: "probably_not",
    label: "Probably not",
    response: "Probably not",
    tone: "border-violet-900/16 bg-[rgba(104,73,121,0.14)] hover:bg-[rgba(104,73,121,0.2)]",
  },
  {
    value: "no",
    label: "No",
    response: "No, it isn't",
    tone: "border-rose-900/16 bg-[rgba(126,77,82,0.14)] hover:bg-[rgba(126,77,82,0.2)]",
  },
];

function toSpokenPrompt(prompt: string, questionIndex: number) {
  const openers = [
    "Tell me this:",
    "Let me listen closer:",
    "The image sharpens. Answer this:",
    "No, wait. One more angle:",
    "Stay with me:",
  ] as const;

  return `${openers[questionIndex % openers.length]} ${prompt}`;
}

interface ReadMyMindBoardProps {
  session: ReadMyMindSession;
  onAnswer: (answer: NormalizedAnswer) => void;
  isPending: boolean;
  isScanningGuess: boolean;
  teachEntities?: Map<string, GameEntity>;
  mascotReactionKey?: number;
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
    <div className="mx-auto max-w-[780px] space-y-4">
      <MindChamberPanel
        eyebrow={isScanningGuess ? "Mora has seen enough." : "Mora speaks"}
        title={
          isScanningGuess
            ? "Be still. The answer is surfacing."
            : spokenPrompt ?? "The next question is arriving."
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#5f463a]">
          <span>
            Question {currentQuestionNumber} of {session.config.maxQuestions}
          </span>
          <span>{remainingGuesses} guesses remain</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[rgba(82,53,39,0.12)]">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#8a5b24,#d6a653)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          />
        </div>

        <p className="max-w-2xl text-base leading-7 text-[#4f3830]">
          {isScanningGuess
            ? "She has stopped asking and started deciding. The next beat is a declaration."
            : "Answer with the closest truth and let the chamber tighten around your thought."}
        </p>

        <AnimatePresence mode="wait">
          {isScanningGuess ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-[1.2rem] border border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.08)] px-5 py-5 text-center"
            >
              <p className="text-lg font-semibold text-[#2f1d19]">The chamber is silent for one breath.</p>
              <p className="mt-2 text-sm leading-6 text-[#5f463a]">Wait for Mora to step forward with her guess.</p>
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
                    "rounded-[1.2rem] border px-4 py-4 text-left text-[#2f1d19] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45",
                    option.tone,
                    option.value === "unknown" ? "md:col-span-2" : "",
                  )}
                >
                  <p className="text-lg font-semibold">{option.label}</p>
                  <p className="mt-1 text-sm text-[#6e5243]">{option.response}</p>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </MindChamberPanel>
    </div>
  );
}
