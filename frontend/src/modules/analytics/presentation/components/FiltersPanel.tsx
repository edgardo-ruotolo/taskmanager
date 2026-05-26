import type React from 'react';
import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label as UiLabel } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { SearchableSelect } from '@/shared/components/ui/searchable-select';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
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

    const userItems = useMemo(
        () => userOptions.map((o) => ({ id: o.value, label: o.label })),
        [userOptions],
    );

    const labelSelectItems = useMemo(
        () =>
            labelOptions.map((o) => ({
                id: o.value,
                label: o.label,
                icon: o.color ? (
                    <span
                        className="h-2.5 w-2.5 rounded-sm shrink-0 inline-block"
                        style={{ background: o.color }}
                        aria-hidden="true"
                    />
                ) : undefined,
            })),
        [labelOptions],
    );

    const projectItems = useMemo(
        () => projectOptions.map((o) => ({ id: o.value, label: o.label })),
        [projectOptions],
    );

    const stateSelectItems = useMemo(
        () =>
            stateOptions.map((o) => ({
                id: o.value,
                label: o.label,
                icon: o.color ? (
                    <span
                        className="h-2.5 w-2.5 rounded-full shrink-0 inline-block"
                        style={{ background: o.color }}
                        aria-hidden="true"
                    />
                ) : undefined,
            })),
        [stateOptions],
    );

    return (
        <div className="mt-6 space-y-5">
            <Section title="Asignados">
                <SearchableSelect
                    multi={true}
                    value={filters.userIds}
                    onChange={(v) => filters.setFilters({ userIds: v })}
                    items={userItems}
                    placeholder="Seleccionar usuarios…"
                    width="100%"
                    clearable
                />
            </Section>

            <Section title="Clientes (etiquetas)">
                <SearchableSelect
                    multi={true}
                    value={filters.labelIds}
                    onChange={(v) => filters.setFilters({ labelIds: v })}
                    items={labelSelectItems}
                    placeholder="Seleccionar clientes…"
                    width="100%"
                    clearable
                />
            </Section>

            <Section title="Proyectos">
                <SearchableSelect
                    multi={true}
                    value={filters.projectIds}
                    onChange={(v) => filters.setFilters({ projectIds: v })}
                    items={projectItems}
                    placeholder="Seleccionar proyectos…"
                    width="100%"
                    clearable
                />
            </Section>

            <Section title="Estados">
                <SearchableSelect
                    multi={true}
                    value={filters.stateIds}
                    onChange={(v) => filters.setFilters({ stateIds: v })}
                    items={stateSelectItems}
                    placeholder="Seleccionar estados…"
                    width="100%"
                    clearable
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
                    <SearchableSelect
                        multi={false}
                        value={filters.dateField}
                        onChange={(v) => {
                            if (v) filters.setFilters({ dateField: v as AnalyticsDateField });
                        }}
                        items={DATE_FIELDS.map((f) => ({ id: f.value, label: f.label }))}
                        placeholder="Campo de fecha"
                        width="100%"
                        clearable={false}
                    />
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
