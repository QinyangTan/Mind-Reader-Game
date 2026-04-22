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
    <div className={cn("relative z-10 mx-auto flex min-h-screen w-full max-w-[1380px] flex-col px-4 pb-6 pt-5 sm:px-6 xl:px-8", className)}>
      <header className="mb-4">{header}</header>

      <div className="grid flex-1 gap-5 xl:grid-cols-[250px_minmax(0,1fr)_280px] xl:items-start">
        <aside className="hidden xl:block">{host}</aside>
        <main className="min-w-0">{center ?? children}</main>
        <aside className="hidden xl:block">{support}</aside>
      </div>

      {footer ? <footer className="mt-4">{footer}</footer> : null}
    </div>
  );
}
