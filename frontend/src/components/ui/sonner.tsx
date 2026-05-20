import type { ComponentProps } from "react"
import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      containerAriaLabel="Notificaciones"
      icons={{
        success: <CircleCheck className="h-4 w-4" aria-hidden="true" />,
        info: <Info className="h-4 w-4" aria-hidden="true" />,
        warning: <TriangleAlert className="h-4 w-4" aria-hidden="true" />,
        error: <OctagonX className="h-4 w-4" aria-hidden="true" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />,
      }}
      toastOptions={{
        // Sonner sets role="status" + aria-live="polite" automatically for
        // success/info/loading toasts, and role="alert" + aria-live="assertive"
        // for error toasts (handled internally by the library).
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
