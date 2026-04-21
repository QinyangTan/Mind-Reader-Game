"use client";

import { useState } from "react";
import { BrainCircuit, RotateCcw, Sparkles, Trophy, WandSparkles } from "lucide-react";

import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { entityById } from "@/lib/data/entities";
import type { GameResult } from "@/types/game";

interface ResultScreenProps {
  result: GameResult;
  onPlayAgain: () => void;
  onBackToSetup: () => void;
  onTeach: (entityName: string, note: string) => void;
  teachSaved: boolean;
}

export function ResultScreen({
  result,
  onPlayAgain,
  onBackToSetup,
  onTeach,
  teachSaved,
}: ResultScreenProps) {
  const entity = result.revealedEntityId ? entityById.get(result.revealedEntityId) : null;
  const [entityName, setEntityName] = useState("");
  const [note, setNote] = useState("");
  const isPlayerWin = result.winner === "player";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <MindChamberPanel eyebrow="Session outcome" title={result.title} tone={isPlayerWin ? "violet" : "cyan"}>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.12),transparent_42%),rgba(255,255,255,0.04)] p-6">
          <div className="flex flex-wrap items-center gap-3 text-[0.68rem] uppercase tracking-[0.28em] text-slate-300">
            {isPlayerWin ? <Trophy className="h-4 w-4 text-emerald-200" /> : <BrainCircuit className="h-4 w-4 text-cyan-200" />}
            {isPlayerWin ? "Player victory" : "System victory"}
          </div>
          <p className="mt-4 max-w-2xl font-display text-5xl leading-tight text-white">
            {entity ? (
              <>
                {entity.imageEmoji} {entity.name}
              </>
            ) : (
              "Unrevealed thought pattern"
            )}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{result.message}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Questions used</p>
            <p className="mt-2 text-3xl font-semibold text-white">{result.questionsUsed}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Guesses used</p>
            <p className="mt-2 text-3xl font-semibold text-white">{result.guessesUsed}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Mode</p>
            <p className="mt-2 text-lg font-semibold text-white">{result.mode === "read-my-mind" ? "Read My Mind" : "Guess My Mind"}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={onPlayAgain}>
            Play again
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="secondary" onClick={onBackToSetup}>
            Change ritual
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </MindChamberPanel>

      <MindChamberPanel eyebrow="After-action memory" title={result.teachable ? "Teach the chamber" : "Signal residue"} tone="emerald">
        {result.teachable ? (
          <div className="space-y-4">
            <p className="text-sm leading-7 text-slate-300">
              The chamber missed. Tell it who you were thinking of and add one useful note so this round lives in
              its local memory vault.
            </p>
            <Input
              value={entityName}
              onChange={(event) => setEntityName(event.target.value)}
              placeholder="Correct entity name"
            />
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="One distinguishing note or useful trait"
              rows={5}
              className="w-full rounded-[1.6rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-slate-100 outline-none transition duration-300 placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10 focus:ring-2 focus:ring-cyan-300/20"
            />
            <Button
              size="lg"
              className="w-full"
              disabled={!entityName.trim() || teachSaved}
              onClick={() => onTeach(entityName.trim(), note.trim())}
            >
              <WandSparkles className="h-4 w-4" />
              {teachSaved ? "Stored in the archive" : "Store in memory"}
            </Button>
            {teachSaved ? (
              <div className="rounded-[1.5rem] border border-emerald-200/16 bg-emerald-300/10 px-4 py-4 text-sm text-emerald-100">
                Saved. The chamber now remembers this escape in local storage.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4 rounded-[1.8rem] border border-white/10 bg-white/4 p-5">
            <p className="text-sm leading-7 text-slate-300">
              The signal ended cleanly. Run another round to build streaks, sharpen your archive, and pressure-test
              the chamber again.
            </p>
            {entity ? (
              <div className="rounded-[1.5rem] border border-white/8 bg-white/4 px-4 py-4">
                <p className="font-medium text-white">
                  {entity.imageEmoji} {entity.name}
                </p>
                <p className="mt-2 text-sm text-slate-400">{entity.shortDescription}</p>
              </div>
            ) : null}
          </div>
        )}
      </MindChamberPanel>
    </div>
  );
}
