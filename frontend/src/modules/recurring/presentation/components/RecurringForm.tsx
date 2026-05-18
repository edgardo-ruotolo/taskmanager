import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Repeat2, X } from 'lucide-react';
import { useCompanies } from '@/modules/companies/application/use-companies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { recurringTemplateSchema, type RecurringTemplateFormValues } from '../../application/schemas';
import type { RecurringTemplate, RecurringFromIssuePrefill } from '../../domain/types';

const FREQUENCY_OPTIONS = [
    { value: 'Daily', label: 'Diario' },
    { value: 'Weekly', label: 'Semanal' },
    { value: 'Monthly', label: 'Mensual' },
    { value: 'Yearly', label: 'Anual' },
] as const;

const DAYS_OF_WEEK = [
    { value: 0, label: 'Lun' },
    { value: 1, label: 'Mar' },
    { value: 2, label: 'Mié' },
    { value: 3, label: 'Jue' },
    { value: 4, label: 'Vie' },
    { value: 5, label: 'Sáb' },
    { value: 6, label: 'Dom' },
];

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
    const { data: companiesData } = useCompanies(workspaceSlug);
    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
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
            companyIds: data?.companyIds ?? prefill?.companyIds ?? [],
            assigneeIds: data?.assigneeIds ?? prefill?.assigneeIds ?? [],
            labelIds: data?.labelIds ?? prefill?.labelIds ?? [],
        },
    });

    const frequency = watch('frequency');

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
                companyIds: data.companyIds,
                assigneeIds: data.assigneeIds,
                labelIds: data.labelIds,
            });
        }
    }, [data, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
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
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-y-4 overflow-y-auto px-5 py-4" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                {/* Name */}
                <div className="flex flex-col gap-y-1">
                    <Label htmlFor="name" className="text-secondary">Nombre</Label>
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
                    <Label htmlFor="description" className="text-secondary">Descripción</Label>
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
                        {/* Frequency */}
                        <div className="flex flex-col gap-y-1">
                            <Label className="text-secondary">Frecuencia</Label>
                            <Controller
                                name="frequency"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FREQUENCY_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Interval */}
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

                    {/* Days of week */}
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
                        </div>
                    )}

                    {/* Day of month */}
                    {frequency === 'Monthly' && (
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
                        </div>
                    )}

                    {/* Month of year */}
                    {frequency === 'Yearly' && (
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
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-y-1">
                            <Label className="flex items-center gap-1 text-secondary">
                                Hora de ejecución
                                <FieldHelp text="Hora en que se genera la tarea" />
                            </Label>
                            <Input type="time" {...register('runAtTime')} className="bg-layer-1 border-subtle text-primary" />
                        </div>
                        <div className="flex flex-col gap-y-1">
                            <Label className="flex items-center gap-1 text-secondary">
                                Hora límite
                                <FieldHelp text="Ventana de tolerancia de ejecución" />
                            </Label>
                            <Input type="time" {...register('endTime')} className="bg-layer-1 border-subtle text-primary" />
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
                            <Input type="date" {...register('endsOn')} className="bg-layer-1 border-subtle text-primary" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1">
                        <Label className="flex items-center gap-1 text-secondary">
                            Zona horaria
                            <FieldHelp text="Ej: America/Santiago, UTC" />
                        </Label>
                        <Input {...register('timezone')} placeholder="America/Argentina/Buenos_Aires" className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder" />
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
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin prioridad</SelectItem>
                                            <SelectItem value="urgent">Urgente</SelectItem>
                                            <SelectItem value="high">Alta</SelectItem>
                                            <SelectItem value="medium">Media</SelectItem>
                                            <SelectItem value="low">Baja</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="flex flex-col gap-y-1">
                            <Label className="text-secondary">Grupo de estado</Label>
                            <Controller
                                name="stateGroup"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unstarted">Sin iniciar</SelectItem>
                                            <SelectItem value="started">Iniciado</SelectItem>
                                            <SelectItem value="completed">Completado</SelectItem>
                                            <SelectItem value="cancelled">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Companies */}
                    {companiesData && companiesData.items.length > 0 && (
                        <div className="flex flex-col gap-y-1">
                            <Label className="flex items-center gap-1">
                                Empresas
                                <FieldHelp text="Seleccioná las empresas donde se crearán las tareas" />
                            </Label>
                            <Controller
                                name="companyIds"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-wrap gap-2">
                                        {companiesData.items.map((company) => (
                                            <button
                                                key={company.id}
                                                type="button"
                                                onClick={() => {
                                                    const current = field.value ?? [];
                                                    const updated = current.includes(company.id)
                                                        ? current.filter((id) => id !== company.id)
                                                        : [...current, company.id];
                                                    field.onChange(updated);
                                                }}
                                                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                                    (field.value ?? []).includes(company.id)
                                                        ? 'bg-accent-primary text-on-color'
                                                        : 'border border-subtle text-placeholder hover:bg-layer-1 hover:text-primary'
                                                }`}
                                            >
                                                {company.identifier} {company.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            />
                            {errors.companyIds && (
                                <p className="text-xs text-destructive">{errors.companyIds.message}</p>
                            )}
                        </div>
                    )}

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
                <Button variant="ghost" type="button" onClick={onClose} className="text-secondary hover:text-primary">
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-accent-primary hover:bg-accent-primary-hover text-on-color">
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
    );
}
