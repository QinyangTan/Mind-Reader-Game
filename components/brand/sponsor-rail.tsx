import { AdSlot } from "@/components/brand/ad-slot";
import { MediaAdCard } from "@/components/brand/media-ad-card";
import { cn } from "@/lib/utils/cn";

interface SponsorRailProps {
  context?: "landing" | "setup" | "read" | "guess" | "result";
  className?: string;
}

const contextMap = {
  landing: ["featured", "lore-book"] as const,
  setup: ["supporter", "nightly-challenge"] as const,
  read: ["streak", "supporter"] as const,
  guess: ["nightly-challenge", "lore-book"] as const,
  result: ["featured", "supporter"] as const,
};

export function SponsorRail({ context = "landing", className }: SponsorRailProps) {
  const variants = contextMap[context];

  return (
    <aside className={cn("space-y-4", className)}>
      <div className="rounded-[1.15rem] border border-[rgba(214,166,83,0.18)] bg-[rgba(14,10,21,0.58)] px-4 py-3 text-sm leading-6 text-[#dbcdb5]">
        <p className="text-[0.68rem] tracking-[0.26em] text-[#d6a653]">NOTICE BOARD</p>
        Framed sponsor and house notices stay on the chamber wall so the center ritual remains dominant.
      </div>

      <AdSlot size="rectangle" title="Poster sponsor" fallbackVariant={variants[0]}>
        <MediaAdCard creativeId="midnight-platform-poster" fallbackVariant={variants[0]} />
      </AdSlot>
      <AdSlot size="rectangle" title="Video sponsor" fallbackVariant={variants[1]} className="hidden xl:block">
        <MediaAdCard creativeId="moonline-preview-video" fallbackVariant={variants[1]} />
      </AdSlot>
    </aside>
  );
}
