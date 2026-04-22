"use client";

import { useState } from "react";
import { ArrowRight, Clapperboard, ImageIcon, TrainFront } from "lucide-react";
import Image from "next/image";

import { HouseAdCard, type HouseAdVariant } from "@/components/brand/house-ad-card";
import { adCreatives, type AdCreativeId } from "@/lib/data/ad-creatives";
import { cn } from "@/lib/utils/cn";

type MediaAdCardSize = "leaderboard" | "rectangle" | "mobile";

interface MediaAdCardProps {
  creativeId: AdCreativeId;
  size?: MediaAdCardSize;
  fallbackVariant?: HouseAdVariant;
  className?: string;
}

const layoutClasses: Record<
  MediaAdCardSize,
  {
    shell: string;
    media: string;
    content: string;
    title: string;
    copy: string;
  }
> = {
  leaderboard: {
    shell: "gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.88fr)]",
    media: "min-h-[132px]",
    content: "p-4 md:p-5",
    title: "text-[1.75rem]",
    copy: "text-sm leading-6",
  },
  rectangle: {
    shell: "gap-0",
    media: "min-h-[168px]",
    content: "p-4",
    title: "text-[1.55rem]",
    copy: "text-sm leading-6",
  },
  mobile: {
    shell: "items-stretch gap-3 grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]",
    media: "min-h-[92px]",
    content: "p-3",
    title: "text-[1.15rem]",
    copy: "text-[0.86rem] leading-5",
  },
};

export function MediaAdCard({
  creativeId,
  size = "rectangle",
  fallbackVariant = "featured",
  className,
}: MediaAdCardProps) {
  const creative = adCreatives[creativeId];
  const layout = layoutClasses[size];
  const [mediaFailed, setMediaFailed] = useState(false);

  if (mediaFailed) {
    return <HouseAdCard variant={fallbackVariant} compact={size !== "leaderboard"} className={className} />;
  }

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[1.2rem] border border-[rgba(118,78,39,0.45)] bg-[linear-gradient(180deg,rgba(36,18,28,0.98),rgba(20,10,18,0.98))] shadow-[0_12px_28px_rgba(8,4,13,0.28)]",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[rgba(255,227,170,0.38)]" />

      <div className={cn("grid h-full", layout.shell)}>
        <div className={cn("relative overflow-hidden border-b border-[rgba(214,166,83,0.18)] md:border-b-0 md:border-r", layout.media)}>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,6,12,0.06),rgba(9,6,12,0.28))]" />

          {creative.kind === "image" ? (
            <Image
              src={creative.src}
              alt={creative.alt}
              fill
              sizes={size === "leaderboard" ? "(max-width: 1024px) 100vw, 560px" : size === "mobile" ? "40vw" : "300px"}
              className="object-cover"
              onError={() => setMediaFailed(true)}
            />
          ) : (
            <video
              className="h-full w-full object-cover"
              controls
              muted
              playsInline
              preload="metadata"
              poster={creative.poster}
              aria-label={creative.alt}
              onError={() => setMediaFailed(true)}
            >
              <source src={creative.src} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          )}

          <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-[rgba(255,232,184,0.26)] bg-[rgba(22,11,18,0.74)] px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.18em] text-[#f1ddb0]">
            {creative.kind === "video" ? <Clapperboard className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
            {creative.label}
          </div>
        </div>

        <div className={cn("flex min-w-0 flex-col justify-between gap-3", layout.content)}>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 text-[0.72rem] uppercase tracking-[0.18em] text-[#d6a653]">
              <span>{creative.sponsor}</span>
              <TrainFront className="h-4 w-4 shrink-0" />
            </div>

            <div className="space-y-1.5">
              <h3 className={cn("font-display leading-none text-[#f4e7c8]", layout.title)}>{creative.title}</h3>
              <p className={cn("max-w-sm text-[#dac9ae]", layout.copy)}>{creative.copy}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#f0d9a2]">
            {creative.cta}
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </article>
  );
}
