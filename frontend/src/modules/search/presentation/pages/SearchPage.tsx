import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FolderOpen, Layers, Search, Tag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatePip } from '@/components/ui/state-pip';
import { cn } from '@/lib/utils';
import { useSearch } from '../../application/use-search';

// TODO(backend): indexar Pages/Comments/Files en /workspace/:slug/search
type ResultKind = 'all' | 'issues' | 'pages' | 'comments' | 'files' | 'cycles' | 'modules' | 'labels';

interface TabConfig {
    key: ResultKind;
    label: string;
}

const FILTER_TABS: TabConfig[] = [
    { key: 'all', label: 'Todo' },
    { key: 'issues', label: 'Issues' },
    { key: 'pages', label: 'Pages' },
    { key: 'comments', label: 'Comentarios' },
    { key: 'files', label: 'Archivos' },
];

function highlightQuery(text: string, query: string): React.ReactElement {
    if (!query.trim()) return <>{text}</>;
    const lq = query.toLowerCase();
    const lt = text.toLowerCase();
    const result: React.ReactNode[] = [];
    let pos = 0;
    let idx = lt.indexOf(lq);
    while (idx !== -1) {
        if (idx > pos) result.push(text.slice(pos, idx));
        result.push(
            <strong
                key={idx}
                className="font-semibold text-[var(--neutral-1200)]"
            >
                {text.slice(idx, idx + query.length)}
            </strong>,
        );
        pos = idx + query.length;
        idx = lt.indexOf(lq, pos);
    }
    if (pos < text.length) result.push(text.slice(pos));
    return <>{result}</>;
}

interface ResultCardProps {
    icon?: React.ElementType;
    iconNode?: React.ReactNode;
    id: string;
    kind: string;
    title: string;
    snippet?: string;
    meta?: string;
    metaRight?: string;
    query: string;
    onClick: () => void;
}

function ResultCard({ icon: Icon, iconNode, id, kind, title, snippet, meta, metaRight, query, onClick }: ResultCardProps): React.ReactElement {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full bg-white p-4 border border-[var(--neutral-400)] rounded-lg text-left hover:border-[var(--neutral-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-700)]"
        >
            <div className="flex items-center gap-2.5 mb-2">
                {iconNode ?? (Icon ? <Icon size={13} className="text-[var(--neutral-600)] shrink-0" aria-hidden="true" /> : null)}
                <span className="font-mono text-[11px] text-[var(--neutral-600)]">{id}</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[var(--neutral-200)] text-[var(--neutral-600)] font-mono text-[10px]">
                    {kind}
                </span>
                {metaRight && (
                    <span className="ml-auto font-mono text-[10px] text-[var(--neutral-500)]">
                        {metaRight}
                    </span>
                )}
            </div>
            <div className="text-[15.5px] font-medium text-[var(--neutral-1200)] tracking-[-0.015em] leading-[1.35]">
                {highlightQuery(title, query)}
            </div>
            {snippet && (
                <p className="mt-1.5 text-[12.5px] text-[var(--neutral-600)] leading-[1.5] line-clamp-2">
                    {highlightQuery(snippet, query)}
                </p>
            )}
            {meta && (
                <div className="font-mono mt-2 text-[10.5px] text-[var(--neutral-600)] tracking-[0.08em] uppercase">
                    ↳ {meta}
                </div>
            )}
        </button>
    );
}

interface SearchResultsListProps {
    issues: { id: string; title: string; sequenceId: number; projectId: string }[];
    cycles: { id: string; name: string; projectId: string }[];
    modules: { id: string; name: string; projectId: string }[];
    labels: { id: string; name: string; color: string }[];
    activeKind: ResultKind;
    query: string;
    workspaceSlug: string;
    onNavigate: (path: string) => void;
}

