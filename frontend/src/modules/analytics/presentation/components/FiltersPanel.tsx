import type React from 'react';
import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Check, ChevronsUpDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label as UiLabel } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useLabels } from '@/modules/labels/application/use-labels';
import { useProjects } from '@/modules/projects/application/use-projects';
import { useStates } from '@/modules/states/application/use-states';
import { useWorkspaceMembers } from '@/modules/workspaces/application/use-workspaces';
import {
    type AnalyticsDateField,
    type AnalyticsPriority,
    type AnalyticsStateCategory,
    useAnalyticsFiltersStore,
} from '../../application/filters-store';

interface FiltersPanelProps {
    workspaceSlug: string;
    onClose: () => void;
}

const PRIORITIES: { value: AnalyticsPriority; label: string }[] = [
    { value: 'Urgent', label: 'Urgente' },
    { value: 'High', label: 'Alta' },
    { value: 'Medium', label: 'Media' },
    { value: 'Low', label: 'Baja' },
    { value: 'None', label: 'Sin prioridad' },
];

const STATE_CATEGORIES: { value: AnalyticsStateCategory; label: string }[] = [
    { value: 'Backlog', label: 'Backlog' },
    { value: 'Unstarted', label: 'Sin iniciar' },
    { value: 'Started', label: 'En curso' },
    { value: 'Completed', label: 'Completado' },
    { value: 'Cancelled', label: 'Cancelado' },
];

const DATE_FIELDS: { value: AnalyticsDateField; label: string }[] = [
    { value: 'createdAt', label: 'Fecha de creación' },
    { value: 'dueDate', label: 'Fecha de vencimiento' },
    { value: 'completedAt', label: 'Fecha de finalización' },
];

export const FiltersPanel = ({ workspaceSlug, onClose }: FiltersPanelProps): React.ReactElement => {
    const filters = useAnalyticsFiltersStore(workspaceSlug);
    const { data: members } = useWorkspaceMembers(workspaceSlug);
    const { data: labels } = useLabels(workspaceSlug);
    const { data: projects } = useProjects(workspaceSlug);
    const { data: states } = useStates();

    const userOptions = useMemo(
        () =>
            (members ?? []).map((m) => ({
                value: m.userId,
                label: m.displayName ?? m.email,
            })),
        [members],
    );

    const labelOptions = useMemo(
        () => (labels ?? []).map((l) => ({ value: l.id, label: l.name, color: l.color })),
        [labels],
    );

    const projectOptions = useMemo(
        () =>
            (projects?.items ?? []).map((p) => ({
                value: p.id,
                label: `${p.identifier} · ${p.name}`,
            })),
        [projects],
    );

    const stateOptions = useMemo(
        () => (states ?? []).map((s) => ({ value: s.id, label: s.name, color: s.color })),
        [states],
    );

    return (
        <div className="mt-6 space-y-5">
            <Section title="Asignados">
                <MultiSelect
                    placeholder="Seleccionar usuarios…"
                    options={userOptions}
                    value={filters.userIds}
                    onChange={(v) => filters.setFilters({ userIds: v })}
                />
            </Section>

            <Section title="Clientes (etiquetas)">
                <MultiSelect
                    placeholder="Seleccionar clientes…"
                    options={labelOptions}
                    value={filters.labelIds}
                    onChange={(v) => filters.setFilters({ labelIds: v })}
                />
            </Section>

            <Section title="Proyectos">
                <MultiSelect
                    placeholder="Seleccionar proyectos…"
                    options={projectOptions}
                    value={filters.projectIds}
                    onChange={(v) => filters.setFilters({ projectIds: v })}
                />
            </Section>

            <Section title="Estados">
                <MultiSelect
                    placeholder="Seleccionar estados…"
                    options={stateOptions}
                    value={filters.stateIds}
                    onChange={(v) => filters.setFilters({ stateIds: v })}
                />
            </Section>

            <Section title="Categorías de estado">
                <CategoryToggles
                    options={STATE_CATEGORIES}
                    value={filters.stateCategories}
                    onChange={(v) => filters.setFilters({ stateCategories: v })}
                />
            </Section>

            <Section title="Prioridades">
                <CategoryToggles
                    options={PRIORITIES}
                    value={filters.priorities}
                    onChange={(v) => filters.setFilters({ priorities: v })}
                />
            </Section>

            <Separator />

            <Section title="Rango de fechas">
                <div className="space-y-3">
                    <Select
                        value={filters.dateField}
                        onValueChange={(v) =>
                            filters.setFilters({ dateField: v as AnalyticsDateField })
                        }
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {DATE_FIELDS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                        <DateField
                            label="Desde"
                            value={filters.dateFrom}
                            onChange={(v) => filters.setFilters({ dateFrom: v })}
                        />
                        <DateField
                            label="Hasta"
                            value={filters.dateTo}
                            onChange={(v) => filters.setFilters({ dateTo: v })}
                        />
                    </div>
                </div>
            </Section>

            <Section title="Opciones">
                <div className="flex items-center justify-between rounded-md border border-[var(--neutral-300)] px-3 py-2">
                    <UiLabel htmlFor="include-archived" className="cursor-pointer text-sm">
                        Incluir archivadas
                    </UiLabel>
                    <Switch
                        id="include-archived"
                        checked={filters.includeArchived}
                        onCheckedChange={(c) => filters.setFilters({ includeArchived: c })}
                    />
                </div>
            </Section>

            <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={filters.resetFilters}>
                    Limpiar todo
                </Button>
                <Button className="flex-1" onClick={onClose}>
                    Aplicar
                </Button>
            </div>
        </div>
    );
};

// ── Subcomponents ────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement => (
    <div>
        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--neutral-600)]">
            {title}
        </div>
        {children}
    </div>
);

