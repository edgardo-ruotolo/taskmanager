import type React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authRepository } from '../../infrastructure/auth-repository';
import { useAuthStore } from '../../application/auth-store';

const SOCIAL_PROOF = ['Zerodha', 'Sony', 'Dolby', 'Accenture'];

export const LoginPage = (): React.ReactElement => {
    const navigate = useNavigate();
    const setUser = useAuthStore((s) => s.setUser);
    const [step, setStep] = useState<'email' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isEmailValid = email.includes('@') && email.includes('.');

    const handleContinueEmail = (): void => {
        if (!isEmailValid) return;
        setStep('password');
    };

    const handleBack = (): void => {
        setStep('email');
        setPassword('');
        setShowPassword(false);
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (step === 'email') {
            handleContinueEmail();
            return;
        }
        if (!password) return;
        setIsLoading(true);
        try {
            const user = await authRepository.login({ email, password });
            setUser(user);
            toast.success('Sesión iniciada correctamente');
            void navigate('/');
        } catch (err) {
            let message = 'Error al iniciar sesión';
            if (axios.isAxiosError(err) && err.response?.data?.error) {
                message = String(err.response.data.error);
            }
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-1 flex flex-col">
            {/* Topbar */}
            <header className="flex items-center justify-between px-8 py-4">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-accent-primary flex items-center justify-center">
                        <span className="text-on-color text-[11px] font-bold">TM</span>
                    </div>
                    <span className="text-primary font-semibold text-sm">TaskManager</span>
                </div>
                <p className="text-secondary text-sm">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-accent-primary hover:underline font-medium">
                        Regístrate
                    </Link>
                </p>
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-[480px] flex flex-col gap-8">
                    {/* Heading */}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[32px] font-bold text-primary leading-tight tracking-tight">
                            Trabaja en todas las dimensiones.
                        </h1>
                        <p className="text-tertiary text-sm">
                            Bienvenido de nuevo a TaskManager.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Email field — always shown */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="email" className="text-primary text-sm font-medium">
                                Email
                            </label>
                            {step === 'email' ? (
                                <Input
                                    id="email"
                                    type="email"
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nombre@empresa.com"
                                    className="bg-surface-1 border-subtle text-primary placeholder:text-placeholder focus-visible:border-accent-primary focus-visible:ring-0"
                                />
                            ) : (
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        readOnly
                                        value={email}
                                        className="bg-layer-1 border-subtle text-primary pr-9 cursor-default focus-visible:ring-0 focus-visible:border-subtle"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        aria-label="Cambiar email"
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-placeholder hover:text-primary transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Password field — only in step 2 */}
                        {step === 'password' && (
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="password" className="text-primary text-sm font-medium">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoFocus
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Ingresa tu contraseña"
                                        className="bg-surface-1 border-subtle text-primary placeholder:text-placeholder focus-visible:border-accent-primary focus-visible:ring-0 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-placeholder hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-accent-primary hover:underline w-fit"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-accent-primary text-on-color hover:bg-accent-primary-hover transition-colors mt-1"
                            disabled={
                                isLoading ||
                                (step === 'email' && !isEmailValid) ||
                                (step === 'password' && !password)
                            }
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Continuar'}
                        </Button>

                        <p className="text-xs text-tertiary text-center">
                            Al continuar, aceptas nuestros{' '}
                            <span className="underline cursor-pointer">términos y condiciones</span>.
                        </p>
                    </form>
                </div>
            </main>

            {/* Social proof */}
            <footer className="px-8 pb-10 flex flex-col items-center gap-4">
                <p className="text-xs text-tertiary uppercase tracking-widest font-medium">
                    Usado por equipos de
                </p>
                <div className="flex items-center gap-8">
                    {SOCIAL_PROOF.map((name) => (
                        <span key={name} className="text-sm text-tertiary font-medium">
                            {name}
                        </span>
                    ))}
                </div>
            </footer>
        </div>
    );
};
