import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { webhookRepository } from '../infrastructure/webhook-repository';
import type { CreateWebhookData } from '../domain/types';

export const webhooksKey = (workspaceSlug: string) =>
    ['webhooks', workspaceSlug] as const;

export const useWebhooks = (workspaceSlug: string) =>
    useQuery({
        queryKey: webhooksKey(workspaceSlug),
        queryFn: () => webhookRepository.getAll(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useCreateWebhook = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateWebhookData) =>
            webhookRepository.create(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: webhooksKey(workspaceSlug) });
            toast.success('Webhook creado');
        },
        onError: () => toast.error('Error al crear el webhook'),
    });
};

export const useDeleteWebhook = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => webhookRepository.delete(workspaceSlug, id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: webhooksKey(workspaceSlug) });
            toast.success('Webhook eliminado');
        },
        onError: () => toast.error('Error al eliminar el webhook'),
    });
};
