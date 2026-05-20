import type React from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown, ChevronRight, Circle, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    useStateGroups,
    useCreateStateGroup,
    useUpdateStateGroup,
    useDeleteStateGroup,
    useCreateState,
    useUpdateState,
    useDeleteState,
} from '@/modules/states/application/use-states';
import type { State, StateCategory, StateGroup } from '@/modules/states/domain/types';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<StateCategory, string> = {
    Backlog: 'Backlog',
    Unstarted: 'Sin iniciar',
    Started: 'En progreso',
    Completed: 'Completado',
    Cancelled: 'Cancelado',
};

const CATEGORIES: StateCategory[] = ['Backlog', 'Unstarted', 'Started', 'Completed', 'Cancelled'];

const colorRegex = /^#[0-9A-Fa-f]{6}$/;

// ─── Schemas ────────────────────────────────────────────────────────────────

const groupSchema = z.object({
    name: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
    description: z.string().max(255).optional(),
});
type GroupFormData = z.infer<typeof groupSchema>;

const createStateSchema = z.object({
    name: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
    color: z.string().regex(colorRegex, 'Color hexadecimal inválido'),
    category: z.enum(['Backlog', 'Unstarted', 'Started', 'Completed', 'Cancelled']),
    isDefault: z.boolean(),
});
type CreateStateFormData = z.infer<typeof createStateSchema>;

const editStateSchema = createStateSchema.extend({
    sequence: z.number().int().min(0),
});
type EditStateFormData = z.infer<typeof editStateSchema>;

// ─── Color Input ─────────────────────────────────────────────────────────────

interface ColorInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

function ColorInput({ value, onChange, error }: ColorInputProps): React.ReactElement {
    return (
        <div className="space-y-1.5">
            <Label className="text-secondary text-xs">Color</Label>
            <div className="flex items-center gap-2">
                <span
                    className="h-6 w-6 rounded-full shrink-0 border border-subtle"
                    style={{ backgroundColor: colorRegex.test(value) ? value : '#6366f1' }}
                    aria-hidden="true"
                />
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#6366f1"
                    className="bg-layer-1 border-subtle text-primary h-8 text-sm font-mono"
                />
            </div>
            {error && <p className="text-xs text-danger-primary">{error}</p>}
        </div>
    );
}

// ─── Create Group Dialog ──────────────────────────────────────────────────────

interface CreateGroupDialogProps {
    open: boolean;
    onClose: () => void;
}

