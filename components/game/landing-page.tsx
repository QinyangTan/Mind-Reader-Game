"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Eye, Sparkles } from "lucide-react";

import { AmbientBackdrop } from "@/components/game/ambient-backdrop";
import { Button } from "@/components/ui/button";
import { categoryMeta, modeMeta } from "@/lib/game/game-config";

const modeLinks = [
  {
    href: "/play?mode=read-my-mind",
    mode: "read-my-mind" as const,
    accent: "from-cyan-300/28 via-sky-300/14 to-transparent",
    icon: Eye,
  },
  {
    href: "/play?mode=guess-my-mind",
    mode: "guess-my-mind" as const,
    accent: "from-fuchsia-300/28 via-violet-300/14 to-transparent",
    icon: BrainCircuit,
  },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <AmbientBackdrop />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-200/80">Mind Reader</p>
            <p className="mt-1 text-sm text-slate-300">A mirrored psychic guessing game built for the web.</p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/play">
              Enter chamber
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </header>

        <main className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/14 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.26em] text-cyan-100/85">
              <Sparkles className="h-3.5 w-3.5" />
              Futuristic thought scanner
            </p>
            <h1 className="font-display text-[4rem] leading-[0.92] text-white sm:text-[5.4rem] lg:text-[6.8rem]">
              Mind
              <br />
              Reader
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
              Step into a psychic chamber where one mode reads your hidden entity and the other dares you to decode
              the machine first.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/play">
                  Start a session
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/play?mode=guess-my-mind">Try the counter-scan</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 text-sm text-slate-300 sm:grid-cols-3">
              <div>
                <p className="text-2xl font-semibold text-white">2</p>
                <p className="mt-1">Mirrored modes built on one shared knowledge engine.</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">110</p>
                <p className="mt-1">Seeded entities spanning fictional icons and animals.</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">Local</p>
                <p className="mt-1">History, stats, and taught misses stay in your browser.</p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[2.8rem] border border-white/12 bg-slate-950/42 p-6 shadow-[0_28px_100px_rgba(2,6,23,0.58)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.16),transparent_38%),radial-gradient(circle_at_bottom,rgba(217,70,239,0.14),transparent_34%)]" />
              <div className="relative">
                <div className="mx-auto flex aspect-square max-w-[420px] items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                    className="absolute h-[60%] w-[60%] rounded-full border border-cyan-200/18"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute h-[78%] w-[78%] rounded-full border border-fuchsia-200/14"
                  />
                  <div className="absolute h-[42%] w-[42%] rounded-full border border-white/14 bg-[radial-gradient(circle,rgba(103,232,249,0.22),rgba(59,130,246,0.08),transparent_70%)] shadow-[0_0_120px_rgba(103,232,249,0.22)]" />
                  <div className="relative text-center">
                    <p className="text-[0.68rem] uppercase tracking-[0.28em] text-cyan-200/80">Thought core</p>
                    <p className="mt-4 font-display text-5xl text-white">Ψ</p>
                    <p className="mt-3 text-sm text-slate-300">Scanning the shape of a secret</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {modeLinks.map(({ href, mode, accent, icon: Icon }) => {
                    const meta = modeMeta[mode];
                    return (
                      <Link
                        key={mode}
                        href={href}
                        className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-5 transition duration-300 hover:border-white/18 hover:bg-white/8"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
                        <div className="relative">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-300">{meta.eyebrow}</p>
                            <Icon className="h-5 w-5 text-white/80" />
                          </div>
                          <h2 className="mt-3 font-display text-3xl text-white">{meta.label}</h2>
                          <p className="mt-3 text-sm leading-7 text-slate-300">{meta.description}</p>
                          <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-100">
                            Enter this ritual
                            <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">Knowledge focus</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {categoryMeta.fictional_characters.label} and {categoryMeta.animals.label} share one inference engine
                  and one local memory vault.
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">No external APIs</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Everything runs locally with responsive gameplay, lightweight persistence, and dramatic reveals.
                </p>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}
