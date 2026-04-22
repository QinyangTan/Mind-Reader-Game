"use client";

import Image from "next/image";
import { BrainCircuit, History, Sparkles, Target, Trophy, X } from "lucide-react";

import { ChamberMemorySurface, ResponseWell, SurfacePillButton } from "@/components/game/scene-surfaces";
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
              className="object-cover object-center opacity-82"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,3,8,0.74),rgba(6,3,8,0.34)_35%,rgba(6,3,8,0.78)_100%)]" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1380px] items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <div className="relative w-full max-w-[1080px]">
              <ChamberMemorySurface
                eyebrow="Chamber memory"
                title="The ledger of past rituals"
                description="A record of victories, escapes, learned truths, and the questions that shaped them."
              >
                <div className="absolute right-0 top-0">
                  <SurfacePillButton tone="default" className="px-4 py-2" onClick={() => onOpenChange(false)}>
                    <X className="h-4 w-4" />
                    Close
                  </SurfacePillButton>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <ResponseWell tone="muted">
                      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#d8b36a]">Rituals played</p>
                      <p className="mt-2 text-2xl font-semibold text-[#f6e7bf]">{stats.totalGames}</p>
                    </ResponseWell>
                    <ResponseWell tone="muted">
                      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#d8b36a]">Current streak</p>
                      <p className="mt-2 text-2xl font-semibold text-[#f6e7bf]">{stats.currentStreak}</p>
                    </ResponseWell>
                    <ResponseWell tone="muted">
                      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#d8b36a]">Best streak</p>
                      <p className="mt-2 text-2xl font-semibold text-[#f6e7bf]">{stats.bestStreak}</p>
                    </ResponseWell>
                    <ResponseWell tone="muted">
                      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#d8b36a]">Learned truths</p>
                      <p className="mt-2 text-2xl font-semibold text-[#f6e7bf]">{learnedEntities.length}</p>
                    </ResponseWell>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-[#d8b36a]">
                        <Trophy className="h-4 w-4" />
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em]">Ritual record</p>
                      </div>

                      <div className="space-y-2 rounded-[1.8rem] border border-[rgba(214,174,98,0.18)] bg-[rgba(22,12,31,0.46)] px-4 py-4">
                        {gameModes.map((mode) => {
                          const games = stats.byMode[mode];
                          const wins = stats.winsByMode[mode];
                          return (
                            <div key={mode} className="flex items-center justify-between gap-4 border-b border-[rgba(214,174,98,0.12)] py-2 last:border-b-0">
                              <span className="text-sm text-[#eadbb3]">{modeMeta[mode].label}</span>
                              <span className="text-sm font-medium text-[#f6e7bf]">
                                {wins} / {games}
                                <span className="ml-2 text-xs font-normal text-[#d2c19a]">
                                  {formatPercent(winRateForMode(stats, mode), games > 0)}
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-2 rounded-[1.8rem] border border-[rgba(214,174,98,0.18)] bg-[rgba(22,12,31,0.46)] px-4 py-4">
                        {entityCategories.map((category) => {
                          const games = stats.byCategory[category];
                          return (
                            <div key={category} className="flex items-center justify-between gap-4 border-b border-[rgba(214,174,98,0.12)] py-2 last:border-b-0">
                              <span className="text-sm text-[#eadbb3]">{categoryMeta[category].label}</span>
                              <span className="text-sm font-medium text-[#f6e7bf]">
                                {stats.winsByCategory[category]} / {games}
                                <span className="ml-2 text-xs font-normal text-[#d2c19a]">
                                  {formatPercent(winRateForCategory(stats, category), games > 0)}
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-[#d8b36a]">
                        <Target className="h-4 w-4" />
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em]">Ritual summaries</p>
                      </div>

                      <div className="space-y-2 rounded-[1.8rem] border border-[rgba(214,174,98,0.18)] bg-[rgba(22,12,31,0.46)] px-4 py-4">
                        <div className="flex items-center justify-between gap-4 border-b border-[rgba(214,174,98,0.12)] py-2">
                          <span className="text-sm text-[#eadbb3]">Chamber guess accuracy</span>
                          <span className="text-sm font-medium text-[#f6e7bf]">
                            {formatPercent(systemGuessAccuracy(stats), systemAccuracyHas)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-b border-[rgba(214,174,98,0.12)] py-2">
                          <span className="text-sm text-[#eadbb3]">Your guess accuracy</span>
                          <span className="text-sm font-medium text-[#f6e7bf]">
                            {formatPercent(playerGuessAccuracy(stats), playerAccuracyHas)}
                          </span>
                        </div>
                        {gameModes.map((mode) => {
                          const games = stats.byMode[mode];
                          return (
                            <div key={mode} className="flex items-center justify-between gap-4 border-b border-[rgba(214,174,98,0.12)] py-2 last:border-b-0">
                              <span className="text-sm text-[#eadbb3]">Avg. questions in {modeMeta[mode].label}</span>
                              <span className="text-sm font-medium text-[#f6e7bf]">
                                {formatAverage(averageQuestionsForMode(stats, mode), games > 0)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-2 rounded-[1.8rem] border border-[rgba(214,174,98,0.18)] bg-[rgba(22,12,31,0.46)] px-4 py-4">
                        {difficulties.map((difficulty) => {
                          const games = stats.byDifficulty[difficulty];
                          return (
                            <div key={difficulty} className="flex items-center justify-between gap-4 border-b border-[rgba(214,174,98,0.12)] py-2 last:border-b-0">
                              <span className="text-sm text-[#eadbb3]">{difficultyConfig[difficulty].label}</span>
                              <span className="text-sm font-medium text-[#f6e7bf]">
                                {stats.winsByDifficulty[difficulty]} / {games}
                                <span className="ml-2 text-xs font-normal text-[#d2c19a]">
                                  {formatPercent(winRateForDifficulty(stats, difficulty), games > 0)}
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-[#d8b36a]">
                        <Sparkles className="h-4 w-4" />
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em]">Learned truths</p>
                      </div>
                      <div className="space-y-2 rounded-[1.8rem] border border-[rgba(214,174,98,0.18)] bg-[rgba(22,12,31,0.46)] px-4 py-4">
                        {learnedEntities.length === 0 ? (
                          <p className="text-sm text-[#d7c7a4]">Mora has not been taught any escaped thoughts yet.</p>
                        ) : (
                          learnedEntities.slice(0, 5).map((memory) => (
                            <div key={memory.id} className="border-b border-[rgba(214,174,98,0.12)] py-2 last:border-b-0">
                              <p className="text-sm font-medium text-[#f6e7bf]">{memory.entityName}</p>
                              <p className="mt-1 text-[0.72rem] uppercase tracking-[0.14em] text-[#d8b36a]">
                                {categoryMeta[memory.category].label}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-[#d7c7a4]">{memory.note || "No note provided."}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-[#d8b36a]">
                        <History className="h-4 w-4" />
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em]">Recent rituals</p>
                      </div>
                      <div className="space-y-2 rounded-[1.8rem] border border-[rgba(214,174,98,0.18)] bg-[rgba(22,12,31,0.46)] px-4 py-4">
                        {history.length === 0 ? (
                          <p className="text-sm text-[#d7c7a4]">The ledger is still empty. Finish a ritual and the chamber will remember it.</p>
                        ) : (
                          history.slice(0, 6).map((entry) => {
                            const limits =
                              entry.mode === "read-my-mind"
                                ? difficultyConfig[entry.difficulty].readMyMind
                                : difficultyConfig[entry.difficulty].guessMyMind;

                            return (
                              <div key={entry.id} className="border-b border-[rgba(214,174,98,0.12)] py-2 last:border-b-0">
                                <div className="flex items-center gap-2 text-sm font-medium text-[#f6e7bf]">
                                  {entry.winner === "player" ? (
                                    <Trophy className="h-4 w-4 text-[#d8b36a]" />
                                  ) : (
                                    <BrainCircuit className="h-4 w-4 text-[#d8b36a]" />
                                  )}
                                  {entry.title}
                                </div>
                                <p className="mt-1 text-sm text-[#eadbb3]">
                                  {modeMeta[entry.mode].label} in {categoryMeta[entry.category].label}
                                </p>
                                <p className="mt-1 text-xs text-[#d2c19a]">
                                  {entry.questionsUsed} / {limits.maxQuestions} questions · {entry.guessesUsed} /{" "}
                                  {limits.maxGuesses} guesses
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </ChamberMemorySurface>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
