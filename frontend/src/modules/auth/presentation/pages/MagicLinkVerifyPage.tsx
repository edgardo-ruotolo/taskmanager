import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authRepository } from '../../infrastructure/auth-repository';
import { setAuthSession } from '../../application/use-auth-me';

type State = 'verifying' | 'error';

export const MagicLinkVerifyPage = (): React.ReactElement => {
    const { token = '' } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [state, setState] = useState<State>('verifying');

    useEffect(() => {
        if (!token) {
            setState('error');
            return;
        }

        let cancelled = false;

        const verify = async (): Promise<void> => {
            try {
                const user = await authRepository.verifyMagicLink(token);
                if (cancelled) return;
                setAuthSession(user);
                void navigate('/', { replace: true });
            } catch {
                if (!cancelled) setState('error');
            }
        };

        void verify();

        return () => {
            cancelled = true;
        };
    }, [token, navigate]);

    if (state === 'verifying') {
        return (
            <div className="min-h-screen bg-surface-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 size={32} className="animate-spin text-accent-primary" />
                    <p className="text-sm text-secondary">Verificando enlace de acceso...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-1 flex items-center justify-center px-4">
            <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                    <ShieldAlert size={24} className="text-red-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-primary mb-2">Enlace inválido</h1>
                    <p className="text-sm text-secondary">
                        El enlace es inválido o ha expirado. Solicita uno nuevo desde la página de inicio de sesión.
                    </p>
                </div>
                <Button
                    asChild
                    className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                >
                    <Link to="/login">Ir al inicio de sesión</Link>
                </Button>
            </div>
        </div>
    );
};
