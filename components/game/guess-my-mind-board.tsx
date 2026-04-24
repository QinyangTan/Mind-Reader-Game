"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, SearchCheck } from "lucide-react";

import { EntityPicker } from "@/components/game/entity-picker";
import { InquirySurface, ResponseWell, RitualProgress, SurfacePillButton } from "@/components/game/scene-surfaces";
import { QuestionBrowser } from "@/components/game/question-browser";
import {
  computeInferenceRanking,
  type InferenceRankingResult,
} from "@/lib/game/inference-worker-client";
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
  const earlierReplies = recentAnswers.slice(1);
  const rankingRequestKey = useMemo(
    () =>
      JSON.stringify({
        category: session.category,
        asked: session.asked.map((entry) => [entry.questionId, entry.entityAnswer]),
        rejected: session.wrongGuessIds,
        remainingQuestions,
        extraEntities: extraEntities.map((entity) => entity.id),
        learnedVersion: inferenceModel?.version ?? 0,
      }),
    [
      extraEntities,
      inferenceModel?.version,
      remainingQuestions,
      session.asked,
      session.category,
      session.wrongGuessIds,
    ],
  );
  const [inference, setInference] = useState<{
    key: string;
    result: InferenceRankingResult;
  } | null>(null);
  const rankingPending = inference?.key !== rankingRequestKey;
  const guessUnlocked =
    session.asked.length >= 3 ||
    remainingQuestions <= Math.ceil(session.config.maxQuestions / 2) ||
    remainingQuestions <= 0;

  useEffect(() => {
    let active = true;

    void computeInferenceRanking({
      category: session.category,
      asked: session.asked,
      rejectedGuessIds: session.wrongGuessIds,
      askedQuestionIds: session.asked.map((entry) => entry.questionId),
      remainingQuestions,
      extraEntities,
      inferenceModel,
    }).then((result) => {
      if (!active) {
        return;
      }
      setInference({ key: rankingRequestKey, result });
    });

    return () => {
      active = false;
    };
  }, [
    extraEntities,
    inferenceModel,
    rankingRequestKey,
    remainingQuestions,
    session.asked,
    session.category,
    session.wrongGuessIds,
  ]);

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
                  <ResponseWell className="mx-auto max-w-[38rem]">
                    {latestReply ? (
                      <div className="space-y-3">
                        <p className="text-sm leading-6 text-[#d7c7a4]">{latestReply.prompt}</p>
                        <p className="font-display text-[1.45rem] leading-[1.05] text-[#f6e7bf] sm:text-[1.8rem]">
                          {formatAnswer(latestReply)}
                        </p>
                        {earlierReplies.length > 0 ? (
                          <div className="mx-auto grid max-w-[30rem] gap-1 border-t border-[rgba(214,174,98,0.12)] pt-3 text-left">
                            {earlierReplies.map((entry) => (
                              <div
                                key={entry.questionId}
                                className="flex items-center justify-between gap-3 text-xs text-[#bdaf8f]"
                              >
                                <span className="truncate">{entry.prompt}</span>
                                <span className="shrink-0 text-[#eadbb3]">{formatAnswer(entry)}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-sm leading-6 text-[#d7c7a4]">
                        Mora’s thought is hidden. Ask a first clue and let her answer in her own way.
                      </p>
                    )}
                  </ResponseWell>
                </div>

                <QuestionBrowser
                  category={session.category}
                  askedQuestionIds={session.asked.map((entry) => entry.questionId)}
                  rankedCandidates={inference?.result.rankedCandidates ?? []}
                  rankedQuestionOptions={inference?.result.rankedQuestions}
                  remainingQuestions={remainingQuestions}
                  onAskQuestion={onAskQuestion}
                  isPending={isPending || rankingPending}
                  isRanking={rankingPending}
                  extraEntities={extraEntities}
                  inferenceModel={inferenceModel}
                />

                <div className="flex flex-col items-center gap-3 pt-1 sm:flex-row sm:justify-between">
                  <p className="text-sm text-[#d7c7a4]">
                    {guessUnlocked
                      ? "The shape is narrowing. You can keep probing or name the hidden thought."
                      : "Ask a couple of clues before making the declaration."}
                  </p>
                  {guessUnlocked ? (
                    <SurfacePillButton
                      tone="accent"
                      surface="choice"
                      className="px-6 py-3 text-base"
                      onClick={() => setPanelMode("guess")}
                      disabled={remainingGuesses <= 0}
                    >
                      Name her thought
                      <Crosshair className="h-4 w-4" />
                    </SurfacePillButton>
                  ) : null}
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
                    <SurfacePillButton tone="default" surface="choice" className="px-5 py-3" onClick={() => setPanelMode("ask")}>
                      Return to questions
                    </SurfacePillButton>
                  ) : (
                    <p className="text-sm text-[#d7c7a4]">No questions remain. Only the guess matters now.</p>
                  )}

                  <SurfacePillButton
                    tone="accent"
                    surface="choice"
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
