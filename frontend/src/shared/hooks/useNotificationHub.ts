import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/modules/auth/application/auth-store';
import { useSignalRConnection } from './useSignalRConnection';

export const useNotificationHub = (): void => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const queryClient = useQueryClient();
    const { connection } = useSignalRConnection('/hubs/notifications', isAuthenticated);

    useEffect(() => {
        if (!connection) return;

        const handler = (): void => {
            void queryClient.invalidateQueries({ queryKey: ['notifications'] });
        };

        connection.on('ReceiveNotification', handler);

        return () => {
            connection.off('ReceiveNotification', handler);
        };
    }, [connection, queryClient]);
};
