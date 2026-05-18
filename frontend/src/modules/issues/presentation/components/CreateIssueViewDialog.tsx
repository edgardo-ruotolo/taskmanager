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
import { useCreateIssueView } from '../../application/use-issue-views';

const createIssueViewSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(200),
    description: z.string().optional(),
    isGlobal: z.boolean().optional(),
});

type CreateIssueViewFormData = z.infer<typeof createIssueViewSchema>;

interface CreateIssueViewDialogProps {
    workspaceSlug: string;
    trigger: React.ReactNode;
}

export const CreateIssueViewDialog = ({
    workspaceSlug,
    trigger,
}: CreateIssueViewDialogProps): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const { mutate, isPending } = useCreateIssueView(workspaceSlug);

    const form = useForm<CreateIssueViewFormData>({
        resolver: zodResolver(createIssueViewSchema),
        defaultValues: { name: '', description: '', isGlobal: false },
    });

    const onSubmit = (data: CreateIssueViewFormData): void => {
        mutate(data, {
            onSuccess: () => {
                form.reset({ name: '', description: '', isGlobal: false });
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Nueva Vista</DialogTitle>
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
                                            placeholder="Tareas abiertas, Alta prioridad..."
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
                                            placeholder="Descripción de la vista"
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
                            name="isGlobal"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                id="isGlobal"
                                                className="w-4 h-4 rounded border-subtle bg-layer-1 accent-blue-600"
                                                checked={field.value ?? false}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel
                                            htmlFor="isGlobal"
                                            className="text-secondary cursor-pointer"
                                        >
                                            Vista global (visible para todos los miembros)
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
                                {isPending ? 'Creando...' : 'Crear vista'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
