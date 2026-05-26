import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Building2, Users2, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { SearchableSelect } from '@/shared/components/ui/searchable-select';
import {
    useProjects,
    useUpdateProject,
    useDeleteProject,
    useUpdateProjectTeam,
} from '@/modules/projects/application/use-projects';
import { useTeams } from '@/modules/teams/application/use-teams';
import { CreateProjectDialog } from '@/modules/projects/presentation/components/CreateProjectDialog';
import type { Project } from '@/modules/projects/domain/types';

const inputClass =
    'bg-layer-1 border-subtle text-primary placeholder:text-placeholder focus:border-strong transition-colors';

const NO_TEAM_SENTINEL = '__none__';

const projectSchema = z.object({
    name: z.string().min(1, 'Requerido').max(255),
    identifier: z
        .string()
        .min(1, 'Requerido')
        .max(10)
        .regex(/^[A-Z0-9]+$/, 'Solo mayúsculas y números'),
    description: z.string().max(1000).optional(),
});

type ProjectForm = z.infer<typeof projectSchema>;

interface EditProjectDialogProps {
    project: Project | null;
    workspaceSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function EditProjectDialog({
    project,
    workspaceSlug,
    open,
    onOpenChange,
}: EditProjectDialogProps): React.ReactElement {
    const form = useForm<ProjectForm>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: '',
            identifier: '',
            description: '',
        },
    });

    useEffect(() => {
        if (project) {
            form.reset({
                name: project.name,
                identifier: project.identifier,
                description: project.description ?? '',
            });
        }
    }, [project, form]);

    const updateMutation = useUpdateProject<ProjectForm>(workspaceSlug, project?.id ?? '', {
        setError: form.setError,
    });

    const onSubmit = (data: ProjectForm): void => {
        if (!project) return;
        updateMutation.mutate(data, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-surface-2 border-subtle max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">Editar proyecto</DialogTitle>
                    <DialogDescription className="text-placeholder">
                        Actualiza el nombre, identificador y descripción del proyecto.
                    </DialogDescription>
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
                                        <Input className={inputClass} {...field} />
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
                                    <FormLabel className="text-secondary text-sm">Identificador *</FormLabel>
                                    <FormControl>
                                        <Input className={inputClass} {...field} />
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
                                        <Input className={inputClass} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                            >
                                {updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

interface ManageProjectTeamDialogProps {
    project: Project | null;
    workspaceSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function ManageProjectTeamDialog({
    project,
    workspaceSlug,
    open,
    onOpenChange,
}: ManageProjectTeamDialogProps): React.ReactElement {
    const { data: teams = [], isLoading: loadingTeams } = useTeams(workspaceSlug);
    const updateTeamMutation = useUpdateProjectTeam(workspaceSlug);

    const [selectedValue, setSelectedValue] = useState<string>(NO_TEAM_SENTINEL);

    useEffect(() => {
        setSelectedValue(project?.teamId ?? NO_TEAM_SENTINEL);
    }, [project]);

    const handleSave = (): void => {
        if (!project) return;
        const teamId = selectedValue === NO_TEAM_SENTINEL ? null : selectedValue;
        updateTeamMutation.mutate(
            { projectId: project.id, teamId },
            { onSuccess: () => onOpenChange(false) },
        );
    };

    const options = [
        { value: NO_TEAM_SENTINEL, label: 'Sin equipo' },
        ...teams.map((t) => ({ value: t.id, label: t.name })),
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-surface-2 border-subtle max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">
                        Equipo del proyecto {project?.name ?? ''}
                    </DialogTitle>
                    <DialogDescription className="text-placeholder">
                        Asigna o desasigna un equipo del workspace a este proyecto.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <label htmlFor="project-team" className="text-sm font-medium text-secondary">
                        Equipo
                    </label>
                    {loadingTeams ? (
                        <Skeleton className="h-10 w-full bg-layer-1 rounded-md" />
                    ) : teams.length === 0 ? (
                        <p className="text-xs text-placeholder">
                            No hay equipos en el workspace. Creá uno desde Configuración → Equipos.
                        </p>
                    ) : (
                        <SearchableSelect
                            multi={false}
                            value={selectedValue}
                            onChange={(v) => setSelectedValue(v ?? NO_TEAM_SENTINEL)}
                            items={options.map((o) => ({ id: o.value, label: o.label }))}
                            placeholder="Sin equipo"
                            width="100%"
                        />
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={updateTeamMutation.isPending || teams.length === 0}
                        className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                    >
                        {updateTeamMutation.isPending ? 'Guardando…' : 'Guardar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ProjectRowProps {
    project: Project;
    onEdit: (project: Project) => void;
    onManageTeam: (project: Project) => void;
    onDelete: (projectId: string) => void;
    isDeleting: boolean;
    onNavigate: (project: Project) => void;
}

function ProjectRow({
    project,
    onEdit,
    onManageTeam,
    onDelete,
    isDeleting,
    onNavigate,
}: ProjectRowProps): React.ReactElement {
    return (
        <li className="flex items-center gap-3 px-4 py-3 hover:bg-layer-transparent-hover transition-colors">
            <div className="flex-1 min-w-0">
                <button
                    type="button"
                    onClick={() => onNavigate(project)}
                    className="text-sm font-medium text-primary truncate hover:underline text-left"
                >
                    {project.name}
                </button>
                {project.description && (
                    <p className="text-xs text-placeholder truncate mt-0.5">{project.description}</p>
                )}
            </div>
            <span className="w-24 text-center text-xs font-mono text-secondary">
                {project.identifier}
            </span>
            <span className="w-32 text-center">
                {project.teamName ? (
                    <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[11px] font-medium">
                        {project.teamName}
                    </span>
                ) : (
                    <span className="text-xs text-placeholder">—</span>
                )}
            </span>
            <div className="w-28 flex items-center justify-end gap-1">
                <button
                    type="button"
                    onClick={() => onManageTeam(project)}
                    className="p-1 text-placeholder hover:text-primary transition-colors rounded"
                    aria-label={`Gestionar equipo de ${project.name}`}
                >
                    <Users2 size={13} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={() => onEdit(project)}
                    className="p-1 text-placeholder hover:text-primary transition-colors rounded"
                    aria-label={`Editar ${project.name}`}
                >
                    <Edit2 size={13} aria-hidden="true" />
                </button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button
                            type="button"
                            className="p-1 text-placeholder hover:text-red-400 transition-colors rounded"
                            aria-label={`Eliminar ${project.name}`}
                            disabled={isDeleting}
                        >
                            <Trash2 size={13} aria-hidden="true" />
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-surface-2 border-subtle">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-primary">
                                ¿Eliminar proyecto?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-placeholder">
                                El proyecto "{project.name}" será eliminado permanentemente junto con sus issues, ciclos y módulos.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-layer-2 border-subtle text-secondary">
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => onDelete(project.id)}
                                className="bg-destructive hover:bg-destructive/90 text-on-color"
                            >
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </li>
    );
}

export const WorkspaceProjectsSettingsTab = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const navigate = useNavigate();
    const { data, isLoading } = useProjects(workspaceSlug);
    const deleteProject = useDeleteProject(workspaceSlug);

    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [teamDialogProject, setTeamDialogProject] = useState<Project | null>(null);

    const projects = data?.items ?? [];

    return (
        <div className="p-6 md:p-8 w-full">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-lg font-semibold text-primary">Proyectos</h1>
                    <p className="text-sm text-placeholder mt-0.5">
                        Gestiona los proyectos del workspace.
                    </p>
                </div>
                <CreateProjectDialog
                    workspaceSlug={workspaceSlug}
                    trigger={
                        <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-1.5">
                            <Plus size={14} aria-hidden="true" />
                            Nuevo proyecto
                        </Button>
                    }
                />
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {(['sk0', 'sk1', 'sk2'] as const).map((k) => (
                        <Skeleton key={k} className="h-16 w-full bg-layer-1 rounded-lg" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border border-subtle rounded-lg bg-layer-1/20">
                    <Building2 size={40} className="text-placeholder mb-3" aria-hidden="true" />
                    <p className="text-sm font-medium text-secondary mb-1">No hay proyectos</p>
                    <p className="text-xs text-placeholder mb-4">
                        Crea el primer proyecto del workspace.
                    </p>
                    <CreateProjectDialog
                        workspaceSlug={workspaceSlug}
                        trigger={
                            <Button
                                className={cn(
                                    'bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-1.5',
                                )}
                            >
                                <Plus size={13} aria-hidden="true" />
                                Nuevo proyecto
                            </Button>
                        }
                    />
                </div>
            ) : (
                <div className="border border-subtle rounded-lg overflow-hidden">
                    <div className="flex items-center gap-3 px-4 h-9 border-b border-subtle bg-surface-1">
                        <span className="flex-1 text-xs font-medium text-placeholder">Nombre</span>
                        <span className="text-xs font-medium text-placeholder w-24 text-center">
                            Identificador
                        </span>
                        <span className="text-xs font-medium text-placeholder w-32 text-center">
                            Equipo asignado
                        </span>
                        <span className="w-28" />
                    </div>
                    <ul className="divide-y divide-subtle">
                        {projects.map((project) => (
                            <ProjectRow
                                key={project.id}
                                project={project}
                                onEdit={setEditingProject}
                                onManageTeam={setTeamDialogProject}
                                onDelete={(id) => deleteProject.mutate(id)}
                                isDeleting={deleteProject.isPending}
                                onNavigate={(p) =>
                                    void navigate(`/${workspaceSlug}/projects/${p.id}/settings`)
                                }
                            />
                        ))}
                    </ul>
                </div>
            )}

            <EditProjectDialog
                project={editingProject}
                workspaceSlug={workspaceSlug}
                open={!!editingProject}
                onOpenChange={(next) => {
                    if (!next) setEditingProject(null);
                }}
            />

            <ManageProjectTeamDialog
                project={teamDialogProject}
                workspaceSlug={workspaceSlug}
                open={!!teamDialogProject}
                onOpenChange={(next) => {
                    if (!next) setTeamDialogProject(null);
                }}
            />
        </div>
    );
};
