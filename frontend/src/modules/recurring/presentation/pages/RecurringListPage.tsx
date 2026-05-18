import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Repeat2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecurringTemplates } from '../../application/use-recurring';
import { RecurringListItem } from '../components/RecurringListItem';
import { CreateRecurringDialog } from '../components/CreateRecurringDialog';

type StatusFilter = 'all' | 'active' | 'paused';

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

    const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
        { value: 'all', label: 'Todos' },
        { value: 'active', label: 'Activos' },
        { value: 'paused', label: 'Pausados' },
    ];

    return (
        <>
            <CreateRecurringDialog
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                workspaceSlug={workspaceSlug}
            />
            <div className="flex h-full w-full flex-col overflow-hidden">
                {/* Page header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/30">
                            <Repeat2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h1 className="text-lg font-semibold">Tareas recurrentes</h1>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>Nueva tarea recurrente</Button>
                </div>

                {/* Toolbar */}
                <div className="flex h-11 w-full items-center gap-2.5 border-b border-subtle px-5">
                    <Search className="h-3.5 w-3.5 flex-shrink-0 text-placeholder" />
                    <Input
                        className="h-full w-full border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-placeholder focus-visible:ring-0 text-primary"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar tareas recurrentes..."
                    />
                    <div className="ml-auto flex flex-shrink-0 items-center gap-1">
                        {STATUS_FILTERS.map((s) => (
                            <button
                                key={s.value}
                                type="button"
                                onClick={() => setStatusFilter(s.value)}
                                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                                    statusFilter === s.value
                                        ? 'bg-accent-subtle text-accent-primary'
                                        : 'text-placeholder hover:text-primary hover:bg-layer-transparent-hover'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col gap-y-2 p-5">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-md" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-layer-1">
                            <Repeat2 className="h-7 w-7 text-placeholder" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-primary">
                                {query || statusFilter !== 'all'
                                    ? 'Sin resultados'
                                    : 'No hay tareas recurrentes'}
                            </p>
                            <p className="mt-1 text-xs text-placeholder">
                                {query || statusFilter !== 'all'
                                    ? 'Intentá con otro filtro o búsqueda'
                                    : 'Creá tu primera tarea recurrente para automatizar trabajo repetitivo'}
                            </p>
                        </div>
                        {!query && statusFilter === 'all' && (
                            <Button onClick={() => setCreateOpen(true)}>Nueva tarea recurrente</Button>
                        )}
                    </div>
                ) : (
                    <div className="flex h-full w-full flex-col overflow-y-auto">
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
        </>
    );
}
