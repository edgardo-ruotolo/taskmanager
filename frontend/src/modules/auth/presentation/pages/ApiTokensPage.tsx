import type React from 'react';
import { useState } from 'react';
import { Plus, KeyRound, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useApiTokens, useRevokeApiToken } from '../../application/use-api-tokens';
import { CreateApiTokenDialog, TokenRevealDialog } from '../components/CreateApiTokenDialog';
import type { CreateApiTokenResponse } from '../../domain/types';

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const ApiTokensPage = (): React.ReactElement => {
    const [createdToken, setCreatedToken] = useState<CreateApiTokenResponse | null>(null);

    const { data: tokens, isLoading } = useApiTokens();
    const { mutate: revokeToken, isPending: isRevoking } = useRevokeApiToken();

    const items = tokens ?? [];

    return (
        <div className="p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Tokens de API</h1>
                        <p className="text-sm text-placeholder mt-1">
                            Tokens de acceso personal para autenticarte con la API
                        </p>
                    </div>
                    <CreateApiTokenDialog
                        onCreated={(response) => setCreatedToken(response)}
                        trigger={
                            <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                <Plus size={16} />
                                Generar Token
                            </Button>
                        }
                    />
                </div>

                <TokenRevealDialog
                    tokenResponse={createdToken}
                    onClose={() => setCreatedToken(null)}
                />

                {isLoading && (
                    <div className="space-y-2">
                        {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                            <div
                                key={k}
                                className="flex items-center gap-3 p-4 bg-surface-1/50 border border-subtle rounded-lg"
                            >
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-40 bg-layer-1" />
                                    <Skeleton className="h-3 w-32 bg-layer-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <KeyRound size={48} className="text-placeholder mb-4" />
                        <h2 className="text-lg font-medium text-secondary mb-2">
                            No tienes tokens de API
                        </h2>
                        <p className="text-sm text-placeholder mb-6">
                            Genera tokens para autenticarte con la API desde aplicaciones externas
                        </p>
                        <CreateApiTokenDialog
                            onCreated={(response) => setCreatedToken(response)}
                            trigger={
                                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                    <Plus size={16} />
                                    Generar primer token
                                </Button>
                            }
                        />
                    </div>
                )}

                {!isLoading && items.length > 0 && (
                    <div className="space-y-2">
                        {items.map((token) => (
                            <div
                                key={token.id}
                                className="flex items-center justify-between gap-3 p-4 bg-surface-1/50 border border-subtle rounded-lg hover:border-strong transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-primary">
                                            {token.name}
                                        </span>
                                        <code className="text-xs text-tertiary font-mono bg-layer-1/50 px-1.5 py-0.5 rounded">
                                            {token.tokenPrefix}...
                                        </code>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-placeholder">
                                        <span>Creado: {formatDate(token.createdAt)}</span>
                                        {token.expiresAt ? (
                                            <span>Expira: {formatDate(token.expiresAt)}</span>
                                        ) : (
                                            <span>Sin expiración</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={isRevoking}
                                    onClick={() => revokeToken(token.id)}
                                    className="text-placeholder hover:text-red-400 transition-colors shrink-0 flex items-center gap-1 text-xs"
                                    aria-label={`Revocar token ${token.name}`}
                                >
                                    <Trash2 size={14} />
                                    Revocar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
