import type { CSSProperties, ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type SlabVariant = "landing" | "dialogue" | "choice" | "inquiry" | "reveal" | "teach" | "memory";

type SceneFrameProps = ComponentProps<"div">;

interface RitualSlabProps extends ComponentProps<"section"> {
  variant?: SlabVariant;
  crest?: ReactNode;
  footerCrest?: ReactNode;
  innerClassName?: string;
}

interface SurfaceHeadingProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
  titleClassName?: string;
  className?: string;
}

interface SurfacePillButtonProps extends ComponentProps<"button"> {
  active?: boolean;
  tone?: "default" | "soft" | "accent";
  surface?: "compact" | "choice" | "tab";
}

interface RitualProgressProps {
  label: string;
  value?: number;
}

interface PromptPlaqueProps extends ComponentProps<"div"> {
  variant?: "dialogue" | "choice" | "inquiry" | "reveal" | "teach";
  tail?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

const clipPaths: Record<SlabVariant, string> = {
  landing: "polygon(8% 0, 92% 0, 100% 22%, 98% 100%, 2% 100%, 0 22%)",
  dialogue: "polygon(6% 0, 94% 0, 100% 18%, 98% 86%, 94% 100%, 6% 100%, 2% 86%, 0 18%)",
  choice: "polygon(6% 0, 94% 0, 100% 16%, 99% 86%, 94% 100%, 6% 100%, 1% 86%, 0 16%)",
  inquiry: "polygon(9% 0, 91% 0, 100% 8%, 98% 100%, 2% 100%, 0 8%)",
  reveal: "polygon(8% 0, 92% 0, 100% 20%, 98% 88%, 92% 100%, 8% 100%, 2% 88%, 0 20%)",
  teach: "polygon(8% 0, 92% 0, 100% 12%, 98% 100%, 2% 100%, 0 12%)",
  memory: "polygon(8% 0, 92% 0, 100% 9%, 98% 100%, 2% 100%, 0 9%)",
};

const slabPalettes: Record<
  SlabVariant,
  {
    shell: string;
    inner: string;
    glow: string;
  }
> = {
  landing: {
    shell:
      "border-[rgba(211,170,95,0.76)] bg-[radial-gradient(circle_at_50%_0%,rgba(122,70,160,0.3),transparent_38%),linear-gradient(180deg,rgba(46,20,63,0.98),rgba(19,11,30,0.98))]",
    inner: "border-[rgba(237,212,153,0.22)] bg-[linear-gradient(180deg,rgba(61,28,81,0.34),rgba(19,11,30,0.08))]",
    glow: "bg-[radial-gradient(circle_at_50%_0%,rgba(232,209,149,0.18),transparent_44%)]",
  },
  dialogue: {
    shell:
      "border-[rgba(211,170,95,0.72)] bg-[radial-gradient(circle_at_50%_0%,rgba(122,70,160,0.28),transparent_34%),linear-gradient(180deg,rgba(43,18,58,0.98),rgba(17,10,27,0.98))]",
    inner: "border-[rgba(237,212,153,0.2)] bg-[linear-gradient(180deg,rgba(60,27,80,0.34),rgba(19,11,30,0.08))]",
    glow: "bg-[radial-gradient(circle_at_50%_0%,rgba(232,209,149,0.18),transparent_42%)]",
  },
  choice: {
    shell:
      "border-[rgba(214,174,98,0.76)] bg-[radial-gradient(circle_at_50%_0%,rgba(125,72,165,0.32),transparent_34%),linear-gradient(180deg,rgba(46,20,63,0.98),rgba(18,10,27,0.98))]",
    inner: "border-[rgba(237,212,153,0.22)] bg-[linear-gradient(180deg,rgba(61,28,81,0.32),rgba(20,12,30,0.08))]",
    glow: "bg-[radial-gradient(circle_at_50%_0%,rgba(232,209,149,0.18),transparent_42%)]",
  },
  inquiry: {
    shell:
      "border-[rgba(206,167,94,0.76)] bg-[radial-gradient(circle_at_50%_0%,rgba(112,67,150,0.28),transparent_30%),linear-gradient(180deg,rgba(38,18,53,0.98),rgba(16,10,25,0.98))]",
    inner: "border-[rgba(237,212,153,0.18)] bg-[linear-gradient(180deg,rgba(58,28,77,0.28),rgba(17,10,26,0.08))]",
    glow: "bg-[radial-gradient(circle_at_50%_0%,rgba(232,209,149,0.14),transparent_40%)]",
  },
  reveal: {
    shell:
      "border-[rgba(224,185,109,0.82)] bg-[radial-gradient(circle_at_50%_0%,rgba(131,80,173,0.32),transparent_34%),linear-gradient(180deg,rgba(48,22,66,0.98),rgba(19,11,30,0.98))]",
    inner: "border-[rgba(241,220,168,0.24)] bg-[linear-gradient(180deg,rgba(65,30,86,0.34),rgba(20,12,31,0.08))]",
    glow: "bg-[radial-gradient(circle_at_50%_0%,rgba(243,221,170,0.2),transparent_40%)]",
  },
  teach: {
    shell:
      "border-[rgba(206,167,94,0.76)] bg-[radial-gradient(circle_at_50%_0%,rgba(117,73,157,0.28),transparent_30%),linear-gradient(180deg,rgba(40,20,56,0.98),rgba(17,10,26,0.98))]",
    inner: "border-[rgba(237,212,153,0.2)] bg-[linear-gradient(180deg,rgba(58,28,77,0.3),rgba(17,10,26,0.08))]",
    glow: "bg-[radial-gradient(circle_at_50%_0%,rgba(232,209,149,0.16),transparent_40%)]",
  },
  memory: {
    shell:
      "border-[rgba(197,156,89,0.78)] bg-[radial-gradient(circle_at_50%_0%,rgba(98,62,131,0.22),transparent_30%),linear-gradient(180deg,rgba(36,19,49,0.98),rgba(18,11,26,0.98))]",
    inner: "border-[rgba(226,204,149,0.18)] bg-[linear-gradient(180deg,rgba(54,31,70,0.26),rgba(17,10,24,0.08))]",
    glow: "bg-[radial-gradient(circle_at_50%_0%,rgba(223,198,142,0.14),transparent_38%)]",
  },
};

function DefaultCrest({ position = "top" }: { position?: "top" | "bottom" }) {
  const isTop = position === "top";

  return (
    <div
      className={cn(
        "pointer-events-none absolute left-1/2 z-10 -translate-x-1/2",
        isTop ? "-top-7" : "-bottom-7",
      )}
    >
      <div className="relative flex h-14 w-24 items-center justify-center">
        <div className="absolute inset-x-1/2 h-px w-16 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(231,202,129,0.78),transparent)]" />
        <div className="absolute h-8 w-8 rotate-45 rounded-[0.55rem] border border-[rgba(231,202,129,0.6)] bg-[linear-gradient(180deg,rgba(83,39,108,0.96),rgba(32,16,44,0.96))]" />
        <div className="absolute h-4 w-4 rotate-45 rounded-[0.3rem] border border-[rgba(245,229,182,0.62)] bg-[radial-gradient(circle,rgba(222,192,113,0.78),rgba(122,77,34,0.9))]" />
        <div className="absolute left-2 top-1/2 h-px w-4 -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(229,198,119,0.72))]" />
        <div className="absolute right-2 top-1/2 h-px w-4 -translate-y-1/2 bg-[linear-gradient(270deg,transparent,rgba(229,198,119,0.72))]" />
      </div>
    </div>
  );
}

export function SceneFrame({ className, ...props }: SceneFrameProps) {
  return <div className={cn("mx-auto w-full", className)} {...props} />;
}

export function RitualSlab({
  variant = "dialogue",
  crest,
  footerCrest,
  className,
  innerClassName,
  children,
  ...props
}: RitualSlabProps) {
  const palette = slabPalettes[variant];
  const clipPath = clipPaths[variant];

  return (
    <section
      className={cn(
        "relative overflow-visible border text-[#f6e7bf] shadow-[0_40px_110px_rgba(0,0,0,0.58)]",
        palette.shell,
        className,
      )}
      style={{ clipPath }}
      {...props}
    >
      <div className={cn("pointer-events-none absolute inset-0", palette.glow)} />
      <div
        className={cn("pointer-events-none absolute inset-[10px] border", palette.inner, innerClassName)}
        style={{ clipPath }}
      />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(239,217,161,0.5),transparent)]" />
      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(239,217,161,0.5),transparent)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.14)_0,transparent_18%),radial-gradient(circle_at_78%_24%,rgba(255,255,255,0.09)_0,transparent_20%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.07)_0,transparent_24%)]" />

      {crest ?? <DefaultCrest position="top" />}
      {footerCrest ?? <DefaultCrest position="bottom" />}

      <div className="relative z-10 flex flex-col gap-5 px-5 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">{children}</div>
    </section>
  );
}

