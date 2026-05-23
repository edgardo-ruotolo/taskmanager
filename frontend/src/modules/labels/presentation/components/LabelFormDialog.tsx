import type React from 'react';
import { useEffect, useState } from 'react';
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
import { createLabelSchema, type CreateLabelFormData } from '../../application/schemas';
import { useCreateLabel, useUpdateLabel } from '../../application/use-labels';
import type { Label } from '../../domain/types';

interface LabelFormDialogProps {
    workspaceSlug: string;
    trigger: React.ReactNode;
    label?: Label;
}

const DEFAULT_VALUES: CreateLabelFormData = {
    name: '',
    color: '#3b82f6',
    description: '',
};

export const LabelFormDialog = ({
    workspaceSlug,
    trigger,
    label,
}: LabelFormDialogProps): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const isEditMode = label !== undefined;

    const form = useForm<CreateLabelFormData>({
        resolver: zodResolver(createLabelSchema),
        defaultValues: isEditMode
            ? {
                name: label.name,
                color: label.color,
                description: label.description ?? '',
            }
            : DEFAULT_VALUES,
    });

    useEffect(() => {
        if (open) {
            form.reset(
                isEditMode && label
                    ? {
                        name: label.name,
                        color: label.color,
                        description: label.description ?? '',
                    }
                    : DEFAULT_VALUES,
            );
        }
    }, [open, isEditMode, label, form]);

    const createMutation = useCreateLabel<CreateLabelFormData>(workspaceSlug, {
        setError: form.setError,
    });
    const updateMutation = useUpdateLabel<CreateLabelFormData>(workspaceSlug, {
        setError: form.setError,
    });

    const isPending = isEditMode ? updateMutation.isPending : createMutation.isPending;

    const onSubmit = (data: CreateLabelFormData): void => {
        if (isEditMode && label) {
            updateMutation.mutate(
                { labelId: label.id, data },
                {
                    onSuccess: () => {
                        setOpen(false);
                    },
                },
            );
            return;
        }

        createMutation.mutate(data, {
            onSuccess: () => {
                form.reset(DEFAULT_VALUES);
                setOpen(false);
            },
        });
    };

    const title = isEditMode ? 'Editar Etiqueta' : 'Nueva Etiqueta';
    const description = isEditMode
        ? 'Actualiza el nombre o color de la etiqueta.'
        : 'Crea una etiqueta para clasificar tareas con nombre y color.';
    const submitLabel = isEditMode
        ? isPending
            ? 'Guardando...'
            : 'Guardar cambios'
        : isPending
            ? 'Creando...'
            : 'Crear etiqueta';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-primary">{title}</DialogTitle>
                    <DialogDescription className="sr-only">{description}</DialogDescription>
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
                                            placeholder="Bug, Feature, Urgente..."
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
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Color</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                className="w-10 h-10 rounded cursor-pointer border border-subtle bg-layer-1"
                                                {...field}
                                            />
                                            <span className="text-sm text-tertiary font-mono">
                                                {field.value}
                                            </span>
                                            <span
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                                style={{ backgroundColor: field.value }}
                                            >
                                                Vista previa
                                            </span>
                                        </div>
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
                                    <FormLabel className="text-secondary">Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={3}
                                            placeholder="Descripción opcional..."
                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder resize-none"
                                            {...field}
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
                                {submitLabel}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
