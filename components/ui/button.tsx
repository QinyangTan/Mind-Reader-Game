"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1rem] border text-sm font-semibold tracking-[0.03em] transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a653]/70 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "border-[#f0d9a2] bg-[linear-gradient(180deg,#f3d590,#d6a653)] text-[#2b1a1e] shadow-[0_10px_20px_rgba(21,10,18,0.22)] hover:bg-[linear-gradient(180deg,#f7dfaa,#deb26b)] hover:-translate-y-0.5",
        secondary:
          "border-[rgba(214,166,83,0.32)] bg-[linear-gradient(180deg,rgba(61,24,60,0.98),rgba(26,14,35,0.98))] text-[#f4e7c8] hover:border-[rgba(240,217,162,0.42)] hover:bg-[linear-gradient(180deg,rgba(74,30,70,0.98),rgba(31,17,40,0.98))]",
        ghost: "border-transparent bg-transparent text-[#e4d8bf] hover:bg-[rgba(240,217,162,0.08)] hover:text-white",
        danger:
          "border-[#f0c6c8] bg-[linear-gradient(180deg,#e7a5ad,#bf6273)] text-[#2b1a1e] hover:bg-[linear-gradient(180deg,#efb1b8,#cc7482)]",
      },
      size: {
        default: "h-11 px-4.5",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
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
