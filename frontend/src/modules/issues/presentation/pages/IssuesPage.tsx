import type React from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Plus,
    LayoutList,
    Columns,
    CalendarDays,
    GanttChartSquare,
    GripVertical,
    CircleDashed,
    Lock,
    ChevronDown,
    ChevronRight,
    Filter,
    Flag,
    Calendar,
} from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatePip } from '@/components/ui/state-pip';
import { PriorityDot } from '@/components/ui/priority-dot';
import { cn } from '@/lib/utils';
import { useIssues, useCreateIssue, useUpdateIssue } from '../../application/use-issues';
import { useProjectStates } from '@/modules/states/application/use-states';
import { useProject, useProjectMembers } from '@/modules/projects/application/use-projects';
import { getProjectFeatures, type ProjectFeatures } from '@/modules/projects/application/use-project-features';
import { useAuthMe } from '@/modules/auth/application/use-auth-me';
import { useLabels } from '@/modules/labels/application/use-labels';
import { useCycles } from '@/modules/cycles/application/use-cycles';
import { useModules } from '@/modules/modules/application/use-modules';
import { useWorkspaceMembers } from '@/modules/workspaces/application/use-workspaces';
import type { Cycle } from '@/modules/cycles/domain/types';
import type { Module } from '@/modules/modules/domain/types';
import { ApprovalRequiredDialog } from '../components/ApprovalRequiredDialog';
import type { Issue } from '../../domain/types';
import type { State } from '@/modules/states/domain/types';
import { PRIORITY_LABELS } from '../../domain/types';
import {
    createDndAnnouncements,
    dndScreenReaderInstructions,
} from '@/shared/lib/dnd-accessibility';
import type { IssuePriority } from '../../domain/types';
import { CreateIssueDialog } from '../components/CreateIssueDialog';
import { IssueRow, buildGridTemplate } from '../components/IssueRow';
import { IssueActionsMenu } from '../components/IssueActionsMenu';
import { IssueFilters } from '../components/IssueFilters';
import type { IssueFilter } from '../components/IssueFilters';
import { IssueGanttView } from '../components/IssueGanttView';
import { IssueCalendarView } from '../components/IssueCalendarView';
import { IssuePeekOverview } from '../components/IssuePeekOverview';
import {
    DisplayOptionsPanel,
    DEFAULT_DISPLAY_OPTIONS,
} from '../components/DisplayOptionsPanel';
import type { DisplayOptions, GroupByOption } from '../components/DisplayOptionsPanel';
import { useIssuesUiStore } from '../../application/issues-ui-store';
import { formatDateOnly } from '@/shared/lib/date';

type ViewMode = 'list' | 'kanban' | 'gantt' | 'calendar';

const STATE_PIP_VALUES = ['backlog', 'unstarted', 'started', 'completed', 'cancelled'] as const;
type StatePipState = (typeof STATE_PIP_VALUES)[number];

function toStatePipState(stateGroup?: string): StatePipState {
    const lower = stateGroup?.toLowerCase() ?? 'backlog';
    return (STATE_PIP_VALUES as readonly string[]).includes(lower)
        ? (lower as StatePipState)
        : 'backlog';
}

type PriorityDotValue = 'urgent' | 'high' | 'medium' | 'low' | 'none';

function mapPriority(priority: number): PriorityDotValue {
    const MAP: Record<number, PriorityDotValue> = { 1: 'urgent', 2: 'high', 3: 'medium', 4: 'low', 0: 'none' };
    return MAP[priority] ?? 'none';
}

/* ── View label for editorial subtitle ── */
const VIEW_LABELS: Record<ViewMode, string> = {
    kanban: 'board',
    list: 'list',
    calendar: 'calendar',
    gantt: 'gantt',
};

/* ── Compact ghost button used in filter bar ── */
interface GhostButtonProps {
    icon?: React.ReactNode;
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    active?: boolean;
}

function GhostButton({ icon, children, onClick, disabled, active }: GhostButtonProps): React.ReactElement {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                active
                    ? 'bg-[var(--neutral-300)] text-[var(--neutral-1200)]'
                    : 'text-[var(--neutral-1100)] hover:bg-[var(--neutral-200)]',
            )}
        >
            {icon}
            {children}
        </button>
    );
}

/* ── Loading skeleton ── */
function LoadingSkeleton(): React.ReactElement {
    return (
        <div className="border border-[var(--neutral-400)] rounded-lg overflow-hidden">
            {(['s0', 's1', 's2', 's3', 's4'] as const).map((k) => (
                <div key={k} className="h-12 px-4 flex items-center gap-3 border-b border-[var(--neutral-400)] last:border-b-0">
                    <Skeleton className="w-2 h-2 rounded-full bg-[var(--neutral-200)]" />
                    <Skeleton className="h-3 w-16 bg-[var(--neutral-200)]" />
                    <Skeleton className="h-3 flex-1 bg-[var(--neutral-200)]" />
                    <Skeleton className="h-3 w-20 bg-[var(--neutral-200)]" />
                </div>
            ))}
        </div>
    );
}

/* ── Empty state ── */
function EmptyState({ workspaceSlug, projectId }: { workspaceSlug: string; projectId: string }): React.ReactElement {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[var(--neutral-400)] flex items-center justify-center mb-4">
                <CircleDashed size={24} className="text-[var(--neutral-600)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--neutral-900)] mb-1">Sin tareas aún</h3>
            <p className="text-sm text-[var(--neutral-600)] mb-6 max-w-xs">
                Crea tu primera tarea para empezar a rastrear el trabajo de este proyecto.
            </p>
            <CreateIssueDialog
                workspaceSlug={workspaceSlug}
                projectId={projectId}
                trigger={
                    <Button variant="default" className="gap-2">
                        <Plus size={16} />
                        Crear primera tarea
                    </Button>
                }
            />
        </div>
    );
}

/* ── Quick-add inline row ── */
interface QuickAddRowProps {
    workspaceSlug: string;
    projectId: string;
    defaultStateId: string;
}

