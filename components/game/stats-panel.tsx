"use client";

import Image from "next/image";
import { BrainCircuit, History, Sparkles, Target, Trophy, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { categoryMeta, difficultyConfig, modeMeta } from "@/lib/game/game-config";
import {
  averageQuestionsForMode,
  playerGuessAccuracy,
  systemGuessAccuracy,
  winRateForCategory,
  winRateForDifficulty,
  winRateForMode,
} from "@/lib/game/storage";
import {
  difficulties,
  entityCategories,
  gameModes,
  type GameStats,
  type HistoryEntry,
  type TeachCase,
} from "@/types/game";

interface StatsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: GameStats;
  history: HistoryEntry[];
  learnedEntities: TeachCase[];
}

function formatPercent(value: number, hasData: boolean) {
  if (!hasData) {
    return "—";
  }
  return `${Math.round(value * 100)}%`;
}

function formatAverage(value: number, hasData: boolean) {
  if (!hasData) {
    return "—";
  }
  return value.toFixed(1);
}

function metricCard(label: string, value: string | number) {
  return (
    <div className="rounded-[1.1rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] px-4 py-4 text-center">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8a5b24]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[#2d1b19]">{value}</p>
    </div>
  );
}

export function StatsPanel({ open, onOpenChange, stats, history, learnedEntities }: StatsPanelProps) {
  const systemAccuracyHas = stats.systemGuessAttempts > 0;
  const playerAccuracyHas = stats.playerGuessAttempts > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] border-none bg-transparent p-0 shadow-none">
        <div className="fixed inset-0 z-50 bg-[rgba(4,2,8,0.84)]">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/scene-pack/archive.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center opacity-80"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,3,8,0.74),rgba(6,3,8,0.34)_35%,rgba(6,3,8,0.78)_100%)]" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1360px] items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <div className="relative w-full max-w-[980px] overflow-hidden rounded-[1.9rem] border border-[rgba(128,86,47,0.9)] bg-[linear-gradient(180deg,rgba(242,228,198,0.98),rgba(220,187,141,0.98)_100%)] p-5 text-[#2d1b19] shadow-[0_40px_110px_rgba(0,0,0,0.62)] sm:p-8">
              <div className="absolute inset-[12px] rounded-[1.45rem] border border-[rgba(252,242,222,0.44)]" />

              <div className="relative space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#8a5b24]">
                      Chamber memory
                    </p>
                    <h2 className="mt-2 font-display text-[2.6rem] leading-[0.92] text-[#2d1b19] sm:text-[3.2rem]">
                      The ledger of past rituals
                    </h2>
                    <p className="mt-3 max-w-[38rem] text-sm leading-6 text-[#5a433b]">
                      A quiet record of victories, escapes, and the truths Mora had to be taught by hand.
                    </p>
                  </div>

                  <Button type="button" size="icon" variant="ghost" onClick={() => onOpenChange(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {metricCard("Rituals played", stats.totalGames)}
                  {metricCard("Current streak", stats.currentStreak)}
                  {metricCard("Best streak", stats.bestStreak)}
                  {metricCard("Learned truths", learnedEntities.length)}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <section className="space-y-3 rounded-[1.3rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] p-4">
                    <div className="flex items-center gap-2 text-[#8a5b24]">
                      <Trophy className="h-4 w-4" />
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em]">Ritual record</p>
                    </div>

                    <div className="grid gap-2 text-sm text-[#4f3830]">
                      {gameModes.map((mode) => {
                        const games = stats.byMode[mode];
                        const wins = stats.winsByMode[mode];
                        return (
                          <div
                            key={mode}
                            className="flex items-center justify-between rounded-[0.95rem] border border-[rgba(111,75,45,0.16)] bg-[rgba(255,255,255,0.24)] px-3 py-3"
                          >
                            <span>{modeMeta[mode].label}</span>
                            <span className="font-semibold text-[#2d1b19]">
                              {wins} / {games}
                              <span className="ml-2 text-xs font-normal text-[#7b5a45]">
                                {formatPercent(winRateForMode(stats, mode), games > 0)}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid gap-2 text-sm text-[#4f3830]">
                      {entityCategories.map((category) => {
                        const games = stats.byCategory[category];
                        return (
                          <div
                            key={category}
                            className="flex items-center justify-between rounded-[0.95rem] border border-[rgba(111,75,45,0.16)] bg-[rgba(255,255,255,0.24)] px-3 py-3"
                          >
                            <span>{categoryMeta[category].label}</span>
                            <span className="font-semibold text-[#2d1b19]">
                              {stats.winsByCategory[category]} / {games}
                              <span className="ml-2 text-xs font-normal text-[#7b5a45]">
                                {formatPercent(winRateForCategory(stats, category), games > 0)}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.3rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] p-4">
                    <div className="flex items-center gap-2 text-[#8a5b24]">
                      <Target className="h-4 w-4" />
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em]">Ritual summaries</p>
                    </div>

                    <div className="grid gap-2 text-sm text-[#4f3830]">
                      <div className="flex items-center justify-between rounded-[0.95rem] border border-[rgba(111,75,45,0.16)] bg-[rgba(255,255,255,0.24)] px-3 py-3">
                        <span>Chamber guess accuracy</span>
                        <span className="font-semibold text-[#2d1b19]">
                          {formatPercent(systemGuessAccuracy(stats), systemAccuracyHas)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-[0.95rem] border border-[rgba(111,75,45,0.16)] bg-[rgba(255,255,255,0.24)] px-3 py-3">
                        <span>Your guess accuracy</span>
                        <span className="font-semibold text-[#2d1b19]">
                          {formatPercent(playerGuessAccuracy(stats), playerAccuracyHas)}
                        </span>
                      </div>
                      {gameModes.map((mode) => {
                        const games = stats.byMode[mode];
                        return (
                          <div
                            key={mode}
                            className="flex items-center justify-between rounded-[0.95rem] border border-[rgba(111,75,45,0.16)] bg-[rgba(255,255,255,0.24)] px-3 py-3"
                          >
                            <span>Avg. questions in {modeMeta[mode].label}</span>
                            <span className="font-semibold text-[#2d1b19]">
                              {formatAverage(averageQuestionsForMode(stats, mode), games > 0)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid gap-2 text-sm text-[#4f3830]">
                      {difficulties.map((difficulty) => {
                        const games = stats.byDifficulty[difficulty];
                        return (
                          <div
                            key={difficulty}
                            className="flex items-center justify-between rounded-[0.95rem] border border-[rgba(111,75,45,0.16)] bg-[rgba(255,255,255,0.24)] px-3 py-3"
                          >
                            <span>{difficultyConfig[difficulty].label}</span>
                            <span className="font-semibold text-[#2d1b19]">
                              {stats.winsByDifficulty[difficulty]} / {games}
                              <span className="ml-2 text-xs font-normal text-[#7b5a45]">
                                {formatPercent(winRateForDifficulty(stats, difficulty), games > 0)}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>

                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <section className="space-y-3 rounded-[1.3rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] p-4">
                    <div className="flex items-center gap-2 text-[#8a5b24]">
                      <Sparkles className="h-4 w-4" />
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em]">Learned truths</p>
                    </div>
                    {learnedEntities.length === 0 ? (
                      <p className="rounded-[0.95rem] border border-dashed border-[rgba(111,75,45,0.2)] bg-[rgba(255,255,255,0.2)] px-4 py-5 text-sm text-[#5a433b]">
                        Mora has not been taught any escaped thoughts yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {learnedEntities.slice(0, 5).map((memory) => (
                          <div
                            key={memory.id}
                            className="rounded-[0.95rem] border border-[rgba(111,75,45,0.16)] bg-[rgba(255,255,255,0.24)] px-3 py-3"
                          >
                            <p className="font-medium text-[#2d1b19]">{memory.entityName}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8a5b24]">
                              {categoryMeta[memory.category].label}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#4f3830]">{memory.note || "No note provided."}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="space-y-3 rounded-[1.3rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] p-4">
                    <div className="flex items-center gap-2 text-[#8a5b24]">
                      <History className="h-4 w-4" />
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em]">Recent rituals</p>
                    </div>
                    {history.length === 0 ? (
                      <p className="rounded-[0.95rem] border border-dashed border-[rgba(111,75,45,0.2)] bg-[rgba(255,255,255,0.2)] px-4 py-5 text-sm text-[#5a433b]">
                        The ledger is still empty. Finish a ritual and the chamber will remember it.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {history.slice(0, 6).map((entry) => {
                          const limits =
                            entry.mode === "read-my-mind"
                              ? difficultyConfig[entry.difficulty].readMyMind
                              : difficultyConfig[entry.difficulty].guessMyMind;

                          return (
                            <div
                              key={entry.id}
                              className="rounded-[0.95rem] border border-[rgba(111,75,45,0.16)] bg-[rgba(255,255,255,0.24)] px-3 py-3"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium text-[#2d1b19]">
                                {entry.winner === "player" ? (
                                  <Trophy className="h-4 w-4 text-[#8a5b24]" />
                                ) : (
                                  <BrainCircuit className="h-4 w-4 text-[#8a5b24]" />
                                )}
                                {entry.title}
                              </div>
                              <p className="mt-1 text-sm text-[#4f3830]">
                                {modeMeta[entry.mode].label} in {categoryMeta[entry.category].label}
                              </p>
                              <p className="mt-2 text-xs text-[#7b5a45]">
                                {entry.questionsUsed} / {limits.maxQuestions} questions · {entry.guessesUsed} /{" "}
                                {limits.maxGuesses} guesses
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
