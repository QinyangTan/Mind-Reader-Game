"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.9rem] border text-sm font-semibold tracking-[0.02em] transition-[background-color,border-color,color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a653]/70 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "border-[#e7c977] bg-[#d6a653] text-[#241816] shadow-[0_10px_20px_rgba(12,7,12,0.2)] hover:bg-[#deb56a]",
        secondary:
          "border-[rgba(214,166,83,0.24)] bg-[rgba(22,14,31,0.94)] text-[#f4e7c8] hover:border-[rgba(240,217,162,0.34)] hover:bg-[rgba(31,20,43,0.96)]",
        ghost: "border-transparent bg-transparent text-[#e4d8bf] hover:bg-[rgba(240,217,162,0.06)] hover:text-white",
        danger:
          "border-[#f0c6c8] bg-[#bf6273] text-[#261516] hover:bg-[#ca7281]",
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
