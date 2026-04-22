import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface ParlorStageProps {
  header: ReactNode;
  host: ReactNode;
  center?: ReactNode;
  support?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function ParlorStage({
  header,
  host,
  center,
  support,
  footer,
  className,
  children,
}: ParlorStageProps) {
  return (
    <div
      className={cn(
        "relative z-10 mx-auto flex min-h-screen w-full max-w-[1420px] flex-col px-4 pb-6 pt-5 sm:px-6 xl:px-8",
        className,
      )}
    >
      <div className="absolute inset-x-8 top-3 hidden h-px bg-[linear-gradient(90deg,transparent,rgba(240,217,162,0.46),transparent)] xl:block" />
      <header className="mb-5">{header}</header>

      <div className="grid flex-1 gap-5 xl:grid-cols-[270px_minmax(0,1fr)_250px] xl:items-start">
        <aside className="hidden xl:block">{host}</aside>
        <main className="min-w-0">{center ?? children}</main>
        <aside className="hidden xl:block">{support}</aside>
      </div>

      {footer ? <footer className="mt-5">{footer}</footer> : null}
    </div>
  );
}
