"use client";

import type { ReactNode } from "react";

import { TimedAdSlot } from "@/components/brand/timed-ad-slot";
import {
  ReferenceSceneBackdrop,
  type ChamberSceneKey,
} from "@/components/game/reference-scene-backdrop";
import { cn } from "@/lib/utils/cn";
import type { MascotState } from "@/types/mascot";

interface ChamberSceneShellProps {
  scene: ChamberSceneKey;
  mood?: MascotState;
  header?: ReactNode;
  support?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  stageClassName?: string;
}

const sceneLayouts: Record<
  ChamberSceneKey,
  {
    stage: string;
    content: string;
    shell: string;
    support: string;
  }
> = {
  landing: {
    stage: "px-4 pb-6 pt-4 sm:px-6 lg:px-10",
    content: "min-h-[calc(100vh-2rem)] items-end justify-center pt-[11vh] pb-[6vh]",
    shell: "max-w-[780px]",
    support: "hidden",
  },
  encounter: {
    stage: "px-4 pb-6 pt-4 sm:px-6 lg:px-10",
    content: "min-h-[calc(100vh-2rem)] items-end justify-center pt-[22vh] pb-[8vh]",
    shell: "max-w-[780px]",
    support: "hidden",
  },
  "mode-selection": {
    stage: "px-4 pb-6 pt-4 sm:px-6 lg:px-10",
    content: "min-h-[calc(100vh-2rem)] items-end justify-center pt-[22vh] pb-[8vh]",
    shell: "max-w-[960px]",
    support: "bottom-6 right-3 hidden w-[110px] opacity-[0.22] hover:opacity-[0.42] 2xl:block",
  },
  "category-selection": {
    stage: "px-4 pb-6 pt-4 sm:px-6 lg:px-10",
    content: "min-h-[calc(100vh-2rem)] items-end justify-center pt-[22vh] pb-[8vh]",
    shell: "max-w-[960px]",
    support: "bottom-6 right-3 hidden w-[110px] opacity-[0.22] hover:opacity-[0.42] 2xl:block",
  },
  "read-my-mind": {
    stage: "px-4 pb-5 pt-4 sm:px-6 lg:px-10",
    content: "min-h-[calc(100vh-2rem)] items-end justify-center pt-[22vh] pb-[5vh]",
    shell: "max-w-[920px]",
    support: "bottom-5 right-3 hidden w-[108px] opacity-[0.18] hover:opacity-[0.36] 2xl:block",
  },
  "guess-my-mind": {
    stage: "px-4 pb-5 pt-4 sm:px-6 lg:px-10",
    content: "min-h-[calc(100vh-2rem)] items-end justify-center pt-[20vh] pb-[5vh]",
    shell: "max-w-[960px]",
    support: "bottom-5 right-3 hidden w-[108px] opacity-[0.18] hover:opacity-[0.36] 2xl:block",
  },
  "clue-browser": {
    stage: "px-4 pb-5 pt-4 sm:px-6 lg:px-10",
    content: "min-h-[calc(100vh-2rem)] items-end justify-center pt-[19vh] pb-[4.5vh]",
    shell: "max-w-[980px]",
    support: "bottom-5 right-3 hidden w-[108px] opacity-[0.18] hover:opacity-[0.36] 2xl:block",
  },
  reveal: {
    stage: "px-4 pb-5 pt-4 sm:px-6 lg:px-10",
    content: "min-h-[calc(100vh-2rem)] items-center justify-center pt-[10vh] pb-[6vh]",
    shell: "max-w-[980px]",
    support: "hidden",
  },
  result: {
    stage: "px-4 pb-5 pt-4 sm:px-6 lg:px-10",
    content: "min-h-[calc(100vh-2rem)] items-end justify-center pt-[20vh] pb-[5vh]",
    shell: "max-w-[940px]",
    support: "bottom-5 right-3 hidden w-[108px] opacity-[0.16] hover:opacity-[0.32] 2xl:block",
  },
  "teach-flow": {
    stage: "px-4 pb-5 pt-4 sm:px-6 lg:px-10",
    content: "min-h-[calc(100vh-2rem)] items-end justify-center pt-[20vh] pb-[5vh]",
    shell: "max-w-[940px]",
    support: "bottom-5 right-3 hidden w-[108px] opacity-[0.16] hover:opacity-[0.32] 2xl:block",
  },
  archive: {
    stage: "px-4 pb-6 pt-4 sm:px-6 lg:px-10",
    content: "min-h-[calc(100vh-2rem)] items-start justify-center pt-[12vh] pb-[8vh]",
    shell: "max-w-[1100px]",
    support: "hidden",
  },
};

export function ChamberSceneShell({
  scene,
  mood = "idle",
  header,
  support,
  footer,
  children,
  className,
  contentClassName,
  stageClassName,
}: ChamberSceneShellProps) {
  const layout = sceneLayouts[scene];

  return (
    <div
      className={cn(
        "relative min-h-screen bg-[#050309] text-[#f7efd9]",
        scene === "archive" ? "overflow-x-hidden overflow-y-auto" : "overflow-hidden",
        className,
      )}
    >
      <ReferenceSceneBackdrop scene={scene} mood={mood} />

      <div className="pointer-events-none absolute inset-0 z-[12] hidden lg:block">
        <TimedAdSlot
          id="top-leaderboard"
          placement="top"
          creativeId="computer-space-launch"
          className="absolute left-1/2 top-3 -translate-x-1/2 opacity-82"
        />
        <TimedAdSlot
          id="left-rail"
          placement="left"
          creativeId="pan-am-caribbean-poster"
          className="absolute left-3 top-[28vh] opacity-72"
        />
        <TimedAdSlot
          id="right-rail"
          placement="right"
          creativeId="computer-space-side"
          className="absolute right-3 top-[28vh] opacity-72"
        />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-[28%] bottom-[12%] h-[16rem] rounded-[50%] border border-[rgba(245,223,176,0.08)] bg-[radial-gradient(circle,rgba(13,7,12,0.18),rgba(13,7,12,0)_72%)]" />
        <div className="absolute left-[8%] top-[4%] h-[78%] w-px bg-[linear-gradient(180deg,transparent,rgba(248,228,188,0.12),transparent)]" />
        <div className="absolute right-[8%] top-[4%] h-[78%] w-px bg-[linear-gradient(180deg,transparent,rgba(248,228,188,0.12),transparent)]" />
      </div>

      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col",
          layout.stage,
          stageClassName,
        )}
      >
        {header ? <header className="relative z-30">{header}</header> : null}

        <div className={cn("relative flex flex-1", layout.content, contentClassName)}>
          <main className="relative z-20 flex w-full justify-center">
            <div className={cn("w-full", layout.shell)}>{children}</div>
          </main>

          {support ? (
            <aside
              className={cn(
                "pointer-events-auto absolute z-20 transition-opacity duration-150",
                layout.support,
              )}
            >
              {support}
            </aside>
          ) : null}
        </div>

        {footer ? <footer className="relative z-20">{footer}</footer> : null}
      </div>
    </div>
  );
}
