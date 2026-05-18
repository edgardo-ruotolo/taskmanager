import type React from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePublicSpace } from '../../application/use-space';
import type { DeployBoard, PublicIssue } from '../../domain/types';

const PRIORITY_LABELS: Record<string, string> = {
    urgent: 'Urgente',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
    none: 'Sin prioridad',
};

const PRIORITY_COLORS: Record<string, string> = {
    urgent: 'bg-red-500/10 text-red-400 border-red-800',
    high: 'bg-orange-500/10 text-orange-400 border-orange-800',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-800',
    low: 'bg-blue-500/10 text-blue-400 border-blue-800',
    none: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

interface IssueRowProps {
    issue: PublicIssue;
    board: DeployBoard;
    gridCols: string;
}

const IssueRow = ({ issue, board, gridCols }: IssueRowProps): React.ReactElement => (
    <div
        className="grid items-center px-4 py-3 transition-colors hover:bg-zinc-900/50"
        style={{ gridTemplateColumns: gridCols }}
    >
        <div className="flex min-w-0 items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden="true" />
            <span className="truncate text-sm text-zinc-200">{issue.title}</span>
        </div>

        {board.showPriority && (
            <div className="flex justify-end">
                {issue.priority ? (
                    <Badge
                        variant="outline"
                        className={`text-xs ${PRIORITY_COLORS[issue.priority] ?? PRIORITY_COLORS.none}`}
                    >
                        {PRIORITY_LABELS[issue.priority] ?? issue.priority}
                    </Badge>
                ) : (
                    <span className="text-xs text-zinc-600">—</span>
                )}
            </div>
        )}

        {board.showState && (
            <div className="flex justify-end">
                {issue.stateName ? (
                    <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-800 text-xs text-zinc-300"
                    >
                        {issue.stateName}
                    </Badge>
                ) : (
                    <span className="text-xs text-zinc-600">—</span>
                )}
            </div>
        )}

        {board.showAssignees && (
            <div className="flex justify-end">
                {issue.assignees && issue.assignees.length > 0 ? (
                    <span className="truncate text-xs text-zinc-400">
                        {issue.assignees.join(', ')}
                    </span>
                ) : (
                    <span className="text-xs text-zinc-600">—</span>
                )}
            </div>
        )}
    </div>
);

interface IssuesTableProps {
    issues: PublicIssue[];
    board: DeployBoard;
}

const buildGridCols = (board: DeployBoard): string => {
    const cols = ['1fr'];
    if (board.showPriority) cols.push('100px');
    if (board.showState) cols.push('120px');
    if (board.showAssignees) cols.push('140px');
    return cols.join(' ');
};

const IssuesTable = ({ issues, board }: IssuesTableProps): React.ReactElement => {
    const showAnyColumn = board.showPriority || board.showState || board.showAssignees;
    const gridCols = buildGridCols(board);

    if (issues.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <CheckCircle2 className="mb-4 h-12 w-12 text-zinc-700" aria-hidden="true" />
                <p className="text-sm text-zinc-500">
                    No hay issues en este tablero por el momento
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
            {showAnyColumn && (
                <div
                    className="grid border-b border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500"
                    style={{ gridTemplateColumns: gridCols }}
                >
                    <span>Issue</span>
                    {board.showPriority && <span className="text-right">Prioridad</span>}
                    {board.showState && <span className="text-right">Estado</span>}
                    {board.showAssignees && <span className="text-right">Responsables</span>}
                </div>
            )}
            <div className="divide-y divide-zinc-800">
                {issues.map((issue) => (
                    <IssueRow key={issue.id} issue={issue} board={board} gridCols={gridCols} />
                ))}
            </div>
        </div>
    );
};

const LoadingState = (): React.ReactElement => (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" aria-hidden="true" />
            <p className="text-sm text-zinc-500">Cargando tablero...</p>
        </div>
    </div>
);

const ErrorState = (): React.ReactElement => (
    <div className="flex min-h-screen flex-col bg-zinc-950">
        <div className="flex flex-1 items-center justify-center">
            <div className="flex max-w-md flex-col items-center gap-4 text-center">
                <AlertCircle className="h-12 w-12 text-zinc-600" aria-hidden="true" />
                <h1 className="text-xl font-semibold text-zinc-200">Tablero no disponible</h1>
                <p className="text-sm text-zinc-500">
                    Este tablero no existe o no está disponible al público en este momento.
                </p>
            </div>
        </div>
        <footer className="border-t border-zinc-800 py-4 text-center">
            <p className="text-xs text-zinc-600">Powered by TaskManager</p>
        </footer>
    </div>
);

export const PublicSpacePage = (): React.ReactElement => {
    const { token = '' } = useParams<{ token: string }>();
    const { data, isLoading, isError } = usePublicSpace(token);

    if (isLoading) return <LoadingState />;
    if (isError || !data) return <ErrorState />;

    const { board, issues } = data;

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950">
            <header className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-5">
                <div className="mx-auto max-w-4xl">
                    <h1 className="text-xl font-bold text-zinc-100">{board.title}</h1>
                    {board.description && (
                        <p className="mt-1 text-sm text-zinc-400">{board.description}</p>
                    )}
                </div>
            </header>

            <main className="flex-1 px-6 py-8">
                <div className="mx-auto max-w-4xl">
                    <IssuesTable issues={issues} board={board} />
                </div>
            </main>

            <footer className="border-t border-zinc-800 py-4 text-center">
                <p className="text-xs text-zinc-600">Powered by TaskManager</p>
            </footer>
        </div>
    );
};
