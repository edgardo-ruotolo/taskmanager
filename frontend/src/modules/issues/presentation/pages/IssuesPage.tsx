import type React from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    LayoutList,
    Columns,
    TableProperties,
    GanttChart,
    CalendarDays,
    SlidersHorizontal,
    GripVertical,
    CircleDashed,
} from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
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
import { cn } from '@/lib/utils';
import { useIssues, useCreateIssue, useUpdateIssue } from '../../application/use-issues';
import { useCompanyStates } from '@/modules/states/application/use-states';
import { useCompany } from '@/modules/companies/application/use-companies';
import type { Issue } from '../../domain/types';
import type { State } from '@/modules/states/domain/types';
import { PRIORITY_LABELS } from '../../domain/types';
import type { IssuePriority } from '../../domain/types';
import { CreateIssueDialog } from '../components/CreateIssueDialog';
import { IssueListPdfExport } from '@/modules/pdf/presentation/components/IssueListPdfExport';
import { IssueRow } from '../components/IssueRow';
import { IssuePriorityBadge } from '../components/IssuePriorityBadge';
import { IssueFilters } from '../components/IssueFilters';
import type { IssueFilter } from '../components/IssueFilters';
import { IssueSpreadsheetView } from '../components/IssueSpreadsheetView';
import { IssueGanttView } from '../components/IssueGanttView';
import { IssueCalendarView } from '../components/IssueCalendarView';
import { IssuePeekOverview } from '../components/IssuePeekOverview';
import {
    DisplayOptionsPanel,
    DEFAULT_DISPLAY_OPTIONS,
} from '../components/DisplayOptionsPanel';
import type { DisplayOptions, GroupByOption } from '../components/DisplayOptionsPanel';

type ViewMode = 'list' | 'kanban' | 'spreadsheet' | 'gantt' | 'calendar';

/* ── Loading skeleton ── */
function LoadingSkeleton(): React.ReactElement {
    return (
        <div className="border border-subtle rounded-lg overflow-hidden">
            {(['s0', 's1', 's2', 's3', 's4'] as const).map((k) => (
                <div key={k} className="h-12 px-4 flex items-center gap-3 border-b border-subtle last:border-b-0">
                    <Skeleton className="w-2 h-2 rounded-full bg-layer-1" />
                    <Skeleton className="h-3 w-16 bg-layer-1" />
                    <Skeleton className="h-3 flex-1 bg-layer-1" />
                    <Skeleton className="h-3 w-20 bg-layer-1" />
                </div>
            ))}
        </div>
    );
}

/* ── Empty state ── */
function EmptyState({ workspaceSlug, companyId }: { workspaceSlug: string; companyId: string }): React.ReactElement {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-subtle flex items-center justify-center mb-4">
                <CircleDashed size={24} className="text-placeholder" />
            </div>
            <h3 className="text-base font-semibold text-secondary mb-1">Sin tareas aún</h3>
            <p className="text-sm text-placeholder mb-6 max-w-xs">
                Crea tu primera tarea para empezar a rastrear el trabajo de este proyecto.
            </p>
            <CreateIssueDialog
                workspaceSlug={workspaceSlug}
                companyId={companyId}
                trigger={
                    <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                        <Plus size={16} />
                        Crear primer issue
                    </Button>
                }
            />
        </div>
    );
}

/* ── Quick-add inline row ── */
interface QuickAddRowProps {
    workspaceSlug: string;
    companyId: string;
    defaultStateId: string;
}

function QuickAddRow({ workspaceSlug, companyId, defaultStateId }: QuickAddRowProps): React.ReactElement {
    const [active, setActive] = useState(false);
    const [title, setTitle] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutate: createIssue, isPending } = useCreateIssue(workspaceSlug, companyId);

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
                className="w-full flex items-center gap-2 px-4 h-10 text-xs text-placeholder hover:text-secondary hover:bg-surface-2 transition-colors border-t border-subtle"
            >
                <Plus size={13} />
                Agregar issue
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2 px-4 h-10 border-t border-subtle bg-surface-2">
            <Plus size={13} className="text-placeholder shrink-0" />
            <input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSubmit}
                disabled={isPending}
                placeholder="Título de la tarea… (Enter para crear, Esc para cancelar)"
                className="flex-1 bg-transparent text-sm text-primary placeholder:text-placeholder outline-none"
            />
        </div>
    );
}

/* ── Sortable list item wrapper ── */
interface SortableIssueRowProps {
    issue: Issue;
    companyIdentifier?: string;
    onClick: () => void;
}

