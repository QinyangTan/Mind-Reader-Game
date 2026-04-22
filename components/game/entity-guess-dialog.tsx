"use client";

import { BrainCircuit, Library } from "lucide-react";

import { MascotScene } from "@/components/brand/mascot-scene";
import { entityById } from "@/lib/data/entities";
import { isTeachEntityId } from "@/lib/game/teach";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GameEntity } from "@/types/game";

interface EntityGuessDialogProps {
  open: boolean;
  candidateId: string | null;
  confidence?: number;
  guessesRemaining: number;
  onConfirm: () => void;
  onReject: () => void;
  teachEntities?: Map<string, GameEntity>;
}

export function EntityGuessDialog({
  open,
  candidateId,
  confidence = 0,
  guessesRemaining,
  onConfirm,
  onReject,
  teachEntities,
}: EntityGuessDialogProps) {
  const entity = candidateId
    ? entityById.get(candidateId) ?? teachEntities?.get(candidateId)
    : undefined;

  if (!entity) {
    return null;
  }

  const fromTeachLibrary = isTeachEntityId(entity.id);

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#f0d9a2,#d6a653,#f0d9a2)]" />

        <div className="p-7 sm:p-8">
          <DialogHeader className="gap-4">
            <div className="flex items-center gap-2 text-sm text-[#f0d9a2]">
              {fromTeachLibrary ? <Library className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
              {fromTeachLibrary ? "Memory vault guess" : "Psychic guess"}
            </div>

            <div className="brand-paper rounded-[1.5rem] p-5 sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.1rem] border border-[rgba(138,91,36,0.18)] bg-white/35 text-4xl">
                      {entity.imageEmoji}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.72rem] font-semibold tracking-[0.24em] text-[#8a5b24]">FINAL REVEAL</p>
                      <DialogTitle className="mt-2 font-display text-4xl leading-none text-[#2b1a1e] sm:text-[2.7rem]">
                        Are you thinking of {entity.name}?
                      </DialogTitle>
                    </div>
                  </div>

                  <DialogDescription className="mt-4 text-sm leading-7 text-[#4b3430] sm:text-base">
                    {entity.shortDescription}
                  </DialogDescription>
                </div>

                <MascotScene
                  compact
                  state="confident"
                  title="Mora steps forward."
                  detail="The signal is strong enough for one clear yes-or-no reveal."
                />
              </div>
            </div>
          </DialogHeader>

          <p className="mt-5 text-sm leading-6 text-[#dbcdb5]">
            Roughly {Math.round(confidence * 100)}% confidence. {guessesRemaining} guess
            {guessesRemaining === 1 ? "" : "es"} remain after this reveal.
          </p>

          <DialogFooter className="mt-8">
            <Button variant="secondary" size="lg" onClick={onReject}>
              No
            </Button>
            <Button size="lg" onClick={onConfirm}>
              Yes
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
