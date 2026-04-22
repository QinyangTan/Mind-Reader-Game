"use client";

import { BrainCircuit, Library } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { entityById } from "@/lib/data/entities";
import { isTeachEntityId } from "@/lib/game/teach";
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
      <DialogContent className="max-w-2xl border-[rgba(241,226,193,0.24)] bg-[linear-gradient(180deg,rgba(14,10,20,0.98),rgba(9,6,14,0.98))] p-0">
        <div className="relative overflow-hidden px-7 py-8 sm:px-9 sm:py-9">
          <div className="absolute inset-x-[18%] top-0 h-32 bg-[radial-gradient(circle,rgba(240,217,162,0.16),transparent_70%)] blur-2xl" />
          <div className="absolute inset-x-[25%] bottom-0 h-20 rounded-t-[50%] bg-[radial-gradient(circle,rgba(12,8,16,0.92),transparent_76%)]" />

          <DialogHeader className="relative gap-5 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-[#d7c596]">
              {fromTeachLibrary ? <Library className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
              {fromTeachLibrary ? "Memory echo" : "Psychic declaration"}
            </div>

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(241,226,193,0.18)] bg-[radial-gradient(circle,rgba(255,255,255,0.12),rgba(255,255,255,0)_72%)] text-6xl">
              {entity.imageEmoji}
            </div>

            <div className="space-y-3">
              <DialogTitle className="font-display text-[3rem] leading-[0.9] text-[#f7efd9] sm:text-[3.8rem]">
                Are you thinking of {entity.name}?
              </DialogTitle>
              <DialogDescription className="mx-auto max-w-xl text-base leading-7 text-[#ddd1ba]">
                {entity.shortDescription}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="relative mt-7 rounded-[1.2rem] border border-[rgba(241,226,193,0.12)] bg-[rgba(255,255,255,0.04)] px-4 py-4 text-center text-sm text-[#d6cab5]">
            The chamber is roughly {Math.round(confidence * 100)}% certain. {guessesRemaining} guess
            {guessesRemaining === 1 ? "" : "es"} remain after this declaration.
          </div>

          <DialogFooter className="relative mt-8 sm:justify-center">
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