export function PromptPlaque({
  variant = "dialogue",
  tail = false,
  size = "sm",
  className,
  children,
  ...props
}: PromptPlaqueProps) {
  const palette =
    variant === "reveal"
      ? "border-[rgba(226,192,118,0.46)] bg-[radial-gradient(circle_at_50%_0%,rgba(132,82,177,0.34),transparent_38%),linear-gradient(180deg,rgba(42,20,58,0.94),rgba(22,12,31,0.98))]"
      : variant === "choice"
        ? "border-[rgba(214,174,98,0.4)] bg-[radial-gradient(circle_at_50%_0%,rgba(123,75,165,0.3),transparent_38%),linear-gradient(180deg,rgba(40,20,56,0.94),rgba(20,12,30,0.98))]"
        : variant === "teach"
          ? "border-[rgba(214,174,98,0.38)] bg-[radial-gradient(circle_at_50%_0%,rgba(118,73,157,0.26),transparent_36%),linear-gradient(180deg,rgba(37,20,53,0.94),rgba(20,12,29,0.98))]"
          : "border-[rgba(214,174,98,0.38)] bg-[radial-gradient(circle_at_50%_0%,rgba(118,73,157,0.28),transparent_38%),linear-gradient(180deg,rgba(37,20,53,0.94),rgba(19,11,29,0.98))]";

  const clipPath =
    variant === "inquiry"
      ? "polygon(8% 0,92% 0,100% 14%,98% 100%,2% 100%,0 14%)"
      : "polygon(7% 0,93% 0,100% 18%,98% 86%,94% 100%,6% 100%,2% 86%,0 18%)";
  const sizeClass =
    size === "xs"
      ? "max-w-[24rem]"
      : size === "md"
        ? "max-w-[40rem]"
        : size === "lg"
          ? "max-w-[46rem]"
          : "max-w-[33rem]";
  const frameClass =
    size === "xs"
      ? "px-4 py-4 sm:px-5 sm:py-4.5"
      : size === "md"
        ? "px-5 py-5 sm:px-7 sm:py-6"
        : size === "lg"
          ? "px-6 py-6 sm:px-8 sm:py-7"
          : "px-5 py-4.5 sm:px-6 sm:py-5";

  return (
    <div
      className={cn("relative mx-auto w-full overflow-visible", sizeClass, className)}
      {...props}
    >
      <div
        className={cn(
          "relative border text-[#f6e7bf] shadow-[0_18px_44px_rgba(0,0,0,0.34)]",
          frameClass,
          palette,
        )}
        style={{ clipPath }}
      >
        <div
          className="pointer-events-none absolute inset-[8px] border border-[rgba(237,212,153,0.18)]"
          style={{ clipPath }}
        />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(239,217,161,0.5),transparent)]" />
        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(239,217,161,0.5),transparent)]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-20 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(239,217,161,0.58),transparent)]" />
        <div className="relative z-10">{children}</div>
      </div>

      <DefaultCrest position="top" />
      {tail ? (
        <div className="pointer-events-none absolute -bottom-5 left-1/2 h-10 w-10 -translate-x-1/2 rotate-45 rounded-[0.4rem] border border-[rgba(226,192,118,0.28)] bg-[linear-gradient(180deg,rgba(60,32,82,0.96),rgba(27,16,39,0.98))]" />
      ) : (
        <DefaultCrest position="bottom" />
      )}
    </div>
  );
}

