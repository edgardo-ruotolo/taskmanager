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
import { createWebhookSchema, type CreateWebhookFormData } from '../../application/schemas';
import { useCreateWebhook } from '../../application/use-webhooks';

interface CreateWebhookDialogProps {
    workspaceSlug: string;
    trigger: React.ReactNode;
}

export const CreateWebhookDialog = ({
    workspaceSlug,
    trigger,
}: CreateWebhookDialogProps): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const { mutate, isPending } = useCreateWebhook(workspaceSlug);

    const form = useForm<CreateWebhookFormData>({
        resolver: zodResolver(createWebhookSchema),
        defaultValues: { name: '', url: '' },
    });

    const onSubmit = (data: CreateWebhookFormData): void => {
        mutate(data, {
            onSuccess: () => {
                form.reset({ name: '', url: '' });
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Nuevo webhook</DialogTitle>
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
                                            placeholder="Mi webhook de notificaciones"
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
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://example.com/webhook"
                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
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
                                {isPending ? 'Creando...' : 'Crear webhook'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
