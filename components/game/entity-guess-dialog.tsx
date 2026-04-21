"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Library, Sparkles } from "lucide-react";

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

  const confidencePct = Math.max(18, Math.round(confidence * 100));

  return (
    <Dialog open={open}>
      <DialogContent className="overflow-hidden p-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.18),transparent_48%),radial-gradient(circle_at_bottom,rgba(217,70,239,0.16),transparent_42%)]" />

        {/* Sheen sweep on open — ties the dialog into the scan-then-lock rhythm */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.14)_50%,transparent_65%)]"
          initial={{ x: "-120%" }}
          animate={{ x: "120%" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        />

        <div className="relative p-7 sm:p-8">
          <DialogHeader className="gap-4">
            <div className="flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.32em] text-cyan-200/80">
              {fromTeachLibrary ? <Library className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
              {fromTeachLibrary ? "Memory vault lock" : "Psychic Lock"}
            </div>

            <div className="flex items-start gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={entity.id}
                  initial={{ scale: 0.65, opacity: 0, rotate: -6 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                  className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.3rem] border border-white/10 bg-white/6 sm:h-20 sm:w-20"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-[1.3rem] bg-[radial-gradient(circle_at_center,rgba(103,232,249,0.55),transparent_65%)] blur-xl opacity-80" />
                  <span className="relative text-3xl sm:text-4xl">{entity.imageEmoji}</span>
                </motion.div>
              </AnimatePresence>

              <div className="min-w-0">
                <DialogTitle className="text-3xl leading-tight sm:text-4xl">
                  Are you thinking of {entity.name}?
                </DialogTitle>
                <DialogDescription className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                  {fromTeachLibrary
                    ? "This candidate comes from your teach library — a memory you stored after a past escape. "
                    : ""}
                  {entity.shortDescription} The chamber&apos;s certainty is hovering around{" "}
                  {Math.round(confidence * 100)}%, with {guessesRemaining} guess
                  {guessesRemaining === 1 ? "" : "es"} left after this one.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/6 px-5 py-4 text-sm text-slate-300">
            <div className="mb-3 flex items-center gap-2 text-cyan-200">
              <Sparkles className="h-4 w-4" />
              Thought signature surge
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#67e8f9,#8b5cf6,#f472b6)]"
                initial={{ width: 0 }}
                animate={{ width: `${confidencePct}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
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
