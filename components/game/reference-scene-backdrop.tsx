"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";
import type { MascotState } from "@/types/mascot";

export type ChamberSceneKey =
  | "landing"
  | "encounter"
  | "mode-selection"
  | "category-selection"
  | "read-my-mind"
  | "guess-my-mind"
  | "clue-browser"
  | "reveal"
  | "result"
  | "teach-flow"
  | "archive";

interface ReferenceSceneBackdropProps {
  scene: ChamberSceneKey;
  mood?: MascotState;
  className?: string;
}

const sceneArt: Record<
  ChamberSceneKey,
  {
    src: string;
    position: string;
    priority?: boolean;
  }
> = {
  landing: {
    src: "/scene-pack/landing.png",
    position: "object-center",
    priority: true,
  },
  encounter: {
    src: "/scene-pack/encounter.png",
    position: "object-center",
  },
  "mode-selection": {
    src: "/scene-pack/mode-selection.png",
    position: "object-center",
  },
  "category-selection": {
    src: "/scene-pack/category-selection.png",
    position: "object-center",
  },
  "read-my-mind": {
    src: "/scene-pack/read-my-mind.png",
    position: "object-center",
  },
  "guess-my-mind": {
    src: "/scene-pack/guess-my-mind.png",
    position: "object-center",
  },
  "clue-browser": {
    src: "/scene-pack/clue-browser.png",
    position: "object-center",
  },
  reveal: {
    src: "/scene-pack/reveal.png",
    position: "object-center",
  },
  result: {
    src: "/scene-pack/result.png",
    position: "object-center",
  },
  "teach-flow": {
    src: "/scene-pack/teach-flow.png",
    position: "object-center",
  },
  archive: {
    src: "/scene-pack/archive.png",
    position: "object-center",
  },
};

const moodGlow: Record<MascotState, string> = {
  welcome: "bg-[radial-gradient(circle_at_50%_22%,rgba(239,203,134,0.22),transparent_26%)]",
  idle: "bg-[radial-gradient(circle_at_50%_22%,rgba(239,203,134,0.14),transparent_24%)]",
  observing: "bg-[radial-gradient(circle_at_50%_22%,rgba(160,176,221,0.16),transparent_26%)]",
  thinking: "bg-[radial-gradient(circle_at_50%_22%,rgba(163,184,222,0.18),transparent_26%)]",
  asking: "bg-[radial-gradient(circle_at_50%_22%,rgba(239,203,134,0.18),transparent_26%)]",
  confident: "bg-[radial-gradient(circle_at_50%_22%,rgba(247,222,169,0.26),transparent_28%)]",
  teasing: "bg-[radial-gradient(circle_at_50%_22%,rgba(213,148,191,0.18),transparent_28%)]",
  celebration: "bg-[radial-gradient(circle_at_50%_22%,rgba(247,222,169,0.28),transparent_30%)]",
  surprised: "bg-[radial-gradient(circle_at_50%_22%,rgba(162,174,223,0.18),transparent_28%)]",
  learning: "bg-[radial-gradient(circle_at_50%_22%,rgba(198,170,234,0.18),transparent_28%)]",
};

export function ReferenceSceneBackdrop({
  scene,
  mood = "idle",
  className,
}: ReferenceSceneBackdropProps) {
  const art = sceneArt[scene];
  const shouldPulse = mood === "confident" || mood === "celebration" || mood === "surprised";

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: [1.02, 1.05, 1.02],
          x: [0, -6, 0],
          y: [0, 5, 0],
        }}
        transition={{
          duration: shouldPulse ? 8 : 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <Image
          src={art.src}
          alt=""
          fill
          priority={art.priority}
          sizes="100vw"
          className={cn("select-none object-cover opacity-[0.96]", art.position)}
        />
      </motion.div>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,2,8,0.68),rgba(7,4,10,0.2)_28%,rgba(10,7,12,0.06)_52%,rgba(7,4,10,0.7)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(248,228,188,0.16),transparent_16%),radial-gradient(circle_at_50%_92%,rgba(5,2,8,0.9),transparent_35%)]" />
      <div className={cn("absolute inset-0 opacity-95", moodGlow[mood])} />
      <div className="absolute inset-y-0 left-0 w-[20vw] bg-[linear-gradient(90deg,rgba(8,5,10,0.82),transparent)]" />
      <div className="absolute inset-y-0 right-0 w-[20vw] bg-[linear-gradient(270deg,rgba(8,5,10,0.82),transparent)]" />
      <div className="absolute inset-x-[10%] bottom-[10%] h-[26vh] rounded-[50%] bg-[radial-gradient(circle,rgba(6,3,8,0.86),transparent_72%)] blur-2xl" />

      <motion.div
        className="absolute left-[16%] top-[24%] h-2 w-2 rounded-full bg-[rgba(255,240,203,0.76)] blur-[1px]"
        animate={{ opacity: [0.16, 0.58, 0.16], y: [0, -10, 0], x: [0, 4, 0] }}
        transition={{ duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[18%] top-[18%] h-3 w-3 rounded-full bg-[rgba(162,180,224,0.35)] blur-sm"
        animate={{ opacity: [0.12, 0.32, 0.12], y: [0, -14, 0], x: [0, -3, 0] }}
        transition={{ duration: 6.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.8 }}
      />
      <motion.div
        className="absolute left-[48%] top-[14%] h-12 w-12 rounded-full border border-[rgba(255,228,175,0.12)] bg-[radial-gradient(circle,rgba(255,235,190,0.12),rgba(255,235,190,0)_74%)]"
        animate={{ opacity: [0.18, 0.32, 0.18], scale: [0.96, 1.05, 0.96] }}
        transition={{ duration: 7.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
    </div>
  );
}
