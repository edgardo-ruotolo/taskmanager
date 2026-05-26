import type React from 'react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    ArrowLeft,
    Trash2,
    SmilePlus,
    Plus,
    ExternalLink,
    ChevronRight,
    Copy,
    Check,
    MoreHorizontal,
    Pencil,
    GitBranch,
    User,
} from 'lucide-react';
import { useWorkspaceMembers } from '@/modules/workspaces/application/use-workspaces';
import { useProjectStates } from '@/modules/states/application/use-states';
import { useLabels } from '@/modules/labels/application/use-labels';
import { AiSubIssueGenerator } from '@/modules/ai/presentation/components/AiSubIssueGenerator';
import { IssuePdfExport } from '@/modules/pdf/presentation/components/IssuePdfExport';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useAuthMe } from '@/modules/auth/application/use-auth-me';
import { useRealtimeIssue } from '@/modules/realtime/application/use-realtime-issue';
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { useDocumentCollaboration } from '@/shared/hooks/useDocumentCollaboration';
import { SearchableSelect } from '@/shared/components/ui/searchable-select';
import type { IssueRelationType, IssuePriority } from '../../domain/types';
import { PRIORITY_LABELS } from '../../domain/types';
import { FileAttachments } from '@/modules/files/presentation/components/FileAttachments';
import { WorklogPanel } from '@/modules/time-tracking/presentation/components/WorklogPanel';
import { IssueStateBadge } from '../components/IssueStateBadge';
import { IssueAiDependencyBanner } from '../components/IssueAiDependencyBanner';
import {
    useIssueDetail,
    useComments,
    useCreateComment,
    useDeleteComment,
    useUpdateComment,
    useReactions,
    useAddReaction,
    useRemoveReaction,
    useActivities,
    useSubscribers,
    useSubscribe,
    useUnsubscribe,
    useIssueLinks,
    useCreateIssueLink,
    useDeleteIssueLink,
    useIssueRelations,
    useCreateIssueRelation,
    useDeleteIssueRelation,
} from '../../application/use-issue-detail';
import { useUpdateIssue, useIssues, useSubIssues } from '../../application/use-issues';
import { useProject } from '@/modules/projects/application/use-projects';
import { getProjectFeatures } from '@/modules/projects/application/use-project-features';
import { useCycles } from '@/modules/cycles/application/use-cycles';
import { useModules } from '@/modules/modules/application/use-modules';
import { CreateIssueDialog } from '../components/CreateIssueDialog';
import type {
    IssueComment,
    IssueActivity,
    IssueReaction,
    IssueSubscriber,
    IssueLink,
    IssueRelation,
} from '../../domain/types';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '🎉', '🚀', '👎'] as const;

const RELATION_LABELS: Record<IssueRelationType, string> = {
    DuplicateOf: 'Duplicado de',
    BlockedBy: 'Bloqueado por',
    Blocking: 'Bloquea a',
    IsEpicOf: 'Épica de',
    Duplicate: 'Duplica a',
    RelatesTo: 'Se relaciona con',
    StartBefore: 'Inicia antes de',
    StartAfter: 'Inicia después de',
    FinishBefore: 'Finaliza antes de',
    FinishAfter: 'Finaliza después de',
    ImplementedBy: 'Implementado por',
    Implements: 'Implementa a',
};

const commentSchema = z.object({
    body: z.string().min(1, 'El comentario no puede estar vacío'),
});
type CommentFormData = z.infer<typeof commentSchema>;

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'hace un momento';
    if (diffMins < 60) {
        return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(-diffMins, 'minute');
    }
    if (diffHours < 24) {
        return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(-diffHours, 'hour');
    }
    return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(-diffDays, 'day');
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

/* ── Inline title editor ── */
interface InlineTitleProps {
    title: string;
    onSave: (title: string) => void;
    isPending: boolean;
}

function InlineTitle({ title, onSave, isPending }: InlineTitleProps): React.ReactElement {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing]);

    const handleBlur = (): void => {
        setEditing(false);
        const trimmed = value.trim();
        if (trimmed && trimmed !== title) onSave(trimmed);
        else setValue(title);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') { setValue(title); setEditing(false); }
    };

    if (editing) {
        return (
            <input
                ref={inputRef}
                value={value}
                disabled={isPending}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full text-[42px] font-medium tightest text-primary bg-transparent border-b border-[var(--brand-700)] outline-none pb-0.5"
            />
        );
    }

    return (
        <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-full text-left text-[42px] font-medium tightest text-primary hover:opacity-80 transition-opacity"
        >
            {title}
        </button>
    );
}

/* ── Reactions ── */
interface ReactionsSectionProps {
    reactions: IssueReaction[];
    currentUserId: string;
    onAdd: (emoji: string) => void;
    onRemove: (emoji: string) => void;
    isAdding: boolean;
    isRemoving: boolean;
}

