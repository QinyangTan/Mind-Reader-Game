"use client";

import { BrainCircuit, History, Trophy } from "lucide-react";

import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categoryMeta, modeMeta } from "@/lib/game/game-config";
import type { GameStats, HistoryEntry, TeachCase } from "@/types/game";

interface StatsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: GameStats;
  history: HistoryEntry[];
  teachCases: TeachCase[];
}

export function StatsPanel({ open, onOpenChange, stats, history, teachCases }: StatsPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Psychic Archive</DialogTitle>
          <DialogDescription>
            Persistent chamber memory, streaks, and the latest entities that escaped or were exposed.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <MindChamberPanel eyebrow="Lifetime telemetry" title="Session Record">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Games played</p>
                <p className="mt-2 font-display text-4xl text-white">{stats.totalGames}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Current streak</p>
                <p className="mt-2 font-display text-4xl text-white">{stats.currentStreak}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Player wins</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-200">{stats.playerWins}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">System wins</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-200">{stats.systemWins}</p>
              </div>
            </div>
            <div className="grid gap-3 pt-2 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <span>Best streak</span>
                <span className="font-semibold text-white">{stats.bestStreak}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <span>Read My Mind rounds</span>
                <span className="font-semibold text-white">{stats.byMode["read-my-mind"]}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <span>Guess My Mind rounds</span>
                <span className="font-semibold text-white">{stats.byMode["guess-my-mind"]}</span>
              </div>
            </div>
          </MindChamberPanel>

          <MindChamberPanel eyebrow="Taught memory" title="Escaped Entities" tone="violet">
            {teachCases.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/4 px-4 py-6 text-sm text-slate-400">
                The chamber has not been taught any misses yet.
              </div>
            ) : (
              <div className="space-y-3">
                {teachCases.slice(0, 6).map((memory) => (
                  <div key={memory.id} className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{memory.entityName}</p>
                      <span className="text-[0.65rem] uppercase tracking-[0.22em] text-fuchsia-200/80">
                        {categoryMeta[memory.category].label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{memory.note || "No note provided."}</p>
                  </div>
                ))}
              </div>
            )}
          </MindChamberPanel>
        </div>

        <MindChamberPanel eyebrow="Recent rounds" title="Session Timeline" className="mt-4" tone="emerald">
          {history.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/4 px-4 py-6 text-sm text-slate-400">
              Your archive is still blank. Run a session and the chamber will start keeping score.
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 8).map((entry) => (
                <div
                  key={entry.id}
                  className="grid gap-3 rounded-[1.5rem] border border-white/8 bg-white/4 p-4 md:grid-cols-[1fr_auto]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      {entry.winner === "player" ? (
                        <Trophy className="h-4 w-4 text-emerald-200" />
                      ) : (
                        <BrainCircuit className="h-4 w-4 text-cyan-200" />
                      )}
                      {entry.title}
                    </div>
                    <p className="text-sm text-slate-300">
                      {modeMeta[entry.mode].label} in {categoryMeta[entry.category].label}
                      {entry.revealedEntityName ? ` • ${entry.revealedEntityName}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs uppercase tracking-[0.22em] text-slate-400">
                    <span>{entry.questionsUsed} Q</span>
                    <span>{entry.guessesUsed} G</span>
                    <span className="flex items-center gap-2">
                      <History className="h-3.5 w-3.5" />
                      {new Date(entry.playedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </MindChamberPanel>
      </DialogContent>
    </Dialog>
  );
}
