import type React from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    useMyNotificationPreferences,
    useUpdateNotificationPreferences,
    useNotificationSettings,
    useUpdateNotificationSettings,
} from '@/modules/notifications/application/use-notifications';
import type { UpsertNotificationPreferenceData } from '@/modules/notifications/domain/types';

// ---------------------------------------------------------------------------
// Notification event definitions
// ---------------------------------------------------------------------------

interface NotificationEventDef {
    key: string;
    type: string;
    property: string;
    label: string;
    defaultValue: boolean;
}

interface NotificationGroup {
    group: string;
    events: NotificationEventDef[];
}

const NOTIFICATION_GROUPS: NotificationGroup[] = [
    {
        group: 'Mi trabajo',
        events: [
            { key: 'issue.assigned',      type: 'issue',   property: 'assigned',      label: 'Cuando me asignan una tarea',          defaultValue: true  },
            { key: 'issue.mention',        type: 'issue',   property: 'mention',       label: 'Cuando me mencionan',                  defaultValue: true  },
            { key: 'comment.created',      type: 'comment', property: 'created',       label: 'Comentarios en mis tareas',            defaultValue: true  },
            { key: 'issue.state_changed',  type: 'issue',   property: 'state_changed', label: 'Cambios de estado en mis tareas',      defaultValue: false },
            { key: 'issue.due_soon',       type: 'issue',   property: 'due_soon',      label: 'Vencimientos próximos',               defaultValue: true  },
        ],
    },
    {
        group: 'Ciclos',
        events: [
            { key: 'cycle.start', type: 'cycle', property: 'start', label: 'Inicio de ciclo', defaultValue: true },
            { key: 'cycle.end',   type: 'cycle', property: 'end',   label: 'Fin de ciclo',    defaultValue: true },
        ],
    },
    {
        group: 'Como líder',
        events: [
            { key: 'leader.overdue',          type: 'leader', property: 'overdue',          label: 'Resumen diario de tareas vencidas', defaultValue: true },
            { key: 'leader.midpoint',         type: 'leader', property: 'midpoint',         label: 'Mitad de ciclo',                   defaultValue: true },
            { key: 'leader.approval_pending', type: 'leader', property: 'approval_pending', label: 'Aprobaciones pendientes',          defaultValue: true },
        ],
    },
    {
        group: 'Resúmenes',
        events: [
            { key: 'digest.daily', type: 'digest', property: 'daily', label: 'Digest diario (agrupa eventos no críticos)', defaultValue: true },
        ],
    },
];

// Flat list of all events for easy lookup
const ALL_EVENTS: NotificationEventDef[] = NOTIFICATION_GROUPS.flatMap((g) => g.events);

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const preferencesSchema = z.object(
    Object.fromEntries(ALL_EVENTS.map((e) => [e.key, z.boolean()])),
);

const settingsSchema = z.object({
    emailDailyDigest: z.boolean(),
    emailUnsubscribed: z.boolean(),
});

const formSchema = preferencesSchema.merge(settingsSchema);

