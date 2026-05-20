import type React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApproveIssue } from '../../application/use-approve-issue';

interface ApprovalRequiredDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceSlug: string;
    companyId: string;
    issueId: string;
    targetStateId: string;
    targetStateName: string;
    canApprove: boolean;
    onApproved?: () => void;
}

export const ApprovalRequiredDialog = ({
    open,
    onOpenChange,
    workspaceSlug,
    companyId,
    issueId,
    targetStateId,
    targetStateName,
    canApprove,
    onApproved,
}: ApprovalRequiredDialogProps): React.ReactElement => {
    const { mutate: approve, isPending } = useApproveIssue(workspaceSlug, companyId);

    const handleApprove = (): void => {
        approve(
            { issueId, targetStateId },
            {
                onSuccess: () => {
                    onApproved?.();
                    onOpenChange(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {canApprove ? 'Aprobar y mover' : 'Aprobación requerida'}
                    </DialogTitle>
                    <DialogDescription>
                        {canApprove
                            ? `Esta tarea requiere aprobación para moverse al estado "${targetStateName}". Como Administrador o Gestor puedes aprobarla.`
                            : `Esta tarea requiere aprobación de un Administrador o Gestor para moverse al estado "${targetStateName}". Solicita aprobación a un responsable.`}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    {canApprove ? (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                                Cancelar
                            </Button>
                            <Button onClick={handleApprove} disabled={isPending}>
                                {isPending ? 'Aprobando...' : 'Aprobar y mover'}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
