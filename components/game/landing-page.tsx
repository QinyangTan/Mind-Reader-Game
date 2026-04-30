"use client";

import { ArrowRight } from "lucide-react";

import { ChamberSceneShell } from "@/components/game/chamber-scene-shell";
import { PromptPlaque } from "@/components/game/scene-surfaces";
import { SiteFooter } from "@/components/site/site-footer";

export function LandingPage() {
  return (
    <ChamberSceneShell
      scene="landing"
      mood="welcome"
      contentClassName="items-center justify-center"
      footer={<SiteFooter className="pt-3" />}
    >
      <div className="mx-auto flex min-h-[76vh] w-full max-w-[820px] flex-col items-center justify-between px-2 pb-4 pt-[12vh] text-center sm:pt-[16vh]">
        <div />

        <div className="space-y-4">
          <PromptPlaque variant="choice" size="xs">
            <div className="space-y-4 text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#d8b36a]">
                The chamber is listening
              </p>
              <a
                href="/play"
                className="group relative inline-flex min-w-[16rem] items-center justify-center gap-2 overflow-hidden border border-[rgba(238,219,170,0.76)] bg-[linear-gradient(180deg,rgba(175,114,220,0.62),rgba(83,45,115,0.98))] px-7 py-3.5 text-base font-semibold text-[#f7ebcb] shadow-[0_0_24px_rgba(177,118,217,0.24)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[2px] hover:border-[rgba(246,235,203,0.86)] hover:shadow-[0_0_30px_rgba(177,118,217,0.28)]"
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

        <section className="mt-14 grid w-full gap-5 text-left md:grid-cols-2">
          <article className="border-t border-[rgba(229,198,130,0.18)] bg-[rgba(9,5,13,0.34)] px-4 py-5 backdrop-blur-[1px]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#d6a653]">
              What Mind Reader is
            </p>
            <h1 className="mt-2 font-display text-3xl leading-none text-[#f5e7c5] sm:text-4xl">
              A cinematic guessing game hosted by Mora.
            </h1>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#d8cab1]">
              <p>
                Mind Reader is a public browser game where the player enters a
                psychic chamber and plays two conversational rituals with Mora,
                the hooded host of the experience.
              </p>
              <p>
                The game combines a large curated entity catalog, layered
                questions, probabilistic scoring, local learning, personal
                history, and a public-rank-ready score model.
              </p>
            </div>
          </article>

          <article className="border-t border-[rgba(229,198,130,0.18)] bg-[rgba(9,5,13,0.34)] px-4 py-5 backdrop-blur-[1px]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#d6a653]">
              The two rituals
            </p>
            <h2 className="mt-2 font-display text-3xl leading-none text-[#f5e7c5] sm:text-4xl">
              Mora reads you, or you read Mora.
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#d8cab1]">
              <p>
                In Read My Mind, you secretly think of a character, animal,
                object, food, or historical figure. Mora asks broad-to-fine
                questions and decides when the evidence is strong enough to
                guess.
              </p>
              <p>
                In Guess My Mind, Mora hides a thought and you choose guided
                clue questions by layer and family before submitting your own
                answer.
              </p>
            </div>
          </article>

          <article className="border-t border-[rgba(229,198,130,0.18)] bg-[rgba(9,5,13,0.3)] px-4 py-5 backdrop-blur-[1px] md:col-span-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#d6a653]">
              How the chamber thinks
            </p>
            <div className="mt-3 grid gap-4 text-sm leading-7 text-[#d8cab1] md:grid-cols-3">
              <p>
                The inference engine treats answers like yes, probably,
                probably not, no, and unknown as weighted evidence instead of
                brittle eliminators.
              </p>
              <p>
                Question selection favors high-information broad questions
                early, category-specific questions in the middle, and
                specialist/fine disambiguators near the end.
              </p>
              <p>
                Scores reward fair play, efficient guessing, and consistent
                answers while privacy-sensitive gameplay details remain local
                unless public ranking is explicitly needed.
              </p>
            </div>
          </article>
        </section>
      </div>
    </ChamberSceneShell>
  );
}
