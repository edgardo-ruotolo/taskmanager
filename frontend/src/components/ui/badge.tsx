import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[11px] font-medium transition-colors border",
  {
    variants: {
      variant: {
        default:
          "border-[var(--neutral-400)] bg-transparent text-[var(--neutral-1100)]",
        secondary:
          "border-[var(--neutral-400)] bg-transparent text-[var(--neutral-1100)]",
        solid:
          "border-transparent bg-[var(--neutral-300)] text-[var(--neutral-1200)]",
        accent:
          "border-transparent bg-[var(--brand-500)] text-[var(--brand-900)]",
        moss:
          "border-transparent bg-[var(--green-200)] text-[var(--green-700)]",
        destructive:
          "border-transparent bg-[var(--red-200)] text-[var(--red-700)]",
        outline:
          "border-[var(--neutral-400)] bg-transparent text-[var(--neutral-1100)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
