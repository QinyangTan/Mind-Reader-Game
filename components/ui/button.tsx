"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-[0.02em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "bg-[linear-gradient(135deg,rgba(121,230,255,0.92),rgba(114,126,255,0.88))] text-slate-950 shadow-[0_14px_40px_rgba(88,206,255,0.28)] hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(88,206,255,0.36)]",
        secondary:
          "border border-white/12 bg-white/8 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-cyan-300/35 hover:bg-white/12",
        ghost: "text-slate-200 hover:bg-white/8 hover:text-white",
        danger:
          "bg-[linear-gradient(135deg,rgba(253,164,175,0.92),rgba(251,113,133,0.84))] text-slate-950 shadow-[0_14px_40px_rgba(251,113,133,0.22)] hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
