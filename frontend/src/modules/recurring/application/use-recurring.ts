import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { recurringRepository } from '../infrastructure/recurring-repository';
import type { CreateRecurringTemplateData, UpdateRecurringTemplateData } from '../domain/types';

const listKey = (workspaceSlug: string) => ['recurring', workspaceSlug] as const;
const detailKey = (workspaceSlug: string, id: string) => ['recurring', workspaceSlug, id] as const;
const runsKey = (workspaceSlug: string, id: string) => ['recurring-runs', workspaceSlug, id] as const;

export const useRecurringTemplates = (workspaceSlug: string) =>
    useQuery({
        queryKey: listKey(workspaceSlug),
        queryFn: () => recurringRepository.getAll(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useRecurringTemplate = (workspaceSlug: string, id: string) =>
    useQuery({
        queryKey: detailKey(workspaceSlug, id),
        queryFn: () => recurringRepository.getOne(workspaceSlug, id),
        enabled: !!workspaceSlug && !!id,
    });

export const useRecurringRuns = (workspaceSlug: string, id: string) =>
    useQuery({
        queryKey: runsKey(workspaceSlug, id),
        queryFn: () => recurringRepository.getRuns(workspaceSlug, id),
        enabled: !!workspaceSlug && !!id,
    });

export const useRecurringPreview = (workspaceSlug: string, id: string, count = 5) =>
    useQuery({
        queryKey: ['recurring-preview', workspaceSlug, id, count],
        queryFn: () => recurringRepository.preview(workspaceSlug, id, count),
        enabled: !!workspaceSlug && !!id,
    });

export const useCreateRecurringTemplate = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateRecurringTemplateData) =>
            recurringRepository.create(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            toast.success('Tarea recurrente creada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al crear la tarea recurrente'); },
    });
};

export const useUpdateRecurringTemplate = (workspaceSlug: string, id: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateRecurringTemplateData) =>
            recurringRepository.update(workspaceSlug, id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            void qc.invalidateQueries({ queryKey: detailKey(workspaceSlug, id) });
            toast.success('Tarea recurrente actualizada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al actualizar la tarea recurrente'); },
    });
};

export const useDeleteRecurringTemplate = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => recurringRepository.delete(workspaceSlug, id),
        onSuccess: (_, id) => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            qc.removeQueries({ queryKey: detailKey(workspaceSlug, id) });
            toast.success('Tarea recurrente eliminada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al eliminar la tarea recurrente'); },
    });
};

export const usePauseRecurring = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => recurringRepository.pause(workspaceSlug, id),
        onSuccess: (_, id) => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            void qc.invalidateQueries({ queryKey: detailKey(workspaceSlug, id) });
            toast.success('Tarea pausada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al pausar la tarea'); },
    });
};

export const useResumeRecurring = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => recurringRepository.resume(workspaceSlug, id),
        onSuccess: (_, id) => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            void qc.invalidateQueries({ queryKey: detailKey(workspaceSlug, id) });
            toast.success('Tarea reanudada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al reanudar la tarea'); },
    });
};

export const useSkipNextRecurring = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => recurringRepository.skipNext(workspaceSlug, id),
        onSuccess: (_, id) => {
            void qc.invalidateQueries({ queryKey: detailKey(workspaceSlug, id) });
            toast.success('Próxima ejecución omitida');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al omitir la ejecución'); },
    });
};

export const useRunNowRecurring = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => recurringRepository.runNow(workspaceSlug, id),
        onSuccess: (_, id) => {
            void qc.invalidateQueries({ queryKey: runsKey(workspaceSlug, id) });
            toast.success('Ejecución iniciada');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al ejecutar la tarea'); },
    });
};
