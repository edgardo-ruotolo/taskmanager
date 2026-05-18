import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
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
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam } from '../../application/use-teams';
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

export const TeamsPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);

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
                        <span className="w-16" />
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
                                <div className="w-16 flex items-center justify-end gap-1">
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
                                                    className="bg-destructive hover:bg-destructive/90 text-on-color"
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
        </div>
    );
};
