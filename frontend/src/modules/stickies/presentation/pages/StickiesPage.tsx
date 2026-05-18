import type React from 'react';
import { useState, useEffect } from 'react';
import { Plus, X, StickyNote, Search, GripVertical } from 'lucide-react';
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
import { useStickiesStore } from '../../application/stickies-store';
import type { Sticky, StickyColor, CreateStickyData } from '../../domain/types';

// ---------- DnD helpers ----------
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
    content: z.string().optional(),
    color: z.enum(['yellow', 'pink', 'green', 'blue', 'orange', 'purple']),
});
type CreateFormData = z.infer<typeof createSchema>;

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
    });
}

interface ColorPickerProps {
    value: StickyColor;
    onChange: (color: StickyColor) => void;
}

function ColorPicker({ value, onChange }: ColorPickerProps): React.ReactElement {
    return (
        <div className="flex gap-2">
            {COLORS.map((c) => (
                <button
                    key={c}
                    type="button"
                    onClick={() => onChange(c)}
                    aria-label={c}
                    className={cn(
                        'w-6 h-6 rounded-full transition-transform',
                        COLOR_BUTTON_MAP[c],
                        value === c ? 'ring-2 ring-white ring-offset-1 ring-offset-canvas scale-110' : 'hover:scale-110',
                    )}
                />
            ))}
        </div>
    );
}

function CreateStickyDialog(): React.ReactElement {
    const [open, setOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState<StickyColor>('yellow');
    const addSticky = useStickiesStore((s) => s.addSticky);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateFormData>({
        resolver: zodResolver(createSchema),
        defaultValues: { color: 'yellow' },
    });

    const onSubmit = (data: CreateFormData): void => {
        const payload: CreateStickyData = {
            title: data.title,
            content: data.content || undefined,
            color: selectedColor,
        };
        addSticky(payload);
        reset();
        setSelectedColor('yellow');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                    <Plus size={15} />
                    Nueva nota
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-surface-1 border-subtle">
                <DialogHeader>
                    <DialogTitle className="text-primary">Nueva nota</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
                    <div>
                        <Input
                            {...register('title')}
                            placeholder="Título *"
                            className="bg-layer-1/50 border-subtle text-primary placeholder:text-placeholder"
                        />
                        {errors.title && (
                            <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
                        )}
                    </div>
                    <Textarea
                        {...register('content')}
                        placeholder="Contenido (opcional)"
                        rows={4}
                        className="bg-layer-1/50 border-subtle text-primary placeholder:text-placeholder resize-none"
                    />
                    <div>
                        <p className="text-xs text-placeholder mb-2">Color</p>
                        <ColorPicker value={selectedColor} onChange={setSelectedColor} />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-subtle text-tertiary"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-accent-primary hover:bg-accent-primary-hover text-on-color">
                            Crear
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
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
                'relative rounded-lg border transition-all duration-150 list-none',
                COLOR_MAP[sticky.color],
                isDragOver && 'ring-2 ring-accent-primary ring-offset-2 ring-offset-canvas scale-[1.02]',
            )}
        >
            {/* Drag handle */}
            <div
                className="absolute top-2 left-2 text-placeholder opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing z-10"
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
                className="absolute top-2 right-2 text-placeholder hover:text-primary transition-colors z-10"
            >
                <X size={13} />
            </button>
            <button
                type="button"
                onClick={onClick}
                className="w-full text-left p-4 pr-7 pl-6 transition-transform hover:scale-[1.01]"
                aria-label={`Editar sticky: ${sticky.title}`}
            >
                <p className="text-sm font-semibold text-primary mb-1 line-clamp-2">{sticky.title}</p>
                {sticky.content && (
                    <p className="text-xs text-secondary line-clamp-4 whitespace-pre-wrap">{sticky.content}</p>
                )}
                <p className="text-xs text-placeholder mt-2">{formatDate(sticky.updatedAt)}</p>
            </button>
        </li>
    );
}

interface EditStickySheetProps {
    sticky: Sticky | null;
    open: boolean;
    onClose: () => void;
}

