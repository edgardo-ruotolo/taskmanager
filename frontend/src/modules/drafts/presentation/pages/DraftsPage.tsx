import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Eyebrow } from '@/components/ui/eyebrow';
import { useCreateDraft, useDeleteDraft, useDrafts, usePublishDraft } from '../../application/use-drafts';
import type { CreateDraftIssueData, IssuePriority } from '../../domain/types';

const PRIORITY_LABELS: Record<IssuePriority, string> = {
    0: 'Sin prioridad',
    1: 'Urgente',
    2: 'Alta',
    3: 'Media',
    4: 'Baja',
};

function formatRelative(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return 'justo ahora';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 172800) return 'ayer';
    return `hace ${Math.floor(diff / 86400)} días`;
}

interface DraftItem {
    id: string;
    title: string;
    priority: IssuePriority;
    createdAt: string;
}

interface DraftSectionProps {
    title: string;
    count: number;
    accent: string;
    items: DraftItem[];
    onPublish: (id: string) => void;
    onDelete: (id: string) => void;
    publishPending: boolean;
    deletePending: boolean;
}

function DraftSection({ title, count, accent, items, onPublish, onDelete, publishPending, deletePending }: DraftSectionProps): React.ReactElement {
    return (
        <div className="mb-7">
            <div className="flex items-center gap-2.5 mb-2.5">
                <span className="w-1 h-[18px] rounded-full shrink-0" style={{ background: accent }} aria-hidden="true" />
                <span className="text-[17px] font-medium text-[var(--neutral-1200)] tracking-[-0.02em]">{title}</span>
                <span className="font-mono text-[11px] text-[var(--neutral-600)]">{count}</span>
            </div>
            {items.length === 0 ? (
                <div className="py-8 text-center text-[13px] text-[var(--neutral-600)] bg-white border border-[var(--neutral-400)] rounded-lg">
                    Sin borradores en esta categoría
                </div>
            ) : (
                <div className="bg-white border border-[var(--neutral-400)] rounded-lg overflow-hidden">
                    {items.map((item, i) => {
                        const isRecent = Date.now() - new Date(item.createdAt).getTime() < 3600_000;
                        return (
                            <div
                                key={item.id}
                                className="grid items-center gap-3.5 px-4 py-3"
                                style={{
                                    gridTemplateColumns: '1fr 100px 80px 24px',
                                    borderTop: i === 0 ? 'none' : '1px solid var(--neutral-400)',
                                }}
                            >
                                <div>
                                    <div className="text-[13.5px] font-medium text-[var(--neutral-1200)] tracking-[-0.005em] truncate">
                                        {item.title}
                                    </div>
                                    <div className="font-mono text-[10.5px] text-[var(--neutral-600)] mt-0.5 tracking-[0.04em]">
                                        {PRIORITY_LABELS[item.priority]}
                                    </div>
                                </div>
                                <span className="font-mono text-[11px] text-[var(--neutral-600)]">
                                    {formatRelative(item.createdAt)}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {isRecent && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[color-mix(in_oklch,var(--brand-700)_12%,white)] text-[var(--brand-700)] font-mono text-[10px] font-medium">
                                            ● Reciente
                                        </span>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={publishPending}
                                        onClick={() => onPublish(item.id)}
                                        className="h-6 w-6 p-0 text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] hover:bg-[var(--neutral-100)]"
                                    >
                                        <Send size={11} />
                                    </Button>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={deletePending}
                                    onClick={() => onDelete(item.id)}
                                    className="h-6 w-6 p-0 text-[var(--neutral-600)] hover:text-red-500 hover:bg-[var(--neutral-100)]"
                                >
                                    <Trash2 size={11} />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

interface NewDraftForm {
    title: string;
    description: string;
    projectId: string;
}

const EMPTY_FORM: NewDraftForm = { title: '', description: '', projectId: '' };

export const DraftsPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<NewDraftForm>(EMPTY_FORM);

    const { data: drafts = [], isLoading } = useDrafts(workspaceSlug);
    const createDraft = useCreateDraft(workspaceSlug);
    const deleteDraft = useDeleteDraft(workspaceSlug);
    const publishDraft = usePublishDraft(workspaceSlug);

    const handleOpenDialog = (): void => {
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    };

    const handleCreate = (): void => {
        if (!form.title.trim() || !form.projectId.trim()) return;
        const payload: CreateDraftIssueData = {
            title: form.title.trim(),
            projectId: form.projectId.trim(),
            description: form.description.trim() || undefined,
            priority: 0,
        };
        createDraft.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    };

    return (
        <>
            <div className="h-full overflow-y-auto">
                <div className="w-full px-10 py-8">
                    <div className="flex items-start justify-between mb-7">
                        <div>
                            <Eyebrow>Lo que dejaste a medias · {isLoading ? '…' : `${drafts.length} issues`}</Eyebrow>
                            <h1 className="mt-2 text-[48px] font-medium tracking-[-0.045em] leading-[0.95] text-[var(--neutral-1200)]">
                                Borradores.
                            </h1>
                        </div>
                        <div className="shrink-0 mt-2">
                            <Button
                                size="sm"
                                onClick={handleOpenDialog}
                                className="gap-1.5 bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[#f0eadf]"
                            >
                                <Plus size={13} />
                                Nuevo borrador
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((n) => (
                                <Skeleton key={n} className="h-14 w-full rounded-lg bg-[var(--neutral-200)]" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <DraftSection
                                title="Issues sin publicar"
                                count={drafts.length}
                                accent="var(--brand-700)"
                                items={drafts}
                                onPublish={(id) => publishDraft.mutate(id)}
                                onDelete={(id) => deleteDraft.mutate(id)}
                                publishPending={publishDraft.isPending}
                                deletePending={deleteDraft.isPending}
                            />
                            <DraftSection
                                title="Páginas sin publicar"
                                count={0}
                                accent="var(--green-700)"
                                items={[]}
                                onPublish={() => undefined}
                                onDelete={() => undefined}
                                publishPending={false}
                                deletePending={false}
                            />
                            <DraftSection
                                title="Comentarios sin enviar"
                                count={0}
                                accent="#6b6298"
                                items={[]}
                                onPublish={() => undefined}
                                onDelete={() => undefined}
                                publishPending={false}
                                deletePending={false}
                            />
                        </>
                    )}
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nuevo borrador</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="draft-title">Título *</Label>
                            <Input
                                id="draft-title"
                                placeholder="Título del borrador"
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="draft-project">ID de proyecto *</Label>
                            <Input
                                id="draft-project"
                                placeholder="project-id"
                                value={form.projectId}
                                onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="draft-description">Descripción</Label>
                            <Textarea
                                id="draft-description"
                                placeholder="Descripción opcional..."
                                rows={3}
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!form.title.trim() || !form.projectId.trim() || createDraft.isPending}
                        >
                            Crear borrador
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
