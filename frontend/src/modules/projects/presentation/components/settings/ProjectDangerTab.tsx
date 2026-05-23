import type React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import { useDeleteProject } from '../../../application/use-projects';
import { SectionHeader } from './SectionHeader';

interface ProjectDangerTabProps {
    workspaceSlug: string;
    projectId: string;
}

export function ProjectDangerTab({
    workspaceSlug,
    projectId,
}: ProjectDangerTabProps): React.ReactElement {
    const navigate = useNavigate();
    const { mutate: deleteProject, isPending } = useDeleteProject(workspaceSlug);

    const handleDelete = (): void => {
        deleteProject(projectId, {
            onSuccess: () => void navigate(`/${workspaceSlug}/projects`),
        });
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Zona de peligro"
                description="Las acciones aquí son permanentes e irreversibles."
            />
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-900/40 bg-red-950/10 max-w-lg">
                <div>
                    <p className="text-sm font-medium text-primary">Eliminar este proyecto</p>
                    <p className="text-xs text-placeholder mt-0.5">
                        Se eliminarán todos los issues, ciclos, módulos y datos asociados.
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isPending}>
                            Eliminar
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-surface-2 border-subtle">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-primary">
                                ¿Eliminar proyecto?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-placeholder">
                                Esta acción es irreversible. Se eliminarán todos los datos del
                                proyecto de forma permanente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-layer-2 border-subtle text-secondary hover:bg-layer-3">
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Sí, eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
