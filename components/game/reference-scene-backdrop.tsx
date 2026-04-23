"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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

type AtmosphereLevel = "rich" | "moderate" | "quiet" | "heightened" | "calm";

const sceneAtmosphere: Record<ChamberSceneKey, AtmosphereLevel> = {
  landing: "rich",
  encounter: "rich",
  "mode-selection": "moderate",
  "category-selection": "moderate",
  "read-my-mind": "quiet",
  "guess-my-mind": "quiet",
  "clue-browser": "quiet",
  reveal: "heightened",
  result: "heightened",
  "teach-flow": "moderate",
  archive: "calm",
};

const atmosphereConfig: Record<
  AtmosphereLevel,
  {
    dustCount: number;
    dustOpacity: number;
    smokeOpacity: number;
    flickerOpacity: number;
    shimmerOpacity: number;
    breathOpacity: number;
    durationScale: number;
  }
> = {
  rich: {
    dustCount: 6,
    dustOpacity: 0.46,
    smokeOpacity: 0.34,
    flickerOpacity: 0.58,
    shimmerOpacity: 0.16,
    breathOpacity: 0.18,
    durationScale: 0.9,
  },
  moderate: {
    dustCount: 4,
    dustOpacity: 0.32,
    smokeOpacity: 0.24,
    flickerOpacity: 0.36,
    shimmerOpacity: 0.11,
    breathOpacity: 0.13,
    durationScale: 1,
  },
  quiet: {
    dustCount: 2,
    dustOpacity: 0.18,
    smokeOpacity: 0.16,
    flickerOpacity: 0.22,
    shimmerOpacity: 0.07,
    breathOpacity: 0.08,
    durationScale: 1.2,
  },
  heightened: {
    dustCount: 5,
    dustOpacity: 0.4,
    smokeOpacity: 0.3,
    flickerOpacity: 0.54,
    shimmerOpacity: 0.18,
    breathOpacity: 0.2,
    durationScale: 0.82,
  },
  calm: {
    dustCount: 3,
    dustOpacity: 0.22,
    smokeOpacity: 0.18,
    flickerOpacity: 0.2,
    shimmerOpacity: 0.08,
    breathOpacity: 0.1,
    durationScale: 1.35,
  },
};

const dustMotes = [
  { left: "11%", top: "23%", size: 2, duration: 13.6, delay: 0.1, x: 12, y: -32, color: "rgba(255,238,195,0.64)" },
  { left: "22%", top: "61%", size: 2, duration: 15.8, delay: 1.4, x: -9, y: -26, color: "rgba(191,204,242,0.36)" },
  { left: "39%", top: "19%", size: 2, duration: 17.2, delay: 0.8, x: 7, y: -36, color: "rgba(255,221,156,0.44)" },
  { left: "67%", top: "24%", size: 2, duration: 16.8, delay: 1.8, x: -8, y: -34, color: "rgba(171,194,240,0.34)" },
  { left: "78%", top: "57%", size: 2, duration: 14.6, delay: 0.3, x: 9, y: -24, color: "rgba(255,225,167,0.42)" },
  { left: "88%", top: "31%", size: 2, duration: 18.4, delay: 2.6, x: -10, y: -38, color: "rgba(247,222,169,0.38)" },
];

const smokeWisps = [
  { className: "left-[-2%] bottom-[10%] h-[24rem] w-[17rem]", x: 34, y: -14, delay: 0 },
  { className: "right-[-1%] bottom-[13%] h-[23rem] w-[16rem]", x: -30, y: -12, delay: 2.1 },
  { className: "left-[24%] top-[5%] h-[14rem] w-[26rem]", x: 22, y: 8, delay: 4.2 },
];

const candleGlints = [
  { className: "left-[7%] bottom-[24%] h-20 w-20", delay: 0 },
  { className: "right-[8%] bottom-[25%] h-20 w-20", delay: 0.9 },
  { className: "left-[18%] top-[17%] h-14 w-14", delay: 1.8 },
  { className: "right-[21%] top-[15%] h-14 w-14", delay: 2.4 },
];

