import type React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
    const [magicEmail, setMagicEmail] = useState('');
    const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
    const [isOAuthLoading, setIsOAuthLoading] = useState<'google' | 'github' | null>(null);

    const isMagicEmailValid = magicEmail.includes('@') && magicEmail.includes('.');

    const handleSendMagicLink = async (): Promise<void> => {
        if (!isMagicEmailValid) return;
        setIsSendingMagicLink(true);
        try {
            await authRepository.sendMagicLink(magicEmail);
            toast.success('Si el email está registrado, recibirás un enlace de acceso.');
            setMagicEmail('');
        } catch {
            toast.error('Error al enviar el enlace. Intenta de nuevo.');
        } finally {
            setIsSendingMagicLink(false);
        }
    };

    const handleOAuth = async (provider: 'google' | 'github'): Promise<void> => {
        setIsOAuthLoading(provider);
        try {
            const result = await authRepository.getOAuthUrl(provider);
            toast.info(result.message || 'OAuth no está configurado en este servidor.');
        } catch {
            toast.info('OAuth no está disponible en este momento.');
        } finally {
            setIsOAuthLoading(null);
        }
    };

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

                    {/* Separator */}
                    <div className="flex items-center gap-3 my-2">
                        <Separator className="flex-1 bg-subtle" />
                        <span className="text-xs text-placeholder font-medium">O</span>
                        <Separator className="flex-1 bg-subtle" />
                    </div>

                    {/* Magic link section */}
                    <div className="flex flex-col gap-3">
                        <p className="text-xs text-secondary text-center font-medium">
                            Accede con un enlace de un solo uso
                        </p>
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                value={magicEmail}
                                onChange={(e) => setMagicEmail(e.target.value)}
                                placeholder="nombre@empresa.com"
                                className="bg-surface-1 border-subtle text-primary placeholder:text-placeholder focus-visible:border-accent-primary focus-visible:ring-0 flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') void handleSendMagicLink();
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSendingMagicLink || !isMagicEmailValid}
                                onClick={() => void handleSendMagicLink()}
                                className="border-subtle text-secondary hover:text-primary hover:bg-layer-1 shrink-0"
                            >
                                {isSendingMagicLink ? 'Enviando...' : 'Enviar enlace'}
                            </Button>
                        </div>
                    </div>

                    {/* OAuth buttons */}
                    <div className="flex flex-col gap-2 mt-1">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isOAuthLoading !== null}
                            onClick={() => void handleOAuth('google')}
                            className="w-full border-subtle text-secondary hover:text-primary hover:bg-layer-1 gap-2"
                        >
                            {/* Simple Google icon */}
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className="w-4 h-4 shrink-0"
                            >
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            {isOAuthLoading === 'google' ? 'Conectando...' : 'Continuar con Google'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isOAuthLoading !== null}
                            onClick={() => void handleOAuth('github')}
                            className="w-full border-subtle text-secondary hover:text-primary hover:bg-layer-1 gap-2"
                        >
                            {/* GitHub icon */}
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className="w-4 h-4 shrink-0 fill-current"
                            >
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            {isOAuthLoading === 'github' ? 'Conectando...' : 'Continuar con GitHub'}
                        </Button>
                    </div>
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
