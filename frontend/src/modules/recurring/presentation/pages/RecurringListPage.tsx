import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Repeat2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useRecurringTemplates } from '../../application/use-recurring';
import { RecurringListItem } from '../components/RecurringListItem';
import { CreateRecurringDialog } from '../components/CreateRecurringDialog';

type StatusFilter = 'all' | 'active' | 'paused';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'paused', label: 'Pausados' },
];

export function RecurringListPage(): React.ReactElement {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [createOpen, setCreateOpen] = useState(false);

    const { data: templates = [], isLoading } = useRecurringTemplates(workspaceSlug);

    const filtered = templates.filter((t) => {
        const matchesQuery = t.name.toLowerCase().includes(query.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && t.isActive && !t.isPaused) ||
            (statusFilter === 'paused' && t.isPaused);
        return matchesQuery && matchesStatus;
    });

    return (
        <>
            <CreateRecurringDialog
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                workspaceSlug={workspaceSlug}
            />
            <div className="p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-xs text-placeholder uppercase tracking-wider mb-1">
                                {workspaceSlug}
                            </p>
                            <h1 className="text-2xl font-bold text-primary">Tareas recurrentes</h1>
                        </div>
                        <Button
                            className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus size={16} />
                            Nueva tarea recurrente
                        </Button>
                    </div>

                    {/* Search + filters */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-placeholder" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar tareas recurrentes..."
                                className="pl-9 bg-surface-1 border-subtle text-primary placeholder:text-placeholder"
                            />
                        </div>
                        <div className="flex items-center gap-1 rounded-lg border border-subtle bg-surface-1 p-1">
                            {STATUS_FILTERS.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setStatusFilter(s.value)}
                                    className={cn(
                                        'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                                        statusFilter === s.value
                                            ? 'bg-accent-subtle text-accent-primary'
                                            : 'text-placeholder hover:text-primary hover:bg-layer-transparent-hover',
                                    )}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="space-y-2">
                            {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                                <div
                                    key={k}
                                    className="flex items-center gap-3 p-4 bg-surface-1/50 border border-subtle rounded-lg"
                                >
                                    <Skeleton className="h-8 w-8 rounded-md bg-layer-1 shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-4 w-48 bg-layer-1" />
                                        <Skeleton className="h-3 w-32 bg-layer-1" />
                                    </div>
                                    <Skeleton className="h-4 w-28 bg-layer-1" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <Repeat2 size={48} className="text-placeholder mb-4" />
                            <h2 className="text-lg font-medium text-secondary mb-2">
                                {query || statusFilter !== 'all'
                                    ? 'Sin resultados'
                                    : 'No hay tareas recurrentes'}
                            </h2>
                            <p className="text-sm text-placeholder mb-6">
                                {query || statusFilter !== 'all'
                                    ? 'Probá con otro filtro o búsqueda'
                                    : 'Creá tu primera tarea recurrente para automatizar trabajo repetitivo'}
                            </p>
                            {!query && statusFilter === 'all' && (
                                <Button
                                    className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2"
                                    onClick={() => setCreateOpen(true)}
                                >
                                    <Plus size={16} />
                                    Nueva tarea recurrente
                                </Button>
                            )}
                        </div>
                    )}

                    {/* List */}
                    {!isLoading && filtered.length > 0 && (
                        <div className="space-y-2">
                            {filtered.map((template) => (
                                <RecurringListItem
                                    key={template.id}
                                    template={template}
                                    workspaceSlug={workspaceSlug}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
