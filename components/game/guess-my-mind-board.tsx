"use client";

import { useState } from "react";
import { Crosshair, History, MessageSquareText, SearchCheck, ShieldAlert } from "lucide-react";

import { EntityPicker } from "@/components/game/entity-picker";
import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { Button } from "@/components/ui/button";
import { entityById, getQuestionsForCategory } from "@/lib/data/entities";
import { cn } from "@/lib/utils/cn";
import type { GuessMyMindSession, NormalizedAnswer } from "@/types/game";

const answerBadgeStyles: Record<NormalizedAnswer, string> = {
  yes: "bg-emerald-300/14 text-emerald-100 border-emerald-200/18",
  probably: "bg-cyan-300/14 text-cyan-100 border-cyan-200/18",
  unknown: "bg-white/10 text-slate-200 border-white/12",
  probably_not: "bg-violet-300/14 text-violet-100 border-violet-200/18",
  no: "bg-rose-300/14 text-rose-100 border-rose-200/18",
};

interface GuessMyMindBoardProps {
  session: GuessMyMindSession;
  onAskQuestion: (questionId: string) => void;
  onSubmitGuess: (entityId: string) => void;
  isPending: boolean;
}

export function GuessMyMindBoard({
  session,
  onAskQuestion,
  onSubmitGuess,
  isPending,
}: GuessMyMindBoardProps) {
  const [selectedGuessId, setSelectedGuessId] = useState<string | null>(null);
  const availableQuestions = getQuestionsForCategory(session.category).filter(
    (question) => !session.asked.some((entry) => entry.questionId === question.id),
  );
  const remainingQuestions = session.config.maxQuestions - session.asked.length;
  const remainingGuesses = session.config.maxGuesses - session.guessAttemptsUsed;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.05fr_0.95fr]">
      <MindChamberPanel eyebrow="Question bank" title="Interrogate the signal">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Questions left</p>
            <p className="text-2xl font-semibold text-white">{remainingQuestions}</p>
          </div>
          <MessageSquareText className="h-5 w-5 text-cyan-200" />
        </div>

        <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
          {availableQuestions.map((question) => (
            <button
              key={question.id}
              type="button"
              onClick={() => onAskQuestion(question.id)}
              disabled={isPending || remainingQuestions <= 0}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-left transition duration-300 hover:border-cyan-300/24 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{question.label}</p>
              <p className="mt-2 text-sm leading-7 text-white">{question.question}</p>
            </button>
          ))}
        </div>

        {remainingQuestions <= 0 ? (
          <div className="rounded-[1.5rem] border border-fuchsia-300/18 bg-fuchsia-300/8 px-4 py-4 text-sm text-fuchsia-100">
            No more questions. The chamber will answer only to guesses now.
          </div>
        ) : null}
      </MindChamberPanel>

      <MindChamberPanel eyebrow="Answer trail" title="What the chamber has admitted" tone="violet">
        <div className="space-y-3">
          {session.asked.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/4 px-4 py-6 text-sm text-slate-400">
              Ask a question from the bank and the chamber will answer with a calibrated signal.
            </div>
          ) : (
            session.asked
              .slice()
              .reverse()
              .map((entry) => (
                <div key={`${entry.questionId}-${entry.askedAt}`} className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm leading-7 text-white">{entry.prompt}</p>
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em]",
                        answerBadgeStyles[entry.entityAnswer],
                      )}
                    >
                      {entry.entityAnswer.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <History className="h-4 w-4 text-cyan-200" />
            Wrong guesses stay unavailable so you do not burn the same attempt twice.
          </div>
        </div>
      </MindChamberPanel>

      <MindChamberPanel eyebrow="Guess chamber" title="Name the hidden entity" tone="emerald">
        <div className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_42%),rgba(255,255,255,0.04)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Guesses left</p>
              <p className="text-3xl font-semibold text-white">{remainingGuesses}</p>
            </div>
            <Crosshair className="h-5 w-5 text-emerald-200" />
          </div>
          <p className="text-sm leading-7 text-slate-300">
            Search the archive, choose one entity, and fire your guess whenever the clues feel strong enough.
          </p>
        </div>

        <EntityPicker
          category={session.category}
          excludedIds={session.wrongGuessIds}
          selectedId={selectedGuessId}
          onSelect={setSelectedGuessId}
        />

        <Button
          size="lg"
          className="w-full"
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

        <div className="space-y-3">
          {session.wrongGuessIds.length > 0 ? (
            <div className="rounded-[1.5rem] border border-rose-200/12 bg-rose-300/8 px-4 py-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-rose-100">
                <ShieldAlert className="h-4 w-4" />
                Missed guesses
              </div>
              <div className="flex flex-wrap gap-2">
                {session.wrongGuessIds.map((guessId) => (
                  <span
                    key={guessId}
                    className="rounded-full border border-rose-200/18 bg-rose-300/12 px-3 py-1 text-xs uppercase tracking-[0.22em] text-rose-100"
                  >
                    {entityById.get(guessId)?.name ?? "Unknown"}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </MindChamberPanel>
    </div>
  );
}
