import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Plus, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { IssueTemplate, CreateIssueTemplateData } from '../../domain/types';
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from '../../application/use-templates';

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

interface TemplateFormProps {
    initial?: IssueTemplate;
    onSubmit: (data: CreateIssueTemplateData) => void;
    isPending: boolean;
    onCancel: () => void;
}

function TemplateForm({ initial, onSubmit, isPending, onCancel }: TemplateFormProps): React.ReactElement {
    const [name, setName] = useState(initial?.name ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({ name: name.trim(), description: description || undefined });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="template-name" className="text-sm text-secondary block mb-1">Nombre</label>
                <Input
                    id="template-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre de la plantilla..."
                    className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                    autoFocus
                />
            </div>
            <div>
                <label htmlFor="template-description" className="text-sm text-secondary block mb-1">Descripción (opcional)</label>
                <Input
                    id="template-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción breve..."
                    className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                />
            </div>
            <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={onCancel} className="text-tertiary hover:text-primary">
                    Cancelar
                </Button>
                <Button type="submit" disabled={isPending || !name.trim()} className="bg-accent-primary hover:bg-accent-primary-hover text-on-color">
                    {isPending ? 'Guardando...' : initial ? 'Actualizar' : 'Crear'}
                </Button>
            </div>
        </form>
    );
}

export const IssueTemplatesPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const { data: templates = [], isLoading } = useTemplates(workspaceSlug);
    const { mutate: create, isPending: isCreating } = useCreateTemplate(workspaceSlug);
    const { mutate: update, isPending: isUpdating } = useUpdateTemplate(workspaceSlug);
    const { mutate: remove } = useDeleteTemplate(workspaceSlug);

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<IssueTemplate | null>(null);

    return (
        <div className="p-6 md:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-semibold text-primary">Plantillas de tareas</h1>
                        <p className="text-sm text-tertiary mt-0.5">
                            Crea plantillas reutilizables para agilizar la creación de tareas.
                        </p>
                    </div>
                    <Button
                        onClick={() => setCreateOpen(true)}
                        className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                    >
                        <Plus size={14} className="mr-1.5" />
                        Nueva plantilla
                    </Button>
                </div>

                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((n) => <Skeleton key={n} className="h-16 w-full bg-layer-1" />)}
                    </div>
                )}

                {!isLoading && templates.length === 0 && (
                    <div className="text-center py-16 border border-dashed border-subtle rounded-lg">
                        <FileText size={32} className="mx-auto text-placeholder mb-3" />
                        <p className="text-secondary font-medium">Sin plantillas</p>
                        <p className="text-sm text-placeholder mt-1">
                            Crea tu primera plantilla para reutilizarla al crear tareas.
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    {templates.map((tpl) => (
                        <div key={tpl.id} className="border border-subtle rounded-lg bg-surface-1 px-4 py-3 flex items-start gap-3">
                            <FileText size={16} className="text-accent-primary mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-primary">{tpl.name}</p>
                                {tpl.description && (
                                    <p className="text-xs text-tertiary mt-0.5 truncate">{tpl.description}</p>
                                )}
                                <p className="text-xs text-placeholder mt-1">{formatDate(tpl.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setEditTarget(tpl)}
                                    className="p-1.5 rounded text-placeholder hover:text-secondary hover:bg-layer-2 transition-colors"
                                    aria-label="Editar plantilla"
                                >
                                    <Pencil size={13} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(tpl.id)}
                                    className="p-1.5 rounded text-placeholder hover:text-red-400 hover:bg-layer-2 transition-colors"
                                    aria-label="Eliminar plantilla"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nueva plantilla</DialogTitle>
                    </DialogHeader>
                    <TemplateForm
                        onSubmit={(data) => create(data, { onSuccess: () => setCreateOpen(false) })}
                        isPending={isCreating}
                        onCancel={() => setCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
                <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar plantilla</DialogTitle>
                    </DialogHeader>
                    {editTarget && (
                        <TemplateForm
                            initial={editTarget}
                            onSubmit={(data) =>
                                update(
                                    { id: editTarget.id, data },
                                    { onSuccess: () => setEditTarget(null) },
                                )
                            }
                            isPending={isUpdating}
                            onCancel={() => setEditTarget(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
