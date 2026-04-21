import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

interface MindChamberPanelProps extends ComponentProps<"section"> {
  eyebrow?: string;
  title?: string;
  tone?: "cyan" | "violet" | "emerald";
}

const toneStyles = {
  cyan: "from-cyan-300/18 via-cyan-300/6 to-transparent",
  violet: "from-fuchsia-400/18 via-violet-300/8 to-transparent",
  emerald: "from-emerald-300/18 via-cyan-200/6 to-transparent",
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
        "relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/58 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.52)] backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", toneStyles[tone])} />
      <div className="absolute inset-0 bg-[linear-gradient(transparent,rgba(255,255,255,0.02),transparent)] [background-size:100%_14px] opacity-30" />
      <div className="relative flex h-full flex-col gap-4">
        {(eyebrow || title) && (
          <div className="space-y-1">
            {eyebrow ? <p className="text-[0.66rem] uppercase tracking-[0.3em] text-slate-400">{eyebrow}</p> : null}
            {title ? <h2 className="font-display text-2xl leading-none text-white">{title}</h2> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
