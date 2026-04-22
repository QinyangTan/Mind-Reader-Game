import Image from "next/image";

import { cn } from "@/lib/utils/cn";

interface BrandLogoProps {
  compact?: boolean;
  tone?: "light" | "dark";
  className?: string;
  markClassName?: string;
  withTagline?: boolean;
  withDescription?: boolean;
}

export function BrandLogo({
  compact = false,
  tone = "light",
  className,
  markClassName,
  withTagline = false,
  withDescription = true,
}: BrandLogoProps) {
  if (compact) {
    return (
      <div className={cn("inline-flex items-center gap-3", className)}>
        <Image
          src="/brand/logo-mark.svg"
          alt="Mind Reader"
          width={48}
          height={48}
          className={cn("h-12 w-12 shrink-0", markClassName)}
        />
        {withTagline ? (
          <div className="space-y-0.5">
            <p className={cn("text-xl font-semibold", tone === "light" ? "text-[#f5e7c5]" : "text-[#2f1931]")}>
              Mind Reader
            </p>
            <p className={cn("text-xs tracking-[0.26em]", tone === "light" ? "text-[#d5b06a]" : "text-[#936522]")}>
              THE PSYCHIC CHAMBER
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex max-w-full items-center gap-4 sm:gap-5", className)}>
      <Image
        src="/brand/logo-mark.svg"
        alt="Mind Reader"
        width={88}
        height={88}
        className={cn("h-16 w-16 shrink-0 sm:h-[5.5rem] sm:w-[5.5rem]", markClassName)}
      />
      <div className="min-w-0">
        <p
          className={cn(
            "font-display text-[2.6rem] leading-[0.92] tracking-[0.03em] sm:text-[4rem]",
            tone === "light" ? "text-[#f5e7c5]" : "text-[#2f1931]",
          )}
        >
          Mind Reader
        </p>
        <p
          className={cn(
            "mt-2 text-[0.72rem] font-bold tracking-[0.42em] sm:text-[0.82rem]",
            tone === "light" ? "text-[#d5b06a]" : "text-[#936522]",
          )}
        >
          THE PSYCHIC CHAMBER
        </p>
        <div
          className={cn(
            "mt-3 h-px w-full",
            tone === "light" ? "bg-[rgba(213,176,106,0.55)]" : "bg-[rgba(147,101,34,0.48)]",
          )}
        />
        {withDescription ? (
          <p className={cn("mt-3 text-sm sm:text-base", tone === "light" ? "text-[#d8cab1]" : "text-[#4f334a]")}>
            A cinematic browser ritual of hidden thoughts, spoken clues, and impossible guesses.
          </p>
        ) : null}
      </div>
    </div>
  );
}
