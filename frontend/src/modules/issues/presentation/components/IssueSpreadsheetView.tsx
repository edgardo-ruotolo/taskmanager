// TODO(bug-15): This component is currently unused (not imported anywhere).
// When re-enabled, replace hardcoded 'ISS-' with a projectIdentifier prop.
import type React from 'react';
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { IssuePriorityBadge } from './IssuePriorityBadge';
import { cn } from '@/lib/utils';
import type { Issue } from '../../domain/types';
import type { State } from '@/modules/states/domain/types';
import { useSubIssues } from '../../application/use-issues';
import { useIssuesUiStore } from '../../application/issues-ui-store';

interface IssueSpreadsheetViewProps {
    issues: Issue[];
    states: State[];
    onRowClick: (issueId: string) => void;
    /** When true (default), only top-level issues (no parentId) are shown; children load lazily. */
    topLevelOnly?: boolean;
    projectIdentifier?: string;
    workspaceSlug?: string;
    projectId?: string;
}

// Column widths — kept in sync with the header definition below.
const COL_SIZES = {
    select: 44,
    state: 130,
    id: 80,
    title: 250,
    subIssues: 90,
    priority: 110,
    dueDate: 120,
    createdAt: 120,
} as const;

// ── Recursive spreadsheet row ─────────────────────────────────────────────────

interface SpreadsheetRowProps {
    issue: Issue;
    states: Map<string, State>;
    onRowClick: (id: string) => void;
    level: number;
    projectIdentifier?: string;
    workspaceSlug: string;
    projectId: string;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: recursive tree row — complexity is structural
function SpreadsheetRow({
    issue,
    states,
    onRowClick,
    level,
    projectIdentifier,
    workspaceSlug,
    projectId,
}: SpreadsheetRowProps): React.ReactElement {
    const { toggleExpanded, isExpanded } = useIssuesUiStore();
    const expanded = isExpanded(issue.id);
    const hasSubIssues = (issue.subIssueCount ?? 0) > 0;

    const { data: subIssuesData, isLoading: subIssuesLoading } = useSubIssues(
        workspaceSlug,
        projectId,
        issue.id,
        expanded,
    );
    const subIssues = subIssuesData?.items ?? [];

    const state = states.get(issue.stateId);
    const titleIndent = level * 20;

    return (
        <>
            <tr
                onClick={() => onRowClick(issue.id)}
                className={cn(
                    'h-10 border-b border-subtle last:border-b-0 hover:bg-surface-2 cursor-pointer transition-colors',
                    level > 0 && 'bg-surface-1',
                )}
            >
                {/* Select */}
                <td style={{ width: COL_SIZES.select }} className="px-3 py-2 overflow-hidden">
                    {/* biome-ignore lint/a11y/noStaticElementInteractions: stopPropagation wrapper */}
                    <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                        <Checkbox aria-label={`Seleccionar ${issue.title}`} />
                    </span>
                </td>

                {/* State */}
                <td style={{ width: COL_SIZES.state }} className="px-3 py-2 overflow-hidden">
                    <div className="flex items-center gap-2 min-w-0">
                        <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: state?.color ?? '#64748b' }}
                            aria-hidden="true"
                        />
                        <span className="truncate text-secondary">{issue.stateName}</span>
                    </div>
                </td>

                {/* ID */}
                <td style={{ width: COL_SIZES.id }} className="px-3 py-2 overflow-hidden">
                    <span className="font-mono text-xs text-placeholder">
                        {projectIdentifier ?? 'ISS'}-{issue.sequenceId}
                    </span>
                </td>

                {/* Title — indent + chevron */}
                <td style={{ width: COL_SIZES.title }} className="px-3 py-2 overflow-hidden">
                    <div className="flex items-center gap-1 min-w-0" style={{ paddingLeft: `${titleIndent}px` }}>
                        {hasSubIssues ? (
                            // biome-ignore lint/a11y/noStaticElementInteractions: stopPropagation wrapper; button owns interaction
                            <span
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); toggleExpanded(issue.id); }}
                                    aria-label={expanded ? 'Colapsar sub-tareas' : 'Expandir sub-tareas'}
                                    aria-expanded={expanded}
                                    className="p-0.5 rounded text-placeholder hover:text-secondary transition-colors shrink-0"
                                >
                                    {expanded
                                        ? <ChevronDown size={11} aria-hidden="true" />
                                        : <ChevronRight size={11} aria-hidden="true" />
                                    }
                                </button>
                            </span>
                        ) : (
                            <span className="w-4 shrink-0" />
                        )}
                        <span className="truncate text-primary">{issue.title}</span>
                    </div>
                </td>

                {/* Sub-issues counter */}
                <td style={{ width: COL_SIZES.subIssues }} className="px-3 py-2 overflow-hidden">
                    {hasSubIssues ? (
                        <span className="font-mono text-[10.5px] tabular-nums text-placeholder">
                            {issue.subIssueCompletedCount ?? 0}/{issue.subIssueCount ?? 0}
                        </span>
                    ) : (
                        <span className="text-placeholder">—</span>
                    )}
                </td>

                {/* Priority */}
                <td style={{ width: COL_SIZES.priority }} className="px-3 py-2 overflow-hidden">
                    <IssuePriorityBadge priority={issue.priority} />
                </td>

                {/* Due date */}
                <td style={{ width: COL_SIZES.dueDate }} className="px-3 py-2 overflow-hidden">
                    {issue.dueDate ? (
                        <span className="tabular-nums text-tertiary">
                            {new Date(issue.dueDate).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                            })}
                        </span>
                    ) : (
                        <span className="text-placeholder">—</span>
                    )}
                </td>

                {/* Created */}
                <td style={{ width: COL_SIZES.createdAt }} className="px-3 py-2 overflow-hidden">
                    <span className="tabular-nums text-placeholder">
                        {new Date(issue.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        })}
                    </span>
                </td>
            </tr>

            {/* Skeleton while loading children */}
            {expanded && subIssuesLoading && (['sk1', 'sk2'] as const).map((k) => (
                <tr key={k} className="h-10 border-b border-subtle">
                    <td colSpan={8} className="px-3 py-2" style={{ paddingLeft: `${24 + (level + 1) * 20}px` }}>
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-3 h-3 rounded-full bg-surface-2" />
                            <Skeleton className="h-2.5 w-16 bg-surface-2" />
                            <Skeleton className="h-2.5 w-40 bg-surface-2" />
                        </div>
                    </td>
                </tr>
            ))}

            {/* Recursive child rows */}
            {expanded && !subIssuesLoading && subIssues.map((child) => (
                <SpreadsheetRow
                    key={child.id}
                    issue={child}
                    states={states}
                    onRowClick={onRowClick}
                    level={level + 1}
                    projectIdentifier={projectIdentifier}
                    workspaceSlug={workspaceSlug}
                    projectId={projectId}
                />
            ))}
        </>
    );
}