function QuickAddRow({ workspaceSlug, projectId, defaultStateId }: QuickAddRowProps): React.ReactElement {
    const [active, setActive] = useState(false);
    const [title, setTitle] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutate: createIssue, isPending } = useCreateIssue(workspaceSlug, projectId);

    useEffect(() => {
        if (active && inputRef.current) inputRef.current.focus();
    }, [active]);

    const handleSubmit = (): void => {
        const trimmed = title.trim();
        if (!trimmed) { setActive(false); return; }
        createIssue(
            { title: trimmed, priority: 0, stateId: defaultStateId },
            { onSuccess: () => { setTitle(''); setActive(false); } },
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') { setTitle(''); setActive(false); }
    };

    if (!active) {
        return (
            <button
                type="button"
                onClick={() => setActive(true)}
                className="w-full flex items-center gap-2 px-4 h-10 text-xs text-[var(--neutral-600)] hover:text-[var(--neutral-900)] hover:bg-[var(--neutral-100)] transition-colors border-t border-[var(--neutral-400)]"
            >
                <Plus size={13} />
                Agregar issue
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2 px-4 h-10 border-t border-[var(--neutral-400)] bg-[var(--neutral-100)]">
            <Plus size={13} className="text-[var(--neutral-600)] shrink-0" />
            <input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSubmit}
                disabled={isPending}
                placeholder="Título de la tarea… (Enter para crear, Esc para cancelar)"
                className="flex-1 bg-transparent text-sm text-[var(--neutral-1200)] placeholder:text-[var(--neutral-600)] outline-none"
            />
        </div>
    );
}

/* ── Sortable list item wrapper ── */
interface SortableIssueRowProps {
    issue: Issue;
    projectIdentifier?: string;
    workspaceSlug?: string;
    projectId?: string;
    features?: ProjectFeatures;
    onClick: () => void;
}

function SortableIssueRow({ issue, projectIdentifier, workspaceSlug, projectId, features, onClick }: SortableIssueRowProps): React.ReactElement {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group/drag flex items-center">
            <button
                type="button"
                aria-label="Arrastrar para reordenar"
                {...attributes}
                {...listeners}
                className="absolute left-0 top-0 h-full px-1 flex items-center opacity-0 group-hover/drag:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-[var(--neutral-600)] hover:text-[var(--neutral-900)] z-10"
            >
                <GripVertical size={14} />
            </button>
            <div className="flex-1 pl-5">
                <IssueRow
                    issue={issue}
                    projectIdentifier={projectIdentifier}
                    workspaceSlug={workspaceSlug}
                    projectId={projectId}
                    features={features}
                    onClick={onClick}
                />
            </div>
        </div>
    );
}

/* ── Issue list header (sticky, mono uppercase column labels) ── */
// buildGridTemplate is imported from IssueRow to keep header and rows pixel-aligned.
interface IssueListHeaderProps {
    features?: ProjectFeatures;
}

function IssueListHeader({ features }: IssueListHeaderProps): React.ReactElement {
    const headers: { key: string; label: string; show?: boolean }[] = [
        { key: 'check', label: '' },
        { key: 'pip', label: '' },
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Título' },
        { key: 'label', label: 'Etiqueta' },
        { key: 'cycle', label: 'Ciclo', show: features?.cyclesEnabled },
        { key: 'module', label: 'Módulo', show: features?.modulesEnabled },
        { key: 'due', label: 'Vence' },
        { key: 'prio', label: 'P' },
        { key: 'sub', label: 'Sub-issues' },
        { key: 'assigned', label: 'Asignado' },
    ].filter((h) => h.show === undefined || h.show);
    return (
        <div
            className="sticky top-0 z-10 border-b border-[var(--neutral-400)]"
            style={{
                display: 'grid',
                gridTemplateColumns: buildGridTemplate(features),
                alignItems: 'center',
                columnGap: 14,
                padding: '8px 24px',
                background: 'var(--neutral-200)',
            }}
        >
            {headers.map((h) => (
                <span
                    key={h.key}
                    className="font-mono text-[10px] text-[var(--neutral-600)] uppercase tracking-[0.1em]"
                >
                    {h.label}
                </span>
            ))}
        </div>
    );
}

/* ── List group section ── */
interface ListGroupSectionProps {
    label: string;
    color?: string;
    issues: Issue[];
    projectIdentifier?: string;
    workspaceSlug: string;
    projectId: string;
    defaultStateId: string;
    onIssueClick: (issue: Issue) => void;
    showQuickAdd?: boolean;
    groupKey: string;
    statePipState?: StatePipState;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    features?: ProjectFeatures;
}

// Above this row count we switch to a windowed renderer to keep the main thread free.
const VIRTUALIZATION_THRESHOLD = 50;

