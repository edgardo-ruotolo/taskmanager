import { apiClient } from '@/shared/lib/api-client';
import type { Notification, UserNotificationPreference, UpsertNotificationPreferenceData } from '../domain/types';

export const notificationRepository = {
    getMyNotifications: (): Promise<Notification[]> =>
        apiClient.get<Notification[]>('/api/notifications').then((r) => r.data),

    markAsRead: (id: string): Promise<void> =>
        apiClient.patch(`/api/notifications/${id}/read`).then(() => undefined),

    markAllAsRead: (): Promise<void> =>
        apiClient.patch('/api/notifications/read-all').then(() => undefined),

    getPreferences: (): Promise<UserNotificationPreference[]> =>
        apiClient.get<UserNotificationPreference[]>('/api/notifications/preferences').then((r) => r.data),

    upsertPreferences: (data: UpsertNotificationPreferenceData[]): Promise<UserNotificationPreference[]> =>
        apiClient.put<UserNotificationPreference[]>('/api/notifications/preferences', data).then((r) => r.data),
};
