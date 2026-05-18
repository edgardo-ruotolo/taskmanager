import type React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type GroupByOption = 'none' | 'state' | 'priority' | 'assignee';
export type OrderByOption = 'created_desc' | 'created_asc' | 'updated_desc' | 'priority_asc' | 'due_date_asc';

export interface DisplayOptions {
    groupBy: GroupByOption;
    orderBy: OrderByOption;
    showEmptyGroups: boolean;
    showSubIssues: boolean;
}

export const DEFAULT_DISPLAY_OPTIONS: DisplayOptions = {
    groupBy: 'state',
    orderBy: 'created_desc',
    showEmptyGroups: true,
    showSubIssues: false,
};

const GROUP_BY_OPTIONS: { value: GroupByOption; label: string }[] = [
    { value: 'none', label: 'Ninguno' },
    { value: 'state', label: 'Estado' },
    { value: 'priority', label: 'Prioridad' },
    { value: 'assignee', label: 'Asignado' },
];

const ORDER_BY_OPTIONS: { value: OrderByOption; label: string }[] = [
    { value: 'created_desc', label: 'Más recientes primero' },
    { value: 'created_asc', label: 'Más antiguos primero' },
    { value: 'updated_desc', label: 'Última actualización' },
    { value: 'priority_asc', label: 'Prioridad (alta → baja)' },
    { value: 'due_date_asc', label: 'Fecha límite (próximos)' },
];

interface OptionChipProps {
    label: string;
    selected: boolean;
    onClick: () => void;
}

function OptionChip({ label, selected, onClick }: OptionChipProps): React.ReactElement {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
                selected
                    ? 'bg-accent-subtle border-accent-primary/50 text-accent-primary'
                    : 'bg-surface-1 border-subtle text-secondary hover:bg-surface-2',
            )}
        >
            {label}
        </button>
    );
}

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

function Section({ title, children }: SectionProps): React.ReactElement {
    return (
        <div className="space-y-2.5">
            <p className="text-xs font-semibold text-placeholder uppercase tracking-wide">{title}</p>
            {children}
        </div>
    );
}

interface DisplayOptionsPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    options: DisplayOptions;
    onChange: (options: DisplayOptions) => void;
}

export const DisplayOptionsPanel = ({
    open,
    onOpenChange,
    options,
    onChange,
}: DisplayOptionsPanelProps): React.ReactElement => {
    const set = <K extends keyof DisplayOptions>(key: K, value: DisplayOptions[K]): void => {
        onChange({ ...options, [key]: value });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-72 bg-surface-1 border-subtle p-0">
                <SheetHeader className="px-4 py-3 border-b border-subtle">
                    <SheetTitle className="text-sm font-semibold text-primary">
                        Opciones de vista
                    </SheetTitle>
                </SheetHeader>

                <div className="px-4 py-4 space-y-6">
                    <Section title="Agrupar por">
                        <div className="flex flex-wrap gap-2">
                            {GROUP_BY_OPTIONS.map((opt) => (
                                <OptionChip
                                    key={opt.value}
                                    label={opt.label}
                                    selected={options.groupBy === opt.value}
                                    onClick={() => set('groupBy', opt.value)}
                                />
                            ))}
                        </div>
                    </Section>

                    <Section title="Ordenar por">
                        <div className="flex flex-col gap-1.5">
                            {ORDER_BY_OPTIONS.map((opt) => (
                                <OptionChip
                                    key={opt.value}
                                    label={opt.label}
                                    selected={options.orderBy === opt.value}
                                    onClick={() => set('orderBy', opt.value)}
                                />
                            ))}
                        </div>
                    </Section>

                    <Section title="Opciones">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="show-empty-groups"
                                    className="text-sm text-secondary cursor-pointer"
                                >
                                    Mostrar grupos vacíos
                                </Label>
                                <Switch
                                    id="show-empty-groups"
                                    checked={options.showEmptyGroups}
                                    onCheckedChange={(v) => set('showEmptyGroups', v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="show-sub-issues"
                                    className="text-sm text-secondary cursor-pointer"
                                >
                                    Mostrar subtareas
                                </Label>
                                <Switch
                                    id="show-sub-issues"
                                    checked={options.showSubIssues}
                                    onCheckedChange={(v) => set('showSubIssues', v)}
                                />
                            </div>
                        </div>
                    </Section>
                </div>
            </SheetContent>
        </Sheet>
    );
};
