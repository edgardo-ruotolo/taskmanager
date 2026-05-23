import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Repeat2, X } from 'lucide-react';
import { useProjects } from '@/modules/projects/application/use-projects';
import { useLabels } from '@/modules/labels/application/use-labels';
import { useWorkspaceMembers } from '@/modules/workspaces/application/use-workspaces';
import { useIssueTypes } from '@/modules/issues/application/use-issue-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemedSelect } from '@/shared/components/ThemedSelect';
import { ThemedMultiSelect } from '@/shared/components/ThemedMultiSelect';
import { recurringTemplateSchema, type RecurringTemplateFormValues } from '../../application/schemas';
import type { RecurringTemplate, RecurringFromIssuePrefill, RecurringFrequency } from '../../domain/types';

const FREQUENCY_OPTIONS = [
    { value: 'Daily', label: 'Diario' },
    { value: 'Weekly', label: 'Semanal' },
    { value: 'Monthly', label: 'Mensual' },
    { value: 'Quarterly', label: 'Trimestral' },
    { value: 'Yearly', label: 'Anual' },
] as const satisfies readonly { value: RecurringFrequency; label: string }[];

const PRIORITY_OPTIONS = [
    { value: 'none', label: 'Sin prioridad' },
    { value: 'urgent', label: 'Urgente' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Media' },
    { value: 'low', label: 'Baja' },
] as const;

const STATE_GROUP_OPTIONS = [
    { value: 'unstarted', label: 'Sin iniciar' },
    { value: 'started', label: 'Iniciado' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' },
] as const;

/**
 * Convención del motor de recurrencia: 0=Lun .. 6=Dom (alineada con el backend).
 * NO cambiar el orden ni los valores: el calculator del backend hace `(d + 1) % 7`
 * para mapear a `System.DayOfWeek` (Sun=0..Sat=6).
 */
const DAYS_OF_WEEK = [
    { value: 0, label: 'Lun' },
    { value: 1, label: 'Mar' },
    { value: 2, label: 'Mié' },
    { value: 3, label: 'Jue' },
    { value: 4, label: 'Vie' },
    { value: 5, label: 'Sáb' },
    { value: 6, label: 'Dom' },
];

const FREQUENCIES_NEEDING_DAY_OF_MONTH: readonly RecurringFrequency[] = ['Monthly', 'Quarterly', 'Yearly'];

const ensureHmsTime = (value: string): string => {
    if (!value) return value;
    const colons = value.match(/:/g)?.length ?? 0;
    if (colons === 1) return `${value}:00`;
    return value;
};

function FieldHelp({ text }: { text: string }): React.ReactElement {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Info className="inline-block h-3.5 w-3.5 shrink-0 cursor-help text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>{text}</TooltipContent>
        </Tooltip>
    );
}

interface Props {
    workspaceSlug: string;
    data?: RecurringTemplate;
    prefill?: RecurringFromIssuePrefill;
    onSubmit: (values: RecurringTemplateFormValues) => Promise<void>;
    onClose: () => void;
}

export function RecurringForm({ workspaceSlug, data, prefill, onSubmit, onClose }: Props): React.ReactElement {
    const { data: projectsData } = useProjects(workspaceSlug);
    const { data: labels = [] } = useLabels(workspaceSlug);
    const { data: members = [] } = useWorkspaceMembers(workspaceSlug);
    const { data: issueTypes = [] } = useIssueTypes(workspaceSlug);

    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RecurringTemplateFormValues>({
        resolver: zodResolver(recurringTemplateSchema),
        defaultValues: {
            name: data?.name ?? prefill?.name ?? '',
            descriptionHtml: data?.descriptionHtml ?? prefill?.descriptionHtml ?? '',
            frequency: data?.frequency ?? 'Daily',
            interval: data?.interval ?? 1,
            daysOfWeek: data?.daysOfWeek ?? [],
            dayOfMonth: data?.dayOfMonth ?? null,
            monthOfYear: data?.monthOfYear ?? null,
            runAtTime: data?.runAtTime ?? '06:00:00',
            endTime: data?.endTime ?? null,
            timezone: data?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
            startsOn: data?.startsOn ?? new Date().toISOString().split('T')[0],
            endsOn: data?.endsOn ?? null,
            stateGroup: data?.stateGroup ?? prefill?.stateGroup ?? 'unstarted',
            priority: data?.priority ?? prefill?.priority ?? 'none',
            startDateOffsetDays: data?.startDateOffsetDays ?? 0,
            targetDateOffsetDays: data?.targetDateOffsetDays ?? 7,
            blockPolicy: data?.blockPolicy ?? 'SkipAndNotify',
            issueTypeId: data?.issueTypeId ?? prefill?.issueTypeId ?? null,
            projectIds: data?.projectIds ?? prefill?.projectIds ?? [],
            assigneeIds: data?.assigneeIds ?? prefill?.assigneeIds ?? [],
            labelIds: data?.labelIds ?? prefill?.labelIds ?? [],
        },
    });

    const frequency = watch('frequency');
    const watchedProjectIds = watch('projectIds');

    useEffect(() => {
        // Solo auto-seleccionar el primer proyecto al crear (sin data) y si el prefill no provee
        // proyectos: evita pisar la selección venida de "convertir issue a recurrente".
        const hasPrefillProjects = (prefill?.projectIds?.length ?? 0) > 0;
        if (
            !data &&
            !hasPrefillProjects &&
            projectsData?.items.length &&
            (!watchedProjectIds || watchedProjectIds.length === 0)
        ) {
            const firstId = projectsData.items[0]?.id;
            if (firstId) {
                setValue('projectIds', [firstId]);
            }
        }
    }, [projectsData, data, prefill, watchedProjectIds, setValue]);

    useEffect(() => {
        if (data) {
            reset({
                name: data.name,
                descriptionHtml: data.descriptionHtml,
                frequency: data.frequency,
                interval: data.interval,
                daysOfWeek: data.daysOfWeek,
                dayOfMonth: data.dayOfMonth,
                monthOfYear: data.monthOfYear,
                runAtTime: data.runAtTime,
                endTime: data.endTime,
                timezone: data.timezone,
                startsOn: data.startsOn,
                endsOn: data.endsOn,
                stateGroup: data.stateGroup,
                priority: data.priority,
                startDateOffsetDays: data.startDateOffsetDays,
                targetDateOffsetDays: data.targetDateOffsetDays,
                blockPolicy: data.blockPolicy,
                issueTypeId: data.issueTypeId ?? null,
                projectIds: data.projectIds,
                assigneeIds: data.assigneeIds,
                labelIds: data.labelIds,
            });
        }
    }, [data, reset]);

    const projectOptions = useMemo(
        () =>
            (projectsData?.items ?? []).map((p) => ({
                value: p.id,
                label: `${p.identifier} ${p.name}`,
            })),
        [projectsData],
    );

    const memberOptions = useMemo(
        () =>
            members.map((m) => ({
                value: m.userId,
                label: m.displayName ?? m.email,
            })),
        [members],
    );

    const labelOptions = useMemo(
        () =>
            labels.map((l) => ({
                value: l.id,
                label: l.name,
                color: l.color,
            })),
        [labels],
    );

    const showDayOfMonth = FREQUENCIES_NEEDING_DAY_OF_MONTH.includes(frequency);
    const showMonthOfYear = frequency === 'Yearly';

    const handleFormSubmit = (values: RecurringTemplateFormValues): Promise<void> => {
        const normalized: RecurringTemplateFormValues = {
            ...values,
            runAtTime: ensureHmsTime(values.runAtTime),
            endTime: values.endTime ? ensureHmsTime(values.endTime) : values.endTime,
        };
        return onSubmit(normalized);
    };

    return (
        <TooltipProvider>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-subtle px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/30">
                            <Repeat2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 className="text-base font-semibold text-primary">
                            {data ? 'Editar tarea recurrente' : 'Nueva tarea recurrente'}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 text-placeholder hover:bg-layer-1-hover hover:text-primary transition-colors duration-150"
                        aria-label="Cerrar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div
                    className="flex flex-col gap-y-4 overflow-y-auto px-5 py-4"
                    style={{ maxHeight: 'calc(80vh - 120px)' }}
                >
                    {/* Name */}
                    <div className="flex flex-col gap-y-1">
                        <Label htmlFor="name" className="text-secondary">
                            Nombre
                        </Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="Nombre de la tarea recurrente"
                            className={`bg-layer-1 border-subtle text-primary placeholder:text-placeholder ${errors.name ? 'border-destructive' : ''}`}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-y-1">
                        <Label htmlFor="description" className="text-secondary">
                            Descripción
                        </Label>
                        <Textarea
                            id="description"
                            {...register('descriptionHtml')}
                            placeholder="Descripción opcional"
                            className="min-h-[80px] bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                        />
                    </div>

                    {/* Recurrence Section */}
                    <div className="flex flex-col gap-y-3 rounded-lg border border-subtle p-4">
                        <h4 className="text-sm font-semibold text-primary">Recurrencia</h4>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-y-1">
                                <Label className="text-secondary">Frecuencia</Label>
                                <Controller
                                    name="frequency"
                                    control={control}
                                    render={({ field }) => (
                                        <ThemedSelect<RecurringFrequency>
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            options={FREQUENCY_OPTIONS}
                                            ariaLabel="Frecuencia"
                                        />
                                    )}
                                />
                            </div>

                            <div className="flex flex-col gap-y-1">
                                <Label className="flex items-center gap-1 text-secondary">
                                    Intervalo
                                    <FieldHelp text="Cada cuántas unidades de frecuencia se repite" />
                                </Label>
                                <Input
                                    type="number"
                                    {...register('interval', { valueAsNumber: true })}
                                    min={1}
                                    className="bg-layer-1 border-subtle text-primary"
                                />
                            </div>
                        </div>

                        {frequency === 'Weekly' && (
                            <div className="flex flex-col gap-y-1">
                                <Label className="flex items-center gap-1">
                                    Días de la semana
                                    <FieldHelp text="Seleccioná los días en que se ejecuta" />
                                </Label>
                                <Controller
                                    name="daysOfWeek"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS_OF_WEEK.map((day) => (
                                                <button
                                                    key={day.value}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = field.value ?? [];
                                                        const updated = current.includes(day.value)
                                                            ? current.filter((d) => d !== day.value)
                                                            : [...current, day.value];
                                                        field.onChange(updated);
                                                    }}
                                                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                                        (field.value ?? []).includes(day.value)
                                                            ? 'bg-accent-primary text-on-color'
                                                            : 'border border-subtle text-placeholder hover:bg-layer-1 hover:text-primary'
                                                    }`}
                                                >
                                                    {day.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                />
                                {errors.daysOfWeek && (
                                    <p className="text-xs text-destructive">{errors.daysOfWeek.message}</p>
                                )}
                            </div>
                        )}

                        {showDayOfMonth && (
                            <div className="flex flex-col gap-y-1">
                                <Label className="flex items-center gap-1 text-secondary">
                                    Día del mes
                                    <FieldHelp text="Entre 1 y 31" />
                                </Label>
                                <Input
                                    type="number"
                                    {...register('dayOfMonth', { valueAsNumber: true })}
                                    min={1}
                                    max={31}
                                    className="w-32 bg-layer-1 border-subtle text-primary"
                                />
                                {errors.dayOfMonth && (
                                    <p className="text-xs text-destructive">{errors.dayOfMonth.message}</p>
                                )}
                            </div>
                        )}

                        {showMonthOfYear && (
                            <div className="flex flex-col gap-y-1">
                                <Label className="flex items-center gap-1 text-secondary">
                                    Mes del año
                                    <FieldHelp text="Entre 1 (enero) y 12 (diciembre)" />
                                </Label>
                                <Input
                                    type="number"
                                    {...register('monthOfYear', { valueAsNumber: true })}
                                    min={1}
                                    max={12}
                                    className="w-32 bg-layer-1 border-subtle text-primary"
                                />
                                {errors.monthOfYear && (
                                    <p className="text-xs text-destructive">{errors.monthOfYear.message}</p>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-y-1">
                                <Label className="flex items-center gap-1 text-secondary">
                                    Hora de ejecución
                                    <FieldHelp text="Hora en que se genera la tarea" />
                                </Label>
                                <Input
                                    type="time"
                                    {...register('runAtTime')}
                                    className="bg-layer-1 border-subtle text-primary"
                                />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label className="flex items-center gap-1 text-secondary">
                                    Hora límite
                                    <FieldHelp text="Ventana de tolerancia de ejecución" />
                                </Label>
                                <Input
                                    type="time"
                                    {...register('endTime')}
                                    className="bg-layer-1 border-subtle text-primary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-y-1">
                                <Label className="flex items-center gap-1 text-secondary">
                                    Comienza el
                                    <FieldHelp text="Primera fecha de ejecución" />
                                </Label>
                                <Input
                                    type="date"
                                    {...register('startsOn')}
                                    className={`bg-layer-1 border-subtle text-primary ${errors.startsOn ? 'border-destructive' : ''}`}
                                />
                                {errors.startsOn && (
                                    <p className="text-xs text-destructive">{errors.startsOn.message}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label className="flex items-center gap-1 text-secondary">
                                    Termina el
                                    <FieldHelp text="Opcional — fecha de fin de la recurrencia" />
                                </Label>
                                <Input
                                    type="date"
                                    {...register('endsOn')}
                                    className="bg-layer-1 border-subtle text-primary"
                                />
                                {errors.endsOn && (
                                    <p className="text-xs text-destructive">{errors.endsOn.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-y-1">
                            <Label className="flex items-center gap-1 text-secondary">
                                Zona horaria
                                <FieldHelp text="Ej: America/Santiago, UTC" />
                            </Label>
                            <Input
                                {...register('timezone')}
                                placeholder="America/Argentina/Buenos_Aires"
                                className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                            />
                        </div>
                    </div>

                    {/* Issue template section */}
                    <div className="flex flex-col gap-y-3 rounded-lg border border-subtle p-4">
                        <h4 className="text-sm font-semibold text-primary">Plantilla de tarea</h4>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-y-1">
                                <Label className="text-secondary">Prioridad</Label>
                                <Controller
                                    name="priority"
                                    control={control}
                                    render={({ field }) => (
                                        <ThemedSelect
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            options={PRIORITY_OPTIONS}
                                            ariaLabel="Prioridad"
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label className="text-secondary">Grupo de estado</Label>
                                <Controller
                                    name="stateGroup"
                                    control={control}
                                    render={({ field }) => (
                                        <ThemedSelect
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            options={STATE_GROUP_OPTIONS}
                                            ariaLabel="Grupo de estado"
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {issueTypes.length > 0 && (
                            <div className="flex flex-col gap-y-1">
                                <Label className="text-secondary">Tipo de tarea</Label>
                                <Controller
                                    name="issueTypeId"
                                    control={control}
                                    render={({ field }) => (
                                        <ThemedSelect
                                            value={field.value ?? ''}
                                            onValueChange={field.onChange}
                                            options={issueTypes.map((t) => ({ value: t.id, label: t.name }))}
                                            placeholder="Sin tipo"
                                            ariaLabel="Tipo de tarea"
                                        />
                                    )}
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-y-1">
                            <Label className="flex items-center gap-1 text-secondary">
                                Proyectos
                                <FieldHelp text="Seleccioná los proyectos donde se crearán las tareas" />
                            </Label>
                            <Controller
                                name="projectIds"
                                control={control}
                                render={({ field }) => (
                                    <ThemedMultiSelect
                                        placeholder="Seleccionar proyectos..."
                                        options={projectOptions}
                                        selected={field.value ?? []}
                                        onChange={field.onChange}
                                        emptyText="Sin proyectos disponibles"
                                    />
                                )}
                            />
                            {errors.projectIds && (
                                <p className="text-xs text-destructive">{errors.projectIds.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-y-1">
                            <Label className="flex items-center gap-1 text-secondary">
                                Asignados
                                <FieldHelp text="Miembros que serán asignados a cada tarea generada" />
                            </Label>
                            <Controller
                                name="assigneeIds"
                                control={control}
                                render={({ field }) => (
                                    <ThemedMultiSelect
                                        placeholder="Seleccionar miembros..."
                                        options={memberOptions}
                                        selected={field.value ?? []}
                                        onChange={field.onChange}
                                        emptyText="Sin miembros disponibles"
                                    />
                                )}
                            />
                        </div>

                        <div className="flex flex-col gap-y-1">
                            <Label className="flex items-center gap-1 text-secondary">
                                Etiquetas
                                <FieldHelp text="Etiquetas que se aplicarán a cada tarea generada" />
                            </Label>
                            <Controller
                                name="labelIds"
                                control={control}
                                render={({ field }) => (
                                    <ThemedMultiSelect
                                        placeholder="Seleccionar etiquetas..."
                                        options={labelOptions}
                                        selected={field.value ?? []}
                                        onChange={field.onChange}
                                        emptyText="Sin etiquetas disponibles"
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-y-1">
                                <Label className="flex items-center gap-1 text-secondary">
                                    Offset fecha inicio (días)
                                    <FieldHelp text="Días desde la ejecución para la fecha de inicio de la tarea" />
                                </Label>
                                <Input
                                    type="number"
                                    {...register('startDateOffsetDays', { valueAsNumber: true })}
                                    className="bg-layer-1 border-subtle text-primary"
                                />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label className="flex items-center gap-1 text-secondary">
                                    Offset fecha objetivo (días)
                                    <FieldHelp text="Días desde la ejecución para la fecha objetivo de la tarea" />
                                </Label>
                                <Input
                                    type="number"
                                    {...register('targetDateOffsetDays', { valueAsNumber: true })}
                                    className="bg-layer-1 border-subtle text-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 border-t border-subtle px-5 py-4">
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={onClose}
                        className="text-secondary hover:text-primary"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                    >
                        {isSubmitting
                            ? data
                                ? 'Guardando...'
                                : 'Creando...'
                            : data
                              ? 'Guardar cambios'
                              : 'Crear tarea recurrente'}
                    </Button>
                </div>
            </form>
        </TooltipProvider>
    );
}
