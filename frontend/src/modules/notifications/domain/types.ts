export interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    notificationType?: string;
    referenceId?: string;
}

export interface UserNotificationPreference {
    id: string;
    notificationType: string;
    property: string;
    emailNotification: boolean;
}

export interface UpsertNotificationPreferenceData {
    notificationType: string;
    property: string;
    emailNotification: boolean;
}
