import { useState } from 'react';
import type React from 'react';
import { useParams } from 'react-router-dom';
import {
    Star,
    FolderOpen,
    Folder,
    Plus,
    ChevronRight,
    GripVertical,
    Building2,
    CircleDot,
    RotateCcw,
    LayoutList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useFavorites } from '../../application/use-favorites';
import type { Favorite } from '../../domain/types';

const ENTITY_ICONS: Record<string, React.ElementType> = {
    company: Building2,
    issue: CircleDot,
    cycle: RotateCcw,
    module: LayoutList,
    view: Star,
};

const ENTITY_LABELS: Record<string, string> = {
    company: 'Empresa',
    issue: 'Tarea',
    cycle: 'Ciclo',
    module: 'Módulo',
    view: 'Vista',
};

interface FavoriteItemProps {
    favorite: Favorite;
    isDragging: boolean;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragEnd: () => void;
}

function FavoriteItem({
    favorite,
    isDragging,
    onDragStart,
    onDragEnd,
}: FavoriteItemProps): React.ReactElement {
    const Icon = ENTITY_ICONS[favorite.entityType] ?? Star;
    const label = ENTITY_LABELS[favorite.entityType] ?? favorite.entityType;

    return (
        <li
            draggable
            onDragStart={(e) => onDragStart(e, favorite.id)}
            onDragEnd={onDragEnd}
            className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-sm group transition-colors cursor-pointer list-none',
                'hover:bg-layer-transparent-hover',
                isDragging && 'opacity-50',
            )}
        >
            <GripVertical
                size={12}
                className="text-placeholder opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-grab"
                aria-hidden="true"
            />
            <Icon size={14} className="text-tertiary shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
                <p className="text-[13px] text-secondary truncate">
                    {favorite.entityId}
                </p>
                <p className="text-[11px] text-placeholder">{label}</p>
            </div>
        </li>
    );
}

interface FolderSectionProps {
    name: string;
    items: Favorite[];
    isOpen: boolean;
    onToggle: () => void;
    dragState: { draggingId: string | null };
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragEnd: () => void;
}

function FolderSection({
    name,
    items,
    isOpen,
    onToggle,
    dragState,
    onDragStart,
    onDragEnd,
}: FolderSectionProps): React.ReactElement {
    return (
        <div>
            <button
                type="button"
                onClick={onToggle}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-sm hover:bg-layer-transparent-hover transition-colors group"
            >
                <ChevronRight
                    size={12}
                    className={cn(
                        'text-placeholder transition-transform duration-150 shrink-0',
                        isOpen && 'rotate-90',
                    )}
                    aria-hidden="true"
                />
                {isOpen ? (
                    <FolderOpen size={14} className="text-tertiary shrink-0" aria-hidden="true" />
                ) : (
                    <Folder size={14} className="text-tertiary shrink-0" aria-hidden="true" />
                )}
                <span className="text-[13px] font-medium text-secondary flex-1 text-left truncate">
                    {name}
                </span>
                <span className="text-[11px] text-placeholder opacity-0 group-hover:opacity-100 transition-opacity">
                    {items.length}
                </span>
            </button>

            {isOpen && items.length > 0 && (
                <div className="ml-4 mt-0.5 space-y-0">
                    {items.map((fav) => (
                        <FavoriteItem
                            key={fav.id}
                            favorite={fav}
                            isDragging={dragState.draggingId === fav.id}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                        />
                    ))}
                </div>
            )}

            {isOpen && items.length === 0 && (
                <div className="ml-4 px-3 py-2">
                    <p className="text-[12px] text-placeholder italic">Sin elementos</p>
                </div>
            )}
        </div>
    );
}

function EmptyFavorites(): React.ReactElement {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-subtle flex items-center justify-center mb-4">
                <Star size={24} className="text-placeholder" />
            </div>
            <h3 className="text-base font-semibold text-secondary mb-1">Sin favoritos aún</h3>
            <p className="text-sm text-placeholder max-w-xs">
                Marca companies, issues, ciclos o vistas como favoritos para acceder rápido desde aquí.
            </p>
        </div>
    );
}

interface FolderState {
    name: string;
    isOpen: boolean;
}

export const FavoritesPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const { data: favorites = [], isLoading } = useFavorites(workspaceSlug);

    const [folders, setFolders] = useState<FolderState[]>([
        { name: 'Mis favoritos', isOpen: true },
    ]);
    const [newFolderName, setNewFolderName] = useState('');
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    // Group favorites by entity type into the default folder
    const groupedByType: Record<string, Favorite[]> = {};
    for (const fav of favorites) {
        const key = fav.entityType;
        if (!groupedByType[key]) groupedByType[key] = [];
        groupedByType[key].push(fav);
    }

    const toggleFolder = (index: number): void => {
        setFolders((prev) =>
            prev.map((f, i) => (i === index ? { ...f, isOpen: !f.isOpen } : f)),
        );
    };

    const addFolder = (): void => {
        if (!newFolderName.trim()) return;
        setFolders((prev) => [...prev, { name: newFolderName.trim(), isOpen: true }]);
        setNewFolderName('');
        setIsAddingFolder(false);
    };

    const handleDragStart = (e: React.DragEvent, id: string): void => {
        e.dataTransfer.effectAllowed = 'move';
        setDraggingId(id);
    };

    const handleDragEnd = (): void => {
        setDraggingId(null);
    };

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Star size={18} className="text-tertiary" aria-hidden="true" />
                        <h1 className="text-xl font-semibold text-primary">Favoritos</h1>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAddingFolder(true)}
                        className="border-subtle text-secondary hover:text-primary gap-1.5"
                    >
                        <Plus size={13} aria-hidden="true" />
                        Nueva carpeta
                    </Button>
                </div>

                {/* Add folder input */}
                {isAddingFolder && (
                    <div className="mb-4 flex gap-2">
                        <Input
                            autoFocus
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Nombre de la carpeta"
                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addFolder();
                                if (e.key === 'Escape') setIsAddingFolder(false);
                            }}
                        />
                        <Button
                            size="sm"
                            onClick={addFolder}
                            className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                        >
                            Crear
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsAddingFolder(false)}
                            className="border-subtle text-secondary"
                        >
                            Cancelar
                        </Button>
                    </div>
                )}

                {/* Content */}
                {isLoading ? (
                    <div className="space-y-2">
                        {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                            <Skeleton key={k} className="h-8 w-full rounded" />
                        ))}
                    </div>
                ) : favorites.length === 0 ? (
                    <EmptyFavorites />
                ) : (
                    <div className="space-y-1">
                        {folders.map((folder, index) => (
                            <FolderSection
                                key={folder.name}
                                name={folder.name}
                                items={favorites}
                                isOpen={folder.isOpen}
                                onToggle={() => toggleFolder(index)}
                                dragState={{ draggingId }}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            />
                        ))}

                        {/* Ungrouped favorites by entity type */}
                        {Object.entries(groupedByType).map(([entityType, items]) => (
                            <FolderSection
                                key={entityType}
                                name={ENTITY_LABELS[entityType] ?? entityType}
                                items={items}
                                isOpen={true}
                                onToggle={() => { /* always open */ }}
                                dragState={{ draggingId }}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
