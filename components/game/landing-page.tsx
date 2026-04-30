"use client";

import { ArrowRight } from "lucide-react";

import { ChamberSceneShell } from "@/components/game/chamber-scene-shell";
import { PromptPlaque } from "@/components/game/scene-surfaces";
import { SiteFooter } from "@/components/site/site-footer";

const publisherSections = [
  {
    eyebrow: "What Mind Reader is",
    title: "A cinematic guessing game hosted inside Mora's psychic chamber.",
    body: [
      "Mind Reader is a public browser game that turns a classic twenty-questions-style guessing loop into a theatrical mind-reading ritual. Instead of navigating a dashboard, visitors step into Mora's chamber and play through dialogue, clues, and reveals.",
      "The game currently supports two mirrored rituals, personal local memory, deterministic scoring, public-rank-ready services, and a curated entity catalog built for repeated play.",
    ],
  },
  {
    eyebrow: "Read My Mind",
    title: "Mora asks the questions and tries to uncover your hidden thought.",
    body: [
      "In Read My Mind, you choose a category and silently think of something. Mora begins with broad questions, then moves through category, profile, specialist, and fine-detail clues as the evidence narrows.",
      "Your answers are not treated as brittle eliminations. Yes, no, probably, probably not, and unknown are converted into weighted evidence so uncertain answers remain playable.",
    ],
  },
  {
    eyebrow: "Guess My Mind",
    title: "You question Mora and decide when you are ready to guess.",
    body: [
      "In Guess My Mind, Mora hides a thought and you investigate it through a guided clue browser. The interface shows only a small set of recommended questions at a time so the mode feels strategic rather than overwhelming.",
      "Players can stay in a question family, go broader, move deeper, switch inquiry paths, or make a final guess when the pattern feels strong enough.",
    ],
  },
  {
    eyebrow: "Scoring and fairness",
    title: "The score rewards skill without encouraging random clicking.",
    body: [
      "Read My Mind rewards endurance, difficulty, consistent answers, and fairly stumping Mora. Guess My Mind rewards correct solves, fewer wasted questions, fewer failed guesses, and harder difficulty settings.",
      "Mora is allowed to refuse a guess when the vision is too divided. That keeps the game trustworthy: fewer reckless wrong answers, clearer teach-flow moments, and better long-term learning.",
    ],
  },
  {
    eyebrow: "Privacy and profiles",
    title: "Player identity is lightweight, anonymous, and local-first.",
    body: [
      "The first-time name gate creates a display name and stable player id without requiring email, passwords, or a traditional account. Chamber Memory keeps profile, history, scores, and teachings available between visits.",
      "Public ranking can use a display name and aggregate score totals, but private answer text, hidden entity names, teach notes, and free-text player content are not sent through analytics by default.",
    ],
  },
  {
    eyebrow: "How Mora's inference works",
    title: "The chamber uses layered questions and calibrated probability.",
    body: [
      "Mora ranks candidates with a smoothed evidence model so sparse profiles do not collapse to impossible and weak answers do not overpower strong ones. The system also tracks recent question families to avoid monotony.",
      "Late in a round, question selection shifts toward specialist and fine discriminators that separate the leading candidates rather than repeating broad questions that no longer help.",
    ],
  },
  {
    eyebrow: "Categories and content size",
    title: "The active catalog spans five playable domains.",
    body: [
      "Mind Reader currently includes fictional characters, animals, objects, foods, and historical figures. The seed bank contains thousands of records, while quarantine tooling keeps weak, misplaced, or non-playable seeds out of active gameplay until repaired.",
      "Content quality tools report duplicate aliases, weak profiles, question-family balance, profile-similarity clusters, and accuracy diagnostics so future expansions can improve Mora's guesses instead of merely increasing bulk.",
    ],
  },
] as const;

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050309] text-[#f7efd9]">
      <ChamberSceneShell
        scene="landing"
        mood="welcome"
        contentClassName="items-center justify-center"
        showExampleAds={false}
      >
        <div className="mx-auto flex min-h-[76vh] w-full max-w-[820px] flex-col items-center justify-center px-2 pb-4 pt-[12vh] text-center sm:pt-[16vh]">
          <PromptPlaque variant="choice" size="xs">
            <div className="space-y-4 text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#d8b36a]">
                The chamber is listening
              </p>
              <h1 className="font-display text-[3.2rem] leading-[0.85] text-[#f7ebcb] sm:text-[5.2rem]">
                Mind Reader
              </h1>
              <p className="mx-auto max-w-[28rem] text-sm leading-6 text-[#d8cab1] sm:text-base">
                Enter Mora&apos;s psychic chamber and choose which mind will be read.
              </p>
              <a
                href="/play"
                className="group relative inline-flex min-w-[16rem] items-center justify-center gap-2 overflow-hidden border border-[rgba(238,219,170,0.76)] bg-[linear-gradient(180deg,rgba(175,114,220,0.62),rgba(83,45,115,0.98))] px-7 py-3.5 text-base font-semibold text-[#f7ebcb] shadow-[0_0_24px_rgba(177,118,217,0.24)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[2px] hover:border-[rgba(246,235,203,0.86)] hover:shadow-[0_0_30px_rgba(177,118,217,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,228,192,0.54)]"
                style={{
                  clipPath:
                    "polygon(18px 0, calc(100% - 18px) 0, 100% 34%, 100% 66%, calc(100% - 18px) 100%, 18px 100%, 0 66%, 0 34%)",
                }}
              >
                <span
                  className="pointer-events-none absolute inset-[4px] border border-[rgba(249,234,196,0.2)]"
                  style={{
                    clipPath:
                      "polygon(18px 0, calc(100% - 18px) 0, 100% 34%, 100% 66%, calc(100% - 18px) 100%, 18px 100%, 0 66%, 0 34%)",
                  }}
                />
                <span className="pointer-events-none absolute inset-x-[16%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(249,234,196,0.82),transparent)]" />
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  Enter the chamber
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            </div>
          </PromptPlaque>
        </div>
      </ChamberSceneShell>

      {/*
        AdSense publisher-content compliance: the homepage keeps the hero clean
        and places real written publisher content below the cinematic entry scene.
        No simulated/example ad boxes are rendered on this public homepage.
      */}
      <main className="relative overflow-hidden border-t border-[rgba(229,198,130,0.18)] bg-[radial-gradient(circle_at_top,rgba(95,55,124,0.22),transparent_34%),linear-gradient(180deg,#0a0610,#050309_72%)] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(239,217,161,0.72),transparent)]" />
        <div className="mx-auto w-full max-w-[1180px] space-y-12">
          <section className="max-w-[54rem] space-y-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#d6a653]">
              Inside the Psychic Chamber
            </p>
            <h2 className="font-display text-[2.6rem] leading-[0.95] text-[#f5e7c5] sm:text-[4rem]">
              A polished game world, explained like a real public site.
            </h2>
            <p className="max-w-[46rem] text-base leading-8 text-[#d8cab1]">
              These sections explain the rules, systems, privacy model, and
              content scope behind Mind Reader without crowding the cinematic
              entry scene.
            </p>
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            {publisherSections.map((section, index) => (
              <article
                key={section.eyebrow}
                className={index === 0 ? "md:col-span-2" : undefined}
              >
                <div className="h-full border border-[rgba(229,198,130,0.14)] bg-[linear-gradient(180deg,rgba(19,10,26,0.68),rgba(8,5,12,0.82))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.24)] backdrop-blur-[2px] sm:p-6">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#d6a653]">
                    {section.eyebrow}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-tight text-[#f3e2bc] sm:text-[1.95rem]">
                    {section.title}
                  </h3>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-[#d6c6a4] sm:text-[0.98rem]">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter className="px-4 pb-5 sm:px-6 lg:px-10" />
    </div>
  );
}
