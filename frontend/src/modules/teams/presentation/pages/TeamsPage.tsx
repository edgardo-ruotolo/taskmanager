import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users, Plus, Trash2, Edit2, UserX, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/shared/lib/api-errors';
import { useWorkspaceMembers } from '@/modules/workspaces/application/use-workspaces';
import { WORKSPACE_ROLE_LABELS } from '@/modules/workspaces/domain/types';
import type { WorkspaceRole } from '@/modules/workspaces/domain/types';
import {
    useTeams,
    useCreateTeam,
    useUpdateTeam,
    useDeleteTeam,
    useTeamMembers,
    useRemoveTeamMember,
} from '../../application/use-teams';
import { teamsRepository } from '../../infrastructure/teams-repository';
import type { Team, CreateTeamData, UpdateTeamData } from '../../domain/types';

const teamSchema = z.object({
    name: z.string().min(1, 'Requerido').max(255),
    description: z.string().max(1000).optional(),
    identifier: z.string().max(10).optional(),
});

type TeamForm = z.infer<typeof teamSchema>;

const inputClass =
    'bg-layer-1 border-subtle text-primary placeholder:text-placeholder focus:border-strong transition-colors';

interface TeamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceSlug: string;
    editingTeam: Team | null;
}

function TeamDialog({ open, onOpenChange, workspaceSlug, editingTeam }: TeamDialogProps): React.ReactElement {
    const createTeam = useCreateTeam(workspaceSlug);
    const updateTeam = useUpdateTeam(workspaceSlug);

    const form = useForm<TeamForm>({
        resolver: zodResolver(teamSchema),
        values: {
            name: editingTeam?.name ?? '',
            description: editingTeam?.description ?? '',
            identifier: editingTeam?.identifier ?? '',
        },
    });

    const onSubmit = (data: TeamForm): void => {
        if (editingTeam) {
            const updateData: UpdateTeamData = {
                name: data.name,
                description: data.description,
                identifier: data.identifier,
            };
            updateTeam.mutate(
                { teamId: editingTeam.id, data: updateData },
                { onSuccess: () => { onOpenChange(false); form.reset(); } },
            );
        } else {
            const createData: CreateTeamData = {
                name: data.name,
                description: data.description,
                identifier: data.identifier,
            };
            createTeam.mutate(createData, {
                onSuccess: () => { onOpenChange(false); form.reset(); },
            });
        }
    };

    const isPending = createTeam.isPending || updateTeam.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-surface-2 border-subtle max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">
                        {editingTeam ? 'Editar equipo' : 'Nuevo equipo'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-sm">Nombre *</FormLabel>
                                    <FormControl>
                                        <Input className={inputClass} placeholder="Nombre del equipo" {...field} />
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
                                    <FormLabel className="text-secondary text-sm">Descripción</FormLabel>
                                    <FormControl>
                                        <Input className={inputClass} placeholder="Descripción opcional" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="identifier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-sm">Identificador</FormLabel>
                                    <FormControl>
                                        <Input className={inputClass} placeholder="Ej: DEV" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-secondary"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                                disabled={isPending}
                            >
                                {isPending ? 'Guardando...' : (editingTeam ? 'Guardar cambios' : 'Crear equipo')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

const ROLE_BADGE_CLASSES: Record<WorkspaceRole, string> = {
    Admin: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    Lead: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    Member: 'bg-surface-1/50 text-secondary border border-subtle',
};

function MiniRoleBadge({ role }: { role: WorkspaceRole }): React.ReactElement {
    return (
        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', ROLE_BADGE_CLASSES[role])}>
            {WORKSPACE_ROLE_LABELS[role]}
        </span>
    );
}

interface ManageTeamMembersDialogProps {
    team: Team | null;
    workspaceSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function ManageTeamMembersDialog({
    team,
    workspaceSlug,
    open,
    onOpenChange,
}: ManageTeamMembersDialogProps): React.ReactElement {
    const qc = useQueryClient();
    const teamId = team?.id ?? '';

    const { data: teamMembers = [], isLoading: loadingTeamMembers } = useTeamMembers(workspaceSlug, teamId);
    const { data: workspaceMembers = [], isLoading: loadingWorkspaceMembers } = useWorkspaceMembers(workspaceSlug);

    const removeMember = useRemoveTeamMember(workspaceSlug, teamId);

    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkAdding, setBulkAdding] = useState(false);

    const teamMemberIds = new Set(teamMembers.map((m) => m.userId));
    const candidates = workspaceMembers.filter((m) => !teamMemberIds.has(m.userId));

    const toggleSelected = (userId: string): void => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    const handleAddSelected = async (): Promise<void> => {
        if (!team || selected.size === 0) return;
        setBulkAdding(true);
        const ids = [...selected];
        const results = await Promise.allSettled(
            ids.map((uid) => teamsRepository.addMember(workspaceSlug, team.id, uid)),
        );
        const success = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.length - success;

        void qc.invalidateQueries({ queryKey: ['teams', workspaceSlug, team.id, 'members'] });
        void qc.invalidateQueries({ queryKey: ['teams', workspaceSlug] });

        if (success > 0 && failed === 0) {
            toast.success(`${success} miembro(s) agregado(s)`);
        } else if (success > 0 && failed > 0) {
            toast.warning(`${success} agregado(s), ${failed} con error`);
        } else {
            const firstError = results.find((r) => r.status === 'rejected');
            const msg = firstError && firstError.status === 'rejected'
                ? getErrorMessage(firstError.reason) ?? 'Error al agregar miembros'
                : 'Error al agregar miembros';
            toast.error(msg);
        }
        setSelected(new Set());
        setBulkAdding(false);
    };

    const handleClose = (next: boolean): void => {
        if (!next) {
            setSelected(new Set());
        }
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-surface-2 border-subtle max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-primary">
                        Miembros de {team?.name ?? ''}
                    </DialogTitle>
                    <DialogDescription className="text-placeholder">
                        Asigna miembros del workspace a este equipo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Section A: current team members */}
                    <div>
                        <p className="text-sm font-medium text-secondary mb-3">
                            Miembros del equipo
                            <span className="ml-2 text-xs font-normal text-placeholder">
                                ({teamMembers.length})
                            </span>
                        </p>
                        <div className="border border-subtle rounded-md max-h-[200px] overflow-y-auto">
                            {loadingTeamMembers ? (
                                <div className="p-3 space-y-2">
                                    {(['sk0', 'sk1', 'sk2'] as const).map((k) => (
                                        <Skeleton key={k} className="h-9 w-full bg-layer-1 rounded" />
                                    ))}
                                </div>
                            ) : teamMembers.length === 0 ? (
                                <p className="text-xs text-placeholder px-3 py-6 text-center">
                                    Aún no hay miembros en este equipo.
                                </p>
                            ) : (
                                <ul className="divide-y divide-subtle">
                                    {teamMembers.map((m) => (
                                        <li
                                            key={m.userId}
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-layer-transparent-hover transition-colors"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-layer-2 flex items-center justify-center text-xs font-medium text-secondary overflow-hidden shrink-0">
                                                <User size={12} aria-hidden="true" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-primary truncate">
                                                    {m.userName || m.userEmail}
                                                </p>
                                                {m.userName && (
                                                    <p className="text-xs text-placeholder truncate">
                                                        {m.userEmail}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeMember.mutate(m.userId)}
                                                disabled={removeMember.isPending}
                                                className="p-1 text-placeholder hover:text-red-400 transition-colors rounded disabled:opacity-40"
                                                aria-label={`Quitar ${m.userName || m.userEmail} del equipo`}
                                            >
                                                <UserX size={14} aria-hidden="true" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-subtle" />

                    {/* Section B: candidates from workspace */}
                    <div>
                        <p className="text-sm font-medium text-secondary mb-3">
                            Disponibles del workspace
                            <span className="ml-2 text-xs font-normal text-placeholder">
                                ({candidates.length})
                            </span>
                        </p>
                        <div className="border border-subtle rounded-md max-h-[260px] overflow-y-auto">
                            {loadingWorkspaceMembers ? (
                                <div className="p-3 space-y-2">
                                    {(['sk0', 'sk1', 'sk2'] as const).map((k) => (
                                        <Skeleton key={k} className="h-9 w-full bg-layer-1 rounded" />
                                    ))}
                                </div>
                            ) : candidates.length === 0 ? (
                                <p className="text-xs text-placeholder px-3 py-6 text-center">
                                    Todos los miembros del workspace ya están en este equipo.
                                </p>
                            ) : (
                                <ul className="divide-y divide-subtle">
                                    {candidates.map((m) => {
                                        const checked = selected.has(m.userId);
                                        return (
                                            <li key={m.userId}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSelected(m.userId)}
                                                    className={cn(
                                                        'w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-layer-transparent-hover transition-colors cursor-pointer',
                                                        checked && 'bg-layer-transparent-hover',
                                                    )}
                                                >
                                                    <Checkbox
                                                        checked={checked}
                                                        onCheckedChange={() => toggleSelected(m.userId)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        aria-label={`Seleccionar ${m.displayName ?? m.email}`}
                                                    />
                                                    <div className="w-7 h-7 rounded-full bg-layer-2 flex items-center justify-center text-xs font-medium text-secondary overflow-hidden shrink-0">
                                                        {m.avatarUrl ? (
                                                            <img
                                                                src={m.avatarUrl}
                                                                alt={m.displayName ?? m.email}
                                                                className="w-full h-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <User size={12} aria-hidden="true" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-primary truncate">
                                                            {m.displayName ?? m.email}
                                                        </p>
                                                        {m.displayName && (
                                                            <p className="text-xs text-placeholder truncate">
                                                                {m.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <MiniRoleBadge role={m.role} />
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleClose(false)}
                    >
                        Cerrar
                    </Button>
                    <Button
                        type="button"
                        onClick={() => { void handleAddSelected(); }}
                        disabled={selected.size === 0 || bulkAdding}
                        className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                    >
                        {bulkAdding ? 'Agregando…' : `Agregar seleccionados (${selected.size})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export const TeamsPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [manageMembersTeam, setManageMembersTeam] = useState<Team | null>(null);

    const { data: teams = [], isLoading } = useTeams(workspaceSlug);
    const deleteTeam = useDeleteTeam(workspaceSlug);

    const openCreate = (): void => {
        setEditingTeam(null);
        setDialogOpen(true);
    };

    const openEdit = (team: Team): void => {
        setEditingTeam(team);
        setDialogOpen(true);
    };

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-semibold text-primary">Equipos</h1>
                    <p className="text-sm text-placeholder mt-0.5">
                        Gestiona los equipos del workspace.
                    </p>
                </div>
                <Button
                    onClick={openCreate}
                    className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-1.5"
                >
                    <Plus size={14} aria-hidden="true" />
                    Nuevo equipo
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {(['sk0', 'sk1', 'sk2'] as const).map((k) => (
                        <Skeleton key={k} className="h-16 w-full bg-layer-1 rounded-lg" />
                    ))}
                </div>
            ) : teams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border border-subtle rounded-lg bg-layer-1/20">
                    <Users size={40} className="text-placeholder mb-3" aria-hidden="true" />
                    <p className="text-sm font-medium text-secondary mb-1">No hay equipos</p>
                    <p className="text-xs text-placeholder mb-4">
                        Crea el primer equipo para organizar a los miembros del workspace.
                    </p>
                    <Button
                        onClick={openCreate}
                        className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-1.5"
                    >
                        <Plus size={13} aria-hidden="true" />
                        Nuevo equipo
                    </Button>
                </div>
            ) : (
                <div className="border border-subtle rounded-lg overflow-hidden">
                    <div className="flex items-center gap-3 px-4 h-9 border-b border-subtle bg-surface-1">
                        <span className="flex-1 text-xs font-medium text-placeholder">Nombre</span>
                        <span className="text-xs font-medium text-placeholder w-24 text-center">Identificador</span>
                        <span className="text-xs font-medium text-placeholder w-20 text-center">Miembros</span>
                        <span className="w-24" />
                    </div>
                    <ul className="divide-y divide-subtle">
                        {teams.map((team) => (
                            <li
                                key={team.id}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-layer-transparent-hover transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-primary truncate">{team.name}</p>
                                    {team.description && (
                                        <p className="text-xs text-placeholder truncate mt-0.5">{team.description}</p>
                                    )}
                                </div>
                                <span className="w-24 text-center text-xs font-mono text-secondary">
                                    {team.identifier ?? '—'}
                                </span>
                                <span className="w-20 text-center text-xs text-secondary">
                                    {team.memberCount}
                                </span>
                                <div className="w-24 flex items-center justify-end gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setManageMembersTeam(team)}
                                        className="p-1 text-placeholder hover:text-primary transition-colors rounded"
                                        aria-label={`Gestionar miembros de ${team.name}`}
                                    >
                                        <Users size={13} aria-hidden="true" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openEdit(team)}
                                        className="p-1 text-placeholder hover:text-primary transition-colors rounded"
                                        aria-label={`Editar ${team.name}`}
                                    >
                                        <Edit2 size={13} aria-hidden="true" />
                                    </button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                type="button"
                                                className="p-1 text-placeholder hover:text-red-400 transition-colors rounded"
                                                aria-label={`Eliminar ${team.name}`}
                                            >
                                                <Trash2 size={13} aria-hidden="true" />
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-surface-2 border-subtle">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-primary">
                                                    ¿Eliminar equipo?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription className="text-placeholder">
                                                    El equipo "{team.name}" será eliminado permanentemente.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="bg-layer-2 border-subtle text-secondary">
                                                    Cancelar
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => deleteTeam.mutate(team.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                    Eliminar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <TeamDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                workspaceSlug={workspaceSlug}
                editingTeam={editingTeam}
            />

            <ManageTeamMembersDialog
                team={manageMembersTeam}
                workspaceSlug={workspaceSlug}
                open={!!manageMembersTeam}
                onOpenChange={(next) => {
                    if (!next) setManageMembersTeam(null);
                }}
            />
        </div>
    );
};
