import type React from 'react';
import { useState } from 'react';
import { MoreHorizontal, Pencil, Copy, ExternalLink, Archive, Trash2, CopyPlus } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import type { Issue } from '../../domain/types';
import { useDeleteIssue, useArchiveIssue, useDuplicateIssue } from '../../application/use-issues';
import { useProject } from '@/modules/projects/application/use-projects';
import { getProjectFeatures } from '@/modules/projects/application/use-project-features';

interface IssueActionsMenuProps {
    issue: Issue;
    workspaceSlug: string;
    projectId: string;
    onEdit: () => void;
}

export const IssueActionsMenu = ({ issue, workspaceSlug, projectId, onEdit }: IssueActionsMenuProps): React.ReactElement => {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const { data: project } = useProject(workspaceSlug, projectId);
    const features = getProjectFeatures(project);

    const { mutate: deleteIssue, isPending: isDeleting } = useDeleteIssue(workspaceSlug, projectId);
    const { mutate: archiveIssue, isPending: isArchiving } = useArchiveIssue(workspaceSlug, projectId);
    const { mutate: duplicateIssue, isPending: isDuplicating } = useDuplicateIssue(workspaceSlug, projectId);

    const issueUrl = `${window.location.origin}/${workspaceSlug}/issues/${issue.id}`;

    const handleCopyLink = (e: React.MouseEvent): void => {
        e.stopPropagation();
        void navigator.clipboard.writeText(issueUrl);
        toast.success('Enlace copiado');
        setDropdownOpen(false);
    };

    const handleOpenInTab = (e: React.MouseEvent): void => {
        e.stopPropagation();
        window.open(issueUrl, '_blank', 'noopener,noreferrer');
        setDropdownOpen(false);
    };

    const handleEdit = (e: React.MouseEvent): void => {
        e.stopPropagation();
        onEdit();
        setDropdownOpen(false);
    };

    const handleDuplicate = (e: React.MouseEvent): void => {
        e.stopPropagation();
        duplicateIssue(issue.id);
        setDropdownOpen(false);
    };

    const handleArchive = (e: React.MouseEvent): void => {
        e.stopPropagation();
        archiveIssue(issue.id);
        setDropdownOpen(false);
    };

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Más opciones"
                        className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-7 sm:min-w-7 p-1.5 rounded-md text-placeholder hover:text-secondary hover:bg-layer-2 transition-colors"
                    >
                        <MoreHorizontal size={14} aria-hidden="true" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={4} className="w-48 bg-surface-1 border-subtle text-primary" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={handleEdit} className="gap-2 cursor-pointer hover:bg-[var(--neutral-200)] hover:text-primary focus:bg-[var(--neutral-200)] focus:text-primary">
                        <Pencil size={13} />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating} className="gap-2 cursor-pointer hover:bg-[var(--neutral-200)] hover:text-primary focus:bg-[var(--neutral-200)] focus:text-primary">
                        <CopyPlus size={13} />
                        Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer hover:bg-[var(--neutral-200)] hover:text-primary focus:bg-[var(--neutral-200)] focus:text-primary">
                        <Copy size={13} />
                        Copiar enlace
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleOpenInTab} className="gap-2 cursor-pointer hover:bg-[var(--neutral-200)] hover:text-primary focus:bg-[var(--neutral-200)] focus:text-primary">
                        <ExternalLink size={13} />
                        Abrir en nueva pestaña
                    </DropdownMenuItem>
                    {features.archivesEnabled && (
                    <DropdownMenuItem onClick={handleArchive} disabled={isArchiving} className="gap-2 cursor-pointer hover:bg-[var(--neutral-200)] hover:text-primary focus:bg-[var(--neutral-200)] focus:text-primary">
                        <Archive size={13} />
                        Archivar
                    </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-subtle" />
                    <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); setDropdownOpen(false); setDeleteOpen(true); }}
                        className="gap-2 cursor-pointer text-red-600 hover:bg-red-500/10 hover:text-red-600 focus:bg-red-500/10 focus:text-red-600"
                    >
                        <Trash2 size={13} />
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="bg-surface-1 border-subtle text-primary" onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
                        <AlertDialogDescription className="text-secondary">
                            Esta acción no se puede deshacer. La tarea será eliminada permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="text-secondary hover:text-primary">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.stopPropagation(); deleteIssue(issue.id); }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
