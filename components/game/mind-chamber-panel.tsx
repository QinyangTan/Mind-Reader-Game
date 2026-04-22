import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

interface MindChamberPanelProps extends ComponentProps<"section"> {
  eyebrow?: string;
  title?: string;
  tone?: "cyan" | "violet" | "emerald";
}

const toneStyles = {
  cyan: "from-[#d6a653] via-[#f0d9a2] to-[#6ca7a1]",
  violet: "from-[#d6a653] via-[#c89253] to-[#b66a74]",
  emerald: "from-[#d6a653] via-[#f0d9a2] to-[#6ca7a1]",
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
        "relative overflow-hidden rounded-[1.7rem] border border-[rgba(214,166,83,0.24)] bg-[linear-gradient(180deg,rgba(52,22,49,0.98),rgba(20,11,28,0.98))] p-5 shadow-[0_18px_48px_rgba(10,5,13,0.34)]",
        className,
      )}
      {...props}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", toneStyles[tone])} />
      <div className="absolute inset-3 rounded-[1.35rem] border border-[rgba(240,217,162,0.12)]" />
      <div className="relative flex h-full flex-col gap-4">
        {(eyebrow || title) && (
          <div className="space-y-1.5">
            {eyebrow ? <p className="brand-tiny-label">{eyebrow.toUpperCase()}</p> : null}
            {title ? <h2 className="font-display text-[2rem] leading-none text-[#f7efd9]">{title}</h2> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
