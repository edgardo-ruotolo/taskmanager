import { useState } from 'react';
import type React from 'react';
import { Copy, Check, Trash2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DeployBoard } from '../../domain/types';

interface DeployBoardCardProps {
    board: DeployBoard;
    onDelete: (boardId: string) => void;
}

export const DeployBoardCard = ({ board, onDelete }: DeployBoardCardProps): React.ReactElement => {
    const [copied, setCopied] = useState(false);

    const publicUrl = `${window.location.origin}/public/${board.token}`;

    const handleCopy = async (): Promise<void> => {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 transition-shadow hover:shadow-md hover:shadow-zinc-900/50">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
                        <h3 className="truncate text-sm font-medium text-zinc-100">
                            {board.title}
                        </h3>
                        {board.isPublic && (
                            <Badge variant="secondary" className="shrink-0 text-xs">
                                Público
                            </Badge>
                        )}
                    </div>
                    {board.description && (
                        <p className="line-clamp-2 text-xs text-zinc-400">{board.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-1.5 rounded-md border border-zinc-600 bg-zinc-900 px-2 py-1.5">
                        <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-400">
                            {publicUrl}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'h-6 w-6 shrink-0 transition-colors',
                                copied
                                    ? 'text-green-400 hover:text-green-400'
                                    : 'text-zinc-400 hover:text-zinc-100',
                            )}
                            onClick={handleCopy}
                            aria-label="Copiar enlace al tablero público"
                        >
                            {copied ? (
                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                        </Button>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => onDelete(board.id)}
                    aria-label={`Eliminar tablero ${board.title}`}
                >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
                {board.showPriority && (
                    <Badge variant="outline" className="text-xs text-zinc-400">
                        Prioridad
                    </Badge>
                )}
                {board.showState && (
                    <Badge variant="outline" className="text-xs text-zinc-400">
                        Estado
                    </Badge>
                )}
                {board.showAssignees && (
                    <Badge variant="outline" className="text-xs text-zinc-400">
                        Responsables
                    </Badge>
                )}
                {board.showComments && (
                    <Badge variant="outline" className="text-xs text-zinc-400">
                        Comentarios
                    </Badge>
                )}
                {board.showVoting && (
                    <Badge variant="outline" className="text-xs text-zinc-400">
                        Votación
                    </Badge>
                )}
            </div>
        </div>
    );
};
