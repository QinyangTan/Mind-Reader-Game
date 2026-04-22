import * as React from "react";

import { cn } from "@/lib/utils/cn";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[0.9rem] border border-[rgba(214,166,83,0.24)] bg-[rgba(18,12,24,0.88)] px-4 text-sm text-[#f7efd9] outline-none transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-[#af9c83] focus:border-[#e7c977] focus:bg-[rgba(26,17,34,0.96)] focus:ring-2 focus:ring-[#d6a653]/20",
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
