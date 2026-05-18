import type React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState = ({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps): React.ReactElement => (
    <div className={cn('flex flex-col items-center justify-center py-24 text-center', className)}>
        {icon && <div className="mb-4 text-placeholder">{icon}</div>}
        <h2 className="text-lg font-medium text-secondary mb-2">{title}</h2>
        {description && <p className="text-sm text-placeholder mb-6 max-w-sm">{description}</p>}
        {action}
    </div>
);