export function SurfaceHeading({
  eyebrow,
  title,
  description,
  align = "center",
  titleClassName,
  className,
}: SurfaceHeadingProps) {
  return (
    <header className={cn("space-y-2", align === "center" ? "text-center" : "text-left", className)}>
      {eyebrow ? (
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#d8b36a]">{eyebrow}</p>
      ) : null}
      {title ? (
        <h2 className={cn("font-display text-[2.25rem] leading-[0.94] text-[#f6e7bf] sm:text-[3rem]", titleClassName)}>
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="mx-auto max-w-[44rem] text-sm leading-6 text-[#d7c8a8] sm:text-base">{description}</p>
      ) : null}
    </header>
  );
}

export function SurfacePillButton({
  active = false,
  tone = "default",
  surface = "choice",
  className,
  children,
  disabled,
  type = "button",
  style,
  ...props
}: SurfacePillButtonProps) {
  const clipPath =
    surface === "compact"
      ? "polygon(12px 0, calc(100% - 12px) 0, 100% 32%, 100% 68%, calc(100% - 12px) 100%, 12px 100%, 0 68%, 0 32%)"
      : surface === "tab"
        ? "polygon(10px 0, calc(100% - 10px) 0, 100% 22%, 100% 100%, 0 100%, 0 22%)"
        : "polygon(18px 0, calc(100% - 18px) 0, 100% 34%, 100% 66%, calc(100% - 18px) 100%, 18px 100%, 0 66%, 0 34%)";

  const shapeClass =
    surface === "compact"
      ? "min-h-[2.45rem] min-w-[7rem] px-3.5 py-2 text-xs font-medium"
      : surface === "tab"
        ? "min-h-[3.1rem] min-w-[8rem] px-4 py-2.5 text-sm font-medium leading-5"
        : "min-h-[3.55rem] min-w-[8.5rem] px-5 py-3 text-sm font-medium leading-5 sm:text-base";
  const toneClass =
    surface === "tab"
      ? active
        ? "border-[rgba(244,225,177,0.74)] bg-[linear-gradient(180deg,rgba(88,48,120,0.94),rgba(40,22,57,0.98))] text-[#f7ecc8] shadow-[0_0_24px_rgba(180,124,226,0.18)]"
        : "border-[rgba(214,174,98,0.32)] bg-[linear-gradient(180deg,rgba(42,23,57,0.92),rgba(21,12,30,0.98))] text-[#dcc9a0] hover:border-[rgba(242,226,181,0.48)] hover:bg-[linear-gradient(180deg,rgba(52,29,70,0.94),rgba(25,14,34,0.98))]"
      : tone === "accent"
      ? active
        ? "border-[rgba(243,225,182,0.82)] bg-[linear-gradient(180deg,rgba(156,95,214,0.9),rgba(79,39,108,0.98))] text-[#f8eecf] shadow-[0_0_32px_rgba(189,132,230,0.34)]"
        : "border-[rgba(225,187,107,0.44)] bg-[linear-gradient(180deg,rgba(86,45,118,0.96),rgba(42,22,58,0.98))] text-[#f0dcaf] hover:border-[rgba(244,227,184,0.68)] hover:shadow-[0_0_24px_rgba(188,131,229,0.2)]"
      : tone === "soft"
        ? active
          ? "border-[rgba(239,220,177,0.64)] bg-[linear-gradient(180deg,rgba(107,62,145,0.94),rgba(53,30,74,0.98))] text-[#f8eecf]"
          : "border-[rgba(217,177,98,0.3)] bg-[linear-gradient(180deg,rgba(55,31,74,0.94),rgba(29,18,40,0.98))] text-[#dbcaa3] hover:border-[rgba(240,218,170,0.5)]"
        : active
          ? "border-[rgba(240,220,177,0.72)] bg-[linear-gradient(180deg,rgba(126,76,171,0.88),rgba(63,35,89,0.98))] text-[#f8eecf] shadow-[0_0_24px_rgba(168,116,214,0.24)]"
          : "border-[rgba(218,179,100,0.36)] bg-[linear-gradient(180deg,rgba(58,32,80,0.96),rgba(28,17,40,0.98))] text-[#ead8af] hover:border-[rgba(240,220,177,0.58)]";
  const insetClass =
    surface === "tab"
      ? active
        ? "border-[rgba(248,236,207,0.3)]"
        : "border-[rgba(233,207,145,0.16)]"
      : tone === "accent"
      ? active
        ? "border-[rgba(248,236,207,0.36)]"
        : "border-[rgba(233,207,145,0.22)]"
      : tone === "soft"
        ? "border-[rgba(228,198,133,0.2)]"
        : active
          ? "border-[rgba(244,228,192,0.28)]"
          : "border-[rgba(228,198,133,0.18)]";
  const ornamentClass =
    tone === "accent" || active
      ? "bg-[radial-gradient(circle,rgba(246,222,170,0.82),rgba(205,150,74,0))]"
      : "bg-[radial-gradient(circle,rgba(236,208,149,0.5),rgba(205,150,74,0))]";
  return (
    <button
      type={type}
      className={cn(
        "group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden border text-center transition-[border-color,box-shadow,color,transform,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,228,192,0.44)] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:active:translate-y-0 disabled:active:scale-100",
        surface === "tab"
          ? "hover:-translate-y-[1px] hover:scale-[1.005] active:translate-y-[1px] active:scale-[0.992]"
          : "hover:-translate-y-[2px] hover:scale-[1.015] active:translate-y-[1px] active:scale-[0.985]",
        shapeClass,
        toneClass,
        className,
      )}
      style={{ ...(style as CSSProperties | undefined), clipPath }}
      disabled={disabled}
      {...props}
    >
      <span
        className="pointer-events-none absolute inset-[2px] border border-[rgba(250,236,198,0.18)]"
        style={{ clipPath }}
      />
      <span
        className={cn("pointer-events-none absolute inset-[5px] border opacity-80", insetClass)}
        style={{ clipPath }}
      />
      <span className="pointer-events-none absolute inset-x-[14%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(249,234,196,0.86),transparent)]" />
      <span className="pointer-events-none absolute inset-x-[14%] bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(225,184,99,0.58),transparent)]" />
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,245,220,0.14),transparent_42%)] opacity-80" />
      {surface === "choice" ? (
        <>
          <span className={cn("pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 opacity-70 blur-[0.5px]", ornamentClass)} />
          <span className={cn("pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 opacity-70 blur-[0.5px]", ornamentClass)} />
        </>
      ) : null}
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

