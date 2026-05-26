import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    useAdminWorkspaces,
    useCreateAdminWorkspace,
    useUpdateAdminWorkspace,
    useDeleteAdminWorkspace,
    useAdminWorkspaceMembers,
    useAddWorkspaceMember,
    useRemoveWorkspaceMember,
    useAdminUsers,
} from '../../application/use-admin';
import { SearchableSelect } from '@/shared/components/ui/searchable-select';
import type {
    AdminWorkspaceDto,
    AdminWorkspaceMemberDto,
} from '../../domain/types';

// ─── Create Workspace Dialog ──────────────────────────────────────────────────

const createWorkspaceSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(255),
    slug: z
        .string()
        .max(64)
        .regex(/^[a-z0-9-]*$/, 'Solo letras minúsculas, números y guiones')
        .optional(),
    description: z.string().max(1000).optional(),
});
type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

function slugFromName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

interface CreateWorkspaceDialogProps {
    open: boolean;
    onClose: () => void;
}

function CreateWorkspaceDialog({ open, onClose }: CreateWorkspaceDialogProps): React.ReactElement {
    const { mutate, isPending } = useCreateAdminWorkspace();
    const form = useForm<CreateWorkspaceFormData>({
        resolver: zodResolver(createWorkspaceSchema),
        defaultValues: { name: '', slug: '', description: '' },
    });

    const onSubmit = (data: CreateWorkspaceFormData): void => {
        const slug = data.slug?.trim() ? data.slug.trim() : slugFromName(data.name);
        mutate(
            {
                name: data.name,
                slug,
                description: data.description?.trim() ? data.description.trim() : undefined,
            },
            {
                onSuccess: () => {
                    form.reset();
                    onClose();
                },
            },
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) {
                    form.reset();
                    onClose();
                }
            }}
        >
            <DialogContent className="bg-surface-2 border-subtle max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Crear workspace</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-xs">Nombre</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Acme Inc."
                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder h-8 text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-xs">
                                        Slug (opcional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="acme-inc"
                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder h-8 text-sm font-mono"
                                        />
                                    </FormControl>
                                    <p className="text-xs text-tertiary">
                                        Si lo dejás vacío, se genera a partir del nombre.
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-xs">
                                        Descripción (opcional)
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            rows={3}
                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder text-sm resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                {isPending ? 'Creando...' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Edit Workspace Dialog ────────────────────────────────────────────────────

const editWorkspaceSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(255),
    description: z.string().max(1000).optional(),
    logoUrl: z.string().max(500).optional(),
});
type EditWorkspaceFormData = z.infer<typeof editWorkspaceSchema>;

interface EditWorkspaceDialogProps {
    workspace: AdminWorkspaceDto | null;
    onClose: () => void;
}