interface MultiSelectOption {
    value: string;
    label: string;
    color?: string;
}

interface MultiSelectProps {
    placeholder: string;
    options: MultiSelectOption[];
    value: string[];
    onChange: (next: string[]) => void;
}

const MultiSelect = ({ placeholder, options, value, onChange }: MultiSelectProps): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const selectedLabels = useMemo(
        () => options.filter((o) => value.includes(o.value)),
        [options, value],
    );

    const toggle = (val: string): void => {
        if (value.includes(val)) {
            onChange(value.filter((v) => v !== val));
        } else {
            onChange([...value, val]);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-between font-normal h-9 px-3"
                    type="button"
                >
                    {value.length === 0 ? (
                        <span className="text-[var(--neutral-600)] text-sm">{placeholder}</span>
                    ) : (
                        <span className="text-sm truncate">{value.length} seleccionado(s)</span>
                    )}
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="max-h-64 overflow-y-auto py-1">
                    {options.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-[var(--neutral-600)]">
                            Sin opciones
                        </div>
                    ) : (
                        options.map((o) => {
                            const checked = value.includes(o.value);
                            return (
                                <button
                                    key={o.value}
                                    type="button"
                                    onClick={() => toggle(o.value)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--neutral-100)] text-sm text-left"
                                >
                                    <div
                                        className={cn(
                                            'h-4 w-4 rounded-sm border flex items-center justify-center',
                                            checked
                                                ? 'bg-[var(--brand-700)] border-[var(--brand-700)] text-white'
                                                : 'border-[var(--neutral-400)] bg-white',
                                        )}
                                    >
                                        {checked && <Check className="h-3 w-3" />}
                                    </div>
                                    {o.color && (
                                        <span
                                            className="h-2.5 w-2.5 rounded-sm shrink-0"
                                            style={{ background: o.color }}
                                            aria-hidden="true"
                                        />
                                    )}
                                    <span className="truncate flex-1">{o.label}</span>
                                </button>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
            {selectedLabels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {selectedLabels.map((o) => (
                        <Badge
                            key={o.value}
                            variant="secondary"
                            className="gap-1 pl-1.5 pr-1 py-0 h-5"
                        >
                            {o.color && (
                                <span
                                    className="h-2 w-2 rounded-sm"
                                    style={{ background: o.color }}
                                    aria-hidden="true"
                                />
                            )}
                            <span className="text-[11px]">{o.label}</span>
                            <button
                                type="button"
                                aria-label={`Remover ${o.label}`}
                                onClick={() => toggle(o.value)}
                                className="ml-0.5 hover:bg-[var(--neutral-200)] rounded-sm p-0.5"
                            >
                                <X className="h-2.5 w-2.5" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </Popover>
    );
};

interface CategoryTogglesProps<T extends string> {
    options: { value: T; label: string }[];
    value: T[];
    onChange: (next: T[]) => void;
}

const CategoryToggles = <T extends string>({
    options,
    value,
    onChange,
}: CategoryTogglesProps<T>): React.ReactElement => {
    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map((o) => {
                const active = value.includes(o.value);
                return (
                    <button
                        key={o.value}
                        type="button"
                        onClick={() =>
                            onChange(active ? value.filter((v) => v !== o.value) : [...value, o.value])
                        }
                        className={cn(
                            'px-2.5 py-1 rounded-md text-[12px] border transition-colors',
                            active
                                ? 'bg-[var(--brand-700)] text-white border-[var(--brand-700)]'
                                : 'bg-white text-[var(--neutral-700)] border-[var(--neutral-300)] hover:border-[var(--neutral-500)]',
                        )}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
};

interface DateFieldProps {
    label: string;
    value: string | null;
    onChange: (next: string | null) => void;
}

const DateField = ({ label, value, onChange }: DateFieldProps): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const parsed = value ? new Date(value) : undefined;
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="h-9 justify-start font-normal text-left gap-2 px-3"
                    type="button"
                >
                    <CalendarIcon className="h-3.5 w-3.5 opacity-60" />
                    {parsed ? (
                        <span className="text-sm">{parsed.toLocaleDateString('es')}</span>
                    ) : (
                        <span className="text-sm text-[var(--neutral-600)]">{label}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={parsed}
                    onSelect={(d) => {
                        onChange(d ? d.toISOString().slice(0, 10) : null);
                        setOpen(false);
                    }}
                    autoFocus
                />
                {parsed && (
                    <div className="border-t p-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                                onChange(null);
                                setOpen(false);
                            }}
                        >
                            Limpiar
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};
