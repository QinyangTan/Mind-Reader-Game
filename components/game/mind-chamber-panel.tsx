import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

interface MindChamberPanelProps extends ComponentProps<"section"> {
  eyebrow?: string;
  title?: string;
  tone?: "default" | "reveal" | "memory";
}

const toneStyles = {
  default: {
    shell:
      "border-[rgba(119,79,45,0.9)] bg-[linear-gradient(180deg,rgba(243,228,199,0.97),rgba(223,187,139,0.96)_100%)]",
    trim: "bg-[rgba(109,70,39,0.62)]",
  },
  reveal: {
    shell:
      "border-[rgba(146,102,53,0.92)] bg-[linear-gradient(180deg,rgba(247,232,201,0.98),rgba(230,195,145,0.98)_100%)]",
    trim: "bg-[rgba(137,89,43,0.7)]",
  },
  memory: {
    shell:
      "border-[rgba(132,96,52,0.92)] bg-[linear-gradient(180deg,rgba(236,220,190,0.98),rgba(214,183,141,0.98)_100%)]",
    trim: "bg-[rgba(115,82,47,0.68)]",
  },
};

export function MindChamberPanel({
  eyebrow,
  title,
  tone = "default",
  className,
  children,
  ...props
}: MindChamberPanelProps) {
  const palette = toneStyles[tone];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border p-5 text-[#2d1b19] shadow-[0_36px_90px_rgba(4,2,7,0.56)] sm:p-7",
        palette.shell,
        className,
      )}
      {...props}
    >
      <div className="absolute inset-[10px] rounded-[1.35rem] border border-[rgba(253,243,220,0.46)]" />
      <div className="absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0))]" />
      <div className="absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(108,69,38,0.45),transparent)]" />
      <div className="absolute inset-x-10 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(108,69,38,0.42),transparent)]" />
      <div className={cn("absolute left-5 top-5 h-2.5 w-2.5 rounded-full", palette.trim)} />
      <div className={cn("absolute right-5 top-5 h-2.5 w-2.5 rounded-full", palette.trim)} />
      <div className={cn("absolute bottom-5 left-5 h-2.5 w-2.5 rounded-full", palette.trim)} />
      <div className={cn("absolute bottom-5 right-5 h-2.5 w-2.5 rounded-full", palette.trim)} />

      <div className="relative flex h-full flex-col gap-5">
        {(eyebrow || title) && (
          <header className="space-y-2 text-center">
            {eyebrow ? (
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#8a5b24]">{eyebrow}</p>
            ) : null}
            {title ? (
              <h2 className="font-display text-[2.2rem] leading-[0.94] text-[#2d1b19] sm:text-[2.9rem]">
                {title}
              </h2>
            ) : null}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
