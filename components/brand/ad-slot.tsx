import type { ReactNode } from "react";

import { HouseAdCard } from "@/components/brand/house-ad-card";
import { cn } from "@/lib/utils/cn";

type AdSlotSize = "leaderboard" | "rectangle" | "mobile";

interface AdSlotProps {
  size?: AdSlotSize;
  label?: string;
  title?: string;
  className?: string;
  children?: ReactNode;
  fallbackVariant?: "nightly-challenge" | "lore-book" | "supporter" | "streak" | "featured";
}

const sizeClasses: Record<AdSlotSize, string> = {
  leaderboard: "min-h-[108px]",
  rectangle: "min-h-[284px]",
  mobile: "min-h-[88px]",
};

export function AdSlot({
  size = "rectangle",
  label = "Sponsored space",
  title,
  className,
  children,
  fallbackVariant = "supporter",
}: AdSlotProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[1.6rem] border border-[rgba(214,166,83,0.28)] bg-[linear-gradient(180deg,rgba(45,20,48,0.95),rgba(22,12,29,0.95))] p-3 shadow-[0_16px_40px_rgba(12,7,18,0.34)]",
        sizeClasses[size],
        className,
      )}
      aria-label={title ?? label}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#f0d9a2,#d6a653,#f0d9a2)]" />
      <div className="relative flex h-full flex-col gap-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-[0.68rem] tracking-[0.26em] text-[#d6a653]">{label.toUpperCase()}</p>
          {title ? <p className="text-xs text-[#f1e2bf]">{title}</p> : null}
        </div>
        <div className="flex-1">
          {children ?? <HouseAdCard variant={fallbackVariant} compact={size !== "leaderboard"} className="h-full" />}
        </div>
      </div>
    </section>
  );
}
