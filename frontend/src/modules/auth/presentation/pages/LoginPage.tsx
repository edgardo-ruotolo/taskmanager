import type React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Eye, EyeOff, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eyebrow } from '@/components/ui/eyebrow';
import { authRepository } from '../../infrastructure/auth-repository';
import { setAuthSession } from '../../application/use-auth-me';
import { identifyUser, trackEvent } from '@/shared/lib/posthog';

export const LoginPage = (): React.ReactElement => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'email' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isOAuthLoading, setIsOAuthLoading] = useState<'google' | 'github' | null>(null);

    const isEmailValid = email.includes('@') && email.includes('.');

    const handleBack = (): void => {
        setStep('email');
        setPassword('');
        setShowPassword(false);
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

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (isLoading) return;
        if (step === 'email') {
            if (!isEmailValid) return;
            setStep('password');
            return;
        }
        if (!password) return;
        setIsLoading(true);
        try {
            const user = await authRepository.login({ email, password });
            setAuthSession(user);
            identifyUser(user.id, { email: user.email });
            trackEvent('login');
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
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            {/* Left — brand panel (hidden on mobile to maximize form space) */}
            <div
                className="hidden md:flex flex-col justify-between px-6 lg:px-14 py-12 relative overflow-hidden"
                style={{ background: 'var(--neutral-1200)', color: 'var(--text-on-dark)' }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-[26px] h-[26px] rounded-md flex items-center justify-center text-[11px] font-bold"
                        style={{ background: 'var(--brand-700)', color: 'var(--text-on-dark)' }}
                    >
                        A
                    </div>
                    <span className="text-[18px] font-semibold tracking-[-0.04em]">Atlas</span>
                </div>

                {/* Headline */}
                <div>
                    <h2 className="font-medium leading-[0.95] tracking-[-0.05em] text-[44px] lg:text-[64px]">
                        El trabajo<br />
                        de tu equipo,<br />
                        <span
                            className="font-serif italic font-normal"
                            style={{ color: 'var(--brand-700)' }}
                        >
                            en orden.
                        </span>
                    </h2>
                    <p
                        className="mt-7 text-sm leading-[1.55] max-w-[360px]"
                        style={{ color: 'var(--text-on-dark-soft)' }}
                    >
                        Issues, ciclos, módulos, páginas. Una sola superficie para que ingeniería y
                        operaciones hablen el mismo idioma.
                    </p>
                </div>

                {/* Footer row */}
                <div className="flex justify-between items-center">
                    <span
                        className="font-mono text-[10.5px] tracking-[0.18em] uppercase"
                        style={{ color: 'var(--text-on-dark-muted)' }}
                    >
                        v 4.2 · multi-workspace · SOC 2
                    </span>
                </div>

                {/* Decorative globe */}
                <svg
                    className="absolute right-[-180px] bottom-[-180px] opacity-[0.05] pointer-events-none"
                    width="520"
                    height="520"
                    viewBox="0 0 32 32"
                    fill="none"
                    aria-hidden="true"
                >
                    <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M5 16a11 11 0 0 1 22 0" stroke="currentColor" strokeWidth="0.5" />
                </svg>
            </div>

            {/* Right — form panel */}
            <div className="bg-canvas flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-10 md:py-12">
                <div className="max-w-[380px] mx-auto w-full">
                    <Eyebrow>Acceso</Eyebrow>
                    <h1 className="text-[44px] font-medium mt-2 mb-1 tracking-[-0.045em] leading-none text-primary">
                        Bienvenida.
                    </h1>
                    <p className="text-sm text-tertiary">
                        Continúa donde dejaste el ciclo.
                    </p>

                    {/* OAuth buttons */}
                    <div className="mt-8 flex flex-col gap-3.5">
                        <button
                            type="button"
                            disabled={isOAuthLoading !== null}
                            onClick={() => void handleOAuth('google')}
                            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-md text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: 'var(--bg-surface-2, #fff)',
                                border: '1px solid var(--neutral-400)',
                                color: 'var(--neutral-1200)',
                                fontFamily: 'inherit',
                                cursor: 'pointer',
                            }}
                        >
                            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {isOAuthLoading === 'google' ? 'Conectando...' : 'Continuar con Google'}
                        </button>

                        <button
                            type="button"
                            disabled={isOAuthLoading !== null}
                            onClick={() => void handleOAuth('github')}
                            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-md text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: 'var(--bg-surface-2, #fff)',
                                border: '1px solid var(--neutral-400)',
                                color: 'var(--neutral-1200)',
                                fontFamily: 'inherit',
                                cursor: 'pointer',
                            }}
                        >
                            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4 shrink-0" style={{ fill: 'var(--neutral-1200)' }}>
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            {isOAuthLoading === 'github' ? 'Conectando...' : 'Continuar con GitHub'}
                        </button>
                    </div>

                    {/* "O CON EMAIL" divider */}
                    <div
                        className="flex items-center gap-3 my-6 font-mono text-[11px] tracking-[0.1em]"
                        style={{ color: 'var(--neutral-600)' }}
                    >
                        <span className="flex-1 h-px" style={{ background: 'var(--neutral-400)' }} />
                        O CON EMAIL
                        <span className="flex-1 h-px" style={{ background: 'var(--neutral-400)' }} />
                    </div>

                    {/* Email + password form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                        {/* Email */}
                        <label htmlFor="email" className="block">
                            <Eyebrow>Email</Eyebrow>
                            {step === 'email' ? (
                                <Input
                                    id="email"
                                    type="email"
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="marina.ruiz@empresa.com"
                                    className="mt-1.5 font-mono border-subtle text-primary placeholder:text-tertiary focus-visible:ring-0"
                                    style={{ background: '#fff' }}
                                />
                            ) : (
                                <div className="relative mt-1.5">
                                    <Input
                                        id="email"
                                        type="email"
                                        readOnly
                                        value={email}
                                        className="font-mono border-subtle text-secondary pr-9 cursor-default focus-visible:ring-0"
                                        style={{ background: 'var(--neutral-300)' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        aria-label="Cambiar email"
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </label>

                        {/* Password */}
                        {step === 'password' && (
                            <label htmlFor="password" className="block">
                                <div className="flex justify-between items-center">
                                    <Eyebrow>Contraseña</Eyebrow>
                                    <Link
                                        to="/forgot-password"
                                        className="font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase"
                                        style={{ color: 'var(--brand-900)' }}
                                    >
                                        Recuperar
                                    </Link>
                                </div>
                                <div className="relative mt-1.5">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoFocus
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="text-primary placeholder:text-tertiary pr-10 focus-visible:ring-4 focus-visible:outline-none"
                                        style={{
                                            background: '#fff',
                                            border: '1.5px solid var(--neutral-1200)',
                                            boxShadow: '0 0 0 4px rgba(217,119,87,0.12)',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </label>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full justify-center gap-2 mt-0.5 text-sm"
                            style={{
                                background: 'var(--neutral-1200)',
                                color: 'var(--text-on-dark)',
                                padding: '13px 16px',
                            }}
                            disabled={
                                isLoading ||
                                (step === 'email' && !isEmailValid) ||
                                (step === 'password' && !password)
                            }
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                            {!isLoading && <ArrowRight size={14} />}
                        </Button>
                    </form>

                    <p className="text-[13px] text-center mt-6 text-tertiary">
                        ¿No tienes cuenta?{' '}
                        <Link
                            to="/register"
                            className="font-medium underline underline-offset-[3px] text-primary"
                        >
                            Crear workspace
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
