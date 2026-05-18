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
import { useCompanyStates } from '@/modules/states/application/use-states';
import { PRIORITY_LABELS } from '../../domain/types';
import { createIssueSchema, type CreateIssueFormData } from '../../application/schemas';
import { useCreateIssue } from '../../application/use-issues';

interface CreateIssueDialogProps {
    workspaceSlug: string;
    companyId: string;
    trigger: React.ReactNode;
}

export const CreateIssueDialog = ({
    workspaceSlug,
    companyId,
    trigger,
}: CreateIssueDialogProps): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const { mutate, isPending } = useCreateIssue(workspaceSlug, companyId);
    const { data: states = [] } = useCompanyStates(workspaceSlug, companyId);

    const form = useForm<CreateIssueFormData>({
        resolver: zodResolver(createIssueSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: 0,
            stateId: '',
            dueDate: '',
        },
    });

    const onSubmit = (data: CreateIssueFormData): void => {
        mutate(
            {
                ...data,
                description: data.description || undefined,
                dueDate: data.dueDate || undefined,
                assigneeId: data.assigneeId || undefined,
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
            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-primary">Nueva Tarea</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Título</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Título de la tarea..."
                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="stateId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Estado</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-layer-1 border-subtle text-primary">
                                                    <SelectValue placeholder="Seleccionar..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-layer-1 border-subtle">
                                                {states.map((state) => (
                                                    <SelectItem
                                                        key={state.id}
                                                        value={state.id}
                                                        className="text-primary focus:bg-layer-2"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                                style={{ backgroundColor: state.color }}
                                                                aria-hidden="true"
                                                            />
                                                            {state.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Prioridad</FormLabel>
                                        <Select
                                            onValueChange={(v) => field.onChange(Number(v))}
                                            value={String(field.value)}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-layer-1 border-subtle text-primary">
                                                    <SelectValue placeholder="Seleccionar..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-layer-1 border-subtle">
                                                {([0, 1, 2, 3, 4] as const).map((p) => (
                                                    <SelectItem
                                                        key={p}
                                                        value={String(p)}
                                                        className="text-primary focus:bg-layer-2"
                                                    >
                                                        {PRIORITY_LABELS[p]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Descripción (opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descripción de la tarea..."
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
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Fecha límite (opcional)</FormLabel>
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
                                {isPending ? 'Creando...' : 'Crear tarea'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
