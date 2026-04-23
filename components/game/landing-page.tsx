"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ChamberSceneShell } from "@/components/game/chamber-scene-shell";
import { PromptPlaque } from "@/components/game/scene-surfaces";

export function LandingPage() {
  return (
    <ChamberSceneShell
      scene="landing"
      mood="welcome"
      contentClassName="items-center justify-center"
      header={
        <div className="flex items-center justify-center pt-2">
          <BrandLogo compact className="opacity-90" />
        </div>
      }
    >
      <div className="mx-auto flex min-h-[76vh] w-full max-w-[820px] flex-col items-center justify-between px-2 pb-4 pt-[12vh] text-center sm:pt-[16vh]">
        <div />

        <div className="space-y-4">
          <PromptPlaque variant="choice" size="xs">
            <div className="space-y-4 text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#d8b36a]">
                The chamber is listening
              </p>
              <Link
                href="/play"
                className="group relative inline-flex min-w-[16rem] items-center justify-center gap-2 overflow-hidden border border-[rgba(238,219,170,0.76)] bg-[linear-gradient(180deg,rgba(175,114,220,0.62),rgba(83,45,115,0.98))] px-7 py-3.5 text-base font-semibold text-[#f7ebcb] shadow-[0_0_24px_rgba(177,118,217,0.24)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[2px] hover:border-[rgba(246,235,203,0.86)] hover:shadow-[0_0_30px_rgba(177,118,217,0.28)]"
                style={{
                  clipPath:
                    "polygon(18px 0, calc(100% - 18px) 0, 100% 34%, 100% 66%, calc(100% - 18px) 100%, 18px 100%, 0 66%, 0 34%)",
                }}
              >
                <span
                  className="pointer-events-none absolute inset-[4px] border border-[rgba(249,234,196,0.2)]"
                  style={{
                    clipPath:
                      "polygon(18px 0, calc(100% - 18px) 0, 100% 34%, 100% 66%, calc(100% - 18px) 100%, 18px 100%, 0 66%, 0 34%)",
                  }}
                />
                <span className="pointer-events-none absolute inset-x-[16%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(249,234,196,0.82),transparent)]" />
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  Enter the chamber
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </PromptPlaque>
        </div>
      </div>
    </ChamberSceneShell>
  );
}
