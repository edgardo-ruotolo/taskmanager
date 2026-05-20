import type React from "react";
import { cn } from "@/lib/utils";

type State = "backlog" | "unstarted" | "started" | "completed" | "cancelled";

interface StatePipProps {
  state: State;
  className?: string;
  size?: number;
}

const STATE_LABEL: Record<State, string> = {
  backlog: "Backlog",
  unstarted: "Sin iniciar",
  started: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
};

export function StatePip({ state, className, size = 12 }: StatePipProps): React.ReactElement {
  const color = {
    backlog: "var(--neutral-500)",
    unstarted: "var(--neutral-600)",
    started: "var(--brand-700)",
    completed: "var(--green-700)",
    cancelled: "var(--red-700)",
  }[state] || "var(--neutral-500)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn("shrink-0", className)}
      style={{ flexShrink: 0 }}
      role="img"
      aria-label={`Estado: ${STATE_LABEL[state]}`}
    >
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        fill="none" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeDasharray={
          state === "unstarted" ? "2 2.5" :
          state === "backlog" ? "0.5 4" :
          state === "started" ? "47 100" :
          "100 100"
        }
      />
      {state === "completed" && (
        <>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path 
            d="m7 12 3.5 3.5L17 9" 
            stroke="#fff" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </>
      )}
      {state === "cancelled" && (
        <>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path 
            d="m8 8 8 8M16 8l-8 8" 
            stroke="#fff" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
