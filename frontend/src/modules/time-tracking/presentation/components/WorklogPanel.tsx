import type React from 'react';
import { useState } from 'react';
import { Clock, Plus, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    useWorklogs,
    useWorklogSummary,
    useCreateWorklog,
    useDeleteWorklog,
} from '../../application/use-worklogs';
import { WorklogForm } from './WorklogForm';
import type { Worklog, CreateWorklogData } from '../../domain/types';

function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

function getWorklogDuration(worklog: Worklog): number {
    if (worklog.durationMinutes !== undefined) return worklog.durationMinutes;
    if (worklog.startedAt && worklog.endedAt) {
        const diffMs =
            new Date(worklog.endedAt).getTime() - new Date(worklog.startedAt).getTime();
        return Math.round(diffMs / 60000);
    }
    return 0;
}

interface WorklogPanelProps {
    issueId: string;
    workspaceSlug: string;
}

export const WorklogPanel = ({
    issueId,
    workspaceSlug,
}: WorklogPanelProps): React.ReactElement => {
    const [showForm, setShowForm] = useState(false);

    const { data: worklogs = [], isLoading } = useWorklogs(workspaceSlug, issueId);
    const { data: summary } = useWorklogSummary(workspaceSlug, issueId);
    const { mutate: createWorklog, isPending: isCreating } = useCreateWorklog(
        workspaceSlug,
        issueId,
    );
    const { mutate: deleteWorklog, isPending: isDeleting } = useDeleteWorklog(
        workspaceSlug,
        issueId,
    );

    const handleCreate = (data: CreateWorklogData): void => {
        createWorklog(data, { onSuccess: () => setShowForm(false) });
    };

    const totalMinutes =
        summary?.totalMinutes ??
        worklogs.reduce((acc, w) => acc + getWorklogDuration(w), 0);

    return (
        <div className="border border-subtle rounded-lg bg-surface-1 overflow-hidden mt-4">
            {/* Header */}
            <div className="px-4 py-3 border-b border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-placeholder" />
                    <p className="text-xs font-semibold text-placeholder uppercase tracking-wider">
                        Tiempo registrado
                    </p>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowForm((v) => !v)}
                    className="h-6 px-2 text-xs text-secondary hover:text-primary gap-1"
                    aria-label="Registrar tiempo"
                >
                    <Plus size={12} />
                    Registrar tiempo
                </Button>
            </div>

            <div className="px-4 py-3">
                {/* Form */}
                {showForm && (
                    <div className="mb-4 p-3 rounded-md bg-layer-1/50 border border-subtle">
                        <WorklogForm
                            onSubmit={handleCreate}
                            isPending={isCreating}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                )}

                {/* Total summary */}
                {totalMinutes > 0 && (
                    <div className="mb-3 p-2.5 rounded-md bg-accent-primary/5 border border-accent-primary/20 text-xs text-secondary">
                        <span className="font-medium text-primary">Total: </span>
                        {formatDuration(totalMinutes)}
                        {summary?.byUser && summary.byUser.length > 1 && (
                            <span className="text-placeholder ml-2">
                                · {summary.byUser.length} colaboradores
                            </span>
                        )}
                    </div>
                )}

                {/* Worklog list */}
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2].map((i) => (
                            <Skeleton key={i} className="h-10 w-full bg-layer-1 rounded-md" />
                        ))}
                    </div>
                ) : worklogs.length === 0 ? (
                    <p className="text-xs text-placeholder italic py-1">
                        No hay tiempo registrado.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {worklogs.map((worklog: Worklog) => {
                            const duration = getWorklogDuration(worklog);
                            return (
                                <div
                                    key={worklog.id}
                                    className={cn(
                                        'flex items-start gap-3 p-2.5 rounded-md bg-layer-1/30 border border-subtle/50',
                                        'hover:bg-layer-1/50 transition-colors group',
                                    )}
                                >
                                    <div className="w-6 h-6 rounded-full bg-layer-2 flex items-center justify-center shrink-0 mt-0.5">
                                        <User size={11} className="text-placeholder" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-semibold text-primary">
                                                {formatDuration(duration)}
                                            </span>
                                            <span className="text-xs text-placeholder">
                                                {new Date(worklog.startedAt).toLocaleDateString(
                                                    'es-ES',
                                                    {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    },
                                                )}
                                            </span>
                                        </div>
                                        {worklog.description && (
                                            <p className="text-xs text-secondary truncate">
                                                {worklog.description}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={() => deleteWorklog(worklog.id)}
                                        aria-label="Eliminar registro"
                                        className="text-placeholder hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 mt-0.5"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
