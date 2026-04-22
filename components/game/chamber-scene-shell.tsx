"use client";

import type { ReactNode } from "react";

import { AmbientBackdrop } from "@/components/game/ambient-backdrop";
import { ParlorStage } from "@/components/game/parlor-stage";
import { cn } from "@/lib/utils/cn";

interface ChamberSceneShellProps {
  header?: ReactNode;
  mascot?: ReactNode;
  sponsor?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ChamberSceneShell({
  header,
  mascot,
  sponsor,
  footer,
  children,
  className,
  contentClassName,
}: ChamberSceneShellProps) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden bg-[#09060c] text-[#f7efd9]", className)}>
      <AmbientBackdrop />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(136,112,72,0.18),transparent_45%)]" />
        <div className="absolute left-[-4rem] top-[-2rem] h-[44rem] w-[20rem] bg-[linear-gradient(180deg,rgba(58,18,38,0.72),rgba(16,8,18,0.08))] blur-[2px]" />
        <div className="absolute right-[-4rem] top-[-2rem] h-[44rem] w-[20rem] bg-[linear-gradient(180deg,rgba(40,16,48,0.74),rgba(16,8,18,0.1))] blur-[2px]" />
        <div className="absolute left-[8%] top-[8%] h-[55%] w-[1px] bg-[linear-gradient(180deg,transparent,rgba(240,217,162,0.18),transparent)]" />
        <div className="absolute right-[9%] top-[8%] h-[55%] w-[1px] bg-[linear-gradient(180deg,transparent,rgba(240,217,162,0.16),transparent)]" />
        <div className="absolute inset-x-[18%] bottom-[18%] h-[9rem] rounded-[50%] bg-[radial-gradient(circle,rgba(13,10,18,0.92),transparent_70%)] blur-xl" />
        <div className="absolute inset-x-[26%] bottom-[15%] h-[13rem] rounded-[50%] border border-[rgba(240,217,162,0.08)] bg-[radial-gradient(circle,rgba(66,40,28,0.3),rgba(19,12,20,0)_72%)]" />
        <div className="absolute left-1/2 top-[17%] h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(120,130,188,0.1),transparent_68%)] blur-3xl" />
      </div>

      <ParlorStage
        header={header}
        host={mascot}
        support={sponsor}
        footer={footer}
        contentClassName={cn("xl:justify-center xl:pl-[24%] xl:pr-[4%]", contentClassName)}
      >
        {children}
      </ParlorStage>
    </div>
  );
}
