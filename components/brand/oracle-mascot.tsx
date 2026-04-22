"use client";

import type { ComponentProps } from "react";
import { useEffect, useId, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";

import { cn } from "@/lib/utils/cn";
import type { MascotFacing, MascotState } from "@/types/mascot";

export type OracleMood = MascotState;

interface OracleMascotProps extends ComponentProps<"div"> {
  state?: MascotState;
  mood?: OracleMood;
  facing?: MascotFacing;
  reactionKey?: number;
}

const emotionMap: Record<
  MascotState,
  {
    mouth: string;
    leftEye: string;
    rightEye: string;
    leftPupil: { x: number; y: number } | null;
    rightPupil: { x: number; y: number } | null;
    blush: string;
  }
> = {
  idle: {
    mouth: "M127 139c9 7 18 7 27 0",
    leftEye: "M112 116c4-5 10-5 14 0",
    rightEye: "M141 116c4-5 10-5 14 0",
    leftPupil: { x: 0, y: 0 },
    rightPupil: { x: 0, y: 0 },
    blush: "opacity-55",
  },
  thinking: {
    mouth: "M128 142c7 3 15 3 22 0",
    leftEye: "M111 119c6-3 11-3 15 0",
    rightEye: "M142 118c4-6 10-6 14-1",
    leftPupil: { x: 2, y: -1 },
    rightPupil: { x: 3, y: -1 },
    blush: "opacity-35",
  },
  asking: {
    mouth: "M127 141c9 6 19 6 28 0",
    leftEye: "M111 116c5-4 10-4 15 0",
    rightEye: "M141 116c5-4 10-4 15 0",
    leftPupil: { x: 1, y: 0 },
    rightPupil: { x: 2, y: 0 },
    blush: "opacity-50",
  },
  confident: {
    mouth: "M126 141c10 9 21 9 31 0",
    leftEye: "M112 115c5-6 10-6 15 0",
    rightEye: "M141 115c5-6 10-6 15 0",
    leftPupil: { x: 1, y: -1 },
    rightPupil: { x: 2, y: -1 },
    blush: "opacity-70",
  },
  celebration: {
    mouth: "M124 139c12 11 24 11 36 0",
    leftEye: "M111 117c5-7 11-7 16 0",
    rightEye: "M140 117c5-7 11-7 16 0",
    leftPupil: { x: 0, y: 0 },
    rightPupil: { x: 0, y: 0 },
    blush: "opacity-80",
  },
  surprised: {
    mouth: "M137 142a7 7 0 1 1 14 0a7 7 0 1 1 -14 0Z",
    leftEye: "M113 112c4-8 12-8 16 0",
    rightEye: "M142 112c4-8 12-8 16 0",
    leftPupil: null,
    rightPupil: null,
    blush: "opacity-20",
  },
  learning: {
    mouth: "M127 140c8 5 17 5 25 0",
    leftEye: "M112 116c4-4 9-4 13 0",
    rightEye: "M142 118c5-5 10-5 14 0",
    leftPupil: { x: 1, y: 1 },
    rightPupil: { x: 2, y: 1 },
    blush: "opacity-45",
  },
};

const motionProfiles: Record<
  MascotState,
  {
    floatY: number[];
    floatRotate: number[];
    haloScale: number[];
    haloOpacity: number[];
    leftWingRotate: number[];
    rightWingRotate: number[];
    leftArmRotate: number[];
    rightArmRotate: number[];
    bodyRotate: number[];
    bodyY: number[];
    shadowScale: number[];
    blinkDuration: number;
    blinkDelay: number;
  }
> = {
  idle: {
    floatY: [0, -5, 0],
    floatRotate: [0, 0.8, 0],
    haloScale: [1, 1.03, 1],
    haloOpacity: [0.36, 0.44, 0.36],
    leftWingRotate: [0, -3, 0],
    rightWingRotate: [0, 3, 0],
    leftArmRotate: [0, -4, 0],
    rightArmRotate: [0, 4, 0],
    bodyRotate: [0, 0.6, 0],
    bodyY: [0, -1, 0],
    shadowScale: [1, 1.04, 1],
    blinkDuration: 4.4,
    blinkDelay: 1.8,
  },
  thinking: {
    floatY: [0, -4, 0],
    floatRotate: [0, -1.3, 0],
    haloScale: [1, 1.02, 1],
    haloOpacity: [0.34, 0.4, 0.34],
    leftWingRotate: [-2, -6, -2],
    rightWingRotate: [2, 6, 2],
    leftArmRotate: [-8, -12, -8],
    rightArmRotate: [6, 2, 6],
    bodyRotate: [0, -1.5, 0],
    bodyY: [0, -2, 0],
    shadowScale: [1, 1.02, 1],
    blinkDuration: 3.8,
    blinkDelay: 1.1,
  },
  asking: {
    floatY: [0, -4, 0],
    floatRotate: [0, 1, 0],
    haloScale: [1, 1.02, 1],
    haloOpacity: [0.34, 0.4, 0.34],
    leftWingRotate: [-1, -4, -1],
    rightWingRotate: [1, 4, 1],
    leftArmRotate: [-16, -12, -16],
    rightArmRotate: [10, 14, 10],
    bodyRotate: [0, 0.8, 0],
    bodyY: [0, -1, 0],
    shadowScale: [1, 1.03, 1],
    blinkDuration: 4.2,
    blinkDelay: 1.6,
  },
  confident: {
    floatY: [0, -6, 0],
    floatRotate: [0, 1.2, 0],
    haloScale: [1, 1.08, 1],
    haloOpacity: [0.38, 0.52, 0.38],
    leftWingRotate: [-2, -7, -2],
    rightWingRotate: [2, 7, 2],
    leftArmRotate: [-20, -16, -20],
    rightArmRotate: [14, 18, 14],
    bodyRotate: [0, 1.2, 0],
    bodyY: [0, -2, 0],
    shadowScale: [1, 1.06, 1],
    blinkDuration: 4.8,
    blinkDelay: 2.1,
  },
  celebration: {
    floatY: [0, -9, 0],
    floatRotate: [0, 1.4, -1.2, 0],
    haloScale: [1, 1.1, 1],
    haloOpacity: [0.4, 0.56, 0.4],
    leftWingRotate: [-4, -10, -4],
    rightWingRotate: [4, 10, 4],
    leftArmRotate: [-34, -28, -34],
    rightArmRotate: [34, 28, 34],
    bodyRotate: [0, 1.4, -1.1, 0],
    bodyY: [0, -3, 0],
    shadowScale: [1, 1.08, 1],
    blinkDuration: 4.9,
    blinkDelay: 2.6,
  },
  surprised: {
    floatY: [0, -3, 0],
    floatRotate: [0, -1.2, 1.2, 0],
    haloScale: [1, 1.01, 1],
    haloOpacity: [0.32, 0.38, 0.32],
    leftWingRotate: [0, 3, 0],
    rightWingRotate: [0, -3, 0],
    leftArmRotate: [10, 16, 10],
    rightArmRotate: [-10, -16, -10],
    bodyRotate: [0, -2.2, 1.6, 0],
    bodyY: [0, -1, 0],
    shadowScale: [1, 1.02, 1],
    blinkDuration: 3.6,
    blinkDelay: 0.9,
  },
  learning: {
    floatY: [0, -4, 0],
    floatRotate: [0, 0.9, 0],
    haloScale: [1, 1.04, 1],
    haloOpacity: [0.36, 0.46, 0.36],
    leftWingRotate: [-2, -5, -2],
    rightWingRotate: [2, 5, 2],
    leftArmRotate: [-12, -10, -12],
    rightArmRotate: [6, 2, 6],
    bodyRotate: [0, 1, 0],
    bodyY: [0, -1.5, 0],
    shadowScale: [1, 1.04, 1],
    blinkDuration: 4.1,
    blinkDelay: 1.4,
  },
};

export function OracleMascot({
  state,
  mood,
  facing = "right",
  reactionKey,
  className,
  ...props
}: OracleMascotProps) {
  const resolvedState = state ?? mood ?? "idle";
  const emotion = emotionMap[resolvedState];
  const profile = motionProfiles[resolvedState];
  const controls = useAnimationControls();
  const gradientId = useId().replace(/:/g, "");
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (reactionKey === undefined || reactionKey < 1) {
      return;
    }

    controls.start({
      scale: [1, 1.04, 0.98, 1],
      rotate: [0, -1.5, 1.5, 0],
      transition: {
        duration: 0.36,
        ease: [0.22, 1, 0.36, 1],
      },
    });
  }, [controls, reactionKey]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const stateShift =
      resolvedState === "celebration"
        ? {
            scale: [1, 1.07, 0.99, 1],
            y: [0, -8, 0],
            rotate: [0, -2.8, 2.2, 0],
          }
        : resolvedState === "confident"
          ? {
              scale: [1, 1.05, 1],
              y: [0, -6, 0],
              rotate: [0, -1.2, 1.2, 0],
            }
          : resolvedState === "surprised"
            ? {
                scale: [1, 1.03, 1],
                x: [0, -4, 3, 0],
                rotate: [0, -3.2, 2.4, 0],
              }
            : resolvedState === "thinking"
              ? {
                  scale: [1, 1.02, 1],
                  y: [0, -4, 0],
                  rotate: [0, -2.6, 0.6, 0],
                }
              : resolvedState === "learning"
                ? {
                    scale: [1, 1.03, 1],
                    y: [0, -4, 0],
                    rotate: [0, 1.4, 0, 0],
                  }
                : {
                    scale: [1, 1.03, 1],
                    y: [0, -3, 0],
                    rotate: [0, -1.4, 1, 0],
                  };

    controls.start({
      ...stateShift,
      transition: {
        duration: 0.44,
        ease: [0.22, 1, 0.36, 1],
      },
    });
  }, [controls, resolvedState]);

  const wingTransition = {
    duration: resolvedState === "celebration" ? 1.8 : 2.8,
    repeat: Number.POSITIVE_INFINITY,
    ease: "easeInOut" as const,
  };

  const bodyTransition = {
    duration: resolvedState === "celebration" ? 1.8 : 3.2,
    repeat: Number.POSITIVE_INFINITY,
    ease: "easeInOut" as const,
  };

  const blinkTransition = {
    duration: profile.blinkDuration,
    repeat: Number.POSITIVE_INFINITY,
    repeatDelay: profile.blinkDelay,
    ease: "easeInOut" as const,
    times: [0, 0.43, 0.47, 0.51, 0.82, 0.86, 0.9, 1],
  };

  return (
    <div className={cn("relative aspect-[4/5] w-full", className)} {...props}>
      <motion.div className="h-full w-full" animate={controls}>
        <motion.div
          className={cn("h-full w-full", facing === "left" ? "-scale-x-100" : undefined)}
          animate={{ y: profile.floatY, rotate: profile.floatRotate }}
          transition={{
            duration: resolvedState === "celebration" ? 2 : 3.4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 280 340" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>
              <linearGradient
                id={`mora-wing-${gradientId}`}
                x1="42"
                y1="28"
                x2="154"
                y2="198"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#EBDDBA" />
                <stop offset="1" stopColor="#A5D0C5" />
              </linearGradient>
              <linearGradient
                id={`mora-cloak-${gradientId}`}
                x1="95"
                y1="112"
                x2="188"
                y2="292"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4B2044" />
                <stop offset="1" stopColor="#24102C" />
              </linearGradient>
              <linearGradient
                id={`mora-halo-${gradientId}`}
                x1="140"
                y1="24"
                x2="140"
                y2="178"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#F3D590" stopOpacity=".95" />
                <stop offset="1" stopColor="#F3D590" stopOpacity="0" />
              </linearGradient>
            </defs>

            <motion.ellipse
              cx="140"
              cy="318"
              rx="74"
              ry="12"
              fill="#120B17"
              fillOpacity=".6"
              animate={{ scaleX: profile.shadowScale }}
              transition={bodyTransition}
              style={{ transformOrigin: "140px 318px" }}
            />

            <motion.circle
              cx="140"
              cy="90"
              r="74"
              fill={`url(#mora-halo-${gradientId})`}
              animate={{ scale: profile.haloScale, opacity: profile.haloOpacity }}
              transition={bodyTransition}
              style={{ transformOrigin: "140px 90px" }}
            />
            <circle cx="140" cy="90" r="54" stroke="#D8A854" strokeOpacity=".35" />

            <motion.g
              opacity=".95"
              animate={{ rotate: profile.leftWingRotate }}
              transition={wingTransition}
              style={{ transformOrigin: "124px 96px" }}
            >
              <path
                d="M124 164c-42-2-79-29-89-68C25 62 37 29 67 20c35-10 72 11 82 48c7 26-2 67-25 96Z"
                fill={`url(#mora-wing-${gradientId})`}
                stroke="#7C6030"
                strokeOpacity=".7"
              />
              <path d="M110 116c-17-3-32-15-36-31c-3-13 2-27 15-31c16-5 33 5 38 21c3 12-1 29-17 41Z" fill="#5A9E94" fillOpacity=".7" />
              <circle cx="92" cy="94" r="8" fill="#C18A44" fillOpacity=".8" />
              <circle cx="88" cy="58" r="6" fill="#F5E7C5" fillOpacity=".78" />
            </motion.g>

            <motion.g
              opacity=".95"
              animate={{ rotate: profile.rightWingRotate }}
              transition={wingTransition}
              style={{ transformOrigin: "156px 96px" }}
            >
              <path
                d="M156 164c42-2 79-29 89-68c10-34-2-67-32-76c-35-10-72 11-82 48c-7 26 2 67 25 96Z"
                fill={`url(#mora-wing-${gradientId})`}
                stroke="#7C6030"
                strokeOpacity=".7"
              />
              <path d="M170 116c17-3 32-15 36-31c3-13-2-27-15-31c-16-5-33 5-38 21c-3 12 1 29 17 41Z" fill="#5A9E94" fillOpacity=".7" />
              <circle cx="188" cy="94" r="8" fill="#C18A44" fillOpacity=".8" />
              <circle cx="192" cy="58" r="6" fill="#F5E7C5" fillOpacity=".78" />
            </motion.g>

            <motion.g
              animate={{ rotate: profile.bodyRotate, y: profile.bodyY }}
              transition={bodyTransition}
              style={{ transformOrigin: "140px 188px" }}
            >
              <path d="M104 286c10-44 17-84 19-126h34c2 42 9 82 19 126c-22 11-50 11-72 0Z" fill={`url(#mora-cloak-${gradientId})`} />

              <motion.g
                animate={{ rotate: profile.leftArmRotate }}
                transition={bodyTransition}
                style={{ transformOrigin: "118px 214px" }}
              >
                <path d="M117 160c-12 12-26 27-34 47c9 3 21 2 29-2c7-17 11-32 12-45h-7Z" fill="#31163A" />
                <path d="M98 226c-14 2-22 11-25 24" stroke="#E7D7B8" strokeWidth="4" strokeLinecap="round" />
                <circle cx="72" cy="252" r="8" fill="#F0D9A2" />
              </motion.g>

              <motion.g
                animate={{ rotate: profile.rightArmRotate }}
                transition={bodyTransition}
                style={{ transformOrigin: "162px 214px" }}
              >
                <path d="M163 160c12 12 26 27 34 47c-9 3-21 2-29-2c-7-17-11-32-12-45h7Z" fill="#31163A" />
                <path d="M182 226c14 2 22 11 25 24" stroke="#E7D7B8" strokeWidth="4" strokeLinecap="round" />
                <circle cx="208" cy="252" r="8" fill="#F0D9A2" />
              </motion.g>

              <path d="M114 158c7-8 16-13 26-13s19 5 26 13c-7 7-16 10-26 10s-19-3-26-10Z" fill="#E8D7B0" fillOpacity=".92" />
              <circle cx="140" cy="116" r="34" fill="#F5E9C7" stroke="#7C6030" strokeOpacity=".55" />
              <path d="M122 82c4 6 7 14 8 22" stroke="#2E1830" strokeWidth="3" strokeLinecap="round" />
              <path d="M158 82c-4 6-7 14-8 22" stroke="#2E1830" strokeWidth="3" strokeLinecap="round" />
              <path d="M105 80c-8-11-12-24-10-38" stroke="#CFB47A" strokeWidth="3" strokeLinecap="round" />
              <path d="M175 80c8-11 12-24 10-38" stroke="#CFB47A" strokeWidth="3" strokeLinecap="round" />

              <motion.g
                animate={{ scaleY: [1, 1, 1, 0.14, 1, 1, 0.16, 1] }}
                transition={blinkTransition}
                style={{ transformOrigin: "134px 118px" }}
              >
                <path d={emotion.leftEye} stroke="#2B182E" strokeWidth="4.2" strokeLinecap="round" />
                <path d={emotion.rightEye} stroke="#2B182E" strokeWidth="4.2" strokeLinecap="round" />
              </motion.g>

              {emotion.leftPupil && emotion.rightPupil ? (
                <>
                  <motion.circle
                    cx="119"
                    cy="121"
                    r="2.4"
                    fill="#2B182E"
                    animate={{ x: emotion.leftPupil.x, y: emotion.leftPupil.y }}
                    transition={{ duration: 0.34, ease: "easeOut" }}
                  />
                  <motion.circle
                    cx="148"
                    cy="121"
                    r="2.4"
                    fill="#2B182E"
                    animate={{ x: emotion.rightPupil.x, y: emotion.rightPupil.y }}
                    transition={{ duration: 0.34, ease: "easeOut" }}
                  />
                </>
              ) : null}

              <path d={emotion.mouth} stroke="#8A4E5E" strokeWidth="3.5" strokeLinecap="round" />
              <ellipse cx="116" cy="132" rx="8" ry="4.5" fill="#D58A94" className={emotion.blush} />
              <ellipse cx="162" cy="132" rx="8" ry="4.5" fill="#D58A94" className={emotion.blush} />

              <path d="M125 178c9 4 21 4 30 0" stroke="#D4A655" strokeWidth="4" strokeLinecap="round" />
              <circle cx="140" cy="225" r="14" fill="#201127" stroke="#D4A655" strokeOpacity=".6" />
              <motion.circle
                cx="140"
                cy="225"
                r="5"
                fill="#F0D9A2"
                animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.08, 1] }}
                transition={bodyTransition}
                style={{ transformOrigin: "140px 225px" }}
              />
            </motion.g>

            {resolvedState === "thinking" ? (
              <motion.g
                animate={{ opacity: [0.85, 1, 0.85], y: [0, -2, 0] }}
                transition={{ duration: 2.3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <circle cx="220" cy="64" r="18" fill="#EEDFB9" fillOpacity=".92" stroke="#7B5A2B" />
                <circle cx="220" cy="64" r="7" fill="#4E2346" />
                <path d="M220 36v-10M243 49l7-7M197 49l-7-7" stroke="#EEDFB9" strokeWidth="3" strokeLinecap="round" />
              </motion.g>
            ) : null}

            {resolvedState === "asking" ? (
              <motion.g
                animate={{ opacity: [0.7, 1, 0.7], x: [0, 3, 0] }}
                transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <path d="M214 78c13 3 24 11 31 22" stroke="#F0D9A2" strokeWidth="4" strokeLinecap="round" />
                <path d="M232 92l14 8-16 4" stroke="#F0D9A2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </motion.g>
            ) : null}

            {resolvedState === "confident" ? (
              <motion.g
                animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.08, 1] }}
                transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                style={{ transformOrigin: "226px 56px" }}
              >
                <path d="M218 58c8 6 14 14 17 24" stroke="#F0D9A2" strokeWidth="4" strokeLinecap="round" />
                <path d="M226 40l5 10 10 5-10 4-5 10-4-10-10-4 10-5 4-10Z" fill="#F0D9A2" />
              </motion.g>
            ) : null}

            {resolvedState === "celebration" ? (
              <motion.g
                animate={{ opacity: [0.82, 1, 0.82], y: [0, -3, 0] }}
                transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <path d="M48 66l5 10 10 4-10 4-5 10-4-10-10-4 10-4 4-10Z" fill="#F0D9A2" />
                <path d="M232 62l4 8 8 4-8 4-4 8-4-8-8-4 8-4 4-8Z" fill="#F0D9A2" />
                <path d="M210 114l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z" fill="#D58A94" />
              </motion.g>
            ) : null}

            {resolvedState === "surprised" ? (
              <motion.g
                animate={{ opacity: [0.65, 1, 0.65] }}
                transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <path d="M208 74c11 0 20 8 22 18" stroke="#D58A94" strokeWidth="4" strokeLinecap="round" />
                <path d="M53 78c-9 2-16 9-18 17" stroke="#D58A94" strokeWidth="4" strokeLinecap="round" />
              </motion.g>
            ) : null}

            {resolvedState === "learning" ? (
              <motion.g
                animate={{ opacity: [0.72, 1, 0.72], y: [0, -2, 0] }}
                transition={{ duration: 2.1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <rect x="210" y="48" width="24" height="30" rx="6" fill="#F0D9A2" fillOpacity=".92" />
                <path d="M216 58h12M216 64h12M216 70h8" stroke="#7C6030" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M204 88l5 8 8-4" stroke="#F0D9A2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </motion.g>
            ) : null}
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