function SortableIssueRow({ issue, companyIdentifier, onClick }: SortableIssueRowProps): React.ReactElement {
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
                className="absolute left-0 top-0 h-full px-1 flex items-center opacity-0 group-hover/drag:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-placeholder hover:text-secondary z-10"
            >
                <GripVertical size={14} />
            </button>
            <div className="flex-1 pl-5">
                <IssueRow issue={issue} companyIdentifier={companyIdentifier} onClick={onClick} />
            </div>
        </div>
    );
}

/* ── List group section ── */
interface ListGroupSectionProps {
    label: string;
    color?: string;
    issues: Issue[];
    companyIdentifier?: string;
    workspaceSlug: string;
    companyId: string;
    defaultStateId: string;
    onIssueClick: (issue: Issue) => void;
    showQuickAdd?: boolean;
}

function ListGroupSection({
    label,
    color,
    issues,
    companyIdentifier,
    workspaceSlug,
    companyId,
    defaultStateId,
    onIssueClick,
    showQuickAdd = false,
}: ListGroupSectionProps): React.ReactElement {
    return (
        <div className="border border-subtle rounded-lg overflow-hidden animate-fade-in">
            {/* Group header */}
            <div className="flex items-center gap-2 px-4 h-9 border-b border-subtle bg-surface-1">
                {color && (
                    <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                    />
                )}
                <span className="text-xs font-semibold text-secondary flex-1">{label}</span>
                <span className="text-xs text-placeholder bg-layer-2 px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {issues.length}
                </span>
            </div>
            <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {issues.map((issue) => (
                    <SortableIssueRow
                        key={issue.id}
                        issue={issue}
                        companyIdentifier={companyIdentifier}
                        onClick={() => onIssueClick(issue)}
                    />
                ))}
            </SortableContext>
            {showQuickAdd && defaultStateId && (
                <QuickAddRow
                    workspaceSlug={workspaceSlug}
                    companyId={companyId}
                    defaultStateId={defaultStateId}
                />
            )}
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
        const map = new Map<string, Issue[]>();
        for (const issue of issues) {
            const key = issue.assigneeId ?? '__unassigned__';
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
    companyIdentifier?: string;
    workspaceSlug: string;
    companyId: string;
    defaultStateId: string;
    groupBy: GroupByOption;
    onIssueClick: (issue: Issue) => void;
}

function ListView({
    issues,
    states,
    companyIdentifier,
    workspaceSlug,
    companyId,
    defaultStateId,
    groupBy,
    onIssueClick,
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
    const showGroupHeader = groupBy !== 'none' || true;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-3 animate-fade-in">
                {groups.map((group, idx) => (
                    <ListGroupSection
                        key={group.key}
                        label={group.label}
                        color={group.color}
                        issues={group.issues}
                        companyIdentifier={companyIdentifier}
                        workspaceSlug={workspaceSlug}
                        companyId={companyId}
                        defaultStateId={defaultStateId}
                        onIssueClick={onIssueClick}
                        showQuickAdd={idx === 0 && showGroupHeader}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeIssue ? (
                    <div className="bg-surface-1 border border-accent-primary/30 rounded-md shadow-overlay-200 opacity-95 pointer-events-none">
                        <IssueRow
                            issue={activeIssue}
                            companyIdentifier={companyIdentifier}
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
    companyIdentifier?: string;
    onClick: () => void;
    isDragOverlay?: boolean;
}

function KanbanCard({ issue, companyIdentifier, onClick, isDragOverlay = false }: KanbanCardProps): React.ReactElement {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <button
            type="button"
            ref={isDragOverlay ? undefined : setNodeRef}
            style={isDragOverlay ? undefined : style}
            {...(isDragOverlay ? {} : attributes)}
            {...(isDragOverlay ? {} : listeners)}
            className={cn(
                'w-full text-left bg-surface-1 rounded-md border border-subtle p-3 cursor-grab active:cursor-grabbing hover:border-accent-primary/30 transition-colors',
                isDragOverlay && 'shadow-overlay-200 rotate-1',
            )}
            onClick={onClick}
        >
            <p className="text-xs font-mono text-placeholder mb-1.5">
                {companyIdentifier ?? 'ISS'}-{issue.sequenceId}
            </p>
            <p className="text-sm font-medium text-primary line-clamp-2 mb-2">{issue.title}</p>
            <div className="flex items-center justify-between gap-2">
                <IssuePriorityBadge priority={issue.priority} />
                {issue.dueDate && (
                    <span className="text-xs text-placeholder">
                        {new Date(issue.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </span>
                )}
            </div>
        </button>
    );
}

/* ── Kanban droppable column ── */
interface KanbanColumnProps {
    state: State;
    issues: Issue[];
    companyIdentifier?: string;
    onIssueClick: (issue: Issue) => void;
}

function KanbanColumn({ state, issues, companyIdentifier, onIssueClick }: KanbanColumnProps): React.ReactElement {
    const { setNodeRef, isOver } = useDroppable({ id: state.id });

    return (
        <div className="flex flex-col w-72 shrink-0">
            <div className="flex items-center gap-2 mb-3 px-1">
                <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: state.color }}
                    aria-hidden="true"
                />
                <span className="text-sm font-semibold text-primary">{state.name}</span>
                <span className="ml-auto min-w-[1.25rem] text-center text-xs font-medium text-placeholder bg-layer-2 px-1.5 py-0.5 rounded-full">
                    {issues.length}
                </span>
            </div>
            <div
                ref={setNodeRef}
                className={cn(
                    'flex-1 min-h-20 rounded-lg p-2 space-y-2 transition-colors',
                    isOver && 'bg-accent-subtle/30',
                    issues.length === 0 && !isOver && 'border border-dashed border-subtle',
                )}
            >
                {issues.length === 0 && !isOver ? (
                    <p className="text-xs text-placeholder text-center py-6">Sin tareas</p>
                ) : (
                    <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        {issues.map((issue) => (
                            <KanbanCard
                                key={issue.id}
                                issue={issue}
                                companyIdentifier={companyIdentifier}
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
    companyIdentifier?: string;
    onIssueClick: (issue: Issue) => void;
    workspaceSlug: string;
    companyId: string;
}

function KanbanView({ issues, states, companyIdentifier, onIssueClick, workspaceSlug, companyId }: KanbanViewProps): React.ReactElement {
    const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
    const { mutate: updateIssue } = useUpdateIssue(workspaceSlug, companyId);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const activeIssue = activeIssueId ? issues.find((i) => i.id === activeIssueId) : null;

    const handleDragStart = (event: DragStartEvent): void => {
        setActiveIssueId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent): void => {
        const { active, over } = event;
        setActiveIssueId(null);
        if (!over) return;

        const issueId = String(active.id);
        const overId = String(over.id);
        const targetState = states.find((s) => s.id === overId);
        let newStateId: string | undefined;

        if (targetState) {
            newStateId = targetState.id;
        } else {
            const overIssue = issues.find((i) => i.id === overId);
            newStateId = overIssue?.stateId;
        }

        if (!newStateId) return;
        const issue = issues.find((i) => i.id === issueId);
        if (!issue || issue.stateId === newStateId) return;
        updateIssue({ issueId, data: { stateId: newStateId } });
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 animate-fade-in">
                {states.map((state) => (
                    <KanbanColumn
                        key={state.id}
                        state={state}
                        issues={issues.filter((i) => i.stateId === state.id)}
                        companyIdentifier={companyIdentifier}
                        onIssueClick={onIssueClick}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeIssue ? (
                    <KanbanCard
                        issue={activeIssue}
                        companyIdentifier={companyIdentifier}
                        onClick={() => undefined}
                        isDragOverlay
                    />
                ) : null}
            </DragOverlay>
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
                'p-2 transition-colors',
                current === mode ? 'bg-layer-2 text-primary' : 'text-placeholder hover:text-secondary hover:bg-surface-2',
            )}
        >
            {children}
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
        result = result.filter((i) => i.assigneeId && (filters.assigneeId ?? []).includes(i.assigneeId));
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

/* ── Main page ── */
function useIssuesPageData(workspaceSlug: string, companyId: string) {
    const { data, isLoading: issuesLoading } = useIssues(workspaceSlug, companyId);
    const { data: states, isLoading: statesLoading } = useCompanyStates(workspaceSlug, companyId);
    const { data: company } = useCompany(workspaceSlug, companyId);
    const isLoading = issuesLoading || statesLoading;
    const allIssues = data?.items ?? [];
    const sortedStates = [...(states ?? [])].sort((a, b) => a.sequence - b.sequence);
    return {
        isLoading,
        allIssues,
        sortedStates,
        defaultStateId: sortedStates[0]?.id ?? '',
        companyIdentifier: company?.identifier,
    };
}

export const IssuesPage = (): React.ReactElement => {
    const { workspaceSlug = '', companyId = '' } = useParams<{ workspaceSlug: string; companyId: string }>();
    const navigate = useNavigate();

    const { isLoading, allIssues, sortedStates, defaultStateId, companyIdentifier } =
        useIssuesPageData(workspaceSlug, companyId);

    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [filters, setFilters] = useState<IssueFilter>({});
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
        void navigate(`/${workspaceSlug}/companies/${companyId}/issues/${issueId}`);
    };

    const hasIssues = !isLoading && allIssues.length > 0;

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold text-primary">Tareas</h1>
                        {hasIssues && (
                            <span className="text-xs font-medium text-placeholder bg-layer-2 px-2 py-0.5 rounded-full">
                                {issues.length}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Display options button */}
                        {hasIssues && viewMode === 'list' && (
                            <button
                                type="button"
                                onClick={() => setDisplayPanelOpen(true)}
                                aria-label="Opciones de vista"
                                className={cn(
                                    'p-2 rounded-md border transition-colors text-xs flex items-center gap-1.5',
                                    displayPanelOpen
                                        ? 'bg-accent-subtle border-accent-primary/50 text-accent-primary'
                                        : 'border-subtle text-placeholder hover:text-secondary hover:bg-surface-2',
                                )}
                            >
                                <SlidersHorizontal size={14} />
                                <span className="hidden sm:inline">Vista</span>
                            </button>
                        )}

                        {/* View toggle */}
                        <div className="flex items-center border border-subtle rounded-md overflow-hidden">
                            <ViewToggleButton mode="list" current={viewMode} label="Vista lista" onClick={() => setViewMode('list')}>
                                <LayoutList size={15} />
                            </ViewToggleButton>
                            <ViewToggleButton mode="kanban" current={viewMode} label="Vista kanban" onClick={() => setViewMode('kanban')}>
                                <Columns size={15} />
                            </ViewToggleButton>
                            <ViewToggleButton mode="spreadsheet" current={viewMode} label="Vista hoja" onClick={() => setViewMode('spreadsheet')}>
                                <TableProperties size={15} />
                            </ViewToggleButton>
                            <ViewToggleButton mode="gantt" current={viewMode} label="Vista Gantt" onClick={() => setViewMode('gantt')}>
                                <GanttChart size={15} />
                            </ViewToggleButton>
                            <ViewToggleButton mode="calendar" current={viewMode} label="Vista calendario" onClick={() => setViewMode('calendar')}>
                                <CalendarDays size={15} />
                            </ViewToggleButton>
                        </div>

                        {hasIssues && (
                            <IssueListPdfExport
                                issues={issues}
                                companyIdentifier={companyIdentifier}
                            />
                        )}

                        <CreateIssueDialog
                            workspaceSlug={workspaceSlug}
                            companyId={companyId}
                            trigger={
                                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                    <Plus size={15} />
                                    Nuevo issue
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* Filters */}
                {hasIssues && (
                    <div className="mb-4">
                        <IssueFilters
                            filters={filters}
                            workspaceSlug={workspaceSlug}
                            companyId={companyId}
                            onChange={setFilters}
                        />
                    </div>
                )}

                {isLoading && <LoadingSkeleton />}

                {!isLoading && allIssues.length === 0 && (
                    <EmptyState workspaceSlug={workspaceSlug} companyId={companyId} />
                )}

                {hasIssues && viewMode === 'list' && (
                    <ListView
                        issues={issues}
                        states={sortedStates}
                        companyIdentifier={companyIdentifier}
                        workspaceSlug={workspaceSlug}
                        companyId={companyId}
                        defaultStateId={defaultStateId}
                        groupBy={displayOptions.groupBy}
                        onIssueClick={(issue) => setPeekIssueId(issue.id)}
                    />
                )}

                {hasIssues && viewMode === 'kanban' && (
                    <KanbanView
                        issues={issues}
                        states={sortedStates}
                        companyIdentifier={companyIdentifier}
                        onIssueClick={(issue) => setPeekIssueId(issue.id)}
                        workspaceSlug={workspaceSlug}
                        companyId={companyId}
                    />
                )}

                {hasIssues && viewMode === 'spreadsheet' && (
                    <IssueSpreadsheetView issues={issues} states={sortedStates} onRowClick={goToIssue} />
                )}

                {hasIssues && viewMode === 'gantt' && (
                    <IssueGanttView issues={issues} onRowClick={goToIssue} />
                )}

                {hasIssues && viewMode === 'calendar' && (
                    <IssueCalendarView issues={issues} onIssueClick={goToIssue} />
                )}
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
