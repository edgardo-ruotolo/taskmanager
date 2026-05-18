import type React from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Webhook, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWebhooks, useDeleteWebhook } from '../../application/use-webhooks';
import { CreateWebhookDialog } from '../components/CreateWebhookDialog';

export const WebhooksPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();

    const { data: webhooks, isLoading } = useWebhooks(workspaceSlug);
    const { mutate: deleteWebhook, isPending: isDeleting } = useDeleteWebhook(workspaceSlug);

    const items = webhooks ?? [];

    return (
        <div className="p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-xs text-placeholder uppercase tracking-wider mb-1">
                            {workspaceSlug}
                        </p>
                        <h1 className="text-2xl font-bold text-primary">Webhooks</h1>
                    </div>
                    <CreateWebhookDialog
                        workspaceSlug={workspaceSlug}
                        trigger={
                            <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                <Plus size={16} />
                                Agregar webhook
                            </Button>
                        }
                    />
                </div>

                {isLoading && (
                    <div className="space-y-2">
                        {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                            <div
                                key={k}
                                className="flex items-center gap-3 p-4 bg-surface-1/50 border border-subtle rounded-lg"
                            >
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-40 bg-layer-1" />
                                    <Skeleton className="h-3 w-64 bg-layer-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Webhook size={48} className="text-placeholder mb-4" />
                        <h2 className="text-lg font-medium text-secondary mb-2">
                            No hay webhooks aún
                        </h2>
                        <p className="text-sm text-placeholder mb-6">
                            Crea webhooks para recibir notificaciones en servicios externos
                        </p>
                        <CreateWebhookDialog
                            workspaceSlug={workspaceSlug}
                            trigger={
                                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                    <Plus size={16} />
                                    Crear primer webhook
                                </Button>
                            }
                        />
                    </div>
                )}

                {!isLoading && items.length > 0 && (
                    <div className="space-y-2">
                        {items.map((webhook) => (
                            <div
                                key={webhook.id}
                                className="flex items-center justify-between gap-3 p-4 bg-surface-1/50 border border-subtle rounded-lg hover:border-strong transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-primary">
                                            {webhook.name}
                                        </span>
                                        <Badge
                                            variant={webhook.isActive ? 'default' : 'secondary'}
                                            className={
                                                webhook.isActive
                                                    ? 'bg-green-900/50 text-green-400 border-green-800 text-xs'
                                                    : 'bg-layer-1 text-tertiary text-xs'
                                            }
                                        >
                                            {webhook.isActive ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-placeholder font-mono truncate">
                                        {webhook.url}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => deleteWebhook(webhook.id)}
                                    className="text-placeholder hover:text-red-400 transition-colors shrink-0"
                                    aria-label={`Eliminar webhook ${webhook.name}`}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
