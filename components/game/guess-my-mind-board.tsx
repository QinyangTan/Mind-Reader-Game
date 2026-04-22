"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, SearchCheck } from "lucide-react";

import { EntityPicker } from "@/components/game/entity-picker";
import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { QuestionBrowser } from "@/components/game/question-browser";
import { Button } from "@/components/ui/button";
import { rankCandidates } from "@/lib/game/scoring";
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
  const recentAnswers = useMemo(() => session.asked.slice(-3).reverse(), [session.asked]);
  const activePanelMode: PanelMode = remainingQuestions <= 0 ? "guess" : panelMode;
  const latestReply = recentAnswers[0] ?? null;
  const candidateRankings = useMemo(
    () => rankCandidates(session.category, session.asked, session.wrongGuessIds, extraEntities, inferenceModel),
    [extraEntities, inferenceModel, session.asked, session.category, session.wrongGuessIds],
  );

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <AnimatePresence mode="wait" initial={false}>
        {activePanelMode === "ask" ? (
          <motion.div
            key="ask-mode"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <MindChamberPanel eyebrow="Read Mora instead" title="Ask one clean clue at a time.">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#5b4034]">
                  <span>{remainingQuestions} questions remain</span>
                  <span>{remainingGuesses} guesses remain</span>
                </div>

                <div className="rounded-[1.15rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] p-4">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8a5b24]">
                    Mora’s latest reply
                  </p>
                  {latestReply ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-[#6a4a3c]">{latestReply.prompt}</p>
                      <p className="font-display text-[2rem] capitalize leading-none text-[#2d1b19] sm:text-[2.35rem]">
                        {formatAnswer(latestReply)}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-[#5a433b]">
                      Her thought is hidden. Ask a first clue and listen carefully.
                    </p>
                  )}
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

                <div className="flex flex-col items-center gap-3 border-t border-[rgba(111,75,45,0.16)] pt-2 sm:flex-row sm:justify-between">
                  <p className="text-sm text-[#5a433b]">Switch to a guess only when the pattern feels narrow.</p>
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
            <MindChamberPanel eyebrow="Make your declaration" title="Speak the hidden thought aloud.">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#5b4034]">
                  <span>{remainingGuesses} guesses remain</span>
                  <span>{session.wrongGuessIds.length} burned already</span>
                </div>

                <p className="text-center text-base leading-7 text-[#4d352c] sm:text-lg">
                  Search the field, choose one answer, and test whether you can read Mora back.
                </p>

                <EntityPicker
                  category={session.category}
                  excludedIds={session.wrongGuessIds}
                  selectedId={selectedGuessId}
                  onSelect={setSelectedGuessId}
                  extraEntities={extraEntities}
                />

                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                  {remainingQuestions > 0 ? (
                    <Button type="button" variant="ghost" onClick={() => setPanelMode("ask")}>
                      Return to questions
                    </Button>
                  ) : (
                    <span className="text-sm text-[#5a433b]">No questions remain. Only the guess matters now.</span>
                  )}

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
                </div>
              </div>
            </MindChamberPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