function ListGroupSection({
    label,
    color,
    issues,
    projectIdentifier,
    workspaceSlug,
    projectId,
    defaultStateId,
    onIssueClick,
    showQuickAdd = false,
    statePipState,
    isExpanded,
    onToggleExpanded,
    features,
}: ListGroupSectionProps): React.ReactElement {
    return (
        <div className="flex flex-col animate-fade-in">
            {/* Group header */}
            <div
                className="flex items-center gap-2.5 px-6 pt-3.5 pb-2"
                style={{ background: 'var(--neutral-200)' }}
            >
                <button
                    type="button"
                    onClick={onToggleExpanded}
                    className="flex size-4 items-center justify-center text-[var(--neutral-600)] hover:text-[var(--neutral-1100)] transition-colors"
                    aria-label={isExpanded ? `Colapsar ${label}` : `Expandir ${label}`}
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? (
                        <ChevronDown size={14} aria-hidden="true" />
                    ) : (
                        <ChevronRight size={14} aria-hidden="true" />
                    )}
                </button>
                {statePipState ? (
                    <StatePip state={statePipState} size={14} />
                ) : color ? (
                    <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                    />
                ) : null}
                <span className="text-[14px] font-medium tracking-[-0.01em] text-[var(--neutral-1200)]">
                    {label}
                </span>
                <span className="font-mono text-[11px] text-[var(--neutral-600)] tabular-nums">
                    {issues.length}
                </span>
                <span className="flex-1" />
                {showQuickAdd && isExpanded && defaultStateId && (
                    <span className="text-[11px] text-[var(--neutral-600)]">+ Añadir</span>
                )}
            </div>

            {isExpanded && (
                <div>
                    <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        {issues.length > VIRTUALIZATION_THRESHOLD ? (
                            <VirtualizedIssueList
                                issues={issues}
                                projectIdentifier={projectIdentifier}
                                workspaceSlug={workspaceSlug}
                                projectId={projectId}
                                onIssueClick={onIssueClick}
                                features={features}
                            />
                        ) : (
                            issues.map((issue) => (
                                <SortableIssueRow
                                    key={issue.id}
                                    issue={issue}
                                    projectIdentifier={projectIdentifier}
                                    workspaceSlug={workspaceSlug}
                                    projectId={projectId}
                                    features={features}
                                    onClick={() => onIssueClick(issue)}
                                />
                            ))
                        )}
                    </SortableContext>
                    {showQuickAdd && defaultStateId && (
                        <QuickAddRow
                            workspaceSlug={workspaceSlug}
                            projectId={projectId}
                            defaultStateId={defaultStateId}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

interface VirtualizedIssueListProps {
    issues: Issue[];
    projectIdentifier?: string;
    workspaceSlug: string;
    projectId: string;
    onIssueClick: (issue: Issue) => void;
    features?: ProjectFeatures;
}

function VirtualizedIssueList({
    issues,
    projectIdentifier,
    workspaceSlug,
    projectId,
    onIssueClick,
    features,
}: VirtualizedIssueListProps): React.ReactElement {
    const parentRef = useRef<HTMLDivElement | null>(null);

    const rowVirtualizer = useVirtualizer({
        count: issues.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 44, // IssueRow h-11 = 44px
        overscan: 8,
    });

    return (
        <div ref={parentRef} className="relative max-h-[70vh] overflow-y-auto">
            <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const issue = issues[virtualRow.index];
                    return (
                        <div
                            key={issue.id}
                            data-index={virtualRow.index}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <SortableIssueRow
                                issue={issue}
                                projectIdentifier={projectIdentifier}
                                workspaceSlug={workspaceSlug}
                                projectId={projectId}
                                features={features}
                                onClick={() => onIssueClick(issue)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

type GroupEntry = { key: string; label: string; color?: string; issues: Issue[] };

function buildGroups(groupBy: GroupByOption, issues: Issue[], states: State[]): GroupEntry[] {
    if (groupBy === 'none') return [{ key: 'all', label: 'Tareas', issues }];
    if (groupBy === 'state') {
        return states.map((s) => ({ key: s.id, label: s.name, color: s.color, issues: issues.filter((i) => i.stateId === s.id) }));
    }
    if (groupBy === 'priority') {
        return ([1, 2, 3, 4, 0] as IssuePriority[]).map((p) => ({
            key: String(p),
            label: PRIORITY_LABELS[p],
            issues: issues.filter((i) => i.priority === p),
        }));
    }
    if (groupBy === 'assignee') {
        // Bug 3: group by first assignee from assigneeIds array (UX: one group per issue)
        const map = new Map<string, Issue[]>();
        for (const issue of issues) {
            const key = issue.assigneeIds[0] ?? '__unassigned__';
            const bucket = map.get(key) ?? [];
            bucket.push(issue);
            map.set(key, bucket);
        }
        return Array.from(map.entries()).map(([key, items]) => ({
            key, label: key === '__unassigned__' ? 'Sin asignar' : key, issues: items,
        }));
    }
    return [{ key: 'all', label: 'Tareas', issues }];
}

/* ── List view with DnD reorder and grouping ── */
interface ListViewProps {
    issues: Issue[];
    states: State[];
    projectIdentifier?: string;
    workspaceSlug: string;
    projectId: string;
    defaultStateId: string;
    groupBy: GroupByOption;
    onIssueClick: (issue: Issue) => void;
    features?: ProjectFeatures;
}

function ListView({
    issues,
    states,
    projectIdentifier,
    workspaceSlug,
    projectId,
    defaultStateId,
    groupBy,
    onIssueClick,
    features,
}: ListViewProps): React.ReactElement {
    const [localOrder, setLocalOrder] = useState<string[]>(() => issues.map((i) => i.id));
    const [activeId, setActiveId] = useState<string | null>(null);

    // Sync order when issues change (new data)
    useEffect(() => {
        setLocalOrder(issues.map((i) => i.id));
    }, [issues]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const orderedIssues = useMemo(() => {
        const map = new Map(issues.map((i) => [i.id, i]));
        return localOrder.map((id) => map.get(id)).filter(Boolean) as Issue[];
    }, [issues, localOrder]);

    const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null;

    const handleDragStart = (event: DragStartEvent): void => {
        setActiveId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent): void => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id) return;
        setLocalOrder((prev) => {
            const oldIndex = prev.indexOf(String(active.id));
            const newIndex = prev.indexOf(String(over.id));
            return arrayMove(prev, oldIndex, newIndex);
        });
    };

    const groups = buildGroups(groupBy, orderedIssues, states);
    const { expandedGroups, toggleGroupExpanded } = useIssuesUiStore();

    const stateGroupByStateId = useMemo(() => {
        const map = new Map<string, string>();
        for (const s of states) map.set(s.id, s.category ?? '');
        return map;
    }, [states]);

    const listAnnouncements = useMemo(
        () =>
            createDndAnnouncements({
                item: (id) => issues.find((i) => i.id === String(id))?.title ?? 'desconocida',
            }),
        [issues],
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            accessibility={{
                announcements: listAnnouncements,
                screenReaderInstructions: dndScreenReaderInstructions,
            }}
        >
            <div className="animate-fade-in pb-12 bg-canvas border-x border-b border-[var(--neutral-300)] rounded-md overflow-hidden">
                <IssueListHeader features={features} />
                {groups.map((group, idx) => {
                    const fullKey = `${projectId}:${group.key}`;
                    const isExpanded = expandedGroups[fullKey] !== false;
                    const stateGroupLabel = groupBy === 'state' ? stateGroupByStateId.get(group.key) : undefined;
                    return (
                        <ListGroupSection
                            key={group.key}
                            label={group.label}
                            color={group.color}
                            issues={group.issues}
                            projectIdentifier={projectIdentifier}
                            workspaceSlug={workspaceSlug}
                            projectId={projectId}
                            defaultStateId={defaultStateId}
                            onIssueClick={onIssueClick}
                            showQuickAdd={idx === 0}
                            groupKey={fullKey}
                            statePipState={toStatePipState(stateGroupLabel)}
                            isExpanded={isExpanded}
                            onToggleExpanded={() => toggleGroupExpanded(fullKey)}
                            features={features}
                        />
                    );
                })}
            </div>

            <DragOverlay>
                {activeIssue ? (
                    <div className="bg-white border border-[var(--neutral-400)] rounded-md shadow-[var(--shadow-overlay-200)] opacity-95 pointer-events-none overflow-hidden">
                        <IssueRow
                            issue={activeIssue}
                            projectIdentifier={projectIdentifier}
                            onClick={() => undefined}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

/* ── Kanban draggable card ── */
interface KanbanCardProps {
    issue: Issue;
    projectIdentifier?: string;
    workspaceSlug?: string;
    projectId?: string;
    onClick: () => void;
    isDragOverlay?: boolean;
}

function KanbanCard({ issue, projectIdentifier, workspaceSlug = '', projectId = '', onClick, isDragOverlay = false }: KanbanCardProps): React.ReactElement {
    const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id });
    const { data: labelsData } = useLabels(workspaceSlug);
    // Bug 2: use workspace members to resolve assigneeIds
    const { data: membersData } = useWorkspaceMembers(workspaceSlug);
    // Bug 11: resolve cycles and modules for the badge row
    const { data: cyclesData } = useCycles(workspaceSlug, projectId);
    const { data: modulesData } = useModules(workspaceSlug, projectId);

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? 'none' : transition,
        opacity: isDragging ? 0 : 1,
    };

    // All labels resolved from labels query (color chips)
    const resolvedLabels = useMemo(() => {
        if (!labelsData) return [] as typeof labelsData extends undefined ? never[] : NonNullable<typeof labelsData>;
        return issue.labelIds
            .map((id) => labelsData.find((l) => l.id === id))
            .filter((l): l is NonNullable<typeof l> => l !== undefined);
    }, [issue.labelIds, labelsData]);

    // Bug 2: resolve assignees from assigneeIds
    const assignees = useMemo(() => {
        if (!membersData || !issue.assigneeIds.length) return [];
        return issue.assigneeIds
            .map((id) => membersData.find((m) => m.userId === id))
            .filter((m): m is NonNullable<typeof m> => m !== undefined);
    }, [issue.assigneeIds, membersData]);

    // Bug 11: resolve cycle name
    const cycle = useMemo<Cycle | undefined>(() => {
        if (!issue.cycleId || !cyclesData) return undefined;
        const items = Array.isArray(cyclesData)
            ? (cyclesData as Cycle[])
            : ((cyclesData as { items?: Cycle[] }).items ?? []);
        return items.find((c) => c.id === issue.cycleId);
    }, [issue.cycleId, cyclesData]);

    // Bug 11: resolve module names
    const resolvedModules = useMemo<Module[]>(() => {
        if (!issue.moduleIds.length || !modulesData) return [];
        const items = Array.isArray(modulesData)
            ? (modulesData as Module[])
            : ((modulesData as { items?: Module[] }).items ?? []);
        return issue.moduleIds.map((id) => items.find((m) => m.id === id)).filter((m): m is Module => m !== undefined);
    }, [issue.moduleIds, modulesData]);

    // TODO(backend): subIssueCount/subIssueCompletedCount not in Issue DTO

    return (
        <>
            {/* biome-ignore lint/a11y/useSemanticElements: interactive menu buttons inside prevent using <button> */}
            <div
                ref={isDragOverlay ? undefined : setNodeRef}
                style={isDragOverlay ? undefined : style}
                {...(isDragOverlay ? {} : attributes)}
                {...(isDragOverlay ? {} : listeners)}
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
                className={cn(
                    'w-full text-left bg-white rounded-lg border border-[var(--neutral-300)] p-3.5 cursor-grab active:cursor-grabbing hover:border-[var(--neutral-400)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.04)] transition-all duration-150 relative group',
                    isDragOverlay && 'shadow-[0_12px_24px_rgba(0,0,0,0.1)] rotate-1 border-[var(--brand-700)]/20',
                )}
            >
                {/* Row 1: ID + lock */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono text-[var(--neutral-500)] tracking-tight">
                        {projectIdentifier ?? 'ISS'}-{issue.sequenceId}
                    </span>
                    {issue.requiresAdminApproval && (
                        <Lock size={11} className="text-amber-500 ml-auto shrink-0" />
                    )}
                </div>

                {/* Row 2: Title */}
                <p className="text-[13px] font-medium text-[var(--neutral-1200)] line-clamp-2 mb-2.5 tracking-[-0.01em] leading-snug">{issue.title}</p>

                {/* Row 3: Cycle + Module badges — Bug 11 */}
                {(cycle || resolvedModules.length > 0) && (
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        {cycle && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[var(--neutral-200)] text-[var(--neutral-700)] shrink-0">
                                <Calendar size={9} aria-hidden="true" />
                                <span className="truncate max-w-[80px]">{cycle.name}</span>
                            </span>
                        )}
                        {resolvedModules.slice(0, 2).map((mod) => (
                            <span
                                key={mod.id}
                                className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-[var(--neutral-200)] text-[var(--neutral-700)] truncate max-w-[80px]"
                            >
                                {mod.name}
                            </span>
                        ))}
                        {resolvedModules.length > 2 && (
                            <span className="text-[10px] font-mono text-[var(--neutral-600)] px-1 py-0.5 rounded bg-[var(--neutral-200)]">
                                +{resolvedModules.length - 2}
                            </span>
                        )}
                    </div>
                )}

                {/* Row 4: label chips (max 2 + overflow) */}
                {resolvedLabels.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                        {resolvedLabels.slice(0, 2).map((label) => (
                            <span
                                key={label.id}
                                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium truncate max-w-[90px]"
                                style={{
                                    backgroundColor: label.color ? `${label.color}18` : 'var(--neutral-200)',
                                    borderColor: label.color ? `${label.color}50` : 'var(--neutral-300)',
                                    color: label.color ?? 'var(--neutral-700)',
                                }}
                                title={label.name}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: label.color ?? 'var(--neutral-500)' }}
                                    aria-hidden="true"
                                />
                                {label.name}
                            </span>
                        ))}
                        {resolvedLabels.length > 2 && (
                            <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-[var(--neutral-200)] text-[var(--neutral-600)] shrink-0">
                                +{resolvedLabels.length - 2}
                            </span>
                        )}
                    </div>
                )}

                {/* Row 5: priority + assignee avatars + due date */}
                <div className="flex items-center justify-between gap-2 mt-auto">
                    <PriorityDot priority={mapPriority(issue.priority)} size={11} />
                    <div className="flex items-center gap-1.5 ml-auto">
                        {issue.dueDate && (
                            <span className="text-[10px] font-mono text-[var(--neutral-600)] uppercase tracking-wider">
                                {formatDateOnly(issue.dueDate, { day: '2-digit', month: 'short' })}
                            </span>
                        )}
                        {/* Bug 2: avatar stack from assigneeIds */}
                        {assignees.length > 0 ? (
                            <div className="flex items-center -space-x-1">
                                {assignees.slice(0, 3).map((member) => (
                                    <div
                                        key={member.userId}
                                        title={member.displayName ?? member.email}
                                        aria-label={`Asignado a ${member.displayName ?? member.email}`}
                                        className="w-[20px] h-[20px] rounded-full bg-[var(--brand-700)] flex items-center justify-center text-[9px] font-bold text-white shrink-0 ring-1 ring-white"
                                    >
                                        {member.avatarUrl ? (
                                            <img
                                                src={member.avatarUrl}
                                                alt={member.displayName ?? member.email}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            getInitials(member.displayName ?? member.email)
                                        )}
                                    </div>
                                ))}
                                {assignees.length > 3 && (
                                    <div
                                        className="w-[20px] h-[20px] rounded-full bg-[var(--neutral-300)] flex items-center justify-center text-[8px] font-mono text-[var(--neutral-700)] shrink-0 ring-1 ring-white"
                                        aria-label={`+${assignees.length - 3} más`}
                                    >
                                        +{assignees.length - 3}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span
                                className="w-[20px] h-[20px] rounded-full border border-dashed border-[var(--neutral-400)] shrink-0"
                                aria-hidden="true"
                            />
                        )}
                    </div>
                </div>

                {!isDragOverlay && workspaceSlug && projectId && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IssueActionsMenu
                            issue={issue}
                            workspaceSlug={workspaceSlug}
                            projectId={projectId}
                            onEdit={() => setEditingIssue(issue)}
                        />
                    </div>
                )}
            </div>

            {editingIssue && (
                <CreateIssueDialog
                    issue={editingIssue}
                    open={!!editingIssue}
                    onOpenChange={(open) => { if (!open) setEditingIssue(null); }}
                    workspaceSlug={workspaceSlug}
                    projectId={projectId}
                    trigger={<span />}
                />
            )}
        </>
    );
}

/* ── Kanban droppable column ── */
interface KanbanColumnProps {
    state: State;
    issues: Issue[];
    projectIdentifier?: string;
    workspaceSlug: string;
    projectId: string;
    onIssueClick: (issue: Issue) => void;
}

function KanbanColumn({ state, issues, projectIdentifier, workspaceSlug, projectId, onIssueClick }: KanbanColumnProps): React.ReactElement {
    const { setNodeRef, isOver } = useDroppable({ id: state.id });

    return (
        <div className="flex flex-col w-72 shrink-0 border-r border-[var(--neutral-300)] pr-6 last:border-r-0 last:pr-0">
            {/* Editorial header: "Backlog 187" — name + large count, no pill */}
            <div className="flex items-center justify-between gap-2 mb-3 px-1">
                <div className="flex items-center gap-2 min-w-0">
                    <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: state.color }}
                        aria-hidden="true"
                    />
                    <span className="text-[14px] font-semibold tracking-[-0.01em] text-[var(--neutral-1200)] truncate">
                        {state.name}
                    </span>
                    <span className="text-[14px] font-semibold text-[var(--neutral-500)] tabular-nums shrink-0">
                        {issues.length}
                    </span>
                </div>
                <CreateIssueDialog
                    workspaceSlug={workspaceSlug}
                    projectId={projectId}
                    trigger={
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] hover:bg-[var(--neutral-200)] rounded transition-colors shrink-0"
                            aria-label={`Agregar issue a ${state.name}`}
                        >
                            <Plus size={11} aria-hidden="true" />
                            Issue
                        </button>
                    }
                />
            </div>
            <div
                ref={setNodeRef}
                className={cn(
                    'flex-1 min-h-20 rounded-lg p-2 space-y-2 transition-colors',
                    isOver && 'bg-[color-mix(in_oklch,var(--brand-700)_8%,white)]',
                    issues.length === 0 && !isOver && 'border border-dashed border-[var(--neutral-400)]',
                )}
            >
                {issues.length === 0 && !isOver ? (
                    <p className="text-xs text-[var(--neutral-600)] text-center py-6">Sin tareas</p>
                ) : (
                    <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        {issues.map((issue) => (
                            <KanbanCard
                                key={issue.id}
                                issue={issue}
                                projectIdentifier={projectIdentifier}
                                workspaceSlug={workspaceSlug}
                                projectId={projectId}
                                onClick={() => onIssueClick(issue)}
                            />
                        ))}
                    </SortableContext>
                )}
            </div>
        </div>
    );
}

/* ── Kanban view with DnD ── */
interface KanbanViewProps {
    issues: Issue[];
    states: State[];
    projectIdentifier?: string;
    onIssueClick: (issue: Issue) => void;
    workspaceSlug: string;
    projectId: string;
}

function KanbanView({ issues, states, projectIdentifier, onIssueClick, workspaceSlug, projectId }: KanbanViewProps): React.ReactElement {
    const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
    const [localIssues, setLocalIssues] = useState<Issue[]>(issues);
    const { mutate: updateIssue } = useUpdateIssue(workspaceSlug, projectId);
    const { data: currentUser } = useAuthMe();
    const { data: projectMembers } = useProjectMembers(workspaceSlug, projectId);
    const [approvalDialog, setApprovalDialog] = useState<{
        issueId: string;
        targetStateId: string;
        targetStateName: string;
    } | null>(null);

    const canApproveInProject = (() => {
        if (currentUser?.isSuperAdmin) return true;
        const me = projectMembers?.find((m) => m.userId === currentUser?.id);
        return me?.role === 'Admin' || me?.role === 'Lead';
    })();

    // Sync from server only when server data changes (not during drag)
    useEffect(() => {
        setLocalIssues(issues);
    }, [issues]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    const activeIssue = activeIssueId ? issues.find((i) => i.id === activeIssueId) : null;

    const handleDragStart = (event: DragStartEvent): void => {
        setActiveIssueId(String(event.active.id));
    };

    const handleDragOver = (event: DragOverEvent): void => {
        const { active, over } = event;
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        const targetStateId =
            states.find((s) => s.id === overId)?.id ??
            localIssues.find((i) => i.id === overId)?.stateId;

        if (!targetStateId) return;

        const draggingIssue = localIssues.find((i) => i.id === activeId);
        if (!draggingIssue || draggingIssue.stateId === targetStateId) return;

        setLocalIssues((prev) =>
            prev.map((i) => (i.id === activeId ? { ...i, stateId: targetStateId } : i)),
        );
    };

    const handleDragEnd = (event: DragEndEvent): void => {
        const { active } = event;
        const issueId = String(active.id);

        const movedIssue = localIssues.find((i) => i.id === issueId);
        const originalIssue = issues.find((i) => i.id === issueId);

        setActiveIssueId(null);

        if (!movedIssue || !originalIssue || movedIssue.stateId === originalIssue.stateId) return;

        if (movedIssue.requiresAdminApproval && movedIssue.approvalRequiredStateIds.includes(movedIssue.stateId)) {
            const target = states.find((s) => s.id === movedIssue.stateId);
            setApprovalDialog({
                issueId,
                targetStateId: movedIssue.stateId,
                targetStateName: target?.name ?? '',
            });
            setLocalIssues(issues);
            return;
        }

        updateIssue(
            { issueId, data: { stateId: movedIssue.stateId } },
            { onError: () => setLocalIssues(issues) },
        );
    };

    const kanbanAnnouncements = useMemo(
        () =>
            createDndAnnouncements({
                item: (id) => localIssues.find((i) => i.id === String(id))?.title ?? 'desconocida',
                container: (id) => {
                    if (id == null) return 'fuera de las columnas';
                    const state = states.find((s) => s.id === String(id));
                    if (state) return `columna ${state.name}`;
                    const issue = localIssues.find((i) => i.id === String(id));
                    if (issue) {
                        const target = states.find((s) => s.id === issue.stateId);
                        return target ? `columna ${target.name}` : 'columna desconocida';
                    }
                    return 'columna desconocida';
                },
            }),
        [localIssues, states],
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            accessibility={{
                announcements: kanbanAnnouncements,
                screenReaderInstructions: dndScreenReaderInstructions,
            }}
        >
            <div className="flex flex-1 min-h-0 gap-6 overflow-x-scroll pb-1 pt-2 animate-fade-in [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-[var(--neutral-700)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[var(--neutral-900)] [&::-webkit-scrollbar-track]:bg-[var(--neutral-200)] [&::-webkit-scrollbar-track]:rounded-full">
                {states.map((state) => (
                    <KanbanColumn
                        key={state.id}
                        state={state}
                        issues={localIssues.filter((i) => i.stateId === state.id)}
                        projectIdentifier={projectIdentifier}
                        workspaceSlug={workspaceSlug}
                        projectId={projectId}
                        onIssueClick={onIssueClick}
                    />
                ))}
            </div>
            <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
                {activeIssue ? (
                    <KanbanCard
                        issue={activeIssue}
                        projectIdentifier={projectIdentifier}
                        onClick={() => undefined}
                        isDragOverlay
                    />
                ) : null}
            </DragOverlay>
            {approvalDialog ? (
                <ApprovalRequiredDialog
                    open
                    onOpenChange={(open) => {
                        if (!open) setApprovalDialog(null);
                    }}
                    workspaceSlug={workspaceSlug}
                    projectId={projectId}
                    issueId={approvalDialog.issueId}
                    targetStateId={approvalDialog.targetStateId}
                    targetStateName={approvalDialog.targetStateName}
                    canApprove={canApproveInProject}
                />
            ) : null}
        </DndContext>
    );
}

/* ── View toggle button ── */
interface ViewToggleButtonProps {
    mode: ViewMode;
    current: ViewMode;
    label: string;
    onClick: () => void;
    children: React.ReactNode;
}

function ViewToggleButton({ current, mode, label, onClick, children }: ViewToggleButtonProps): React.ReactElement {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium transition-all rounded-[4px]',
                current === mode
                    ? 'bg-white text-[var(--neutral-1200)] shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                    : 'text-[var(--neutral-600)] hover:text-[var(--neutral-1200)]',
            )}
        >
            {children}
            <span className="hidden lg:inline">{label}</span>
        </button>
    );
}

/* ── Date filter helpers ── */
function getToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function matchesDueDateFilter(issue: Issue, dueDate: IssueFilter['dueDate']): boolean {
    if (!dueDate) return true;
    if (dueDate === 'no_date') return !issue.dueDate;
    if (dueDate === 'has_date') return !!issue.dueDate;
    if (!issue.dueDate) return false;
    const today = getToday();
    const d = new Date(issue.dueDate);
    if (dueDate === 'overdue') return d < today;
    const limit = new Date(today);
    limit.setDate(limit.getDate() + (dueDate === 'next_7' ? 7 : 30));
    return d >= today && d <= limit;
}

function matchesDateRangeFilter(dateStr: string | undefined, range: string): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = getToday();
    if (range === 'today') {
        return d >= today && d < new Date(today.getTime() + 86400000);
    }
    if (range === 'this_week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
        return d >= weekStart && d < weekEnd;
    }
    if (range === 'this_month') {
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }
    if (range === 'last_month') {
        const lm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    }
    return false;
}

/* ── Apply filters ── */
function applyFilters(allIssues: Issue[], filters: IssueFilter): Issue[] {
    let result = allIssues;
    if (filters.priority && filters.priority.length > 0) {
        const priorityNums = filters.priority.map(Number);
        result = result.filter((i) => priorityNums.includes(i.priority));
    }
    if (filters.stateId && filters.stateId.length > 0) {
        result = result.filter((i) => (filters.stateId ?? []).includes(i.stateId));
    }
    if (filters.assigneeId && filters.assigneeId.length > 0) {
        // Bug 4: use assigneeIds array (contains-any logic)
        result = result.filter((i) =>
            i.assigneeIds.some((aid) => (filters.assigneeId ?? []).includes(aid)),
        );
    }
    if (filters.labelId && filters.labelId.length > 0) {
        // label filtering deferred to backend — kept here for UI consistency
        result = result.filter(() => true);
    }
    if (filters.dueDate) {
        result = result.filter((i) => matchesDueDateFilter(i, filters.dueDate));
    }
    const startDate = filters.startDate;
    if (startDate) {
        result = result.filter((i) => matchesDateRangeFilter(i.startDate, startDate));
    }
    const createdDate = filters.createdDate;
    if (createdDate) {
        result = result.filter((i) => matchesDateRangeFilter(i.createdAt, createdDate));
    }
    return result;
}

/* ── Apply ordering ── */
function applyOrderBy(issues: Issue[], orderBy: DisplayOptions['orderBy']): Issue[] {
    const sorted = [...issues];
    if (orderBy === 'created_desc') return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (orderBy === 'created_asc') return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (orderBy === 'updated_desc') return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    if (orderBy === 'priority_asc') return sorted.sort((a, b) => {
        const order: IssuePriority[] = [1, 2, 3, 4, 0];
        return order.indexOf(a.priority as IssuePriority) - order.indexOf(b.priority as IssuePriority);
    });
    if (orderBy === 'due_date_asc') return sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
    });
    return sorted;
}

