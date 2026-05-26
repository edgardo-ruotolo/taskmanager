import type React from 'react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/shared/components/ui/searchable-select';
import { cn } from '@/lib/utils';
import { useAnalyticsFiltersStore } from '../../application/filters-store';
import { useCreateExport, useDrilldown } from '../../application/use-analytics';
import type { IssueRowDto } from '../../domain/types';

const PAGE_SIZES = [25, 50, 100, 200];

export const DrilldownPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const filters = useAnalyticsFiltersStore(workspaceSlug);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const sortBy = sorting[0]?.id;
    const sortDesc = sorting[0]?.desc ?? true;

    const { data, isLoading } = useDrilldown(workspaceSlug, filters, page, pageSize, sortBy, sortDesc);
    const createExport = useCreateExport(workspaceSlug);

    const rows = data?.items ?? [];

    const columns = useMemo<ColumnDef<IssueRowDto>[]>(
        () => [
            {
                id: 'select',
                header: () => (
                    <Checkbox
                        checked={
                            rows.length > 0 && rows.every((r) => selected.has(r.id))
                                ? true
                                : selected.size > 0
                                  ? 'indeterminate'
                                  : false
                        }
                        onCheckedChange={(c) => {
                            if (c) {
                                setSelected(new Set(rows.map((r) => r.id)));
                            } else {
                                setSelected(new Set());
                            }
                        }}
                        aria-label="Seleccionar todo"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={selected.has(row.original.id)}
                        onCheckedChange={(c) => {
                            const next = new Set(selected);
                            if (c) next.add(row.original.id);
                            else next.delete(row.original.id);
                            setSelected(next);
                        }}
                        aria-label={`Seleccionar ${row.original.title}`}
                    />
                ),
                enableSorting: false,
            },
            {
                id: 'sequenceId',
                header: 'ID',
                cell: ({ row }) => (
                    <span className="font-mono text-[11px] text-[var(--neutral-600)]">
                        {row.original.projectIdentifier}-{row.original.sequenceId}
                    </span>
                ),
            },
            {
                id: 'title',
                header: 'Título',
                cell: ({ row }) => (
                    <span className="text-[13px] text-[var(--neutral-1200)]">{row.original.title}</span>
                ),
            },
            {
                id: 'labels',
                header: 'Cliente',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex flex-wrap gap-1">
                        {row.original.labelNames.length === 0 ? (
                            <span className="text-[var(--neutral-500)] text-[12px]">—</span>
                        ) : (
                            row.original.labelNames.slice(0, 3).map((n) => (
                                <Badge key={n} variant="secondary" className="text-[10px] h-4 px-1.5">
                                    {n}
                                </Badge>
                            ))
                        )}
                    </div>
                ),
            },
            {
                id: 'assignee',
                header: 'Asignado',
                cell: ({ row }) => (
                    <span className="text-[12.5px] text-[var(--neutral-700)]">
                        {row.original.assigneeName ?? '—'}
                    </span>
                ),
            },
            {
                id: 'state',
                header: 'Estado',
                cell: ({ row }) => (
                    <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px]"
                        style={{
                            background: `${row.original.stateColor}22`,
                            color: row.original.stateColor,
                        }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: row.original.stateColor }}
                        />
                        {row.original.stateName}
                    </span>
                ),
            },
            {
                id: 'priority',
                header: 'Prioridad',
                cell: ({ row }) => (
                    <span className="text-[12.5px] text-[var(--neutral-700)]">{row.original.priority}</span>
                ),
            },
            {
                id: 'startDate',
                header: 'Inicio',
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="font-mono text-[11px] text-[var(--neutral-600)]">
                        {formatDate(row.original.startDate)}
                    </span>
                ),
            },
            {
                id: 'dueDate',
                header: 'Vence',
                cell: ({ row }) => (
                    <span className="font-mono text-[11px] text-[var(--neutral-600)]">
                        {formatDate(row.original.dueDate)}
                    </span>
                ),
            },
            {
                id: 'daysInProgress',
                header: 'Días',
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="font-mono text-[11px] tabular-nums text-[var(--neutral-700)]">
                        {row.original.daysInProgress.toFixed(1)}
                    </span>
                ),
            },
        ],
        [rows, selected],
    );

    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        state: { sorting },
        onSortingChange: (updater) => {
            setSorting((prev) => {
                const next = typeof updater === 'function' ? updater(prev) : updater;
                setPage(1);
                return next;
            });
        },
    });

    const totalPages = data?.totalPages ?? 1;
    const totalCount = data?.totalCount ?? 0;

    const handleExport = (format: 'xlsx' | 'csv'): void => {
        createExport.mutate({
            format,
            filters: JSON.stringify({ filters, sections: [] }),
        });
    };

    return (
        <div className="w-full px-10 py-8 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-[20px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)]">
                        Detalle de tareas
                    </h2>
                    <p className="text-[12.5px] text-[var(--neutral-600)] mt-0.5">
                        {totalCount} resultado(s){' '}
                        {selected.size > 0 && `· ${selected.size} seleccionado(s)`}
                    </p>
                </div>
                {selected.size > 0 && (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExport('xlsx')}
                            disabled={createExport.isPending}
                        >
                            Exportar (XLSX)
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExport('csv')}
                            disabled={createExport.isPending}
                        >
                            Exportar (CSV)
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-white border border-[var(--neutral-400)] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12.5px]">
                        <thead className="bg-[var(--neutral-100)] border-b border-[var(--neutral-300)]">
                            {table.getHeaderGroups().map((hg) => (
                                <tr key={hg.id}>
                                    {hg.headers.map((h) => {
                                        const sortable = h.column.getCanSort();
                                        const sort = h.column.getIsSorted();
                                        return (
                                            <th
                                                key={h.id}
                                                className={cn(
                                                    'px-3 py-2 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--neutral-600)]',
                                                    sortable && 'cursor-pointer select-none',
                                                )}
                                                onClick={
                                                    sortable
                                                        ? h.column.getToggleSortingHandler()
                                                        : undefined
                                                }
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                                    {sort === 'asc' && <ArrowUp className="h-3 w-3" />}
                                                    {sort === 'desc' && <ArrowDown className="h-3 w-3" />}
                                                </span>
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-3 py-8 text-center text-[var(--neutral-600)]"
                                    >
                                        Cargando…
                                    </td>
                                </tr>
                            )}
                            {!isLoading && rows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-3 py-12 text-center text-[var(--neutral-600)]"
                                    >
                                        Sin resultados para los filtros aplicados.
                                    </td>
                                </tr>
                            )}
                            {!isLoading &&
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-[var(--neutral-100)] hover:bg-[var(--neutral-50)]"
                                    >
                                        {row.getVisibleCells().map((c) => (
                                            <td key={c.id} className="px-3 py-2">
                                                {flexRender(c.column.columnDef.cell, c.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-[var(--neutral-200)] px-3 py-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[12px] text-[var(--neutral-600)]">
                        <span>Por página:</span>
                        <SearchableSelect
                            multi={false}
                            value={String(pageSize)}
                            onChange={(v) => {
                                if (v) { setPageSize(Number(v)); setPage(1); }
                            }}
                            items={PAGE_SIZES.map((n) => ({ id: String(n), label: String(n) }))}
                            placeholder="50"
                            width={88}
                            clearable={false}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[var(--neutral-700)]">
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <span className="font-mono">
                            {page} / {totalPages}
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

function formatDate(s: string | null): string {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('es', { day: '2-digit', month: 'short' });
}
