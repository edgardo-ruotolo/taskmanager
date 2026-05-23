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
import { cn } from '@/lib/utils';
import { useAnalyticsFiltersStore } from '../../application/filters-store';
import { useUsersRanking } from '../../application/use-analytics';
import type { UserRankingDto } from '../../domain/types';

export const UsersRankingPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const filters = useAnalyticsFiltersStore(workspaceSlug);
    const { data, isLoading } = useUsersRanking(workspaceSlug, filters);
    const [sorting, setSorting] = useState<SortingState>([{ id: 'completed', desc: true }]);

    const rows = data ?? [];

    const columns = useMemo<ColumnDef<UserRankingDto>[]>(
        () => [
            {
                id: 'user',
                header: 'Usuario',
                accessorFn: (r) => r.fullName,
                cell: ({ row }) => (
                    <div className="flex items-center gap-2.5">
                        <Avatar name={row.original.fullName} url={row.original.avatarUrl} />
                        <div>
                            <div className="text-[13px] text-[var(--neutral-1200)] font-medium">
                                {row.original.fullName}
                            </div>
                            {row.original.email && (
                                <div className="text-[11px] text-[var(--neutral-500)]">
                                    {row.original.email}
                                </div>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                id: 'assigned',
                header: 'Asignadas',
                accessorKey: 'assigned',
                cell: ({ row }) => <NumberCell value={row.original.assigned} />,
            },
            {
                id: 'inProgress',
                header: 'En curso',
                accessorKey: 'inProgress',
                cell: ({ row }) => <NumberCell value={row.original.inProgress} />,
            },
            {
                id: 'completed',
                header: 'Completadas',
                accessorKey: 'completed',
                cell: ({ row }) => (
                    <NumberCell value={row.original.completed} className="text-[var(--green-700)]" />
                ),
            },
            {
                id: 'overdue',
                header: 'Vencidas',
                accessorKey: 'overdue',
                cell: ({ row }) => (
                    <NumberCell
                        value={row.original.overdue}
                        className={cn(row.original.overdue > 0 && 'text-[#c54a3a]')}
                    />
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
            {
                id: 'throughputPerWeek',
                header: 'Throughput / sem',
                accessorKey: 'throughputPerWeek',
                cell: ({ row }) => (
                    <span className="font-mono text-[12px] tabular-nums">
                        {row.original.throughputPerWeek.toFixed(1)}
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
        <div className="mx-auto max-w-[1200px] px-10 py-8 space-y-5">
            <h2 className="text-[20px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)]">
                Ranking de usuarios
            </h2>

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
                                        Sin datos de usuarios.
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

interface NumberCellProps {
    value: number;
    className?: string;
}

const NumberCell = ({ value, className }: NumberCellProps): React.ReactElement => (
    <span className={cn('font-mono text-[12px] tabular-nums', className)}>{value}</span>
);

interface AvatarProps {
    name: string;
    url: string | null;
}

const Avatar = ({ name, url }: AvatarProps): React.ReactElement => {
    if (url) {
        return (
            <img
                src={url}
                alt={name}
                className="h-7 w-7 rounded-full object-cover bg-[var(--neutral-200)]"
            />
        );
    }
    const initials = name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    return (
        <div className="h-7 w-7 rounded-full bg-[var(--neutral-300)] flex items-center justify-center text-[10px] font-medium text-[var(--neutral-700)]">
            {initials || '?'}
        </div>
    );
};
