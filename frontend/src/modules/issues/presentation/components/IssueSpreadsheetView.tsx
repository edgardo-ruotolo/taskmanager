import type React from 'react';
import { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    type SortingState,
    type RowSelectionState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { IssuePriorityBadge } from './IssuePriorityBadge';
import { cn } from '@/lib/utils';
import type { Issue } from '../../domain/types';
import type { State } from '@/modules/states/domain/types';

interface IssueSpreadsheetViewProps {
    issues: Issue[];
    states: State[];
    onRowClick: (issueId: string) => void;
}

const columnHelper = createColumnHelper<Issue>();

export const IssueSpreadsheetView = ({
    issues,
    states,
    onRowClick,
}: IssueSpreadsheetViewProps): React.ReactElement => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const stateMap = new Map(states.map((s) => [s.id, s]));

    const columns = [
        columnHelper.display({
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                    aria-label="Seleccionar todo"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(v) => row.toggleSelected(!!v)}
                    aria-label="Seleccionar fila"
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            size: 44,
            enableSorting: false,
        }),
        columnHelper.accessor('stateId', {
            header: 'Estado',
            cell: ({ row }) => {
                const state = stateMap.get(row.original.stateId);
                return (
                    <div className="flex items-center gap-2 min-w-0">
                        <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: state?.color ?? '#64748b' }}
                            aria-hidden="true"
                        />
                        <span className="truncate text-secondary">{row.original.stateName}</span>
                    </div>
                );
            },
            size: 130,
        }),
        columnHelper.accessor('sequenceId', {
            header: 'ID',
            cell: ({ getValue }) => (
                <span className="font-mono text-xs text-placeholder">
                    ISS-{getValue()}
                </span>
            ),
            size: 80,
        }),
        columnHelper.accessor('title', {
            header: 'Título',
            cell: ({ getValue }) => (
                <span className="truncate block text-primary">{getValue()}</span>
            ),
            minSize: 200,
        }),
        columnHelper.accessor('priority', {
            header: 'Prioridad',
            cell: ({ getValue }) => <IssuePriorityBadge priority={getValue()} />,
            size: 110,
        }),
        columnHelper.accessor('dueDate', {
            header: 'Vencimiento',
            cell: ({ getValue }) => {
                const v = getValue();
                if (!v) return <span className="text-placeholder">—</span>;
                return (
                    <span className="tabular-nums text-tertiary">
                        {new Date(v).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        })}
                    </span>
                );
            },
            size: 120,
        }),
        columnHelper.accessor('createdAt', {
            header: 'Creado',
            cell: ({ getValue }) => (
                <span className="tabular-nums text-placeholder">
                    {new Date(getValue()).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    })}
                </span>
            ),
            size: 120,
        }),
    ];

    const table = useReactTable({
        data: issues,
        columns,
        state: { sorting, rowSelection },
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="border border-subtle rounded-lg overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr
                                key={headerGroup.id}
                                className="bg-surface-1 border-b border-subtle"
                            >
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        style={{ width: header.getSize() }}
                                        className={cn(
                                            'px-3 py-2 text-left text-xs font-medium text-placeholder whitespace-nowrap select-none',
                                            header.column.getCanSort() &&
                                                'cursor-pointer hover:text-secondary transition-colors',
                                        )}
                                        onClick={
                                            header.column.getCanSort()
                                                ? header.column.getToggleSortingHandler()
                                                : undefined
                                        }
                                    >
                                        <div className="flex items-center gap-1">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
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
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                onClick={() => onRowClick(row.original.id)}
                                className="h-10 border-b border-subtle last:border-b-0 hover:bg-surface-2 cursor-pointer transition-colors"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        style={{ width: cell.column.getSize() }}
                                        className="px-3 py-2 overflow-hidden"
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
