import type React from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, FolderOpen, Layers, Search, Tag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSearch } from '../../application/use-search';

type ResultKind = 'all' | 'issues' | 'cycles' | 'modules' | 'labels';

const FILTER_TABS: { key: ResultKind; label: string }[] = [
    { key: 'all', label: 'Todo' },
    { key: 'issues', label: 'Issues' },
    { key: 'cycles', label: 'Ciclos' },
    { key: 'modules', label: 'Módulos' },
    { key: 'labels', label: 'Etiquetas' },
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
            <span
                key={idx}
                className="bg-[color-mix(in_oklch,var(--brand-700)_15%,white)] text-[var(--brand-900)] px-1 rounded-sm"
            >
                {text.slice(idx, idx + query.length)}
            </span>,
        );
        pos = idx + query.length;
        idx = lt.indexOf(lq, pos);
    }
    if (pos < text.length) result.push(text.slice(pos));
    return <>{result}</>;
}

interface ResultCardProps {
    icon: React.ElementType;
    id: string;
    kind: string;
    title: string;
    meta?: string;
    query: string;
    onClick: () => void;
}

function ResultCard({ icon: Icon, id, kind, title, meta, query, onClick }: ResultCardProps): React.ReactElement {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full bg-white p-4 border border-[var(--neutral-400)] rounded-lg text-left hover:border-[var(--neutral-700)] transition-colors"
        >
            <div className="flex items-center gap-2.5 mb-2">
                <Icon size={13} className="text-[var(--neutral-600)] shrink-0" aria-hidden="true" />
                <span className="font-mono text-[11px] text-[var(--neutral-600)]">{id}</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[var(--neutral-200)] text-[var(--neutral-600)] font-mono text-[10px]">
                    {kind}
                </span>
            </div>
            <div className="text-[15.5px] font-medium text-[var(--neutral-1200)] tracking-[-0.015em] leading-[1.35]">
                {highlightQuery(title, query)}
            </div>
            {meta && (
                <div className="font-mono mt-2 text-[10.5px] text-[var(--neutral-600)] tracking-[0.08em] uppercase">
                    ↳ {meta}
                </div>
            )}
        </button>
    );
}

interface SearchResultsListProps {
    issues: { id: string; title: string; sequenceId: number; companyId: string }[];
    cycles: { id: string; name: string; companyId: string }[];
    modules: { id: string; name: string; companyId: string }[];
    labels: { id: string; name: string; color: string }[];
    activeKind: ResultKind;
    query: string;
    workspaceSlug: string;
    onNavigate: (path: string) => void;
}

function SearchResultsList({ issues, cycles, modules, labels, activeKind, query, workspaceSlug, onNavigate }: SearchResultsListProps): React.ReactElement {
    const showIssues = activeKind === 'all' || activeKind === 'issues';
    const showCycles = activeKind === 'all' || activeKind === 'cycles';
    const showModules = activeKind === 'all' || activeKind === 'modules';
    const showLabels = activeKind === 'all' || activeKind === 'labels';
    return (
        <div className="flex flex-col gap-3">
            {showIssues && issues.map((issue) => (
                <ResultCard
                    key={issue.id}
                    icon={FileText}
                    id={`ISS-${issue.sequenceId}`}
                    kind="issue"
                    title={issue.title}
                    query={query}
                    onClick={() => onNavigate(`/${workspaceSlug}/companies/${issue.companyId}/issues/${issue.id}`)}
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
                    onClick={() => onNavigate(`/${workspaceSlug}/companies/${cycle.companyId}/cycles/${cycle.id}`)}
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
                    onClick={() => onNavigate(`/${workspaceSlug}/companies/${mod.companyId}/modules/${mod.id}`)}
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

export function SearchPage(): React.ReactElement {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [activeKind, setActiveKind] = useState<ResultKind>('all');

    const { data: results, isLoading, isFetching } = useSearch(workspaceSlug, query);

    const totalCount = results
        ? results.issues.length + results.cycles.length + results.modules.length + results.labels.length
        : 0;

    const kindCounts: Record<ResultKind, number> = {
        all: totalCount,
        issues: results?.issues.length ?? 0,
        cycles: results?.cycles.length ?? 0,
        modules: results?.modules.length ?? 0,
        labels: results?.labels.length ?? 0,
    };

    const hasQuery = query.trim().length >= 2;
    const isSearching = hasQuery && (isLoading || isFetching);
    const isEmpty = hasQuery && !isLoading && !isFetching && results !== undefined && totalCount === 0;

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-3xl px-10 py-8">
                <div
                    className="flex items-center gap-3.5 px-[22px] py-[18px] bg-white border-[1.5px] border-[var(--neutral-1200)] rounded-[10px] mb-4"
                    style={{ boxShadow: '0 0 0 5px rgba(217,119,87,0.12)' }}
                >
                    <Search size={20} className="text-[var(--neutral-600)] shrink-0" aria-hidden="true" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar tareas, ciclos, módulos, etiquetas..."
                        className="flex-1 bg-transparent text-[22px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)] placeholder:text-[var(--neutral-400)] outline-none"
                    />
                </div>

                <div className="flex items-center gap-3 mb-6">
                    {results && (
                        <span className="font-mono text-[11px] text-[var(--neutral-600)] tracking-[0.1em] uppercase">
                            {totalCount} resultados
                        </span>
                    )}
                    <div className="flex-1" />
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveKind(tab.key)}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-medium transition-colors',
                                activeKind === tab.key
                                    ? 'bg-[var(--neutral-1200)] text-[#f0eadf]'
                                    : 'bg-transparent text-[var(--neutral-600)] hover:text-[var(--neutral-1200)]',
                            )}
                        >
                            {tab.label}
                            <span className="font-mono text-[10px] opacity-60">{kindCounts[tab.key]}</span>
                        </button>
                    ))}
                </div>

                {isSearching && (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-lg bg-[var(--neutral-200)]" />
                        ))}
                    </div>
                )}

                {!hasQuery && (
                    <div className="py-16 text-center">
                        <Search size={32} className="mx-auto mb-3 text-[var(--neutral-400)]" aria-hidden="true" />
                        <p className="text-[13px] text-[var(--neutral-600)]">Escribí al menos 2 caracteres para buscar</p>
                    </div>
                )}

                {isEmpty && (
                    <div className="py-16 text-center">
                        <p className="text-[14px] font-medium text-[var(--neutral-1200)]">Sin resultados para "{query}"</p>
                        <p className="mt-1 text-[12px] text-[var(--neutral-600)]">Intentá con otro término</p>
                    </div>
                )}

                {results && !isSearching && (
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