function EditWorkspaceDialog({
    workspace,
    onClose,
}: EditWorkspaceDialogProps): React.ReactElement {
    const { mutate, isPending } = useUpdateAdminWorkspace();
    const form = useForm<EditWorkspaceFormData>({
        resolver: zodResolver(editWorkspaceSchema),
        values: workspace
            ? {
                  name: workspace.name,
                  description: workspace.description ?? '',
                  logoUrl: workspace.logoUrl ?? '',
              }
            : { name: '', description: '', logoUrl: '' },
    });

    const onSubmit = (data: EditWorkspaceFormData): void => {
        if (!workspace) return;
        mutate(
            {
                id: workspace.id,
                data: {
                    name: data.name,
                    description: data.description ?? '',
                    logoUrl: data.logoUrl ?? '',
                },
            },
            { onSuccess: () => onClose() },
        );
    };

    return (
        <Dialog open={workspace !== null} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="bg-surface-2 border-subtle max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">
                        Editar workspace — {workspace?.name}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-xs">Nombre</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder h-8 text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-xs">
                                        Descripción
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            rows={3}
                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder text-sm resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="logoUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-xs">
                                        URL del logo
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="https://..."
                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder h-8 text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                </Form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Members Dialog ───────────────────────────────────────────────────────────

const addMemberSchema = z.object({
    userId: z.string().min(1, 'Seleccioná un usuario'),
    role: z.literal('Admin'),
});
type AddMemberFormData = z.infer<typeof addMemberSchema>;

interface MemberRowProps {
    member: AdminWorkspaceMemberDto;
    onRemove: () => void;
}

function MemberRow({ member, onRemove }: MemberRowProps): React.ReactElement {
    return (
        <TableRow className="border-b border-subtle hover:bg-layer-1">
            <TableCell className="text-primary text-sm">{member.email}</TableCell>
            <TableCell className="text-secondary text-sm">
                {member.displayName ?? '—'}
            </TableCell>
            <TableCell>
                <Badge
                    variant="secondary"
                    className="text-xs bg-accent-subtle text-accent-primary border-none"
                >
                    {member.role === 'Admin' ? 'Administrador' : 'Miembro'}
                </Badge>
            </TableCell>
            <TableCell>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-secondary hover:text-danger-primary"
                    onClick={onRemove}
                    aria-label="Remover miembro"
                >
                    <Trash2 size={13} aria-hidden="true" />
                </Button>
            </TableCell>
        </TableRow>
    );
}

interface AddMemberFormProps {
    workspaceId: string;
}

function AddMemberForm({ workspaceId }: AddMemberFormProps): React.ReactElement {
    const { data: usersData } = useAdminUsers(1);
    const { mutate, isPending } = useAddWorkspaceMember(workspaceId);
    const form = useForm<AddMemberFormData>({
        resolver: zodResolver(addMemberSchema),
        defaultValues: { userId: '', role: 'Admin' },
    });

    const onSubmit = (data: AddMemberFormData): void => {
        mutate(data, { onSuccess: () => form.reset({ userId: '', role: 'Admin' }) });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-end gap-2 pt-2 border-t border-subtle mt-4"
            >
                <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel className="text-secondary text-xs">Usuario</FormLabel>
                            <FormControl>
                                <SearchableSelect
                                    multi={false}
                                    value={field.value || null}
                                    onChange={(v) => field.onChange(v ?? '')}
                                    items={(usersData?.items ?? []).map((u) => ({
                                        id: u.id,
                                        label: u.email,
                                    }))}
                                    placeholder="Seleccionar..."
                                    width="100%"
                                    clearable={false}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="w-40 flex flex-col gap-1 mb-0.5">
                    <span className="text-secondary text-xs">Rol</span>
                    <Badge
                        variant="secondary"
                        className="text-xs bg-accent-subtle text-accent-primary border-none h-8 flex items-center justify-center"
                    >
                        Administrador
                    </Badge>
                </div>
                <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="bg-accent-primary text-on-color hover:bg-accent-primary-hover gap-1 mb-0.5"
                >
                    <Plus size={13} aria-hidden="true" />
                    {isPending ? 'Agregando...' : 'Agregar'}
                </Button>
            </form>
        </Form>
    );
}

interface MembersDialogProps {
    workspace: AdminWorkspaceDto | null;
    onClose: () => void;
}

function MembersDialog({ workspace, onClose }: MembersDialogProps): React.ReactElement {
    const { data: members, isLoading } = useAdminWorkspaceMembers(workspace?.id ?? null);
    const { mutate: removeMember } = useRemoveWorkspaceMember(workspace?.id ?? '');
    const [removeTarget, setRemoveTarget] = useState<AdminWorkspaceMemberDto | null>(null);

    const handleRemoveConfirm = (): void => {
        if (!removeTarget || !workspace) return;
        removeMember(removeTarget.userId, { onSuccess: () => setRemoveTarget(null) });
    };

    return (
        <Dialog open={workspace !== null} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="bg-surface-2 border-subtle max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-primary">
                        Miembros — {workspace?.name}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="space-y-2">
                        {(['m0', 'm1', 'm2'] as const).map((k) => (
                            <Skeleton key={k} className="h-8 w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-subtle overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-subtle hover:bg-transparent bg-layer-1">
                                    <TableHead className="text-secondary text-xs font-medium h-8">
                                        Correo
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-8">
                                        Nombre
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-8">
                                        Rol
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-8 w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(members ?? []).map((m) => (
                                    <MemberRow
                                        key={m.userId}
                                        member={m}
                                        onRemove={() => setRemoveTarget(m)}
                                    />
                                ))}
                                {(members ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center text-tertiary py-6 text-sm"
                                        >
                                            Sin miembros asignados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {workspace && <AddMemberForm workspaceId={workspace.id} />}

                <DialogFooter>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-secondary"
                    >
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>

            <AlertDialog
                open={removeTarget !== null}
                onOpenChange={(v) => !v && setRemoveTarget(null)}
            >
                <AlertDialogContent className="bg-surface-2 border-subtle">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-primary">
                            ¿Remover miembro?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-secondary">
                            Se removerá a{' '}
                            <span className="font-medium text-primary">{removeTarget?.email}</span>{' '}
                            del workspace.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-subtle text-secondary">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveConfirm}
                            className="bg-danger-primary text-on-color hover:bg-danger-primary/90"
                        >
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
}

// ─── Workspace Row ────────────────────────────────────────────────────────────

interface WorkspaceRowProps {
    workspace: AdminWorkspaceDto;
    onManageMembers: (workspace: AdminWorkspaceDto) => void;
    onEdit: (workspace: AdminWorkspaceDto) => void;
    onDelete: (workspace: AdminWorkspaceDto) => void;
}

function WorkspaceRow({
    workspace,
    onManageMembers,
    onEdit,
    onDelete,
}: WorkspaceRowProps): React.ReactElement {
    return (
        <TableRow className="border-b border-subtle hover:bg-layer-1 transition-colors">
            <TableCell className="text-primary text-sm font-medium">{workspace.name}</TableCell>
            <TableCell className="text-secondary text-xs font-mono">{workspace.slug}</TableCell>
            <TableCell className="text-secondary text-sm">
                {workspace.description ?? '—'}
            </TableCell>
            <TableCell className="text-tertiary text-xs">
                {new Date(workspace.createdAt).toLocaleDateString('es-AR')}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onManageMembers(workspace)}
                        className="text-secondary hover:text-primary gap-1.5 h-7 text-xs"
                    >
                        <Users size={12} aria-hidden="true" />
                        Miembros
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(workspace)}
                        className="text-secondary hover:text-primary gap-1.5 h-7 text-xs"
                    >
                        <Pencil size={12} aria-hidden="true" />
                        Editar
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(workspace)}
                        className="h-7 w-7 text-secondary hover:text-danger-primary"
                        aria-label="Eliminar workspace"
                    >
                        <Trash2 size={13} aria-hidden="true" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const GodModeWorkspacesPage = (): React.ReactElement => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [membersWorkspace, setMembersWorkspace] = useState<AdminWorkspaceDto | null>(null);
    const [editWorkspace, setEditWorkspace] = useState<AdminWorkspaceDto | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminWorkspaceDto | null>(null);
    const { data, isLoading } = useAdminWorkspaces(page);
    const { mutate: deleteMutate } = useDeleteAdminWorkspace();

    const filtered = (data?.items ?? []).filter(
        (w) =>
            w.name.toLowerCase().includes(search.toLowerCase()) ||
            w.slug.toLowerCase().includes(search.toLowerCase()),
    );

    const handleDeleteConfirm = (): void => {
        if (!deleteTarget) return;
        deleteMutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Workspaces</h2>
                    <p className="text-sm text-secondary mt-1">
                        Espacios de trabajo registrados en la instancia.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Buscar workspace..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-56 h-8 text-sm bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                    />
                    <Button
                        size="sm"
                        onClick={() => setCreateOpen(true)}
                        className="bg-accent-primary text-on-color hover:bg-accent-primary-hover gap-1.5 h-8 text-sm"
                    >
                        <Plus size={13} aria-hidden="true" />
                        Crear workspace
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {(['s0', 's1', 's2', 's3'] as const).map((k) => (
                        <Skeleton key={k} className="h-10 w-full" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-lg border border-subtle overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-subtle hover:bg-transparent bg-layer-1">
                                    <TableHead className="text-secondary text-xs font-medium h-9">
                                        Nombre
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9">
                                        Slug
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9">
                                        Descripción
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9">
                                        Creado
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9 w-56" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((w) => (
                                    <WorkspaceRow
                                        key={w.id}
                                        workspace={w}
                                        onManageMembers={setMembersWorkspace}
                                        onEdit={setEditWorkspace}
                                        onDelete={setDeleteTarget}
                                    />
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-tertiary py-10 text-sm"
                                        >
                                            No hay workspaces registrados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={!data.hasPreviousPage}
                                onClick={() => setPage((p) => p - 1)}
                                className="text-secondary hover:text-primary"
                            >
                                Anterior
                            </Button>
                            <span className="text-xs text-tertiary">
                                {data.page} / {data.totalPages}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={!data.hasNextPage}
                                onClick={() => setPage((p) => p + 1)}
                                className="text-secondary hover:text-primary"
                            >
                                Siguiente
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <CreateWorkspaceDialog open={createOpen} onClose={() => setCreateOpen(false)} />
            <EditWorkspaceDialog
                workspace={editWorkspace}
                onClose={() => setEditWorkspace(null)}
            />
            <MembersDialog
                workspace={membersWorkspace}
                onClose={() => setMembersWorkspace(null)}
            />

            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(v) => !v && setDeleteTarget(null)}
            >
                <AlertDialogContent className="bg-surface-2 border-subtle">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-primary">
                            ¿Eliminar workspace?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-secondary">
                            Se eliminará el workspace{' '}
                            <span className="font-medium text-primary">{deleteTarget?.name}</span>.
                            Los proyectos y miembros asociados quedarán huérfanos hasta que un
                            administrador los restaure.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-subtle text-secondary">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-danger-primary text-on-color hover:bg-danger-primary/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