function SearchResultsList({ issues, cycles, modules, labels, activeKind, query, workspaceSlug, onNavigate }: SearchResultsListProps): React.ReactElement {
    // Pages / Comments / Files are not yet indexed by the backend
    // TODO(backend): return pages[], comments[], files[] from /workspace/:slug/search
    const showIssues = activeKind === 'all' || activeKind === 'issues';
    const showCycles = activeKind === 'all' || activeKind === 'cycles';
    const showModules = activeKind === 'all' || activeKind === 'modules';
    const showLabels = activeKind === 'all' || activeKind === 'labels';
    return (
        <div className="flex flex-col gap-3">
            {showIssues && issues.map((issue) => (
                <ResultCard
                    key={issue.id}
                    iconNode={<StatePip state="backlog" size={13} />}
                    id={`ATL-${issue.sequenceId}`}
                    kind="issue"
                    title={issue.title}
                    query={query}
                    onClick={() => onNavigate(`/${workspaceSlug}/projects/${issue.projectId}/issues/${issue.id}`)}
                />
            ))}
            {showCycles && cycles.map((cycle) => (
                <ResultCard
                    key={cycle.id}
                    icon={Layers}
                    id={cycle.id.slice(0, 8)}
                    kind="ciclo"
                    title={cycle.name}
                    query={query}
                    onClick={() => onNavigate(`/${workspaceSlug}/projects/${cycle.projectId}/cycles/${cycle.id}`)}
                />
            ))}
            {showModules && modules.map((mod) => (
                <ResultCard
                    key={mod.id}
                    icon={FolderOpen}
                    id={mod.id.slice(0, 8)}
                    kind="módulo"
                    title={mod.name}
                    query={query}
                    onClick={() => onNavigate(`/${workspaceSlug}/projects/${mod.projectId}/modules/${mod.id}`)}
                />
            ))}
            {showLabels && labels.map((label) => (
                <ResultCard
                    key={label.id}
                    icon={Tag}
                    id={label.id.slice(0, 8)}
                    kind="etiqueta"
                    title={label.name}
                    meta={label.color}
                    query={query}
                    onClick={() => onNavigate(`/${workspaceSlug}/settings/labels`)}
                />
            ))}
        </div>
    );
}

type BodyState = 'idle' | 'loading' | 'no-results' | 'stub-tab' | 'results';

function resolveBodyState(params: {
    hasQuery: boolean;
    isSearching: boolean;
    isEmpty: boolean;
    activeKind: ResultKind;
}): BodyState {
    const { hasQuery, isSearching, isEmpty, activeKind } = params;
    if (!hasQuery) return 'idle';
    if (isSearching) return 'loading';
    if (activeKind === 'pages' || activeKind === 'comments' || activeKind === 'files') return 'stub-tab';
    if (isEmpty) return 'no-results';
    return 'results';
}

function useSearchPageState(workspaceSlug: string) {
    const [query, setQuery] = useState('');
    const [activeKind, setActiveKind] = useState<ResultKind>('all');
    const searchStartRef = useRef<number>(0);
    const [responseTime, setResponseTime] = useState<number | null>(null);

    const { data: results, isLoading, isFetching } = useSearch(workspaceSlug, query);

    useEffect(() => {
        if (query.trim().length >= 2) {
            searchStartRef.current = performance.now();
            setResponseTime(null);
        }
    }, [query]);

    useEffect(() => {
        if (results !== undefined && !isFetching && searchStartRef.current > 0) {
            setResponseTime(performance.now() - searchStartRef.current);
        }
    }, [results, isFetching]);

    const totalCount = results
        ? results.issues.length + results.cycles.length + results.modules.length + results.labels.length
        : 0;

    const kindCounts: Record<ResultKind, number | null> = {
        all: totalCount,
        issues: results?.issues.length ?? 0,
        pages: null,       // TODO(backend): indexar Pages
        comments: null,    // TODO(backend): indexar Comentarios
        files: null,       // TODO(backend): indexar Archivos
        cycles: results?.cycles.length ?? 0,
        modules: results?.modules.length ?? 0,
        labels: results?.labels.length ?? 0,
    };

    const hasQuery = query.trim().length >= 2;
    const isSearching = hasQuery && (isLoading || isFetching);
    const isEmpty = hasQuery && !isLoading && !isFetching && results !== undefined && totalCount === 0 && activeKind === 'all';
    const bodyState = resolveBodyState({ hasQuery, isSearching, isEmpty, activeKind });

    const handleTabClick = useCallback((key: ResultKind): void => {
        setActiveKind(key);
    }, []);

    return { query, setQuery, activeKind, handleTabClick, results, totalCount, kindCounts, responseTime, bodyState };
}

