import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Repeat2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils';
import { useRecurringTemplates } from '../../application/use-recurring';
import { RecurringListItem } from '../components/RecurringListItem';
import { CreateRecurringDialog } from '../components/CreateRecurringDialog';

type TabFilter = 'all' | 'active' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'paused';

const TABS: { value: TabFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'Daily', label: 'Diarias' },
    { value: 'Weekly', label: 'Semanales' },
    { value: 'Monthly', label: 'Mensuales' },
    { value: 'Yearly', label: 'Anuales' },
    { value: 'paused', label: 'Pausadas' },
];

interface StatCardProps {
    label: string;
    value: number | string;
    sub: string;
    accent: string;
}

function StatCard({ label, value, sub, accent }: StatCardProps): React.ReactElement {
    return (
        <div className="bg-white p-4 rounded-lg border border-[var(--neutral-400)] relative overflow-hidden">
            <span
                className="absolute top-0 right-0 w-[3px] h-[18px]"
                style={{ background: accent }}
                aria-hidden="true"
            />
            <Eyebrow>{label}</Eyebrow>
            <div
                className="text-[32px] font-medium tracking-[-0.04em] leading-none mt-1.5 tabular-nums text-[var(--neutral-1200)]"
            >
                {value}
            </div>
            <div className="font-mono text-[10.5px] text-[var(--neutral-600)] mt-1.5 tracking-[0.05em]">
                {sub}
            </div>
        </div>
    );
}

