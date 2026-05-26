import type React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import type { Cycle } from '@/modules/cycles/domain/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCycleDates(startDate: string | null, endDate: string | null): string {
	if (!startDate && !endDate) return 'Sin fechas';
	const fmt = (d: string): string =>
		new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
	if (startDate && endDate) return `${fmt(startDate)} — ${fmt(endDate)}`;
	if (startDate) return `Desde ${fmt(startDate)}`;
	return `Hasta ${fmt(endDate as string)}`;
}

function getCycleProgress(_cycle: Cycle): number {
	// TODO(backend): add completedIssueCount to Cycle type for accurate progress
	return 0;
}

// ---------------------------------------------------------------------------
// CycleRow — compact for narrow sidebar column
// ---------------------------------------------------------------------------

interface CycleRowProps {
	cycle: Cycle;
}

function CycleRow({ cycle }: CycleRowProps): React.ReactElement {
	const progress = getCycleProgress(cycle);
	const dateRange = formatCycleDates(cycle.startDate, cycle.endDate);

	return (
		<div className="flex flex-col gap-2 py-3 border-b border-[var(--neutral-300)] last:border-b-0">
			{/* Name + issue count */}
			<div className="flex items-center justify-between gap-2">
				<span className="text-[13px] font-medium text-[var(--neutral-1200)] tracking-[-0.02em] line-clamp-1 flex-1 min-w-0">
					{cycle.name}
				</span>
				<span className="shrink-0 font-mono text-[11px] font-medium text-[var(--neutral-600)] tabular-nums">
					{/* TODO(backend): expose completedIssueCount on Cycle */}
					{cycle.issueCount}
				</span>
			</div>

			{/* Progress bar */}
			<Progress value={progress} className="h-1" />

			{/* Dates + percentage */}
			<div className="flex items-center justify-between gap-1">
				<span className="font-mono text-[10.5px] text-[var(--neutral-500)] tracking-wide">
					{dateRange}
				</span>
				<span className="font-mono text-[10.5px] text-[var(--neutral-500)]">
					{progress}%
				</span>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// HomeActiveCycles
// ---------------------------------------------------------------------------

interface HomeActiveCyclesProps {
	cycles: Cycle[];
	isLoading?: boolean;
}

export function HomeActiveCycles({ cycles, isLoading = false }: HomeActiveCyclesProps): React.ReactElement {
	if (isLoading) {
		return (
			<div className="flex flex-col gap-3">
				{(['a', 'b', 'c'] as const).map((k) => (
					<Skeleton key={k} className="h-16 w-full bg-[var(--neutral-200)] rounded-lg" />
				))}
			</div>
		);
	}

	if (cycles.length === 0) {
		return (
			<div className="py-6 text-center">
				<p className="text-[13px] text-[var(--neutral-600)]">No hay ciclos activos.</p>
				{/* TODO(backend): add workspace-level active cycles endpoint */}
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			{cycles.map((cycle) => (
				<CycleRow key={cycle.id} cycle={cycle} />
			))}
		</div>
	);
}
