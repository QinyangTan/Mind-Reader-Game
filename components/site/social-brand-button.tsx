import type { ComponentPropsWithoutRef, SVGProps } from "react";

import { cn } from "@/lib/utils/cn";
import type { SiteSocialLink } from "@/lib/site/footer-links";

type SocialLabel = SiteSocialLink["label"];

interface SocialBrandButtonProps extends Omit<ComponentPropsWithoutRef<"a">, "href"> {
  label: SocialLabel;
  href: string;
  variant?: "icon" | "pill";
}

interface SocialBrandIconProps extends SVGProps<SVGSVGElement> {
  label: SocialLabel;
}

const brandStyles: Record<
  SocialLabel,
  {
    icon: string;
    halo: string;
    ring: string;
  }
> = {
  LinkedIn: {
    icon: "text-[#dfe8ff]",
    halo: "bg-[radial-gradient(circle,rgba(84,123,176,0.26),rgba(84,123,176,0)_72%)]",
    ring: "shadow-[0_0_22px_rgba(84,123,176,0.14)]",
  },
  GitHub: {
    icon: "text-[#f1e8d2]",
    halo: "bg-[radial-gradient(circle,rgba(187,171,212,0.2),rgba(187,171,212,0)_72%)]",
    ring: "shadow-[0_0_22px_rgba(187,171,212,0.12)]",
  },
  Handshake: {
    icon: "text-[#f6e2bc]",
    halo: "bg-[radial-gradient(circle,rgba(223,169,108,0.2),rgba(223,169,108,0)_72%)]",
    ring: "shadow-[0_0_22px_rgba(223,169,108,0.12)]",
  },
};

const labels: Record<SocialLabel, string> = {
  LinkedIn: "LinkedIn",
  GitHub: "GitHub",
  Handshake: "Handshake",
};

export function SocialBrandButton({
  label,
  href,
  variant = "icon",
  className,
  ...props
}: SocialBrandButtonProps) {
  const style = brandStyles[label];
  const compact = variant === "icon";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Follow on ${labels[label]}`}
      className={cn(
        "group relative isolate inline-flex overflow-hidden border border-[rgba(230,198,128,0.28)] bg-[linear-gradient(180deg,rgba(27,17,36,0.9),rgba(13,8,20,0.96))] text-[#f4e7c8] transition-[transform,border-color,box-shadow,background-color] duration-200 hover:-translate-y-[1px] hover:border-[rgba(242,220,169,0.62)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,228,192,0.52)]",
        compact
          ? "h-11 w-11 items-center justify-center"
          : "min-h-[2.9rem] items-center gap-2.5 px-4 py-2 text-sm font-medium",
        style.ring,
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-[1px] border border-[rgba(245,225,179,0.12)]" />
      <span className={cn("pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100", style.halo)} />
      <span className="pointer-events-none absolute inset-x-[18%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(243,228,189,0.62),transparent)]" />

      <span
        className={cn(
          "relative z-10 inline-flex shrink-0 items-center justify-center border border-[rgba(242,220,169,0.2)] bg-[rgba(32,21,43,0.58)]",
          compact ? "h-7 w-7" : "h-7 w-7",
        )}
      >
        <SocialBrandIcon label={label} className={cn("h-4.5 w-4.5", style.icon)} />
      </span>

      {!compact ? <span className="relative z-10 text-[#f3e5c2]">{labels[label]}</span> : null}
    </a>
  );
}

export function SocialBrandIcon({ label, className, ...props }: SocialBrandIconProps) {
  if (label === "LinkedIn") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
        {...props}
      >
        <path d="M20.45 20.45h-3.55v-5.57c0-1.32-.03-3.03-1.85-3.03-1.85 0-2.14 1.44-2.14 2.93v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.97 0 1.77-.77 1.77-1.73V1.73C24 .77 23.2 0 22.23 0Z" />
      </svg>
    );
  }

  if (label === "GitHub") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
        {...props}
      >
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M20.728 0 16.49 24h-4.583l1.87-10.532-4.743 3.893L7.856 24H3.272L7.51 0h4.582L9.806 13.012l4.729-3.862L16.145 0h4.583z" />
    </svg>
  );
}
