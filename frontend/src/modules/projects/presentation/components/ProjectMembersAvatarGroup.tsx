import type React from 'react';
import { cn } from '@/lib/utils';
import type { ProjectMember } from '../../domain/types';

interface ProjectMembersAvatarGroupProps {
    members: ProjectMember[];
    maxVisible?: number;
    className?: string;
}

function getInitials(displayName?: string, email?: string): string {
    const name = displayName ?? email ?? '?';
    return name
        .split(' ')
        .map((p) => p[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

const AVATAR_COLORS = [
    'bg-blue-600',
    'bg-emerald-600',
    'bg-violet-600',
    'bg-amber-600',
    'bg-rose-600',
];

function getAvatarColor(index: number): string {
    return AVATAR_COLORS[index % AVATAR_COLORS.length] ?? 'bg-blue-600';
}

export const ProjectMembersAvatarGroup = ({
    members,
    maxVisible = 4,
    className,
}: ProjectMembersAvatarGroupProps): React.ReactElement => {
    const visible = members.slice(0, maxVisible);
    const overflow = members.length - maxVisible;

    if (members.length === 0) {
        return (
            <div className={cn('flex items-center', className)}>
                <span className="text-[11px] text-[var(--neutral-500)] italic">
                    Sin miembros
                </span>
            </div>
        );
    }

    return (
        <div
            role="group"
            aria-label={`${members.length} miembro${members.length !== 1 ? 's' : ''}`}
            className={cn('flex items-center', className)}
        >
            <div className="flex -space-x-1.5">
                {visible.map((member, i) => (
                    <div
                        key={member.userId}
                        title={member.displayName ?? member.email ?? 'Miembro'}
                        className={cn(
                            'w-6 h-6 rounded-full border-2 border-white flex items-center justify-center',
                            'text-[9px] font-semibold text-white shrink-0',
                            getAvatarColor(i),
                        )}
                    >
                        {getInitials(member.displayName, member.email)}
                    </div>
                ))}
                {overflow > 0 && (
                    <div
                        title={`+${overflow} más`}
                        className="w-6 h-6 rounded-full border-2 border-white bg-[var(--neutral-300)] flex items-center justify-center text-[9px] font-semibold text-[var(--neutral-700)] shrink-0"
                    >
                        +{overflow}
                    </div>
                )}
            </div>
        </div>
    );
};
