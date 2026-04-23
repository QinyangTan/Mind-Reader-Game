"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Library } from "lucide-react";

import { RevealSurface, ResponseWell, SurfacePillButton } from "@/components/game/scene-surfaces";
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
              animate={{ scale: [1.01, 1.04, 1.01], y: [0, 5, 0] }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <Image
                src="/scene-pack/clean/reveal.png"
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-center opacity-72"
              />
            </motion.div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,3,8,0.7),rgba(6,3,8,0.3)_35%,rgba(6,3,8,0.76)_100%)]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-[860px]"
          >
            <RevealSurface
              eyebrow={fromTeachLibrary ? "Learned memory" : "Mora’s declaration"}
              title={`Is it ${entity.name}?`}
              description={entity.shortDescription}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">
                  {fromTeachLibrary ? <Library className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                  {fromTeachLibrary ? "Recovered from chamber memory" : "Drawn from the current ritual"}
                </div>

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(214,174,98,0.3)] bg-[rgba(255,255,255,0.08)] text-5xl">
                  {entity.imageEmoji}
                </div>

                <ResponseWell>
                  <p className="text-sm leading-6 text-[#d7c7a4]">
                    Mora is roughly {Math.round(confidence * 100)}% certain. {guessesRemaining} guess
                    {guessesRemaining === 1 ? "" : "es"} remain after this answer.
                  </p>
                </ResponseWell>

                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <SurfacePillButton tone="default" surface="choice" className="min-w-[14rem] px-6 py-3 text-base" onClick={onReject}>
                    No, that’s not it
                  </SurfacePillButton>
                  <SurfacePillButton tone="accent" surface="choice" className="min-w-[14rem] px-6 py-3 text-base" onClick={onConfirm}>
                    Yes, that’s correct
                  </SurfacePillButton>
                </div>
              </div>
            </RevealSurface>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
