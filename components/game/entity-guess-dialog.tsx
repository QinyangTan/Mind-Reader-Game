"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Library } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(4,2,8,0.82)] px-4 pb-4 pt-20 sm:items-center sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              animate={{ scale: [1.02, 1.05, 1.02], y: [0, 6, 0] }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <Image
                src="/scene-pack/reveal.png"
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-center opacity-70"
              />
            </motion.div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,3,8,0.7),rgba(6,3,8,0.34)_35%,rgba(6,3,8,0.76)_100%)]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-[820px] overflow-hidden rounded-[1.8rem] border border-[rgba(128,86,47,0.9)] bg-[linear-gradient(180deg,rgba(245,232,200,0.98),rgba(226,192,143,0.98)_100%)] p-6 text-[#2d1b19] shadow-[0_40px_110px_rgba(0,0,0,0.6)] sm:p-8"
          >
            <div className="absolute inset-[12px] rounded-[1.35rem] border border-[rgba(252,242,222,0.44)]" />
            <div className="relative space-y-6 text-center">
              <div className="flex items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#8a5b24]">
                {fromTeachLibrary ? <Library className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                {fromTeachLibrary ? "Learned memory" : "Mora’s declaration"}
              </div>

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[1.35rem] border border-[rgba(126,79,39,0.22)] bg-[rgba(255,255,255,0.34)] text-5xl">
                {entity.imageEmoji}
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-[3rem] leading-[0.9] text-[#2d1b19] sm:text-[3.8rem]">
                  Is it {entity.name}?
                </h2>
                <p className="mx-auto max-w-[34rem] text-base leading-7 text-[#4f3830]">{entity.shortDescription}</p>
              </div>

              <div className="rounded-[1.15rem] border border-[rgba(111,75,45,0.18)] bg-[rgba(98,62,40,0.08)] px-5 py-4 text-sm leading-6 text-[#5a433b]">
                Mora is roughly {Math.round(confidence * 100)}% certain. {guessesRemaining} guess
                {guessesRemaining === 1 ? "" : "es"} remain after this answer.
              </div>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" variant="secondary" onClick={onReject}>
                  No
                </Button>
                <Button size="lg" onClick={onConfirm}>
                  Yes
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