export function RecurringListPage(): React.ReactElement {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const [query, setQuery] = useState('');
    const [tabFilter, setTabFilter] = useState<TabFilter>('all');
    const [createOpen, setCreateOpen] = useState(false);

    const { data: templates = [], isLoading } = useRecurringTemplates(workspaceSlug);

    const activeCount = templates.filter((t) => t.isActive && !t.isPaused).length;
    const pausedCount = templates.filter((t) => t.isPaused).length;

    const nextTriggerItem = [...templates]
        .filter((t) => t.isActive && !t.isPaused && Boolean(t.nextRunAt))
        .sort((a, b) => {
            if (!a.nextRunAt || !b.nextRunAt) return 0;
            return new Date(a.nextRunAt).getTime() - new Date(b.nextRunAt).getTime();
        })[0];

    const nextTriggerLabel = nextTriggerItem?.nextRunAt
        ? new Date(nextTriggerItem.nextRunAt).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
          })
        : '—';

    const filtered = templates.filter((t) => {
        const matchesQuery = t.name.toLowerCase().includes(query.toLowerCase());
        let matchesTab = true;
        if (tabFilter === 'active') matchesTab = t.isActive && !t.isPaused;
        else if (tabFilter === 'paused') matchesTab = t.isPaused;
        else if (tabFilter === 'Daily' || tabFilter === 'Weekly' || tabFilter === 'Monthly' || tabFilter === 'Yearly') {
            matchesTab = t.frequency === tabFilter;
        }
        return matchesQuery && matchesTab;
    });

    const tabCounts: Record<TabFilter, number> = {
        all: templates.length,
        active: activeCount,
        Daily: templates.filter((t) => t.frequency === 'Daily').length,
        Weekly: templates.filter((t) => t.frequency === 'Weekly').length,
        Monthly: templates.filter((t) => t.frequency === 'Monthly').length,
        Yearly: templates.filter((t) => t.frequency === 'Yearly').length,
        paused: pausedCount,
    };

    return (
        <>
            <CreateRecurringDialog
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                workspaceSlug={workspaceSlug}
            />
            <div className="h-full overflow-y-auto">
                <div className="mx-auto max-w-5xl px-10 py-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-7">
                        <div>
                            <Eyebrow>
                                Tareas que se repiten · {isLoading ? '…' : `${templates.length} plantillas activas`}
                            </Eyebrow>
                            <h1 className="mt-2 text-[56px] font-medium tracking-[-0.05em] leading-[0.95] text-[var(--neutral-1200)]">
                                Recurrentes.
                            </h1>
                            <p className="mt-2 text-[14.5px] text-[var(--neutral-600)] max-w-[600px] leading-[1.55]">
                                Plantillas que generan issues automáticamente según un calendario. Perfecto para cierres mensuales, conciliaciones, declaraciones y reportes regulatorios.
                            </p>
                        </div>
                        <div className="shrink-0 mt-2">
                            <Button
                                className="gap-2 bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[#f0eadf]"
                                onClick={() => setCreateOpen(true)}
                            >
                                <Plus size={14} />
                                Nueva recurrente
                            </Button>
                        </div>
                    </div>

                    {/* Stat cards */}
                    {!isLoading && (
                        <div className="grid grid-cols-4 gap-3 mb-8">
                            <StatCard
                                label="Activas"
                                value={activeCount}
                                sub="generando issues"
                                accent="var(--green-700)"
                            />
                            <StatCard
                                label="Pausadas"
                                value={pausedCount}
                                sub="no generan hasta reactivar"
                                accent="var(--amber-700)"
                            />
                            <StatCard
                                label="Total plantillas"
                                value={templates.length}
                                sub="en este workspace"
                                accent="var(--brand-700)"
                            />
                            <StatCard
                                label="Próximo trigger"
                                value={nextTriggerLabel}
                                sub={nextTriggerItem?.name ?? 'sin próximas'}
                                accent="#6b6298"
                            />
                        </div>
                    )}

                    {/* Cadence tabs */}
                    <div className="flex gap-1 border-b border-[var(--neutral-400)] mb-4">
                        {TABS.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setTabFilter(tab.value)}
                                className={cn(
                                    'inline-flex items-center gap-2 px-[14px] py-[10px] border-b-2 text-[13px] font-medium transition-colors mb-[-1px] tracking-[-0.005em]',
                                    tabFilter === tab.value
                                        ? 'border-[var(--brand-700)] text-[var(--neutral-1200)]'
                                        : 'border-transparent text-[var(--neutral-600)] hover:text-[var(--neutral-1200)]',
                                )}
                            >
                                {tab.label}
                                <span className="font-mono text-[10px] opacity-60">
                                    {tabCounts[tab.value]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-600)]" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar plantillas recurrentes…"
                            className="pl-9 text-sm bg-white border-[var(--neutral-400)]"
                        />
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="space-y-2">
                            {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                                <div
                                    key={k}
                                    className="flex items-center gap-3 p-4 bg-white border border-[var(--neutral-400)] rounded-lg"
                                >
                                    <Skeleton className="h-8 w-8 rounded-md bg-[var(--neutral-200)] shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-4 w-48 bg-[var(--neutral-200)]" />
                                        <Skeleton className="h-3 w-32 bg-[var(--neutral-200)]" />
                                    </div>
                                    <Skeleton className="h-4 w-28 bg-[var(--neutral-200)]" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty */}
                    {!isLoading && filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-14 h-14 rounded-lg bg-[var(--neutral-200)] flex items-center justify-center mb-4">
                                <Repeat2 size={24} className="text-[var(--neutral-600)]" />
                            </div>
                            <h2 className="text-[18px] font-medium text-[var(--neutral-1200)] mb-2">
                                {query || tabFilter !== 'all' ? 'Sin resultados' : 'No hay plantillas recurrentes'}
                            </h2>
                            <p className="text-[13px] text-[var(--neutral-600)] mb-6 max-w-sm">
                                {query || tabFilter !== 'all'
                                    ? 'Probá con otro filtro o búsqueda'
                                    : 'Creá tu primera plantilla para automatizar trabajo repetitivo'}
                            </p>
                            {!query && tabFilter === 'all' && (
                                <Button
                                    className="gap-2 bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[#f0eadf]"
                                    onClick={() => setCreateOpen(true)}
                                >
                                    <Plus size={14} />
                                    Nueva recurrente
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
