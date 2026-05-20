import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-ring-offset)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--neutral-1200)] text-[var(--text-on-dark)] hover:bg-[var(--neutral-1100)] dark:bg-[var(--neutral-200)] dark:text-[var(--neutral-1200)] dark:hover:bg-[var(--neutral-300)] shadow-none",
        destructive:
          "bg-[var(--red-700)] text-[var(--text-on-dark)] hover:opacity-90",
        outline:
          "border border-[var(--neutral-400)] bg-white text-[var(--neutral-1200)] hover:bg-[var(--neutral-100)]",
        secondary:
          "bg-white border border-[var(--neutral-400)] text-[var(--neutral-1200)] hover:bg-[var(--neutral-100)]",
        ghost:
          "text-[var(--neutral-1100)] hover:bg-[var(--neutral-200)] hover:text-[var(--neutral-1200)] active:bg-[var(--neutral-300)] data-[state=open]:bg-[var(--neutral-200)]",
        link: "text-[var(--neutral-1200)] underline-offset-4 hover:underline",
        accent:
          "bg-[var(--brand-700)] text-[var(--text-on-dark)] hover:bg-[var(--brand-900)] shadow-none",
      },
      size: {
        default: "h-8 px-3.5 py-2 text-sm",
        sm: "h-7 px-2.5 text-xs rounded-md",
        lg: "h-10 px-5 text-sm rounded-md",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