type FormValues = z.infer<typeof formSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildDefaultValues(
    serverPrefs: Array<{ notificationType: string; property: string; emailNotification: boolean }>,
    emailDailyDigest: boolean,
    emailUnsubscribed: boolean,
): FormValues {
    const prefMap = new Map(
        serverPrefs.map((p) => [`${p.notificationType}.${p.property}`, p.emailNotification]),
    );

    const prefValues = Object.fromEntries(
        ALL_EVENTS.map((e) => [
            e.key,
            prefMap.has(e.key) ? (prefMap.get(e.key) as boolean) : e.defaultValue,
        ]),
    );

    return { ...prefValues, emailDailyDigest, emailUnsubscribed } as FormValues;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SwitchRowProps {
    id: string;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
}

function SwitchRow({ id, label, checked, onCheckedChange, disabled }: SwitchRowProps): React.ReactElement {
    return (
        <div className="flex items-center justify-between gap-4 py-3 border-b last:border-b-0" style={{ borderColor: 'var(--neutral-300)' }}>
            <Label
                htmlFor={id}
                className="text-[13px] font-normal leading-snug cursor-pointer flex-1"
                style={{ color: 'var(--neutral-1100)' }}
            >
                {label}
            </Label>
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                aria-label={label}
            />
        </div>
    );
}

function PreferencesFormSkeleton(): React.ReactElement {
    return (
        <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                    <CardHeader className="pb-3">
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent className="flex flex-col gap-0">
                        {[1, 2, 3].map((j) => (
                            <div key={j} className="flex items-center justify-between py-3 border-b last:border-b-0" style={{ borderColor: 'var(--neutral-300)' }}>
                                <Skeleton className="h-4 w-56" />
                                <Skeleton className="h-5 w-10 rounded-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function NotificationPreferencesForm(): React.ReactElement {
    const { data: prefs, isLoading: prefsLoading } = useMyNotificationPreferences();
    const { data: settings, isLoading: settingsLoading } = useNotificationSettings();

    const updatePrefs = useUpdateNotificationPreferences();
    const updateSettings = useUpdateNotificationSettings();

    const isLoading = prefsLoading || settingsLoading;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: Object.fromEntries([
            ...ALL_EVENTS.map((e) => [e.key, e.defaultValue]),
            ['emailDailyDigest', true],
            ['emailUnsubscribed', false],
        ]) as FormValues,
    });

    const { reset, watch, setValue, formState: { isDirty, isSubmitting } } = form;

    // Populate form once data loads
    useEffect(() => {
        if (prefs !== undefined && settings !== undefined) {
            reset(buildDefaultValues(prefs, settings.emailDailyDigest, settings.emailUnsubscribed));
        }
    }, [prefs, settings, reset]);

    const emailUnsubscribed = watch('emailUnsubscribed');

    const onSubmit = async (values: FormValues): Promise<void> => {
        const prefPayload: UpsertNotificationPreferenceData[] = ALL_EVENTS.map((e) => ({
            notificationType: e.type,
            property: e.property,
            emailNotification: values[e.key as keyof FormValues] as boolean,
        }));

        const settingsPayload = {
            emailDailyDigest: values.emailDailyDigest,
            emailUnsubscribed: values.emailUnsubscribed,
        };

        try {
            await Promise.all([
                updatePrefs.mutateAsync(prefPayload),
                updateSettings.mutateAsync(settingsPayload),
            ]);
            toast.success('Preferencias guardadas correctamente');
            // After save, mark form as not dirty
            reset(values);
        } catch {
            // Errors are handled in the mutation onError handlers
        }
    };

    if (isLoading) {
        return <PreferencesFormSkeleton />;
    }

    return (
        <form onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }} className="flex flex-col gap-4">
            {/* Preference groups */}
            {NOTIFICATION_GROUPS.map((group) => (
                <Card key={group.group}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[14px] font-semibold" style={{ color: 'var(--neutral-1200)' }}>
                            {group.group}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {group.events.map((event) => {
                            const value = watch(event.key as keyof FormValues) as boolean;
                            return (
                                <SwitchRow
                                    key={event.key}
                                    id={`pref-${event.key}`}
                                    label={event.label}
                                    checked={value}
                                    onCheckedChange={(checked) => setValue(event.key as keyof FormValues, checked, { shouldDirty: true })}
                                    disabled={emailUnsubscribed}
                                />
                            );
                        })}
                    </CardContent>
                </Card>
            ))}

            {/* Subscription card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-[14px] font-semibold" style={{ color: 'var(--neutral-1200)' }}>
                        Suscripción
                    </CardTitle>
                    <CardDescription className="text-[12.5px]">
                        Controla la recepción global de correos del sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col gap-0">
                    <SwitchRow
                        id="pref-emailDailyDigest"
                        label="Digest diario (resumen de actividad)"
                        checked={watch('emailDailyDigest')}
                        onCheckedChange={(checked) => setValue('emailDailyDigest', checked, { shouldDirty: true })}
                        disabled={emailUnsubscribed}
                    />
                    <SwitchRow
                        id="pref-emailUnsubscribed"
                        label="Darme de baja de todos los correos"
                        checked={emailUnsubscribed}
                        onCheckedChange={(checked) => setValue('emailUnsubscribed', checked, { shouldDirty: true })}
                    />

                    {emailUnsubscribed && (
                        <div
                            className={cn(
                                'mt-3 flex items-start gap-2.5 rounded-md px-3.5 py-3 border text-[12.5px]',
                            )}
                            style={{
                                background: 'var(--red-100)',
                                borderColor: 'var(--red-300)',
                                color: 'var(--red-800)',
                            }}
                            role="alert"
                        >
                            <AlertTriangle size={15} className="shrink-0 mt-[1px]" aria-hidden="true" />
                            <span>
                                No recibirás <strong>ningún email</strong> del sistema mientras esta opción esté activada. Podés revertirlo en cualquier momento.
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end pt-1">
                <Button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    className="min-w-[120px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={14} className="mr-2 animate-spin" aria-hidden="true" />
                            Guardando...
                        </>
                    ) : (
                        'Guardar cambios'
                    )}
                </Button>
            </div>
        </form>
    );
}
