import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { teamsRepository } from '../infrastructure/teams-repository';
import type { CreateTeamData, UpdateTeamData } from '../domain/types';

const listKey = (slug: string): readonly ['teams', string] => ['teams', slug] as const;
const membersKey = (slug: string, teamId: string): readonly ['teams', string, string, 'members'] =>
    ['teams', slug, teamId, 'members'] as const;

export const useTeams = (workspaceSlug: string) =>
    useQuery({
        queryKey: listKey(workspaceSlug),
        queryFn: () => teamsRepository.getAll(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const useTeamMembers = (workspaceSlug: string, teamId: string) =>
    useQuery({
        queryKey: membersKey(workspaceSlug, teamId),
        queryFn: () => teamsRepository.getMembers(workspaceSlug, teamId),
        enabled: !!workspaceSlug && !!teamId,
    });

export const useCreateTeam = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTeamData) => teamsRepository.create(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            toast.success('Equipo creado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al crear el equipo'); },
    });
};

export const useUpdateTeam = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ teamId, data }: { teamId: string; data: UpdateTeamData }) =>
            teamsRepository.update(workspaceSlug, teamId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al actualizar el equipo'); },
    });
};

export const useDeleteTeam = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (teamId: string) => teamsRepository.delete(workspaceSlug, teamId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: listKey(workspaceSlug) });
            toast.success('Equipo eliminado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al eliminar el equipo'); },
    });
};

export const useAddTeamMember = (workspaceSlug: string, teamId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => teamsRepository.addMember(workspaceSlug, teamId, userId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: membersKey(workspaceSlug, teamId) });
            toast.success('Miembro agregado');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al agregar miembro'); },
    });
};

export const useRemoveTeamMember = (workspaceSlug: string, teamId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => teamsRepository.removeMember(workspaceSlug, teamId, userId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: membersKey(workspaceSlug, teamId) });
            toast.success('Miembro removido');
        },
        onError: (error: unknown) => { const e = error as { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? 'Error al remover miembro'); },
    });
};
