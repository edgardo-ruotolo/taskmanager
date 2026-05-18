import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
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
import { Button } from '@/components/ui/button';
import { useCreateIssueType } from '../../application/use-issue-types';

const createIssueTypeSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(100),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color HEX inválido').optional(),
    isDefault: z.boolean().optional(),
});

type CreateIssueTypeFormData = z.infer<typeof createIssueTypeSchema>;

interface CreateIssueTypeDialogProps {
    workspaceSlug: string;
    trigger: React.ReactNode;
}

export const CreateIssueTypeDialog = ({
    workspaceSlug,
    trigger,
}: CreateIssueTypeDialogProps): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const { mutate, isPending } = useCreateIssueType(workspaceSlug);

    const form = useForm<CreateIssueTypeFormData>({
        resolver: zodResolver(createIssueTypeSchema),
        defaultValues: { name: '', description: '', color: '#3b82f6', isDefault: false },
    });

    const onSubmit = (data: CreateIssueTypeFormData): void => {
        mutate(data, {
            onSuccess: () => {
                form.reset({ name: '', description: '', color: '#3b82f6', isDefault: false });
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Nuevo Tipo de Tarea</DialogTitle>
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
                                            placeholder="Error, Funcionalidad, Tarea..."
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
                                    <FormLabel className="text-secondary">
                                        Descripción{' '}
                                        <span className="text-placeholder">(opcional)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Descripción del tipo"
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
                                                value={field.value ?? '#3b82f6'}
                                                onChange={field.onChange}
                                            />
                                            <span className="text-sm text-tertiary font-mono">
                                                {field.value ?? '#3b82f6'}
                                            </span>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isDefault"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                id="isDefault"
                                                className="w-4 h-4 rounded border-subtle bg-layer-1 accent-blue-600"
                                                checked={field.value ?? false}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel
                                            htmlFor="isDefault"
                                            className="text-secondary cursor-pointer"
                                        >
                                            Establecer como tipo por defecto
                                        </FormLabel>
                                    </div>
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
                                {isPending ? 'Creando...' : 'Crear tipo'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
