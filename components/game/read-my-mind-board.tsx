"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

import { MascotScene } from "@/components/brand/mascot-scene";
import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { questionById } from "@/lib/data/questions";
import { getMascotFacing, getQuestionMascotState } from "@/lib/game/mascot";
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
    tone: "border-[#8bb19a]/34 bg-[rgba(22,41,33,0.8)] hover:bg-[rgba(33,55,44,0.88)]",
  },
  {
    value: "probably",
    label: "Probably",
    response: "I think so",
    tone: "border-[#8faeb8]/34 bg-[rgba(22,38,46,0.82)] hover:bg-[rgba(31,49,58,0.9)]",
  },
  {
    value: "unknown",
    label: "Unknown",
    response: "I can't tell",
    tone: "border-[rgba(240,217,162,0.16)] bg-[rgba(21,12,28,0.82)] hover:bg-[rgba(29,16,38,0.9)]",
  },
  {
    value: "probably_not",
    label: "Probably Not",
    response: "Probably not",
    tone: "border-[#8d729f]/32 bg-[rgba(36,24,51,0.82)] hover:bg-[rgba(47,31,65,0.9)]",
  },
  {
    value: "no",
    label: "No",
    response: "No, it isn't",
    tone: "border-[#b7777d]/34 bg-[rgba(54,24,34,0.84)] hover:bg-[rgba(67,29,42,0.9)]",
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
  mascotReactionKey,
}: ReadMyMindBoardProps) {
  const question = session.currentQuestionId ? questionById.get(session.currentQuestionId) : null;
  const remainingGuesses = session.config.maxGuesses - session.guessAttemptsUsed;
  const currentQuestionNumber = Math.min(session.asked.length + 1, session.config.maxQuestions);
  const progress = (session.asked.length / session.config.maxQuestions) * 100;
  const mascotState = getQuestionMascotState({
    mode: "read-my-mind",
    isPending,
    isScanningGuess,
  });
  const spokenPrompt = question ? toSpokenPrompt(question.question, session.asked.length) : null;

  return (
    <div className="mx-auto max-w-[880px] space-y-5">
      <div className="rounded-[1.2rem] border border-[rgba(214,166,83,0.16)] bg-[rgba(14,10,21,0.58)] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#dbcdb5]">
          <div>
            <p className="text-[0.68rem] tracking-[0.22em] text-[#d6a653]">THE READING IS UNDERWAY</p>
            <div className="mt-2 flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-[#d6a653]" />
            <span>
              Question {currentQuestionNumber} of {session.config.maxQuestions}
            </span>
          </div>
          </div>
          <span>{remainingGuesses} guesses left</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#d6a653,#f0d9a2)]"
            animate={{ width: `${Math.max(8, progress)}%` }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          />
        </div>
      </div>

      <MindChamberPanel eyebrow="Dialogue" title={isScanningGuess ? "She reaches for the answer." : "Mora asks"}>
        <div className="brand-paper rounded-[1.25rem] p-6 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
            <div>
              <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-[#8a5b24]">SPOKEN THROUGH THE CHAMBER</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={isScanningGuess ? "scanning" : question?.id ?? session.asked.length}
                  initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-3 max-w-3xl font-display text-[2.1rem] leading-[0.97] text-[#2b1a1e] sm:text-5xl md:text-6xl"
                >
                  {isScanningGuess
                    ? "Be still. Mora is gathering everything you have confessed into one clear declaration."
                    : spokenPrompt ?? "The next question is lining up."}
                </motion.p>
              </AnimatePresence>

              <p className="mt-4 text-base leading-7 text-[#4b3430]">
                {isScanningGuess
                  ? "The chamber has stopped asking. Wait for the reveal."
                  : "Reply with the closest truth and let her move to the next thread."}
              </p>
            </div>

            <MascotScene
              compact
              state={mascotState}
              mode="read-my-mind"
              facing={getMascotFacing("read-my-mind")}
              reactionKey={mascotReactionKey}
              className="xl:hidden"
              title={isScanningGuess ? "Mora has a theory." : "Mora watches your answer."}
            />
          </div>
        </div>

        {isScanningGuess ? (
          <div className="rounded-[1.1rem] border border-[rgba(240,217,162,0.14)] bg-[rgba(14,10,21,0.58)] px-4 py-4 text-sm text-[#dbcdb5]">
            Mora leans in. The next beat is a guess, not another question.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {answerOptions.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => onAnswer(option.value)}
                disabled={isPending || !session.currentQuestionId}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.12 }}
                className={cn(
                  "rounded-[1.1rem] border px-4 py-4 text-left text-[#f7efd9] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45",
                  option.tone,
                )}
              >
                <p className="text-lg font-semibold">{option.label}</p>
                <p className="mt-1 text-xs text-[#d4c7b4]">{option.response}</p>
              </motion.button>
            ))}
          </div>
        )}
      </MindChamberPanel>
    </div>
  );
}
