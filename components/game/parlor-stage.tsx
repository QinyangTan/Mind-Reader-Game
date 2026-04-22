import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface ParlorStageProps {
  header?: ReactNode;
  support?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
  contentClassName?: string;
  supportClassName?: string;
}

export function ParlorStage({
  header,
  support,
  footer,
  className,
  children,
  contentClassName,
  supportClassName,
}: ParlorStageProps) {
  return (
    <div
      className={cn(
        "relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 pb-5 pt-4 sm:px-6 lg:px-10",
        className,
      )}
    >
      {header ? <header className="relative z-30">{header}</header> : null}

      <div className="relative flex min-h-[calc(100vh-4rem)] flex-1 items-end justify-center pb-6 pt-20 sm:pb-8 sm:pt-24">
        <main
          className={cn(
            "relative z-20 flex w-full flex-1 items-end justify-center",
            contentClassName,
          )}
        >
          <div className="w-full max-w-[920px]">{children}</div>
        </main>

        {support ? (
          <aside
            className={cn(
              "pointer-events-auto absolute bottom-4 right-0 z-20 hidden w-[148px] opacity-55 transition-opacity duration-150 hover:opacity-85 2xl:block",
              supportClassName,
            )}
          >
            {support}
          </aside>
        ) : null}
      </div>

      {footer ? <footer className="relative z-20">{footer}</footer> : null}
    </div>
  );
}