export function ResponseWell({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border px-5 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        tone === "muted"
          ? "border-[rgba(221,189,113,0.22)] bg-[linear-gradient(180deg,rgba(35,18,49,0.72),rgba(21,12,31,0.94))] text-[#d7c7a4]"
          : "border-[rgba(226,192,118,0.34)] bg-[linear-gradient(180deg,rgba(42,20,58,0.86),rgba(23,12,33,0.98))] text-[#ecdcb3]",
        className,
      )}
      style={{
        clipPath:
          "polygon(16px 0, calc(100% - 16px) 0, 100% 30%, 100% 70%, calc(100% - 16px) 100%, 16px 100%, 0 70%, 0 30%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-[5px] border border-[rgba(238,219,170,0.14)]"
        style={{
          clipPath:
            "polygon(16px 0, calc(100% - 16px) 0, 100% 30%, 100% 70%, calc(100% - 16px) 100%, 16px 100%, 0 70%, 0 30%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(239,217,161,0.42),transparent)]" />
      {children}
    </div>
  );
}

export function RitualProgress({ label, value }: RitualProgressProps) {
  return (
    <div className="mx-auto flex w-full max-w-[18rem] flex-col items-center gap-2 text-center">
      <p className="text-[0.9rem] text-[#ecdcb3]">{label}</p>
      {typeof value === "number" ? (
        <div className="w-full">
          <div className="relative h-2 overflow-hidden rounded-full border border-[rgba(226,192,118,0.18)] bg-[rgba(18,10,27,0.74)]">
            <div
              className="absolute inset-y-[1px] left-[1px] rounded-full bg-[linear-gradient(90deg,#c99a4a,#f6e8bc,#d09d53)] shadow-[0_0_16px_rgba(229,199,130,0.32)]"
              style={{ width: `${Math.max(6, Math.min(100, value))}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MoraDialogueSurface({
  eyebrow,
  title,
  description,
  footer,
  className,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <PromptPlaque variant="dialogue" tail size="md">
        <SurfaceHeading eyebrow={eyebrow} title={title} description={description} />
      </PromptPlaque>
      {children}
      {footer}
    </div>
  );
}

export function RitualChoiceSurface({
  eyebrow,
  title,
  description,
  footer,
  className,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      <PromptPlaque variant="choice" size="sm">
        <SurfaceHeading eyebrow={eyebrow} title={title} description={description} />
      </PromptPlaque>
      {children}
      {footer}
    </div>
  );
}

export function InquirySurface({
  eyebrow,
  title,
  footer,
  className,
  children,
}: {
  eyebrow?: string;
  title?: string;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      <PromptPlaque variant="inquiry" size="sm">
        <SurfaceHeading eyebrow={eyebrow} title={title} />
      </PromptPlaque>
      {children}
      {footer}
    </div>
  );
}

export function RevealSurface({
  eyebrow,
  title,
  description,
  className,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      <PromptPlaque variant="reveal" size="md">
        <SurfaceHeading eyebrow={eyebrow} title={title} description={description} />
      </PromptPlaque>
      {children}
    </div>
  );
}

export function TeachSurface({
  eyebrow,
  title,
  description,
  className,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      <PromptPlaque variant="teach" size="md">
        <SurfaceHeading eyebrow={eyebrow} title={title} description={description} />
      </PromptPlaque>
      {children}
    </div>
  );
}

export function ChamberMemorySurface({
  eyebrow,
  title,
  description,
  className,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <RitualSlab variant="memory" className={className}>
      <SurfaceHeading eyebrow={eyebrow} title={title} description={description} />
      {children}
    </RitualSlab>
  );
}
