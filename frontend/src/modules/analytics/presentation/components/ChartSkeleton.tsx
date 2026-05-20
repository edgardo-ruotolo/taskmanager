import type React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChartSkeletonProps {
    variant: 'donut' | 'line' | 'bar' | 'heatmap';
    className?: string;
}

/**
 * Fixed-size loading placeholders for analytics charts. They mirror the height
 * of their real counterparts so swapping between loading and ready state does
 * not cause CLS (Cumulative Layout Shift).
 */
export const ChartSkeleton = ({ variant, className }: ChartSkeletonProps): React.ReactElement => {
    if (variant === 'donut') {
        return (
            <div className={cn('flex items-center justify-center h-[280px] w-full', className)}>
                <Skeleton className="size-40 rounded-full" />
            </div>
        );
    }
    if (variant === 'line') {
        return (
            <div className={cn('h-[280px] w-full p-4 flex flex-col gap-3', className)}>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-full w-full" />
            </div>
        );
    }
    if (variant === 'bar') {
        return (
            <div className={cn('h-[200px] w-full p-4 flex items-end gap-2', className)}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton
                        // biome-ignore lint/suspicious/noArrayIndexKey: positional bars
                        key={i}
                        className="flex-1"
                        style={{ height: `${30 + Math.random() * 60}%` }}
                    />
                ))}
            </div>
        );
    }
    // heatmap
    return (
        <div className={cn('grid gap-1 w-full', className)} style={{ gridTemplateColumns: 'repeat(30, 1fr)' }}>
            {Array.from({ length: 30 * 4 }).map((_, i) => (
                <Skeleton
                    // biome-ignore lint/suspicious/noArrayIndexKey: positional cells
                    key={i}
                    className="h-5 rounded-sm"
                />
            ))}
        </div>
    );
};
