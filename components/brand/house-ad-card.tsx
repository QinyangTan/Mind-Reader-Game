import { ArrowRight, BookHeart, Eye, Sparkles, Star, Trophy } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type HouseAdVariant = "nightly-challenge" | "lore-book" | "supporter" | "streak" | "featured";

const creatives: Record<
  HouseAdVariant,
  {
    label: string;
    title: string;
    copy: string;
    cta: string;
    icon: typeof Sparkles;
  }
> = {
  "nightly-challenge": {
    label: "House ad",
    title: "Tonight's Challenge",
    copy: "Read three animals in a row and earn the Moonlight Ribbon.",
    cta: "Play the challenge",
    icon: Trophy,
  },
  "lore-book": {
    label: "Featured",
    title: "Parlor Almanac",
    copy: "New clues, creature notes, and favorite fiction legends are pinned every night.",
    cta: "Open the almanac",
    icon: BookHeart,
  },
  supporter: {
    label: "Sponsor space",
    title: "Support the Parlor",
    copy: "This slot is ready for a 300x250 sponsor without wrecking the play experience.",
    cta: "View sponsor layout",
    icon: Star,
  },
  streak: {
    label: "House ad",
    title: "Streak Reward",
    copy: "Keep a clean read streak and unlock a collector-style result ribbon.",
    cta: "See rewards",
    icon: Eye,
  },
  featured: {
    label: "Featured",
    title: "Midnight Guess-Off",
    copy: "A fresh house creative keeps empty ad space feeling intentional instead of dead.",
    cta: "Learn more",
    icon: Sparkles,
  },
};

interface HouseAdCardProps {
  variant?: HouseAdVariant;
  className?: string;
  compact?: boolean;
}

export function HouseAdCard({
  variant = "featured",
  className,
  compact = false,
}: HouseAdCardProps) {
  const creative = creatives[variant];
  const Icon = creative.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.4rem] border border-[rgba(118,78,39,0.45)] bg-[linear-gradient(180deg,#f1e2bf,#e4ce9e)] p-4 text-[#2e1c1f] shadow-[inset_0_1px_rgba(255,255,255,0.35)]",
        compact && "rounded-[1.1rem] p-3",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#e7c977,#c98d34,#e7c977)]" />
      <div className="relative space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.68rem] tracking-[0.24em] text-[#7a4d2d]">{creative.label.toUpperCase()}</p>
          <Icon className="h-4 w-4 text-[#8b5932]" />
        </div>
        <div className="space-y-1.5">
          <h3 className={cn("font-display text-3xl leading-none text-[#2c1920]", compact && "text-2xl")}>
            {creative.title}
          </h3>
          <p className={cn("text-sm leading-6 text-[#4b3430]", compact && "text-[0.92rem] leading-5")}>
            {creative.copy}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#7a3b36]">
          {creative.cta}
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
