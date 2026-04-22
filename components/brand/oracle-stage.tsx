import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { OracleMascot, type OracleMood } from "@/components/brand/oracle-mascot";
import { cn } from "@/lib/utils/cn";

interface OracleStageProps {
  mood?: OracleMood;
  label?: string;
  title: string;
  description: string;
  note?: string;
  children?: ReactNode;
  className?: string;
}

export function OracleStage({
  mood = "idle",
  label = "The Psychic Chamber",
  title,
  description,
  note,
  children,
  className,
}: OracleStageProps) {
  return (
    <aside
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-[rgba(214,166,83,0.42)] bg-[linear-gradient(180deg,rgba(61,24,60,0.98),rgba(26,14,35,0.98))] p-5 shadow-[0_18px_60px_rgba(11,6,16,0.45)]",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#f0d9a2,#d6a653,#f0d9a2)]" />
      <div className="absolute inset-4 rounded-[1.45rem] border border-[rgba(240,217,162,0.12)]" />
      <div className="absolute left-1/2 top-5 h-36 w-36 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(240,217,162,0.18),transparent_66%)]" />

      <div className="relative flex h-full flex-col gap-4">
        <BrandLogo compact tone="light" withTagline />

        <div className="space-y-1">
          <p className="text-xs tracking-[0.28em] text-[#d6a653]">{label.toUpperCase()}</p>
          <h2 className="font-display text-4xl leading-none text-[#f8efd9]">{title}</h2>
          <p className="text-sm leading-6 text-[#d8ceb8]">{description}</p>
        </div>

        <OracleMascot mood={mood} className="mx-auto mt-1 w-full max-w-[15rem]" />

        {children}

        {note ? (
          <div className="rounded-[1.35rem] border border-[rgba(240,217,162,0.18)] bg-[rgba(16,9,22,0.45)] px-4 py-3 text-sm leading-6 text-[#f0e2bf]">
            {note}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
