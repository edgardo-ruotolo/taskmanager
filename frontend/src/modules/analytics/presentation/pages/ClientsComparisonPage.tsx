import type React from 'react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils';
import { useAnalyticsFiltersStore } from '../../application/filters-store';
import { useClientsComparison } from '../../application/use-analytics';
import type { ClientComparisonDto } from '../../domain/types';

export const ClientsComparisonPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const filters = useAnalyticsFiltersStore(workspaceSlug);
    const { data, isLoading } = useClientsComparison(workspaceSlug, filters);
    const [sorting, setSorting] = useState<SortingState>([{ id: 'total', desc: true }]);

    const rows = data ?? [];

    const summary = useMemo(() => {
        const active = rows.filter((r) => r.total > 0);
        const totalIssues = rows.reduce((acc, r) => acc + r.total, 0);
        const avgComplete =
            active.length > 0
                ? active.reduce((acc, r) => acc + r.percentComplete, 0) / active.length
                : 0;
        return {
            activeClients: active.length,
            totalIssues,
            avgComplete,
        };
    }, [rows]);

    const columns = useMemo<ColumnDef<ClientComparisonDto>[]>(
        () => [
            {
                id: 'client',
                header: 'Cliente',
                accessorFn: (r) => r.labelName,
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <span
                            className="h-2.5 w-2.5 rounded-sm shrink-0"
                            style={{ background: row.original.labelColor }}
                        />
                        <span className="text-[13px] text-[var(--neutral-1200)] font-medium">
                            {row.original.labelName}
                        </span>
                    </div>
                ),
            },
            {
                id: 'total',
                header: 'Total',
                accessorKey: 'total',
                cell: ({ row }) => (
                    <span className="font-mono text-[12px] tabular-nums">{row.original.total}</span>
                ),
            },
            {
                id: 'open',
                header: 'Abiertas',
                accessorKey: 'open',
                cell: ({ row }) => (
                    <span className="font-mono text-[12px] tabular-nums">{row.original.open}</span>
                ),
            },
            {
                id: 'completed',
                header: 'Completadas',
                accessorKey: 'completed',
                cell: ({ row }) => (
                    <span className="font-mono text-[12px] tabular-nums text-[var(--green-700)]">
                        {row.original.completed}
                    </span>
                ),
            },
            {
                id: 'overdue',
                header: 'Vencidas',
                accessorKey: 'overdue',
                cell: ({ row }) => (
                    <span
                        className={cn(
                            'font-mono text-[12px] tabular-nums',
                            row.original.overdue > 0 && 'text-[#c54a3a]',
                        )}
                    >
                        {row.original.overdue}
                    </span>
                ),
            },
            {
                id: 'percentComplete',
                header: '% Completado',
                accessorKey: 'percentComplete',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="flex-1 h-1.5 bg-[var(--neutral-200)] rounded-sm overflow-hidden">
                            <div
                                className="h-full bg-[var(--brand-700)] rounded-sm"
                                style={{ width: `${row.original.percentComplete}%` }}
                            />
                        </div>
                        <span className="font-mono text-[11px] tabular-nums text-[var(--neutral-700)] w-9 text-right">
                            {row.original.percentComplete.toFixed(0)}%
                        </span>
                    </div>
                ),
            },
            {
                id: 'avgResolutionDays',
                header: 'Ø resolución',
                accessorKey: 'avgResolutionDays',
                cell: ({ row }) => (
                    <span className="font-mono text-[12px] tabular-nums">
                        {row.original.avgResolutionDays.toFixed(1)} d
                    </span>
                ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
        onSortingChange: setSorting,
    });

    return (
        <div className="w-full px-10 py-8 space-y-5">
            <h2 className="text-[20px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)]">
                Comparativa por cliente
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard label="Clientes activos" value={summary.activeClients.toString()} />
                <SummaryCard label="Total de tareas" value={summary.totalIssues.toString()} />
                <SummaryCard label="% completado promedio" value={`${summary.avgComplete.toFixed(0)}%`} />
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
                                        Sin clientes (etiquetas) registrados.
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
            </div>
        </div>
    );
};

interface SummaryCardProps {
    label: string;
    value: string;
}

const SummaryCard = ({ label, value }: SummaryCardProps): React.ReactElement => (
    <div className="bg-white border border-[var(--neutral-400)] rounded-lg p-4">
        <Eyebrow>{label}</Eyebrow>
        <div className="mt-2 text-[28px] font-medium tracking-[-0.03em] text-[var(--neutral-1200)] leading-none">
            {value}
        </div>
    </div>
);
