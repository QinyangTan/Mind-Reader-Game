"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, SearchCheck } from "lucide-react";

import { EntityPicker } from "@/components/game/entity-picker";
import { InquirySurface, RitualProgress, SurfacePillButton } from "@/components/game/scene-surfaces";
import { QuestionBrowser } from "@/components/game/question-browser";
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
    <div className="mx-auto w-full max-w-[920px]">
      <AnimatePresence mode="wait" initial={false}>
        {activePanelMode === "ask" ? (
          <motion.div
            key="ask-mode"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <InquirySurface
              eyebrow="Read Mora instead"
              title="Choose your line of inquiry"
              footer={
                <RitualProgress
                  label={`Question ${Math.min(session.asked.length + 1, session.config.maxQuestions)} of ${session.config.maxQuestions}`}
                  value={(session.asked.length / session.config.maxQuestions) * 100}
                />
              }
            >
              <div className="space-y-5">
                <div className="space-y-2 text-center">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">Response</p>
                  {latestReply ? (
                    <>
                      <p className="text-sm leading-6 text-[#d7c7a4]">{latestReply.prompt}</p>
                      <p className="font-display text-[1.8rem] capitalize leading-none text-[#f6e7bf] sm:text-[2.2rem]">
                        {formatAnswer(latestReply)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm leading-6 text-[#d7c7a4]">
                      Mora’s thought is hidden. Ask a first clue and let her answer in her own way.
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

                <div className="flex flex-col items-center gap-3 pt-1 sm:flex-row sm:justify-between">
                  <p className="text-sm text-[#d7c7a4]">When the shape feels narrow, declare the answer aloud.</p>
                  <SurfacePillButton
                    tone="accent"
                    className="px-6 py-3 text-base"
                    onClick={() => setPanelMode("guess")}
                    disabled={remainingGuesses <= 0}
                  >
                    Name her thought
                    <Crosshair className="h-4 w-4" />
                  </SurfacePillButton>
                </div>
              </div>
            </InquirySurface>
          </motion.div>
        ) : (
          <motion.div
            key="guess-mode"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <InquirySurface
              eyebrow="Make your declaration"
              title="Speak Mora’s hidden thought"
              footer={<RitualProgress label={`${remainingGuesses} guesses remain`} />}
            >
              <div className="space-y-5">
                <p className="text-center text-sm leading-7 text-[#d7c7a4]">
                  Search the cast, choose one answer, and test whether you can read Mora back.
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
                    <SurfacePillButton tone="default" className="px-5 py-3" onClick={() => setPanelMode("ask")}>
                      Return to questions
                    </SurfacePillButton>
                  ) : (
                    <p className="text-sm text-[#d7c7a4]">No questions remain. Only the guess matters now.</p>
                  )}

                  <SurfacePillButton
                    tone="accent"
                    className="px-6 py-3 text-base"
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
                  </SurfacePillButton>
                </div>
              </div>
            </InquirySurface>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
