"use client";

import { ArrowRight } from "lucide-react";

import { MindChamberPanel } from "@/components/game/mind-chamber-panel";
import { Button } from "@/components/ui/button";

interface EncounterSceneProps {
  onContinue: () => void;
}

export function EncounterScene({ onContinue }: EncounterSceneProps) {
  return (
    <div className="mx-auto w-full max-w-[760px]">
      <MindChamberPanel eyebrow="First encounter" title="Mora has opened the chamber to you.">
        <div className="space-y-5 text-center">
          <p className="mx-auto max-w-[32rem] text-base leading-7 text-[#4d352c] sm:text-lg">
            She reads thoughts the way other people read candle smoke. Sit at the table, choose a ritual, and let the
            chamber decide who understands whom first.
          </p>

          <div className="flex justify-center pt-1">
            <Button size="lg" onClick={onContinue}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </MindChamberPanel>
    </div>
  );
}
