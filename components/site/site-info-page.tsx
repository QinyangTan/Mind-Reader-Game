import type { ReactNode } from "react";

import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ChamberSceneShell } from "@/components/game/chamber-scene-shell";
import { AdSenseLoader } from "@/components/site/adsense-loader";
import { SiteFooter } from "@/components/site/site-footer";

interface SiteInfoSection {
  title: string;
  body: readonly string[];
}

interface SiteInfoPageProps {
  eyebrow: string;
  title: string;
  description: string;
  sections: readonly SiteInfoSection[];
  actions?: ReactNode;
}

function HeaderLink({
  href,
  label,
  tone = "default",
}: {
  href: string;
  label: string;
  tone?: "default" | "accent";
}) {
  return (
    <Link
      href={href}
      className={
        tone === "accent"
          ? "inline-flex min-h-[2.65rem] items-center justify-center border border-[rgba(242,220,169,0.6)] bg-[linear-gradient(180deg,rgba(82,47,113,0.9),rgba(40,22,55,0.96))] px-4 py-2 text-sm font-medium text-[#f7ebcb] transition-[transform,border-color] duration-200 hover:-translate-y-[1px] hover:border-[rgba(246,232,196,0.82)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,228,192,0.52)]"
          : "inline-flex min-h-[2.65rem] items-center justify-center border border-[rgba(217,177,98,0.28)] bg-[rgba(14,9,20,0.5)] px-4 py-2 text-sm font-medium text-[#decfaa] transition-[transform,border-color,color] duration-200 hover:-translate-y-[1px] hover:border-[rgba(242,220,169,0.54)] hover:text-[#f5e8c7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,228,192,0.46)]"
      }
    >
      {label}
    </Link>
  );
}

export function SiteInfoPage({
  eyebrow,
  title,
  description,
  sections,
  actions,
}: SiteInfoPageProps) {
  return (
    <>
      <AdSenseLoader />
      <ChamberSceneShell
        scene="archive"
        mood="observing"
        showExampleAds={false}
        header={
          <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-4 pt-1 sm:flex-row sm:items-start sm:justify-between">
            <Link href="/" className="max-w-max">
              <BrandLogo compact withTagline className="opacity-94" />
            </Link>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <HeaderLink href="/" label="Home" />
              <a
                href="/play"
                className="inline-flex min-h-[2.65rem] items-center justify-center border border-[rgba(242,220,169,0.6)] bg-[linear-gradient(180deg,rgba(82,47,113,0.9),rgba(40,22,55,0.96))] px-4 py-2 text-sm font-medium text-[#f7ebcb] transition-[transform,border-color] duration-200 hover:-translate-y-[1px] hover:border-[rgba(246,232,196,0.82)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,228,192,0.52)]"
              >
                Enter the chamber
              </a>
            </div>
          </div>
        }
        footer={<SiteFooter />}
        contentClassName="items-start justify-center"
      >
        <div className="mx-auto w-full max-w-[1080px] px-2 pb-4 pt-[14vh]">
          <div className="space-y-10">
            <section className="max-w-[46rem] space-y-4 border-t border-[rgba(229,198,130,0.18)] pt-6">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#d6a653]">
                {eyebrow}
              </p>
              <h1 className="font-display text-[2.7rem] leading-[0.92] text-[#f5e7c5] sm:text-[4.1rem]">
                {title}
              </h1>
              <p className="max-w-[38rem] text-base leading-8 text-[#d8cab1]">
                {description}
              </p>
              {actions ? <div className="flex flex-wrap gap-3 pt-2">{actions}</div> : null}
            </section>

            <div className="grid gap-8 md:grid-cols-2">
              {sections.map((section) => (
                <section
                  key={section.title}
                  className="space-y-3 border-t border-[rgba(229,198,130,0.12)] pt-4"
                >
                  <h2 className="font-display text-[1.5rem] text-[#f3e2bc] sm:text-[1.85rem]">
                    {section.title}
                  </h2>
                  <div className="space-y-3 text-sm leading-7 text-[#d6c6a4] sm:text-[0.98rem]">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </ChamberSceneShell>
    </>
  );
}
