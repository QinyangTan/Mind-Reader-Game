import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface ParlorStageProps {
  header?: ReactNode;
  host?: ReactNode;
  center?: ReactNode;
  support?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
  contentClassName?: string;
  hostClassName?: string;
  supportClassName?: string;
}

export function ParlorStage({
  header,
  host,
  center,
  support,
  footer,
  className,
  children,
  contentClassName,
  hostClassName,
  supportClassName,
}: ParlorStageProps) {
  return (
    <div
      className={cn(
        "relative z-10 mx-auto flex min-h-screen w-full max-w-[1460px] flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      {header ? <header className="relative z-20 mb-2">{header}</header> : null}

      <div className="relative flex min-h-[calc(100vh-6rem)] flex-1 items-stretch pb-6">
        {host ? (
          <>
            <div className={cn("relative z-10 mx-auto mb-3 block w-full max-w-[20rem] pt-2 xl:hidden", hostClassName)}>
              {host}
            </div>
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 left-[-1rem] z-0 hidden w-[44%] xl:block 2xl:left-0",
                hostClassName,
              )}
            >
              {host}
            </div>
          </>
        ) : null}

        <main
          className={cn(
            "relative z-20 flex w-full flex-1 items-center justify-center pb-8 pt-2 xl:justify-center xl:pl-[24%] xl:pr-[4%]",
            contentClassName,
          )}
        >
          <div className="w-full max-w-[860px]">{center ?? children}</div>
        </main>

        {support ? (
          <aside
            className={cn(
              "pointer-events-auto absolute bottom-8 right-2 z-10 hidden w-[160px] opacity-70 transition-opacity hover:opacity-100 2xl:block",
              supportClassName,
            )}
          >
            {support}
          </aside>
        ) : null}
      </div>

      {footer ? <footer className="relative z-20 mt-2">{footer}</footer> : null}
    </div>
  );
}
