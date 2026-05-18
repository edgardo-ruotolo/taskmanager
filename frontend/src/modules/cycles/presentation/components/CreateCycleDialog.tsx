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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createCycleSchema, type CreateCycleFormData } from '../../application/schemas';
import { useCreateCycle } from '../../application/use-cycles';

interface CreateCycleDialogProps {
    workspaceSlug: string;
    companyId: string;
    trigger: React.ReactNode;
}

export const CreateCycleDialog = ({
    workspaceSlug,
    companyId,
    trigger,
}: CreateCycleDialogProps): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const { mutate, isPending } = useCreateCycle(workspaceSlug, companyId);

    const form = useForm<CreateCycleFormData>({
        resolver: zodResolver(createCycleSchema),
        defaultValues: { name: '', description: '', startDate: '', endDate: '' },
    });

    const onSubmit = (data: CreateCycleFormData): void => {
        const payload = {
            name: data.name,
            description: data.description || undefined,
            startDate: data.startDate || undefined,
            endDate: data.endDate || undefined,
        };
        mutate(payload, {
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Nuevo Ciclo</DialogTitle>
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
                                {isPending ? 'Creando...' : 'Crear ciclo'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