function CreateGroupDialog({ open, onClose }: CreateGroupDialogProps): React.ReactElement {
    const { mutate, isPending } = useCreateStateGroup();
    const form = useForm<GroupFormData>({
        resolver: zodResolver(groupSchema),
        defaultValues: { name: '', description: '' },
    });

    const handleClose = (): void => {
        form.reset();
        onClose();
    };

    const onSubmit = (data: GroupFormData): void => {
        mutate(
            { name: data.name, description: data.description || undefined },
            {
                onSuccess: () => {
                    toast.success('Grupo creado');
                    handleClose();
                },
                onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al crear el grupo'); },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="bg-surface-2 border-subtle max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Nuevo grupo de estados</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-secondary text-xs">Nombre</Label>
                        <Input
                            {...form.register('name')}
                            placeholder="Ej: Flujo principal"
                            className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                        />
                        {form.formState.errors.name && (
                            <p className="text-xs text-danger-primary">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-secondary text-xs">Descripción (opcional)</Label>
                        <Input
                            {...form.register('description')}
                            placeholder="Descripción del grupo"
                            className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="text-secondary"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isPending}
                            className="bg-accent-primary text-on-color hover:bg-accent-primary-hover"
                        >
                            {isPending ? 'Creando...' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Edit Group Dialog ────────────────────────────────────────────────────────

interface EditGroupDialogProps {
    group: StateGroup | null;
    onClose: () => void;
}

function EditGroupDialog({ group, onClose }: EditGroupDialogProps): React.ReactElement {
    const { mutate, isPending } = useUpdateStateGroup();
    const form = useForm<GroupFormData>({
        resolver: zodResolver(groupSchema),
        values: group
            ? { name: group.name, description: group.description ?? '' }
            : { name: '', description: '' },
    });

    const onSubmit = (data: GroupFormData): void => {
        if (!group) return;
        mutate(
            { id: group.id, data: { name: data.name, description: data.description || undefined } },
            {
                onSuccess: () => {
                    toast.success('Grupo actualizado');
                    onClose();
                },
                onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al actualizar el grupo'); },
            },
        );
    };

    return (
        <Dialog open={group !== null} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="bg-surface-2 border-subtle max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Editar grupo</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-secondary text-xs">Nombre</Label>
                        <Input
                            {...form.register('name')}
                            className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                        />
                        {form.formState.errors.name && (
                            <p className="text-xs text-danger-primary">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-secondary text-xs">Descripción (opcional)</Label>
                        <Input
                            {...form.register('description')}
                            className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-secondary"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isPending}
                            className="bg-accent-primary text-on-color hover:bg-accent-primary-hover"
                        >
                            {isPending ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Create State Dialog ──────────────────────────────────────────────────────

interface CreateStateDialogProps {
    stateGroupId: string | null;
    onClose: () => void;
}

function CreateStateDialog({ stateGroupId, onClose }: CreateStateDialogProps): React.ReactElement {
    const { mutate, isPending } = useCreateState();
    const form = useForm<CreateStateFormData>({
        resolver: zodResolver(createStateSchema),
        defaultValues: {
            name: '',
            color: '#6366f1',
            category: 'Unstarted',
            isDefault: false,
        },
    });

    const handleClose = (): void => {
        form.reset();
        onClose();
    };

    const onSubmit = (data: CreateStateFormData): void => {
        if (!stateGroupId) return;
        mutate(
            { ...data, stateGroupId },
            {
                onSuccess: () => {
                    toast.success('Estado creado');
                    handleClose();
                },
                onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al crear el estado'); },
            },
        );
    };

    return (
        <Dialog open={stateGroupId !== null} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="bg-surface-2 border-subtle max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Nuevo estado</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-secondary text-xs">Nombre</Label>
                        <Input
                            {...form.register('name')}
                            placeholder="En revisión"
                            className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                        />
                        {form.formState.errors.name && (
                            <p className="text-xs text-danger-primary">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>

                    <Controller
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <ColorInput
                                value={field.value}
                                onChange={field.onChange}
                                error={form.formState.errors.color?.message}
                            />
                        )}
                    />

                    <div className="space-y-1.5">
                        <Label className="text-secondary text-xs">Categoría</Label>
                        <Controller
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="bg-layer-1 border-subtle text-primary h-8 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-surface-2 border-subtle">
                                        {CATEGORIES.map((c) => (
                                            <SelectItem key={c} value={c} className="text-primary text-sm">
                                                {CATEGORY_LABELS[c]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Controller
                            control={form.control}
                            name="isDefault"
                            render={({ field }) => (
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id="create-state-default"
                                />
                            )}
                        />
                        <Label htmlFor="create-state-default" className="text-secondary text-sm cursor-pointer">
                            Estado por defecto
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="text-secondary"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isPending}
                            className="bg-accent-primary text-on-color hover:bg-accent-primary-hover"
                        >
                            {isPending ? 'Creando...' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Edit State Dialog ────────────────────────────────────────────────────────

interface EditStateDialogProps {
    state: State | null;
    onClose: () => void;
}

function EditStateDialog({ state, onClose }: EditStateDialogProps): React.ReactElement {
    const { mutate, isPending } = useUpdateState();
    const form = useForm<EditStateFormData>({
        resolver: zodResolver(editStateSchema),
        values: state
            ? {
                  name: state.name,
                  color: state.color,
                  category: state.category,
                  isDefault: state.isDefault,
                  sequence: state.sequence,
              }
            : { name: '', color: '#6366f1', category: 'Unstarted', isDefault: false, sequence: 0 },
    });

    const onSubmit = (data: EditStateFormData): void => {
        if (!state) return;
        mutate(
            { id: state.id, data },
            {
                onSuccess: () => {
                    toast.success('Estado actualizado');
                    onClose();
                },
                onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al actualizar el estado'); },
            },
        );
    };

    return (
        <Dialog open={state !== null} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="bg-surface-2 border-subtle max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Editar estado</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-secondary text-xs">Nombre</Label>
                        <Input
                            {...form.register('name')}
                            className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                        />
                        {form.formState.errors.name && (
                            <p className="text-xs text-danger-primary">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>

                    <Controller
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <ColorInput
                                value={field.value}
                                onChange={field.onChange}
                                error={form.formState.errors.color?.message}
                            />
                        )}
                    />

                    <div className="space-y-1.5">
                        <Label className="text-secondary text-xs">Categoría</Label>
                        <Controller
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="bg-layer-1 border-subtle text-primary h-8 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-surface-2 border-subtle">
                                        {CATEGORIES.map((c) => (
                                            <SelectItem key={c} value={c} className="text-primary text-sm">
                                                {CATEGORY_LABELS[c]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-secondary text-xs">Orden (sequence)</Label>
                        <Input
                            type="number"
                            {...form.register('sequence', { valueAsNumber: true })}
                            className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                        />
                        {form.formState.errors.sequence && (
                            <p className="text-xs text-danger-primary">
                                {form.formState.errors.sequence.message}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Controller
                            control={form.control}
                            name="isDefault"
                            render={({ field }) => (
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id="edit-state-default"
                                />
                            )}
                        />
                        <Label htmlFor="edit-state-default" className="text-secondary text-sm cursor-pointer">
                            Estado por defecto
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-secondary"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isPending}
                            className="bg-accent-primary text-on-color hover:bg-accent-primary-hover"
                        >
                            {isPending ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── State Row ────────────────────────────────────────────────────────────────

interface StateRowProps {
    state: State;
    onEdit: (state: State) => void;
    onDelete: (state: State) => void;
}

function StateRow({ state, onEdit, onDelete }: StateRowProps): React.ReactElement {
    return (
        <div className="group flex items-center gap-3 px-4 py-2.5 border-b border-subtle last:border-0 hover:bg-layer-1 transition-colors">
            <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: state.color }}
                aria-hidden="true"
            />
            <span className="flex-1 text-sm text-primary">{state.name}</span>
            <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-xs bg-layer-2 text-secondary border-none">
                    {CATEGORY_LABELS[state.category]}
                </Badge>
                {state.isDefault && (
                    <Badge variant="secondary" className="text-xs bg-accent-subtle text-accent-primary border-none">
                        Default
                    </Badge>
                )}
            </div>
            <div className={cn('flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity')}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-secondary hover:text-primary"
                    onClick={() => onEdit(state)}
                    aria-label="Editar estado"
                >
                    <Pencil size={13} aria-hidden="true" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-secondary hover:text-danger-primary"
                    onClick={() => onDelete(state)}
                    aria-label="Eliminar estado"
                >
                    <Trash2 size={13} aria-hidden="true" />
                </Button>
            </div>
        </div>
    );
}

// ─── State Group Card ─────────────────────────────────────────────────────────

interface StateGroupCardProps {
    group: StateGroup;
    onEditGroup: (group: StateGroup) => void;
    onDeleteGroup: (group: StateGroup) => void;
    onAddState: (groupId: string) => void;
    onEditState: (state: State) => void;
    onDeleteState: (state: State) => void;
}

function StateGroupCard({
    group,
    onEditGroup,
    onDeleteGroup,
    onAddState,
    onEditState,
    onDeleteState,
}: StateGroupCardProps): React.ReactElement {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="rounded-lg border border-subtle overflow-hidden">
            {/* Nesting buttons inside a button is invalid HTML — split the toggle
                trigger and the row-level actions into siblings inside a flex row. */}
            <div className="w-full flex items-center gap-2 px-4 py-2.5 bg-layer-1 hover:bg-layer-2 transition-colors">
                <button
                    type="button"
                    className="flex flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-sm"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    aria-label={expanded ? `Contraer grupo ${group.name}` : `Expandir grupo ${group.name}`}
                >
                    {expanded ? (
                        <ChevronDown size={14} className="text-tertiary shrink-0" aria-hidden="true" />
                    ) : (
                        <ChevronRight size={14} className="text-tertiary shrink-0" aria-hidden="true" />
                    )}
                    <span className="flex-1 text-sm font-medium text-primary">{group.name}</span>
                    {group.isDefault && (
                        <Badge variant="secondary" className="text-xs bg-accent-subtle text-accent-primary border-none">
                            Por defecto
                        </Badge>
                    )}
                    <span className="text-xs text-tertiary">{group.states.length} estados</span>
                </button>
                <div className="flex items-center gap-1 ml-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-secondary hover:text-primary"
                        onClick={() => onEditGroup(group)}
                        disabled={group.isDefault}
                        aria-label="Renombrar grupo"
                    >
                        <Pencil size={12} aria-hidden="true" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-secondary hover:text-danger-primary"
                        onClick={() => onDeleteGroup(group)}
                        disabled={group.isDefault}
                        aria-label="Eliminar grupo"
                    >
                        <Trash2 size={12} aria-hidden="true" />
                    </Button>
                </div>
            </div>

            {expanded && (
                <div>
                    {group.states
                        .slice()
                        .sort((a, b) => a.sequence - b.sequence)
                        .map((s) => (
                            <StateRow
                                key={s.id}
                                state={s}
                                onEdit={onEditState}
                                onDelete={onDeleteState}
                            />
                        ))}
                    <div className="px-4 py-2 border-t border-subtle">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-secondary hover:text-primary gap-1.5 h-7 text-xs"
                            onClick={() => onAddState(group.id)}
                        >
                            <Plus size={12} aria-hidden="true" />
                            Agregar estado
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton(): React.ReactElement {
    return (
        <div className="space-y-4">
            {(['g0', 'g1', 'g2'] as const).map((gk) => (
                <div key={gk} className="rounded-lg border border-subtle overflow-hidden">
                    <Skeleton className="h-10 w-full" />
                    {(['r0', 'r1'] as const).map((rk) => (
                        <Skeleton key={rk} className="h-10 w-full mt-px" />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
    onCreateClick: () => void;
}

function EmptyState({ onCreateClick }: EmptyStateProps): React.ReactElement {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <Circle size={36} className="text-tertiary mb-3" aria-hidden="true" />
            <p className="text-primary font-medium">No hay grupos de estados</p>
            <p className="text-secondary text-sm mt-1">
                Crea grupos para organizar los estados del sistema.
            </p>
            <Button
                size="sm"
                onClick={onCreateClick}
                className="mt-4 bg-accent-primary text-on-color hover:bg-accent-primary-hover gap-1.5"
            >
                <Plus size={14} aria-hidden="true" />
                Crear primer grupo
            </Button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const GodModeStatesPage = (): React.ReactElement => {
    const [createGroupOpen, setCreateGroupOpen] = useState(false);
    const [editGroup, setEditGroup] = useState<StateGroup | null>(null);
    const [deleteGroup, setDeleteGroup] = useState<StateGroup | null>(null);
    const [createStateGroupId, setCreateStateGroupId] = useState<string | null>(null);
    const [editState, setEditState] = useState<State | null>(null);
    const [deleteState, setDeleteState] = useState<State | null>(null);

    const { data: groups, isLoading } = useStateGroups();
    const { mutate: deleteGroupMutate, isPending: isDeletingGroup } = useDeleteStateGroup();
    const { mutate: deleteStateMutate, isPending: isDeletingState } = useDeleteState();

    const handleDeleteGroupConfirm = (): void => {
        if (!deleteGroup) return;
        deleteGroupMutate(deleteGroup.id, {
            onSuccess: () => {
                toast.success('Grupo eliminado');
                setDeleteGroup(null);
            },
            onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al eliminar el grupo'); },
        });
    };

    const handleDeleteStateConfirm = (): void => {
        if (!deleteState) return;
        deleteStateMutate(deleteState.id, {
            onSuccess: () => {
                toast.success('Estado eliminado');
                setDeleteState(null);
            },
            onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al eliminar el estado'); },
        });
    };

    const groupList = groups ?? [];
    const isEmpty = !isLoading && groupList.length === 0;

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Grupos de Estados</h2>
                    <p className="text-sm text-secondary mt-1">
                        Configura los grupos y estados globales disponibles en el sistema.
                    </p>
                </div>
                <Button
                    size="sm"
                    onClick={() => setCreateGroupOpen(true)}
                    className="bg-accent-primary text-on-color hover:bg-accent-primary-hover gap-1.5"
                >
                    <Plus size={14} aria-hidden="true" />
                    Nuevo grupo
                </Button>
            </div>

            {isLoading && <LoadingSkeleton />}

            {isEmpty && <EmptyState onCreateClick={() => setCreateGroupOpen(true)} />}

            {!isLoading && !isEmpty && (
                <div className="space-y-4">
                    {groupList.map((group) => (
                        <StateGroupCard
                            key={group.id}
                            group={group}
                            onEditGroup={setEditGroup}
                            onDeleteGroup={setDeleteGroup}
                            onAddState={setCreateStateGroupId}
                            onEditState={setEditState}
                            onDeleteState={setDeleteState}
                        />
                    ))}
                </div>
            )}

            <CreateGroupDialog open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} />
            <EditGroupDialog group={editGroup} onClose={() => setEditGroup(null)} />
            <CreateStateDialog stateGroupId={createStateGroupId} onClose={() => setCreateStateGroupId(null)} />
            <EditStateDialog state={editState} onClose={() => setEditState(null)} />

            <AlertDialog open={deleteGroup !== null} onOpenChange={(v) => !v && setDeleteGroup(null)}>
                <AlertDialogContent className="bg-surface-2 border-subtle">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-primary">¿Eliminar grupo?</AlertDialogTitle>
                        <AlertDialogDescription className="text-secondary">
                            Se eliminará permanentemente el grupo{' '}
                            <span className="font-medium text-primary">{deleteGroup?.name}</span> y todos sus estados.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-subtle text-secondary">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteGroupConfirm}
                            disabled={isDeletingGroup}
                            className="bg-danger-primary text-on-color hover:bg-danger-primary/90"
                        >
                            {isDeletingGroup ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deleteState !== null} onOpenChange={(v) => !v && setDeleteState(null)}>
                <AlertDialogContent className="bg-surface-2 border-subtle">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-primary">¿Eliminar estado?</AlertDialogTitle>
                        <AlertDialogDescription className="text-secondary">
                            Se eliminará permanentemente el estado{' '}
                            <span className="font-medium text-primary">{deleteState?.name}</span>.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-subtle text-secondary">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteStateConfirm}
                            disabled={isDeletingState}
                            className="bg-danger-primary text-on-color hover:bg-danger-primary/90"
                        >
                            {isDeletingState ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
