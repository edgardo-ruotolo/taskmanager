import type React from 'react';
import { useParams } from 'react-router-dom';
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLabels, useDeleteLabel } from '../../application/use-labels';
import { LabelFormDialog } from '../components/LabelFormDialog';

export const LabelsPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();

    const { data: labels, isLoading } = useLabels(workspaceSlug);
    const { mutate: deleteLabel, isPending: isDeleting } = useDeleteLabel(workspaceSlug);

    const items = labels ?? [];

    return (
        <div className="p-8">
            <div className="w-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-xs text-placeholder uppercase tracking-wider mb-1">
                            {workspaceSlug}
                        </p>
                        <h1 className="text-2xl font-bold text-primary">Etiquetas</h1>
                    </div>
                    <LabelFormDialog
                        workspaceSlug={workspaceSlug}
                        trigger={
                            <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                <Plus size={16} />
                                Agregar Etiqueta
                            </Button>
                        }
                    />
                </div>

                {isLoading && (
                    <div className="space-y-2">
                        {(['sk-0', 'sk-1', 'sk-2', 'sk-3'] as const).map((k) => (
                            <div
                                key={k}
                                className="flex items-center gap-3 p-3 bg-surface-1/50 border border-subtle rounded-lg"
                            >
                                <Skeleton className="w-4 h-4 rounded-full bg-layer-1" />
                                <Skeleton className="h-4 w-32 bg-layer-1" />
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Tag size={48} className="text-placeholder mb-4" />
                        <h2 className="text-lg font-medium text-secondary mb-2">
                            No hay etiquetas aún
                        </h2>
                        <p className="text-sm text-placeholder mb-6">
                            Crea etiquetas para categorizar los issues de este workspace
                        </p>
                        <LabelFormDialog
                            workspaceSlug={workspaceSlug}
                            trigger={
                                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                    <Plus size={16} />
                                    Crear primera etiqueta
                                </Button>
                            }
                        />
                    </div>
                )}

                {!isLoading && items.length > 0 && (
                    <div className="space-y-2">
                        {items.map((label) => (
                            <div
                                key={label.id}
                                className="flex items-center justify-between gap-3 p-3 bg-surface-1/50 border border-subtle rounded-lg hover:border-strong transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span
                                        className="w-4 h-4 rounded-full shrink-0"
                                        style={{ backgroundColor: label.color }}
                                        aria-hidden="true"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-primary truncate">{label.name}</span>
                                            <span className="text-xs text-placeholder font-mono">{label.color}</span>
                                        </div>
                                        {label.description && (
                                            <span className="text-xs text-tertiary truncate">
                                                {label.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <LabelFormDialog
                                        workspaceSlug={workspaceSlug}
                                        label={label}
                                        trigger={
                                            <button
                                                type="button"
                                                className="text-placeholder hover:text-accent-primary transition-colors"
                                                aria-label={`Editar etiqueta ${label.name}`}
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        }
                                    />
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={() => deleteLabel(label.id)}
                                        className="text-placeholder hover:text-red-400 transition-colors"
                                        aria-label={`Eliminar etiqueta ${label.name}`}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
