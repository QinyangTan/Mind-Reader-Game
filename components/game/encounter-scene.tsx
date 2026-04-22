"use client";

import { ArrowRight } from "lucide-react";

import { PromptPlaque, SurfacePillButton } from "@/components/game/scene-surfaces";

interface EncounterSceneProps {
  onContinue: () => void;
}

export function EncounterScene({ onContinue }: EncounterSceneProps) {
  return (
    <div className="mx-auto w-full max-w-[720px] space-y-5 text-center">
      <PromptPlaque variant="dialogue" tail className="max-w-[44rem]">
        <div className="space-y-3 text-center">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#d8b36a]">First encounter</p>
          <h2 className="font-display text-[2.35rem] leading-[0.94] text-[#f6e7bf] sm:text-[3rem]">
            Welcome. Tonight, thoughts do not stay hidden for long.
          </h2>
          <p className="mx-auto max-w-[30rem] text-sm leading-7 text-[#d9caac] sm:text-base">
            Sit at the table, choose a ritual, and let Mora decide who reads whom first.
          </p>
        </div>
      </PromptPlaque>

      <div className="flex justify-center">
        <SurfacePillButton tone="accent" className="min-w-[13rem] px-7 py-3.5 text-base" onClick={onContinue}>
          Continue
          <ArrowRight className="h-4 w-4" />
        </SurfacePillButton>
      </div>
    </div>
  );
}
