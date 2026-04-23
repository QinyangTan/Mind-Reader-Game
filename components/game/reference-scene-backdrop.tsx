"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

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
    src: "/scene-pack/clean/landing.png",
    position: "object-center",
    priority: true,
  },
  encounter: {
    src: "/scene-pack/clean/encounter.png",
    position: "object-center",
  },
  "mode-selection": {
    src: "/scene-pack/clean/mode-selection.png",
    position: "object-center",
  },
  "category-selection": {
    src: "/scene-pack/clean/category-selection.png",
    position: "object-center",
  },
  "read-my-mind": {
    src: "/scene-pack/clean/read-my-mind.png",
    position: "object-center",
  },
  "guess-my-mind": {
    src: "/scene-pack/clean/guess-my-mind.png",
    position: "object-center",
  },
  "clue-browser": {
    src: "/scene-pack/clean/clue-browser.png",
    position: "object-center",
  },
  reveal: {
    src: "/scene-pack/clean/reveal.png",
    position: "object-center",
  },
  result: {
    src: "/scene-pack/clean/result.png",
    position: "object-center",
  },
  "teach-flow": {
    src: "/scene-pack/clean/teach-flow.png",
    position: "object-center",
  },
  archive: {
    src: "/scene-pack/clean/archive.png",
    position: "object-center",
  },
};

const moodGlow: Record<MascotState, string> = {
  welcome: "bg-[linear-gradient(180deg,rgba(239,203,134,0.08),transparent_34%)]",
  idle: "bg-[linear-gradient(180deg,rgba(239,203,134,0.05),transparent_34%)]",
  observing: "bg-[linear-gradient(180deg,rgba(160,176,221,0.06),transparent_34%)]",
  thinking: "bg-[linear-gradient(180deg,rgba(163,184,222,0.07),transparent_34%)]",
  asking: "bg-[linear-gradient(180deg,rgba(239,203,134,0.07),transparent_34%)]",
  confident: "bg-[linear-gradient(180deg,rgba(247,222,169,0.1),transparent_36%)]",
  teasing: "bg-[linear-gradient(180deg,rgba(213,148,191,0.07),transparent_36%)]",
  celebration: "bg-[linear-gradient(180deg,rgba(247,222,169,0.12),transparent_36%)]",
  surprised: "bg-[linear-gradient(180deg,rgba(162,174,223,0.08),transparent_36%)]",
  learning: "bg-[linear-gradient(180deg,rgba(198,170,234,0.08),transparent_36%)]",
};

const scenePresenceGlow: Record<ChamberSceneKey, string> = {
  landing: "right-[8%] top-[18%] h-[38vh] w-[22vw]",
  encounter: "right-[7%] top-[18%] h-[38vh] w-[22vw]",
  "mode-selection": "right-[7%] top-[16%] h-[38vh] w-[22vw]",
  "category-selection": "right-[7%] top-[16%] h-[38vh] w-[22vw]",
  "read-my-mind": "left-[6%] top-[18%] h-[38vh] w-[22vw]",
  "guess-my-mind": "right-[7%] top-[16%] h-[38vh] w-[22vw]",
  "clue-browser": "right-[7%] top-[16%] h-[38vh] w-[22vw]",
  reveal: "left-[6%] top-[18%] h-[38vh] w-[22vw]",
  result: "left-[6%] top-[18%] h-[38vh] w-[22vw]",
  "teach-flow": "left-[6%] top-[18%] h-[38vh] w-[22vw]",
  archive: "right-[8%] top-[18%] h-[36vh] w-[20vw]",
};

const moodPresenceTone: Record<MascotState, string> = {
  welcome: "bg-[radial-gradient(circle,rgba(245,219,170,0.16),rgba(167,116,228,0.08),transparent_72%)]",
  idle: "bg-[radial-gradient(circle,rgba(245,219,170,0.1),rgba(167,116,228,0.06),transparent_72%)]",
  observing: "bg-[radial-gradient(circle,rgba(172,189,230,0.11),rgba(150,116,206,0.07),transparent_72%)]",
  thinking: "bg-[radial-gradient(circle,rgba(169,190,228,0.13),rgba(140,108,190,0.08),transparent_72%)]",
  asking: "bg-[radial-gradient(circle,rgba(245,219,170,0.13),rgba(167,116,228,0.08),transparent_72%)]",
  confident: "bg-[radial-gradient(circle,rgba(247,228,187,0.16),rgba(176,128,237,0.09),transparent_72%)]",
  teasing: "bg-[radial-gradient(circle,rgba(224,157,209,0.12),rgba(173,119,223,0.08),transparent_72%)]",
  celebration: "bg-[radial-gradient(circle,rgba(247,228,187,0.18),rgba(188,140,239,0.09),transparent_72%)]",
  surprised: "bg-[radial-gradient(circle,rgba(179,195,234,0.12),rgba(139,108,190,0.08),transparent_72%)]",
  learning: "bg-[radial-gradient(circle,rgba(206,182,237,0.13),rgba(154,119,211,0.08),transparent_72%)]",
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
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={art.src}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
          animate={{
            opacity: 1,
            scale: [1.02, 1.05, 1.02],
            x: [0, -6, 0],
            y: [0, 5, 0],
            filter: "blur(0px)",
          }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
          transition={{
            opacity: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: shouldPulse ? 8 : 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            x: { duration: shouldPulse ? 8 : 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            y: { duration: shouldPulse ? 8 : 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            filter: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
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
      </AnimatePresence>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,2,8,0.62),rgba(7,4,10,0.16)_28%,rgba(10,7,12,0.05)_52%,rgba(7,4,10,0.7)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_92%,rgba(5,2,8,0.9),transparent_35%)]" />
      <div className={cn("absolute inset-0 opacity-95", moodGlow[mood])} />
      <motion.div
        className={cn(
          "pointer-events-none absolute rounded-[50%] blur-[100px] mix-blend-screen",
          scenePresenceGlow[scene],
          moodPresenceTone[mood],
        )}
        animate={{
          opacity: [0.08, 0.18, 0.1],
          scale: [0.96, 1.03, 0.98],
          y: [0, -8, 0],
        }}
        transition={{
          duration: shouldPulse ? 5.8 : 9.4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
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
    </div>
  );
}
