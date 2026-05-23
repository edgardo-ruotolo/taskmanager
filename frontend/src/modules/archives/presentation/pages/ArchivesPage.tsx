import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Archive, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PRIORITY_LABELS } from '@/modules/issues/domain/types';
import type { IssuePriority } from '@/modules/issues/domain/types';
import {
    useArchivedCycles,
    useArchivedIssues,
    useArchivedModules,
    useRestoreCycle,
    useRestoreIssue,
    useRestoreModule,
} from '../../application/use-archives';

type ArchiveTab = 'issues' | 'cycles' | 'modules';

interface EmptyArchiveProps {
    label: string;
}

function EmptyArchive({ label }: EmptyArchiveProps): React.ReactElement {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-subtle flex items-center justify-center mb-4">
                <Archive size={24} className="text-placeholder" />
            </div>
            <h3 className="text-sm font-semibold text-secondary mb-1">
                Sin {label} archivados
            </h3>
            <p className="text-xs text-placeholder max-w-xs">
                Los {label} archivados aparecerán aquí. Puedes restaurarlos en cualquier momento.
            </p>
        </div>
    );
}

interface ArchivedRowProps {
    id: string;
    label: string;
    meta?: string;
    isPending: boolean;
    onRestore: (id: string) => void;
}

function ArchivedRow({ id, label, meta, isPending, onRestore }: ArchivedRowProps): React.ReactElement {
    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle last:border-b-0 hover:bg-surface-2 transition-colors">
            <div className="flex-1 min-w-0">
                <p className="text-sm text-primary truncate">{label}</p>
                {meta && <p className="text-xs text-placeholder mt-0.5">{meta}</p>}
            </div>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onRestore(id)}
                disabled={isPending}
                className="h-7 px-3 text-xs border-subtle text-secondary hover:text-primary gap-1.5 shrink-0"
            >
                <RefreshCw size={12} />
                Restaurar
            </Button>
        </div>
    );
}

function LoadingSkeleton(): React.ReactElement {
    return (
        <div className="border border-subtle rounded-lg overflow-hidden">
            {[1, 2, 3].map(n => (
                <div key={n} className="flex items-center gap-3 px-4 py-3 border-b border-subtle last:border-b-0">
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-7 w-20" />
                </div>
            ))}
        </div>
    );
}

export const ArchivesPage = (): React.ReactElement => {
    const { workspaceSlug = '', projectId = '' } = useParams<{
        workspaceSlug: string;
        projectId: string;
    }>();
    const [activeTab, setActiveTab] = useState<ArchiveTab>('issues');

    const { data: archivedIssues = [], isLoading: loadingIssues } = useArchivedIssues(workspaceSlug, projectId);
    const { data: archivedCycles = [], isLoading: loadingCycles } = useArchivedCycles(workspaceSlug, projectId);
    const { data: archivedModules = [], isLoading: loadingModules } = useArchivedModules(workspaceSlug, projectId);

    const restoreIssueMutation = useRestoreIssue(workspaceSlug, projectId);
    const restoreCycleMutation = useRestoreCycle(workspaceSlug, projectId);
    const restoreModuleMutation = useRestoreModule(workspaceSlug, projectId);

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-surface-2 border border-subtle flex items-center justify-center">
                        <Archive size={16} className="text-placeholder" />
                    </div>
                    <div>
                        <p className="text-xs text-placeholder uppercase tracking-wider leading-none mb-0.5">
                            {workspaceSlug}
                        </p>
                        <h1 className="text-xl font-semibold text-primary">Archivos</h1>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ArchiveTab)}>
                    <TabsList className="bg-surface-2 border border-subtle mb-6">
                        <TabsTrigger value="issues" className="text-xs">
                            Tareas
                            {archivedIssues.length > 0 && (
                                <span className="ml-1.5 text-[10px] bg-layer-1 px-1.5 py-0.5 rounded-full text-placeholder">
                                    {archivedIssues.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="cycles" className="text-xs">
                            Ciclos
                            {archivedCycles.length > 0 && (
                                <span className="ml-1.5 text-[10px] bg-layer-1 px-1.5 py-0.5 rounded-full text-placeholder">
                                    {archivedCycles.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="modules" className="text-xs">
                            Módulos
                            {archivedModules.length > 0 && (
                                <span className="ml-1.5 text-[10px] bg-layer-1 px-1.5 py-0.5 rounded-full text-placeholder">
                                    {archivedModules.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="issues">
                        {loadingIssues ? (
                            <LoadingSkeleton />
                        ) : archivedIssues.length === 0 ? (
                            <EmptyArchive label="tareas" />
                        ) : (
                            <div className="border border-subtle rounded-lg overflow-hidden">
                                {archivedIssues.map((issue) => (
                                    <ArchivedRow
                                        key={issue.id}
                                        id={issue.id}
                                        label={`ISS-${issue.sequenceId} — ${issue.title}`}
                                        meta={`${issue.stateName} · ${PRIORITY_LABELS[issue.priority as IssuePriority]}`}
                                        isPending={restoreIssueMutation.isPending}
                                        onRestore={(id) => restoreIssueMutation.mutate(id)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="cycles">
                        {loadingCycles ? (
                            <LoadingSkeleton />
                        ) : archivedCycles.length === 0 ? (
                            <EmptyArchive label="ciclos" />
                        ) : (
                            <div className="border border-subtle rounded-lg overflow-hidden">
                                {archivedCycles.map((cycle) => (
                                    <ArchivedRow
                                        key={cycle.id}
                                        id={cycle.id}
                                        label={cycle.name}
                                        meta={`${cycle.issueCount} issue${cycle.issueCount !== 1 ? 's' : ''}`}
                                        isPending={restoreCycleMutation.isPending}
                                        onRestore={(id) => restoreCycleMutation.mutate(id)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="modules">
                        {loadingModules ? (
                            <LoadingSkeleton />
                        ) : archivedModules.length === 0 ? (
                            <EmptyArchive label="módulos" />
                        ) : (
                            <div className="border border-subtle rounded-lg overflow-hidden">
                                {archivedModules.map((mod) => (
                                    <ArchivedRow
                                        key={mod.id}
                                        id={mod.id}
                                        label={mod.name}
                                        meta={`${mod.issueCount} issue${mod.issueCount !== 1 ? 's' : ''}`}
                                        isPending={restoreModuleMutation.isPending}
                                        onRestore={(id) => restoreModuleMutation.mutate(id)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
