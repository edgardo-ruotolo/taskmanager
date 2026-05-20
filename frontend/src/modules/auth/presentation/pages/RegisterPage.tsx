import type React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { registerSchema, type RegisterFormData } from '../../application/schemas';
import { authRepository } from '../../infrastructure/auth-repository';
import { applyServerErrors } from '@/shared/lib/api-errors';
import { trackEvent } from '@/shared/lib/posthog';

export const RegisterPage = (): React.ReactElement => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            username: '',
            password: '',
            firstName: '',
            lastName: '',
        },
    });

    const onSubmit = async (data: RegisterFormData): Promise<void> => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await authRepository.register(data);
            trackEvent('signup', { method: 'email' });
            toast.success('Cuenta creada correctamente. Inicia sesión.');
            void navigate('/login');
        } catch (err) {
            if (!applyServerErrors(err, form.setError)) {
                let message = 'Error al crear la cuenta';
                if (axios.isAxiosError(err) && err.response?.data?.error) {
                    message = String(err.response.data.error);
                } else if (axios.isAxiosError(err) && err.response?.data?.message) {
                    message = String(err.response.data.message);
                }
                toast.error(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
            <Card className="w-full max-w-md bg-surface-1/50 backdrop-blur-md border-subtle">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary">TaskManager</CardTitle>
                    <CardDescription className="text-tertiary">
                        Crea tu cuenta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-secondary">Nombre</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Juan"
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
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-secondary">Apellido</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="García"
                                                    className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Usuario</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="juangarcia"
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
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Correo electrónico</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="tu@email.com"
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
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Contraseña</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                            </Button>
                        </form>
                    </Form>
                    <p className="mt-4 text-center text-sm text-tertiary">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-accent-primary hover:underline transition-colors">
                            Inicia sesión
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
