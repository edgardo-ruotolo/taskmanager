import type React from 'react';
import { cn } from '@/lib/utils';

interface IssueStateBadgeProps {
    stateName: string;
    stateGroup: string;
    className?: string;
}

const GROUP_COLOR: Record<string, string> = {
    started: 'bg-[#f97316]',
    review: 'bg-[#8b5cf6]',
    completed: 'bg-[#22c55e]',
    cancelled: 'bg-[#ef4444]',
    backlog: 'bg-[#6b7280]',
    unstarted: 'bg-layer-2',
};

function getDotColor(group: string): string {
    return GROUP_COLOR[group.toLowerCase()] ?? 'bg-layer-2';
}

export const IssueStateBadge = ({
    stateName,
    stateGroup,
    className,
}: IssueStateBadgeProps): React.ReactElement => (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-secondary', className)}>
        <span
            className={cn('w-2 h-2 rounded-full shrink-0', getDotColor(stateGroup))}
            aria-hidden="true"
        />
        {stateName}
    </span>
);
