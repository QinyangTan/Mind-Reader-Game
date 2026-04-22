"use client";

import type { ReactNode } from "react";

import { ParlorStage } from "@/components/game/parlor-stage";
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
  return (
    <div className={cn("relative min-h-screen overflow-hidden bg-[#050309] text-[#f7efd9]", className)}>
      <ReferenceSceneBackdrop scene={scene} mood={mood} />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-[18%] top-[9%] h-[22rem] bg-[radial-gradient(circle,rgba(251,234,199,0.14),transparent_70%)] blur-3xl" />
        <div className="absolute inset-x-[28%] bottom-[12%] h-[16rem] rounded-[50%] border border-[rgba(245,223,176,0.08)] bg-[radial-gradient(circle,rgba(13,7,12,0.18),rgba(13,7,12,0)_72%)]" />
        <div className="absolute left-[8%] top-[4%] h-[78%] w-px bg-[linear-gradient(180deg,transparent,rgba(248,228,188,0.12),transparent)]" />
        <div className="absolute right-[8%] top-[4%] h-[78%] w-px bg-[linear-gradient(180deg,transparent,rgba(248,228,188,0.12),transparent)]" />
      </div>

      <ParlorStage
        header={header}
        support={support}
        footer={footer}
        className={stageClassName}
        contentClassName={contentClassName}
      >
        {children}
      </ParlorStage>
    </div>
  );
}
