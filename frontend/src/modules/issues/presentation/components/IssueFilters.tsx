import type React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCompanyStates } from '@/modules/states/application/use-states';
import { useLabels } from '@/modules/labels/application/use-labels';
import { useWorkspaceMembers } from '@/modules/workspaces/application/use-workspaces';
import { cn } from '@/lib/utils';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../../domain/types';
import type { IssuePriority } from '../../domain/types';

export type DueDateFilter = 'no_date' | 'has_date' | 'overdue' | 'next_7' | 'next_30';
export type DateRangeFilter = 'today' | 'this_week' | 'this_month' | 'last_month';

const DUE_DATE_OPTIONS: { value: DueDateFilter; label: string }[] = [
    { value: 'no_date', label: 'Sin fecha' },
    { value: 'has_date', label: 'Con fecha' },
    { value: 'overdue', label: 'Vencidos' },
    { value: 'next_7', label: 'Próximos 7 días' },
    { value: 'next_30', label: 'Próximos 30 días' },
];

const DATE_RANGE_OPTIONS: { value: DateRangeFilter; label: string }[] = [
    { value: 'today', label: 'Hoy' },
    { value: 'this_week', label: 'Esta semana' },
    { value: 'this_month', label: 'Este mes' },
    { value: 'last_month', label: 'Mes pasado' },
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
    companyId: string;
    onChange: (f: IssueFilter) => void;
}

const PRIORITY_OPTIONS = ([1, 2, 3, 4, 0] as IssuePriority[]).map((p) => ({
    value: String(p),
    label: PRIORITY_LABELS[p],
    color: PRIORITY_COLORS[p],
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

function toggleArrayValue(arr: string[] | undefined, value: string): string[] {
    const current = arr ?? [];
    return current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
}

function getInitials(name: string): string {
    return name.split(' ').map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase();
}

interface FilterDropdownProps {
    label: string;
    count: number;
    children: React.ReactNode;
}

function FilterDropdown({ label, count, children }: FilterDropdownProps): React.ReactElement {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors',
                        count > 0
                            ? 'border-accent-primary/50 bg-accent-subtle text-accent-primary'
                            : 'border-subtle text-placeholder hover:text-secondary hover:bg-surface-2',
                    )}
                >
                    {label}
                    {count > 0 && (
                        <span className="bg-accent-primary text-on-color rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none">
                            {count}
                        </span>
                    )}
                    <ChevronDown size={12} />
                </button>
            </DropdownMenuTrigger>
            {children}
        </DropdownMenu>
    );
}

interface RadioFilterDropdownProps {
    label: string;
    active: boolean;
    children: React.ReactNode;
}

function RadioFilterDropdown({ label, active, children }: RadioFilterDropdownProps): React.ReactElement {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors',
                        active
                            ? 'border-accent-primary/50 bg-accent-subtle text-accent-primary'
                            : 'border-subtle text-placeholder hover:text-secondary hover:bg-surface-2',
                    )}
                >
                    {label}
                    {active && (
                        <span className="bg-accent-primary text-on-color rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none">
                            1
                        </span>
                    )}
                    <ChevronDown size={12} />
                </button>
            </DropdownMenuTrigger>
            {children}
        </DropdownMenu>
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

function useFilterHandlers(filters: IssueFilter, onChange: (f: IssueFilter) => void) {
    const toggle = <K extends 'priority' | 'stateId' | 'assigneeId' | 'labelId'>(key: K, value: string): void => {
        onChange({ ...filters, [key]: toggleArrayValue(filters[key], value) });
    };
    const setRadio = <K extends 'dueDate' | 'startDate' | 'createdDate'>(key: K, value: string): void => {
        const next = value === filters[key] ? undefined : (value as IssueFilter[K]);
        onChange({ ...filters, [key]: next });
    };
    const removeFromArray = <K extends 'priority' | 'stateId' | 'assigneeId' | 'labelId'>(key: K, value: string): void => {
        onChange({ ...filters, [key]: (filters[key] ?? []).filter((v) => v !== value) });
    };
    const handleClear = (): void => { onChange({}); };
    return { toggle, setRadio, removeFromArray, handleClear };
}

