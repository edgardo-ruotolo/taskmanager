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
import { toast } from 'sonner';
import { useCreateApiToken } from '../../application/use-api-tokens';
import type { CreateApiTokenResponse } from '../../domain/types';

const createApiTokenSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(200),
    expiresAt: z.string().optional(),
});

type CreateApiTokenFormData = z.infer<typeof createApiTokenSchema>;

interface CreateApiTokenDialogProps {
    trigger: React.ReactNode;
    onCreated: (response: CreateApiTokenResponse) => void;
}

export const CreateApiTokenDialog = ({
    trigger,
    onCreated,
}: CreateApiTokenDialogProps): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const { mutate, isPending } = useCreateApiToken();

    const form = useForm<CreateApiTokenFormData>({
        resolver: zodResolver(createApiTokenSchema),
        defaultValues: { name: '', expiresAt: '' },
    });

    const onSubmit = (data: CreateApiTokenFormData): void => {
        const payload = {
            name: data.name,
            expiresAt: data.expiresAt || undefined,
        };
        mutate(payload, {
            onSuccess: (response) => {
                form.reset({ name: '', expiresAt: '' });
                setOpen(false);
                onCreated(response);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Nuevo Token de API</DialogTitle>
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
                                            placeholder="Mi token de producción"
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
                            name="expiresAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">
                                        Fecha de expiración{' '}
                                        <span className="text-placeholder">(opcional)</span>
                                    </FormLabel>
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
                                {isPending ? 'Generando...' : 'Generar token'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

interface TokenRevealDialogProps {
    tokenResponse: CreateApiTokenResponse | null;
    onClose: () => void;
}

export const TokenRevealDialog = ({
    tokenResponse,
    onClose,
}: TokenRevealDialogProps): React.ReactElement => {
    const handleCopy = (): void => {
        if (!tokenResponse) return;
        void navigator.clipboard.writeText(tokenResponse.token).then(() => {
            toast.success('Token copiado al portapapeles');
        });
    };

    return (
        <Dialog open={tokenResponse !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-primary">Token generado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-start gap-2 p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg">
                        <span className="text-amber-400 text-sm font-medium">
                            Guarda este token ahora. No podrás verlo de nuevo.
                        </span>
                    </div>
                    {tokenResponse && (
                        <div className="space-y-2">
                            <p className="text-xs text-placeholder uppercase tracking-wider">
                                Token de API
                            </p>
                            <code className="block w-full p-3 bg-layer-1 border border-subtle rounded-lg text-sm text-green-400 font-mono break-all">
                                {tokenResponse.token}
                            </code>
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCopy}
                            className="border-subtle text-secondary hover:text-primary"
                        >
                            Copiar token
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                        >
                            Entendido
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
