import type React from 'react';
import { useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/shared/components/ui/searchable-select';
import { useProjectStates } from '@/modules/states/application/use-states';
import { useLabels } from '@/modules/labels/application/use-labels';
import { useWorkspaceMembers } from '@/modules/workspaces/application/use-workspaces';
import { PRIORITY_LABELS } from '../../domain/types';
import type { IssuePriority } from '../../domain/types';

export type DueDateFilter = 'no_date' | 'has_date' | 'overdue' | 'next_7' | 'next_30';
export type DateRangeFilter = 'today' | 'this_week' | 'this_month' | 'last_month';

const DUE_DATE_OPTIONS: { id: DueDateFilter; label: string }[] = [
    { id: 'no_date', label: 'Sin fecha' },
    { id: 'has_date', label: 'Con fecha' },
    { id: 'overdue', label: 'Vencidos' },
    { id: 'next_7', label: 'Próximos 7 días' },
    { id: 'next_30', label: 'Próximos 30 días' },
];

const DATE_RANGE_OPTIONS: { id: DateRangeFilter; label: string }[] = [
    { id: 'today', label: 'Hoy' },
    { id: 'this_week', label: 'Esta semana' },
    { id: 'this_month', label: 'Este mes' },
    { id: 'last_month', label: 'Mes pasado' },
];

export interface IssueFilter {
    priority?: string[];
    stateId?: string[];
    assigneeId?: string[];
    labelId?: string[];
    dueDate?: DueDateFilter;
    startDate?: DateRangeFilter;
    createdDate?: DateRangeFilter;
}

interface IssueFiltersProps {
    filters: IssueFilter;
    workspaceSlug: string;
    projectId: string;
    onChange: (f: IssueFilter) => void;
}

const PRIORITY_OPTIONS = ([1, 2, 3, 4, 0] as IssuePriority[]).map((p) => ({
    id: String(p),
    label: PRIORITY_LABELS[p],
}));

function hasActiveFilters(filters: IssueFilter): boolean {
    return (
        (filters.priority?.length ?? 0) > 0 ||
        (filters.stateId?.length ?? 0) > 0 ||
        (filters.assigneeId?.length ?? 0) > 0 ||
        (filters.labelId?.length ?? 0) > 0 ||
        filters.dueDate !== undefined ||
        filters.startDate !== undefined ||
        filters.createdDate !== undefined
    );
}

interface AppliedChipProps {
    label: string;
    onRemove: () => void;
}

function AppliedChip({ label, onRemove }: AppliedChipProps): React.ReactElement {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-accent-subtle border border-accent-primary/30 text-accent-primary">
            {label}
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Quitar filtro: ${label}`}
                className="hover:text-blue-200 transition-colors"
            >
                <X size={10} />
            </button>
        </span>
    );
}

function buildChips(
    filters: IssueFilter,
    states: { id: string; name: string }[],
    members: { userId: string; displayName?: string; email: string }[],
    labels: { id: string; name: string }[],
    onChange: (f: IssueFilter) => void,
): { key: string; label: string; onRemove: () => void }[] {
    const priorityChips = (filters.priority ?? []).map((val) => {
        const p = Number(val) as IssuePriority;
        return {
            key: `p-${val}`,
            label: `Prioridad: ${PRIORITY_LABELS[p]}`,
            onRemove: () =>
                onChange({ ...filters, priority: (filters.priority ?? []).filter((v) => v !== val) }),
        };
    });

    const stateChips = (filters.stateId ?? []).map((id) => {
        const state = states.find((s) => s.id === id);
        return state
            ? {
                  key: `s-${id}`,
                  label: `Estado: ${state.name}`,
                  onRemove: () =>
                      onChange({ ...filters, stateId: (filters.stateId ?? []).filter((v) => v !== id) }),
              }
            : null;
    }).filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

    const assigneeChips = (filters.assigneeId ?? []).map((id) => {
        const member = members.find((m) => m.userId === id);
        const name = member?.displayName ?? member?.email ?? id;
        return {
            key: `a-${id}`,
            label: `Asignado: ${name}`,
            onRemove: () =>
                onChange({ ...filters, assigneeId: (filters.assigneeId ?? []).filter((v) => v !== id) }),
        };
    });

    const labelChips = (filters.labelId ?? []).map((id) => {
        const label = labels.find((l) => l.id === id);
        return label
            ? {
                  key: `l-${id}`,
                  label: `Etiqueta: ${label.name}`,
                  onRemove: () =>
                      onChange({ ...filters, labelId: (filters.labelId ?? []).filter((v) => v !== id) }),
              }
            : null;
    }).filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

    const dueDateOpt = DUE_DATE_OPTIONS.find((o) => o.id === filters.dueDate);
    const dueDateChip = dueDateOpt
        ? { key: 'dueDate', label: `Fecha límite: ${dueDateOpt.label}`, onRemove: () => onChange({ ...filters, dueDate: undefined }) }
        : null;

    const startDateOpt = DATE_RANGE_OPTIONS.find((o) => o.id === filters.startDate);
    const startDateChip = startDateOpt
        ? { key: 'startDate', label: `Inicio: ${startDateOpt.label}`, onRemove: () => onChange({ ...filters, startDate: undefined }) }
        : null;

    const createdDateOpt = DATE_RANGE_OPTIONS.find((o) => o.id === filters.createdDate);
    const createdDateChip = createdDateOpt
        ? { key: 'createdDate', label: `Creado: ${createdDateOpt.label}`, onRemove: () => onChange({ ...filters, createdDate: undefined }) }
        : null;

    return [
        ...priorityChips, ...stateChips, ...assigneeChips, ...labelChips,
        ...(dueDateChip ? [dueDateChip] : []),
        ...(startDateChip ? [startDateChip] : []),
        ...(createdDateChip ? [createdDateChip] : []),
    ];
}

export const IssueFilters = ({ filters, workspaceSlug, projectId, onChange }: IssueFiltersProps): React.ReactElement => {
    const { data: states = [] } = useProjectStates(workspaceSlug, projectId);
    const { data: labels = [] } = useLabels(workspaceSlug);
    const { data: members = [] } = useWorkspaceMembers(workspaceSlug);

    const stateItems = useMemo(
        () =>
            states.map((s) => ({
                id: s.id,
                label: s.name,
                icon: (
                    <span
                        className="w-2 h-2 rounded-full shrink-0 inline-block"
                        style={{ backgroundColor: s.color }}
                        aria-hidden="true"
                    />
                ),
            })),
        [states],
    );

    const memberItems = useMemo(
        () =>
            members.map((m) => ({
                id: m.userId,
                label: m.displayName ?? m.email,
                sublabel: m.email !== (m.displayName ?? m.email) ? m.email : undefined,
            })),
        [members],
    );

    const labelItems = useMemo(
        () =>
            labels.map((l) => ({
                id: l.id,
                label: l.name,
                icon: (
                    <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 inline-block"
                        style={{ backgroundColor: l.color }}
                        aria-hidden="true"
                    />
                ),
            })),
        [labels],
    );

    const active = hasActiveFilters(filters);
    const allChips = buildChips(filters, states, members, labels, onChange);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
                {/* Priority */}
                <SearchableSelect
                    multi={true}
                    value={filters.priority ?? []}
                    onChange={(v) => onChange({ ...filters, priority: v })}
                    items={PRIORITY_OPTIONS}
                    placeholder="Prioridad"
                    width={160}
                    clearable
                    renderTrigger={(sel) => {
                        const count = Array.isArray(sel) ? sel.length : 0;
                        return (
                            <span
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                    count > 0
                                        ? 'border-accent-primary/50 bg-accent-subtle text-accent-primary'
                                        : 'border-subtle text-placeholder hover:text-secondary hover:bg-surface-2'
                                }`}
                            >
                                Prioridad
                                {count > 0 && (
                                    <span className="bg-accent-primary text-on-color rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none">
                                        {count}
                                    </span>
                                )}
                            </span>
                        );
                    }}
                />

                {/* State */}
                <SearchableSelect
                    multi={true}
                    value={filters.stateId ?? []}
                    onChange={(v) => onChange({ ...filters, stateId: v })}
                    items={stateItems}
                    placeholder="Estado"
                    width={180}
                    clearable
                    renderTrigger={(sel) => {
                        const count = Array.isArray(sel) ? sel.length : 0;
                        return (
                            <span
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                    count > 0
                                        ? 'border-accent-primary/50 bg-accent-subtle text-accent-primary'
                                        : 'border-subtle text-placeholder hover:text-secondary hover:bg-surface-2'
                                }`}
                            >
                                Estado
                                {count > 0 && (
                                    <span className="bg-accent-primary text-on-color rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none">
                                        {count}
                                    </span>
                                )}
                            </span>
                        );
                    }}
                />

                {/* Assignee */}
                <SearchableSelect
                    multi={true}
                    value={filters.assigneeId ?? []}
                    onChange={(v) => onChange({ ...filters, assigneeId: v })}
                    items={memberItems}
                    placeholder="Asignado"
                    width={200}
                    clearable
                    renderTrigger={(sel) => {
                        const count = Array.isArray(sel) ? sel.length : 0;
                        return (
                            <span
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                    count > 0
                                        ? 'border-accent-primary/50 bg-accent-subtle text-accent-primary'
                                        : 'border-subtle text-placeholder hover:text-secondary hover:bg-surface-2'
                                }`}
                            >
                                Asignado
                                {count > 0 && (
                                    <span className="bg-accent-primary text-on-color rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none">
                                        {count}
                                    </span>
                                )}
                            </span>
                        );
                    }}
                />

                {/* Labels */}
                <SearchableSelect
                    multi={true}
                    value={filters.labelId ?? []}
                    onChange={(v) => onChange({ ...filters, labelId: v })}
                    items={labelItems}
                    placeholder="Etiqueta"
                    width={180}
                    clearable
                    renderTrigger={(sel) => {
                        const count = Array.isArray(sel) ? sel.length : 0;
                        return (
                            <span
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                    count > 0
                                        ? 'border-accent-primary/50 bg-accent-subtle text-accent-primary'
                                        : 'border-subtle text-placeholder hover:text-secondary hover:bg-surface-2'
                                }`}
                            >
                                Etiqueta
                                {count > 0 && (
                                    <span className="bg-accent-primary text-on-color rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none">
                                        {count}
                                    </span>
                                )}
                            </span>
                        );
                    }}
                />

                {/* Due date */}
                <SearchableSelect
                    multi={false}
                    value={filters.dueDate ?? null}
                    onChange={(v) => onChange({ ...filters, dueDate: v as DueDateFilter | undefined ?? undefined })}
                    items={DUE_DATE_OPTIONS}
                    placeholder="Fecha límite"
                    width={180}
                    clearable
                    renderTrigger={(_sel) => {
                        const active = !!filters.dueDate;
                        return (
                            <span
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                    active
                                        ? 'border-accent-primary/50 bg-accent-subtle text-accent-primary'
                                        : 'border-subtle text-placeholder hover:text-secondary hover:bg-surface-2'
                                }`}
                            >
                                Fecha límite
                                {active && (
                                    <span className="bg-accent-primary text-on-color rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none">
                                        1
                                    </span>
                                )}
                            </span>
                        );
                    }}
                />

                {/* Start date */}
                <SearchableSelect
                    multi={false}
                    value={filters.startDate ?? null}
                    onChange={(v) => onChange({ ...filters, startDate: v as DateRangeFilter | undefined ?? undefined })}
                    items={DATE_RANGE_OPTIONS}
                    placeholder="Fecha inicio"
                    width={180}
                    clearable
                    renderTrigger={(_sel) => {
                        const active = !!filters.startDate;
                        return (
                            <span
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                    active
                                        ? 'border-accent-primary/50 bg-accent-subtle text-accent-primary'
                                        : 'border-subtle text-placeholder hover:text-secondary hover:bg-surface-2'
                                }`}
                            >
                                Fecha inicio
                                {active && (
                                    <span className="bg-accent-primary text-on-color rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none">
                                        1
                                    </span>
                                )}
                            </span>
                        );
                    }}
                />

                {/* Created date */}
                <SearchableSelect
                    multi={false}
                    value={filters.createdDate ?? null}
                    onChange={(v) => onChange({ ...filters, createdDate: v as DateRangeFilter | undefined ?? undefined })}
                    items={DATE_RANGE_OPTIONS}
                    placeholder="Fecha creación"
                    width={180}
                    clearable
                    renderTrigger={(_sel) => {
                        const active = !!filters.createdDate;
                        return (
                            <span
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                    active
                                        ? 'border-accent-primary/50 bg-accent-subtle text-accent-primary'
                                        : 'border-subtle text-placeholder hover:text-secondary hover:bg-surface-2'
                                }`}
                            >
                                Fecha creación
                                {active && (
                                    <span className="bg-accent-primary text-on-color rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none">
                                        1
                                    </span>
                                )}
                            </span>
                        );
                    }}
                />

                {/* Clear all */}
                {active && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange({})}
                        className="h-7 px-2 text-xs text-placeholder hover:text-secondary gap-1"
                    >
                        <X size={12} />
                        Limpiar todo
                    </Button>
                )}
            </div>

            {/* Applied chips */}
            {allChips.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    {allChips.map((chip) => (
                        <AppliedChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
                    ))}
                </div>
            )}
        </div>
    );
};
