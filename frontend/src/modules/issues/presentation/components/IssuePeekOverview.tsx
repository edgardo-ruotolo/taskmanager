import type React from 'react';
import { useState, useEffect, useRef, useId } from 'react';
import { X, ExternalLink, ChevronLeft, ChevronRight, Activity, FileText, Calendar, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { IssuePriorityBadge } from './IssuePriorityBadge';
import { IssueStateBadge } from './IssueStateBadge';
import type { Issue } from '../../domain/types';
import { useCompany } from '@/modules/companies/application/use-companies';

interface IssuePeekOverviewProps {
    issue: Issue | null;
    onClose: () => void;
    onPrev?: () => void;
    onNext?: () => void;
    hasPrev?: boolean;
    hasNext?: boolean;
}

type TabId = 'detail' | 'activity';

function PeekPanel({
    issue,
    onClose,
    onPrev,
    onNext,
    hasPrev,
    hasNext,
}: IssuePeekOverviewProps & { issue: Issue }): React.ReactElement {
    const navigate = useNavigate();
    const { workspaceSlug = '', companyId = '' } = useParams<{ workspaceSlug: string; companyId: string }>();
    const { data: company } = useCompany(workspaceSlug, companyId);
    const issueId = `${company?.identifier ?? 'ISS'}-${issue.sequenceId}`;
    // useState with defaultValue resets when remounted via key={issue.id}
    const [activeTab, setActiveTab] = useState<TabId>('detail');
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    // Block background scroll while the peek is open and restore focus on close.
    useEffect(() => {
        previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        // Move initial focus into the panel for keyboard users.
        panelRef.current?.focus();
        return () => {
            document.body.style.overflow = previousOverflow;
            previouslyFocusedRef.current?.focus?.();
        };
    }, []);

    const openFull = (): void => {
        void navigate(`/${workspaceSlug}/companies/${companyId}/issues/${issue.id}`);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={onClose}
                aria-hidden="true"
            />
            {/* Panel */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="fixed right-0 top-0 h-full z-50 w-full sm:w-[480px] max-w-full flex flex-col bg-surface-1 border-l border-subtle shadow-overlay-200 focus:outline-none"
                style={{ animation: 'var(--animate-slide-in-from-right)' }}
            >
                {/* Header */}
                <div className="flex items-center gap-2 px-4 h-12 border-b border-subtle shrink-0">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="p-1 rounded-sm text-placeholder hover:text-primary hover:bg-layer-transparent-hover transition-colors"
                        >
                            <X size={15} />
                        </button>
                        {(hasPrev ?? hasNext) && (
                            <>
                                <button
                                    type="button"
                                    onClick={onPrev}
                                    disabled={!hasPrev}
                                    aria-label="Anterior"
                                    className="p-1 rounded-sm text-placeholder hover:text-primary hover:bg-layer-transparent-hover transition-colors disabled:opacity-30"
                                >
                                    <ChevronLeft size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={onNext}
                                    disabled={!hasNext}
                                    aria-label="Siguiente"
                                    className="p-1 rounded-sm text-placeholder hover:text-primary hover:bg-layer-transparent-hover transition-colors disabled:opacity-30"
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </>
                        )}
                    </div>
                    <span className="text-xs font-mono text-placeholder ml-1">{issueId}</span>
                    <div className="flex-1" />
                    <button
                        type="button"
                        onClick={openFull}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs text-secondary hover:text-primary hover:bg-layer-transparent-hover transition-colors"
                    >
                        <ExternalLink size={13} />
                        <span>Abrir</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-0.5 px-4 py-2 border-b border-subtle shrink-0">
                    {(['detail', 'activity'] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[12px] font-medium transition-colors',
                                activeTab === tab
                                    ? 'bg-layer-2 text-primary border border-subtle'
                                    : 'text-secondary hover:text-primary hover:bg-layer-transparent-hover',
                            )}
                        >
                            {tab === 'detail' ? <FileText size={12} /> : <Activity size={12} />}
                            {tab === 'detail' ? 'Detalles' : 'Actividad'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'detail' && (
                        <div className="p-4 space-y-4">
                            <h2 id={titleId} className="text-base font-semibold text-primary">{issue.title}</h2>
                            {issue.description ? (
                                <p className="text-sm text-secondary whitespace-pre-wrap">{issue.description}</p>
                            ) : (
                                <p className="text-sm text-placeholder italic">Sin descripción</p>
                            )}
                            <div className="border-t border-subtle pt-4 space-y-2">
                                <div className="flex items-center gap-3 text-[13px]">
                                    <span className="text-placeholder w-24 shrink-0">Estado</span>
                                    <IssueStateBadge
                                        stateName={issue.stateName}
                                        stateGroup={issue.stateName}
                                    />
                                </div>
                                <div className="flex items-center gap-3 text-[13px]">
                                    <span className="text-placeholder w-24 shrink-0">Prioridad</span>
                                    <IssuePriorityBadge priority={issue.priority} />
                                </div>
                                {issue.assigneeId && (
                                    <div className="flex items-center gap-3 text-[13px]">
                                        <span className="text-placeholder w-24 shrink-0">Asignado a</span>
                                        <span className="inline-flex items-center gap-1.5 text-secondary">
                                            <User size={12} />
                                            <span className="font-mono">{issue.assigneeId.slice(0, 8)}…</span>
                                        </span>
                                    </div>
                                )}
                                {issue.dueDate && (
                                    <div className="flex items-center gap-3 text-[13px]">
                                        <span className="text-placeholder w-24 shrink-0">Fecha límite</span>
                                        <span className="inline-flex items-center gap-1.5 text-secondary">
                                            <Calendar size={12} />
                                            {new Date(issue.dueDate).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'activity' && (
                        <div className="p-4">
                            <p className="text-sm text-placeholder italic text-center py-8">
                                Sin actividad registrada.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export function IssuePeekOverview(props: IssuePeekOverviewProps): React.ReactElement | null {
    if (!props.issue) return null;
    // key={issue.id} forces remount (resets activeTab state) when navigating between issues
    return <PeekPanel key={props.issue.id} {...props} issue={props.issue} />;
}
