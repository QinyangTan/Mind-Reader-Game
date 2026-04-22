"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ChamberSceneShell } from "@/components/game/chamber-scene-shell";
import { PsychicPresence } from "@/components/game/psychic-presence";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <ChamberSceneShell
      contentClassName="xl:justify-center xl:pr-0"
      header={
        <div className="flex items-center justify-between gap-4">
          <BrandLogo compact withTagline className="shrink-0" />
          <p className="hidden text-sm text-[#d2c7b1] sm:block">A mind-reading ritual led by Mora inside the chamber.</p>
        </div>
      }
      mascot={
        <PsychicPresence
          state="welcome"
          facing="right"
          className="xl:translate-x-[-4%] xl:scale-[1.08] 2xl:translate-x-[-2%]"
        />
      }
    >
      <section className="relative">
        <div className="pointer-events-none absolute inset-x-[10%] top-[5%] h-40 rounded-full bg-[radial-gradient(circle,rgba(240,217,162,0.18),transparent_66%)] blur-3xl" />
        <div className="relative mx-auto max-w-[42rem] space-y-6 text-center xl:mx-0 xl:text-left">
          <p className="text-sm tracking-[0.22em] text-[#d9c49a]">Step into the chamber</p>
          <BrandLogo className="mx-auto w-full max-w-[34rem] xl:mx-0" />
          <h1 className="font-display text-[3.6rem] leading-[0.88] text-[#f7efd9] sm:text-[4.6rem] lg:text-[5.8rem]">
            Face the psychic.
            <br />
            Guard one thought.
          </h1>
          <p className="mx-auto max-w-[34rem] text-base leading-8 text-[#e4dac7] sm:text-lg xl:mx-0">
            Mora waits beneath candlelight and velvet shadow. In one ritual she reads your hidden thought. In the
            other, you try to read hers before the chamber closes around the answer.
          </p>

          <div className="space-y-4 pt-2">
            <Button asChild size="lg" className="min-w-[15rem]">
              <Link href="/play">
                Begin the ritual
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm text-[#cfc2a9]">Two ways to play. One chamber. One clear first move.</p>
          </div>
        </div>
      </section>
    </ChamberSceneShell>
  );
}
