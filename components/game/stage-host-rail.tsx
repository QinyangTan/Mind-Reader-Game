"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { OracleMascot } from "@/components/brand/oracle-mascot";
import { getMascotCopy } from "@/lib/game/mascot";
import { cn } from "@/lib/utils/cn";
import type { GameMode } from "@/types/game";
import type { MascotFacing, MascotState } from "@/types/mascot";

interface StageHostRailProps {
  state: MascotState;
  mode?: GameMode;
  facing?: MascotFacing;
  reactionKey?: number;
  className?: string;
  title?: string;
  detail?: string;
  cue?: string;
  nextAction?: string;
  children?: ReactNode;
}

export function StageHostRail({
  state,
  mode,
  facing = "right",
  reactionKey,
  className,
  title,
  detail,
  cue,
  nextAction,
  children,
}: StageHostRailProps) {
  const copy = getMascotCopy(state, mode);
  const resolvedCue = cue ?? copy.detail;
  const bubbleTone =
    state === "celebration"
      ? "border-[rgba(214,166,83,0.24)] bg-[rgba(241,227,188,0.96)] text-[#3d2a24]"
      : state === "confident"
        ? "border-[rgba(214,166,83,0.24)] bg-[rgba(241,227,188,0.96)] text-[#3d2a24]"
        : "border-[rgba(214,166,83,0.18)] bg-[rgba(241,227,188,0.94)] text-[#3f2b25]";

  return (
    <aside className={cn("sticky top-5 space-y-4", className)}>
      <div className="overflow-hidden rounded-[1.35rem] border border-[rgba(214,166,83,0.24)] bg-[linear-gradient(180deg,rgba(44,18,43,0.98),rgba(20,10,28,0.98))] p-4 shadow-[0_18px_44px_rgba(12,7,18,0.3)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.68rem] tracking-[0.24em] text-[#d6a653]">HOST STAGE</p>
          <span className="h-2.5 w-2.5 rounded-full bg-[#d6a653]" />
        </div>

        <OracleMascot state={state} facing={facing} reactionKey={reactionKey} className="mx-auto mt-4 max-w-[11.5rem]" />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${state}-${resolvedCue}-${nextAction ?? "none"}`}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={cn("relative mt-4 rounded-[1.1rem] border px-4 py-3 shadow-[0_10px_28px_rgba(12,7,18,0.18)]", bubbleTone)}
          >
            <div className={cn("absolute left-8 top-0 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-l border-t", bubbleTone)} />

            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.64rem] font-semibold tracking-[0.24em] text-[#8a5b24]">MORA SAYS</p>
              <div aria-hidden className="flex items-center gap-1">
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="h-1.5 w-1.5 rounded-full bg-[#8a5b24]"
                    animate={{ opacity: [0.28, 1, 0.28], scale: [0.92, 1.1, 0.92] }}
                    transition={{
                      duration: 1.35,
                      ease: "easeInOut",
                      repeat: Number.POSITIVE_INFINITY,
                      delay: dot * 0.14,
                    }}
                  />
                ))}
              </div>
            </div>

            <p className="mt-2 text-sm font-medium leading-6">{resolvedCue}</p>
            {nextAction ? <p className="mt-3 text-xs leading-5 text-[#6e503f]">Next: {nextAction}</p> : null}
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 space-y-2">
          <h2 className="font-display text-[2rem] leading-none text-[#f7efd9]">{title ?? copy.title}</h2>
          <p className="text-sm leading-6 text-[#dbcdb5]">{detail ?? copy.detail}</p>
        </div>
      </div>

      {children}
    </aside>
  );
}
