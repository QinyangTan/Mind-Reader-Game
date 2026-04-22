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
        "flex items-center gap-3 rounded-[1.15rem] border border-[rgba(240,217,162,0.14)] bg-[rgba(18,10,24,0.32)] px-3 py-3",
        compact ? "min-h-[6.5rem]" : "min-h-[8rem] p-4",
        className,
      )}
    >
      <div className={cn("shrink-0", compact ? "w-[5.4rem]" : "w-[7.5rem]")}>
        <OracleMascot
          state={state}
          facing={facing}
          reactionKey={reactionKey}
          className={compact ? "mx-auto max-w-[5.4rem]" : "mx-auto max-w-[7.5rem]"}
        />
      </div>

      <div className="min-w-0 space-y-1">
        <p className={cn("font-semibold text-[#f7efd9]", compact ? "text-sm" : "text-base")}>{title ?? copy.title}</p>
        <p className={cn("leading-6 text-[#dbcdb5]", compact ? "text-xs" : "text-sm")}>{detail ?? copy.detail}</p>
      </div>
    </motion.div>
  );
}
