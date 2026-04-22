"use client";

import { ArrowRight } from "lucide-react";

import { MoraDialogueSurface, SurfacePillButton } from "@/components/game/scene-surfaces";

interface EncounterSceneProps {
  onContinue: () => void;
}

export function EncounterScene({ onContinue }: EncounterSceneProps) {
  return (
    <div className="mx-auto w-full max-w-[760px]">
      <MoraDialogueSurface
        eyebrow="First encounter"
        title="Mora has opened the chamber to you."
        description="She reads thoughts the way other people read candle smoke. Sit at the table, choose a ritual, and let the chamber decide who understands whom first."
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center pt-1">
            <SurfacePillButton tone="accent" className="min-w-[13rem] px-7 py-3.5 text-base" onClick={onContinue}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </SurfacePillButton>
          </div>
        </div>
      </MoraDialogueSurface>
    </div>
  );
}
