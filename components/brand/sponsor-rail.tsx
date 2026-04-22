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
  const creative = adCreatives["midnight-platform-poster"];

  return (
    <aside className={cn("space-y-1.5 text-right", className)}>
      <p className="px-1 text-[0.55rem] uppercase tracking-[0.28em] text-[#bba57c]/60">Sponsor</p>
      <div className="group overflow-hidden rounded-[1rem] border border-[rgba(214,166,83,0.14)] bg-[rgba(14,10,21,0.42)] shadow-[0_10px_30px_rgba(5,2,9,0.18)] transition-[opacity,border-color,transform] duration-150 hover:border-[rgba(214,166,83,0.24)] hover:opacity-100">
        <div className="relative aspect-[5/6] overflow-hidden">
          <Image
            src={creative.src}
            alt={creative.alt}
            fill
            sizes="160px"
            className="object-cover opacity-80 transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,8,18,0.1),rgba(10,6,14,0.72))]" />
          <div className="absolute inset-x-0 bottom-0 space-y-1 px-3 py-3 text-left">
            <p className="text-[0.58rem] uppercase tracking-[0.22em] text-[#d6a653]/80">{variants[0].replace("-", " ")}</p>
            <p className="font-display text-[1.25rem] leading-none text-[#f4e7c8]">Night Platform Pass</p>
            <p className="text-[0.72rem] leading-5 text-[#d8cab1]">A quiet house ad tucked into the edge of the chamber.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
