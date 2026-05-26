import type React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Building2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils';
import { useProjects } from '../../application/use-projects';
import { useProjectMembers } from '../../application/use-projects';
import { CreateProjectDialog } from '../components/CreateProjectDialog';
import {
    ProjectStatusBadge,
    inferProjectStatus,
} from '../components/ProjectStatusBadge';
import { ProjectMembersAvatarGroup } from '../components/ProjectMembersAvatarGroup';
import type { Project } from '../../domain/types';

const ACCENT_COLORS = [
    'var(--brand-700)',
    'var(--green-700)',
    'var(--amber-700)',
    '#6b6298',
    'var(--neutral-1200)',
];

function getAccentColor(index: number): string {
    return ACCENT_COLORS[index % ACCENT_COLORS.length] ?? 'var(--brand-700)';
}

// TODO(backend): Project DTO does not expose totalIssues, completedIssues, closingDate.
// Using 0/0 and '—' fallbacks until backend adds these fields.
interface ProjectCardProps {
    project: Project;
    accentColor: string;
    workspaceSlug: string;
    onClick: () => void;
}

function ProjectCard({
    project,
    accentColor,
    workspaceSlug,
    onClick,
}: ProjectCardProps): React.ReactElement {
    const initials = project.identifier.slice(0, 2).toUpperCase();
    const { data: members = [] } = useProjectMembers(workspaceSlug, project.id);

    // TODO(backend): stateGroupName is used to infer status since no isArchived field exists.
    const status = inferProjectStatus(false, project.stateGroupName);
    const isArchived = status === 'archived';

    // TODO(backend): closingDate not in DTO — showing '—' fallback.
    const closingDateLabel = '—';

    // TODO(backend): totalIssues/completedIssues not in DTO — showing 0/0.
    const totalIssues = 0;
    const completedIssues = 0;
    const cyclesCount = 0;
    const progressPct = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group relative w-full text-left bg-white rounded-lg border border-[var(--neutral-400)] p-5 overflow-hidden hover:border-[var(--neutral-700)] transition-colors duration-150 flex flex-col gap-3',
                isArchived && 'opacity-60',
            )}
        >
            {/* Top accent bar */}
            <span
                className="absolute top-0 left-0 w-8 h-[3px]"
                style={{ background: accentColor }}
                aria-hidden="true"
            />

            {/* Header: mark + name + identifier + status badge */}
            <div className="flex items-start gap-3 mt-1">
                <span
                    className="w-9 h-9 rounded-md flex items-center justify-center text-[13px] font-bold text-white shrink-0 mt-0.5"
                    style={{ background: accentColor }}
                    aria-hidden="true"
                >
                    {initials}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-[18px] font-medium tight text-[var(--neutral-1200)] truncate leading-tight">
                            {project.name}
                        </div>
                        <ProjectStatusBadge status={status} />
                        {isArchived && (
                            <span className="mono text-[10px] text-[var(--neutral-600)] font-medium tracking-[0.04em]">
                                ◆ Archived
                            </span>
                        )}
                    </div>
                    <div className="font-mono text-[10.5px] text-[var(--neutral-600)] mt-0.5 tracking-[0.05em]">
                        /{project.identifier.toLowerCase()} · Interno
                    </div>
                </div>
            </div>

            {/* Description */}
            {project.description && (
                <p className="text-[13px] text-[var(--neutral-600)] leading-[1.55] tracking-[-0.005em] line-clamp-2">
                    {project.description}
                </p>
            )}

            {/* Stats row */}
            <div className="flex items-end gap-5 pt-3 border-t border-[var(--neutral-400)]">
                <div>
                    <div className="font-mono text-[9.5px] text-[var(--neutral-600)] uppercase tracking-[0.1em]">
                        Issues
                    </div>
                    <div className="text-[16px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)] leading-tight">
                        {completedIssues}
                        <span className="text-[var(--neutral-600)] font-normal">
                            /{totalIssues}
                        </span>
                    </div>
                    <div
                        className="mt-1 h-[2px] rounded-full"
                        style={{
                            width: '60%',
                            background: 'var(--terra, #c2704f)',
                        }}
                        aria-hidden="true"
                    />
                </div>
                <div>
                    <div className="font-mono text-[9.5px] text-[var(--neutral-600)] uppercase tracking-[0.1em]">
                        Ciclos
                    </div>
                    <div className="text-[16px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)] leading-tight">
                        {cyclesCount}
                    </div>
                    <div
                        className="mt-1 h-[2px] rounded-full"
                        style={{
                            width: '40%',
                            background: 'var(--terra, #c2704f)',
                        }}
                        aria-hidden="true"
                    />
                </div>
                <div>
                    <div className="font-mono text-[9.5px] text-[var(--neutral-600)] uppercase tracking-[0.1em]">
                        Cierre
                    </div>
                    <div className="text-[13px] font-medium text-[var(--neutral-700)] leading-tight">
                        {closingDateLabel}
                    </div>
                </div>
                <div className="ml-auto flex items-end">
                    <ProjectMembersAvatarGroup members={members} maxVisible={4} />
                </div>
            </div>

            {/* Progress bar */}
            {totalIssues > 0 && (
                <div className="space-y-1">
                    <div
                        className="h-1 w-full rounded-full bg-[var(--neutral-200)] overflow-hidden"
                        role="progressbar"
                        aria-valuenow={progressPct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Progreso: ${progressPct}%`}
                    >
                        <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
            )}
        </button>
    );
}

export const ProjectsPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const navigate = useNavigate();
    const { data, isLoading } = useProjects(workspaceSlug);

    const projects = data?.items ?? [];
    // TODO(backend): no isArchived in Project DTO — treating all as active.
    const activeCount = projects.length;

    return (
        <div className="h-full overflow-y-auto">
            <div className="w-full px-10 py-8">
                {/* Sub-header */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    {/* Left: icon + title */}
                    <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-[var(--neutral-600)] shrink-0" aria-hidden="true" />
                        <span className="text-[13px] font-medium text-[var(--neutral-1200)]">
                            Companies
                        </span>
                        {!isLoading && (
                            <span className="font-mono text-[11px] text-[var(--neutral-500)] ml-1">
                                · {activeCount} activas
                            </span>
                        )}
                    </div>
                    {/* Right: action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="outline"
                            className="gap-2 border-[var(--neutral-400)] text-[var(--neutral-700)] hover:bg-[var(--neutral-100)]"
                            onClick={() => {
                                // TODO: implement filter panel
                            }}
                        >
                            <Filter size={13} />
                            Filtrar
                        </Button>
                        <CreateProjectDialog
                            workspaceSlug={workspaceSlug}
                            trigger={
                                <Button className="gap-2 bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[#f0eadf]">
                                    <Plus size={14} />
                                    Nueva company
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* Hero header */}
                <div className="mb-8">
                    <Eyebrow>
                        Tus proyectos · {isLoading ? '…' : `${activeCount} activos`}
                    </Eyebrow>
                    <h1 className="mt-2 text-[56px] font-medium tightest text-[var(--neutral-1200)]">
                        Companies.
                    </h1>
                    <p className="mt-2 text-[14.5px] text-[var(--neutral-600)] max-w-[600px]">
                        Cada company es un proyecto con su propia jerarquía de issues, ciclos y módulos.
                        Comparten el sidebar de Pages, Inbox y Analytics.
                    </p>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="grid grid-cols-2 gap-5">
                        {(['sk-0', 'sk-1', 'sk-2', 'sk-3'] as const).map((k) => (
                            <div
                                key={k}
                                className="bg-white border border-[var(--neutral-400)] rounded-lg p-5 space-y-3"
                            >
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 rounded-md bg-[var(--neutral-200)]" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-4 w-2/3 bg-[var(--neutral-200)]" />
                                        <Skeleton className="h-3 w-1/3 bg-[var(--neutral-200)]" />
                                    </div>
                                </div>
                                <Skeleton className="h-3 w-full bg-[var(--neutral-200)]" />
                                <Skeleton className="h-3 w-4/5 bg-[var(--neutral-200)]" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!isLoading && projects.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-14 h-14 rounded-lg bg-[var(--neutral-200)] flex items-center justify-center mb-4">
                            <Building2 size={24} className="text-[var(--neutral-600)]" />
                        </div>
                        <h2 className="text-[18px] font-medium text-[var(--neutral-1200)] mb-2">
                            No hay companies aún
                        </h2>
                        <p className="text-[13px] text-[var(--neutral-600)] mb-6">
                            Crea la primera company de este workspace
                        </p>
                        <CreateProjectDialog
                            workspaceSlug={workspaceSlug}
                            trigger={
                                <Button
                                    className={cn(
                                        'gap-2 bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[#f0eadf]',
                                    )}
                                >
                                    <Plus size={14} />
                                    Crear primera company
                                </Button>
                            }
                        />
                    </div>
                )}

                {/* Grid */}
                {!isLoading && projects.length > 0 && (
                    <div className="grid grid-cols-2 gap-5">
                        {projects.map((project, index) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                accentColor={getAccentColor(index)}
                                workspaceSlug={workspaceSlug}
                                onClick={() =>
                                    void navigate(
                                        `/${workspaceSlug}/projects/${project.id}/issues`,
                                    )
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
