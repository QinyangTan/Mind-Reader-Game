import Image from "next/image";

import { adCreatives } from "@/lib/data/ad-creatives";
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
  const creative = adCreatives["pan-am-caribbean-poster"];

  return (
    <aside className={cn("space-y-1 text-right", className)}>
      <p className="px-1 text-[0.48rem] uppercase tracking-[0.22em] text-[#d2b98f]/32">Sponsor</p>
      <div className="group overflow-hidden rounded-[0.8rem] border border-[rgba(214,166,83,0.08)] bg-[rgba(10,7,15,0.4)] shadow-[0_6px_16px_rgba(5,2,9,0.12)] transition-[opacity,border-color] duration-150 hover:border-[rgba(214,166,83,0.14)]">
        <div className="relative aspect-[5/6] overflow-hidden">
          <Image
            src={creative.src}
            alt={creative.alt}
            fill
            sizes="160px"
            className="object-cover opacity-60 transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,8,18,0.16),rgba(10,6,14,0.88))]" />
          <div className="absolute inset-x-0 bottom-0 space-y-1 px-3 py-3 text-left">
            <p className="text-[0.52rem] uppercase tracking-[0.16em] text-[#d6a653]/54">{variants[0].replace("-", " ")}</p>
            <p className="font-display text-[1rem] leading-none text-[#f4e7c8]">{creative.title}</p>
            <p className="text-[0.62rem] leading-5 text-[#d8cab1]/72">{creative.copy}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
