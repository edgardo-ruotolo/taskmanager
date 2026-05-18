import type React from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, FolderOpen, Layers, Search, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearch } from '../../application/use-search';

function SectionHeader({ icon: Icon, label, count }: { icon: React.ElementType; label: string; count: number }): React.ReactElement {
    return (
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{count}</span>
        </div>
    );
}

interface ResultRowProps {
    label: string;
    meta?: string;
    onClick: () => void;
}

function ResultRow({ label, meta, onClick }: ResultRowProps): React.ReactElement {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
        >
            <div className="min-w-0">
                <p className="truncate text-sm font-medium">{label}</p>
                {meta && <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>}
            </div>
        </button>
    );
}

export function SearchPage(): React.ReactElement {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const { data: results, isLoading, isFetching } = useSearch(workspaceSlug, query);

    const hasResults = results &&
        (results.issues.length > 0 ||
            results.cycles.length > 0 ||
            results.modules.length > 0 ||
            results.views.length > 0 ||
            results.labels.length > 0);

    const isEmpty = query.trim().length >= 2 && !isLoading && !isFetching && !hasResults;

    return (
        <div className="mx-auto max-w-3xl p-6">
            {/* Search input */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar tareas, ciclos, módulos, vistas, etiquetas..."
                    className="h-11 pl-10 text-base"
                />
            </div>

            {/* Loading skeleton */}
            {(isLoading || isFetching) && query.trim().length >= 2 && (
                <div className="flex flex-col gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {isEmpty && (
                <div className="py-12 text-center">
                    <p className="text-sm font-medium">Sin resultados para "{query}"</p>
                    <p className="mt-1 text-xs text-muted-foreground">Intentá con otro término</p>
                </div>
            )}

            {/* Hint state — before any search */}
            {query.trim().length < 2 && (
                <div className="py-12 text-center">
                    <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground opacity-40" />
                    <p className="text-sm text-muted-foreground">Escribí al menos 2 caracteres para buscar</p>
                </div>
            )}

            {/* Results */}
            {results && !isLoading && !isFetching && (
                <div className="flex flex-col gap-6">
                    {/* Issues */}
                    {results.issues.length > 0 && (
                        <section>
                            <SectionHeader icon={FileText} label="Tareas" count={results.issues.length} />
                            <div className="flex flex-col">
                                {results.issues.map((issue) => (
                                    <ResultRow
                                        key={issue.id}
                                        label={issue.title}
                                        meta={`ISS-${issue.sequenceId}`}
                                        onClick={() =>
                                            void navigate(
                                                `/${workspaceSlug}/companies/${issue.companyId}/issues/${issue.id}`,
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Cycles */}
                    {results.cycles.length > 0 && (
                        <section>
                            <SectionHeader icon={Layers} label="Ciclos" count={results.cycles.length} />
                            <div className="flex flex-col">
                                {results.cycles.map((cycle) => (
                                    <ResultRow
                                        key={cycle.id}
                                        label={cycle.name}
                                        onClick={() =>
                                            void navigate(
                                                `/${workspaceSlug}/companies/${cycle.companyId}/cycles/${cycle.id}`,
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Modules */}
                    {results.modules.length > 0 && (
                        <section>
                            <SectionHeader icon={FolderOpen} label="Módulos" count={results.modules.length} />
                            <div className="flex flex-col">
                                {results.modules.map((mod) => (
                                    <ResultRow
                                        key={mod.id}
                                        label={mod.name}
                                        onClick={() =>
                                            void navigate(
                                                `/${workspaceSlug}/companies/${mod.companyId}/modules/${mod.id}`,
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Views */}
                    {results.views.length > 0 && (
                        <section>
                            <SectionHeader icon={Layers} label="Vistas" count={results.views.length} />
                            <div className="flex flex-col">
                                {results.views.map((view) => (
                                    <ResultRow
                                        key={view.id}
                                        label={view.name}
                                        onClick={() =>
                                            void navigate(`/${workspaceSlug}/settings/views/${view.id}`)
                                        }
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Labels */}
                    {results.labels.length > 0 && (
                        <section>
                            <SectionHeader icon={Tag} label="Etiquetas" count={results.labels.length} />
                            <div className="flex flex-col">
                                {results.labels.map((label) => (
                                    <ResultRow
                                        key={label.id}
                                        label={label.name}
                                        meta={label.color}
                                        onClick={() => void navigate(`/${workspaceSlug}/settings/labels`)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
