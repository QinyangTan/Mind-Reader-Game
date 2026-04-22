"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, MessageSquareText, SearchCheck } from "lucide-react";

import { MascotScene } from "@/components/brand/mascot-scene";
import { EntityPicker } from "@/components/game/entity-picker";
import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { QuestionBrowser } from "@/components/game/question-browser";
import { Button } from "@/components/ui/button";
import { getMascotFacing, getQuestionMascotState } from "@/lib/game/mascot";
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
  mascotReactionKey,
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
  const recentAnswers = useMemo(() => session.asked.slice(-3).reverse(), [session.asked]);
  const activePanelMode: PanelMode = remainingQuestions <= 0 ? "guess" : panelMode;
  const latestReply = recentAnswers[0] ?? null;
  const candidateRankings = useMemo(
    () => rankCandidates(session.category, session.asked, session.wrongGuessIds, extraEntities, inferenceModel),
    [extraEntities, inferenceModel, session.asked, session.category, session.wrongGuessIds],
  );
  const mascotState = getQuestionMascotState({
    mode: "guess-my-mind",
    isPending,
  });

  return (
    <div className="mx-auto max-w-[940px] space-y-5">
      <div className="rounded-[1.4rem] border border-[rgba(214,166,83,0.18)] bg-[rgba(18,10,24,0.52)] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#dbcdb5]">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-[#d6a653]" />
            <span>{remainingQuestions} questions left</span>
          </div>
          <span>{remainingGuesses} guesses left</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activePanelMode === "ask" ? (
          <motion.div
            key="ask-mode"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <MindChamberPanel title="Pick one clue">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                {latestReply ? (
                  <div className="rounded-[1.1rem] border border-[rgba(240,217,162,0.14)] bg-[rgba(18,10,24,0.44)] px-4 py-3 text-sm text-[#dbcdb5]">
                    Latest reply: <span className="text-[#f7efd9]">{latestReply.prompt}</span>
                    <span className="mx-2 text-[#7c6f62]">·</span>
                    <span className="text-[#d6a653]">{formatAnswer(latestReply)}</span>
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-[#dbcdb5]">
                    Start with one clue. The chamber answers after every question.
                  </p>
                )}

                <MascotScene
                  compact
                  state={mascotState}
                  mode="guess-my-mind"
                  facing={getMascotFacing("guess-my-mind")}
                  reactionKey={mascotReactionKey}
                  className="xl:hidden"
                  title={latestReply ? "Mora answers." : undefined}
                />
              </div>

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

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPanelMode("guess")}
                  disabled={remainingGuesses <= 0}
                >
                  Make a guess
                  <Crosshair className="h-4 w-4" />
                </Button>
                <p className="self-center text-sm text-[#cbbda5]">Ask one clue, then decide whether to guess.</p>
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
            <MindChamberPanel title="Make your guess">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                <p className="text-sm leading-6 text-[#dbcdb5]">
                  Search the cast, choose one entity, and commit to the reveal.
                </p>

                <MascotScene
                  compact
                  state="thinking"
                  mode="guess-my-mind"
                  facing={getMascotFacing("guess-my-mind")}
                  reactionKey={mascotReactionKey}
                  className="xl:hidden"
                  title="The cast is narrowing."
                />
              </div>

              <EntityPicker
                category={session.category}
                excludedIds={session.wrongGuessIds}
                selectedId={selectedGuessId}
                onSelect={setSelectedGuessId}
                extraEntities={extraEntities}
              />

              {session.wrongGuessIds.length > 0 ? (
                <div className="rounded-[1.2rem] border border-[rgba(240,217,162,0.14)] bg-[rgba(18,10,24,0.46)] px-4 py-4 text-sm text-[#dbcdb5]">
                  {session.wrongGuessIds.length} wrong guess{session.wrongGuessIds.length === 1 ? "" : "es"} already burned in this round.
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="sm:order-2"
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
                <Button
                  type="button"
                  size="lg"
                  variant="ghost"
                  className={cn("sm:order-1", remainingQuestions <= 0 ? "hidden sm:hidden" : "")}
                  onClick={() => setPanelMode("ask")}
                >
                  Back to clues
                </Button>
              </div>
            </MindChamberPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
