import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { intakeRepository } from '../infrastructure/intake-repository';
import type { CreateIntakeIssueData, IntakeStatus, ReviewIntakeIssueData } from '../domain/types';

const qKey = (workspaceSlug: string, companyId: string, status?: IntakeStatus) =>
    ['intake', workspaceSlug, companyId, status ?? 'all'] as const;

export const useIntake = (workspaceSlug: string, companyId: string, status?: IntakeStatus) =>
    useQuery({
        queryKey: qKey(workspaceSlug, companyId, status),
        queryFn: () => intakeRepository.getAll(workspaceSlug, companyId, status),
        enabled: !!workspaceSlug && !!companyId,
    });

export const useCreateIntake = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIntakeIssueData) =>
            intakeRepository.create(workspaceSlug, companyId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['intake', workspaceSlug, companyId] });
            toast.success('Tarea creada en la bandeja');
        },
        onError: () => toast.error('Error al crear la solicitud'),
    });
};

export const useReviewIntake = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ReviewIntakeIssueData }) =>
            intakeRepository.review(workspaceSlug, companyId, id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['intake', workspaceSlug, companyId] });
            void qc.invalidateQueries({ queryKey: ['issues', workspaceSlug, companyId] });
            void qc.invalidateQueries({ queryKey: ['workspace-activity', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Estado actualizado');
        },
        onError: () => toast.error('Error al actualizar la solicitud'),
    });
};

export const useDeleteIntake = (workspaceSlug: string, companyId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => intakeRepository.delete(workspaceSlug, companyId, id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['intake', workspaceSlug, companyId] });
            toast.success('Eliminado');
        },
        onError: () => toast.error('Error al eliminar'),
    });
};