function AmbientAtmosphere({
  scene,
  reduceMotion,
  shouldPulse,
}: {
  scene: ChamberSceneKey;
  reduceMotion: boolean;
  shouldPulse: boolean;
}) {
  const config = atmosphereConfig[sceneAtmosphere[scene]];
  const dust = dustMotes.slice(0, reduceMotion ? Math.min(3, config.dustCount) : config.dustCount);

  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-x-[16%] bottom-[6%] h-[42vh] rounded-[50%] bg-[radial-gradient(circle_at_50%_78%,rgba(246,211,144,0.32),rgba(114,71,137,0.12)_38%,transparent_72%)] blur-3xl mix-blend-screen"
        style={{ opacity: reduceMotion ? config.breathOpacity * 0.42 : undefined }}
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [config.breathOpacity * 0.42, config.breathOpacity, config.breathOpacity * 0.5],
                scale: [0.98, 1.035, 0.99],
                y: [0, -5, 0],
              }
        }
        transition={{
          duration: (shouldPulse ? 7.8 : 13.5) * config.durationScale,
          repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "linear-gradient(112deg,transparent 0%,rgba(245,222,175,0.045) 24%,transparent 45%,rgba(172,188,232,0.036) 74%,transparent 100%)",
          opacity: reduceMotion ? config.shimmerOpacity * 0.45 : undefined,
        }}
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [config.shimmerOpacity * 0.35, config.shimmerOpacity, config.shimmerOpacity * 0.45],
                x: ["-3%", "3%", "-2%"],
              }
        }
        transition={{
          duration: (shouldPulse ? 7.2 : 14) * config.durationScale,
          repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {smokeWisps.map((wisp) => (
        <motion.div
          key={wisp.className}
          className={cn(
            "pointer-events-none absolute rounded-[50%] bg-[radial-gradient(circle,rgba(210,198,222,0.36),rgba(120,103,151,0.12)_44%,transparent_74%)] blur-3xl",
            wisp.className,
          )}
          style={{ opacity: reduceMotion ? config.smokeOpacity * 0.4 : undefined }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [config.smokeOpacity * 0.25, config.smokeOpacity, config.smokeOpacity * 0.38],
                  x: [0, wisp.x, 0],
                  y: [0, wisp.y, 0],
                  scale: [0.96, 1.08, 0.98],
                }
          }
          transition={{
            duration: (16 + wisp.delay) * config.durationScale,
            delay: wisp.delay,
            repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      {candleGlints.map((glint) => (
        <motion.div
          key={glint.className}
          className={cn(
            "pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(255,226,159,0.7),rgba(214,146,72,0.18)_34%,transparent_70%)] blur-xl mix-blend-screen",
            glint.className,
          )}
          style={{ opacity: reduceMotion ? config.flickerOpacity * 0.4 : undefined }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [
                    config.flickerOpacity * 0.22,
                    config.flickerOpacity,
                    config.flickerOpacity * 0.34,
                    config.flickerOpacity * 0.76,
                  ],
                  scale: [0.88, 1.08, 0.94, 1.02],
                }
          }
          transition={{
            duration: (3.8 + glint.delay) * config.durationScale,
            delay: glint.delay,
            repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      {dust.map((mote) => (
        <motion.div
          key={`${mote.left}-${mote.top}`}
          className="pointer-events-none absolute rounded-full blur-[1px] mix-blend-screen"
          style={{
            left: mote.left,
            top: mote.top,
            width: mote.size,
            height: mote.size,
            backgroundColor: mote.color,
            opacity: reduceMotion ? config.dustOpacity * 0.35 : undefined,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0, config.dustOpacity, 0.08, config.dustOpacity * 0.5, 0],
                  x: [0, mote.x * 0.35, mote.x, mote.x * 0.5],
                  y: [0, mote.y * 0.35, mote.y, mote.y * 0.8],
                  scale: [0.7, 1.08, 0.9, 1],
                }
          }
          transition={{
            duration: mote.duration * config.durationScale,
            delay: mote.delay,
            repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

export function ReferenceSceneBackdrop({
  scene,
  mood = "idle",
  className,
}: ReferenceSceneBackdropProps) {
  const art = sceneArt[scene];
  const reduceMotion = useReducedMotion() ?? false;
  const shouldPulse = mood === "confident" || mood === "celebration" || mood === "surprised";

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={art.src}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
          animate={
            reduceMotion
              ? {
                  opacity: 1,
                  scale: 1.02,
                  x: 0,
                  y: 0,
                  filter: "blur(0px)",
                }
              : {
                  opacity: 1,
                  scale: [1.02, 1.05, 1.02],
                  x: [0, -6, 0],
                  y: [0, 5, 0],
                  filter: "blur(0px)",
                }
          }
          exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
          transition={{
            opacity: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: shouldPulse ? 8 : 18, repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY, ease: "easeInOut" },
            x: { duration: shouldPulse ? 8 : 18, repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY, ease: "easeInOut" },
            y: { duration: shouldPulse ? 8 : 18, repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY, ease: "easeInOut" },
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
      <AmbientAtmosphere scene={scene} reduceMotion={reduceMotion} shouldPulse={shouldPulse} />
      <motion.div
        className={cn(
          "pointer-events-none absolute rounded-[50%] blur-[100px] mix-blend-screen",
          scenePresenceGlow[scene],
          moodPresenceTone[mood],
        )}
        animate={
          reduceMotion
            ? { opacity: 0.1, scale: 0.98, y: 0 }
            : {
                opacity: [0.08, 0.18, 0.1],
                scale: [0.96, 1.03, 0.98],
                y: [0, -8, 0],
              }
        }
        transition={{
          duration: shouldPulse ? 5.8 : 9.4,
          repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <div className="absolute inset-y-0 left-0 w-[20vw] bg-[linear-gradient(90deg,rgba(8,5,10,0.82),transparent)]" />
      <div className="absolute inset-y-0 right-0 w-[20vw] bg-[linear-gradient(270deg,rgba(8,5,10,0.82),transparent)]" />
      <div className="absolute inset-x-[10%] bottom-[10%] h-[26vh] rounded-[50%] bg-[radial-gradient(circle,rgba(6,3,8,0.86),transparent_72%)] blur-2xl" />

    </div>
  );
}
