"use client";

import { motion } from "framer-motion";

import { OracleMascot } from "@/components/brand/oracle-mascot";
import { getMascotCopy } from "@/lib/game/mascot";
import { cn } from "@/lib/utils/cn";
import type { GameMode } from "@/types/game";
import type { MascotFacing, MascotState } from "@/types/mascot";

interface PsychicPresenceProps {
  state: MascotState;
  mode?: GameMode;
  facing?: MascotFacing;
  reactionKey?: number;
  className?: string;
}

export function PsychicPresence({
  state,
  mode,
  facing = "right",
  reactionKey,
  className,
}: PsychicPresenceProps) {
  const copy = getMascotCopy(state, mode);

  return (
    <div className={cn("relative h-full min-h-[20rem] w-full", className)}>
      <div className="absolute inset-x-[16%] bottom-[6%] h-[3.8rem] rounded-[50%] bg-[radial-gradient(circle,rgba(7,4,10,0.9),transparent_74%)] blur-lg" />
      <div className="absolute left-[18%] top-[14%] h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(circle,rgba(238,221,181,0.16),transparent_68%)] blur-3xl" />
      <div className="absolute bottom-[12%] left-[12%] h-[10rem] w-[10rem] rounded-full bg-[radial-gradient(circle,rgba(126,145,205,0.16),transparent_66%)] blur-3xl" />
      <div className="absolute bottom-[15%] right-[16%] h-[9rem] w-[9rem] rounded-full bg-[radial-gradient(circle,rgba(105,72,132,0.18),transparent_68%)] blur-3xl" />

      <motion.div
        className="absolute left-[6%] top-[12%] h-10 w-10 rounded-full border border-[rgba(240,217,162,0.16)] bg-[radial-gradient(circle,rgba(240,217,162,0.22),rgba(240,217,162,0)_68%)]"
        animate={{ opacity: [0.25, 0.65, 0.25], scale: [0.94, 1.06, 0.94] }}
        transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[10%] top-[24%] h-5 w-5 rounded-full border border-[rgba(240,217,162,0.14)] bg-[radial-gradient(circle,rgba(157,182,224,0.22),rgba(157,182,224,0)_72%)]"
        animate={{ opacity: [0.15, 0.45, 0.15], y: [0, -6, 0] }}
        transition={{ duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[24%] right-[22%] h-6 w-6 rounded-full border border-[rgba(240,217,162,0.12)] bg-[radial-gradient(circle,rgba(217,166,83,0.2),rgba(217,166,83,0)_74%)]"
        animate={{ opacity: [0.15, 0.38, 0.15], y: [0, -8, 0], x: [0, 3, 0] }}
        transition={{ duration: 4.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.8 }}
      />

      <div className="absolute bottom-[4%] left-[10%] max-w-[16rem]">
        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#d6a653]/72">Mora</p>
        <p className="mt-1 text-sm leading-6 text-[#d9cfbe]/92">{copy.title}</p>
      </div>

      <div className="relative mx-auto h-full w-full max-w-[38rem] xl:max-w-[44rem]">
        <OracleMascot
          state={state}
          facing={facing}
          reactionKey={reactionKey}
          className="absolute bottom-[8%] left-1/2 w-full max-w-[30rem] -translate-x-1/2 xl:max-w-[40rem]"
        />
      </div>
    </div>
  );
}
