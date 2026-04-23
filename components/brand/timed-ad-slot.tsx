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
  top: "w-[min(720px,calc(100vw-2rem))] min-h-[68px]",
  left: "w-[128px] min-h-[220px]",
  right: "w-[128px] min-h-[220px]",
};

function sessionKey(id: string) {
  return `mind-reader.ad-closed.${id}`;
}

function isSessionClosed(id: string) {
  return typeof window !== "undefined" && window.sessionStorage.getItem(sessionKey(id)) === "1";
}

export function TimedAdSlot({
  id,
  placement,
  creativeId = "midnight-platform-poster",
  className,
}: TimedAdSlotProps) {
  const creative = adCreatives[creativeId];
  const [secondsLeft, setSecondsLeft] = useState(CLOSE_DELAY_SECONDS);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setClosed(isSessionClosed(id));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [id]);

  useEffect(() => {
    if (closed || secondsLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [closed, secondsLeft]);

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
            window.sessionStorage.setItem(sessionKey(id), "1");
            setClosed(true);
          }}
          className="flex h-7 min-w-7 items-center justify-center border border-[rgba(226,192,118,0.24)] bg-[rgba(9,5,13,0.7)] px-2 text-[0.65rem] text-[#eadbb3] disabled:cursor-not-allowed disabled:opacity-70"
          aria-label={secondsLeft > 0 ? `Ad can be closed in ${secondsLeft} seconds` : "Close ad"}
        >
          {secondsLeft > 0 ? secondsLeft : <X className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className={cn("relative flex h-full gap-3 p-2", compact ? "flex-col" : "items-center")}>
        <div className={cn("relative overflow-hidden", compact ? "aspect-[4/5] w-full" : "h-[54px] w-[120px] shrink-0")}>
          {creative.kind === "video" ? (
            <video
              className="h-full w-full object-cover opacity-75"
              poster={creative.poster}
              muted
              playsInline
              controls={!compact}
              preload="metadata"
              aria-label={creative.alt}
            >
              <source src={creative.src} type="video/webm" />
            </video>
          ) : (
            <Image
              src={creative.src}
              alt={creative.alt}
              fill
              sizes={compact ? "160px" : "180px"}
              className="object-cover opacity-75"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,8,18,0.05),rgba(10,6,14,0.58))]" />
        </div>
        <div className={cn("min-w-0", compact ? "space-y-1 px-1 pb-1" : "pr-8")}>
          <p className="text-[0.55rem] uppercase tracking-[0.18em] text-[#d6a653]/70">Sponsor</p>
          <p className={cn("font-display leading-none text-[#f4e7c8]", compact ? "text-[1.1rem]" : "text-[1.25rem]")}>
            {creative.title}
          </p>
          <p className={cn("leading-5 text-[#d8cab1]/78", compact ? "line-clamp-3 text-[0.68rem]" : "line-clamp-1 text-xs")}>
            {creative.copy}
          </p>
        </div>
      </div>
    </section>
  );
}
