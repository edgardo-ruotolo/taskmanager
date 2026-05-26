import type React from 'react';
import { Fragment, useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Link2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useAuthMe } from '@/modules/auth/application/use-auth-me';
import { useProjects } from '@/modules/projects/application/use-projects';
import {
	useRecentVisits,
	useQuickLinks,
	useCreateQuickLink,
	useDeleteQuickLink,
} from '@/modules/home/application/use-home';
import type { CreateQuickLinkData } from '@/modules/home/domain/types';
import { useWorkspaceActivity } from '../../application/use-activity';
import { ACTION_LABELS } from '../../domain/activity-types';
import { HomeStatsRow } from '../components/HomeStatsRow';
import { HomeDaySummary } from '../components/HomeDaySummary';
import { HomeActiveCycles } from '../components/HomeActiveCycles';
import { HomeFavorites } from '../components/HomeFavorites';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return 'Buenos días';
	if (hour < 18) return 'Buenas tardes';
	return 'Buenas noches';
}

function formatDateEyebrow(): string {
	const now = new Date();
	const weekNumber = Math.ceil(
		(now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7,
	);
	const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(now);
	const day = now.getDate();
	const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(now);
	return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} · ${day} ${month} · semana ${weekNumber}`;
}

function formatRelativeTime(isoDate: string): string {
	const diff = Date.now() - new Date(isoDate).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return 'ahora';
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h`;
	const days = Math.floor(hours / 24);
	return `${days}d`;
}

function entityTypeIcon(entityType: string): string {
	switch (entityType.toLowerCase()) {
		case 'issue': return '✅';
		case 'project': return '🏢';
		case 'cycle': return '🔄';
		case 'module': return '📦';
		default: return '📄';
	}
}

function getInitials(name: string): string {
	return name
		.split(' ')
		.slice(0, 2)
		.map((n) => n[0] ?? '')
		.join('')
		.toUpperCase();
}

const ACTOR_COLORS = [
	'var(--brand-700)',
	'var(--green-700)',
	'var(--amber-700)',
	'#6b6298',
	'var(--neutral-1200)',
] as const;

function getActorColor(name: string): string {
	const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return ACTOR_COLORS[hash % ACTOR_COLORS.length] ?? 'var(--brand-700)';
}

// ---------------------------------------------------------------------------
// Home tabs
// ---------------------------------------------------------------------------

type HomeTab = 'BRIEFS' | 'DE HOY' | 'ISSUES' | 'IA';
const HOME_TABS: HomeTab[] = ['BRIEFS', 'DE HOY', 'ISSUES', 'IA'];

interface HomeTabsProps {
	active: HomeTab;
	onChange: (tab: HomeTab) => void;
}

function HomeTabs({ active, onChange }: HomeTabsProps): React.ReactElement {
	return (
		<div className="flex items-center gap-0" role="tablist" aria-label="Secciones del home">
			{HOME_TABS.map((tab, i) => (
				<Fragment key={tab}>
					<button
						type="button"
						role="tab"
						aria-selected={active === tab}
						onClick={() => onChange(tab)}
						className={[
							'font-mono text-[11px] font-semibold uppercase tracking-[0.12em] px-0 pb-1 transition-colors',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-700)] rounded-sm',
							active === tab
								? 'text-[var(--neutral-1200)] border-b-2 border-[var(--brand-700)]'
								: 'text-[var(--neutral-500)] hover:text-[var(--neutral-800)] border-b-2 border-transparent',
						].join(' ')}
					>
						{tab}
					</button>
					{i < HOME_TABS.length - 1 && (
						<span
							className="font-mono text-[11px] text-[var(--neutral-400)] px-2 select-none"
							aria-hidden="true"
						>
							·
						</span>
					)}
				</Fragment>
			))}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Add Quick Link Dialog
// ---------------------------------------------------------------------------

interface AddQuickLinkDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateQuickLinkData) => void;
	isPending: boolean;
}

