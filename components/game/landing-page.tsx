"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ChamberSceneShell } from "@/components/game/chamber-scene-shell";
import { PromptPlaque } from "@/components/game/scene-surfaces";

export function LandingPage() {
  return (
    <ChamberSceneShell
      scene="landing"
      mood="welcome"
      contentClassName="items-center justify-center"
      header={
        <div className="flex items-center justify-center pt-2">
          <BrandLogo compact className="opacity-90" />
        </div>
      }
    >
      <div className="mx-auto flex min-h-[76vh] w-full max-w-[820px] flex-col items-center justify-between px-2 pb-4 pt-[12vh] text-center sm:pt-[16vh]">
        <div />

        <div className="space-y-4">
          <PromptPlaque variant="choice" size="xs">
            <div className="space-y-4 text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#d8b36a]">
                The chamber is listening
              </p>
              <Link
                href="/play"
                className="inline-flex min-w-[16rem] items-center justify-center gap-2 rounded-[999px] border border-[rgba(238,219,170,0.7)] bg-[linear-gradient(180deg,rgba(175,114,220,0.58),rgba(83,45,115,0.96))] px-7 py-3.5 text-base font-semibold text-[#f7ebcb] shadow-[0_0_22px_rgba(177,118,217,0.22)] transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-[1px] hover:border-[rgba(246,235,203,0.82)]"
              >
                Enter the chamber
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </PromptPlaque>
        </div>
      </div>
    </ChamberSceneShell>
  );
}
