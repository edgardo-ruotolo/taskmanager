import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationRepository } from '../infrastructure/notification-repository';
import type { UpsertNotificationPreferenceData } from '../domain/types';

export const notificationsKey = ['notifications'] as const;

export const useNotifications = () =>
    useQuery({
        queryKey: notificationsKey,
        queryFn: () => notificationRepository.getMyNotifications(),
    });

export const useMarkAsRead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => notificationRepository.markAsRead(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: notificationsKey });
        },
        onError: () => toast.error('Error al marcar la notificación'),
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
        onError: () => toast.error('Error al marcar las notificaciones'),
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
        onError: () => toast.error('Error al guardar las preferencias'),
    });
};
