import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { createLabelSchema, type CreateLabelFormData } from '../../application/schemas';
import { useCreateLabel } from '../../application/use-labels';

interface CreateLabelDialogProps {
    workspaceSlug: string;
    trigger: React.ReactNode;
}

export const CreateLabelDialog = ({
    workspaceSlug,
    trigger,
}: CreateLabelDialogProps): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const { mutate, isPending } = useCreateLabel(workspaceSlug);

    const form = useForm<CreateLabelFormData>({
        resolver: zodResolver(createLabelSchema),
        defaultValues: { name: '', color: '#3b82f6' },
    });

    const onSubmit = (data: CreateLabelFormData): void => {
        mutate(data, {
            onSuccess: () => {
                form.reset({ name: '', color: '#3b82f6' });
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-primary">Nueva Etiqueta</DialogTitle>
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
                                        </div>
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
                                {isPending ? 'Creando...' : 'Crear etiqueta'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
