import type React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Priority = "urgent" | "high" | "medium" | "low" | "none";

interface PriorityDotProps {
  priority: Priority;
  className?: string;
  size?: number;
  withTooltip?: boolean;
}

const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "Urgente",
  high: "Alta",
  medium: "Media",
  low: "Baja",
  none: "Sin prioridad",
};

// Solid fill colors using existing CSS vars defined in index.css
const PRIORITY_COLOR: Record<Priority, string> = {
  urgent: "var(--priority-urgent)",
  high: "var(--priority-high)",
  medium: "var(--priority-medium)",
  low: "var(--priority-low)",
  none: "var(--priority-none)",
};

function PriorityDotInner({ priority, className, size = 12 }: Omit<PriorityDotProps, "withTooltip">): React.ReactElement {
  const color = PRIORITY_COLOR[priority];

  return (
    <span
      className={cn("inline-flex shrink-0 rounded-full", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
      aria-label={`Prioridad: ${PRIORITY_LABEL[priority]}`}
    >
      <span className="sr-only">Prioridad: {PRIORITY_LABEL[priority]}</span>
    </span>
  );
}

export function PriorityDot({ priority, className, size = 12, withTooltip = false }: PriorityDotProps): React.ReactElement {
  if (!withTooltip) {
    return <PriorityDotInner priority={priority} className={className} size={size} />;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <PriorityDotInner priority={priority} className={className} size={size} />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{PRIORITY_LABEL[priority]}</p>
      </TooltipContent>
    </Tooltip>
  );
}
