import { useState, useEffect } from 'react';
import type React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    UserX,
    Shield,
    User,
    ImageIcon,
    UserPlus,
    Search,
    Loader2,
} from 'lucide-react';
import { UnsplashPicker } from '@/modules/unsplash/presentation/components/UnsplashPicker';
import type { UnsplashPhoto } from '@/modules/unsplash/domain/types';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/shared/lib/api-errors';
import { SearchableSelect } from '@/shared/components/ui/searchable-select';
import { workspaceRepository } from '../../infrastructure/workspace-repository';
import { WORKSPACES_KEY, workspaceMembersKey, useWorkspaceTheme, useUpdateWorkspaceTheme } from '../../application/use-workspaces';
import type { WorkspaceMember, WorkspaceRole, WorkspaceUserSearchResult } from '../../domain/types';
import { WORKSPACE_ROLE_LABELS } from '../../domain/types';
import type { UpdateWorkspaceThemeData } from '../../domain/theme-types';

const settingsSchema = z.object({
    name: z.string().min(1, 'Requerido').max(255),
    description: z.string().max(1000).optional(),
});
type SettingsForm = z.infer<typeof settingsSchema>;

const ROLE_OPTIONS: WorkspaceRole[] = ['Member', 'Lead', 'Admin'];

const createUserSchema = z.object({
    email: z.string().email('Email inválido').max(256),
    firstName: z.string().min(1, 'Requerido').max(100),
    lastName: z.string().min(1, 'Requerido').max(100),
    password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
    role: z.enum(['Admin', 'Lead', 'Member']),
});
type CreateUserForm = z.infer<typeof createUserSchema>;

const inputClass =
    'bg-layer-1 border-subtle text-primary placeholder:text-placeholder focus:border-strong transition-colors';



function SectionHeader({ title, description }: { title: string; description: string }): React.ReactElement {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-semibold text-primary">{title}</h3>
                <p className="text-sm text-tertiary mt-0.5">{description}</p>
            </div>
            <Separator className="bg-subtle" />
        </div>
    );
}

const ROLE_BADGE_COLORS: Record<WorkspaceRole, string> = {
    Admin: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    Lead: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    Member: 'bg-surface-1/50 text-secondary border border-subtle',
};