export function SearchPage(): React.ReactElement {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const navigate = useNavigate();
    const {
        query, setQuery,
        activeKind, handleTabClick,
        results, totalCount, kindCounts,
        responseTime, bodyState,
    } = useSearchPageState(workspaceSlug);

    const stubTabLabel =
        activeKind === 'pages' ? 'Pages' :
        activeKind === 'comments' ? 'Comentarios' :
        'Archivos';

    return (
        <div className="h-full overflow-y-auto">
            <div className="w-full px-10 py-8">
                {/* Search input */}
                <div
                    className="flex items-center gap-3.5 px-[22px] py-[18px] bg-white border-[1.5px] border-[var(--neutral-1200)] rounded-[10px] mb-4 transition-shadow focus-within:border-[var(--brand-700)]"
                    style={{ boxShadow: '0 0 0 5px rgba(217,119,87,0.12)' }}
                >
                    <Search size={20} className="text-[var(--neutral-600)] shrink-0" aria-hidden="true" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar tareas, ciclos, módulos, etiquetas..."
                        aria-label="Buscar en el workspace"
                        className="flex-1 bg-transparent text-[22px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)] placeholder:text-[var(--neutral-400)] outline-none"
                    />
                </div>

                {/* Tabs + result count + response time */}
                <div className="flex items-center gap-1 mb-6">
                    {FILTER_TABS.map((tab) => {
                        const count = kindCounts[tab.key];
                        const countLabel = count === null ? '—' : String(count);
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabClick(tab.key)}
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-medium transition-colors',
                                    activeKind === tab.key
                                        ? 'bg-[var(--neutral-1200)] text-[#f0eadf]'
                                        : 'bg-transparent text-[var(--neutral-600)] hover:text-[var(--neutral-1200)]',
                                )}
                            >
                                {tab.label}
                                <span className="font-mono text-[10px] opacity-60">{countLabel}</span>
                            </button>
                        );
                    })}
                    <div className="flex-1" />
                    {results !== undefined && responseTime !== null && (
                        <span className="font-mono text-[11px] text-[var(--neutral-500)] tracking-[0.04em]">
                            {totalCount} resultados · {(responseTime / 1000).toFixed(2)} s
                        </span>
                    )}
                </div>

                {/* Body states */}
                {bodyState === 'loading' && (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-lg bg-[var(--neutral-200)]" />
                        ))}
                    </div>
                )}
                {bodyState === 'idle' && (
                    <div className="py-16 text-center">
                        <Search size={32} className="mx-auto mb-3 text-[var(--neutral-400)]" aria-hidden="true" />
                        <p className="text-[13px] text-[var(--neutral-600)]">Escribí al menos 2 caracteres para buscar</p>
                    </div>
                )}
                {bodyState === 'stub-tab' && (
                    <div className="py-16 text-center">
                        <p className="text-[14px] font-medium text-[var(--neutral-1200)]">Próximamente</p>
                        <p className="mt-1 text-[12px] text-[var(--neutral-600)]">
                            La búsqueda de {stubTabLabel} estará disponible próximamente.
                        </p>
                    </div>
                )}
                {bodyState === 'no-results' && (
                    <div className="py-16 text-center">
                        <p className="text-[14px] font-medium text-[var(--neutral-1200)]">Sin resultados para "{query}"</p>
                        <p className="mt-1 text-[12px] text-[var(--neutral-600)]">Intentá con otro término</p>
                    </div>
                )}
                {bodyState === 'results' && results && (
                    <SearchResultsList
                        issues={results.issues}
                        cycles={results.cycles}
                        modules={results.modules}
                        labels={results.labels}
                        activeKind={activeKind}
                        query={query}
                        workspaceSlug={workspaceSlug}
                        onNavigate={(path) => void navigate(path)}
                    />
                )}
            </div>
        </div>
    );
}