function buildChips(
    filters: IssueFilter,
    states: { id: string; name: string }[],
    members: { userId: string; displayName?: string; email: string }[],
    labels: { id: string; name: string }[],
    setRadio: <K extends 'dueDate' | 'startDate' | 'createdDate'>(key: K, value: string) => void,
    removeFromArray: <K extends 'priority' | 'stateId' | 'assigneeId' | 'labelId'>(key: K, value: string) => void,
): { key: string; label: string; onRemove: () => void }[] {
    const priorityChips = (filters.priority ?? []).map((val) => {
        const opt = PRIORITY_OPTIONS.find((o) => o.value === val);
        return opt ? { key: `p-${val}`, label: `Prioridad: ${opt.label}`, onRemove: () => removeFromArray('priority', val) } : null;
    }).filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

    const stateChips = (filters.stateId ?? []).map((id) => {
        const state = states.find((s) => s.id === id);
        return state ? { key: `s-${id}`, label: `Estado: ${state.name}`, onRemove: () => removeFromArray('stateId', id) } : null;
    }).filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

    const assigneeChips = (filters.assigneeId ?? []).map((id) => {
        const member = members.find((m) => m.userId === id);
        const name = member?.displayName ?? member?.email ?? id;
        return { key: `a-${id}`, label: `Asignado: ${name}`, onRemove: () => removeFromArray('assigneeId', id) };
    });

    const labelChips = (filters.labelId ?? []).map((id) => {
        const label = labels.find((l) => l.id === id);
        return label ? { key: `l-${id}`, label: `Etiqueta: ${label.name}`, onRemove: () => removeFromArray('labelId', id) } : null;
    }).filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

    const dueDateVal = filters.dueDate;
    const dueDateChip = dueDateVal
        ? (() => { const opt = DUE_DATE_OPTIONS.find((o) => o.value === dueDateVal); return opt ? { key: 'dueDate', label: `Fecha límite: ${opt.label}`, onRemove: () => setRadio('dueDate', dueDateVal) } : null; })()
        : null;

    const startDateVal = filters.startDate;
    const startDateChip = startDateVal
        ? (() => { const opt = DATE_RANGE_OPTIONS.find((o) => o.value === startDateVal); return opt ? { key: 'startDate', label: `Inicio: ${opt.label}`, onRemove: () => setRadio('startDate', startDateVal) } : null; })()
        : null;

    const createdDateVal = filters.createdDate;
    const createdDateChip = createdDateVal
        ? (() => { const opt = DATE_RANGE_OPTIONS.find((o) => o.value === createdDateVal); return opt ? { key: 'createdDate', label: `Creado: ${opt.label}`, onRemove: () => setRadio('createdDate', createdDateVal) } : null; })()
        : null;

    return [
        ...priorityChips, ...stateChips, ...assigneeChips, ...labelChips,
        ...(dueDateChip ? [dueDateChip] : []),
        ...(startDateChip ? [startDateChip] : []),
        ...(createdDateChip ? [createdDateChip] : []),
    ];
}

