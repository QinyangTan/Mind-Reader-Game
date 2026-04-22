"use client";

import { motion } from "framer-motion";

import { OracleMascot } from "@/components/brand/oracle-mascot";
import { getMascotCopy } from "@/lib/game/mascot";
import { cn } from "@/lib/utils/cn";
import type { GameMode } from "@/types/game";
import type { MascotFacing, MascotState } from "@/types/mascot";

interface MascotSceneProps {
  state: MascotState;
  mode?: GameMode;
  facing?: MascotFacing;
  title?: string;
  detail?: string;
  reactionKey?: number;
  compact?: boolean;
  className?: string;
}

export function MascotScene({
  state,
  mode,
  facing = "right",
  title,
  detail,
  reactionKey,
  compact = false,
  className,
}: MascotSceneProps) {
  const copy = getMascotCopy(state, mode);

  return (
    <motion.div
      key={`${state}-${mode ?? "any"}-${compact ? "compact" : "full"}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex items-center gap-3 rounded-[1.15rem] border border-[rgba(240,217,162,0.12)] bg-[linear-gradient(180deg,rgba(16,11,23,0.72),rgba(10,7,16,0.9))] px-3 py-3 shadow-[0_14px_30px_rgba(7,4,12,0.22)]",
        compact ? "min-h-[6.5rem]" : "min-h-[8rem] p-4",
        className,
      )}
    >
      <div className={cn("relative shrink-0", compact ? "w-[5.4rem]" : "w-[7.5rem]")}>
        <div className="absolute inset-x-3 top-1 h-10 rounded-full bg-[radial-gradient(circle,rgba(240,217,162,0.18),transparent_68%)] blur-lg" />
        <OracleMascot
          state={state}
          facing={facing}
          reactionKey={reactionKey}
          className={compact ? "relative mx-auto max-w-[5.4rem]" : "relative mx-auto max-w-[7.5rem]"}
        />
      </div>

      <div className="min-w-0 space-y-1">
        <p className="text-[0.62rem] tracking-[0.22em] text-[#d6a653]">THE SEER</p>
        <p className={cn("font-semibold text-[#f7efd9]", compact ? "text-sm" : "text-base")}>{title ?? copy.title}</p>
        <p className={cn("leading-6 text-[#cbbca5]", compact ? "text-xs" : "text-sm")}>{detail ?? copy.detail}</p>
      </div>
    </motion.div>
  );
}
