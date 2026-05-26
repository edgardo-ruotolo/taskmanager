import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { SearchableSelect } from '@/shared/components/ui/searchable-select';
import {
    useAdminUsers,
    useCreateAdminUser,
    useUpdateAdminUser,
    useDeleteAdminUser,
} from '../../application/use-admin';
import type { AdminUserDto } from '../../domain/types';

const createSchema = z.object({
    email: z.string().email('Email inválido'),
    username: z.string().min(3, 'Mínimo 3 caracteres'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    role: z.string().min(1, 'Requerido'),
});
type CreateFormData = z.infer<typeof createSchema>;

const editSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    displayName: z.string().optional(),
    isActive: z.boolean(),
    role: z.string().min(1, 'Requerido'),
});
type EditFormData = z.infer<typeof editSchema>;

interface CreateUserDialogProps {
    open: boolean;
    onClose: () => void;
}

function CreateUserDialog({ open, onClose }: CreateUserDialogProps): React.ReactElement {
    const { mutate, isPending } = useCreateAdminUser();
    const form = useForm<CreateFormData>({
        resolver: zodResolver(createSchema),
        defaultValues: { role: 'Administrador' },
    });

    const onSubmit = (data: CreateFormData): void => {
        mutate(data, {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="bg-surface-2 border-subtle max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Nuevo usuario</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary text-xs">Nombre</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Juan"
                                                className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary text-xs">Apellido</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="García"
                                                className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-xs">Correo electrónico</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="juan@proyecto.com"
                                            className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-xs">Usuario</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="juangarcia"
                                            className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-xs">Contraseña</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-xs">Rol</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            multi={false}
                                            value={field.value || null}
                                            onChange={(v) => field.onChange(v ?? 'Administrador')}
                                            items={[
                                                { id: 'SuperAdmin', label: 'SuperAdministrador' },
                                                { id: 'Administrador', label: 'Administrador' },
                                            ]}
                                            placeholder="Seleccionar rol"
                                            width="100%"
                                            clearable={false}
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
                                {isPending ? 'Creando...' : 'Crear usuario'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

interface EditUserDialogProps {
    user: AdminUserDto | null;
    onClose: () => void;
}

function EditUserDialog({ user, onClose }: EditUserDialogProps): React.ReactElement {
    const { mutate, isPending } = useUpdateAdminUser();
    const currentRole = user?.roles[0] ?? 'Administrador';
    const form = useForm<EditFormData>({
        resolver: zodResolver(editSchema),
        values: {
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            displayName: user?.displayName ?? '',
            isActive: user?.isActive ?? true,
            role: currentRole,
        },
    });

    const onSubmit = (data: EditFormData): void => {
        if (!user) return;
        mutate({ id: user.id, data }, { onSuccess: onClose });
    };

    return (
        <Dialog open={user !== null} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="bg-surface-2 border-subtle max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Editar usuario</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary text-xs">Nombre</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary text-xs">Apellido</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-xs">Nombre visible</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="bg-layer-1 border-subtle text-primary h-8 text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary text-xs">Rol</FormLabel>
                                        <FormControl>
                                            <SearchableSelect
                                                multi={false}
                                                value={field.value || null}
                                                onChange={(v) => field.onChange(v ?? 'Administrador')}
                                                items={[
                                                    { id: 'SuperAdmin', label: 'SuperAdministrador' },
                                                    { id: 'Administrador', label: 'Administrador' },
                                                ]}
                                                placeholder="Seleccionar rol"
                                                width="100%"
                                                clearable={false}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary text-xs">Estado</FormLabel>
                                        <FormControl>
                                            <SearchableSelect
                                                multi={false}
                                                value={String(field.value)}
                                                onChange={(v) => field.onChange(v === 'true')}
                                                items={[
                                                    { id: 'true', label: 'Activo' },
                                                    { id: 'false', label: 'Inactivo' },
                                                ]}
                                                placeholder="Estado"
                                                width="100%"
                                                clearable={false}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
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
                </Form>
            </DialogContent>
        </Dialog>
    );
}

interface UserRowProps {
    user: AdminUserDto;
    onEdit: (user: AdminUserDto) => void;
    onDelete: (user: AdminUserDto) => void;
}

function UserRow({ user, onEdit, onDelete }: UserRowProps): React.ReactElement {
    const displayName =
        user.displayName ?? ([user.firstName, user.lastName].filter(Boolean).join(' ') || '—');
    return (
        <TableRow className="border-b border-subtle hover:bg-layer-1 transition-colors">
            <TableCell className="text-primary text-sm">{user.email}</TableCell>
            <TableCell className="text-secondary text-sm">{displayName}</TableCell>
            <TableCell>
                <div className="flex flex-wrap gap-1">
                    {user.roles.length > 0 ? (
                        user.roles.map((r) => (
                            <Badge
                                key={r}
                                variant="secondary"
                                className="text-xs bg-accent-subtle text-accent-primary border-none"
                            >
                                {r === 'SuperAdmin'
                                    ? 'SuperAdministrador'
                                    : r === 'Administrador'
                                        ? 'Administrador'
                                        : r}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-tertiary text-xs">—</span>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <Badge
                    variant="secondary"
                    className={
                        user.isActive
                            ? 'text-xs bg-success-subtle text-success-primary border-none'
                            : 'text-xs bg-layer-2 text-tertiary border-none'
                    }
                >
                    {user.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
            </TableCell>
            <TableCell className="text-tertiary text-xs">
                {new Date(user.createdAt).toLocaleDateString('es-AR')}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-secondary hover:text-primary"
                        onClick={() => onEdit(user)}
                        aria-label="Editar usuario"
                    >
                        <Pencil size={13} aria-hidden="true" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-secondary hover:text-danger-primary"
                        onClick={() => onDelete(user)}
                        aria-label="Eliminar usuario"
                    >
                        <Trash2 size={13} aria-hidden="true" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

export const GodModeUsersPage = (): React.ReactElement => {
    const [page, setPage] = useState(1);
    const [createOpen, setCreateOpen] = useState(false);
    const [editUser, setEditUser] = useState<AdminUserDto | null>(null);
    const [deleteUser, setDeleteUser] = useState<AdminUserDto | null>(null);
    const { data, isLoading } = useAdminUsers(page);
    const { mutate: deleteUserMutate, isPending: isDeleting } = useDeleteAdminUser();

    const handleDelete = (): void => {
        if (!deleteUser) return;
        deleteUserMutate(deleteUser.id, { onSuccess: () => setDeleteUser(null) });
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Usuarios</h2>
                    <p className="text-sm text-secondary mt-1">
                        Todos los usuarios registrados en la instancia.
                    </p>
                </div>
                <Button
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    className="bg-accent-primary text-on-color hover:bg-accent-primary-hover gap-1.5"
                >
                    <Plus size={14} aria-hidden="true" />
                    Nuevo usuario
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {(['s0', 's1', 's2', 's3', 's4'] as const).map((k) => (
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
                                        Correo
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9">
                                        Nombre
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9">
                                        Rol
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9">
                                        Estado
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9">
                                        Creado
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9 w-20" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(data?.items ?? []).map((u) => (
                                    <UserRow
                                        key={u.id}
                                        user={u}
                                        onEdit={setEditUser}
                                        onDelete={setDeleteUser}
                                    />
                                ))}
                                {(data?.items ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-tertiary py-10 text-sm"
                                        >
                                            No hay usuarios registrados.
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

            <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} />
            <EditUserDialog user={editUser} onClose={() => setEditUser(null)} />

            <AlertDialog
                open={deleteUser !== null}
                onOpenChange={(v) => !v && setDeleteUser(null)}
            >
                <AlertDialogContent className="bg-surface-2 border-subtle">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-primary">¿Eliminar usuario?</AlertDialogTitle>
                        <AlertDialogDescription className="text-secondary">
                            Se eliminará permanentemente a{' '}
                            <span className="font-medium text-primary">{deleteUser?.email}</span>. Esta
                            acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-subtle text-secondary">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-danger-primary text-on-color hover:bg-danger-primary/90"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