export const IssueFilters = ({ filters, workspaceSlug, companyId, onChange }: IssueFiltersProps): React.ReactElement => {
    const { data: states = [] } = useCompanyStates(workspaceSlug, companyId);
    const { data: labels = [] } = useLabels(workspaceSlug);
    const { data: members = [] } = useWorkspaceMembers(workspaceSlug);

    const priorityCount = filters.priority?.length ?? 0;
    const stateCount = filters.stateId?.length ?? 0;
    const assigneeCount = filters.assigneeId?.length ?? 0;
    const labelCount = filters.labelId?.length ?? 0;

    const { toggle, setRadio, removeFromArray, handleClear } = useFilterHandlers(filters, onChange);
    const active = hasActiveFilters(filters);

    const allChips = buildChips(filters, states, members, labels, setRadio, removeFromArray);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
                {/* Priority */}
                <FilterDropdown label="Prioridad" count={priorityCount}>
                    <DropdownMenuContent className="w-44 bg-surface-2 border-subtle">
                        <DropdownMenuLabel className="text-xs text-placeholder px-2 py-1.5">Prioridad</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {PRIORITY_OPTIONS.map((opt) => (
                            <DropdownMenuCheckboxItem
                                key={opt.value}
                                checked={filters.priority?.includes(opt.value) ?? false}
                                onCheckedChange={() => toggle('priority', opt.value)}
                                className="text-sm text-secondary focus:bg-layer-2"
                            >
                                <span className={cn('font-medium', opt.color)}>{opt.label}</span>
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </FilterDropdown>

                {/* State */}
                <FilterDropdown label="Estado" count={stateCount}>
                    <DropdownMenuContent className="w-48 bg-surface-2 border-subtle">
                        <DropdownMenuLabel className="text-xs text-placeholder px-2 py-1.5">Estado</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {states.map((state) => (
                            <DropdownMenuCheckboxItem
                                key={state.id}
                                checked={filters.stateId?.includes(state.id) ?? false}
                                onCheckedChange={() => toggle('stateId', state.id)}
                                className="text-sm text-secondary focus:bg-layer-2"
                            >
                                <span className="flex items-center gap-2">
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: state.color }}
                                        aria-hidden="true"
                                    />
                                    {state.name}
                                </span>
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </FilterDropdown>

                {/* Assignee */}
                <FilterDropdown label="Asignado" count={assigneeCount}>
                    <DropdownMenuContent className="w-52 bg-surface-2 border-subtle">
                        <DropdownMenuLabel className="text-xs text-placeholder px-2 py-1.5">Asignado</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {members.length === 0 && (
                            <p className="text-xs text-placeholder px-2 py-2">Sin miembros</p>
                        )}
                        {members.map((member) => (
                            <DropdownMenuCheckboxItem
                                key={member.userId}
                                checked={filters.assigneeId?.includes(member.userId) ?? false}
                                onCheckedChange={() => toggle('assigneeId', member.userId)}
                                className="text-sm text-secondary focus:bg-layer-2"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-layer-2 flex items-center justify-center text-[9px] font-semibold text-secondary shrink-0">
                                        {getInitials(member.displayName ?? member.email)}
                                    </span>
                                    <span className="truncate max-w-32">
                                        {member.displayName ?? member.email}
                                    </span>
                                </span>
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </FilterDropdown>

                {/* Labels */}
                <FilterDropdown label="Etiqueta" count={labelCount}>
                    <DropdownMenuContent className="w-48 bg-surface-2 border-subtle">
                        <DropdownMenuLabel className="text-xs text-placeholder px-2 py-1.5">Etiqueta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {labels.length === 0 && (
                            <p className="text-xs text-placeholder px-2 py-2">Sin etiquetas</p>
                        )}
                        {labels.map((label) => (
                            <DropdownMenuCheckboxItem
                                key={label.id}
                                checked={filters.labelId?.includes(label.id) ?? false}
                                onCheckedChange={() => toggle('labelId', label.id)}
                                className="text-sm text-secondary focus:bg-layer-2"
                            >
                                <span className="flex items-center gap-2">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: label.color }}
                                        aria-hidden="true"
                                    />
                                    {label.name}
                                </span>
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </FilterDropdown>

                {/* Due date */}
                <RadioFilterDropdown label="Fecha límite" active={!!filters.dueDate}>
                    <DropdownMenuContent className="w-48 bg-surface-2 border-subtle">
                        <DropdownMenuLabel className="text-xs text-placeholder px-2 py-1.5">Fecha límite</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                            value={filters.dueDate ?? ''}
                            onValueChange={(v) => setRadio('dueDate', v)}
                        >
                            {DUE_DATE_OPTIONS.map((opt) => (
                                <DropdownMenuRadioItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-sm text-secondary focus:bg-layer-2"
                                >
                                    {opt.label}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </RadioFilterDropdown>

                {/* Start date */}
                <RadioFilterDropdown label="Fecha inicio" active={!!filters.startDate}>
                    <DropdownMenuContent className="w-48 bg-surface-2 border-subtle">
                        <DropdownMenuLabel className="text-xs text-placeholder px-2 py-1.5">Fecha de inicio</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                            value={filters.startDate ?? ''}
                            onValueChange={(v) => setRadio('startDate', v)}
                        >
                            {DATE_RANGE_OPTIONS.map((opt) => (
                                <DropdownMenuRadioItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-sm text-secondary focus:bg-layer-2"
                                >
                                    {opt.label}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </RadioFilterDropdown>

                {/* Created date */}
                <RadioFilterDropdown label="Fecha creación" active={!!filters.createdDate}>
                    <DropdownMenuContent className="w-48 bg-surface-2 border-subtle">
                        <DropdownMenuLabel className="text-xs text-placeholder px-2 py-1.5">Fecha de creación</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                            value={filters.createdDate ?? ''}
                            onValueChange={(v) => setRadio('createdDate', v)}
                        >
                            {DATE_RANGE_OPTIONS.map((opt) => (
                                <DropdownMenuRadioItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-sm text-secondary focus:bg-layer-2"
                                >
                                    {opt.label}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </RadioFilterDropdown>

                {/* Clear all */}
                {active && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
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
