import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationRepository } from '../infrastructure/notification-repository';
import type { UpsertNotificationPreferenceData } from '../domain/types';

export const notificationsKey = ['notifications'] as const;

export const useNotifications = () =>
    useQuery({
        queryKey: notificationsKey,
        queryFn: () => notificationRepository.getMyNotifications(),
        // Real-time critical: notifications must always be fresh.
        staleTime: 0,
        refetchOnWindowFocus: true,
    });

export const useMarkAsRead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => notificationRepository.markAsRead(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: notificationsKey });
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al marcar la notificación'); },
    });
};

export const useMarkAllAsRead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => notificationRepository.markAllAsRead(),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: notificationsKey });
            toast.success('Todas las notificaciones marcadas como leídas');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al marcar las notificaciones'); },
    });
};

export const notificationPreferencesKey = ['notification-preferences'] as const;

export const useNotificationPreferences = () =>
    useQuery({
        queryKey: notificationPreferencesKey,
        queryFn: () => notificationRepository.getPreferences(),
    });

export const useUpsertNotificationPreferences = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: UpsertNotificationPreferenceData[]) =>
            notificationRepository.upsertPreferences(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: notificationPreferencesKey });
            toast.success('Preferencias guardadas');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al guardar las preferencias'); },
    });
};
