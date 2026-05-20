import type React from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layers, Trash2, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    useAdminCompanies,
    useAdminCompanyMembers,
    useAddCompanyMember,
    useRemoveCompanyMember,
    useAdminUsers,
    useUpdateAdminCompany,
} from '../../application/use-admin';
import { useStateGroups } from '@/modules/states/application/use-states';
import type { AdminCompanyDto, AdminCompanyMemberDto } from '../../domain/types';

// ─── Edit Company Group Dialog ────────────────────────────────────────────────

const editGroupSchema = z.object({
    stateGroupId: z.string().min(1, 'Seleccioná un grupo'),
});
type EditGroupFormData = z.infer<typeof editGroupSchema>;

interface EditCompanyGroupDialogProps {
    company: AdminCompanyDto | null;
    onClose: () => void;
}

function EditCompanyGroupDialog({ company, onClose }: EditCompanyGroupDialogProps): React.ReactElement {
    const { data: groups, isLoading: loadingGroups } = useStateGroups();
    const { mutate, isPending } = useUpdateAdminCompany();
    const form = useForm<EditGroupFormData>({
        resolver: zodResolver(editGroupSchema),
        values: company ? { stateGroupId: company.stateGroupId } : { stateGroupId: '' },
    });

    const onSubmit = (data: EditGroupFormData): void => {
        if (!company) return;
        mutate(
            { id: company.id, data: { stateGroupId: data.stateGroupId } },
            {
                onSuccess: () => {
                    toast.success('Grupo actualizado');
                    onClose();
                },
                onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al actualizar el grupo'); },
            },
        );
    };

    const groupList = groups ?? [];

    return (
        <Dialog open={company !== null} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="bg-surface-2 border-subtle max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">
                        Editar grupo — {company?.name}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="rounded-lg bg-warning-subtle border border-warning-subtle px-3 py-2.5">
                        <p className="text-xs text-warning-primary leading-relaxed">
                            Al cambiar el grupo, todos los issues activos de esta empresa se
                            reasignarán al estado por defecto del nuevo grupo.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-secondary text-xs">Grupo de estados</Label>
                        {loadingGroups ? (
                            <Skeleton className="h-8 w-full" />
                        ) : (
                            <Controller
                                control={form.control}
                                name="stateGroupId"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="bg-layer-1 border-subtle text-primary h-8 text-sm">
                                            <SelectValue placeholder="Seleccionar grupo..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-surface-2 border-subtle">
                                            {groupList.map((g) => (
                                                <SelectItem
                                                    key={g.id}
                                                    value={g.id}
                                                    className="text-primary text-sm"
                                                    disabled={g.isDefault && g.id !== company?.stateGroupId}
                                                >
                                                    {g.name}
                                                    {g.isDefault ? ' (Por defecto)' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        )}
                        {form.formState.errors.stateGroupId && (
                            <p className="text-xs text-danger-primary">
                                {form.formState.errors.stateGroupId.message}
                            </p>
                        )}
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
                            disabled={isPending || loadingGroups}
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

// ─── Members Dialog ───────────────────────────────────────────────────────────

const addMemberSchema = z.object({
    userId: z.string().min(1, 'Seleccioná un usuario'),
    role: z.string().min(1, 'Requerido'),
});
type AddMemberFormData = z.infer<typeof addMemberSchema>;

interface MembersDialogProps {
    company: AdminCompanyDto | null;
    onClose: () => void;
}

interface MemberRowProps {
    member: AdminCompanyMemberDto;
    onRemove: () => void;
}

function MemberRow({ member, onRemove }: MemberRowProps): React.ReactElement {
    return (
        <TableRow className="border-b border-subtle hover:bg-layer-1">
            <TableCell className="text-primary text-sm">{member.email}</TableCell>
            <TableCell className="text-secondary text-sm">{member.displayName ?? '—'}</TableCell>
            <TableCell>
                <Badge
                    variant="secondary"
                    className="text-xs bg-accent-subtle text-accent-primary border-none"
                >
                    {member.role}
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
    companyId: string;
    onAdded: () => void;
}

function AddMemberForm({ companyId, onAdded }: AddMemberFormProps): React.ReactElement {
    const { data: usersData } = useAdminUsers(1);
    const { mutate, isPending } = useAddCompanyMember(companyId);
    const form = useForm<AddMemberFormData>({
        resolver: zodResolver(addMemberSchema),
        defaultValues: { role: 'Member' },
    });

    const onSubmit = (data: AddMemberFormData): void => {
        mutate(data, {
            onSuccess: () => {
                form.reset();
                onAdded();
            },
        });
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
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="bg-layer-1 border-subtle text-primary h-8 text-sm">
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-surface-2 border-subtle">
                                    {(usersData?.items ?? []).map((u) => (
                                        <SelectItem
                                            key={u.id}
                                            value={u.id}
                                            className="text-primary text-sm"
                                        >
                                            {u.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem className="w-36">
                            <FormLabel className="text-secondary text-xs">Rol</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="bg-layer-1 border-subtle text-primary h-8 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-surface-2 border-subtle">
                                    <SelectItem value="Guest" className="text-primary text-sm">
                                        Invitado
                                    </SelectItem>
                                    <SelectItem value="Member" className="text-primary text-sm">
                                        Miembro
                                    </SelectItem>
                                    <SelectItem value="Admin" className="text-primary text-sm">
                                        Administrador
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
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

function MembersDialog({ company, onClose }: MembersDialogProps): React.ReactElement {
    const { data: members, isLoading } = useAdminCompanyMembers(company?.id ?? null);
    const { mutate: removeMember } = useRemoveCompanyMember(company?.id ?? '');
    const [removeTarget, setRemoveTarget] = useState<AdminCompanyMemberDto | null>(null);

    const handleRemoveConfirm = (): void => {
        if (!removeTarget || !company) return;
        removeMember(removeTarget.userId, { onSuccess: () => setRemoveTarget(null) });
    };

    return (
        <Dialog open={company !== null} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="bg-surface-2 border-subtle max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-primary">Miembros — {company?.name}</DialogTitle>
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

                {company && <AddMemberForm companyId={company.id} onAdded={() => undefined} />}

                <DialogFooter>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-secondary">
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
                        <AlertDialogTitle className="text-primary">¿Remover miembro?</AlertDialogTitle>
                        <AlertDialogDescription className="text-secondary">
                            Se removerá a{' '}
                            <span className="font-medium text-primary">{removeTarget?.email}</span> de
                            la empresa.
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

// ─── Company Row ──────────────────────────────────────────────────────────────

interface CompanyRowProps {
    company: AdminCompanyDto;
    onManageMembers: (company: AdminCompanyDto) => void;
    onEditGroup: (company: AdminCompanyDto) => void;
}

function CompanyRow({ company, onManageMembers, onEditGroup }: CompanyRowProps): React.ReactElement {
    return (
        <TableRow className="border-b border-subtle hover:bg-layer-1 transition-colors">
            <TableCell>
                <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-accent-subtle text-[10px] font-bold text-accent-primary shrink-0">
                        {company.identifier.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-primary text-sm font-medium">{company.name}</span>
                </div>
            </TableCell>
            <TableCell className="text-secondary text-xs font-mono">{company.identifier}</TableCell>
            <TableCell className="text-secondary text-sm">{company.workspaceName}</TableCell>
            <TableCell className="text-tertiary text-sm">{company.memberCount}</TableCell>
            <TableCell className="text-secondary text-sm">{company.stateGroupName}</TableCell>
            <TableCell className="text-tertiary text-xs">
                {new Date(company.createdAt).toLocaleDateString('es-AR')}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onManageMembers(company)}
                        className="text-secondary hover:text-primary gap-1.5 h-7 text-xs"
                    >
                        <Users size={12} aria-hidden="true" />
                        Miembros
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditGroup(company)}
                        className="text-secondary hover:text-primary gap-1.5 h-7 text-xs"
                    >
                        <Layers size={12} aria-hidden="true" />
                        Editar grupo
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const GodModeCompaniesPage = (): React.ReactElement => {
    const [page, setPage] = useState(1);
    const [membersCompany, setMembersCompany] = useState<AdminCompanyDto | null>(null);
    const [editGroupCompany, setEditGroupCompany] = useState<AdminCompanyDto | null>(null);
    const [search, setSearch] = useState('');
    const { data, isLoading } = useAdminCompanies(page);

    const filtered = (data?.items ?? []).filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.workspaceName.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Empresas</h2>
                    <p className="text-sm text-secondary mt-1">
                        Todas las empresas registradas en la instancia.
                    </p>
                </div>
                <Input
                    placeholder="Buscar empresa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-56 h-8 text-sm bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                />
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
                                        Empresa
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9">
                                        ID
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9">
                                        Workspace
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9">
                                        Miembros
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9">
                                        Grupo
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9">
                                        Creada
                                    </TableHead>
                                    <TableHead className="text-secondary text-xs font-medium h-9 w-48" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((c) => (
                                    <CompanyRow
                                        key={c.id}
                                        company={c}
                                        onManageMembers={setMembersCompany}
                                        onEditGroup={setEditGroupCompany}
                                    />
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center text-tertiary py-10 text-sm"
                                        >
                                            No hay empresas registradas.
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

            <MembersDialog company={membersCompany} onClose={() => setMembersCompany(null)} />
            <EditCompanyGroupDialog
                company={editGroupCompany}
                onClose={() => setEditGroupCompany(null)}
            />
        </div>
    );
};
