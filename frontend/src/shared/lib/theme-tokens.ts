export type LabelColor = 'indigo' | 'emerald' | 'grey' | 'crimson' | 'yellow' | 'orange' | 'pink' | 'purple';
export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

const labelColorMap: Record<LabelColor, string> = {
    indigo: 'bg-label-indigo-bg text-label-indigo-text border-label-indigo-border',
    emerald: 'bg-label-emerald-bg text-label-emerald-text border-label-emerald-border',
    grey: 'bg-label-grey-bg text-label-grey-text border-label-grey-border',
    crimson: 'bg-label-crimson-bg text-label-crimson-text border-label-crimson-border',
    yellow: 'bg-label-yellow-bg text-label-yellow-text border-label-yellow-border',
    orange: 'bg-label-orange-bg text-label-orange-text border-label-orange-border',
    pink: 'bg-label-pink-bg text-label-pink-text border-label-pink-border',
    purple: 'bg-label-purple-bg text-label-purple-text border-label-purple-border',
};

const priorityMap: Record<Priority, string> = {
    urgent: 'text-priority-urgent',
    high: 'text-priority-high',
    medium: 'text-priority-medium',
    low: 'text-priority-low',
    none: 'text-priority-none',
};

export function getLabelColorClasses(color: LabelColor): string {
    return labelColorMap[color];
}

export function getPriorityClasses(priority: Priority): string {
    return priorityMap[priority];
}
