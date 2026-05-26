import type React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createCycleSchema, type CreateCycleFormData } from '../../application/schemas';
import { useCreateCycle, useUpdateCycle } from '../../application/use-cycles';
import type { Cycle } from '../../domain/types';

interface CreateCycleDialogProps {
    workspaceSlug: string;
    projectId: string;
    trigger: React.ReactNode;
    /** When provided, dialog runs in edit mode */
    cycle?: Cycle;
    /** Controlled open state for edit mode (optional) */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const CreateCycleDialog = ({
    workspaceSlug,
    projectId,
    trigger,
    cycle,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: CreateCycleDialogProps): React.ReactElement => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled
        ? (controlledOnOpenChange ?? setInternalOpen)
        : setInternalOpen;

    const isEditMode = cycle !== undefined;

    const form = useForm<CreateCycleFormData>({
        resolver: zodResolver(createCycleSchema),
        defaultValues: {
            name: cycle?.name ?? '',
            description: cycle?.description ?? '',
            startDate: cycle?.startDate?.slice(0, 10) ?? '',
            endDate: cycle?.endDate?.slice(0, 10) ?? '',
        },
    });

    // Reset form when cycle prop changes (e.g. different cycle opened)
    useEffect(() => {
        if (open && isEditMode) {
            form.reset({
                name: cycle.name,
                description: cycle.description ?? '',
                startDate: cycle.startDate?.slice(0, 10) ?? '',
                endDate: cycle.endDate?.slice(0, 10) ?? '',
            });
        }
        if (!open && !isEditMode) {
            form.reset({ name: '', description: '', startDate: '', endDate: '' });
        }
    }, [open, cycle, isEditMode, form]);

    const { mutate: createMutate, isPending: isCreating } = useCreateCycle<CreateCycleFormData>(
        workspaceSlug,
        projectId,
        { setError: form.setError },
    );

    const { mutate: updateMutate, isPending: isUpdating } = useUpdateCycle<CreateCycleFormData>(
        workspaceSlug,
        projectId,
        { setError: form.setError },
    );

    const isPending = isCreating || isUpdating;

    const onSubmit = (data: CreateCycleFormData): void => {
        const payload = {
            name: data.name,
            description: data.description || undefined,
            startDate: data.startDate || undefined,
            endDate: data.endDate || undefined,
        };

        if (isEditMode) {
            updateMutate(
                { cycleId: cycle.id, data: payload },
                { onSuccess: () => setOpen(false) },
            );
        } else {
            createMutate(payload, {
                onSuccess: () => {
                    form.reset();
                    setOpen(false);
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">
                        {isEditMode ? 'Editar Ciclo' : 'Nuevo Ciclo'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEditMode
                            ? 'Modifica el nombre, fechas y descripción del ciclo.'
                            : 'Define un sprint con nombre, fechas y descripción opcional.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Nombre</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Sprint 1"
                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Descripción (opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descripción del ciclo..."
                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Fecha inicio</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                className="bg-layer-1 border-subtle text-primary"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Fecha fin</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                className="bg-layer-1 border-subtle text-primary"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="text-tertiary hover:text-primary"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                            >
                                {isEditMode
                                    ? isPending ? 'Guardando...' : 'Guardar'
                                    : isPending ? 'Creando...' : 'Crear ciclo'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