/* ── Team member avatar (toolbar quick-filter) ── */
interface MemberAvatarProps {
    userId: string;
    displayName?: string;
    email?: string;
    isActive: boolean;
    onToggle: () => void;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function MemberAvatar({ userId, displayName, email, isActive, onToggle }: MemberAvatarProps): React.ReactElement {
    const label = displayName ?? email ?? userId;
    const initials = getInitials(label);
    return (
        <button
            type="button"
            onClick={onToggle}
            title={label}
            aria-label={`${isActive ? 'Quitar filtro' : 'Filtrar por'} ${label}`}
            aria-pressed={isActive}
            className={cn(
                'w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold transition-all shrink-0',
                isActive
                    ? 'ring-2 ring-[var(--brand-700)] ring-offset-1 opacity-100'
                    : 'opacity-60 hover:opacity-100',
                'bg-[var(--brand-700)] text-white',
            )}
        >
            {initials}
        </button>
    );
}

/* ── Main page ── */
function useIssuesPageData(workspaceSlug: string, projectId: string) {
    const { data, isLoading: issuesLoading } = useIssues(workspaceSlug, projectId);
    const { data: states, isLoading: statesLoading } = useProjectStates(workspaceSlug, projectId);
    const { data: project } = useProject(workspaceSlug, projectId);
    const isLoading = issuesLoading || statesLoading;
    const allIssues = data?.items ?? [];
    const sortedStates = [...(states ?? [])].sort((a, b) => a.sequence - b.sequence);
    const features = getProjectFeatures(project);
    return {
        isLoading,
        allIssues,
        sortedStates,
        defaultStateId: sortedStates[0]?.id ?? '',
        projectIdentifier: project?.identifier,
        features,
    };
}

export const IssuesPage = (): React.ReactElement => {
    const { workspaceSlug = '', projectId = '' } = useParams<{ workspaceSlug: string; projectId: string }>();
    const navigate = useNavigate();

    const { isLoading, allIssues, sortedStates, defaultStateId, projectIdentifier, features } =
        useIssuesPageData(workspaceSlug, projectId);

    const { data: projectMembers } = useProjectMembers(workspaceSlug, projectId);

    const [searchParams, setSearchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

    const filters = useMemo<IssueFilter>(() => {
        const raw = searchParams.get('filters');
        if (!raw) return {};
        try { return JSON.parse(raw) as IssueFilter; } catch { return {}; }
    }, [searchParams]);

    const setFilters = (next: IssueFilter): void => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            if (Object.keys(next).length === 0) {
                params.delete('filters');
            } else {
                params.set('filters', JSON.stringify(next));
            }
            return params;
        }, { replace: true });
    };

    const toggleAssigneeFilter = (userId: string): void => {
        const current = filters.assigneeId ?? [];
        const next = current.includes(userId)
            ? current.filter((id) => id !== userId)
            : [...current, userId];
        setFilters({ ...filters, assigneeId: next.length > 0 ? next : undefined });
    };

    const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(DEFAULT_DISPLAY_OPTIONS);
    const [displayPanelOpen, setDisplayPanelOpen] = useState(false);
    const [peekIssueId, setPeekIssueId] = useState<string | null>(null);

    const issues = useMemo(
        () => applyOrderBy(applyFilters(allIssues, filters), displayOptions.orderBy),
        [allIssues, filters, displayOptions.orderBy],
    );

    const peekIndex = peekIssueId ? issues.findIndex((i) => i.id === peekIssueId) : -1;
    const peekIssue = peekIndex >= 0 ? issues[peekIndex] : null;

    const goToIssue = (issueId: string): void => {
        void navigate(`/${workspaceSlug}/projects/${projectId}/issues/${issueId}`);
    };

    const hasIssues = !isLoading && allIssues.length > 0;

    const activeFiltersCount =
        (filters.priority?.length ?? 0) +
        (filters.stateId?.length ?? 0) +
        (filters.assigneeId?.length ?? 0) +
        (filters.labelId?.length ?? 0) +
        (filters.dueDate ? 1 : 0) +
        (filters.startDate ? 1 : 0) +
        (filters.createdDate ? 1 : 0);

    const viewLabel = VIEW_LABELS[viewMode];

    return (
        <div className="flex flex-col h-full">
            {/* Editorial subtitle row */}
            <div
                className="flex items-end gap-3 px-6 pt-5 pb-3 border-b border-[var(--neutral-300)]"
                style={{ background: 'var(--neutral-100)' }}
            >
                <h2 className="flex items-baseline gap-2 leading-none">
                    <span className="text-[42px] font-medium tracking-tightest text-[var(--neutral-1200)] leading-none">
                        Issues
                    </span>
                    <span className="text-[42px] text-[var(--neutral-500)] leading-none" aria-hidden="true">
                        ·
                    </span>
                    <span className="text-[42px] font-serif italic text-[var(--neutral-1200)] leading-none">
                        {viewLabel} view
                    </span>
                </h2>
                {hasIssues && (
                    <span className="ml-auto font-mono text-[14px] text-[var(--neutral-600)] pb-1">
                        {issues.length} issues
                    </span>
                )}
            </div>

            {/* Toolbar — single row */}
            <div
                className="flex items-center gap-2 px-6 py-2 border-b border-[var(--neutral-300)]"
                style={{ background: 'var(--neutral-100)' }}
            >
                {hasIssues && (
                    <>
                        {/* Filtros popover */}
                        <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
                            <PopoverTrigger asChild>
                                <GhostButton
                                    icon={<Filter size={12} />}
                                    active={filterPopoverOpen || activeFiltersCount > 0}
                                >
                                    {activeFiltersCount > 0 ? `Filtros · ${activeFiltersCount}` : 'Filtros'}
                                </GhostButton>
                            </PopoverTrigger>
                            <PopoverContent
                                align="start"
                                sideOffset={6}
                                className="w-auto max-w-[600px] p-3 bg-[var(--neutral-100)] border border-[var(--neutral-300)] shadow-[var(--shadow-overlay-300)]"
                            >
                                <IssueFilters
                                    filters={filters}
                                    workspaceSlug={workspaceSlug}
                                    projectId={projectId}
                                    onChange={setFilters}
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Priority quick filter — opens display panel */}
                        <GhostButton
                            icon={<Flag size={12} />}
                            onClick={() => setDisplayPanelOpen(true)}
                        >
                            Prioridad
                        </GhostButton>

                        {/* Team member avatars quick-filter */}
                        {projectMembers && projectMembers.length > 0 && (
                            <fieldset className="flex items-center gap-1 border-none p-0 m-0">
                                <legend className="sr-only">Filtrar por miembro</legend>
                                {projectMembers.slice(0, 8).map((member) => (
                                    <MemberAvatar
                                        key={member.userId}
                                        userId={member.userId}
                                        displayName={member.displayName}
                                        email={member.email}
                                        isActive={(filters.assigneeId ?? []).includes(member.userId)}
                                        onToggle={() => toggleAssigneeFilter(member.userId)}
                                    />
                                ))}
                                {projectMembers.length > 8 && (
                                    <span className="text-[10px] font-mono text-[var(--neutral-600)] pl-1">
                                        +{projectMembers.length - 8}
                                    </span>
                                )}
                            </fieldset>
                        )}

                        <span className="w-px h-[18px] bg-[var(--neutral-400)] mx-1" aria-hidden="true" />
                    </>
                )}

                <span className="flex-1" />

                {/* View switcher — List | Board | Calendar | Gantt */}
                <div className="flex items-center bg-[var(--neutral-200)] border border-[var(--neutral-300)] rounded-md p-[3px] gap-0.5">
                    <ViewToggleButton mode="list" current={viewMode} label="List" onClick={() => setViewMode('list')}>
                        <LayoutList size={13} />
                    </ViewToggleButton>
                    <ViewToggleButton mode="kanban" current={viewMode} label="Board" onClick={() => setViewMode('kanban')}>
                        <Columns size={13} />
                    </ViewToggleButton>
                    <ViewToggleButton mode="calendar" current={viewMode} label="Calendar" onClick={() => setViewMode('calendar')}>
                        <CalendarDays size={13} />
                    </ViewToggleButton>
                    <ViewToggleButton mode="gantt" current={viewMode} label="Gantt" onClick={() => setViewMode('gantt')}>
                        <GanttChartSquare size={13} />
                    </ViewToggleButton>
                </div>

                {/* Create button — "Issue" per design */}
                <CreateIssueDialog
                    workspaceSlug={workspaceSlug}
                    projectId={projectId}
                    trigger={
                        <Button
                            variant="default"
                            size="sm"
                            className="gap-1.5 h-8 bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[#f0eadf]"
                        >
                            <Plus size={13} />
                            Issue
                        </Button>
                    }
                />
            </div>

            <div className="flex-1 overflow-auto p-6 md:p-8 md:pt-6">
                <div className={cn(viewMode === 'kanban' ? 'w-full max-w-none h-full flex flex-col' : 'w-full max-w-none')}>

                {isLoading && <LoadingSkeleton />}

                {!isLoading && allIssues.length === 0 && (
                    <EmptyState workspaceSlug={workspaceSlug} projectId={projectId} />
                )}

                {hasIssues && viewMode === 'list' && (
                    <ListView
                        issues={issues}
                        states={sortedStates}
                        projectIdentifier={projectIdentifier}
                        workspaceSlug={workspaceSlug}
                        projectId={projectId}
                        defaultStateId={defaultStateId}
                        groupBy={displayOptions.groupBy}
                        onIssueClick={(issue) => setPeekIssueId(issue.id)}
                        features={features}
                    />
                )}

                {hasIssues && viewMode === 'kanban' && (
                    <KanbanView
                        issues={issues}
                        states={sortedStates}
                        projectIdentifier={projectIdentifier}
                        onIssueClick={(issue) => setPeekIssueId(issue.id)}
                        workspaceSlug={workspaceSlug}
                        projectId={projectId}
                    />
                )}

                {hasIssues && viewMode === 'gantt' && (
                    <IssueGanttView issues={issues} projectIdentifier={projectIdentifier} onRowClick={goToIssue} workspaceSlug={workspaceSlug} />
                )}

                {hasIssues && viewMode === 'calendar' && (
                    <IssueCalendarView issues={issues} onIssueClick={goToIssue} projectIdentifier={projectIdentifier} />
                )}
                </div>
            </div>

            {/* Peek overview */}
            <IssuePeekOverview
                issue={peekIssue ?? null}
                onClose={() => setPeekIssueId(null)}
                onPrev={() => { if (peekIndex > 0) setPeekIssueId(issues[peekIndex - 1].id); }}
                onNext={() => { if (peekIndex < issues.length - 1) setPeekIssueId(issues[peekIndex + 1].id); }}
                hasPrev={peekIndex > 0}
                hasNext={peekIndex < issues.length - 1}
            />

            {/* Display options panel */}
            <DisplayOptionsPanel
                open={displayPanelOpen}
                onOpenChange={setDisplayPanelOpen}
                options={displayOptions}
                onChange={setDisplayOptions}
            />
        </div>
    );
};
