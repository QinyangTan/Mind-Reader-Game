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
  const stateLabel =
    state === "welcome"
      ? "welcoming"
      : state === "observing"
        ? "observing"
        : state === "thinking"
          ? "listening"
          : state === "asking"
            ? "asking"
            : state === "teasing"
              ? "guarding"
              : state === "confident"
                ? "revealing"
                : state === "celebration"
                  ? "radiant"
                  : state === "learning"
                    ? "learning"
                    : "surprised";
  const speechTone =
    state === "celebration" || state === "confident" || state === "teasing"
      ? "border-[rgba(214,166,83,0.22)] bg-[rgba(246,233,204,0.94)] text-[#2f221d]"
      : "border-[rgba(214,166,83,0.18)] bg-[rgba(238,227,202,0.92)] text-[#352822]";

  return (
    <aside className={cn("sticky top-5 space-y-4", className)}>
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(214,166,83,0.22)] bg-[linear-gradient(180deg,rgba(24,16,34,0.98),rgba(12,8,18,0.98))] p-4 shadow-[0_28px_54px_rgba(7,4,12,0.42)]">
        <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(240,217,162,0.5),transparent)]" />
        <div className="absolute inset-x-5 top-16 h-40 rounded-[48%] bg-[radial-gradient(circle,rgba(105,130,176,0.16),transparent_62%)]" />
        <div className="absolute inset-x-6 bottom-5 h-28 rounded-[40%] border border-[rgba(240,217,162,0.08)] bg-[linear-gradient(180deg,rgba(31,17,40,0),rgba(10,7,16,0.5))]" />

        <div className="relative flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.64rem] tracking-[0.28em] text-[#d6a653]">CHAMBER GUIDE</p>
            <p className="mt-1 text-xs text-[#a89986]">Mora, the hooded seer</p>
          </div>
          <span className="rounded-full border border-[rgba(240,217,162,0.18)] bg-[rgba(240,217,162,0.06)] px-2.5 py-1 text-[0.62rem] tracking-[0.18em] text-[#f0d9a2]">
            {stateLabel}
          </span>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-[1.35rem] border border-[rgba(240,217,162,0.12)] bg-[linear-gradient(180deg,rgba(21,14,31,0.64),rgba(9,7,15,0.92))] px-3 pb-3 pt-4">
          <div className="absolute inset-x-8 top-3 h-24 rounded-full bg-[radial-gradient(circle,rgba(240,217,162,0.18),transparent_66%)] blur-xl" />
          <div className="absolute bottom-0 left-1/2 h-16 w-[82%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle,rgba(18,10,24,0.78),transparent_74%)]" />
          <OracleMascot state={state} facing={facing} reactionKey={reactionKey} className="relative mx-auto mt-1 max-w-[12.5rem]" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${state}-${resolvedCue}-${nextAction ?? "none"}`}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={cn("relative mt-4 rounded-[1.15rem] border px-4 py-3 shadow-[0_12px_24px_rgba(10,7,14,0.16)]", speechTone)}
          >
            <div className={cn("absolute left-8 top-0 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-l border-t", speechTone)} />

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
          <h2 className="font-display text-[2.2rem] leading-[0.92] text-[#f7efd9]">{title ?? copy.title}</h2>
          <p className="text-sm leading-6 text-[#cdbfa8]">{detail ?? copy.detail}</p>
        </div>
      </div>

      {children}
    </aside>
  );
}