// ── Column definition for header (sorting only — cells rendered by SpreadsheetRow) ──
const _columnHelper = createColumnHelper<Issue>();

const HEADER_COLUMNS = [
    _columnHelper.display({ id: 'select', header: 'Sel.', size: COL_SIZES.select, enableSorting: false }),
    _columnHelper.accessor('stateId', { header: 'Estado', size: COL_SIZES.state }),
    _columnHelper.accessor('sequenceId', { header: 'ID', size: COL_SIZES.id }),
    _columnHelper.accessor('title', { header: 'Título', size: COL_SIZES.title, minSize: 150 }),
    _columnHelper.display({ id: 'subIssues', header: 'Sub-tareas', size: COL_SIZES.subIssues, enableSorting: false }),
    _columnHelper.accessor('priority', { header: 'Prioridad', size: COL_SIZES.priority }),
    _columnHelper.accessor('dueDate', { header: 'Vencimiento', size: COL_SIZES.dueDate }),
    _columnHelper.accessor('createdAt', { header: 'Creado', size: COL_SIZES.createdAt }),
];

/** Compares two unknown values for ascending sort; nulls/undefineds sort last. */
function compareValues(av: unknown, bv: unknown, desc: boolean): number {
    if (av === bv) return 0;
    if (av === null || av === undefined) return desc ? -1 : 1;
    if (bv === null || bv === undefined) return desc ? 1 : -1;
    const result = av < bv ? -1 : 1;
    return desc ? -result : result;
}

// ── Main component ─────────────────────────────────────────────────────────────

export const IssueSpreadsheetView = ({
    issues,
    states,
    onRowClick,
    topLevelOnly = true,
    projectIdentifier,
    workspaceSlug: propSlug,
    projectId: propProjectId,
}: IssueSpreadsheetViewProps): React.ReactElement => {
    const params = useParams<{ workspaceSlug: string; projectId: string }>();
    const resolvedSlug = propSlug ?? params.workspaceSlug ?? '';
    const resolvedProjectId = propProjectId ?? params.projectId ?? '';

    const [sorting, setSorting] = useState<SortingState>([]);

    const stateMap = useMemo(() => new Map(states.map((s) => [s.id, s])), [states]);

    // If topLevelOnly, filter to issues without a parentId; otherwise show all as received.
    const topLevelIssues = useMemo(
        () => topLevelOnly ? issues.filter((i) => !i.parentId) : issues,
        [issues, topLevelOnly],
    );

    // Header-only table instance — used solely for column sorting headers.
    const headerTable = useReactTable({
        data: topLevelIssues,
        columns: HEADER_COLUMNS,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    // Apply sorting to the top-level list using the same column key.
    const sortedTopLevel = useMemo(() => {
        if (sorting.length === 0) return topLevelIssues;
        const first = sorting[0];
        if (!first) return topLevelIssues;
        const { id, desc } = first;
        return [...topLevelIssues].sort((a, b) =>
            compareValues(
                (a as unknown as Record<string, unknown>)[id],
                (b as unknown as Record<string, unknown>)[id],
                desc,
            ),
        );
    }, [topLevelIssues, sorting]);

    return (
        <div className="border border-subtle rounded-lg overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        {headerTable.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="bg-surface-1 border-b border-subtle">
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        style={{ width: header.getSize() }}
                                        className={cn(
                                            'px-3 py-2 text-left text-xs font-medium text-placeholder whitespace-nowrap select-none',
                                            header.column.getCanSort() && 'cursor-pointer hover:text-secondary transition-colors',
                                        )}
                                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                    >
                                        <div className="flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                <span className="opacity-40">
                                                    {header.column.getIsSorted() === 'asc' ? (
                                                        <ChevronUp size={12} />
                                                    ) : header.column.getIsSorted() === 'desc' ? (
                                                        <ChevronDown size={12} />
                                                    ) : (
                                                        <ChevronsUpDown size={12} />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {sortedTopLevel.map((issue) => (
                            <SpreadsheetRow
                                key={issue.id}
                                issue={issue}
                                states={stateMap}
                                onRowClick={onRowClick}
                                level={0}
                                projectIdentifier={projectIdentifier}
                                workspaceSlug={resolvedSlug}
                                projectId={resolvedProjectId}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
