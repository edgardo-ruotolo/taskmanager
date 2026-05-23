import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { recurringRepository } from '../infrastructure/recurring-repository';
import type {
    CreateRecurringTemplateData,
    RecurringListParams,
    RecurringTemplate,
    UpdateRecurringTemplateData,
} from '../domain/types';

const listKey = (workspaceSlug: string, params: RecurringListParams) =>
    ['recurring', workspaceSlug, params] as const;
const detailKey = (workspaceSlug: string, id: string) =>
    ['recurring', workspaceSlug, id] as const;
const runsKey = (workspaceSlug: string, id: string) =>
    ['recurring-runs', workspaceSlug, id] as const;

const invalidateLists = (qc: ReturnType<typeof useQueryClient>, workspaceSlug: string): void => {
    void qc.invalidateQueries({ queryKey: ['recurring', workspaceSlug], exact: false });
};

export const useRecurringTemplates = (workspaceSlug: string, params: RecurringListParams = {}) =>
    useQuery({
        queryKey: listKey(workspaceSlug, params),
        queryFn: () => recurringRepository.getAll(workspaceSlug, params),
        enabled: !!workspaceSlug,
        placeholderData: (previous) => previous,
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

const extractErrorMessage = (error: unknown, fallback: string): string => {
    const e = error as { response?: { data?: { message?: string } } };
    return e?.response?.data?.message ?? fallback;
};

export const useCreateRecurringTemplate = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateRecurringTemplateData) =>
            recurringRepository.create(workspaceSlug, data),
        onSuccess: () => {
            invalidateLists(qc, workspaceSlug);
            toast.success('Tarea recurrente creada');
        },
        onError: (error: unknown) => {
            toast.error(extractErrorMessage(error, 'Error al crear la tarea recurrente'));
        },
    });
};

export const useUpdateRecurringTemplate = (workspaceSlug: string, id: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateRecurringTemplateData) =>
            recurringRepository.update(workspaceSlug, id, data),
        onSuccess: () => {
            invalidateLists(qc, workspaceSlug);
            void qc.invalidateQueries({ queryKey: detailKey(workspaceSlug, id) });
            toast.success('Tarea recurrente actualizada');
        },
        onError: (error: unknown) => {
            toast.error(extractErrorMessage(error, 'Error al actualizar la tarea recurrente'));
        },
    });
};

export const useDeleteRecurringTemplate = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => recurringRepository.delete(workspaceSlug, id),
        onSuccess: (_, id) => {
            invalidateLists(qc, workspaceSlug);
            qc.removeQueries({ queryKey: detailKey(workspaceSlug, id) });
            toast.success('Tarea recurrente eliminada');
        },
        onError: (error: unknown) => {
            toast.error(extractErrorMessage(error, 'Error al eliminar la tarea recurrente'));
        },
    });
};

export const usePauseRecurring = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => recurringRepository.pause(workspaceSlug, id),
        onSuccess: (_, id) => {
            invalidateLists(qc, workspaceSlug);
            void qc.invalidateQueries({ queryKey: detailKey(workspaceSlug, id) });
            toast.success('Tarea pausada');
        },
        onError: (error: unknown) => {
            toast.error(extractErrorMessage(error, 'Error al pausar la tarea'));
        },
    });
};

export const useResumeRecurring = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => recurringRepository.resume(workspaceSlug, id),
        onSuccess: (_, id) => {
            invalidateLists(qc, workspaceSlug);
            void qc.invalidateQueries({ queryKey: detailKey(workspaceSlug, id) });
            toast.success('Tarea reanudada');
        },
        onError: (error: unknown) => {
            toast.error(extractErrorMessage(error, 'Error al reanudar la tarea'));
        },
    });
};

export const useSkipNextRecurring = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation<RecurringTemplate, unknown, string>({
        mutationFn: (id: string) => recurringRepository.skipNext(workspaceSlug, id),
        onSuccess: (updated, id) => {
            invalidateLists(qc, workspaceSlug);
            void qc.invalidateQueries({ queryKey: detailKey(workspaceSlug, id) });
            // El backend implementa skip-next como toggle, el toast se ajusta al nuevo estado.
            toast.success(
                updated.skipNextRun
                    ? 'Próxima ejecución marcada para omitir'
                    : 'Omisión de próxima ejecución cancelada',
            );
        },
        onError: (error: unknown) => {
            toast.error(extractErrorMessage(error, 'Error al actualizar la omisión'));
        },
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
        onError: (error: unknown) => {
            toast.error(extractErrorMessage(error, 'Error al ejecutar la tarea'));
        },
    });
};

export const useDuplicateRecurring = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => recurringRepository.duplicate(workspaceSlug, id),
        onSuccess: () => {
            invalidateLists(qc, workspaceSlug);
            toast.success('Tarea recurrente duplicada');
        },
        onError: (error: unknown) => {
            toast.error(extractErrorMessage(error, 'Error al duplicar la tarea recurrente'));
        },
    });
};
