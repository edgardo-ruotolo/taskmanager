import type React from 'react';
import { useParams } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspaceActivity } from '../../application/use-activity';
import { ACTION_LABELS } from '../../domain/activity-types';

function formatRelative(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Justo ahora';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    if (diff < 172800) return 'Ayer';
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export const WorkspaceActivityPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const { data, isLoading } = useWorkspaceActivity(workspaceSlug);

    const activities = data?.items ?? [];

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-primary">Actividad</h1>
                    <p className="text-sm text-placeholder mt-1">
                        Registro de eventos del workspace
                    </p>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {(['a0', 'a1', 'a2', 'a3', 'a4'] as const).map((k) => (
                            <div key={k} className="flex gap-3">
                                <Skeleton className="w-8 h-8 rounded-full bg-layer-1 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-2/3 bg-layer-1" />
                                    <Skeleton className="h-3 w-1/3 bg-layer-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-subtle flex items-center justify-center mb-4">
                            <Activity size={24} className="text-placeholder" />
                        </div>
                        <h3 className="text-base font-semibold text-secondary mb-1">Sin actividad aún</h3>
                        <p className="text-sm text-placeholder max-w-xs">
                            Las acciones en el workspace aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-0.5 animate-fade-in">
                        {activities.map((activity, idx) => (
                            <div key={activity.id} className="flex gap-3 py-3">
                                {/* Timeline line */}
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-surface-2 border border-subtle flex items-center justify-center text-xs font-semibold text-tertiary shrink-0">
                                        {getInitials(activity.actorName)}
                                    </div>
                                    {idx < activities.length - 1 && (
                                        <div className="w-px flex-1 mt-1 bg-subtle" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-2">
                                    <p className="text-sm text-secondary">
                                        <span className="font-medium text-primary">
                                            {activity.actorName}
                                        </span>{' '}
                                        <span className="text-placeholder">
                                            {ACTION_LABELS[activity.action] ?? activity.action}
                                        </span>
                                        {activity.entityTitle && (
                                            <>
                                                {' '}
                                                <span className="font-medium text-primary">
                                                    {activity.entityTitle}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                    <p className="text-xs text-placeholder mt-0.5">
                                        {formatRelative(activity.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
