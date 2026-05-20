import type React from 'react';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartEmptyProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    className?: string;
    minHeightPx?: number;
}

/**
 * Inline empty state used inside analytics cards. Keeps the card's own border /
 * padding intact and just replaces the chart area.
 */
export const ChartEmpty = ({
    title = 'Datos insuficientes',
    description = 'Cuando empieces a crear tareas verás estadísticas aquí.',
    icon,
    className,
    minHeightPx = 200,
}: ChartEmptyProps): React.ReactElement => (
    <div
        className={cn('flex flex-col items-center justify-center text-center gap-2 p-6', className)}
        style={{ minHeight: minHeightPx }}
        role="status"
        aria-live="polite"
    >
        {icon ?? <BarChart3 className="size-8 text-tertiary" aria-hidden="true" />}
        <div className="text-sm font-medium text-primary">{title}</div>
        <div className="text-xs text-tertiary max-w-[260px]">{description}</div>
    </div>
);
