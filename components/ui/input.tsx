import * as React from "react";

import { cn } from "@/lib/utils/cn";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-white/12 bg-white/6 px-4 text-sm text-slate-100 outline-none transition duration-300 placeholder:text-slate-400 focus:border-cyan-300/45 focus:bg-white/10 focus:ring-2 focus:ring-cyan-300/20",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
