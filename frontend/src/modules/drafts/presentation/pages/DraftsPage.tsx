import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Plus, Send, Trash2 } from 'lucide-react';
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
import { useCreateDraft, useDeleteDraft, useDrafts, usePublishDraft } from '../../application/use-drafts';
import type { CreateDraftIssueData, IssuePriority } from '../../domain/types';

const PRIORITY_LABELS: Record<IssuePriority, string> = {
    0: 'Sin prioridad',
    1: 'Urgente',
    2: 'Alta',
    3: 'Media',
    4: 'Baja',
};

interface NewDraftForm {
    title: string;
    description: string;
    companyId: string;
}

const EMPTY_FORM: NewDraftForm = { title: '', description: '', companyId: '' };

function EmptyDrafts(): React.ReactElement {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-subtle flex items-center justify-center mb-4">
                <FileText size={24} className="text-placeholder" />
            </div>
            <h3 className="text-sm font-semibold text-secondary mb-1">Sin borradores</h3>
            <p className="text-xs text-placeholder max-w-xs">
                Los borradores te permiten guardar tareas incompletas antes de publicarlas.
            </p>
        </div>
    );
}

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
        if (!form.title.trim() || !form.companyId.trim()) return;
        const payload: CreateDraftIssueData = {
            title: form.title.trim(),
            companyId: form.companyId.trim(),
            description: form.description.trim() || undefined,
            priority: 0,
        };
        createDraft.mutate(payload, {
            onSuccess: () => setDialogOpen(false),
        });
    };

    const formatDate = (iso: string): string =>
        new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-2 border border-subtle flex items-center justify-center">
                            <FileText size={16} className="text-placeholder" />
                        </div>
                        <div>
                            <p className="text-xs text-placeholder uppercase tracking-wider leading-none mb-0.5">
                                {workspaceSlug}
                            </p>
                            <h1 className="text-xl font-semibold text-primary">Borradores</h1>
                        </div>
                    </div>
                    <Button size="sm" onClick={handleOpenDialog} className="gap-1.5">
                        <Plus size={14} />
                        Nuevo borrador
                    </Button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="border border-subtle rounded-lg overflow-hidden">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="flex items-center gap-3 px-4 py-3 border-b border-subtle last:border-b-0">
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                                <Skeleton className="h-7 w-20" />
                                <Skeleton className="h-7 w-7" />
                            </div>
                        ))}
                    </div>
                ) : drafts.length === 0 ? (
                    <EmptyDrafts />
                ) : (
                    <div className="border border-subtle rounded-lg overflow-hidden">
                        {drafts.map((draft) => (
                            <div
                                key={draft.id}
                                className="flex items-center gap-3 px-4 py-3 border-b border-subtle last:border-b-0 hover:bg-surface-2 transition-colors"
                            >
                                <FileText size={14} className="text-placeholder shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-primary truncate">{draft.title}</p>
                                    <p className="text-xs text-placeholder mt-0.5">
                                        {PRIORITY_LABELS[draft.priority]} · Creado {formatDate(draft.createdAt)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={publishDraft.isPending}
                                        onClick={() => publishDraft.mutate(draft.id)}
                                        className="h-7 px-3 text-xs border-subtle text-secondary hover:text-primary gap-1.5"
                                    >
                                        <Send size={11} />
                                        Publicar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={deleteDraft.isPending}
                                        onClick={() => deleteDraft.mutate(draft.id)}
                                        className="h-7 w-7 p-0 text-placeholder hover:text-red-500"
                                    >
                                        <Trash2 size={13} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Draft Dialog */}
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
                                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="draft-company">ID de empresa *</Label>
                            <Input
                                id="draft-company"
                                placeholder="company-id"
                                value={form.companyId}
                                onChange={(e) => setForm(f => ({ ...f, companyId: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="draft-description">Descripción</Label>
                            <Textarea
                                id="draft-description"
                                placeholder="Descripción opcional..."
                                rows={3}
                                value={form.description}
                                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!form.title.trim() || !form.companyId.trim() || createDraft.isPending}
                        >
                            Crear borrador
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
