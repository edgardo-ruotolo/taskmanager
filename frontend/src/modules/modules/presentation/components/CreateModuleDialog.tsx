import type React from 'react';
import { useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createModuleSchema, type CreateModuleFormData } from '../../application/schemas';
import { useCreateModule } from '../../application/use-modules';

interface CreateModuleDialogProps {
    workspaceSlug: string;
    projectId: string;
    trigger: React.ReactNode;
}

export const CreateModuleDialog = ({
    workspaceSlug,
    projectId,
    trigger,
}: CreateModuleDialogProps): React.ReactElement => {
    const [open, setOpen] = useState(false);

    const form = useForm<CreateModuleFormData>({
        resolver: zodResolver(createModuleSchema),
        defaultValues: { name: '', description: '', status: 'Backlog' },
    });

    const { mutate, isPending } = useCreateModule<CreateModuleFormData>(workspaceSlug, projectId, {
        setError: form.setError,
    });

    const onSubmit = (data: CreateModuleFormData): void => {
        mutate(
            {
                name: data.name,
                description: data.description || undefined,
                status: data.status,
            },
            {
                onSuccess: () => {
                    form.reset();
                    setOpen(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Nuevo Módulo</DialogTitle>
                    <DialogDescription className="sr-only">
                        Agrupa issues por tema o entrega. Define nombre, descripción, fechas y líder.
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-layer-1 border-subtle text-primary">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-layer-1 border-subtle">
                                            <SelectItem value="Backlog" className="text-primary focus:bg-layer-2">Por hacer</SelectItem>
                                            <SelectItem value="InProgress" className="text-primary focus:bg-layer-2">En progreso</SelectItem>
                                            <SelectItem value="Paused" className="text-primary focus:bg-layer-2">Pausado</SelectItem>
                                            <SelectItem value="Completed" className="text-primary focus:bg-layer-2">Completado</SelectItem>
                                            <SelectItem value="Archived" className="text-primary focus:bg-layer-2">Archivado</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                {isPending ? 'Creando...' : 'Crear módulo'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
