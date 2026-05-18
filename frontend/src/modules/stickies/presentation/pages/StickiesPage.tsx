import type React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GripVertical, Plus, Search, StickyNote, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
    useCreateSticky,
    useDeleteSticky,
    useReorderStickies,
    useStickies,
    useUpdateSticky,
} from '../../application/use-stickies';
import type { Sticky, StickyColor, CreateStickyData } from '../../domain/types';

interface DragState {
    dragId: string | null;
    dragOverId: string | null;
}

const COLOR_MAP: Record<StickyColor, string> = {
    yellow: 'bg-[#fffad5] dark:bg-[#3d3a1e] border-yellow-300/50 dark:border-yellow-600/30',
    pink: 'bg-[#ffe4e6] dark:bg-[#3d1e22] border-pink-300/50 dark:border-pink-600/30',
    green: 'bg-[#dcfce7] dark:bg-[#1a3326] border-green-300/50 dark:border-green-600/30',
    blue: 'bg-[#dbeafe] dark:bg-[#1a2a3d] border-blue-300/50 dark:border-blue-600/30',
    orange: 'bg-[#ffedd5] dark:bg-[#3d2a1a] border-orange-300/50 dark:border-orange-600/30',
    purple: 'bg-[#ede9fe] dark:bg-[#2a1e3d] border-purple-300/50 dark:border-purple-600/30',
};

const COLOR_BUTTON_MAP: Record<StickyColor, string> = {
    yellow: 'bg-yellow-300',
    pink: 'bg-pink-300',
    green: 'bg-green-300',
    blue: 'bg-blue-300',
    orange: 'bg-orange-300',
    purple: 'bg-purple-300',
};

const COLORS: StickyColor[] = ['yellow', 'pink', 'green', 'blue', 'orange', 'purple'];

const createSchema = z.object({
    title: z.string().min(1, 'El título es requerido').max(100),
    description: z.string().optional(),
    color: z.enum(['yellow', 'pink', 'green', 'blue', 'orange', 'purple']),
});
type CreateFormData = z.infer<typeof createSchema>;

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

function ColorPicker({ value, onChange }: { value: StickyColor; onChange: (c: StickyColor) => void }): React.ReactElement {
    return (
        <div className="flex gap-2">
            {COLORS.map((c) => (
                <button
                    key={c}
                    type="button"
                    onClick={() => onChange(c)}
                    aria-label={c}
                    className={cn(
                        'h-6 w-6 rounded-full transition-transform',
                        COLOR_BUTTON_MAP[c],
                        value === c ? 'scale-110 ring-2 ring-white ring-offset-1' : 'hover:scale-110',
                    )}
                />
            ))}
        </div>
    );
}

