import type React from 'react';
import { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
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
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { useDocumentCollaboration } from '@/shared/hooks/useDocumentCollaboration';
import type { IssueRelationType } from '../../domain/types';
import { FileAttachments } from '@/modules/files/presentation/components/FileAttachments';
import { WorklogPanel } from '@/modules/time-tracking/presentation/components/WorklogPanel';
import { IssuePriorityBadge } from '../components/IssuePriorityBadge';
import { IssueStateBadge } from '../components/IssueStateBadge';
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
import { useUpdateIssue, useIssues } from '../../application/use-issues';
import { useCompany } from '@/modules/companies/application/use-companies';
import { CreateIssueDialog } from '../components/CreateIssueDialog';
import { useEstimates } from '@/modules/estimates/application/use-estimates';
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
                className="w-full text-2xl font-bold text-primary bg-transparent border-b border-blue-600 outline-none pb-0.5 leading-snug"
            />
        );
    }

    return (
        <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-full text-left text-2xl font-bold text-primary leading-snug hover:opacity-80 transition-opacity"
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
    companyId: string;
    issueId: string;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

function CommentItem({
    comment,
    currentUserId,
    workspaceSlug,
    companyId,
    issueId,
    onDelete,
    isDeleting,
}: CommentItemProps): React.ReactElement {
    const [isEditing, setIsEditing] = useState(false);
    const [editBody, setEditBody] = useState(comment.body);
    const { mutate: updateComment, isPending: isUpdating } = useUpdateComment(workspaceSlug, companyId, issueId);
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
    companyId: string;
    issueId: string;
}

function LinksSection({ workspaceSlug, companyId, issueId }: LinksSectionProps): React.ReactElement {
    const [urlInput, setUrlInput] = useState('');
    const [titleInput, setTitleInput] = useState('');
    const { data: links = [] } = useIssueLinks(workspaceSlug, companyId, issueId);
    const { mutate: createLink, isPending: isCreating } = useCreateIssueLink(
        workspaceSlug,
        companyId,
        issueId,
    );
    const { mutate: deleteLink, isPending: isDeleting } = useDeleteIssueLink(
        workspaceSlug,
        companyId,
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
    companyId: string;
    issueId: string;
    companyIdentifier?: string;
}

function RelationsSection({
    workspaceSlug,
    companyId,
    issueId,
    companyIdentifier,
}: RelationsSectionProps): React.ReactElement {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIssueId, setSelectedIssueId] = useState('');
    const [pickerOpen, setPickerOpen] = useState(false);
    const [relationType, setRelationType] = useState<IssueRelationType>('DuplicateOf');
    const { data: relations = [] } = useIssueRelations(workspaceSlug, companyId, issueId);
    const { data: allIssuesData } = useIssues(workspaceSlug, companyId);
    const candidateIssues = (allIssuesData?.items ?? []).filter(
        (i) => i.id !== issueId && !relations.some((r) => r.relatedIssueId === i.id),
    );
    const filteredCandidates = searchQuery.trim()
        ? candidateIssues.filter(
              (i) =>
                  i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  String(i.sequenceId).includes(searchQuery),
          )
        : candidateIssues.slice(0, 20);

    const { mutate: createRelation, isPending: isCreating } = useCreateIssueRelation(
        workspaceSlug,
        companyId,
        issueId,
    );
    const { mutate: deleteRelation, isPending: isDeleting } = useDeleteIssueRelation(
        workspaceSlug,
        companyId,
        issueId,
    );

    const handleAdd = (): void => {
        if (!selectedIssueId) return;
        createRelation(
            { relatedIssueId: selectedIssueId, relationType },
            {
                onSuccess: () => {
                    setSelectedIssueId('');
                    setSearchQuery('');
                    setPickerOpen(false);
                },
            },
        );
    };

    const selectedIssue = candidateIssues.find((i) => i.id === selectedIssueId);

    return (
        <div>
            <h3 className="text-sm font-medium text-secondary mb-3">Relaciones</h3>
            <div className="space-y-2 mb-3">
                {relations.length === 0 && (
                    <p className="text-xs text-placeholder italic">No hay relaciones</p>
                )}
                {relations.map((rel: IssueRelation) => (
                    <div key={rel.id} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="text-xs text-placeholder">
                                {RELATION_LABELS[rel.relationType]}
                            </span>{' '}
                            <span className="text-xs font-mono text-tertiary">
                                {companyIdentifier ?? 'ISS'}-{rel.relatedIssueSequenceId}
                            </span>{' '}
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
                <select
                    value={relationType}
                    onChange={(e) => setRelationType(e.target.value as IssueRelationType)}
                    className="w-full rounded-md border border-subtle bg-layer-1/50 px-2 py-1 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                    {(Object.keys(RELATION_LABELS) as IssueRelationType[]).map((key) => (
                        <option key={key} value={key}>
                            {RELATION_LABELS[key]}
                        </option>
                    ))}
                </select>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={selectedIssue ? `${companyIdentifier ?? 'ISS'}-${selectedIssue.sequenceId} — ${selectedIssue.title}` : searchQuery}
                            onChange={(e) => {
                                setSelectedIssueId('');
                                setSearchQuery(e.target.value);
                                setPickerOpen(true);
                            }}
                            onFocus={() => setPickerOpen(true)}
                            placeholder="Buscar tarea..."
                            className="bg-layer-1/50 border-subtle text-primary placeholder:text-placeholder text-xs h-8"
                        />
                        {pickerOpen && filteredCandidates.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-md border border-subtle bg-surface-1 shadow-lg">
                                {filteredCandidates.map((i) => (
                                    <button
                                        key={i.id}
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setSelectedIssueId(i.id);
                                            setSearchQuery('');
                                            setPickerOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-layer-2 transition-colors text-left"
                                    >
                                        <span className="font-mono text-tertiary shrink-0">
                                            {companyIdentifier ?? 'ISS'}-{i.sequenceId}
                                        </span>
                                        <span className="text-secondary truncate">{i.title}</span>
                                    </button>
                                ))}
                            </div>
                        )}
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
    companyId: string;
    issueId: string;
    currentUserId: string;
}

function CommentsAndActivityTabs({
    workspaceSlug,
    companyId,
    issueId,
    currentUserId,
}: CommentsAndActivityTabsProps): React.ReactElement {
    const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
    const { data: comments = [] } = useComments(workspaceSlug, companyId, issueId);
    const { data: activities = [] } = useActivities(workspaceSlug, companyId, issueId);
    const { mutate: createComment, isPending: isCreatingComment } = useCreateComment(
        workspaceSlug,
        companyId,
        issueId,
    );
    const { mutate: deleteComment, isPending: isDeletingComment } = useDeleteComment(
        workspaceSlug,
        companyId,
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
                            companyId={companyId}
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
export const IssueDetailPage = (): React.ReactElement => {
    const { workspaceSlug = '', companyId = '', issueId = '' } = useParams<{
        workspaceSlug: string;
        companyId: string;
        issueId: string;
    }>();
    const { data: user } = useAuthMe();
    const currentUserId = user?.id ?? '';

    const { data: issue, isLoading: issueLoading } = useIssueDetail(
        workspaceSlug,
        companyId,
        issueId,
    );
    const { data: reactions = [] } = useReactions(workspaceSlug, companyId, issueId);
    const { data: subscribers = [] } = useSubscribers(workspaceSlug, companyId, issueId);
    const { data: company } = useCompany(workspaceSlug, companyId);
    const companyIdentifier = company?.identifier;
    const { data: parentIssueData } = useIssueDetail(workspaceSlug, companyId, issue?.parentId ?? '');
    const { data: allIssuesData } = useIssues(workspaceSlug, companyId);
    const subIssues = (allIssuesData?.items ?? []).filter((i) => i.parentId === issueId);
    const issueIdentifier = `${companyIdentifier ?? 'ISS'}-${issue?.sequenceId ?? ''}`;
    const { data: estimates = [] } = useEstimates(workspaceSlug, companyId);
    const allEstimatePoints = estimates.flatMap((e) => (e.points ?? []).map((p) => ({ ...p, estimateName: e.name })));

    const { mutate: updateIssue, isPending: isUpdating } = useUpdateIssue(workspaceSlug, companyId);

    const [descSaveState, setDescSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const descDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleDescriptionChange = (field: 'descriptionHtml' | 'descriptionJson', value: string): void => {
        if (descDebounceRef.current) clearTimeout(descDebounceRef.current);
        setDescSaveState('saving');
        descDebounceRef.current = setTimeout(() => {
            if (!issue) return;
            updateIssue(
                { issueId: issue.id, data: { [field]: value } },
                {
                    onSuccess: () => {
                        setDescSaveState('saved');
                        setTimeout(() => setDescSaveState('idle'), 2000);
                    },
                    onError: () => setDescSaveState('idle'),
                },
            );
        }, 1500);
    };

    const { mutate: addReaction, isPending: isAddingReaction } = useAddReaction(
        workspaceSlug,
        companyId,
        issueId,
    );
    const { mutate: removeReaction, isPending: isRemovingReaction } = useRemoveReaction(
        workspaceSlug,
        companyId,
        issueId,
    );
    const { mutate: subscribe, isPending: isSubscribing } = useSubscribe(
        workspaceSlug,
        companyId,
        issueId,
    );
    const { mutate: unsubscribe, isPending: isUnsubscribing } = useUnsubscribe(
        workspaceSlug,
        companyId,
        issueId,
    );

    const isSubscribed = subscribers.some((s: IssueSubscriber) => s.userId === currentUserId);

    const { participants: docParticipants } = useDocumentCollaboration(
        issueId ? `issue-${issueId}` : '',
    );
    const backUrl = `/${workspaceSlug}/companies/${companyId}/issues`;

    if (issueLoading) {
        return (
            <div className="p-8 max-w-6xl mx-auto space-y-4">
                <Skeleton className="h-5 w-64 bg-layer-1" />
                <Skeleton className="h-9 w-full bg-layer-1" />
                <Skeleton className="h-32 w-full bg-layer-1" />
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
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
            <div className="sticky top-0 z-10 bg-background border-b border-subtle px-6 md:px-8 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    {/* Left: back + breadcrumb */}
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            to={backUrl}
                            className="inline-flex items-center gap-1.5 text-xs text-placeholder hover:text-secondary transition-colors shrink-0"
                        >
                            <ArrowLeft size={14} />
                            Issues
                        </Link>
                        {issue.parentId && parentIssueData && (
                            <>
                                <ChevronRight size={12} className="text-placeholder shrink-0" aria-hidden="true" />
                                <Link
                                    to={`/${workspaceSlug}/companies/${companyId}/issues/${issue.parentId}`}
                                    className="text-xs font-mono text-tertiary hover:text-secondary transition-colors shrink-0"
                                >
                                    {companyIdentifier ?? 'ISS'}-{parentIssueData.sequenceId}
                                </Link>
                            </>
                        )}
                        <ChevronRight size={12} className="text-placeholder shrink-0" aria-hidden="true" />
                        <span className="text-xs font-mono text-tertiary shrink-0">
                            {issueIdentifier}
                        </span>
                        <ChevronRight size={12} className="text-placeholder shrink-0" aria-hidden="true" />
                        <span className="text-xs text-secondary truncate">{issue.title}</span>
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
                    </div>
                </div>
            </div>

            {/* ── Page body ── */}
            <div className="p-6 md:p-8">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
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
                                companyId={companyId}
                                issueId={issueId}
                            />
                        </div>

                        <Separator className="bg-subtle mb-5" />

                        {/* Relations */}
                        <div className="mb-5">
                            <RelationsSection
                                workspaceSlug={workspaceSlug}
                                companyId={companyId}
                                issueId={issueId}
                                companyIdentifier={companyIdentifier}
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
                                            {subIssues.length}
                                        </span>
                                    )}
                                </h3>
                                <CreateIssueDialog
                                    workspaceSlug={workspaceSlug}
                                    companyId={companyId}
                                    defaultParentId={issue.id}
                                    trigger={
                                        <button
                                            type="button"
                                            className="flex items-center gap-1 text-xs text-placeholder hover:text-secondary transition-colors"
                                            aria-label="Agregar sub-tarea"
                                        >
                                            <Plus size={13} />
                                            Agregar
                                        </button>
                                    }
                                />
                            </div>
                            {subIssues.length === 0 ? (
                                <p className="text-xs text-placeholder italic">Sin sub-tareas</p>
                            ) : (
                                <div className="space-y-1">
                                    {subIssues.map((sub) => (
                                        <Link
                                            key={sub.id}
                                            to={`/${workspaceSlug}/companies/${companyId}/issues/${sub.id}`}
                                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-layer-2 transition-colors group"
                                        >
                                            <span className="text-[10px] font-mono text-tertiary shrink-0">
                                                {companyIdentifier ?? 'ISS'}-{sub.sequenceId}
                                            </span>
                                            <span className="text-xs text-secondary truncate group-hover:text-primary transition-colors">
                                                {sub.title}
                                            </span>
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
                            companyId={companyId}
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
                                <PropertyRow label="Estado">
                                    <IssueStateBadge
                                        stateName={issue.stateName}
                                        stateGroup={issue.stateName}
                                    />
                                </PropertyRow>

                                <PropertyRow label="Prioridad">
                                    <IssuePriorityBadge priority={issue.priority} />
                                </PropertyRow>

                                <PropertyRow label="Asignados">
                                    {issue.assigneeIds.length > 0 ? (
                                        <span className="text-xs text-secondary">
                                            {issue.assigneeIds.length} asignado{issue.assigneeIds.length > 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-placeholder italic">Sin asignar</span>
                                    )}
                                </PropertyRow>

                                <PropertyRow label="Fecha inicio">
                                    {issue.startDate ? (
                                        <span className="text-xs text-secondary">
                                            {new Date(issue.startDate).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-placeholder italic">Sin fecha de inicio</span>
                                    )}
                                </PropertyRow>

                                <PropertyRow label="Fecha límite">
                                    {issue.dueDate ? (
                                        <span className="text-xs text-secondary">
                                            {new Date(issue.dueDate).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-placeholder italic">Sin fecha límite</span>
                                    )}
                                </PropertyRow>

                                <PropertyRow label="Padre">
                                    {issue.parentId ? (
                                        <Link
                                            to={`/${workspaceSlug}/companies/${companyId}/issues/${issue.parentId}`}
                                            className="text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors truncate"
                                        >
                                            {parentIssueData
                                                ? `${companyIdentifier ?? 'ISS'}-${parentIssueData.sequenceId}`
                                                : `${issue.parentId.slice(0, 8)}…`}
                                        </Link>
                                    ) : (
                                        <span className="text-xs text-placeholder italic">Sin padre</span>
                                    )}
                                </PropertyRow>

                                <PropertyRow label="Etiquetas">
                                    {issue.labelIds.length > 0 ? (
                                        <span className="text-xs text-secondary">
                                            {issue.labelIds.length} etiqueta{issue.labelIds.length > 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-placeholder italic">Sin etiquetas</span>
                                    )}
                                </PropertyRow>

                                <PropertyRow label="Ciclo">
                                    {issue.cycleId ? (
                                        <span className="text-xs text-secondary font-mono">
                                            {issue.cycleId.slice(0, 8)}…
                                        </span>
                                    ) : (
                                        <span className="text-xs text-placeholder italic">Sin ciclo</span>
                                    )}
                                </PropertyRow>

                                {allEstimatePoints.length > 0 && (
                                    <PropertyRow label="Estimación">
                                        <select
                                            value={issue.estimatePointId ?? ''}
                                            onChange={(e) =>
                                                updateIssue({
                                                    issueId: issue.id,
                                                    data: { estimatePointId: e.target.value || undefined },
                                                })
                                            }
                                            className="text-xs bg-layer-1 border border-subtle rounded px-2 py-0.5 text-secondary focus:outline-none focus:border-strong max-w-[140px]"
                                            aria-label="Seleccionar estimación"
                                        >
                                            <option value="">Sin estimar</option>
                                            {allEstimatePoints.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.value} ({p.estimateName})
                                                </option>
                                            ))}
                                        </select>
                                    </PropertyRow>
                                )}

                                <PropertyRow label="Módulos">
                                    {issue.moduleIds.length > 0 ? (
                                        <span className="text-xs text-secondary">
                                            {issue.moduleIds.length} módulo{issue.moduleIds.length > 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-placeholder italic">Sin módulos</span>
                                    )}
                                </PropertyRow>

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
                                            {`${sub.userFirstName[0] ?? ''}${sub.userLastName[0] ?? ''}`.toUpperCase()}
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
