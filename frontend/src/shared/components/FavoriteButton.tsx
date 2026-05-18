import type React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/modules/workspaces/application/workspace-store';
import { useToggleFavorite } from '@/modules/favorites/application/use-favorites';

interface FavoriteButtonProps {
    entityType: string;
    entityId: string;
    className?: string;
}

export const FavoriteButton = ({ entityType, entityId, className }: FavoriteButtonProps): React.ReactElement => {
    const slug = useWorkspaceStore((s) => s.activeWorkspace?.slug ?? '');
    const { toggle, isFavorite, isPending } = useToggleFavorite(slug);
    const active = isFavorite(entityType, entityId);

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                toggle(entityType, entityId);
            }}
            disabled={isPending || !slug}
            aria-label={active ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            className={cn(
                'p-1 rounded transition-colors',
                active ? 'text-yellow-400 hover:text-yellow-500' : 'text-placeholder hover:text-tertiary',
                className,
            )}
        >
            <Star size={14} fill={active ? 'currentColor' : 'none'} />
        </button>
    );
};
