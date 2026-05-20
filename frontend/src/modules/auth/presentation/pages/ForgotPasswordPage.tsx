import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft, SquareStack } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../application/schemas';
import { authRepository } from '../../infrastructure/auth-repository';
import { applyServerErrors } from '@/shared/lib/api-errors';

export const ForgotPasswordPage = (): React.ReactElement => {
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = async (data: ForgotPasswordFormData): Promise<void> => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await authRepository.forgotPassword(data.email);
            setSubmitted(true);
        } catch (err) {
            if (!applyServerErrors(err, form.setError)) {
                let message = 'Error al enviar el correo';
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
                            Recuperar contraseña
                        </CardTitle>
                        <CardDescription className="text-placeholder text-sm">
                            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submitted ? (
                            <div className="text-center py-4 space-y-3">
                                <div className="w-12 h-12 rounded-full bg-layer-2 flex items-center justify-center mx-auto">
                                    <span className="text-2xl">✉️</span>
                                </div>
                                <p className="text-primary font-medium">
                                    Revisa tu correo
                                </p>
                                <p className="text-placeholder text-sm">
                                    Si existe una cuenta con ese email, recibirás las instrucciones para
                                    restablecer tu contraseña.
                                </p>
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-primary text-sm font-medium">
                                                    Correo electrónico
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="tu@email.com"
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
                                        {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
                                    </Button>
                                </form>
                            </Form>
                        )}
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
