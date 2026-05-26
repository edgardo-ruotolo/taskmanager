import { useState } from 'react';
import type React from 'react';
import { Copy, Check, Trash2, ExternalLink, Users, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import {
    LineChart,
    Line,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { DeployBoard } from '../../domain/types';

// TODO(backend): add visitCount, lastVisitAt, audience, expiresAt, visitHistory to DeployBoard DTO

interface VisitDataPoint {
    day: number;
    visits: number;
}

function generatePlaceholderVisits(): VisitDataPoint[] {
    return Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        visits: Math.floor(Math.random() * 20),
    }));
}

interface StatusBadgeProps {
    isActive: boolean;
}

function StatusBadge({ isActive }: StatusBadgeProps): React.ReactElement {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium font-mono tracking-[0.04em]',
                isActive
                    ? 'bg-[var(--green-100)] text-[var(--green-900)] border border-[var(--green-300)]'
                    : 'bg-[var(--neutral-200)] text-[var(--neutral-700)] border border-[var(--neutral-400)]',
            )}
        >
            <span className={cn('inline-block w-1.5 h-1.5 rounded-full', isActive ? 'bg-[var(--green-700)]' : 'bg-[var(--neutral-600)]')} aria-hidden="true" />
            {isActive ? 'Activo' : 'Pausado'}
        </span>
    );
}

interface DeployBoardCardProps {
    board: DeployBoard;
    onDelete: (boardId: string) => void;
}

export const DeployBoardCard = ({ board, onDelete }: DeployBoardCardProps): React.ReactElement => {
    const [copied, setCopied] = useState(false);

    const publicUrl = `${window.location.origin}/public/${board.token}`;

    // TODO(backend): visitCount not yet in DTO — using 0 as fallback
    const visitCount = (board as unknown as Record<string, unknown>).visitCount as number | undefined;
    // TODO(backend): lastVisitAt not yet in DTO
    const lastVisitAt = (board as unknown as Record<string, unknown>).lastVisitAt as string | undefined;
    // TODO(backend): audience not yet in DTO
    const audience = (board as unknown as Record<string, unknown>).audience as string | undefined;
    // TODO(backend): expiresAt not yet in DTO
    const expiresAt = (board as unknown as Record<string, unknown>).expiresAt as string | undefined;
    // TODO(backend): visitHistory not yet in DTO — using placeholder
    const visitHistory: VisitDataPoint[] = generatePlaceholderVisits();

    const isActive = board.isPublic;

    const handleCopy = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            toast.success('URL copiada al portapapeles');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('No se pudo copiar la URL');
        }
    };

    const handlePreview = (): void => {
        window.open(publicUrl, '_blank', 'noopener,noreferrer');
    };

    const formatRelativeTime = (dateStr: string | undefined): string => {
        if (!dateStr) return '—';
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `hace ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `hace ${hours} h`;
        const days = Math.floor(hours / 24);
        if (days === 1) return 'ayer';
        return `hace ${days} días`;
    };

    const formatExpiry = (dateStr: string | undefined): string => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="rounded-xl border border-[var(--neutral-400)] bg-[var(--neutral-100)] overflow-hidden transition-shadow hover:shadow-[var(--shadow-raised-200)]">
            {/* Card header */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1">
                            <h3 className="text-[15px] font-semibold text-[var(--neutral-1200)] tight truncate">
                                {board.title}
                            </h3>
                            <StatusBadge isActive={isActive} />
                        </div>
                        <p className="font-mono text-[11.5px] text-[var(--neutral-700)] truncate">
                            {publicUrl.replace(`${window.location.origin}/`, '')}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="h-8 w-8 shrink-0 flex items-center justify-center rounded-md text-[var(--neutral-600)] hover:bg-[var(--bg-danger-subtle)] hover:text-[var(--txt-danger-secondary)] transition-colors"
                        onClick={() => onDelete(board.id)}
                        aria-label={`Eliminar tablero ${board.title}`}
                    >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-4">
                    <div className="flex items-start gap-2">
                        <Users size={13} className="text-[var(--neutral-600)] mt-0.5 shrink-0" aria-hidden="true" />
                        <div>
                            <p className="font-mono text-[9.5px] text-[var(--neutral-600)] uppercase tracking-[0.1em] mb-0.5">Audiencia</p>
                            <p className="text-[12px] text-[var(--neutral-1000)]">
                                {audience ?? 'Público — quien tenga el link'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <Calendar size={13} className="text-[var(--neutral-600)] mt-0.5 shrink-0" aria-hidden="true" />
                        <div>
                            <p className="font-mono text-[9.5px] text-[var(--neutral-600)] uppercase tracking-[0.1em] mb-0.5">Expira</p>
                            <p className="text-[12px] text-[var(--neutral-1000)]">
                                {expiresAt ? formatExpiry(expiresAt) : 'No expira'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Visit metrics */}
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={13} className="text-[var(--neutral-600)] shrink-0" aria-hidden="true" />
                    <span className="font-mono text-[11px] text-[var(--neutral-800)]">
                        <span className="text-[var(--neutral-1200)] font-semibold tnum">{visitCount ?? 0}</span>
                        {' '}VISITAS
                    </span>
                    <span className="font-mono text-[10px] text-[var(--neutral-500)]">·</span>
                    <span className="font-mono text-[10.5px] text-[var(--neutral-700)]">
                        última: {formatRelativeTime(lastVisitAt)}
                    </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handlePreview}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-[var(--neutral-800)] bg-[var(--neutral-200)] border border-[var(--neutral-400)] hover:bg-[var(--neutral-300)] hover:text-[var(--neutral-1200)] transition-colors"
                    >
                        <ExternalLink size={12} aria-hidden="true" />
                        Preview
                    </button>
                    <button
                        type="button"
                        onClick={() => { void handleCopy(); }}
                        className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors border',
                            copied
                                ? 'bg-[var(--green-100)] border-[var(--green-300)] text-[var(--green-900)]'
                                : 'bg-[var(--neutral-200)] border-[var(--neutral-400)] text-[var(--neutral-800)] hover:bg-[var(--neutral-300)] hover:text-[var(--neutral-1200)]',
                        )}
                    >
                        {copied ? (
                            <Check size={12} aria-hidden="true" />
                        ) : (
                            <Copy size={12} aria-hidden="true" />
                        )}
                        {copied ? 'Copiado' : 'Copiar'}
                    </button>
                </div>
            </div>

            {/* Visit chart — últimos 30 días */}
            <div className="border-t border-[var(--neutral-400)] px-5 pt-3 pb-4">
                <p className="font-mono text-[9.5px] text-[var(--neutral-600)] uppercase tracking-[0.1em] mb-2">
                    Visitas · últimos 30 días
                </p>
                {visitHistory.length > 0 ? (
                    <div className="h-12">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={visitHistory} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                                <Line
                                    type="monotone"
                                    dataKey="visits"
                                    stroke="var(--terra)"
                                    strokeWidth={1.5}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-surface-1)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        color: 'var(--txt-tertiary)',
                                        padding: '4px 8px',
                                    }}
                                    itemStyle={{ color: 'var(--txt-primary)' }}
                                    labelFormatter={(label: number) => `Día ${label}`}
                                    formatter={(value: number) => [`${value} visitas`, '']}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-[11px] text-[var(--neutral-600)] italic">Sin datos de visitas</p>
                )}
            </div>
        </div>
    );
};