const RoleBadge = ({ role }: { role: WorkspaceRole }): React.ReactElement => (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE_COLORS[role]}`}>
        {WORKSPACE_ROLE_LABELS[role]}
    </span>
);

function GeneralTab({ workspaceSlug }: { workspaceSlug: string }): React.ReactElement {
    const qc = useQueryClient();
    const [coverPhoto, setCoverPhoto] = useState<UnsplashPhoto | null>(null);

    const settingsForm = useForm<SettingsForm>({
        resolver: zodResolver(settingsSchema),
        defaultValues: { name: '', description: '' },
    });

    const { data: workspaceData } = useQuery({
        queryKey: ['workspace-detail', workspaceSlug],
        queryFn: () => workspaceRepository.getBySlug(workspaceSlug),
        enabled: !!workspaceSlug,
    });

    useEffect(() => {
        if (workspaceData) {
            settingsForm.reset({
                name: workspaceData.name,
                description: workspaceData.description ?? '',
            });
        }
    }, [workspaceData, settingsForm]);

    const updateMutation = useMutation({
        mutationFn: (data: SettingsForm) => workspaceRepository.update(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: WORKSPACES_KEY });
            toast.success('Espacio de trabajo actualizado');
        },
        onError: () => toast.error('Error al actualizar'),
    });

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Información general"
                description="Nombre y descripción del workspace."
            />
            <Form {...settingsForm}>
                <form
                    onSubmit={settingsForm.handleSubmit((d) => updateMutation.mutate(d))}
                    className="space-y-4 max-w-lg"
                >
                    <FormField
                        control={settingsForm.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-secondary text-sm">Nombre del workspace</FormLabel>
                                <FormControl>
                                    <Input className={inputClass} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={settingsForm.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-secondary text-sm">Descripción</FormLabel>
                                <FormControl>
                                    <Input className={inputClass} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? 'Actualizando...' : 'Actualizar workspace'}
                    </Button>
                </form>
            </Form>

            {/* Cover image */}
            <div className="space-y-4 pt-2">
                <SectionHeader
                    title="Imagen del workspace"
                    description="Elige una imagen de portada para personalizar tu workspace."
                />
                <div className="flex flex-col gap-3 max-w-lg">
                    {coverPhoto ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-subtle">
                            <img
                                src={coverPhoto.url}
                                alt="Imagen del workspace"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                                <p className="text-white text-xs">
                                    Foto por {coverPhoto.authorName}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-full aspect-video rounded-lg border border-dashed border-subtle bg-surface-1 text-placeholder">
                            <div className="flex flex-col items-center gap-2">
                                <ImageIcon size={24} />
                                <span className="text-xs">Sin imagen seleccionada</span>
                            </div>
                        </div>
                    )}
                    <UnsplashPicker
                        onSelect={(photo) => setCoverPhoto(photo)}
                        trigger={
                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-subtle text-secondary hover:text-primary hover:bg-surface-2 transition-colors w-fit"
                            >
                                <ImageIcon size={13} />
                                {coverPhoto ? 'Cambiar imagen' : 'Elegir imagen'}
                            </button>
                        }
                    />
                </div>
            </div>

            {/* Danger zone */}
            <div className="space-y-4 pt-4">
                <SectionHeader
                    title="Zona de peligro"
                    description="Las acciones aquí son permanentes e irreversibles."
                />
                <div className="flex items-center justify-between p-4 rounded-lg border border-red-900/40 bg-red-950/10">
                    <div>
                        <p className="text-sm font-medium text-primary">Eliminar este workspace</p>
                        <p className="text-xs text-placeholder mt-0.5">
                            Al eliminar un workspace, todos los datos se eliminarán permanentemente.
                        </p>
                    </div>
                    <Button variant="destructive" size="sm">
                        Eliminar
                    </Button>
                </div>
            </div>
        </div>
    );
}

function useDebouncedValue<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

interface SearchResultsListProps {
    enabled: boolean;
    isFetching: boolean;
    results: WorkspaceUserSearchResult[];
    onSelect: (user: WorkspaceUserSearchResult) => void;
}

function SearchResultsList({ enabled, isFetching, results, onSelect }: SearchResultsListProps): React.ReactElement {
    if (!enabled) {
        return (
            <p className="text-xs text-placeholder px-3 py-4 text-center">
                Empieza a escribir para buscar usuarios.
            </p>
        );
    }
    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-6 text-placeholder">
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            </div>
        );
    }
    if (results.length === 0) {
        return (
            <p className="text-xs text-placeholder px-3 py-4 text-center">
                Sin resultados.
            </p>
        );
    }
    return (
        <ul className="divide-y divide-subtle">
            {results.map((u) => (
                <li key={u.userId}>
                    <button
                        type="button"
                        onClick={() => onSelect(u)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-layer-transparent-hover transition-colors text-left"
                    >
                        <div className="w-7 h-7 rounded-full bg-layer-2 flex items-center justify-center overflow-hidden shrink-0">
                            {u.avatarUrl ? (
                                <img
                                    src={u.avatarUrl}
                                    alt={u.displayName ?? u.email}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <User size={12} aria-hidden="true" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-primary truncate">
                                {u.displayName ?? u.email}
                            </p>
                            {u.displayName && (
                                <p className="text-xs text-placeholder truncate">{u.email}</p>
                            )}
                        </div>
                    </button>
                </li>
            ))}
        </ul>
    );
}

interface SearchUserPanelProps {
    workspaceSlug: string;
    onClose: () => void;
}

function SearchUserPanel({ workspaceSlug, onClose }: SearchUserPanelProps): React.ReactElement {
    const qc = useQueryClient();
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebouncedValue(query, 300);
    const [selectedUser, setSelectedUser] = useState<WorkspaceUserSearchResult | null>(null);
    const [role, setRole] = useState<WorkspaceRole>('Member');

    const enabled = debouncedQuery.trim().length >= 1;
    const { data: results = [], isFetching } = useQuery({
        queryKey: ['workspace-users-search', workspaceSlug, debouncedQuery],
        queryFn: () => workspaceRepository.searchUsers(workspaceSlug, debouncedQuery),
        enabled,
        staleTime: 30_000,
    });

    const addMutation = useMutation({
        mutationFn: () => {
            if (!selectedUser) throw new Error('No user selected');
            return workspaceRepository.addMember(workspaceSlug, {
                userId: selectedUser.userId,
                role,
            });
        },
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: workspaceMembersKey(workspaceSlug) });
            toast.success('Miembro agregado');
            onClose();
        },
        onError: (err) => {
            const msg = getErrorMessage(err) ?? 'Error al agregar miembro';
            toast.error(msg);
        },
    });

    return (
        <div className="space-y-4">
            {selectedUser ? (
                <div className="flex items-center gap-3 p-3 rounded-md border border-subtle bg-layer-1">
                    <div className="w-9 h-9 rounded-full bg-layer-2 flex items-center justify-center overflow-hidden">
                        {selectedUser.avatarUrl ? (
                            <img
                                src={selectedUser.avatarUrl}
                                alt={selectedUser.displayName ?? selectedUser.email}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <User size={14} aria-hidden="true" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-primary truncate">
                            {selectedUser.displayName ?? selectedUser.email}
                        </p>
                        {selectedUser.displayName && (
                            <p className="text-xs text-placeholder truncate">{selectedUser.email}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelectedUser(null)}
                        className="text-xs text-placeholder hover:text-primary transition-colors"
                    >
                        Cambiar
                    </button>
                </div>
            ) : (
                <>
                    <div className="relative">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder pointer-events-none"
                            aria-hidden="true"
                        />
                        <Input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar por nombre o email…"
                            className={`${inputClass} pl-9`}
                            autoFocus
                        />
                    </div>
                    <div className="min-h-[140px] max-h-[260px] overflow-y-auto border border-subtle rounded-md bg-layer-1">
                        <SearchResultsList
                            enabled={enabled}
                            isFetching={isFetching}
                            results={results}
                            onSelect={setSelectedUser}
                        />
                    </div>
                </>
            )}

            {selectedUser && (
                <div className="space-y-2">
                    <label htmlFor="search-role" className="text-sm font-medium text-secondary">
                        Rol
                    </label>
                    <SearchableSelect
                        multi={false}
                        value={role}
                        onChange={(v) => { if (v) setRole(v as WorkspaceRole); }}
                        items={ROLE_OPTIONS.map((r) => ({ id: r, label: WORKSPACE_ROLE_LABELS[r] }))}
                        placeholder="Seleccionar rol"
                        width="100%"
                        clearable={false}
                    />
                </div>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                </Button>
                <Button
                    type="button"
                    disabled={!selectedUser || addMutation.isPending}
                    onClick={() => addMutation.mutate()}
                    className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                >
                    {addMutation.isPending ? 'Agregando…' : 'Agregar al workspace'}
                </Button>
            </DialogFooter>
        </div>
    );
}

interface CreateUserPanelProps {
    workspaceSlug: string;
    onClose: () => void;
}

function CreateUserPanel({ workspaceSlug, onClose }: CreateUserPanelProps): React.ReactElement {
    const qc = useQueryClient();
    const form = useForm<CreateUserForm>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            role: 'Member',
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateUserForm) =>
            workspaceRepository.createUserAndAddMember(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: workspaceMembersKey(workspaceSlug) });
            toast.success('Usuario creado y agregado');
            onClose();
        },
        onError: (err) => {
            const msg = getErrorMessage(err) ?? 'Error al crear usuario';
            toast.error(msg);
        },
    });

    const onSubmit = (data: CreateUserForm): void => {
        createMutation.mutate(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-secondary text-sm">Email</FormLabel>
                            <FormControl>
                                <Input type="email" className={inputClass} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-secondary text-sm">Nombre</FormLabel>
                                <FormControl>
                                    <Input className={inputClass} {...field} />
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
                                <FormLabel className="text-secondary text-sm">Apellido</FormLabel>
                                <FormControl>
                                    <Input className={inputClass} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-secondary text-sm">Contraseña</FormLabel>
                            <FormControl>
                                <Input type="password" className={inputClass} {...field} />
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
                            <FormLabel className="text-secondary text-sm">Rol</FormLabel>
                            <FormControl>
                                <SearchableSelect
                                    multi={false}
                                    value={field.value}
                                    onChange={(v) => { if (v) field.onChange(v as WorkspaceRole); }}
                                    items={ROLE_OPTIONS.map((r) => ({ id: r, label: WORKSPACE_ROLE_LABELS[r] }))}
                                    placeholder="Seleccionar rol"
                                    width="100%"
                                    clearable={false}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                    >
                        {createMutation.isPending ? 'Creando…' : 'Crear y agregar'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

interface AddMemberDialogProps {
    workspaceSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function AddMemberDialog({ workspaceSlug, open, onOpenChange }: AddMemberDialogProps): React.ReactElement {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-surface-2 border-subtle max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-primary">Agregar miembro</DialogTitle>
                    <DialogDescription className="text-placeholder">
                        Busca un usuario existente o crea una cuenta nueva.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="search" className="mt-2">
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="search">Buscar usuario</TabsTrigger>
                        <TabsTrigger value="create">Crear usuario</TabsTrigger>
                    </TabsList>
                    <TabsContent value="search" className="mt-4">
                        <SearchUserPanel
                            workspaceSlug={workspaceSlug}
                            onClose={() => onOpenChange(false)}
                        />
                    </TabsContent>
                    <TabsContent value="create" className="mt-4">
                        <CreateUserPanel
                            workspaceSlug={workspaceSlug}
                            onClose={() => onOpenChange(false)}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

interface MemberRowProps {
    member: WorkspaceMember;
    workspaceSlug: string;
    workspaceOwnerId?: string;
}

function MemberRow({ member, workspaceSlug, workspaceOwnerId }: MemberRowProps): React.ReactElement {
    const qc = useQueryClient();
    const isOwner = workspaceOwnerId !== undefined && member.userId === workspaceOwnerId;

    const updateRoleMutation = useMutation({
        mutationFn: (role: WorkspaceRole) =>
            workspaceRepository.updateMemberRole(workspaceSlug, member.userId, role),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: workspaceMembersKey(workspaceSlug) });
            toast.success('Rol actualizado');
        },
        onError: (err) => {
            const msg = getErrorMessage(err) ?? 'Error al actualizar el rol';
            toast.error(msg);
            void qc.invalidateQueries({ queryKey: workspaceMembersKey(workspaceSlug) });
        },
    });

    const removeMutation = useMutation({
        mutationFn: () => workspaceRepository.removeMember(workspaceSlug, member.userId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: workspaceMembersKey(workspaceSlug) });
            toast.success('Miembro eliminado');
        },
        onError: (err) => {
            const msg = getErrorMessage(err) ?? 'Error al eliminar miembro';
            toast.error(msg);
        },
    });

    return (
        <li className="flex items-center justify-between px-4 py-3 hover:bg-layer-transparent-hover transition-colors gap-3">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-layer-2 flex items-center justify-center text-xs font-medium text-secondary overflow-hidden shrink-0">
                    {member.avatarUrl ? (
                        <img
                            src={member.avatarUrl}
                            alt={member.displayName ?? member.email}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <User size={12} aria-hidden="true" />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-primary truncate">{member.displayName ?? member.email}</p>
                    {member.displayName && (
                        <p className="text-xs text-placeholder truncate">{member.email}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {isOwner ? (
                    <>
                        <RoleBadge role={member.role} />
                        <Shield size={14} className="text-blue-400" aria-label="Owner del workspace" />
                    </>
                ) : (
                    <>
                        <SearchableSelect
                            multi={false}
                            value={member.role}
                            onChange={(v) => { if (v) updateRoleMutation.mutate(v as WorkspaceRole); }}
                            items={ROLE_OPTIONS.map((r) => ({ id: r, label: WORKSPACE_ROLE_LABELS[r] }))}
                            placeholder="Seleccionar rol"
                            width={140}
                            clearable={false}
                            disabled={updateRoleMutation.isPending}
                        />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button
                                    type="button"
                                    className="p-1 text-placeholder hover:text-red-400 transition-colors rounded"
                                    aria-label="Eliminar miembro"
                                >
                                    <UserX size={14} aria-hidden="true" />
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-surface-2 border-subtle">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-primary">
                                        ¿Eliminar miembro?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-placeholder">
                                        {member.email} perderá acceso al workspace.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-layer-2 border-subtle text-secondary">
                                        Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => removeMutation.mutate()}
                                        className="bg-destructive hover:bg-destructive/90 text-on-color"
                                    >
                                        Eliminar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )}
            </div>
        </li>
    );
}

function MembersTab({ workspaceSlug }: { workspaceSlug: string }): React.ReactElement {
    const [addOpen, setAddOpen] = useState(false);

    const { data: workspaceData } = useQuery({
        queryKey: ['workspace-detail', workspaceSlug],
        queryFn: () => workspaceRepository.getBySlug(workspaceSlug),
        enabled: !!workspaceSlug,
    });

    const { data: members = [], isLoading: loadingMembers } = useQuery({
        queryKey: workspaceMembersKey(workspaceSlug),
        queryFn: () => workspaceRepository.getMembers(workspaceSlug),
        enabled: !!workspaceSlug,
    });

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Miembros"
                description="Gestiona los miembros del workspace y sus roles."
            />

            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-secondary">
                    Miembros activos
                    <span className="ml-2 text-xs font-normal text-placeholder">({members.length})</span>
                </p>
                <Button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-1.5"
                >
                    <UserPlus size={14} aria-hidden="true" />
                    Agregar miembro
                </Button>
            </div>

            <div className="border border-subtle rounded-lg overflow-hidden">
                {loadingMembers ? (
                    <div className="p-4 space-y-3">
                        {(['sk0', 'sk1', 'sk2'] as const).map((k) => (
                            <div key={k} className="h-10 rounded animate-shimmer bg-layer-1" />
                        ))}
                    </div>
                ) : members.length === 0 ? (
                    <p className="text-xs text-placeholder px-4 py-6 text-center">
                        No hay miembros todavía.
                    </p>
                ) : (
                    <ul className="divide-y divide-subtle">
                        {members.map((m) => (
                            <MemberRow
                                key={m.userId}
                                member={m}
                                workspaceSlug={workspaceSlug}
                                workspaceOwnerId={workspaceData?.ownerId}
                            />
                        ))}
                    </ul>
                )}
            </div>

            <AddMemberDialog
                workspaceSlug={workspaceSlug}
                open={addOpen}
                onOpenChange={setAddOpen}
            />
        </div>
    );
}


const THEME_MODES = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'system', label: 'Sistema' },
] as const;

interface ColorState {
    primaryColor: string;
    textColor: string;
    backgroundColor: string;
    sidebarColor: string;
    accentColor: string;
}

const COLOR_FIELDS: { key: keyof ColorState; label: string }[] = [
    { key: 'primaryColor', label: 'Color primario' },
    { key: 'textColor', label: 'Color de texto' },
    { key: 'backgroundColor', label: 'Fondo' },
    { key: 'sidebarColor', label: 'Sidebar' },
    { key: 'accentColor', label: 'Acento' },
];

function ThemeTab({ workspaceSlug }: { workspaceSlug: string }): React.ReactElement {
    const { data: theme } = useWorkspaceTheme(workspaceSlug);
    const updateTheme = useUpdateWorkspaceTheme(workspaceSlug);

    const [mode, setMode] = useState<'light' | 'dark' | 'system'>(theme?.theme ?? 'system');

    const [colors, setColors] = useState<ColorState>({
        primaryColor: theme?.primaryColor ?? '#6366f1',
        textColor: theme?.textColor ?? '#ffffff',
        backgroundColor: theme?.backgroundColor ?? '#0d0d12',
        sidebarColor: theme?.sidebarColor ?? '#1a1a23',
        accentColor: theme?.accentColor ?? '#6366f1',
    });

    const handleSave = (): void => {
        const data: UpdateWorkspaceThemeData = {
            theme: mode,
            primaryColor: colors.primaryColor,
            textColor: colors.textColor,
            backgroundColor: colors.backgroundColor,
            sidebarColor: colors.sidebarColor,
            accentColor: colors.accentColor,
        };
        updateTheme.mutate(data);
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Tema del workspace"
                description="Personaliza los colores y el modo de apariencia del workspace."
            />

            <div className="space-y-4 max-w-lg">
                <div>
                    <p className="text-sm font-medium text-secondary mb-2">Modo</p>
                    <div className="flex gap-2">
                        {THEME_MODES.map((m) => (
                            <button
                                key={m.value}
                                type="button"
                                onClick={() => setMode(m.value)}
                                className={cn(
                                    'flex-1 py-2 rounded-md text-sm font-medium border transition-colors',
                                    mode === m.value
                                        ? 'bg-accent-primary text-on-color border-accent-primary'
                                        : 'bg-layer-1 text-secondary border-subtle hover:bg-layer-2',
                                )}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-sm font-medium text-secondary mb-3">Colores</p>
                    <div className="space-y-3">
                        {COLOR_FIELDS.map(({ key, label }) => (
                            <div key={key} className="flex items-center gap-3">
                                <label htmlFor={`color-${key}`} className="text-sm text-secondary w-36 shrink-0">
                                    {label}
                                </label>
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        id={`color-${key}`}
                                        type="color"
                                        value={colors[key] ?? '#000000'}
                                        onChange={(e) => setColors((prev) => ({ ...prev, [key]: e.target.value }))}
                                        className="w-8 h-8 rounded cursor-pointer border border-subtle bg-transparent"
                                    />
                                    <Input
                                        value={colors[key] ?? ''}
                                        onChange={(e) => setColors((prev) => ({ ...prev, [key]: e.target.value }))}
                                        className="bg-layer-1 border-subtle text-primary font-mono text-xs h-8"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                    disabled={updateTheme.isPending}
                >
                    {updateTheme.isPending ? 'Guardando...' : 'Guardar tema'}
                </Button>
            </div>
        </div>
    );
}


export const WorkspaceSettingsPage = (): React.ReactElement => {
    const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
    const location = useLocation();
    const slug = workspaceSlug ?? '';
    
    // Determine tab from URL path
    const activeTab = location.pathname.split('/').pop() ?? 'general';

    const renderContent = (): React.ReactElement => {
        switch (activeTab) {
            case 'general':
                return <GeneralTab workspaceSlug={slug} />;
            case 'members':
                return <MembersTab workspaceSlug={slug} />;
            case 'theme':
                return <ThemeTab workspaceSlug={slug} />;
            default:
                return <GeneralTab workspaceSlug={slug} />;
        }
    };

    return (
        <div className="animate-fade-in">
            {renderContent()}
        </div>
    );
};
