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
import { SearchableSelect } from '@/shared/components/ui/searchable-select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createModuleSchema, type CreateModuleFormData } from '../../application/schemas';
import { useCreateModule, useUpdateModule } from '../../application/use-modules';
import type { Module } from '../../domain/types';

interface CreateModuleDialogProps {
    workspaceSlug: string;
    projectId: string;
    trigger: React.ReactNode;
    /** When provided, dialog runs in edit mode */
    module?: Module;
    /** Controlled open state for edit mode (optional) */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const STATUS_ITEMS = [
    { id: 'Backlog', label: 'Por hacer' },
    { id: 'InProgress', label: 'En progreso' },
    { id: 'Paused', label: 'Pausado' },
    { id: 'Completed', label: 'Completado' },
    { id: 'Archived', label: 'Archivado' },
] as const;

export const CreateModuleDialog = ({
    workspaceSlug,
    projectId,
    trigger,
    module,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: CreateModuleDialogProps): React.ReactElement => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled
        ? (controlledOnOpenChange ?? setInternalOpen)
        : setInternalOpen;

    const isEditMode = module !== undefined;

    const form = useForm<CreateModuleFormData>({
        resolver: zodResolver(createModuleSchema),
        defaultValues: {
            name: module?.name ?? '',
            description: module?.description ?? '',
            status: module?.status ?? 'Backlog',
        },
    });

    useEffect(() => {
        if (open && isEditMode) {
            form.reset({
                name: module.name,
                description: module.description ?? '',
                status: module.status,
            });
        }
        if (!open && !isEditMode) {
            form.reset({ name: '', description: '', status: 'Backlog' });
        }
    }, [open, module, isEditMode, form]);

    const { mutate: createMutate, isPending: isCreating } = useCreateModule<CreateModuleFormData>(
        workspaceSlug,
        projectId,
        { setError: form.setError },
    );

    const { mutate: updateMutate, isPending: isUpdating } = useUpdateModule<CreateModuleFormData>(
        workspaceSlug,
        projectId,
        { setError: form.setError },
    );

    const isPending = isCreating || isUpdating;

    const onSubmit = (data: CreateModuleFormData): void => {
        const payload = {
            name: data.name,
            description: data.description || undefined,
            status: data.status,
        };

        if (isEditMode) {
            updateMutate(
                { moduleId: module.id, data: payload },
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
                        {isEditMode ? 'Editar Módulo' : 'Nuevo Módulo'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEditMode
                            ? 'Modifica el nombre, descripción y estado del módulo.'
                            : 'Agrupa issues por tema o entrega. Define nombre, descripción y estado.'}
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
                                            placeholder="Módulo de autenticación"
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
                                            placeholder="Descripción del módulo..."
                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Estado</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            multi={false}
                                            value={field.value || null}
                                            onChange={(v) => field.onChange(v ?? 'Backlog')}
                                            items={STATUS_ITEMS as unknown as Array<{ id: string; label: string }>}
                                            placeholder="Estado"
                                            width="100%"
                                            clearable={false}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                    : isPending ? 'Creando...' : 'Crear módulo'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