function EditStickySheet({ sticky, open, onClose }: EditStickySheetProps): React.ReactElement | null {
    const updateSticky = useStickiesStore((s) => s.updateSticky);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [color, setColor] = useState<StickyColor>('yellow');

    useEffect(() => {
        if (sticky) {
            setTitle(sticky.title);
            setContent(sticky.content);
            setColor(sticky.color);
        }
    }, [sticky]);

    const handleSave = (): void => {
        if (!sticky) return;
        updateSticky(sticky.id, { title, content, color });
        onClose();
    };

    if (!sticky) return null;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="bg-surface-1 border-subtle w-96">
                <SheetHeader>
                    <SheetTitle className="text-primary">Editar nota</SheetTitle>
                </SheetHeader>
                <div className="space-y-3 mt-4">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título"
                        className="bg-layer-1/50 border-subtle text-primary"
                    />
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Contenido"
                        rows={8}
                        className="bg-layer-1/50 border-subtle text-primary resize-none"
                    />
                    <div>
                        <p className="text-xs text-placeholder mb-2">Color</p>
                        <ColorPicker value={color} onChange={setColor} />
                    </div>
                    <Button
                        onClick={handleSave}
                        className="w-full bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                    >
                        Guardar
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export const StickiesPage = (): React.ReactElement => {
    const stickies = useStickiesStore((s) => s.stickies);
    const deleteSticky = useStickiesStore((s) => s.deleteSticky);
    const reorderStickies = useStickiesStore((s) => s.reorderStickies);
    const [editingSticky, setEditingSticky] = useState<Sticky | null>(null);
    const [search, setSearch] = useState('');
    const [dragState, setDragState] = useState<DragState>({ dragId: null, dragOverId: null });

    const filteredStickies = search
        ? stickies.filter(
              (s) =>
                  s.title.toLowerCase().includes(search.toLowerCase()) ||
                  s.content?.toLowerCase().includes(search.toLowerCase()),
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
        // Merge with stickies not in filteredStickies (when searching)
        if (search) {
            const filtered = new Set(filteredStickies.map((s) => s.id));
            const rest = stickies.filter((s) => !filtered.has(s.id));
            reorderStickies([...newOrder, ...rest]);
        } else {
            reorderStickies(newOrder);
        }
        setDragState({ dragId: null, dragOverId: null });
    };

    const handleDragEnd = (): void => {
        setDragState({ dragId: null, dragOverId: null });
    };

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6 gap-4">
                    <h1 className="text-xl font-semibold text-primary shrink-0">Notas</h1>
                    <div className="relative flex-1 max-w-xs">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder"
                            aria-hidden="true"
                        />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar notas..."
                            className="pl-8 h-8 text-[13px] bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                        />
                    </div>
                    <CreateStickyDialog />
                </div>

                {filteredStickies.length === 0 ? (
                    search ? (
                        /* Search empty state */
                        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
                            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-subtle flex items-center justify-center mb-4">
                                <StickyNote size={24} className="text-placeholder" />
                            </div>
                            <h3 className="text-base font-semibold text-secondary mb-1">Sin resultados</h3>
                            <p className="text-sm text-placeholder max-w-xs">
                                No se encontraron notas con ese término.
                            </p>
                        </div>
                    ) : (
                        /* Illustrated empty state — matches Plane */
                        <div className="flex flex-col items-center text-center animate-fade-in pt-8">
                            <h2 className="text-xl font-semibold text-primary max-w-xl mb-2">
                                Las notas adhesivas son notas rápidas y tareas pendientes que anotas al vuelo.
                            </h2>
                            <p className="text-sm text-tertiary max-w-lg mb-8">
                                Captura tus pensamientos e ideas sin esfuerzo creando notas adhesivas a las que puedes acceder en cualquier momento y desde cualquier lugar.
                            </p>
                            {/* Placeholder illustration */}
                            <div className="w-full max-w-2xl h-40 bg-layer-1 rounded-xl border border-subtle flex items-center justify-center mb-6">
                                <StickyNote size={48} className="text-placeholder opacity-40" />
                            </div>
                            <CreateStickyDialog />
                        </div>
                    )
                ) : (
                    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 list-none p-0 m-0">
                        {filteredStickies.map((sticky) => (
                            <div key={sticky.id} className="group">
                                <StickyCard
                                    sticky={sticky}
                                    isDragOver={dragState.dragOverId === sticky.id}
                                    onClick={() => setEditingSticky(sticky)}
                                    onDelete={() => deleteSticky(sticky.id)}
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
            />
        </div>
    );
};
