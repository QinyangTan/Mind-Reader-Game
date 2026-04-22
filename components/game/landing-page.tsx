"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AdSlot } from "@/components/brand/ad-slot";
import { BrandLogo } from "@/components/brand/brand-logo";
import { MediaAdCard } from "@/components/brand/media-ad-card";
import { SponsorRail } from "@/components/brand/sponsor-rail";
import { AmbientBackdrop } from "@/components/game/ambient-backdrop";
import { ParlorStage } from "@/components/game/parlor-stage";
import { StageHostRail } from "@/components/game/stage-host-rail";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-[#f7efd9]">
      <AmbientBackdrop />

      <ParlorStage
        header={
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <BrandLogo compact withTagline className="shrink-0" />
              <Link className="text-sm text-[#cbbda5] transition-colors hover:text-[#f0d9a2]" href="/play">
                Enter directly
              </Link>
            </div>

            <div className="hidden lg:block xl:hidden">
              <AdSlot
                size="leaderboard"
                label="Chamber notice"
                title="Reserved upper banner"
                fallbackVariant="featured"
              >
                <MediaAdCard creativeId="midnight-platform-poster" size="leaderboard" fallbackVariant="featured" />
              </AdSlot>
            </div>
          </div>
        }
        host={
          <StageHostRail
            state="welcome"
            title="A hooded psychic waits."
            detail="Mora keeps the left edge of the chamber alive, but the next move stays simple: enter, choose a ritual, and let the room begin to speak."
            cue="Come in quietly. Hold one thought close, and I’ll decide whether to read yours or hide my own."
            nextAction="Enter the chamber"
          />
        }
        support={<SponsorRail context="landing" className="sticky top-5" />}
        footer={
          <div className="space-y-3">
            <div className="rounded-[1.05rem] border border-[rgba(240,217,162,0.12)] bg-[rgba(14,10,21,0.58)] px-4 py-3 text-xs text-[#cbbda5] sm:text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>The chamber keeps its story in the atmosphere and its instructions in one obvious action.</span>
                <span className="text-[#f0d9a2]">Local-first. Two rituals. One mysterious host.</span>
              </div>
            </div>

            <div className="xl:hidden">
              <AdSlot size="mobile" label="Chamber notice" title="Reserved mobile banner" fallbackVariant="featured">
                <MediaAdCard creativeId="midnight-platform-poster" size="mobile" fallbackVariant="featured" />
              </AdSlot>
            </div>
          </div>
        }
      >
        <section
          className="relative w-full overflow-hidden rounded-[1.5rem] border border-[rgba(214,166,83,0.22)] bg-[linear-gradient(180deg,rgba(25,17,35,0.98),rgba(12,9,19,0.98))] p-6 shadow-[0_28px_74px_rgba(11,6,16,0.46)] sm:p-8 lg:p-10"
        >
          <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,#f0d9a2,transparent)]" />
          <div className="absolute inset-4 rounded-[1.25rem] border border-[rgba(240,217,162,0.08)]" />
          <div className="absolute inset-x-[22%] top-6 h-36 rounded-[50%] bg-[radial-gradient(circle,rgba(108,134,181,0.16),transparent_64%)] blur-2xl" />
          <div className="absolute bottom-0 left-1/2 h-28 w-[70%] -translate-x-1/2 rounded-t-[50%] bg-[linear-gradient(180deg,rgba(25,17,35,0),rgba(7,5,12,0.8))]" />

          <div className="absolute right-[8%] top-[5.5rem] hidden h-[15rem] w-[15rem] rounded-[50%] border border-[rgba(105,130,176,0.16)] bg-[radial-gradient(circle,rgba(105,130,176,0.18),transparent_66%)] lg:block" />
          <div className="absolute right-[11%] top-[7rem] hidden h-[9rem] w-[8rem] rounded-t-[48%] rounded-b-[40%] bg-[linear-gradient(180deg,rgba(49,29,64,0.88),rgba(13,10,20,0.96))] shadow-[0_18px_40px_rgba(6,4,10,0.45)] lg:block" />
          <div className="absolute right-[13.4%] top-[8.2rem] hidden h-8 w-10 rounded-[46%] bg-[radial-gradient(circle,rgba(246,235,211,0.82),rgba(246,235,211,0.28)_58%,transparent_72%)] lg:block" />

          <div className="relative flex min-h-[22rem] items-center">
            <div className="relative z-10 max-w-2xl space-y-5 rounded-[1.2rem] border border-[rgba(240,217,162,0.12)] bg-[rgba(15,10,21,0.44)] px-6 py-6 shadow-[0_18px_36px_rgba(8,5,12,0.24)] backdrop-blur-[2px]">
              <p className="text-sm tracking-[0.18em] text-[#d6a653]">Threshold scene</p>
              <BrandLogo className="w-full max-w-[34rem]" />
              <p className="max-w-xl text-lg leading-8 text-[#efe6d2] sm:text-xl">
                Step through the velvet dark and face Mora inside her psychic chamber. In one ritual she reads your
                hidden thought. In the other you try to uncover hers before the candles burn low.
              </p>

              <div className="space-y-3">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/play">
                    Enter the chamber
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="max-w-lg text-sm leading-6 text-[#cbbda5]">
                  One guided setup. Two mirrored mind-reading rituals. No account, no backend, no clutter.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ParlorStage>
    </div>
  );
}
