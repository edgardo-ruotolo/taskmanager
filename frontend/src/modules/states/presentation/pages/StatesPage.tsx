import type React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useStateGroups } from '../../application/use-states';
import { StatePip } from '@/components/ui/state-pip';
import type { StateCategory } from '../../domain/types';

const CATEGORY_ORDER: StateCategory[] = ['Backlog', 'Unstarted', 'Started', 'Completed', 'Cancelled'];

const CATEGORY_LABELS: Record<StateCategory, string> = {
    Backlog: 'Backlog',
    Unstarted: 'Todo',
    Started: 'In Progress',
    Completed: 'Done',
    Cancelled: 'Cancelled',
};

export const StatesPage = (): React.ReactElement => {
    const { data: groups, isLoading } = useStateGroups();

    return (
        <div className="animate-fade-in pb-20">
            {isLoading && (
                <div className="space-y-10">
                    {(['sk-0', 'sk-1'] as const).map((k) => (
                        <div key={k} className="space-y-4">
                            <Skeleton className="h-6 w-48 bg-[var(--neutral-200)]" />
                            <div className="space-y-1 bg-white border border-[var(--neutral-300)] rounded-lg p-1">
                                {(['skr-0', 'skr-1', 'skr-2'] as const).map((j) => (
                                    <Skeleton key={j} className="h-11 w-full bg-[var(--neutral-100)]" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && groups && groups.length > 0 && (
                <div className="space-y-12">
                    {groups.map((group) => (
                        <div key={group.id}>
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-[18px] font-semibold text-[var(--neutral-1200)] tracking-[-0.02em]">{group.name}</h2>
                                {group.isDefault && (
                                    <span className="text-[10px] font-mono font-medium text-[var(--neutral-600)] bg-[var(--neutral-200)] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        Default
                                    </span>
                                )}
                            </div>

                            <div className="space-y-6">
                                {CATEGORY_ORDER.map((category) => {
                                    const categoryStates = group.states
                                        .filter((s) => s.category === category)
                                        .sort((a, b) => a.sequence - b.sequence);
                                    if (categoryStates.length === 0) return null;
                                    return (
                                        <div key={category}>
                                            <h3 className="text-[11px] font-mono font-semibold text-[var(--neutral-600)] uppercase tracking-[0.14em] mb-2.5 px-1">
                                                {CATEGORY_LABELS[category]}
                                            </h3>
                                            <div className="bg-white border border-[var(--neutral-300)] rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                                                <div className="divide-y divide-[var(--neutral-300)]">
                                                    {categoryStates.map((state) => (
                                                        <div
                                                            key={state.id}
                                                            className="flex items-center gap-4 px-4 h-11 hover:bg-[var(--neutral-100)] transition-colors group"
                                                        >
                                                            <StatePip state={category.toLowerCase() as Parameters<typeof StatePip>[0]['state']} size={14} />
                                                            <span className="text-[13.5px] text-[var(--neutral-1200)] font-medium flex-1">{state.name}</span>
                                                            {state.isDefault && (
                                                                <span className="text-[10px] font-mono text-[var(--neutral-600)] opacity-60 uppercase">Default</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
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
    );
};
