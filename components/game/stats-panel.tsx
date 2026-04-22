"use client";

import { BrainCircuit, Gauge, History, Sparkles, Target, Trophy } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <BrandLogo compact withTagline className="mb-2" />
          <DialogTitle>Psychic Archive</DialogTitle>
          <DialogDescription>
            Persistent parlor memory, streaks, and the latest entities that escaped or were exposed.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <MindChamberPanel eyebrow="Session record" title="Lifetime record">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Games played</p>
                <p className="mt-2 text-4xl font-semibold text-white">{stats.totalGames}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Current streak</p>
                <p className="mt-2 text-4xl font-semibold text-white">{stats.currentStreak}</p>
              </div>
              <div className="brand-paper rounded-[1.2rem] p-4">
                <p className="text-xs text-[#8a5b24]">Player wins</p>
                <p className="mt-2 text-2xl font-semibold text-[#2b1a1e]">{stats.playerWins}</p>
              </div>
              <div className="brand-paper rounded-[1.2rem] p-4">
                <p className="text-xs text-[#8a5b24]">System wins</p>
                <p className="mt-2 text-2xl font-semibold text-[#2b1a1e]">{stats.systemWins}</p>
              </div>
            </div>
            <div className="grid gap-3 pt-2 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-slate-950/56 px-4 py-3">
                <span>Best streak</span>
                <span className="font-semibold text-white">{stats.bestStreak}</span>
              </div>
              {gameModes.map((mode) => {
                const games = stats.byMode[mode];
                const wins = stats.winsByMode[mode];
                return (
                  <div
                    key={mode}
                    className="flex items-center justify-between rounded-xl border border-white/8 bg-slate-950/56 px-4 py-3"
                  >
                    <span>{modeMeta[mode].label} rounds</span>
                    <span className="font-semibold text-white">
                      {games}
                      {games > 0 ? (
                        <span className="ml-2 text-xs font-normal text-emerald-200">
                          {wins} W · {formatPercent(winRateForMode(stats, mode), games > 0)}
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>
          </MindChamberPanel>

          <MindChamberPanel eyebrow="Inference" title="Scoreboard" tone="cyan">
            <div className="grid gap-3">
              <div className="rounded-xl border border-white/10 bg-slate-950/56 p-4">
                <div className="flex items-center gap-2 text-sm text-cyan-100/78">
                  <Gauge className="h-3.5 w-3.5" />
                  Avg. questions before guess
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-300">
                  {gameModes.map((mode) => {
                    const games = stats.byMode[mode];
                    return (
                      <div key={mode} className="flex items-center justify-between">
                        <span>{modeMeta[mode].label}</span>
                        <span className="font-semibold text-white">
                          {formatAverage(averageQuestionsForMode(stats, mode), games > 0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/56 p-4">
                <div className="flex items-center gap-2 text-sm text-cyan-100/78">
                  <Target className="h-3.5 w-3.5" />
                  Guess accuracy
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Chamber (Read My Mind)</span>
                    <span className="font-semibold text-white">
                      {formatPercent(systemGuessAccuracy(stats), systemAccuracyHas)}
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        {stats.systemGuessHits} / {stats.systemGuessAttempts}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>You (Guess My Mind)</span>
                    <span className="font-semibold text-white">
                      {formatPercent(playerGuessAccuracy(stats), playerAccuracyHas)}
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        {stats.playerGuessHits} / {stats.playerGuessAttempts}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/56 p-4">
                <div className="flex items-center gap-2 text-sm text-cyan-100/78">
                  <Trophy className="h-3.5 w-3.5" />
                  Wins by category
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-300">
                  {entityCategories.map((category) => {
                    const games = stats.byCategory[category];
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span>{categoryMeta[category].label}</span>
                        <span className="font-semibold text-white">
                          {stats.winsByCategory[category]} / {games}
                          <span className="ml-2 text-xs font-normal text-emerald-200">
                            {formatPercent(winRateForCategory(stats, category), games > 0)}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/56 p-4">
                <div className="flex items-center gap-2 text-sm text-cyan-100/78">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  Pressure breakdown
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-300">
                  {difficulties.map((difficulty) => {
                    const games = stats.byDifficulty[difficulty];
                    return (
                      <div key={difficulty} className="flex items-center justify-between">
                        <span className={difficultyConfig[difficulty].accent}>
                          {difficultyConfig[difficulty].label}
                        </span>
                        <span className="font-semibold text-white">
                          {stats.winsByDifficulty[difficulty]} / {games}
                          <span className="ml-2 text-xs font-normal text-emerald-200">
                            {formatPercent(winRateForDifficulty(stats, difficulty), games > 0)}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </MindChamberPanel>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <MindChamberPanel eyebrow="Taught memory" title="Escaped entities" tone="violet">
            {learnedEntities.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/56 px-4 py-6 text-sm text-slate-400">
                The chamber has not been taught any misses yet.
              </div>
            ) : (
              <div className="space-y-3">
                {learnedEntities.slice(0, 6).map((memory) => (
                  <div key={memory.id} className="rounded-xl border border-white/8 bg-slate-950/56 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{memory.entityName}</p>
                      <span className="text-xs text-fuchsia-100/78">
                        {categoryMeta[memory.category].label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{memory.note || "No note provided."}</p>
                  </div>
                ))}
              </div>
            )}
          </MindChamberPanel>

          <MindChamberPanel eyebrow="Recent rounds" title="Session timeline" tone="emerald">
            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/56 px-4 py-6 text-sm text-slate-400">
                Your archive is still blank. Run a session and the chamber will start keeping score.
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 8).map((entry) => {
                  const limits =
                    entry.mode === "read-my-mind"
                      ? difficultyConfig[entry.difficulty].readMyMind
                      : difficultyConfig[entry.difficulty].guessMyMind;

                  return (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-white/8 bg-slate-950/56 p-4"
                    >
                      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
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
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>
                            {entry.questionsUsed}
                            <span className="text-slate-500"> / {limits.maxQuestions}</span> Q
                          </span>
                          <span>
                            {entry.guessesUsed}
                            <span className="text-slate-500"> / {limits.maxGuesses}</span> G
                          </span>
                          <span className="flex items-center gap-2">
                            <History className="h-3.5 w-3.5" />
                            {new Date(entry.playedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {entry.strongestQuestion ? (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-cyan-200/14 bg-cyan-300/6 px-3 py-2 text-xs text-slate-300">
                          <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                          <span>
                            <span className="text-cyan-100/78">
                              {entry.strongestQuestion.questionLabel}
                            </span>
                            <span className="mx-2 text-slate-500">·</span>
                            {entry.strongestQuestion.questionPrompt}
                            <span className="mx-2 text-slate-500">·</span>
                            <span className="text-slate-400">
                              {entry.strongestQuestion.answer.replace("_", " ")}
                            </span>
                          </span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </MindChamberPanel>
        </div>
      </DialogContent>
    </Dialog>
  );
}
