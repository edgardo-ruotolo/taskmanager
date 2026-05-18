export interface Webhook {
    id: string;
    name: string;
    url: string;
    isActive: boolean;
    eventsJson?: string;
    workspaceId: string;
    createdAt: string;
}

export interface WebhookLog {
    id: string;
    webhookId: string;
    event: string;
    statusCode: number;
    responseBody?: string;
    createdAt: string;
}

export interface CreateWebhookData {
    name: string;
    url: string;
    eventsJson?: string;
}