function CreateStickyDialog({ workspaceSlug }: { workspaceSlug: string }): React.ReactElement {
    const [open, setOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState<StickyColor>('yellow');
    const createMutation = useCreateSticky(workspaceSlug);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateFormData>({
        resolver: zodResolver(createSchema),
        defaultValues: { color: 'yellow' },
    });

    const onSubmit = (data: CreateFormData): void => {
        const payload: CreateStickyData = {
            title: data.title,
            description: data.description ?? undefined,
            color: selectedColor,
        };
        createMutation.mutate(payload);
        reset();
        setSelectedColor('yellow');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus size={15} className="mr-1" />
                    Nueva nota
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nueva nota</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-3">
                    <div>
                        <Input {...register('title')} placeholder="Título *" />
                        {errors.title && (
                            <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
                        )}
                    </div>
                    <Textarea
                        {...register('description')}
                        placeholder="Contenido (opcional)"
                        rows={4}
                        className="resize-none"
                    />
                    <div>
                        <p className="mb-2 text-xs text-muted-foreground">Color</p>
                        <ColorPicker value={selectedColor} onChange={setSelectedColor} />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            Crear
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditStickySheet({
    sticky,
    open,
    onClose,
    workspaceSlug,
}: {
    sticky: Sticky | null;
    open: boolean;
    onClose: () => void;
    workspaceSlug: string;
}): React.ReactElement | null {
    const updateMutation = useUpdateSticky(workspaceSlug);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState<StickyColor>('yellow');

    useEffect(() => {
        if (sticky) {
            setTitle(sticky.title);
            setDescription(sticky.description);
            setColor(sticky.color);
        }
    }, [sticky]);

    const handleSave = (): void => {
        if (!sticky) return;
        updateMutation.mutate({ id: sticky.id, data: { title, description, color } });
        onClose();
    };

    if (!sticky) return null;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-96">
                <SheetHeader>
                    <SheetTitle>Editar nota</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Contenido"
                        rows={8}
                        className="resize-none"
                    />
                    <div>
                        <p className="mb-2 text-xs text-muted-foreground">Color</p>
                        <ColorPicker value={color} onChange={setColor} />
                    </div>
                    <Button onClick={handleSave} className="w-full" disabled={updateMutation.isPending}>
                        Guardar
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

interface StickyCardProps {
    sticky: Sticky;
    isDragOver: boolean;
    onClick: () => void;
    onDelete: () => void;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: () => void;
}

function StickyCard({
    sticky,
    isDragOver,
    onClick,
    onDelete,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
}: StickyCardProps): React.ReactElement {
    return (
        <li
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            className={cn(
                'relative list-none rounded-lg border transition-all duration-150',
                COLOR_MAP[sticky.color],
                isDragOver && 'scale-[1.02] ring-2 ring-primary ring-offset-2',
            )}
        >
            <div
                className="absolute left-2 top-2 z-10 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 active:cursor-grabbing"
                aria-hidden="true"
            >
                <GripVertical size={13} />
            </div>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                aria-label="Eliminar nota"
                className="absolute right-2 top-2 z-10 text-muted-foreground transition-colors hover:text-foreground"
            >
                <X size={13} />
            </button>
            <button
                type="button"
                onClick={onClick}
                className="w-full p-4 pl-6 pr-7 text-left transition-transform hover:scale-[1.01]"
                aria-label={`Editar nota: ${sticky.title}`}
            >
                <p className="mb-1 line-clamp-2 text-sm font-semibold">{sticky.title}</p>
                {sticky.description && (
                    <p className="line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground">
                        {sticky.description}
                    </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(sticky.updatedAt)}</p>
            </button>
        </li>
    );
}

export function StickiesPage(): React.ReactElement {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const { data: stickies = [] } = useStickies(workspaceSlug);
    const deleteMutation = useDeleteSticky(workspaceSlug);
    const reorderMutation = useReorderStickies(workspaceSlug);

    const [editingSticky, setEditingSticky] = useState<Sticky | null>(null);
    const [search, setSearch] = useState('');
    const [dragState, setDragState] = useState<DragState>({ dragId: null, dragOverId: null });

    const filteredStickies = search
        ? stickies.filter(
              (s) =>
                  s.title.toLowerCase().includes(search.toLowerCase()) ||
                  s.description?.toLowerCase().includes(search.toLowerCase()),
          )
        : stickies;

    const handleDragStart = (e: React.DragEvent, id: string): void => {
        e.dataTransfer.effectAllowed = 'move';
        setDragState((prev) => ({ ...prev, dragId: id }));
    };

    const handleDragOver = (e: React.DragEvent, id: string): void => {
        e.preventDefault();
        if (dragState.dragOverId !== id) {
            setDragState((prev) => ({ ...prev, dragOverId: id }));
        }
    };

    const handleDrop = (e: React.DragEvent, targetId: string): void => {
        e.preventDefault();
        const { dragId } = dragState;
        if (!dragId || dragId === targetId) {
            setDragState({ dragId: null, dragOverId: null });
            return;
        }
        const newOrder = [...filteredStickies];
        const fromIdx = newOrder.findIndex((s) => s.id === dragId);
        const toIdx = newOrder.findIndex((s) => s.id === targetId);
        if (fromIdx === -1 || toIdx === -1) {
            setDragState({ dragId: null, dragOverId: null });
            return;
        }
        const [removed] = newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, removed);
        reorderMutation.mutate(newOrder.map((s) => s.id));
        setDragState({ dragId: null, dragOverId: null });
    };

    const handleDragEnd = (): void => {
        setDragState({ dragId: null, dragOverId: null });
    };

    return (
        <div className="p-6 md:p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <h1 className="shrink-0 text-xl font-semibold">Notas</h1>
                    <div className="relative max-w-xs flex-1">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar notas..."
                            className="h-8 pl-8 text-[13px]"
                        />
                    </div>
                    <CreateStickyDialog workspaceSlug={workspaceSlug} />
                </div>

                {filteredStickies.length === 0 ? (
                    search ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted">
                                <StickyNote size={24} className="text-muted-foreground" />
                            </div>
                            <h3 className="mb-1 text-base font-semibold">Sin resultados</h3>
                            <p className="max-w-xs text-sm text-muted-foreground">
                                No se encontraron notas con ese término.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center pt-8 text-center">
                            <h2 className="mb-2 max-w-xl text-xl font-semibold">
                                Las notas adhesivas son notas rápidas y tareas pendientes que anotás al vuelo.
                            </h2>
                            <p className="mb-8 max-w-lg text-sm text-muted-foreground">
                                Capturá tus pensamientos e ideas sin esfuerzo creando notas adhesivas a las que podés acceder en cualquier momento.
                            </p>
                            <div className="mb-6 flex h-40 w-full max-w-2xl items-center justify-center rounded-xl border bg-muted">
                                <StickyNote size={48} className="text-muted-foreground opacity-40" />
                            </div>
                            <CreateStickyDialog workspaceSlug={workspaceSlug} />
                        </div>
                    )
                ) : (
                    <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {filteredStickies.map((sticky) => (
                            <div key={sticky.id} className="group">
                                <StickyCard
                                    sticky={sticky}
                                    isDragOver={dragState.dragOverId === sticky.id}
                                    onClick={() => setEditingSticky(sticky)}
                                    onDelete={() => deleteMutation.mutate(sticky.id)}
                                    onDragStart={(e) => handleDragStart(e, sticky.id)}
                                    onDragOver={(e) => handleDragOver(e, sticky.id)}
                                    onDrop={(e) => handleDrop(e, sticky.id)}
                                    onDragEnd={handleDragEnd}
                                />
                            </div>
                        ))}
                    </ul>
                )}
            </div>

            <EditStickySheet
                sticky={editingSticky}
                open={editingSticky !== null}
                onClose={() => setEditingSticky(null)}
                workspaceSlug={workspaceSlug}
            />
        </div>
    );
}
