"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ChamberSceneShell } from "@/components/game/chamber-scene-shell";
import { RitualSlab } from "@/components/game/scene-surfaces";

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

        <RitualSlab variant="landing" className="w-full max-w-[42rem]">
          <div className="space-y-5 text-center">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#d8b36a]">
              A living ritual awaits
            </p>
            <h2 className="font-display text-[2.5rem] leading-[0.92] text-[#f6e7bf] sm:text-[3rem]">
              Mora is waiting behind the veil.
            </h2>
            <p className="mx-auto max-w-[30rem] text-center text-base leading-7 text-[#d9caac] sm:text-lg">
            Step into the psychic chamber and begin a conversation of hidden thoughts, measured clues, and dramatic
            reveals.
            </p>

            <div className="flex justify-center pt-1">
              <Link
                href="/play"
                className="inline-flex min-w-[15rem] items-center justify-center gap-2 rounded-[999px] border border-[rgba(238,219,170,0.7)] bg-[linear-gradient(180deg,rgba(175,114,220,0.62),rgba(81,43,112,0.96))] px-7 py-3.5 text-base font-semibold text-[#f7ebcb] shadow-[0_0_24px_rgba(177,118,217,0.24)] transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-[1px] hover:border-[rgba(246,235,203,0.82)]"
              >
                Enter the chamber
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </RitualSlab>
      </div>
    </ChamberSceneShell>
  );
}
