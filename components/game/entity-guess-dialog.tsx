"use client";

import { BrainCircuit, Sparkles } from "lucide-react";

import { entityById } from "@/lib/data/entities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EntityGuessDialogProps {
  open: boolean;
  candidateId: string | null;
  confidence?: number;
  guessesRemaining: number;
  onConfirm: () => void;
  onReject: () => void;
}

export function EntityGuessDialog({
  open,
  candidateId,
  confidence = 0,
  guessesRemaining,
  onConfirm,
  onReject,
}: EntityGuessDialogProps) {
  const entity = candidateId ? entityById.get(candidateId) : undefined;

  if (!entity) {
    return null;
  }

  return (
    <Dialog open={open}>
      <DialogContent className="overflow-hidden p-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.18),transparent_48%),radial-gradient(circle_at_bottom,rgba(217,70,239,0.16),transparent_42%)]" />
        <div className="relative p-8">
          <DialogHeader className="gap-4">
            <div className="flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.32em] text-cyan-200/80">
              <BrainCircuit className="h-4 w-4" />
              Psychic Lock
            </div>
            <DialogTitle className="max-w-xl text-4xl leading-tight">
              Are you thinking of {entity.name} {entity.imageEmoji}?
            </DialogTitle>
            <DialogDescription className="max-w-xl text-base leading-7 text-slate-300">
              {entity.shortDescription} The chamber&apos;s certainty is hovering around{" "}
              {Math.round(confidence * 100)}%, with {guessesRemaining} guess
              {guessesRemaining === 1 ? "" : "es"} left after this one.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/6 px-5 py-4 text-sm text-slate-300">
            <div className="mb-3 flex items-center gap-2 text-cyan-200">
              <Sparkles className="h-4 w-4" />
              Thought signature surge
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#67e8f9,#8b5cf6,#f472b6)]"
                style={{ width: `${Math.max(18, Math.round(confidence * 100))}%` }}
              />
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button variant="secondary" size="lg" onClick={onReject}>
              No, keep scanning
            </Button>
            <Button size="lg" onClick={onConfirm}>
              Yes, you found it
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
