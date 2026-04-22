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
      <div className="rounded-[1.2rem] border border-[rgba(214,166,83,0.16)] bg-[rgba(14,10,21,0.58)] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#dbcdb5]">
          <div>
            <p className="text-[0.68rem] tracking-[0.22em] text-[#d6a653]">THE PSYCHIC HOLDS HER SECRET</p>
            <div className="mt-2 flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-[#d6a653]" />
            <span>{remainingQuestions} questions left</span>
          </div>
          </div>
          <span>{remainingGuesses} guesses left</span>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {activePanelMode === "ask" ? (
          <motion.div
            key="ask-mode"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <MindChamberPanel eyebrow="Dialogue" title="Question the psychic">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-[#dbcdb5]">
                    Ask Mora one clear question at a time. She will answer in character until you think you know what
                    she is hiding.
                  </p>

                  {recentAnswers.length > 0 ? (
                    <div className="space-y-2 rounded-[1.05rem] border border-[rgba(240,217,162,0.12)] bg-[rgba(15,10,21,0.56)] px-4 py-4">
                      <p className="text-[0.68rem] tracking-[0.2em] text-[#d6a653]">RECENT EXCHANGE</p>
                      {recentAnswers.map((entry) => (
                        <div key={entry.questionId} className="space-y-1 text-sm text-[#dbcdb5]">
                          <p className="text-[#f7efd9]">You: {entry.prompt}</p>
                          <p className="text-[#d6a653]">Mora: {formatAnswer(entry)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.05rem] border border-[rgba(240,217,162,0.12)] bg-[rgba(15,10,21,0.56)] px-4 py-4 text-sm text-[#dbcdb5]">
                      Mora is waiting for your first question.
                    </div>
                  )}
                </div>

                <MascotScene
                  compact
                  state={mascotState}
                  mode="guess-my-mind"
                  facing={getMascotFacing("guess-my-mind")}
                  reactionKey={mascotReactionKey}
                  className="xl:hidden"
                  title={latestReply ? "Mora answers." : "Mora keeps her secret."}
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
                  Name her thought
                  <Crosshair className="h-4 w-4" />
                </Button>
                <p className="self-center text-sm text-[#cbbda5]">When the pattern feels narrow enough, move to a guess.</p>
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
            <MindChamberPanel eyebrow="Confrontation" title="Name what she is thinking">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                <p className="text-sm leading-6 text-[#dbcdb5]">
                  Search the cast, choose one answer, and say it aloud to the chamber.
                </p>

                <MascotScene
                  compact
                  state="thinking"
                  mode="guess-my-mind"
                  facing={getMascotFacing("guess-my-mind")}
                  reactionKey={mascotReactionKey}
                  className="xl:hidden"
                  title="She gives nothing away."
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
                <div className="rounded-[1rem] border border-[rgba(240,217,162,0.14)] bg-[rgba(15,10,21,0.56)] px-4 py-4 text-sm text-[#dbcdb5]">
                  {session.wrongGuessIds.length} wrong guess{session.wrongGuessIds.length === 1 ? "" : "es"} already burned in this ritual.
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
                  Speak the guess
                  <SearchCheck className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="ghost"
                  className={cn("sm:order-1", remainingQuestions <= 0 ? "hidden sm:hidden" : "")}
                  onClick={() => setPanelMode("ask")}
                >
                  Back to questions
                </Button>
              </div>
            </MindChamberPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
