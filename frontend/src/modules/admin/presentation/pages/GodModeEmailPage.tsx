import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Info } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUpdateInstanceConfig } from '../../application/use-admin';
import type { UpdateInstanceConfigData } from '../../domain/types';

const schema = z.object({
    brevoApiKey: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const GodModeEmailPage = (): React.ReactElement => {
    const { mutate: updateConfig, isPending } = useUpdateInstanceConfig();
    const [visible, setVisible] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { brevoApiKey: '' },
    });

    const onSubmit = (data: FormData): void => {
        const payload: UpdateInstanceConfigData = {
            brevoApiKey: data.brevoApiKey || undefined,
        };
        updateConfig(payload);
    };

    return (
        <div className="max-w-lg">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-primary">Correo electrónico</h2>
                <p className="text-sm text-secondary mt-1">
                    Configura el proveedor de email transaccional para notificaciones y recuperación de contraseña.
                </p>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-subtle border border-accent-subtle mb-6">
                <Info size={15} className="text-accent-primary mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                    <p className="text-sm font-medium text-accent-primary">Brevo (Sendinblue)</p>
                    <p className="text-xs text-secondary mt-0.5">
                        TaskManager usa Brevo para envío de emails. Obtén tu API key en{' '}
                        <span className="text-accent-primary underline cursor-pointer">app.brevo.com</span>.
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="brevoApiKey"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary text-sm font-medium">
                                    Clave API de Brevo
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={visible ? 'text' : 'password'}
                                            placeholder="xkeysib-..."
                                            className="bg-surface-1 border-subtle text-primary placeholder:text-placeholder pr-10"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setVisible((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
                                            aria-label={visible ? 'Ocultar API key' : 'Mostrar API key'}
                                        >
                                            {visible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-danger-primary" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-accent-primary text-on-color hover:bg-accent-primary-hover"
                    >
                        {isPending ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                </form>
            </Form>
        </div>
    );
};
