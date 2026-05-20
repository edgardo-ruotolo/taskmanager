import type React from 'react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft, SquareStack } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { resetPasswordSchema, type ResetPasswordFormData } from '../../application/schemas';
import { authRepository } from '../../infrastructure/auth-repository';
import { applyServerErrors } from '@/shared/lib/api-errors';

export const ResetPasswordPage = (): React.ReactElement => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    const email = searchParams.get('email');
    const token = searchParams.get('token');

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    });

    const onSubmit = async (data: ResetPasswordFormData): Promise<void> => {
        if (!email || !token) return;
        if (isLoading) return;

        setIsLoading(true);
        try {
            await authRepository.resetPassword({ email, token, newPassword: data.newPassword });
            toast.success('Contraseña restablecida correctamente');
            void navigate('/login');
        } catch (err) {
            if (!applyServerErrors(err, form.setError)) {
                let message = 'Error al restablecer la contraseña';
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

    if (!email || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
                <div className="w-full max-w-md animate-scale-in text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-layer-2 border border-subtle flex items-center justify-center mx-auto">
                        <span className="text-xl">⚠️</span>
                    </div>
                    <h2 className="text-primary font-semibold text-lg">
                        Enlace inválido
                    </h2>
                    <p className="text-placeholder text-sm">
                        Este enlace de restablecimiento es inválido o ha expirado. Solicita uno nuevo.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        Solicitar nuevo enlace
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
            <div className="w-full max-w-md animate-scale-in">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
                        <SquareStack size={16} className="text-on-color" aria-hidden="true" />
                    </div>
                    <span className="text-primary font-semibold text-base tracking-tight">
                        TaskManager
                    </span>
                </div>

                <Card className="bg-surface-2 border-subtle shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] transition-shadow duration-300">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl font-semibold text-primary">
                            Nueva contraseña
                        </CardTitle>
                        <CardDescription className="text-placeholder text-sm">
                            Ingresa tu nueva contraseña para {email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-primary text-sm font-medium">
                                                Nueva contraseña
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder focus:border-strong transition-colors"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-primary text-sm font-medium">
                                                Confirmar contraseña
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder focus:border-strong transition-colors"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full bg-accent-primary hover:bg-accent-primary-hover text-on-color transition-colors"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
                                </Button>
                            </form>
                        </Form>
                        <div className="mt-4 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-1.5 text-sm text-placeholder hover:text-primary transition-colors"
                            >
                                <ArrowLeft size={14} aria-hidden="true" />
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
