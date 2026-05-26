import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useWorkspaces } from '../../application/use-workspaces';
import { CreateWorkspaceDialog } from '../components/CreateWorkspaceDialog';

export const WorkspacesPage = (): React.ReactElement => {
    const navigate = useNavigate();
    const { data, isLoading } = useWorkspaces();
    const workspaces = data?.items ?? [];

    return (
        <div className="min-h-screen bg-canvas p-8">
            <div className="w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-primary">Mis espacios de trabajo</h1>
                        <p className="text-sm text-placeholder mt-1">
                            Selecciona o crea un espacio de trabajo para comenzar
                        </p>
                    </div>
                    <CreateWorkspaceDialog
                        trigger={
                            <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                <Plus size={16} />
                                Nuevo espacio de trabajo
                            </Button>
                        }
                    />
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                            <div
                                key={k}
                                className="bg-surface-2 border border-subtle rounded-xl p-5 space-y-3"
                            >
                                <Skeleton className="h-5 w-2/3 bg-layer-1" />
                                <Skeleton className="h-3 w-1/3 bg-layer-1" />
                                <Skeleton className="h-3 w-full bg-layer-1" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && workspaces.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-28 text-center animate-fade-in">
                        <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-subtle flex items-center justify-center mb-4">
                            <FolderOpen size={28} className="text-placeholder" />
                        </div>
                        <h2 className="text-lg font-semibold text-secondary mb-2">
                            No tienes workspaces aún
                        </h2>
                        <p className="text-sm text-placeholder mb-6 max-w-xs">
                            Crea tu primer workspace para empezar a organizar tus proyectos
                        </p>
                        <CreateWorkspaceDialog
                            trigger={
                                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                    <Plus size={16} />
                                    Crear primer workspace
                                </Button>
                            }
                        />
                    </div>
                )}

                {/* Grid */}
                {!isLoading && workspaces.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                        {workspaces.map((ws) => (
                            <div
                                key={ws.id}
                                className={cn(
                                    'group relative flex flex-col gap-3',
                                    'bg-surface-2 border border-subtle rounded-xl p-5',
                                    'hover:border-strong hover:shadow-lg transition-all duration-150',
                                )}
                            >
                                {/* Workspace initial avatar */}
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-9 h-9 rounded-lg bg-accent-subtle border border-accent-subtle flex items-center justify-center text-base font-bold text-accent-primary shrink-0">
                                        {ws.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-primary text-sm leading-tight truncate">
                                            {ws.name}
                                        </h3>
                                        <p className="text-xs text-placeholder font-mono truncate">
                                            /{ws.slug}
                                        </p>
                                    </div>
                                </div>

                                {ws.description && (
                                    <p className="text-xs text-tertiary line-clamp-2 leading-relaxed">
                                        {ws.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-subtle mt-auto">
                                    <div className="flex items-center gap-1.5 text-xs text-placeholder">
                                        <Calendar size={11} />
                                        <span>
                                            {new Date(ws.createdAt).toLocaleDateString('es-ES')}
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => void navigate(`/${ws.slug}/projects`)}
                                        className="bg-layer-2 hover:bg-layer-3 text-secondary text-xs h-7 px-3 gap-1"
                                    >
                                        Abrir
                                        <ArrowRight size={11} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
