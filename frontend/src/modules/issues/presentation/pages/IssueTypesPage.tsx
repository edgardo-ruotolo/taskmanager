import type React from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Layers, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useIssueTypes, useDeleteIssueType } from '../../application/use-issue-types';
import { CreateIssueTypeDialog } from '../components/CreateIssueTypeDialog';

export const IssueTypesPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();

    const { data: types, isLoading } = useIssueTypes(workspaceSlug);
    const { mutate: deleteType, isPending: isDeleting } = useDeleteIssueType(workspaceSlug);

    const items = types ?? [];

    return (
        <div className="p-8">
            <div className="w-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-xs text-placeholder uppercase tracking-wider mb-1">
                            {workspaceSlug}
                        </p>
                        <h1 className="text-2xl font-bold text-primary">Tipos de tarea</h1>
                    </div>
                    <CreateIssueTypeDialog
                        workspaceSlug={workspaceSlug}
                        trigger={
                            <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                <Plus size={16} />
                                Nuevo Tipo
                            </Button>
                        }
                    />
                </div>

                {isLoading && (
                    <div className="space-y-2">
                        {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                            <div
                                key={k}
                                className="flex items-center gap-3 p-4 bg-surface-1/50 border border-subtle rounded-lg"
                            >
                                <Skeleton className="w-4 h-4 rounded-full bg-layer-1 shrink-0" />
                                <Skeleton className="h-4 w-32 bg-layer-1" />
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Layers size={48} className="text-placeholder mb-4" />
                        <h2 className="text-lg font-medium text-secondary mb-2">
                            No hay tipos de issue aún
                        </h2>
                        <p className="text-sm text-placeholder mb-6">
                            Crea tipos para categorizar los issues de este workspace
                        </p>
                        <CreateIssueTypeDialog
                            workspaceSlug={workspaceSlug}
                            trigger={
                                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                    <Plus size={16} />
                                    Crear primer tipo
                                </Button>
                            }
                        />
                    </div>
                )}

                {!isLoading && items.length > 0 && (
                    <div className="space-y-2">
                        {items.map((type) => (
                            <div
                                key={type.id}
                                className="flex items-center justify-between gap-3 p-4 bg-surface-1/50 border border-subtle rounded-lg hover:border-strong transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className="w-4 h-4 rounded-full shrink-0"
                                        style={{ backgroundColor: type.color ?? '#6b7280' }}
                                        aria-hidden="true"
                                    />
                                    <span className="text-sm font-medium text-primary">
                                        {type.name}
                                    </span>
                                    {type.isDefault && (
                                        <Badge className="bg-amber-900/50 text-amber-400 border-amber-800 text-xs">
                                            Por defecto
                                        </Badge>
                                    )}
                                    {type.description && (
                                        <span className="text-xs text-placeholder">
                                            {type.description}
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => deleteType(type.id)}
                                    className="text-placeholder hover:text-red-400 transition-colors shrink-0"
                                    aria-label={`Eliminar tipo ${type.name}`}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
