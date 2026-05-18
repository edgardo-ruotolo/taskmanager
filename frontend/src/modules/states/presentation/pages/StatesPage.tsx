import type React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Circle } from 'lucide-react';
import { useStateGroups } from '../../application/use-states';
import type { StateCategory } from '../../domain/types';

const CATEGORY_ORDER: StateCategory[] = ['Backlog', 'Unstarted', 'Started', 'Completed', 'Cancelled'];

const CATEGORY_LABELS: Record<StateCategory, string> = {
    Backlog: 'Backlog',
    Unstarted: 'Sin iniciar',
    Started: 'En progreso',
    Completed: 'Completado',
    Cancelled: 'Cancelado',
};

export const StatesPage = (): React.ReactElement => {
    const { data: groups, isLoading } = useStateGroups();

    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-primary">Estados</h1>
                    <p className="text-sm text-tertiary mt-1">
                        Grupos de estados disponibles en el sistema
                    </p>
                </div>

                {isLoading && (
                    <div className="space-y-6">
                        {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                            <div key={k} className="space-y-2">
                                <Skeleton className="h-5 w-40 bg-layer-1" />
                                <div className="space-y-2">
                                    {(['skr-0', 'skr-1', 'skr-2'] as const).map((j) => (
                                        <Skeleton key={j} className="h-10 w-full bg-layer-1" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && (!groups || groups.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-subtle flex items-center justify-center mb-3">
                            <Circle size={20} className="text-placeholder" />
                        </div>
                        <p className="text-sm text-placeholder">No hay grupos de estados configurados</p>
                    </div>
                )}

                {!isLoading && groups && groups.length > 0 && (
                    <div className="space-y-8">
                        {groups.map((group) => (
                            <div key={group.id}>
                                <div className="flex items-center gap-2 mb-3">
                                    <h2 className="text-sm font-semibold text-primary">{group.name}</h2>
                                    {group.isDefault && (
                                        <span className="text-xs text-placeholder bg-layer-1 border border-subtle px-2 py-0.5 rounded-full">
                                            Por defecto
                                        </span>
                                    )}
                                    {group.description && (
                                        <span className="text-xs text-tertiary ml-1">{group.description}</span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {CATEGORY_ORDER.map((category) => {
                                        const categoryStates = group.states
                                            .filter((s) => s.category === category)
                                            .sort((a, b) => a.sequence - b.sequence);
                                        if (categoryStates.length === 0) return null;
                                        return (
                                            <div key={category}>
                                                <h3 className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-1.5">
                                                    {CATEGORY_LABELS[category]}
                                                </h3>
                                                <div className="space-y-1">
                                                    {categoryStates.map((state) => (
                                                        <div
                                                            key={state.id}
                                                            className="flex items-center gap-3 px-3 py-2.5 bg-surface-1/50 border border-subtle rounded-md"
                                                        >
                                                            <span
                                                                className="w-3 h-3 rounded-full shrink-0"
                                                                style={{ backgroundColor: state.color }}
                                                                aria-hidden="true"
                                                            />
                                                            <span className="text-sm text-primary">{state.name}</span>
                                                            {state.isDefault && (
                                                                <span className="ml-auto text-xs text-placeholder bg-layer-1 px-2 py-0.5 rounded-full">
                                                                    Por defecto
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
