import type React from "react";
import { cn } from "@/lib/utils";

type Priority = "urgent" | "high" | "medium" | "low" | "none";

interface PriorityDotProps {
  priority: Priority;
  className?: string;
  size?: number;
}

const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "urgente",
  high: "alta",
  medium: "media",
  low: "baja",
  none: "sin prioridad",
};

export function PriorityDot({ priority, className, size = 12 }: PriorityDotProps): React.ReactElement {
  const color = {
    urgent: "var(--priority-urgent)",
    high: "var(--priority-high)",
    medium: "var(--priority-medium)",
    low: "var(--priority-low)",
    none: "var(--priority-none)",
  }[priority] || "var(--priority-none)";

  return (
    <span
      className={cn("inline-flex items-center justify-center shrink-0 rounded-full border-[1.5px]", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}22`, // 22 is ~13% opacity in hex
        borderColor: color
      }}
    >
      {priority === "urgent" && (
        <span
          className="rounded-full"
          aria-hidden="true"
          style={{
            width: size * 0.4,
            height: size * 0.4,
            backgroundColor: color
          }}
        />
      )}
      <span className="sr-only">Prioridad: {PRIORITY_LABEL[priority]}</span>
    </span>
  );
}
