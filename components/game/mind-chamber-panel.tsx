import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

interface MindChamberPanelProps extends ComponentProps<"section"> {
  eyebrow?: string;
  title?: string;
  tone?: "cyan" | "violet" | "emerald";
}

const toneStyles = {
  cyan: "bg-[rgba(111,157,166,0.9)]",
  violet: "bg-[rgba(177,111,128,0.86)]",
  emerald: "bg-[rgba(127,176,144,0.9)]",
};

export function MindChamberPanel({
  eyebrow,
  title,
  tone = "cyan",
  className,
  children,
  ...props
}: MindChamberPanelProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[1.45rem] border border-[rgba(214,166,83,0.18)] bg-[linear-gradient(180deg,rgba(25,17,35,0.98),rgba(12,9,19,0.98))] p-5 shadow-[0_26px_54px_rgba(7,4,12,0.34)]",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(240,217,162,0.46),transparent)]" />
      <div className={cn("absolute left-6 top-6 h-2.5 w-2.5 rounded-full", toneStyles[tone])} />
      <div className="absolute inset-3 rounded-[1.2rem] border border-[rgba(240,217,162,0.08)]" />
      <div className="relative flex h-full flex-col gap-4">
        {(eyebrow || title) && (
          <div className="space-y-1.5">
            {eyebrow ? <p className="brand-tiny-label">{eyebrow}</p> : null}
            {title ? <h2 className="font-display text-[2rem] leading-[0.94] text-[#f7efd9]">{title}</h2> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
