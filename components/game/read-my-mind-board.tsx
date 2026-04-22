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
  tone: string;
}> = [
  {
    value: "yes",
    label: "Yes",
    tone: "border-[#8bb19a]/34 bg-[rgba(22,41,33,0.8)] hover:bg-[rgba(33,55,44,0.88)]",
  },
  {
    value: "probably",
    label: "Probably",
    tone: "border-[#8faeb8]/34 bg-[rgba(22,38,46,0.82)] hover:bg-[rgba(31,49,58,0.9)]",
  },
  {
    value: "unknown",
    label: "Unknown",
    tone: "border-[rgba(240,217,162,0.16)] bg-[rgba(21,12,28,0.82)] hover:bg-[rgba(29,16,38,0.9)]",
  },
  {
    value: "probably_not",
    label: "Probably Not",
    tone: "border-[#8d729f]/32 bg-[rgba(36,24,51,0.82)] hover:bg-[rgba(47,31,65,0.9)]",
  },
  {
    value: "no",
    label: "No",
    tone: "border-[#b7777d]/34 bg-[rgba(54,24,34,0.84)] hover:bg-[rgba(67,29,42,0.9)]",
  },
];

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

  return (
    <div className="mx-auto max-w-[880px] space-y-5">
      <div className="rounded-[1.4rem] border border-[rgba(214,166,83,0.18)] bg-[rgba(18,10,24,0.52)] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#dbcdb5]">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-[#d6a653]" />
            <span>
              Question {currentQuestionNumber} of {session.config.maxQuestions}
            </span>
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

      <MindChamberPanel title={isScanningGuess ? "Scanning the room" : "Answer the probe"}>
        <div className="brand-paper rounded-[1.6rem] p-6 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
            <div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={isScanningGuess ? "scanning" : question?.id ?? session.asked.length}
                  initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-3xl font-display text-[2.2rem] leading-[0.95] text-[#2b1a1e] sm:text-5xl md:text-6xl"
                >
                  {isScanningGuess
                    ? "Hold still. Mora is turning your answers into a reveal."
                    : question?.question ?? "The next probe is lining up."}
                </motion.p>
              </AnimatePresence>

              <p className="mt-4 text-base leading-7 text-[#4b3430]">
                {isScanningGuess
                  ? "The answer buttons pause here while the chamber decides whether to make its guess."
                  : "Choose the answer that fits best and move on."}
              </p>
            </div>

            <MascotScene
              compact
              state={mascotState}
              mode="read-my-mind"
              facing={getMascotFacing("read-my-mind")}
              reactionKey={mascotReactionKey}
              className="xl:hidden"
              title={isScanningGuess ? "Mora has a theory." : undefined}
            />
          </div>
        </div>

        {isScanningGuess ? (
          <div className="rounded-[1.3rem] border border-[rgba(240,217,162,0.16)] bg-[rgba(18,10,24,0.46)] px-4 py-4 text-sm text-[#dbcdb5]">
            Mora is stepping toward a dramatic guess.
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
                  "rounded-[1.3rem] border px-4 py-4 text-left text-[#f7efd9] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45",
                  option.tone,
                )}
              >
                <p className="text-lg font-semibold">{option.label}</p>
              </motion.button>
            ))}
          </div>
        )}
      </MindChamberPanel>
    </div>
  );
}
