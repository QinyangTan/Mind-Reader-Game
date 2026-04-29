"use client";

import { AnimatePresence, motion } from "framer-motion";

import {
  MoraDialogueSurface,
  RitualProgress,
  SurfacePillButton,
} from "@/components/game/scene-surfaces";
import { questionById } from "@/lib/data/questions";
import type { NormalizedAnswer, ReadMyMindSession } from "@/types/game";

const answerOptions: Array<{
  value: NormalizedAnswer;
  label: string;
  tone: "accent" | "default" | "soft";
}> = [
  { value: "yes", label: "Yes", tone: "accent" },
  { value: "no", label: "No", tone: "default" },
  { value: "probably", label: "Probably", tone: "soft" },
  { value: "probably_not", label: "Probably Not", tone: "soft" },
  { value: "unknown", label: "Don’t Know", tone: "default" },
];

function toSpokenPrompt(prompt: string, questionIndex: number) {
  const openers = [
    "Tell me...",
    "Stay with me...",
    "No, the vision shifts...",
    "One more angle...",
    "The outline sharpens...",
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
  const currentQuestionNumber = Math.min(session.asked.length + 1, session.config.maxQuestions);
  const progress = (session.asked.length / session.config.maxQuestions) * 100;
  const spokenPrompt = question ? toSpokenPrompt(question.question, session.asked.length) : null;

  return (
    <div className="mx-auto w-full max-w-[860px]">
      <MoraDialogueSurface
        eyebrow={isScanningGuess ? "The reveal gathers" : "Mora asks"}
        title={isScanningGuess ? "She has seen enough." : spokenPrompt ?? "The next question is arriving."}
        footer={
          <RitualProgress
            label={`Question ${currentQuestionNumber} of ${session.config.maxQuestions}`}
            value={progress}
          />
        }
      >
        <AnimatePresence mode="wait">
          {isScanningGuess ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4 text-center"
            >
              <p className="text-base leading-7 text-[#d8c8a8] sm:text-lg">
                The chamber has gone still. Mora is turning every answer into one final declaration.
              </p>
              <div className="flex justify-center">
                <div className="rounded-full border border-[rgba(226,192,118,0.28)] bg-[rgba(26,14,36,0.78)] px-5 py-2 text-sm text-[#eadbb3]">
                  She is ready to speak.
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={question?.id ?? session.asked.length}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              <div className="mx-auto flex max-w-[44rem] flex-wrap items-center justify-center gap-3">
                {answerOptions.map((option) => (
                  <SurfacePillButton
                    key={option.value}
                    tone={option.tone}
                    surface="choice"
                    className="min-w-[9rem] px-4 py-3 text-base"
                    disabled={isPending || !session.currentQuestionId}
                    onClick={() => onAnswer(option.value)}
                  >
                    {option.label}
                  </SurfacePillButton>
                ))}
              </div>
              {isPending ? (
                <p className="text-center text-xs uppercase tracking-[0.18em] text-[#d8b36a]">
                  Mora is reading the next thread...
                </p>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </MoraDialogueSurface>
    </div>
  );
}
