import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Archive, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PRIORITY_LABELS } from '@/modules/issues/domain/types';
import type { IssuePriority } from '@/modules/issues/domain/types';

// Archived items are fetched from these sources:
// - Issues: items with completedAt + archived flag (currently there's no archive endpoint;
//   we render a placeholder until the backend exposes one)
// - Cycles: cycles with status Completed (approximation)
// - Modules: modules with status Archived

// Since the backend doesn't expose a dedicated archive endpoint yet, we show a
// well-structured empty state for each tab with restore capability ready for wiring.

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
    onRestore: (id: string) => void;
}

function ArchivedRow({ id, label, meta, onRestore }: ArchivedRowProps): React.ReactElement {
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
                className="h-7 px-3 text-xs border-subtle text-secondary hover:text-primary gap-1.5 shrink-0"
            >
                <RefreshCw size={12} />
                Restaurar
            </Button>
        </div>
    );
}

export const ArchivesPage = (): React.ReactElement => {
    const { workspaceSlug = '', companyId = '' } = useParams<{
        workspaceSlug: string;
        companyId: string;
    }>();
    const [activeTab, setActiveTab] = useState<ArchiveTab>('issues');

    // Placeholder restore handler — replace with actual mutation when backend endpoint is available
    const handleRestore = (kind: ArchiveTab, id: string): void => {
        void kind;
        void id;
        toast.info('Restaurar: funcionalidad pendiente de endpoint en backend');
    };

    // Placeholder: no items until backend exposes archive endpoints
    // Replace archivedIssues/archivedCycles/archivedModules with real queries when available
    const archivedIssues: Array<{ id: string; sequenceId: number; title: string; stateName: string; stateColor: string; priority: number }> = [];
    const archivedCycles: Array<{ id: string; name: string; issueCount: number }> = [];
    const archivedModules: Array<{ id: string; name: string; issueCount: number }> = [];

    void workspaceSlug;
    void companyId;

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
                        {archivedIssues.length === 0 ? (
                            <EmptyArchive label="tareas" />
                        ) : (
                            <div className="border border-subtle rounded-lg overflow-hidden">
                                {archivedIssues.map((issue) => (
                                    <ArchivedRow
                                        key={issue.id}
                                        id={issue.id}
                                        label={`ISS-${issue.sequenceId} — ${issue.title}`}
                                        meta={`${issue.stateName} · ${PRIORITY_LABELS[issue.priority as IssuePriority]}`}
                                        onRestore={(id) => handleRestore('issues', id)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="cycles">
                        {archivedCycles.length === 0 ? (
                            <EmptyArchive label="ciclos" />
                        ) : (
                            <div className="border border-subtle rounded-lg overflow-hidden">
                                {archivedCycles.map((cycle) => (
                                    <ArchivedRow
                                        key={cycle.id}
                                        id={cycle.id}
                                        label={cycle.name}
                                        meta={`${cycle.issueCount} issue${cycle.issueCount !== 1 ? 's' : ''}`}
                                        onRestore={(id) => handleRestore('cycles', id)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="modules">
                        {archivedModules.length === 0 ? (
                            <EmptyArchive label="módulos" />
                        ) : (
                            <div className="border border-subtle rounded-lg overflow-hidden">
                                {archivedModules.map((mod) => (
                                    <ArchivedRow
                                        key={mod.id}
                                        id={mod.id}
                                        label={mod.name}
                                        meta={`${mod.issueCount} issue${mod.issueCount !== 1 ? 's' : ''}`}
                                        onRestore={(id) => handleRestore('modules', id)}
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
