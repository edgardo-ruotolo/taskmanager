import type React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// ---------------------------------------------------------------------------
// Sparkline data helpers
// ---------------------------------------------------------------------------

interface SparkPoint {
	v: number;
}

// Static placeholder sparklines (no Math.random — deterministic per card)
const SPARK_TODAY: SparkPoint[] = [
	{ v: 12 }, { v: 15 }, { v: 11 }, { v: 18 }, { v: 14 }, { v: 16 }, { v: 18 },
];
const SPARK_REVIEW: SparkPoint[] = [
	{ v: 5 }, { v: 8 }, { v: 6 }, { v: 9 }, { v: 7 }, { v: 7 }, { v: 7 },
];
const SPARK_DUE: SparkPoint[] = [
	{ v: 3 }, { v: 2 }, { v: 5 }, { v: 4 }, { v: 3 }, { v: 4 }, { v: 4 },
];
const SPARK_DONE: SparkPoint[] = [
	{ v: 15 }, { v: 18 }, { v: 20 }, { v: 17 }, { v: 22 }, { v: 21 }, { v: 23 },
];

// ---------------------------------------------------------------------------
// Sparkline component
// ---------------------------------------------------------------------------

interface SparklineProps {
	data: SparkPoint[];
	color?: string;
	className?: string;
}

function Sparkline({ data, color = 'var(--brand-700)', className }: SparklineProps): React.ReactElement {
	return (
		<div className={cn('w-16 h-8 shrink-0', className)} aria-hidden="true">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
					<Line
						type="monotone"
						dataKey="v"
						stroke={color}
						strokeWidth={1.5}
						dot={false}
						isAnimationActive={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
	label: string;
	value: string | number;
	sparkData: SparkPoint[];
	sparkColor?: string;
	isLoading?: boolean;
	className?: string;
}

function StatCard({
	label,
	value,
	sparkData,
	sparkColor,
	isLoading = false,
	className,
}: StatCardProps): React.ReactElement {
	return (
		<div
			className={cn(
				'flex flex-col gap-1 p-5 bg-white border border-[var(--neutral-300)] rounded-xl',
				'shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]',
				'transition-all duration-200 group',
				className,
			)}
		>
			<span className="text-[11px] font-mono font-semibold text-[var(--neutral-600)] uppercase tracking-[0.14em] mb-1">
				{label}
			</span>
			<div className="flex items-end justify-between gap-2">
				{isLoading ? (
					<Skeleton className="h-8 w-16 bg-[var(--neutral-200)]" />
				) : (
					<span className="text-[32px] font-mono font-medium text-[var(--neutral-1200)] tracking-[-0.04em] leading-none group-hover:text-[var(--brand-700)] transition-colors">
						{value}
					</span>
				)}
				{!isLoading && (
					<Sparkline
						data={value === '—' ? [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }] : sparkData}
						color={sparkColor}
					/>
				)}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// HomeStatsRow
// ---------------------------------------------------------------------------

interface HomeStatsRowProps {
	assignedCount: number | null | undefined;
	reviewCount: number | null | undefined;
	dueTodayCount: number | null | undefined;
	doneThisWeekCount: number | null | undefined;
	isLoading?: boolean;
}

function formatStat(value: number | null | undefined): string | number {
	if (value == null) return '—';
	return value;
}

export function HomeStatsRow({
	assignedCount,
	reviewCount,
	dueTodayCount,
	doneThisWeekCount,
	isLoading = false,
}: HomeStatsRowProps): React.ReactElement {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			<StatCard
				label="Hoy"
				value={formatStat(assignedCount)}
				sparkData={SPARK_TODAY}
				sparkColor="var(--brand-700)"
				isLoading={isLoading}
			/>
			<StatCard
				label="Por revisar"
				value={formatStat(reviewCount)}
				sparkData={SPARK_REVIEW}
				sparkColor="var(--brand-700)"
				isLoading={isLoading}
			/>
			<StatCard
				label="Cierran hoy"
				value={formatStat(dueTodayCount)}
				sparkData={SPARK_DUE}
				sparkColor="#c54a3a"
				isLoading={isLoading}
			/>
			<StatCard
				label="Done · esta semana"
				value={formatStat(doneThisWeekCount)}
				sparkData={SPARK_DONE}
				sparkColor="var(--moss)"
				isLoading={isLoading}
			/>
		</div>
	);
}
