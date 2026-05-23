import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stateRepository } from '../infrastructure/state-repository';
import type { CreateStateData, UpdateStateData, CreateStateGroupData, UpdateStateGroupData } from '../domain/types';

export const STATES_KEY = ['states'] as const;
export const STATE_GROUPS_KEY = ['state-groups'] as const;
export const projectStatesKey = (workspaceSlug: string, projectId: string) =>
    [...STATES_KEY, 'project', workspaceSlug, projectId] as const;

export const useStates = (stateGroupId?: string) =>
    useQuery({
        queryKey: stateGroupId ? [...STATES_KEY, stateGroupId] : STATES_KEY,
        queryFn: () => stateRepository.getAll(stateGroupId),
    });

export const useProjectStates = (workspaceSlug: string, projectId: string) =>
    useQuery({
        queryKey: [...STATES_KEY, 'project', workspaceSlug, projectId],
        queryFn: () => stateRepository.getProjectStates(workspaceSlug, projectId),
        enabled: !!workspaceSlug && !!projectId,
    });

export const useStateGroups = () =>
    useQuery({
        queryKey: STATE_GROUPS_KEY,
        queryFn: () => stateRepository.getAllGroups(),
    });

export const useCreateState = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateStateData) => stateRepository.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STATES_KEY });
            void queryClient.invalidateQueries({ queryKey: STATE_GROUPS_KEY });
        },
    });
};

export const useUpdateState = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateStateData }) =>
            stateRepository.update(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STATES_KEY });
            void queryClient.invalidateQueries({ queryKey: STATE_GROUPS_KEY });
            void queryClient.invalidateQueries({ queryKey: ['issues'] });
            void queryClient.invalidateQueries({ queryKey: ['cycle-issues'] });
            void queryClient.invalidateQueries({ queryKey: ['module-issues'] });
            void queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] });
        },
    });
};

export const useDeleteState = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => stateRepository.remove(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STATES_KEY });
            void queryClient.invalidateQueries({ queryKey: STATE_GROUPS_KEY });
            void queryClient.invalidateQueries({ queryKey: ['issues'] });
            void queryClient.invalidateQueries({ queryKey: ['cycle-issues'] });
            void queryClient.invalidateQueries({ queryKey: ['module-issues'] });
            void queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] });
        },
    });
};

export const useCreateStateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateStateGroupData) => stateRepository.createGroup(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STATE_GROUPS_KEY });
            void queryClient.invalidateQueries({ queryKey: STATES_KEY });
        },
    });
};

export const useUpdateStateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateStateGroupData }) =>
            stateRepository.updateGroup(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STATE_GROUPS_KEY });
            void queryClient.invalidateQueries({ queryKey: STATES_KEY });
        },
    });
};

export const useDeleteStateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => stateRepository.deleteGroup(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STATE_GROUPS_KEY });
            void queryClient.invalidateQueries({ queryKey: STATES_KEY });
        },
    });
};
