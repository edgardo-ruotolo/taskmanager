import { apiClient } from '@/shared/lib/api-client';
import type {
    Notification,
    UserNotificationPreference,
    UpsertNotificationPreferenceData,
    UserNotificationSettings,
    UpdateUserNotificationSettings,
} from '../domain/types';

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

    getMyPreferences: (): Promise<UserNotificationPreference[]> =>
        apiClient.get<UserNotificationPreference[]>('/api/notifications/preferences').then((r) => r.data),

    upsertMyPreferences: (data: UpsertNotificationPreferenceData[]): Promise<UserNotificationPreference[]> =>
        apiClient.put<UserNotificationPreference[]>('/api/notifications/preferences', data).then((r) => r.data),

    getMyNotificationSettings: (): Promise<UserNotificationSettings> =>
        apiClient.get<UserNotificationSettings>('/api/notifications/preferences/settings').then((r) => r.data),

    updateMyNotificationSettings: (data: UpdateUserNotificationSettings): Promise<UserNotificationSettings> =>
        apiClient.put<UserNotificationSettings>('/api/notifications/preferences/settings', data).then((r) => r.data),
};
