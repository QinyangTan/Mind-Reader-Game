import Link from "next/link";

import { SocialBrandButton } from "@/components/site/social-brand-button";
import { siteFooterNavLinks, siteSocialLinks } from "@/lib/site/footer-links";
import { cn } from "@/lib/utils/cn";

interface SiteFooterProps {
  variant?: "site" | "play";
  className?: string;
}

export function SiteFooter({ variant = "site", className }: SiteFooterProps) {
  const compact = variant === "play";
  const year = new Date().getFullYear();

  return (
    <div className={cn("mx-auto w-full max-w-[1320px]", className)}>
      <footer
        aria-labelledby="site-footer-follow"
        className={cn(
          "relative overflow-hidden border-t border-[rgba(227,195,126,0.2)] bg-[linear-gradient(180deg,rgba(10,6,14,0.72),rgba(6,4,9,0.92))] text-[#eadfc3] backdrop-blur-[1.5px]",
          compact ? "px-4 py-4 sm:px-5" : "px-4 py-5 sm:px-6 sm:py-6",
        )}
      >
        <div className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(239,217,161,0.68),transparent)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(135,86,178,0.12),transparent_62%)]" />

        <div className={cn("flex flex-col gap-4", compact ? "lg:gap-3" : "lg:gap-4")}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="space-y-1">
                <p
                  id="site-footer-follow"
                  className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#d6a653]"
                >
                  Follow Me
                </p>
                <p className="text-sm text-[#cbb997]">
                  Keep up with the public release of Mind Reader and the work behind the chamber.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {siteSocialLinks.map((social) => (
                  <SocialBrandButton
                    key={social.label}
                    label={social.label}
                    href={social.href}
                    variant="icon"
                  />
                ))}
              </div>
            </div>

            <nav aria-label="Footer navigation" className="max-w-[52rem]">
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#dfd0ad] sm:gap-x-5">
                {siteFooterNavLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors duration-150 hover:text-[#f7ebcb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,228,192,0.46)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="border-t border-[rgba(227,195,126,0.14)] pt-3">
            <p className="text-xs tracking-[0.12em] text-[#bca987]">
              © {year} Mind Reader / The Psychic Chamber. Created by Qinyang Tan for the public web release.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
