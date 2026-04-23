"use client";

import { useState } from "react";
import { BrainCircuit, History, RotateCcw, Sparkles, Target, Trophy, UserRoundPen, X } from "lucide-react";

import { ChamberMemorySurface, ResponseWell, SurfacePillButton } from "@/components/game/scene-surfaces";
import { categoryMeta, difficultyConfig, modeMeta } from "@/lib/game/game-config";
import {
  averageQuestionsForMode,
  playerGuessAccuracy,
  systemGuessAccuracy,
  winRateForCategory,
  winRateForDifficulty,
  winRateForMode,
} from "@/lib/game/storage";
import { normalizeDisplayName, validateDisplayName } from "@/lib/game/player-profile";
import {
  difficulties,
  entityCategories,
  gameModes,
  type GameStats,
  type HistoryEntry,
  type PlayerProfile,
  type TeachCase,
} from "@/types/game";

interface StatsPanelProps {
  onClose: () => void;
  stats: GameStats;
  history: HistoryEntry[];
  learnedEntities: TeachCase[];
  profile: PlayerProfile | null;
  onRenameProfile: (displayName: string) => void;
  onResetProfile: () => void;
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

export function StatsPanel({
  onClose,
  stats,
  history,
  learnedEntities,
  profile,
  onRenameProfile,
  onResetProfile,
}: StatsPanelProps) {
  const systemAccuracyHas = stats.systemGuessAttempts > 0;
  const playerAccuracyHas = stats.playerGuessAttempts > 0;
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(profile?.displayName ?? "");
  const [confirmReset, setConfirmReset] = useState(false);
  const normalizedDraft = normalizeDisplayName(draftName);
  const nameError = normalizedDraft ? validateDisplayName(normalizedDraft) : null;

  return (
    <div className="relative mx-auto w-full max-w-[1080px]">
      <ChamberMemorySurface
        eyebrow="Chamber memory"
        title={profile ? `${profile.displayName}'s ritual ledger` : "The ledger of past rituals"}
        description="Mora keeps your score, recent rituals, teachings, and personal record here."
      >
        <div className="absolute right-0 top-0">
          <SurfacePillButton tone="default" surface="compact" className="px-4 py-2" onClick={onClose}>
            <X className="h-4 w-4" />
            Close
          </SurfacePillButton>
        </div>

        <div className="grid gap-6">
                  <ResponseWell>
                    <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                      <div>
                        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#d8b36a]">Player profile</p>
                        <p className="mt-2 font-display text-[2.4rem] leading-none text-[#f6e7bf]">
                          {profile?.displayName ?? "Unnamed visitor"}
                        </p>
                        <p className="mt-2 text-sm text-[#d7c7a4]">
                          Total score {stats.totalScore.toLocaleString()} · Read {stats.scoreByMode["read-my-mind"].toLocaleString()} · Guess {stats.scoreByMode["guess-my-mind"].toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        <SurfacePillButton
                          tone="default"
                          surface="compact"
                          onClick={() => {
                            setDraftName(profile?.displayName ?? "");
                            setEditingName((value) => !value);
                          }}
                        >
                          <UserRoundPen className="h-4 w-4" />
                          Rename
                        </SurfacePillButton>
                        <SurfacePillButton
                          tone={confirmReset ? "accent" : "default"}
                          surface="compact"
                          onClick={() => {
                            if (!confirmReset) {
                              setConfirmReset(true);
                              return;
                            }
                            onResetProfile();
                            setConfirmReset(false);
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                          {confirmReset ? "Confirm reset" : "Reset"}
                        </SurfacePillButton>
                      </div>
                    </div>

                    {editingName ? (
                      <form
                        className="mt-4 flex flex-col gap-3 sm:flex-row"
                        onSubmit={(event) => {
                          event.preventDefault();
                          if (!normalizedDraft || nameError) {
                            return;
                          }
                          onRenameProfile(normalizedDraft);
                          setEditingName(false);
                        }}
                      >
                        <input
                          value={draftName}
                          onChange={(event) => setDraftName(event.target.value)}
                          maxLength={18}
                          className="h-11 flex-1 border border-[rgba(214,174,98,0.32)] bg-[rgba(21,12,30,0.7)] px-4 text-sm text-[#f6e7bf] outline-none placeholder:text-[#a99976] focus:border-[rgba(242,226,181,0.58)]"
                          placeholder="New player name"
                        />
                        <SurfacePillButton
                          type="submit"
                          tone="accent"
                          surface="compact"
                          disabled={!normalizedDraft || !!nameError}
                        >
                          Save name
                        </SurfacePillButton>
                        <p className="sm:hidden text-sm text-[#d7c7a4]">{nameError}</p>
                      </form>
                    ) : null}
                  </ResponseWell>

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
                    <ResponseWell tone="muted">
                      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#d8b36a]">Best score</p>
                      <p className="mt-2 text-2xl font-semibold text-[#f6e7bf]">
                        {Math.max(...gameModes.map((mode) => stats.bestScoreByMode[mode])).toLocaleString()}
                      </p>
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
                                  {limits.maxGuesses} guesses · {(entry.score ?? 0).toLocaleString()} pts
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
  );
}
