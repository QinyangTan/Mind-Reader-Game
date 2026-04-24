"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import { adCreatives, type AdCreativeId } from "@/lib/data/ad-creatives";
import { cn } from "@/lib/utils/cn";

type TimedAdPlacement = "top" | "left" | "right";

interface TimedAdSlotProps {
  id: string;
  placement: TimedAdPlacement;
  creativeId?: AdCreativeId;
  className?: string;
}

const CLOSE_DELAY_SECONDS = 15;

const placementClasses: Record<TimedAdPlacement, string> = {
  top: "w-[min(780px,calc(100vw-2rem))] min-h-[94px]",
  left: "w-[144px] min-h-[254px]",
  right: "w-[144px] min-h-[254px]",
};

export function TimedAdSlot({
  id,
  placement,
  creativeId = placement === "top" ? "computer-space-launch" : "pan-am-caribbean-poster",
  className,
}: TimedAdSlotProps) {
  const creative = adCreatives[creativeId];
  const [timerState, setTimerState] = useState({
    id,
    secondsLeft: CLOSE_DELAY_SECONDS,
  });
  const [closedAdId, setClosedAdId] = useState<string | null>(null);
  const closed = closedAdId === id;
  const secondsLeft = timerState.id === id ? timerState.secondsLeft : CLOSE_DELAY_SECONDS;

  useEffect(() => {
    if (closed || secondsLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setTimerState((current) => {
        if (current.id !== id) {
          return {
            id,
            secondsLeft: CLOSE_DELAY_SECONDS - 1,
          };
        }

        return {
          id,
          secondsLeft: Math.max(0, current.secondsLeft - 1),
        };
      });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [closed, id, secondsLeft]);

  if (closed) {
    return null;
  }

  const compact = placement !== "top";

  return (
    <section
      className={cn(
        "pointer-events-auto relative overflow-hidden border border-[rgba(214,166,83,0.18)] bg-[rgba(11,7,16,0.68)] text-[#f4e7c8] shadow-[0_10px_28px_rgba(5,2,9,0.22)] backdrop-blur-[2px]",
        placementClasses[placement],
        className,
      )}
      style={{
        clipPath:
          placement === "top"
            ? "polygon(18px 0, calc(100% - 18px) 0, 100% 26%, 100% 74%, calc(100% - 18px) 100%, 18px 100%, 0 74%, 0 26%)"
            : "polygon(14px 0, calc(100% - 14px) 0, 100% 12%, 100% 88%, calc(100% - 14px) 100%, 14px 100%, 0 88%, 0 12%)",
      }}
      aria-label={`${placement} sponsored space`}
    >
      <div className="absolute right-1 top-1 z-20">
        <button
          type="button"
          disabled={secondsLeft > 0}
          onClick={() => {
            setClosedAdId(id);
          }}
          className="flex h-7 min-w-7 items-center justify-center border border-[rgba(226,192,118,0.24)] bg-[rgba(9,5,13,0.7)] px-2 text-[0.65rem] text-[#eadbb3] disabled:cursor-not-allowed disabled:opacity-70"
          aria-label={secondsLeft > 0 ? `Ad can be closed in ${secondsLeft} seconds` : "Close ad"}
        >
          {secondsLeft > 0 ? secondsLeft : <X className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className={cn("relative flex h-full gap-3 p-2", compact ? "flex-col" : "items-stretch")}>
        <div className={cn("relative overflow-hidden border border-[rgba(233,204,144,0.16)]", compact ? "aspect-[13/20] w-full" : "min-h-[76px] min-w-[208px] shrink-0")}>
          <Image
            src={creative.src}
            alt={creative.alt}
            fill
            sizes={compact ? "160px" : "340px"}
            loading="eager"
            className="object-cover opacity-[0.88]"
            style={{ objectPosition: creative.imagePosition ?? "center" }}
          />
          <div className={cn(
            "absolute inset-0",
            compact
              ? "bg-[linear-gradient(180deg,rgba(10,6,14,0.06),rgba(8,4,11,0.84))]"
              : "bg-[linear-gradient(90deg,rgba(10,6,14,0.1),rgba(8,4,11,0.26)_42%,rgba(8,4,11,0.84))]"
          )} />
          <div className="absolute left-2 top-2 inline-flex items-center rounded-sm border border-[rgba(255,232,184,0.28)] bg-[rgba(22,11,18,0.82)] px-2 py-1 text-[0.54rem] uppercase tracking-[0.18em] text-[#f1ddb0]">
            {creative.label}
          </div>
        </div>
        <div className={cn("min-w-0", compact ? "space-y-1 px-1 pb-1" : "flex min-w-0 flex-1 flex-col justify-between pr-8 pt-1")}>
          <div className={cn(compact ? "space-y-1" : "space-y-1.5")}>
            <p className="text-[0.55rem] uppercase tracking-[0.18em] text-[#d6a653]/72">{creative.sponsor}</p>
            <p className={cn("font-display leading-none text-[#f4e7c8]", compact ? "text-[1.04rem]" : "text-[1.18rem]")}>
              {creative.title}
            </p>
            <p className={cn("leading-5 text-[#d8cab1]/78", compact ? "line-clamp-4 text-[0.67rem]" : "line-clamp-2 text-[0.76rem]")}>
              {creative.copy}
            </p>
          </div>
          {!compact ? (
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[#ead6a5]/74">
              {creative.cta}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