function ReactionsSection({
    reactions,
    currentUserId,
    onAdd,
    onRemove,
    isAdding,
    isRemoving,
}: ReactionsSectionProps): React.ReactElement {
    const [showPicker, setShowPicker] = useState(false);

    const grouped = reactions.reduce<Record<string, { count: number; hasCurrentUser: boolean }>>(
        (acc, r) => {
            if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasCurrentUser: false };
            acc[r.emoji].count += 1;
            if (r.actorId === currentUserId) acc[r.emoji].hasCurrentUser = true;
            return acc;
        },
        {},
    );

    const handleEmojiClick = (emoji: string): void => {
        const entry = grouped[emoji];
        if (entry?.hasCurrentUser) onRemove(emoji);
        else onAdd(emoji);
        setShowPicker(false);
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(grouped).map(([emoji, { count, hasCurrentUser }]) => (
                <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                    disabled={isAdding || isRemoving}
                    className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition-colors',
                        hasCurrentUser
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-subtle bg-layer-1/50 text-secondary hover:border-strong',
                    )}
                >
                    <span>{emoji}</span>
                    <span className="text-xs">{count}</span>
                </button>
            ))}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowPicker((p) => !p)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-sm border border-subtle bg-layer-1/50 text-tertiary hover:border-strong hover:text-secondary transition-colors"
                >
                    <SmilePlus size={14} />
                </button>
                {showPicker && (
                    <div className="absolute left-0 top-full mt-1 z-10 bg-surface-1 border border-subtle rounded-lg p-2 flex gap-1 shadow-lg">
                        {EMOJI_OPTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => handleEmojiClick(emoji)}
                                disabled={isAdding || isRemoving}
                                className="text-lg hover:scale-125 transition-transform p-1"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Comment item ── */
interface CommentItemProps {
    comment: IssueComment;
    currentUserId: string;
    workspaceSlug: string;
    projectId: string;
    issueId: string;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

function CommentItem({
    comment,
    currentUserId,
    workspaceSlug,
    projectId,
    issueId,
    onDelete,
    isDeleting,
}: CommentItemProps): React.ReactElement {
    const [isEditing, setIsEditing] = useState(false);
    const [editBody, setEditBody] = useState(comment.body);
    const { mutate: updateComment, isPending: isUpdating } = useUpdateComment(workspaceSlug, projectId, issueId);
    const isOwner = comment.authorId === currentUserId;

    const handleSaveEdit = (): void => {
        const trimmed = editBody.trim();
        if (!trimmed || trimmed === comment.body) {
            setIsEditing(false);
            return;
        }
        updateComment(
            { commentId: comment.id, body: trimmed },
            { onSuccess: () => setIsEditing(false) },
        );
    };

    const handleCancelEdit = (): void => {
        setEditBody(comment.body);
        setIsEditing(false);
    };

    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-layer-2 flex items-center justify-center text-xs font-medium text-secondary shrink-0">
                {getInitials(comment.authorName)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-primary">{comment.authorName}</span>
                    <span className="text-xs text-placeholder">
                        {formatRelativeTime(comment.createdAt)}
                    </span>
                </div>
                {isEditing ? (
                    <div className="space-y-2">
                        <Textarea
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            className="bg-layer-1 border-subtle text-primary text-sm min-h-[80px] resize-none"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={isUpdating || !editBody.trim()}
                                className="bg-accent-primary hover:bg-accent-primary-hover text-on-color h-7 text-xs"
                            >
                                {isUpdating ? 'Guardando...' : 'Guardar'}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                disabled={isUpdating}
                                className="h-7 text-xs text-secondary"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-secondary whitespace-pre-wrap break-words">
                        {comment.body}
                    </p>
                )}
            </div>
            {isOwner && !isEditing && (
                <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="text-placeholder hover:text-secondary transition-colors shrink-0 mt-0.5"
                                aria-label="Opciones del comentario"
                            >
                                <MoreHorizontal size={14} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-surface-1 border-subtle text-primary w-36">
                            <DropdownMenuItem
                                onClick={() => { setEditBody(comment.body); setIsEditing(true); }}
                                className="gap-2 cursor-pointer"
                            >
                                <Pencil size={13} />
                                Editar
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer text-red-400 focus:text-red-400"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <Trash2 size={13} />
                                    Eliminar
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent className="bg-surface-1 border-subtle text-primary">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar comentario</AlertDialogTitle>
                            <AlertDialogDescription className="text-secondary">
                                ¿Estás seguro de que querés eliminar este comentario? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-subtle text-secondary hover:bg-layer-1-hover">
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => onDelete(comment.id)}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}

/* ── Activity item ── */
function ActivityItem({ activity }: { activity: IssueActivity }): React.ReactElement {
    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-layer-1 border border-subtle flex items-center justify-center text-xs font-medium text-tertiary shrink-0">
                {getInitials(activity.actorName)}
            </div>
            <div className="flex-1 min-w-0 py-1">
                <p className="text-sm text-tertiary">
                    <span className="text-secondary font-medium">{activity.actorName}</span>
                    {' cambió '}
                    <span className="text-secondary">{activity.field}</span>
                    {activity.oldValue != null && (
                        <>
                            {' de '}
                            <span className="text-placeholder line-through">{activity.oldValue}</span>
                        </>
                    )}
                    {activity.newValue != null && (
                        <>
                            {' a '}
                            <span className="text-primary">{activity.newValue}</span>
                        </>
                    )}
                </p>
                <p className="text-xs text-placeholder mt-0.5">
                    {formatRelativeTime(activity.createdAt)}
                </p>
            </div>
        </div>
    );
}

/* ── Comment form ── */
interface CommentFormProps {
    onSubmit: (data: CommentFormData) => void;
    isPending: boolean;
}

function CommentForm({ onSubmit, isPending }: CommentFormProps): React.ReactElement {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CommentFormData>({ resolver: zodResolver(commentSchema) });

    const handleFormSubmit = (data: CommentFormData): void => {
        onSubmit(data);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-2">
            <Textarea
                {...register('body')}
                placeholder="Escribe un comentario..."
                className="bg-layer-1/50 border-subtle text-primary placeholder:text-placeholder resize-none"
                rows={3}
            />
            {errors.body && <p className="text-xs text-red-400">{errors.body.message}</p>}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-accent-primary hover:bg-accent-primary-hover text-on-color text-sm"
                    size="sm"
                >
                    {isPending ? 'Enviando...' : 'Comentar'}
                </Button>
            </div>
        </form>
    );
}

/* ── Links section ── */
interface LinksSectionProps {
    workspaceSlug: string;
    projectId: string;
    issueId: string;
}

function LinksSection({ workspaceSlug, projectId, issueId }: LinksSectionProps): React.ReactElement {
    const [urlInput, setUrlInput] = useState('');
    const [titleInput, setTitleInput] = useState('');
    const { data: links = [] } = useIssueLinks(workspaceSlug, projectId, issueId);
    const { mutate: createLink, isPending: isCreating } = useCreateIssueLink(
        workspaceSlug,
        projectId,
        issueId,
    );
    const { mutate: deleteLink, isPending: isDeleting } = useDeleteIssueLink(
        workspaceSlug,
        projectId,
        issueId,
    );

    const handleAdd = (): void => {
        const url = urlInput.trim();
        const title = titleInput.trim();
        if (!url || !title) return;
        createLink({ url, title }, { onSuccess: () => { setUrlInput(''); setTitleInput(''); } });
    };

    return (
        <div>
            <h3 className="text-sm font-medium text-secondary mb-3">Enlaces</h3>
            <div className="space-y-2 mb-3">
                {links.length === 0 && <p className="text-xs text-placeholder italic">No hay enlaces</p>}
                {links.map((link: IssueLink) => (
                    <div key={link.id} className="flex items-center gap-2">
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 truncate"
                        >
                            <ExternalLink size={12} className="shrink-0" />
                            {link.title}
                        </a>
                        <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => deleteLink(link.id)}
                            className="text-placeholder hover:text-red-400 transition-colors shrink-0"
                            aria-label="Eliminar enlace"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="space-y-1.5">
                <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="bg-layer-1/50 border-subtle text-primary placeholder:text-placeholder text-xs h-8"
                />
                <div className="flex gap-2">
                    <Input
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                        placeholder="Título"
                        className="bg-layer-1/50 border-subtle text-primary placeholder:text-placeholder text-xs h-8 flex-1"
                    />
                    <Button
                        size="sm"
                        onClick={handleAdd}
                        disabled={isCreating || !urlInput.trim() || !titleInput.trim()}
                        className="bg-accent-primary hover:bg-accent-primary-hover text-on-color h-8 px-2"
                    >
                        <Plus size={13} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* ── Relations section ── */
interface RelationsSectionProps {
    workspaceSlug: string;
    projectId: string;
    issueId: string;
    projectIdentifier?: string;
}

function RelationsSection({
    workspaceSlug,
    projectId,
    issueId,
    projectIdentifier,
}: RelationsSectionProps): React.ReactElement {
    const [selectedIssueId, setSelectedIssueId] = useState('');
    const [relationType, setRelationType] = useState<IssueRelationType>('DuplicateOf');
    const { data: relations = [] } = useIssueRelations(workspaceSlug, projectId, issueId);
    const { data: allIssuesData } = useIssues(workspaceSlug, projectId);
    const candidateIssues = (allIssuesData?.items ?? []).filter(
        (i) => i.id !== issueId && !relations.some((r) => r.relatedIssueId === i.id),
    );

    const { mutate: createRelation, isPending: isCreating } = useCreateIssueRelation(
        workspaceSlug,
        projectId,
        issueId,
    );
    const { mutate: deleteRelation, isPending: isDeleting } = useDeleteIssueRelation(
        workspaceSlug,
        projectId,
        issueId,
    );

    const handleAdd = (): void => {
        if (!selectedIssueId) return;
        createRelation(
            { relatedIssueId: selectedIssueId, relationType },
            {
                onSuccess: () => {
                    setSelectedIssueId('');
                },
            },
        );
    };

    const candidateIssueItems = useMemo(
        () =>
            candidateIssues.map((i) => ({
                id: i.id,
                label: i.title,
                sublabel: `${projectIdentifier ?? 'ISS'}-${i.sequenceId}`,
                searchTerms: [String(i.sequenceId)],
            })),
        [candidateIssues, projectIdentifier],
    );

    return (
        <div>
            <h3 className="text-sm font-medium text-secondary mb-3">Relaciones</h3>
            <div className="space-y-2 mb-3">
                {relations.length === 0 && (
                    <p className="text-xs text-placeholder italic">No hay relaciones</p>
                )}
                {relations.map((rel: IssueRelation) => (
                    <div key={rel.id} className="flex items-center gap-2 py-0.5">
                        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-medium text-placeholder bg-layer-2 rounded px-1.5 py-0.5 shrink-0">
                                {RELATION_LABELS[rel.relationType]}
                            </span>
                            <span className="text-xs font-mono text-blue-400 shrink-0">
                                {projectIdentifier ?? 'ISS'}-{rel.relatedIssueSequenceId}
                            </span>
                            <span className="text-xs text-secondary truncate">
                                {rel.relatedIssueTitle}
                            </span>
                        </div>
                        <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => deleteRelation(rel.id)}
                            className="text-placeholder hover:text-red-400 transition-colors shrink-0"
                            aria-label="Eliminar relación"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="space-y-1.5">
                <SearchableSelect
                    multi={false}
                    value={relationType}
                    onChange={(v) => { if (v) setRelationType(v as IssueRelationType); }}
                    items={(Object.keys(RELATION_LABELS) as IssueRelationType[]).map((key) => ({
                        id: key,
                        label: RELATION_LABELS[key],
                    }))}
                    placeholder="Tipo de relación"
                    width="100%"
                    clearable={false}
                />
                <div className="flex gap-2">
                    <div className="flex-1">
                        <SearchableSelect
                            multi={false}
                            value={selectedIssueId || null}
                            onChange={(v) => setSelectedIssueId(v ?? '')}
                            items={candidateIssueItems}
                            placeholder="Buscar tarea..."
                            width="100%"
                            clearable
                        />
                    </div>
                    <Button
                        size="sm"
                        onClick={handleAdd}
                        disabled={isCreating || !selectedIssueId}
                        className="bg-accent-primary hover:bg-accent-primary-hover text-on-color h-8 px-2"
                    >
                        <Plus size={13} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* ── Comments & Activity tabs ── */
interface CommentsAndActivityTabsProps {
    workspaceSlug: string;
    projectId: string;
    issueId: string;
    currentUserId: string;
}

function CommentsAndActivityTabs({
    workspaceSlug,
    projectId,
    issueId,
    currentUserId,
}: CommentsAndActivityTabsProps): React.ReactElement {
    const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
    const { data: comments = [] } = useComments(workspaceSlug, projectId, issueId);
    const { data: activities = [] } = useActivities(workspaceSlug, projectId, issueId);
    const { mutate: createComment, isPending: isCreatingComment } = useCreateComment(
        workspaceSlug,
        projectId,
        issueId,
    );
    const { mutate: deleteComment, isPending: isDeletingComment } = useDeleteComment(
        workspaceSlug,
        projectId,
        issueId,
    );

    return (
        <>
            <div className="flex gap-1 mb-4 border-b border-subtle">
                {(['comments', 'activity'] as const).map((tab) => {
                    const count = tab === 'comments' ? comments.length : activities.length;
                    const label = tab === 'comments' ? 'Comentarios' : 'Actividad';
                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                                activeTab === tab
                                    ? 'border-primary text-blue-400'
                                    : 'border-transparent text-placeholder hover:text-secondary',
                            )}
                        >
                            {label}
                            {count > 0 && (
                                <span className="ml-1.5 text-xs bg-layer-2 text-secondary rounded-full px-1.5 py-0.5">
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {activeTab === 'comments' && (
                <div className="space-y-4">
                    {comments.length === 0 && (
                        <p className="text-sm text-placeholder italic py-2">
                            No hay comentarios aún. Sé el primero en comentar.
                        </p>
                    )}
                    {comments.map((comment: IssueComment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUserId={currentUserId}
                            workspaceSlug={workspaceSlug}
                            projectId={projectId}
                            issueId={issueId}
                            onDelete={deleteComment}
                            isDeleting={isDeletingComment}
                        />
                    ))}
                    <Separator className="bg-subtle" />
                    <CommentForm onSubmit={(data) => createComment(data)} isPending={isCreatingComment} />
                </div>
            )}

            {activeTab === 'activity' && (
                <div className="space-y-4">
                    {activities.length === 0 && (
                        <p className="text-sm text-placeholder italic py-2">
                            No hay actividad registrada.
                        </p>
                    )}
                    {activities.map((activity: IssueActivity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                    ))}
                </div>
            )}
        </>
    );
}

/* ── Sidebar property row ── */
interface PropertyRowProps {
    label: string;
    children: React.ReactNode;
}

function PropertyRow({ label, children }: PropertyRowProps): React.ReactElement {
    return (
        <div className="flex items-start justify-between gap-3 py-2.5 border-b border-subtle last:border-b-0">
            <span className="text-xs text-placeholder shrink-0 pt-0.5 w-24">
                {label}
            </span>
            <div className="flex-1 text-right">{children}</div>
        </div>
    );
}

/* ── Copy link button ── */
function CopyLinkButton({ url }: { url: string }): React.ReactElement {
    const [copied, setCopied] = useState(false);

    const handleCopy = (): void => {
        void navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            toast.success('Enlace copiado');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label="Copiar enlace"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-placeholder border border-subtle hover:text-secondary hover:bg-surface-2 transition-colors"
        >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copiado' : 'Copiar enlace'}
        </button>
    );
}

/* ── Main page ── */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: full issue detail page with many sections — complexity is structural
export const IssueDetailPage = (): React.ReactElement => {
    const { workspaceSlug = '', projectId = '', issueId = '' } = useParams<{
        workspaceSlug: string;
        projectId: string;
        issueId: string;
    }>();
    const { data: user } = useAuthMe();
    const currentUserId = user?.id ?? '';

    useRealtimeIssue(workspaceSlug, projectId, issueId);

    const { data: issue, isLoading: issueLoading } = useIssueDetail(
        workspaceSlug,
        projectId,
        issueId,
    );
    const { data: reactions = [] } = useReactions(workspaceSlug, projectId, issueId);
    const { data: subscribers = [] } = useSubscribers(workspaceSlug, projectId, issueId);
    const { data: project } = useProject(workspaceSlug, projectId);
    const projectIdentifier = project?.identifier;
    const features = getProjectFeatures(project);
    const { data: parentIssueData } = useIssueDetail(workspaceSlug, projectId, issue?.parentId ?? '');
    const { data: allIssuesData } = useIssues(workspaceSlug, projectId);
    const { data: subIssuesData } = useSubIssues(workspaceSlug, projectId, issueId, !!issueId);
    const subIssues = subIssuesData?.items ?? [];
    const issueIdentifier = `${projectIdentifier ?? 'ISS'}-${issue?.sequenceId ?? ''}`;
    const { data: cycles = [] } = useCycles(workspaceSlug, projectId, { enabled: !!workspaceSlug && !!projectId && features.cyclesEnabled });
    const { data: modules = [] } = useModules(workspaceSlug, projectId, { enabled: !!workspaceSlug && !!projectId && features.modulesEnabled });
    const { data: relationsForBanner = [] } = useIssueRelations(workspaceSlug, projectId, issueId);
    const { data: members = [] } = useWorkspaceMembers(workspaceSlug);
    const { data: states = [] } = useProjectStates(workspaceSlug, projectId);
    const { data: labels = [] } = useLabels(workspaceSlug);

    // SearchableSelect items built once per render
    const stateItems = useMemo(
        () =>
            states.map((s) => ({
                id: s.id,
                label: s.name,
                group: s.category,
                icon: (
                    <span
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: 99,
                            background: s.color,
                            display: 'inline-block',
                        }}
                    />
                ),
            })),
        [states],
    );

    const priorityItems = useMemo(
        () =>
            ([0, 1, 2, 3, 4] as const).map((p) => ({
                id: String(p),
                label: PRIORITY_LABELS[p as IssuePriority],
            })),
        [],
    );

    const memberItems = useMemo(
        () =>
            members.map((m) => ({
                id: m.userId,
                label: m.displayName ?? m.email,
                sublabel: m.email !== (m.displayName ?? m.email) ? m.email : undefined,
                icon: (
                    <span
                        className="inline-flex items-center justify-center rounded-full text-[9px] font-semibold"
                        style={{ width: 20, height: 20, background: 'var(--bg-cream-3)', color: 'var(--ink-mute)' }}
                    >
                        {(m.displayName ?? m.email).slice(0, 1).toUpperCase()}
                    </span>
                ),
            })),
        [members],
    );

    const labelItems = useMemo(
        () =>
            labels.map((l) => ({
                id: l.id,
                label: l.name,
                icon: (
                    <span
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: 99,
                            background: l.color,
                            display: 'inline-block',
                        }}
                    />
                ),
            })),
        [labels],
    );

    const cycleItems = useMemo(
        () => cycles.map((c) => ({ id: c.id, label: c.name })),
        [cycles],
    );

    const moduleItems = useMemo(
        () => modules.map((m) => ({ id: m.id, label: m.name })),
        [modules],
    );

    const parentItems = useMemo(
        () =>
            (allIssuesData?.items ?? [])
                .filter((i) => i.id !== issueId)
                .map((i) => ({
                    id: i.id,
                    label: `${projectIdentifier ?? 'ISS'}-${i.sequenceId} ${i.title}`,
                })),
        [allIssuesData, issueId, projectIdentifier],
    );

    const { mutate: updateIssue, isPending: isUpdating } = useUpdateIssue(workspaceSlug, projectId);

    const [descSaveState, setDescSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const descDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const descPendingRef = useRef<{ descriptionHtml?: string; descriptionJson?: string }>({});

    const handleDescriptionChange = (field: 'descriptionHtml' | 'descriptionJson', value: string): void => {
        descPendingRef.current = { ...descPendingRef.current, [field]: value };
        if (descDebounceRef.current) clearTimeout(descDebounceRef.current);
        setDescSaveState('saving');
        descDebounceRef.current = setTimeout(() => {
            if (!issue) return;
            const payload = { ...descPendingRef.current };
            descPendingRef.current = {};
            updateIssue(
                { issueId: issue.id, data: payload },
                {
                    onSuccess: () => {
                        setDescSaveState('saved');
                        setTimeout(() => setDescSaveState('idle'), 2000);
                    },
                    onError: () => setDescSaveState('idle'),
                },
            );
        }, 500);
    };

    const { mutate: addReaction, isPending: isAddingReaction } = useAddReaction(
        workspaceSlug,
        projectId,
        issueId,
    );
    const { mutate: removeReaction, isPending: isRemovingReaction } = useRemoveReaction(
        workspaceSlug,
        projectId,
        issueId,
    );
    const { mutate: subscribe, isPending: isSubscribing } = useSubscribe(
        workspaceSlug,
        projectId,
        issueId,
    );
    const { mutate: unsubscribe, isPending: isUnsubscribing } = useUnsubscribe(
        workspaceSlug,
        projectId,
        issueId,
    );

    const isSubscribed = subscribers.some((s: IssueSubscriber) => s.userId === currentUserId);

    const { participants: docParticipants } = useDocumentCollaboration(
        issueId ? `issue-${issueId}` : '',
    );
    const backUrl = `/${workspaceSlug}/projects/${projectId}/issues`;

    if (issueLoading) {
        return (
            <div className="p-8 w-full space-y-4">
                <Skeleton className="h-5 w-64 bg-layer-1" />
                <Skeleton className="h-9 w-full bg-layer-1" />
                <Skeleton className="h-32 w-full bg-layer-1" />
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="p-8 w-full">
                <Link
                    to={backUrl}
                    className="inline-flex items-center gap-1.5 text-sm text-tertiary hover:text-primary mb-6"
                >
                    <ArrowLeft size={16} />
                    Volver a Tareas
                </Link>
                <p className="text-tertiary">Tarea no encontrada.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* ── Sticky header ── */}
            <div className="sticky top-0 z-10 bg-canvas border-b border-subtle px-6 md:px-8 py-3">
                <div className="w-full flex items-center justify-between gap-4">
                    {/* Left: breadcrumb — workspace / project / Issues / ID */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <Link
                            to={`/${workspaceSlug}`}
                            className="text-xs text-placeholder hover:text-secondary transition-colors shrink-0"
                        >
                            {workspaceSlug}
                        </Link>
                        <ChevronRight size={11} className="text-placeholder shrink-0" aria-hidden="true" />
                        {project?.name && (
                            <>
                                <Link
                                    to={`/${workspaceSlug}/projects/${projectId}/issues`}
                                    className="text-xs text-placeholder hover:text-secondary transition-colors shrink-0 max-w-[120px] truncate"
                                >
                                    {project.name}
                                </Link>
                                <ChevronRight size={11} className="text-placeholder shrink-0" aria-hidden="true" />
                            </>
                        )}
                        <Link
                            to={backUrl}
                            className="text-xs text-placeholder hover:text-secondary transition-colors shrink-0"
                        >
                            Issues
                        </Link>
                        {issue.parentId && parentIssueData && (
                            <>
                                <ChevronRight size={11} className="text-placeholder shrink-0" aria-hidden="true" />
                                <Link
                                    to={`/${workspaceSlug}/projects/${projectId}/issues/${issue.parentId}`}
                                    className="text-xs font-mono text-tertiary hover:text-secondary transition-colors shrink-0"
                                >
                                    {projectIdentifier ?? 'ISS'}-{parentIssueData.sequenceId}
                                </Link>
                            </>
                        )}
                        <ChevronRight size={11} className="text-placeholder shrink-0" aria-hidden="true" />
                        <span className="text-xs font-mono text-tertiary shrink-0">
                            {issueIdentifier}
                        </span>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <IssuePdfExport
                            issue={{
                                sequenceId: issue.sequenceId,
                                title: issue.title,
                                description: issue.description,
                                stateName: issue.stateName,
                                priority: issue.priority,
                                createdAt: issue.createdAt,
                                dueDate: issue.dueDate ?? undefined,
                            }}
                            identifier={issueIdentifier}
                        />
                        <CopyLinkButton url={window.location.href} />
                        <button
                            type="button"
                            disabled={isSubscribing || isUnsubscribing}
                            onClick={() => (isSubscribed ? unsubscribe() : subscribe())}
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border transition-colors',
                                isSubscribed
                                    ? 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10'
                                    : 'border-subtle text-placeholder hover:text-secondary hover:bg-surface-2',
                            )}
                            aria-label={isSubscribed ? 'Desuscribirse del issue' : 'Suscribirse al issue'}
                        >
                            {isSubscribed ? 'Suscripto' : 'Suscribirse'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Page body ── */}
            <div className="p-6 md:p-8">
                <div className="w-full flex flex-col lg:flex-row gap-8">
                    {/* ── Left column (main) ── */}
                    <div className="flex-1 min-w-0">
                        {/* Identifier + title */}
                        <div className="mb-1">
                            <span className="text-xs font-mono text-placeholder">
                                {issueIdentifier}
                            </span>
                        </div>
                        <div className="mb-6">
                            <InlineTitle
                                title={issue.title}
                                onSave={(title) => updateIssue({ issueId: issue.id, data: { title } })}
                                isPending={isUpdating}
                            />
                        </div>

                        {/* AI Dependency Banner */}
                        {relationsForBanner.length > 0 && (
                            <IssueAiDependencyBanner
                                relations={relationsForBanner}
                                workspaceSlug={workspaceSlug}
                                projectId={projectId}
                                projectIdentifier={projectIdentifier}
                                className="mb-5"
                            />
                        )}

                        {/* Description */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-medium text-placeholder uppercase tracking-wider">
                                    Descripción
                                </p>
                                {docParticipants.length > 1 && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex -space-x-1">
                                            {docParticipants.slice(0, 3).map((p) => (
                                                <div
                                                    key={p.userId}
                                                    title={p.userName}
                                                    className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-[9px] font-semibold text-blue-400"
                                                >
                                                    {p.userName.slice(0, 1).toUpperCase()}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[11px] text-placeholder">
                                            {docParticipants.length} personas editando
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="rounded-lg border border-subtle bg-surface-1 px-4 py-3">
                                <RichTextEditor
                                    content={issue.descriptionHtml ?? issue.description ?? ''}
                                    placeholder="Agrega una descripción..."
                                    onChange={(html) => handleDescriptionChange('descriptionHtml', html)}
                                    onChangeJson={(json) => handleDescriptionChange('descriptionJson', json)}
                                    editable
                                />
                                {descSaveState !== 'idle' && (
                                    <p className="text-[11px] text-placeholder mt-1.5 text-right">
                                        {descSaveState === 'saving' ? 'Guardando...' : 'Guardado'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Separator className="bg-subtle mb-5" />

                        {/* Reactions */}
                        <div className="mb-5">
                            <ReactionsSection
                                reactions={reactions}
                                currentUserId={currentUserId}
                                onAdd={(emoji) => addReaction({ emoji })}
                                onRemove={(emoji) => removeReaction(emoji)}
                                isAdding={isAddingReaction}
                                isRemoving={isRemovingReaction}
                            />
                        </div>

                        <Separator className="bg-subtle mb-5" />

                        {/* Links */}
                        <div className="mb-5">
                            <LinksSection
                                workspaceSlug={workspaceSlug}
                                projectId={projectId}
                                issueId={issueId}
                            />
                        </div>

                        <Separator className="bg-subtle mb-5" />

                        {/* Relations */}
                        <div className="mb-5">
                            <RelationsSection
                                workspaceSlug={workspaceSlug}
                                projectId={projectId}
                                issueId={issueId}
                                projectIdentifier={projectIdentifier}
                            />
                        </div>

                        <Separator className="bg-subtle mb-5" />

                        {/* Sub-issues */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-secondary flex items-center gap-1.5">
                                    <GitBranch size={13} className="text-placeholder" />
                                    Sub-tareas
                                    {subIssues.length > 0 && (
                                        <span className="text-xs bg-layer-2 text-placeholder rounded-full px-1.5 py-0.5 ml-1">
                                            {subIssues.filter((s) => s.stateGroup === 'completed').length}/{subIssues.length} completados
                                        </span>
                                    )}
                                </h3>
                                <CreateIssueDialog
                                    workspaceSlug={workspaceSlug}
                                    projectId={projectId}
                                    defaultParentId={issue.id}
                                    trigger={
                                        <button
                                            type="button"
                                            className="flex items-center gap-1 text-xs text-placeholder hover:text-secondary transition-colors"
                                            aria-label="Agregar sub-tarea"
                                        >
                                            <Plus size={13} />
                                            Añadir
                                        </button>
                                    }
                                />
                            </div>
                            {subIssues.length === 0 ? (
                                <p className="text-xs text-placeholder italic">Sin sub-tareas</p>
                            ) : (
                                <div className="space-y-1">
                                    {subIssues.map((sub, idx) => (
                                        <Link
                                            key={sub.id}
                                            to={`/${workspaceSlug}/projects/${projectId}/issues/${sub.id}`}
                                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-layer-2 transition-colors group"
                                        >
                                            {/* Sub-issue number as parentSeqId.N */}
                                            <span className="text-[10px] font-mono text-tertiary shrink-0">
                                                {issueIdentifier}.{idx + 1}
                                            </span>
                                            <IssueStateBadge
                                                stateName={sub.stateName}
                                                stateGroup={sub.stateGroup ?? sub.stateName}
                                            />
                                            <span className="text-xs text-secondary truncate group-hover:text-primary transition-colors flex-1 min-w-0">
                                                {sub.title}
                                            </span>
                                            {/* Assignee indicator — TODO(backend): no assigneeName in DTO */}
                                            {sub.assigneeIds.length > 0 && (
                                                <span
                                                    className="w-5 h-5 rounded-full bg-layer-2 border border-subtle flex items-center justify-center text-[9px] text-tertiary shrink-0"
                                                    title={`${sub.assigneeIds.length} asignado${sub.assigneeIds.length > 1 ? 's' : ''}`}
                                                >
                                                    <User size={10} aria-hidden="true" />
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator className="bg-subtle mb-5" />

                        {/* Attachments */}
                        <div className="mb-5">
                            <FileAttachments
                                workspaceSlug={workspaceSlug}
                                entityType="issue"
                                entityId={issue.id}
                            />
                        </div>

                        <Separator className="bg-subtle mb-5" />

                        {/* Activity section */}
                        <h2 className="text-sm font-semibold text-secondary mb-4">Actividad</h2>
                        <CommentsAndActivityTabs
                            workspaceSlug={workspaceSlug}
                            projectId={projectId}
                            issueId={issueId}
                            currentUserId={currentUserId}
                        />
                    </div>

                    {/* ── Right column (sidebar, 320px) ── */}
                    <div className="lg:w-80 shrink-0">
                        {/* Properties */}
                        <div className="border border-subtle rounded-lg bg-surface-1 overflow-hidden">
                            <div className="px-4 py-3 border-b border-subtle">
                                <p className="text-xs font-semibold text-placeholder uppercase tracking-wider">
                                    Propiedades
                                </p>
                            </div>
                            <div className="px-4 py-1">
                                <PropertyRow label="ID">
                                    <span className="text-xs font-mono text-tertiary">
                                        {issueIdentifier}
                                    </span>
                                </PropertyRow>

                                <PropertyRow label="Estado">
                                    <SearchableSelect
                                        multi={false}
                                        value={issue.stateId || null}
                                        onChange={(v) => {
                                            if (v) updateIssue({ issueId: issue.id, data: { stateId: v } });
                                        }}
                                        items={stateItems}
                                        placeholder="Sin estado"
                                        width="100%"
                                        clearable={false}
                                        groupBy="group"
                                    />
                                </PropertyRow>

                                <PropertyRow label="Prioridad">
                                    <SearchableSelect
                                        multi={false}
                                        value={String(issue.priority)}
                                        onChange={(v) => {
                                            if (v !== null) updateIssue({ issueId: issue.id, data: { priority: Number(v) as IssuePriority } });
                                        }}
                                        items={priorityItems}
                                        placeholder="Sin prioridad"
                                        width="100%"
                                        clearable={false}
                                    />
                                </PropertyRow>

                                {/* TODO(backend): Issue DTO has no createdByName field — showing ID fallback */}
                                <PropertyRow label="Creado por">
                                    <span className="text-xs text-secondary font-mono">
                                        {issue.createdById.slice(0, 8)}…
                                    </span>
                                </PropertyRow>

                                <PropertyRow label="Asignados">
                                    <SearchableSelect
                                        multi={true}
                                        value={issue.assigneeIds}
                                        onChange={(v) =>
                                            updateIssue({ issueId: issue.id, data: { assigneeIds: v } })
                                        }
                                        items={memberItems}
                                        placeholder="Sin asignar"
                                        width="100%"
                                        clearable
                                    />
                                </PropertyRow>

                                {/* Bug 16: editable date fields */}
                                <PropertyRow label="Fecha inicio">
                                    <input
                                        type="date"
                                        aria-label="Fecha de inicio"
                                        defaultValue={issue.startDate ? issue.startDate.slice(0, 10) : ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            updateIssue({ issueId: issue.id, data: { startDate: val || undefined } });
                                        }}
                                        className="text-xs text-secondary bg-transparent border-b border-transparent hover:border-[var(--neutral-400)] focus:border-[var(--brand-700)] outline-none transition-colors cursor-pointer"
                                    />
                                </PropertyRow>

                                <PropertyRow label="Fecha límite">
                                    <input
                                        type="date"
                                        aria-label="Fecha límite"
                                        defaultValue={issue.dueDate ? issue.dueDate.slice(0, 10) : ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            updateIssue({ issueId: issue.id, data: { dueDate: val || undefined } });
                                        }}
                                        className="text-xs text-secondary bg-transparent border-b border-transparent hover:border-[var(--neutral-400)] focus:border-[var(--brand-700)] outline-none transition-colors cursor-pointer"
                                    />
                                </PropertyRow>

                                {/* Bug 17: editable parent field */}
                                <PropertyRow label="Padre">
                                    <SearchableSelect
                                        multi={false}
                                        value={issue.parentId ?? null}
                                        onChange={(v) =>
                                            updateIssue({ issueId: issue.id, data: { parentId: v ?? undefined } })
                                        }
                                        items={parentItems}
                                        placeholder="Sin padre"
                                        width="100%"
                                        clearable
                                    />
                                </PropertyRow>

                                <PropertyRow label="Etiquetas">
                                    <SearchableSelect
                                        multi={true}
                                        value={issue.labelIds}
                                        onChange={(v) =>
                                            updateIssue({ issueId: issue.id, data: { labelIds: v } })
                                        }
                                        items={labelItems}
                                        placeholder="Sin etiquetas"
                                        width="100%"
                                        clearable
                                    />
                                </PropertyRow>

                                {features.cyclesEnabled && (
                                <PropertyRow label="Ciclo">
                                    <SearchableSelect
                                        multi={false}
                                        value={issue.cycleId ?? null}
                                        onChange={(v) =>
                                            updateIssue({ issueId: issue.id, data: { cycleId: v ?? undefined } })
                                        }
                                        items={cycleItems}
                                        placeholder="Sin ciclo"
                                        width="100%"
                                        clearable
                                    />
                                </PropertyRow>
                                )}

                                {features.modulesEnabled && (
                                <PropertyRow label="Módulo">
                                    <SearchableSelect
                                        multi={true}
                                        value={issue.moduleIds}
                                        onChange={(v) =>
                                            updateIssue({ issueId: issue.id, data: { moduleIds: v } })
                                        }
                                        items={moduleItems}
                                        placeholder="Sin módulos"
                                        width="100%"
                                        clearable
                                    />
                                </PropertyRow>
                                )}

                                {issue.isDraft && (
                                    <PropertyRow label="Estado">
                                        <span className="text-xs text-yellow-500 font-medium">Borrador</span>
                                    </PropertyRow>
                                )}

                                <PropertyRow label="Creado">
                                    <span className="text-xs text-tertiary">
                                        {formatRelativeTime(issue.createdAt)}
                                    </span>
                                </PropertyRow>

                                <PropertyRow label="Actualizado">
                                    <span className="text-xs text-tertiary">
                                        {formatRelativeTime(issue.updatedAt)}
                                    </span>
                                </PropertyRow>
                            </div>
                        </div>

                        {/* Time Tracking */}
                        <WorklogPanel issueId={issue.id} workspaceSlug={workspaceSlug} />

                        {/* AI Tools */}
                        <div className="border border-subtle rounded-lg bg-surface-1 overflow-hidden mt-4">
                            <div className="px-4 py-3 border-b border-subtle">
                                <p className="text-xs font-semibold text-placeholder uppercase tracking-wider">
                                    Herramientas IA
                                </p>
                            </div>
                            <div className="px-4 py-3">
                                <AiSubIssueGenerator
                                    issueId={issue.id}
                                    issueTitle={issue.title}
                                    issueDescription={issue.description ?? ''}
                                    workspaceSlug={workspaceSlug}
                                />
                            </div>
                        </div>

                        {/* Subscribers */}
                        <div className="border border-subtle rounded-lg bg-surface-1 overflow-hidden mt-4">
                            <div className="px-4 py-3 border-b border-subtle">
                                <p className="text-xs font-semibold text-placeholder uppercase tracking-wider">
                                    Suscriptores
                                </p>
                            </div>
                            <div className="px-4 py-3 space-y-2">
                                {subscribers.length === 0 && (
                                    <p className="text-xs text-placeholder italic">Sin suscriptores</p>
                                )}
                                {subscribers.map((sub: IssueSubscriber) => (
                                    <div key={sub.userId} className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-layer-2 flex items-center justify-center text-xs font-medium text-secondary shrink-0">
                                            {`${sub.userFirstName?.[0] ?? ''}${sub.userLastName?.[0] ?? ''}`.toUpperCase()}
                                        </div>
                                        <span className="text-xs text-tertiary truncate">
                                            {sub.userFirstName} {sub.userLastName}
                                        </span>
                                    </div>
                                ))}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isSubscribing || isUnsubscribing}
                                    onClick={() => (isSubscribed ? unsubscribe() : subscribe())}
                                    className={cn(
                                        'w-full text-xs h-7 border-subtle mt-2',
                                        isSubscribed
                                            ? 'text-blue-400 hover:text-secondary'
                                            : 'text-secondary hover:text-primary',
                                    )}
                                >
                                    {isSubscribed ? 'Desuscribirse' : 'Suscribirse'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
