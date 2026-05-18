import { apiClient } from '@/shared/lib/api-client';
import type { Webhook, WebhookLog, CreateWebhookData } from '../domain/types';

export const webhookRepository = {
    getAll: (workspaceSlug: string): Promise<Webhook[]> =>
        apiClient
            .get<Webhook[]>(`/api/workspaces/${workspaceSlug}/webhooks`)
            .then((r) => r.data),

    create: (workspaceSlug: string, data: CreateWebhookData): Promise<Webhook> =>
        apiClient
            .post<Webhook>(`/api/workspaces/${workspaceSlug}/webhooks`, data)
            .then((r) => r.data),

    delete: (workspaceSlug: string, id: string): Promise<void> =>
        apiClient
            .delete(`/api/workspaces/${workspaceSlug}/webhooks/${id}`)
            .then(() => undefined),

    getLogs: (workspaceSlug: string, id: string): Promise<WebhookLog[]> =>
        apiClient
            .get<WebhookLog[]>(`/api/workspaces/${workspaceSlug}/webhooks/${id}/logs`)
            .then((r) => r.data),
};
