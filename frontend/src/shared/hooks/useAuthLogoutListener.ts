import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuthLogoutListener = (): void => {
    const navigate = useNavigate();

    useEffect(() => {
        const handler = (): void => {
            void navigate('/login', { replace: true });
        };

        window.addEventListener('auth:logout', handler);
        return () => {
            window.removeEventListener('auth:logout', handler);
        };
    }, [navigate]);
};
