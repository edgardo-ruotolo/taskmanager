import type React from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useInstanceConfig, useUpdateInstanceConfig } from '../../application/use-admin';
import type { UpdateInstanceConfigData } from '../../domain/types';

const schema = z.object({
    instanceName: z.string().min(1, 'El nombre es obligatorio'),
    adminEmail: z.string().email('Email inválido').optional().or(z.literal('')),
    isSignUpEnabled: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export const GodModeGeneralPage = (): React.ReactElement => {
    const { data: config, isLoading } = useInstanceConfig();
    const { mutate: updateConfig, isPending } = useUpdateInstanceConfig();

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            instanceName: '',
            adminEmail: '',
            isSignUpEnabled: true,
        },
    });

    useEffect(() => {
        if (config) {
            form.reset({
                instanceName: config.instanceName,
                adminEmail: config.adminEmail ?? '',
                isSignUpEnabled: config.isSignUpEnabled,
            });
        }
    }, [config, form]);

    const onSubmit = (data: FormData): void => {
        const payload: UpdateInstanceConfigData = {
            instanceName: data.instanceName,
            adminEmail: data.adminEmail || undefined,
            isSignUpEnabled: data.isSignUpEnabled,
        };
        updateConfig(payload);
    };

    if (isLoading) {
        return (
            <div className="space-y-4 max-w-lg">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
            </div>
        );
    }

    return (
        <div className="max-w-lg">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-primary">General</h2>
                <p className="text-sm text-secondary mt-1">Configuración general de la instancia de TaskManager.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="instanceName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary text-sm font-medium">
                                    Nombre de instancia
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        className="bg-surface-1 border-subtle text-primary placeholder:text-placeholder"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-danger-primary" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="adminEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary text-sm font-medium">
                                    Correo de administrador{' '}
                                    <span className="text-tertiary font-normal">(opcional)</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        className="bg-surface-1 border-subtle text-primary placeholder:text-placeholder"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-danger-primary" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isSignUpEnabled"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between rounded-lg border border-subtle p-4 bg-layer-1">
                                    <div>
                                        <FormLabel className="text-primary text-sm font-medium cursor-pointer">
                                            Registro habilitado
                                        </FormLabel>
                                        <p className="text-xs text-tertiary mt-0.5">
                                            Permite que nuevos usuarios creen cuentas.
                                        </p>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </div>
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
