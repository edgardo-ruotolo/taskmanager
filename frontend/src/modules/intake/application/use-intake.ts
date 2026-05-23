import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { intakeRepository } from '../infrastructure/intake-repository';
import type { CreateIntakeIssueData, IntakeStatus, ReviewIntakeIssueData } from '../domain/types';

const qKey = (workspaceSlug: string, projectId: string, status?: IntakeStatus) =>
    ['intake', workspaceSlug, projectId, status ?? 'all'] as const;

export const useIntake = (workspaceSlug: string, projectId: string, status?: IntakeStatus) =>
    useQuery({
        queryKey: qKey(workspaceSlug, projectId, status),
        queryFn: () => intakeRepository.getAll(workspaceSlug, projectId, status),
        enabled: !!workspaceSlug && !!projectId,
        // Intake is a triage queue — always show latest pending count.
        staleTime: 0,
        refetchOnWindowFocus: true,
    });

export const useCreateIntake = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIntakeIssueData) =>
            intakeRepository.create(workspaceSlug, projectId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['intake', workspaceSlug, projectId] });
            toast.success('Tarea creada en la bandeja');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al crear la solicitud'); },
    });
};

export const useReviewIntake = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ReviewIntakeIssueData }) =>
            intakeRepository.review(workspaceSlug, projectId, id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['intake', workspaceSlug, projectId] });
            void qc.invalidateQueries({ queryKey: ['issues', workspaceSlug, projectId] });
            void qc.invalidateQueries({ queryKey: ['workspace-activity', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Estado actualizado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al actualizar la solicitud'); },
    });
};

export const useDeleteIntake = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => intakeRepository.delete(workspaceSlug, projectId, id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['intake', workspaceSlug, projectId] });
            toast.success('Eliminado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al eliminar'); },
    });
};
