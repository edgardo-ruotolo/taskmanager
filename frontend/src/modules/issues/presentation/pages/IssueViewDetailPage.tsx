import type React from 'react';
import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, LayoutList, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useIssueViews, useDeleteIssueView } from '../../application/use-issue-views';
import { IssuePeekOverview } from '../components/IssuePeekOverview';
import type { Issue, IssueView } from '../../domain/types';

interface ParsedFilter {
    key: string;
    value: string;
}

function parseFiltersJson(filtersJson: string | undefined): ParsedFilter[] {
    if (!filtersJson) return [];
    try {
        const parsed = JSON.parse(filtersJson) as Record<string, unknown>;
        return Object.entries(parsed)
            .filter(([, v]) => v !== null && v !== undefined && v !== '')
            .map(([key, value]) => ({ key, value: String(value) }));
    } catch {
        return [];
    }
}

const FILTER_LABEL: Record<string, string> = {
    stateId: 'Estado',
    priority: 'Prioridad',
    assigneeId: 'Asignado',
};

export const IssueViewDetailPage = (): React.ReactElement => {
    const { workspaceSlug = '', viewId = '' } = useParams<{
        workspaceSlug: string;
        viewId: string;
    }>();
    const navigate = useNavigate();
    const [peekIssue, setPeekIssue] = useState<Issue | null>(null);

    const { data: views, isLoading: viewsLoading } = useIssueViews(workspaceSlug);
    const { mutate: deleteView, isPending: isDeleting } = useDeleteIssueView(workspaceSlug);

    const view = views?.find((v) => v.id === viewId) ?? null;

    const parsedFilters = useMemo(() => parseFiltersJson(view?.filtersJson), [view]);

    const handleDelete = (): void => {
        deleteView(viewId, {
            onSuccess: () => {
                void navigate(`/${workspaceSlug}/settings/views`);
            },
        });
    };

    if (!viewsLoading && !view) {
        return (
            <div className="p-8 flex flex-col items-center justify-center py-24 text-center">
                <LayoutList size={48} className="text-placeholder mb-4" />
                <h2 className="text-lg font-medium text-secondary mb-2">Vista no encontrada</h2>
                <Button
                    variant="outline"
                    className="border-subtle text-secondary mt-4"
                    onClick={() => void navigate(`/${workspaceSlug}/settings/views`)}
                >
                    <ArrowLeft size={14} className="mr-2" />
                    Volver a vistas
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-subtle bg-canvas shrink-0">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-placeholder mb-3">
                    <Link
                        to={`/${workspaceSlug}/settings/views`}
                        className="hover:text-secondary transition-colors"
                    >
                        Vistas
                    </Link>
                    <ChevronRight size={12} />
                    <span className="text-primary">{view?.name ?? viewId}</span>
                </nav>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void navigate(`/${workspaceSlug}/settings/views`)}
                            className="h-7 px-2 text-secondary hover:text-primary -ml-2 shrink-0"
                        >
                            <ArrowLeft size={14} className="mr-1.5" />
                            Volver
                        </Button>

                        {viewsLoading ? (
                            <Skeleton className="h-5 w-48 bg-layer-1" />
                        ) : (
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg font-semibold text-primary truncate">
                                        {view?.name}
                                    </h1>
                                    {view?.isGlobal ? (
                                        <Badge className="bg-blue-900/50 text-blue-400 border-blue-800 text-xs shrink-0">
                                            Global
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-layer-1 text-tertiary text-xs shrink-0">
                                            Personal
                                        </Badge>
                                    )}
                                </div>
                                {view?.description && (
                                    <p className="text-xs text-placeholder mt-0.5">{view.description}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="h-8 px-3 text-secondary gap-1.5 text-xs"
                            title="Editar vista (próximamente)"
                        >
                            <Pencil size={13} />
                            Editar
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={isDeleting}
                            onClick={handleDelete}
                            className="h-8 px-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 gap-1.5 text-xs"
                        >
                            <Trash2 size={13} />
                            Eliminar
                        </Button>
                    </div>
                </div>

                {/* Filter chips */}
                {parsedFilters.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs text-placeholder">Filtros:</span>
                        {parsedFilters.map((f) => (
                            <span
                                key={f.key}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-layer-1 border border-subtle rounded-full text-xs text-secondary"
                            >
                                <span className="text-placeholder">{FILTER_LABEL[f.key] ?? f.key}:</span>
                                {f.value}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
                {viewsLoading ? (
                    <div className="space-y-2">
                        {(['sk-0', 'sk-1', 'sk-2', 'sk-3'] as const).map((k) => (
                            <Skeleton key={k} className="h-12 w-full bg-layer-1 rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <IssueViewBody view={view} onIssueClick={setPeekIssue} />
                )}
            </div>

            <IssuePeekOverview issue={peekIssue} onClose={() => setPeekIssue(null)} />
        </div>
    );
};

interface IssueViewBodyProps {
    view: IssueView | null;
    onIssueClick: (issue: Issue) => void;
}

function IssueViewBody({ view, onIssueClick }: IssueViewBodyProps): React.ReactElement {
    // onIssueClick is available for future use when backend exposes per-view issue listing
    void onIssueClick;

    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-subtle flex items-center justify-center mb-4">
                <LayoutList size={24} className="text-placeholder" />
            </div>
            <h3 className="text-base font-semibold text-secondary mb-1">Vista guardada</h3>
            <p className="text-sm text-placeholder max-w-sm">
                Las vistas filtran issues por proyecto. Para ver los issues con estos filtros, navega a
                la sección de issues de una proyecto y aplica los filtros manualmente.
            </p>
            {view?.filtersJson && (
                <pre className="mt-4 text-xs text-placeholder bg-surface-2 border border-subtle rounded-lg px-4 py-3 text-left max-w-sm overflow-x-auto">
                    {view.filtersJson}
                </pre>
            )}
        </div>
    );
}
