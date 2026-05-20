import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps): React.ReactElement {
  return (
    <div
      className={cn(
        "font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}
