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
    cloudinaryCloudName: z.string().optional(),
    cloudinaryApiKey: z.string().optional(),
    cloudinaryApiSecret: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const GodModeStoragePage = (): React.ReactElement => {
    const { mutate: updateConfig, isPending } = useUpdateInstanceConfig();
    const [apiKeyVisible, setApiKeyVisible] = useState(false);
    const [apiSecretVisible, setApiSecretVisible] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            cloudinaryCloudName: '',
            cloudinaryApiKey: '',
            cloudinaryApiSecret: '',
        },
    });

    const onSubmit = (data: FormData): void => {
        const payload: UpdateInstanceConfigData = {
            cloudinaryCloudName: data.cloudinaryCloudName || undefined,
            cloudinaryApiKey: data.cloudinaryApiKey || undefined,
            cloudinaryApiSecret: data.cloudinaryApiSecret || undefined,
        };
        updateConfig(payload);
    };

    return (
        <div className="max-w-lg">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-primary">Almacenamiento</h2>
                <p className="text-sm text-secondary mt-1">
                    Configura Cloudinary para el almacenamiento de imágenes y archivos adjuntos.
                </p>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-subtle border border-accent-subtle mb-6">
                <Info size={15} className="text-accent-primary mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                    <p className="text-sm font-medium text-accent-primary">Cloudinary</p>
                    <p className="text-xs text-secondary mt-0.5">
                        Obtén tus credenciales en{' '}
                        <span className="text-accent-primary underline cursor-pointer">cloudinary.com/console</span>.
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="cloudinaryCloudName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary text-sm font-medium">Nombre del Cloud</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="mi-cloud"
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
                        name="cloudinaryApiKey"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary text-sm font-medium">Clave API</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={apiKeyVisible ? 'text' : 'password'}
                                            className="bg-surface-1 border-subtle text-primary pr-10"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setApiKeyVisible((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
                                            aria-label={apiKeyVisible ? 'Ocultar API key' : 'Mostrar API key'}
                                        >
                                            {apiKeyVisible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-danger-primary" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="cloudinaryApiSecret"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary text-sm font-medium">Secreto API</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={apiSecretVisible ? 'text' : 'password'}
                                            className="bg-surface-1 border-subtle text-primary pr-10"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setApiSecretVisible((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
                                            aria-label={apiSecretVisible ? 'Ocultar API secret' : 'Mostrar API secret'}
                                        >
                                            {apiSecretVisible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
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
