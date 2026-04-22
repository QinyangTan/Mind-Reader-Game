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
        "relative overflow-hidden rounded-[1.8rem] border border-[rgba(245,233,212,0.38)] bg-[linear-gradient(180deg,rgba(245,232,209,0.98),rgba(225,203,174,0.96))] p-6 text-[#2d1b19] shadow-[0_28px_80px_rgba(5,2,7,0.42)] sm:p-7",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.42),transparent_36%)]" />
      <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(120,78,41,0.3),transparent)]" />
      <div className={cn("absolute left-6 top-6 h-2.5 w-2.5 rounded-full opacity-75", toneStyles[tone])} />
      <div className="relative flex h-full flex-col gap-4">
        {(eyebrow || title) && (
          <div className="space-y-2">
            {eyebrow ? <p className="text-sm font-medium tracking-[0.08em] text-[#7d5838]">{eyebrow}</p> : null}
            {title ? <h2 className="font-display text-[2.2rem] leading-[0.94] text-[#2d1b19] sm:text-[2.8rem]">{title}</h2> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