function AddQuickLinkDialog({
	open,
	onOpenChange,
	onSubmit,
	isPending,
}: AddQuickLinkDialogProps): React.ReactElement {
	const [title, setTitle] = useState('');
	const [url, setUrl] = useState('');
	const [description, setDescription] = useState('');

	const handleSubmit = (e: React.FormEvent): void => {
		e.preventDefault();
		if (!title.trim() || !url.trim()) return;
		onSubmit({
			title: title.trim(),
			url: url.trim(),
			description: description.trim() || undefined,
		});
		setTitle('');
		setUrl('');
		setDescription('');
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Agregar link rápido</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 pt-2">
					<div className="space-y-1.5">
						<Label htmlFor="ql-title">Título</Label>
						<Input
							id="ql-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Ej: Documentación del proyecto"
							required
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="ql-url">URL</Label>
						<Input
							id="ql-url"
							type="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://..."
							required
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="ql-desc">
							Descripción{' '}
							<span className="text-[var(--neutral-600)]">(opcional)</span>
						</Label>
						<Input
							id="ql-desc"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Descripción breve"
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={isPending || !title.trim() || !url.trim()}
						>
							{isPending ? 'Agregando…' : 'Agregar'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

// ---------------------------------------------------------------------------
// Section header helper
// ---------------------------------------------------------------------------

interface SectionHeaderProps {
	title: string;
	action?: React.ReactNode;
}

function SectionHeader({ title, action }: SectionHeaderProps): React.ReactElement {
	return (
		<div className="flex items-center justify-between mb-4">
			<h2 className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--neutral-1200)]">
				{title}
			</h2>
			{action}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function WorkspaceHomePage(): React.ReactElement {
	const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
	const slug = workspaceSlug ?? '';

	const { data: user } = useAuthMe();
	const firstName = user?.displayName?.split(' ')[0] ?? user?.firstName ?? 'Usuario';

	const [addLinkOpen, setAddLinkOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<HomeTab>('DE HOY');

	const { data: projects } = useProjects(slug);
	const { data: recentVisits } = useRecentVisits(slug, 8);
	const { data: quickLinks } = useQuickLinks(slug);
	const { mutate: createQuickLink, isPending: creatingLink } = useCreateQuickLink(slug);
	const { mutate: deleteQuickLink } = useDeleteQuickLink(slug);
	const { data: activityData, isLoading: activityLoading } = useWorkspaceActivity(slug);

	const activities = activityData?.items ?? [];
	const recentActivities = activities.slice(0, 5);

	// TODO(backend): GET /workspaces/:slug/home-summary devolver { assignedToMe, toReview, dueToday, doneThisWeek }
	const statsData = useMemo(() => ({
		assignedCount: undefined,
		reviewCount: undefined,
		dueTodayCount: undefined,
		doneThisWeekCount: undefined,
	}), []);

	// TODO(backend): add workspace-level active cycles endpoint
	const activeCycles = useMemo(() => [] as Parameters<typeof HomeActiveCycles>[0]['cycles'], []);

	// TODO(backend): add workspace-level issues endpoint for dashboard
	const daySummaryIssues = useMemo(() => [] as Parameters<typeof HomeDaySummary>[0]['issues'], []);

	return (
		<div className="h-full overflow-y-auto">
			<div className="w-full px-10 py-10 flex flex-col gap-8">

				{/* ── Hero ────────────────────────────────────────────────── */}
				<div className="flex flex-col gap-3">
					{/* Eyebrow date + tabs */}
					<div className="flex items-end justify-between gap-4">
						<HomeTabs active={activeTab} onChange={setActiveTab} />
						<span className="font-mono text-[11px] text-[var(--neutral-500)] tracking-[0.06em] pb-1">
							{formatDateEyebrow()}
						</span>
					</div>

					{/* H1 — no serif/italic on name */}
					<h1 className="text-[52px] font-medium tightest text-[var(--neutral-1200)] leading-none">
						{getGreeting()}, {firstName}.
					</h1>

					{/* Hero body: 2 columns — intro paragraph + AI summary mini card */}
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start mt-1">
						{/* Left: intro paragraph */}
						<p className="text-[15px] text-[var(--neutral-700)] leading-relaxed">
							<span className="font-serif italic text-[var(--neutral-1000)]">Cuatro</span>{' '}
							issues vencen hoy,{' '}
							<span className="font-serif italic text-[var(--neutral-1000)]">tres</span>{' '}
							ciclos cierran esta semana, y el equipo va{' '}
							<strong className="font-semibold text-[var(--neutral-1200)]">2 días adelantado</strong>{' '}
							en el cierre fiscal.
						</p>

						{/* Right: AI summary mini card */}
						<div className="flex items-start gap-3 px-4 py-3 bg-white border border-[var(--neutral-300)] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] shrink-0">
							<div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--terra)' }}>
								<Sparkles size={14} className="text-white" aria-hidden="true" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-1.5 mb-1">
									<span className="font-mono text-[11px] font-semibold text-[var(--neutral-1200)] uppercase tracking-[0.08em]">
										Resumen IA
									</span>
									<Badge
										variant="secondary"
										className="text-[9px] font-mono px-1 py-0 h-4 bg-violet-100 text-violet-700 border-0 leading-none tracking-widest"
									>
										IA
									</Badge>
								</div>
								<p className="text-[12px] text-[var(--neutral-700)] leading-relaxed">
									{/* TODO(backend): connect to AI summary endpoint */}
									Tenés ancho de banda para tomar 2 issues más sin riesgo de slip.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* ── Stats row ────────────────────────────────────────────── */}
				<HomeStatsRow
					assignedCount={statsData.assignedCount}
					reviewCount={statsData.reviewCount}
					dueTodayCount={statsData.dueTodayCount}
					doneThisWeekCount={statsData.doneThisWeekCount}
				/>

				{/* ── Body: 2-column layout ────────────────────────────────── */}
				<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 items-start">

					{/* ── Left column ─────────────────────────────────────── */}
					<div className="flex flex-col gap-8">

						{/* Tu día */}
						<div>
							<SectionHeader title="Tu día" />
							<HomeDaySummary issues={daySummaryIssues} />
						</div>

						{/* Actividad reciente */}
						<div>
							<SectionHeader title="Actividad reciente" />
							{activityLoading ? (
								<div className="space-y-3">
									{(['a0', 'a1', 'a2'] as const).map((k) => (
										<div key={k} className="flex gap-3 items-center">
											<Skeleton className="w-6 h-6 rounded-full bg-[var(--neutral-200)] shrink-0" />
											<Skeleton className="h-3 flex-1 bg-[var(--neutral-200)]" />
											<Skeleton className="h-3 w-10 bg-[var(--neutral-200)]" />
										</div>
									))}
								</div>
							) : recentActivities.length === 0 ? (
								<div className="rounded-xl border border-[var(--neutral-300)] bg-white p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
									<p className="text-[14px] text-[var(--neutral-600)] font-medium">
										No hay actividad reciente todavía.
									</p>
								</div>
							) : (
								<div className="flex flex-col divide-y divide-[var(--neutral-300)] rounded-xl border border-[var(--neutral-300)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
									{recentActivities.map((activity) => {
										const color = getActorColor(activity.actorName);
										return (
											<div
												key={activity.id}
												className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--neutral-50)] transition-colors"
											>
												<div
													className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-bold text-white"
													style={{ background: color }}
													role="img"
													aria-label={activity.actorName}
												>
													{getInitials(activity.actorName)}
												</div>
												<div className="flex-1 text-[13px] text-[var(--neutral-700)] truncate">
													<strong className="font-medium text-[var(--neutral-1200)]">
														{activity.actorName}
													</strong>{' '}
													{ACTION_LABELS[activity.action] ?? activity.action}
													{activity.entityTitle && (
														<>
															{' '}
															<span className="font-mono bg-[var(--neutral-200)] px-1.5 py-[1px] rounded-[3px] text-[11px] font-medium text-[var(--neutral-1200)]">
																{activity.entityTitle}
															</span>
														</>
													)}
												</div>
												<span className="shrink-0 font-mono text-[10.5px] text-[var(--neutral-500)]">
													{formatRelativeTime(activity.createdAt)}
												</span>
											</div>
										);
									})}
								</div>
							)}
						</div>

						{/* Visitas recientes */}
						{(recentVisits?.length ?? 0) > 0 && (
							<div>
								<SectionHeader title="Visitas recientes" />
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									{recentVisits?.slice(0, 8).map((visit) => (
										<NavLink
											key={visit.id}
											to={visit.entityUrl ?? '#'}
											className="flex flex-col gap-3 p-4 bg-white border border-[var(--neutral-300)] rounded-xl hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-[var(--neutral-400)] transition-all group"
										>
											<div className="flex items-center justify-between">
												<span
													className="shrink-0 text-lg opacity-80 group-hover:scale-110 transition-transform"
													aria-hidden="true"
												>
													{entityTypeIcon(visit.entityType)}
												</span>
												<span className="text-[10px] font-mono font-medium text-[var(--neutral-600)] uppercase tracking-wider">
													{formatRelativeTime(visit.visitedAt)}
												</span>
											</div>
											<span className="text-[13.5px] font-medium text-[var(--neutral-1200)] line-clamp-2 leading-snug tracking-[-0.01em]">
												{visit.entityTitle}
											</span>
										</NavLink>
									))}
								</div>
							</div>
						)}

						{/* Links rápidos */}
						<div>
							<SectionHeader
								title="Links rápidos"
								action={
									<button
										type="button"
										onClick={() => setAddLinkOpen(true)}
										className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] transition-colors"
									>
										<Plus size={14} aria-hidden="true" />
										Agregar
									</button>
								}
							/>
							{(quickLinks?.length ?? 0) === 0 ? (
								<div className="rounded-xl border border-dashed border-[var(--neutral-400)] bg-white/50 p-10 text-center">
									<p className="text-[14px] text-[var(--neutral-600)]">
										Sin links rápidos todavía.
									</p>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setAddLinkOpen(true)}
										className="mt-3 text-[var(--brand-700)] hover:text-[var(--brand-800)] hover:bg-[var(--brand-700)]/5"
									>
										Agregar el primero
									</Button>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
									{quickLinks?.map((link) => (
										<div
											key={link.id}
											className="group relative flex items-start gap-3 rounded-xl border border-[var(--neutral-300)] bg-white p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all"
										>
											<div className="p-2 rounded-lg bg-[var(--neutral-100)] text-[var(--neutral-600)] group-hover:text-[var(--brand-700)] transition-colors">
												<Link2 size={16} aria-hidden="true" />
											</div>
											<div className="flex-1 min-w-0">
												<a
													href={link.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-[14px] font-semibold text-[var(--neutral-1200)] hover:underline flex items-center gap-1 truncate"
												>
													{link.title}
												</a>
												{link.description && (
													<p className="text-[12px] text-[var(--neutral-700)] line-clamp-1 mt-0.5">
														{link.description}
													</p>
												)}
											</div>
											<button
												type="button"
												onClick={() => deleteQuickLink(link.id)}
												className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--neutral-500)] hover:text-red-500"
												aria-label={`Eliminar link ${link.title}`}
											>
												<Trash2 size={14} aria-hidden="true" />
											</button>
										</div>
									))}
								</div>
							)}
							<AddQuickLinkDialog
								open={addLinkOpen}
								onOpenChange={setAddLinkOpen}
								onSubmit={(data) => {
									createQuickLink(data);
									setAddLinkOpen(false);
								}}
								isPending={creatingLink}
							/>
						</div>

						{/* Proyectos */}
						{(projects?.items?.length ?? 0) > 0 && (
							<div>
								<SectionHeader title="Proyectos" />
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									{projects?.items.map((project) => (
										<NavLink
											key={project.id}
											to={`/${slug}/projects/${project.id}/issues`}
											className="flex items-center gap-3 rounded-xl border border-[var(--neutral-300)] bg-white p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all"
										>
											<span className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-700)] text-[13px] font-bold text-white shrink-0">
												{project.identifier.slice(0, 2).toUpperCase()}
											</span>
											<div className="min-w-0">
												<p className="text-[14px] font-semibold text-[var(--neutral-1200)] truncate tracking-[-0.01em]">
													{project.name}
												</p>
												<p className="text-[11px] font-mono text-[var(--neutral-600)] uppercase tracking-wider">
													{project.identifier}
												</p>
											</div>
										</NavLink>
									))}
								</div>
							</div>
						)}

					</div>

					{/* ── Right column ─────────────────────────────────────── */}
					<div className="flex flex-col gap-8">

						{/* Ciclos activos */}
						<div>
							<SectionHeader title="Ciclos activos" />
							<HomeActiveCycles cycles={activeCycles} />
						</div>

						{/* Favoritos */}
						<div>
							<SectionHeader title="Favoritos" />
							<HomeFavorites />
						</div>

					</div>

				</div>

			</div>
		</div>
	);
}
