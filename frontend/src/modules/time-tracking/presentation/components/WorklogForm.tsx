import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CreateWorklogData } from '../../domain/types';

const schema = z.object({
    startedAt: z.string().min(1, 'La fecha de inicio es requerida'),
    endedAt: z.string().optional(),
    durationMinutesRaw: z.string().optional(),
    description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface WorklogFormProps {
    onSubmit: (data: CreateWorklogData) => void;
    isPending: boolean;
    onCancel: () => void;
}

export const WorklogForm = ({
    onSubmit,
    isPending,
    onCancel,
}: WorklogFormProps): React.ReactElement => {
    const [mode, setMode] = useState<'range' | 'manual'>('range');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            startedAt: new Date().toISOString().slice(0, 16),
        },
    });

    const handleFormSubmit = (data: FormData): void => {
        const payload: CreateWorklogData = {
            startedAt: data.startedAt,
            description: data.description || undefined,
        };
        if (mode === 'range') {
            payload.endedAt = data.endedAt;
        } else {
            const parsed = data.durationMinutesRaw
                ? Number.parseInt(data.durationMinutesRaw, 10)
                : undefined;
            payload.durationMinutes = parsed !== undefined && !Number.isNaN(parsed) ? parsed : undefined;
        }
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 pt-2">
            {/* Mode toggle */}
            <div className="flex rounded-md border border-subtle overflow-hidden text-xs">
                <button
                    type="button"
                    onClick={() => setMode('range')}
                    className={`flex-1 py-1.5 transition-colors ${
                        mode === 'range'
                            ? 'bg-accent-primary text-on-color'
                            : 'bg-transparent text-secondary hover:bg-layer-1'
                    }`}
                >
                    Inicio / Fin
                </button>
                <button
                    type="button"
                    onClick={() => setMode('manual')}
                    className={`flex-1 py-1.5 transition-colors ${
                        mode === 'manual'
                            ? 'bg-accent-primary text-on-color'
                            : 'bg-transparent text-secondary hover:bg-layer-1'
                    }`}
                >
                    Duración manual
                </button>
            </div>

            {/* Start date */}
            <div className="flex flex-col gap-1">
                <label
                    htmlFor="worklog-started"
                    className="text-xs font-medium text-secondary"
                >
                    Inicio
                </label>
                <Input
                    id="worklog-started"
                    type="datetime-local"
                    {...register('startedAt')}
                    className="bg-layer-1/50 border-subtle text-primary text-xs h-8"
                />
                {errors.startedAt && (
                    <p className="text-xs text-red-400">{errors.startedAt.message}</p>
                )}
            </div>

            {/* End date or manual duration */}
            {mode === 'range' ? (
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="worklog-ended"
                        className="text-xs font-medium text-secondary"
                    >
                        Fin
                    </label>
                    <Input
                        id="worklog-ended"
                        type="datetime-local"
                        {...register('endedAt')}
                        className="bg-layer-1/50 border-subtle text-primary text-xs h-8"
                    />
                    {errors.endedAt && (
                        <p className="text-xs text-red-400">{errors.endedAt.message}</p>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="worklog-duration"
                        className="text-xs font-medium text-secondary"
                    >
                        Duración (minutos)
                    </label>
                    <Input
                        id="worklog-duration"
                        type="number"
                        min={1}
                        placeholder="60"
                        {...register('durationMinutesRaw')}
                        className="bg-layer-1/50 border-subtle text-primary text-xs h-8"
                    />
                    {errors.durationMinutesRaw && (
                        <p className="text-xs text-red-400">
                            {errors.durationMinutesRaw.message}
                        </p>
                    )}
                </div>
            )}

            {/* Description */}
            <div className="flex flex-col gap-1">
                <label
                    htmlFor="worklog-desc"
                    className="text-xs font-medium text-secondary"
                >
                    Descripción (opcional)
                </label>
                <Textarea
                    id="worklog-desc"
                    {...register('description')}
                    placeholder="¿En qué trabajaste?"
                    rows={2}
                    className="bg-layer-1/50 border-subtle text-primary placeholder:text-placeholder text-xs resize-none"
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="text-secondary hover:text-primary text-xs h-7"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isPending}
                    size="sm"
                    className="bg-accent-primary hover:bg-accent-primary-hover text-on-color text-xs h-7"
                >
                    {isPending ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
};
