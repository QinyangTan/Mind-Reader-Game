"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ChamberSceneShell } from "@/components/game/chamber-scene-shell";
import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <ChamberSceneShell
      scene="landing"
      mood="welcome"
      contentClassName="items-center justify-end"
      header={
        <div className="flex items-center justify-center pt-1">
          <BrandLogo compact className="opacity-90" />
        </div>
      }
      footer={
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-center px-2 pb-2 text-[0.72rem] tracking-[0.18em] text-[#d9c79c]/78">
          ENTER THE CHAMBER
        </div>
      }
    >
      <div className="mx-auto flex min-h-[72vh] w-full max-w-[760px] flex-col items-center justify-between gap-10 px-2 pb-3 pt-[14vh] text-center sm:pt-[18vh]">
        <BrandLogo className="max-w-[32rem]" withDescription={false} />

        <MindChamberPanel
          className="w-full max-w-[42rem] bg-[linear-gradient(180deg,rgba(243,228,199,0.94),rgba(216,182,137,0.95)_100%)]"
          eyebrow="A living ritual awaits"
          title="Mora is waiting behind the veil."
        >
          <p className="mx-auto max-w-[30rem] text-center text-base leading-7 text-[#4c342c] sm:text-lg">
            Step into the psychic chamber and begin a conversation of hidden thoughts, measured clues, and dramatic
            reveals.
          </p>

          <div className="flex justify-center pt-2">
            <Button asChild size="lg" className="min-w-[15rem]">
              <Link href="/play">
                Enter the chamber
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </MindChamberPanel>
      </div>
    </ChamberSceneShell>
  );
}
