import type React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_UNAUTHORIZED_EVENT } from '@/shared/lib/api-client';
import { useSilentAuthRefresh } from '../../application/use-silent-auth-refresh';

interface AuthGateProps {
    children: React.ReactNode;
}

export const AuthGate = ({ children }: AuthGateProps): React.ReactElement => {
    const navigate = useNavigate();

    useEffect(() => {
        const handler = (): void => {
            void navigate('/login', { replace: true });
        };
        window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
        return () => { window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handler); };
    }, [navigate]);

    useSilentAuthRefresh();

    return <>{children}</>;
};
