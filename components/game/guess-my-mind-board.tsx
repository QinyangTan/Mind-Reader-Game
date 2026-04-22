"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, SearchCheck } from "lucide-react";

import { EntityPicker } from "@/components/game/entity-picker";
import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { QuestionBrowser } from "@/components/game/question-browser";
import { Button } from "@/components/ui/button";
import { rankCandidates } from "@/lib/game/scoring";
import { cn } from "@/lib/utils/cn";
import type {
  GameEntity,
  GuessMyMindSession,
  LearnedInferenceModel,
  SystemAnsweredQuestion,
} from "@/types/game";

type PanelMode = "ask" | "guess";

interface GuessMyMindBoardProps {
  session: GuessMyMindSession;
  onAskQuestion: (questionId: string) => void;
  onSubmitGuess: (entityId: string) => void;
  isPending: boolean;
  teachEntities?: Map<string, GameEntity>;
  mascotReactionKey?: number;
  inferenceModel?: LearnedInferenceModel;
}

function formatAnswer(entry: SystemAnsweredQuestion) {
  return entry.entityAnswer.replace("_", " ");
}

export function GuessMyMindBoard({
  session,
  onAskQuestion,
  onSubmitGuess,
  isPending,
  teachEntities,
  inferenceModel,
}: GuessMyMindBoardProps) {
  const [selectedGuessId, setSelectedGuessId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("ask");
  const extraEntities = useMemo(
    () => (teachEntities ? Array.from(teachEntities.values()) : []),
    [teachEntities],
  );
  const remainingQuestions = session.config.maxQuestions - session.asked.length;
  const remainingGuesses = session.config.maxGuesses - session.guessAttemptsUsed;
  const recentAnswers = useMemo(() => session.asked.slice(-2).reverse(), [session.asked]);
  const activePanelMode: PanelMode = remainingQuestions <= 0 ? "guess" : panelMode;
  const latestReply = recentAnswers[0] ?? null;
  const candidateRankings = useMemo(
    () => rankCandidates(session.category, session.asked, session.wrongGuessIds, extraEntities, inferenceModel),
    [extraEntities, inferenceModel, session.asked, session.category, session.wrongGuessIds],
  );

  return (
    <div className="mx-auto max-w-[800px] space-y-4">
      <AnimatePresence mode="wait" initial={false}>
        {activePanelMode === "ask" ? (
          <motion.div
            key="ask-mode"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <MindChamberPanel eyebrow="Question the psychic" title="Ask one clear question.">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#5f463a]">
                <span>{remainingQuestions} questions remain</span>
                <span>{remainingGuesses} guesses remain</span>
              </div>

              <p className="max-w-2xl text-base leading-7 text-[#4f3830]">
                Mora will answer calmly, but every reply still shapes the outline of her hidden thought.
              </p>

              {latestReply ? (
                <div className="rounded-[1.2rem] border border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.08)] px-4 py-4">
                  <p className="text-sm text-[#6e5243]">Your last question</p>
                  <p className="mt-1 text-base font-medium text-[#2d1b19]">{latestReply.prompt}</p>
                  <p className="mt-3 text-sm text-[#6e5243]">Mora replied</p>
                  <p className="mt-1 text-base font-medium capitalize text-[#2d1b19]">{formatAnswer(latestReply)}</p>
                </div>
              ) : (
                <div className="rounded-[1.2rem] border border-[rgba(102,72,52,0.14)] bg-[rgba(84,49,35,0.08)] px-4 py-4 text-sm text-[#5a433b]">
                  Mora is waiting for your first clue question.
                </div>
              )}

              <QuestionBrowser
                category={session.category}
                askedQuestionIds={session.asked.map((entry) => entry.questionId)}
                rankedCandidates={candidateRankings}
                remainingQuestions={remainingQuestions}
                onAskQuestion={onAskQuestion}
                isPending={isPending}
                extraEntities={extraEntities}
                inferenceModel={inferenceModel}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#5a433b]">Move to a guess only when the pattern feels narrow.</p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPanelMode("guess")}
                  disabled={remainingGuesses <= 0}
                >
                  Name her thought
                  <Crosshair className="h-4 w-4" />
                </Button>
              </div>
            </MindChamberPanel>
          </motion.div>
        ) : (
          <motion.div
            key="guess-mode"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <MindChamberPanel eyebrow="Make your declaration" title="Speak the answer aloud.">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#5f463a]">
                <span>{remainingGuesses} guesses remain</span>
                <span>{session.wrongGuessIds.length} already burned</span>
              </div>

              <p className="max-w-2xl text-base leading-7 text-[#4f3830]">
                Search the cast, choose one answer, and confront Mora with it.
              </p>

              <EntityPicker
                category={session.category}
                excludedIds={session.wrongGuessIds}
                selectedId={selectedGuessId}
                onSelect={setSelectedGuessId}
                extraEntities={extraEntities}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  size="lg"
                  disabled={!selectedGuessId || isPending || remainingGuesses <= 0}
                  onClick={() => {
                    if (!selectedGuessId) {
                      return;
                    }

                    onSubmitGuess(selectedGuessId);
                    setSelectedGuessId(null);
                  }}
                >
                  Speak the guess
                  <SearchCheck className="h-4 w-4" />
                </Button>

                {remainingQuestions > 0 ? (
                  <Button
                    type="button"
                    size="lg"
                    variant="ghost"
                    className={cn("sm:order-first")}
                    onClick={() => setPanelMode("ask")}
                  >
                    Back to questions
                  </Button>
                ) : null}
              </div>
            </MindChamberPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
