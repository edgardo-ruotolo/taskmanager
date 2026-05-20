import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-[var(--neutral-400)] bg-white px-3.5 py-2.5 text-sm tracking-[-0.005em] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[var(--neutral-900)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)]/20 focus-visible:border-[var(--neutral-1200)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
