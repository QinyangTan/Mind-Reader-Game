"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Crosshair, Library, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { categoryMeta, difficultyConfig, modeMeta } from "@/lib/game/game-config";
import { cn } from "@/lib/utils/cn";
import type { StoredSettings } from "@/types/game";

interface PlaySetupProps {
  settings: StoredSettings;
  onChange: (patch: Partial<StoredSettings>) => void;
  onStart: () => void;
  isPending: boolean;
  teachCaseCount: number;
}

export function PlaySetup({ settings, onChange, onStart, isPending, teachCaseCount }: PlaySetupProps) {
  const selectedMode = modeMeta[settings.mode];
  const selectedCategory = categoryMeta[settings.category];
  const selectedDifficulty = difficultyConfig[settings.difficulty];
  const activeLimits =
    settings.mode === "read-my-mind"
      ? selectedDifficulty.readMyMind
      : selectedDifficulty.guessMyMind;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-6"
      >
        <MindChamberPanel eyebrow="Calibrate the chamber" title="Choose the ritual">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(modeMeta).map(([id, meta]) => {
              const active = settings.mode === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChange({ mode: id as StoredSettings["mode"] })}
                  className={cn(
                    "group rounded-[1.8rem] border px-5 py-5 text-left transition duration-300",
                    active
                      ? "border-cyan-300/45 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(103,232,249,0.18)]"
                      : "border-white/10 bg-white/5 hover:border-white/16 hover:bg-white/8",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[0.3em] text-slate-400">
                        {meta.eyebrow}
                      </p>
                      <h3 className="mt-2 font-display text-3xl text-white">{meta.label}</h3>
                    </div>
                    <div
                      className={cn(
                        "rounded-full border p-3 transition duration-300",
                        active
                          ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                          : "border-white/10 bg-white/6 text-slate-300",
                      )}
                    >
                      {id === "read-my-mind" ? (
                        <BrainCircuit className="h-5 w-5" />
                      ) : (
                        <Crosshair className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">{meta.description}</p>
                </button>
              );
            })}
          </div>
        </MindChamberPanel>

        <MindChamberPanel eyebrow="Signal library" title="Category focus" tone="emerald">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(categoryMeta).map(([id, meta]) => {
              const active = settings.category === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChange({ category: id as StoredSettings["category"] })}
                  className={cn(
                    "rounded-[1.8rem] border px-5 py-5 text-left transition duration-300",
                    active
                      ? "border-white/16 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                      : "border-white/10 bg-white/4 hover:border-white/16 hover:bg-white/8",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-3xl text-white">{meta.icon}</span>
                    <h3 className="text-lg font-semibold text-white">{meta.label}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{meta.synopsis}</p>
                  <p className={cn("mt-3 text-xs uppercase tracking-[0.24em]", active ? "text-cyan-200" : "text-slate-500")}>
                    {meta.flavor}
                  </p>
                </button>
              );
            })}
          </div>
        </MindChamberPanel>

        {settings.mode === "read-my-mind" ? (
          <MindChamberPanel
            eyebrow="Memory vault"
            title="Use past teach cases"
            tone="emerald"
          >
            <button
              type="button"
              onClick={() => onChange({ useTeachCases: !settings.useTeachCases })}
              aria-pressed={settings.useTeachCases}
              className={cn(
                "flex w-full items-start gap-4 rounded-[1.8rem] border px-5 py-5 text-left transition duration-300",
                settings.useTeachCases
                  ? "border-emerald-200/35 bg-emerald-300/10 shadow-[0_0_0_1px_rgba(110,231,183,0.18)]"
                  : "border-white/10 bg-white/4 hover:border-white/16 hover:bg-white/8",
              )}
            >
              <div
                className={cn(
                  "rounded-full border p-3",
                  settings.useTeachCases
                    ? "border-emerald-200/30 bg-emerald-300/12 text-emerald-100"
                    : "border-white/10 bg-white/6 text-slate-300",
                )}
              >
                <Library className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">
                    {settings.useTeachCases ? "Enabled" : "Disabled"}
                  </h3>
                  <span
                    className={cn(
                      "text-xs uppercase tracking-[0.22em]",
                      settings.useTeachCases ? "text-emerald-200" : "text-slate-500",
                    )}
                  >
                    {teachCaseCount} stored
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Include entities you taught the chamber in past Read-My-Mind escapes. They enter the candidate pool
                  only for this category, ranked alongside the seeded library.
                </p>
                {teachCaseCount === 0 ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                    No teach cases yet in this category. Lose a round and tap &ldquo;Store in memory&rdquo; to build one.
                  </p>
                ) : null}
              </div>
            </button>
          </MindChamberPanel>
        ) : null}

        <MindChamberPanel eyebrow="Pressure profile" title="Difficulty" tone="violet">
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(difficultyConfig).map(([id, config]) => {
              const active = settings.difficulty === id;
              const limits = settings.mode === "read-my-mind" ? config.readMyMind : config.guessMyMind;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChange({ difficulty: id as StoredSettings["difficulty"] })}
                  className={cn(
                    "rounded-[1.6rem] border px-4 py-4 text-left transition duration-300",
                    active
                      ? "border-fuchsia-300/32 bg-fuchsia-300/10 shadow-[0_0_0_1px_rgba(217,70,239,0.14)]"
                      : "border-white/10 bg-white/4 hover:border-white/16 hover:bg-white/8",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">{config.label}</h3>
                    <Sparkles className={cn("h-4 w-4", active ? "text-fuchsia-200" : "text-slate-500")} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{config.description}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-400">
                    {limits.maxQuestions} questions • {limits.maxGuesses} guesses
                  </p>
                </button>
              );
            })}
          </div>
        </MindChamberPanel>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
      >
        <MindChamberPanel eyebrow="Session preview" title="Thought chamber ready" className="sticky top-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.18),transparent_45%),rgba(255,255,255,0.04)] p-6">
            <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0,transparent_60%)]" />
            <div className="relative">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-cyan-200/80">
                {selectedMode.eyebrow}
              </p>
              <h3 className="mt-3 font-display text-5xl leading-none text-white">{selectedMode.label}</h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">{selectedMode.description}</p>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3">
              <span>Category</span>
              <span className="font-medium text-white">{selectedCategory.label}</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3">
              <span>Difficulty</span>
              <span className={cn("font-medium", selectedDifficulty.accent)}>{selectedDifficulty.label}</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3">
              <span>Question budget</span>
              <span className="font-medium text-white">{activeLimits.maxQuestions}</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-3">
              <span>Guess budget</span>
              <span className="font-medium text-white">{activeLimits.maxGuesses}</span>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={onStart} disabled={isPending}>
            {selectedMode.cta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </MindChamberPanel>
      </motion.div>
    </div>
  );
}
