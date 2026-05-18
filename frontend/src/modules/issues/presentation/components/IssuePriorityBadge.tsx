import type React from 'react';
import { AlertCircle, ArrowUp, Minus, ArrowDown, Dot } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IssuePriority } from '../../domain/types';

interface IssuePriorityBadgeProps {
    priority: IssuePriority;
    className?: string;
}

const PRIORITY_CONFIG: Record<
    IssuePriority,
    { label: string; color: string; Icon: React.ElementType }
> = {
    0: { label: 'Sin prioridad', color: 'text-[var(--priority-none)]', Icon: Dot },
    1: { label: 'Urgente', color: 'text-[var(--priority-urgent)]', Icon: AlertCircle },
    2: { label: 'Alta', color: 'text-[var(--priority-high)]', Icon: ArrowUp },
    3: { label: 'Media', color: 'text-[var(--priority-medium)]', Icon: Minus },
    4: { label: 'Baja', color: 'text-[var(--priority-low)]', Icon: ArrowDown },
};

export const IssuePriorityBadge = ({
    priority,
    className,
}: IssuePriorityBadgeProps): React.ReactElement => {
    const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG[0];
    const { label, color, Icon } = config;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 text-xs font-medium',
                color,
                className,
            )}
        >
            <Icon size={12} aria-hidden="true" />
            <span className="capitalize">{label}</span>
        </span>
    );
};
