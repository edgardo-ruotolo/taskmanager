import type React from 'react';
import { cn } from '@/lib/utils';

type ProjectStatus = 'active' | 'closing' | 'archived';

interface ProjectStatusBadgeProps {
    status: ProjectStatus;
    className?: string;
}

const STATUS_CONFIG: Record<
    ProjectStatus,
    { label: string; dotClass: string; textClass: string }
> = {
    active: {
        label: 'Active',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-600',
    },
    closing: {
        label: 'Closing',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-600',
    },
    archived: {
        label: 'Archived',
        dotClass: 'bg-[var(--neutral-500)]',
        textClass: 'text-[var(--neutral-600)]',
    },
};

export const ProjectStatusBadge = ({
    status,
    className,
}: ProjectStatusBadgeProps): React.ReactElement => {
    const config = STATUS_CONFIG[status];

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 text-[11px] font-medium tracking-wide',
                config.textClass,
                className,
            )}
            title={`Estado: ${config.label}`}
        >
            <span
                className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotClass)}
                aria-hidden="true"
            />
            {config.label}
        </span>
    );
};

export const inferProjectStatus = (
    isArchived: boolean,
    stateGroupName?: string,
): ProjectStatus => {
    if (isArchived) return 'archived';
    if (stateGroupName?.toLowerCase().includes('closing')) return 'closing';
    return 'active';
};
