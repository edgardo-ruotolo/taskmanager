import type React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    useSlackStatus,
    useConnectSlack,
    useDisconnectSlack,
    useTestSlackMessage,
} from '../../application/use-integrations';

interface SlackIntegrationPanelProps {
    workspaceSlug: string;
}

function StatusBadge({ isConnected, teamName }: { isConnected: boolean; teamName?: string }): React.ReactElement {
    if (isConnected) {
        return (
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                Conectado{teamName ? ` a ${teamName}` : ''}
            </Badge>
        );
    }
    return (
        <Badge className="bg-surface-1/50 text-secondary border border-subtle font-medium">
            No conectado
        </Badge>
    );
}

// Slack SVG icon — lucide-react no incluye Slack
function SlackIcon({ size = 18 }: { size?: number }): React.ReactElement {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
        </svg>
    );
}

export const SlackIntegrationPanel = ({ workspaceSlug }: SlackIntegrationPanelProps): React.ReactElement => {
    const { data: status, isLoading: loadingStatus } = useSlackStatus(workspaceSlug);

    const connectMutation = useConnectSlack(workspaceSlug);
    const disconnectMutation = useDisconnectSlack(workspaceSlug);
    const testMessageMutation = useTestSlackMessage(workspaceSlug);

    const isConnected = status?.isConnected ?? false;

    const handleConnect = (): void => {
        connectMutation.mutate('');
    };

    return (
        <div className="space-y-5">
            {/* Header row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-layer-2 border border-subtle">
                        <SlackIcon size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-primary">Slack</p>
                        <p className="text-xs text-placeholder">
                            Recibe notificaciones de issues y actividad en tus canales de Slack
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {loadingStatus ? (
                        <Skeleton className="h-6 w-24" />
                    ) : (
                        <StatusBadge isConnected={isConnected} teamName={status?.teamName} />
                    )}
                    {isConnected ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-red-900/50 text-red-400 hover:bg-red-950/20 hover:border-red-800"
                            onClick={() => disconnectMutation.mutate()}
                            disabled={disconnectMutation.isPending}
                        >
                            {disconnectMutation.isPending ? 'Desconectando...' : 'Desconectar'}
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="bg-[#4A154B] hover:bg-[#3d1140] text-white gap-1.5"
                            onClick={handleConnect}
                            disabled={connectMutation.isPending}
                        >
                            <SlackIcon size={14} />
                            {connectMutation.isPending ? 'Conectando...' : 'Conectar con Slack'}
                        </Button>
                    )}
                </div>
            </div>

            <Separator className="bg-subtle" />

            {/* Connection details */}
            <div className="space-y-3">
                {isConnected && status?.channel && (
                    <div className="flex items-center gap-2 text-sm text-secondary">
                        <MessageSquare size={14} className="text-placeholder shrink-0" aria-hidden="true" />
                        <span>Canal: <span className="text-primary font-medium">{status.channel}</span></span>
                    </div>
                )}

                {isConnected ? (
                    <div className="flex flex-col gap-3 p-4 rounded-lg border border-subtle bg-layer-1/30">
                        <p className="text-sm text-secondary">
                            La integración de Slack está activa. Las notificaciones se enviarán al canal configurado.
                        </p>
                        <div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-subtle text-secondary hover:text-primary gap-1.5"
                                onClick={() => testMessageMutation.mutate()}
                                disabled={testMessageMutation.isPending}
                            >
                                <Send size={13} aria-hidden="true" />
                                {testMessageMutation.isPending ? 'Enviando...' : 'Enviar mensaje de prueba'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-subtle text-center text-placeholder">
                        <SlackIcon size={20} />
                        <p className="text-xs mt-2">
                            Conecta Slack para recibir notificaciones en tu espacio de trabajo.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
