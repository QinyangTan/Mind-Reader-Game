"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
              <Link className="text-sm text-[#d8ceb8] transition-colors hover:text-[#f0d9a2]" href="/play">
                Skip to setup
              </Link>
            </div>

            <div className="hidden lg:block xl:hidden">
              <AdSlot
                size="leaderboard"
                label="Featured sponsor"
                title="Reserved top banner"
                fallbackVariant="featured"
              >
                <MediaAdCard creativeId="midnight-platform-poster" size="leaderboard" fallbackVariant="featured" />
              </AdSlot>
            </div>
          </div>
        }
        host={
          <StageHostRail
            state="idle"
            title="Mora welcomes you."
            detail="A browser-game host on the left, one clear stage in the center, and sponsor space kept politely to the side."
            cue="Step into the parlor when you're ready. I’ll guide the rest one clean choice at a time."
            nextAction="Press Start playing in the center panel"
          />
        }
        support={<SponsorRail context="landing" className="sticky top-5" />}
        footer={
          <div className="space-y-3">
            <div className="rounded-[1.05rem] border border-[rgba(240,217,162,0.12)] bg-[rgba(18,10,24,0.52)] px-4 py-3 text-xs text-[#cbbda5] sm:text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>Mind Reader opens with one host, one stage, and one obvious way to begin.</span>
                <span className="text-[#f0d9a2]">Original mascot. Original branding. Local-first play.</span>
              </div>
            </div>

            <div className="xl:hidden">
              <AdSlot size="mobile" label="Stage sponsor" title="Reserved mobile banner" fallbackVariant="featured">
                <MediaAdCard creativeId="midnight-platform-poster" size="mobile" fallbackVariant="featured" />
              </AdSlot>
            </div>
          </div>
        }
      >
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full overflow-hidden rounded-[1.55rem] border border-[rgba(214,166,83,0.28)] bg-[linear-gradient(180deg,rgba(54,22,50,0.98),rgba(20,11,28,0.98))] p-6 shadow-[0_24px_70px_rgba(11,6,16,0.42)] sm:p-8 lg:p-10"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#f0d9a2,#d6a653,#f0d9a2)]" />
          <div className="absolute inset-4 rounded-[1.3rem] border border-[rgba(240,217,162,0.12)]" />

          <div className="relative max-w-2xl space-y-5">
            <p className="text-sm tracking-[0.18em] text-[#d6a653]">A local-first mind-reading browser game</p>
            <BrandLogo className="w-full max-w-[34rem]" />
            <p className="max-w-xl text-lg leading-8 text-[#efe6d2] sm:text-xl">
              One ritual lets the parlor read your secret. The other lets you question the house until its answer
              slips.
            </p>

            <div className="space-y-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/play">
                  Start playing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="text-sm text-[#cbbda5]">
                Both rituals begin in the same guided setup flow, so the next move stays obvious.
              </p>
            </div>
          </div>
        </motion.section>
      </ParlorStage>
    </div>
  );
}
