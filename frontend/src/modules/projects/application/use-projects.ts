import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { useServerMutation } from '@/shared/hooks/useServerMutation';
import { getErrorMessage } from '@/shared/lib/api-errors';
import { projectRepository } from '../infrastructure/project-repository';
import type {
    Project,
    CreateProjectData,
    UpdateProjectData,
    AddProjectMemberData,
    UpdateProjectMemberRoleData,
} from '../domain/types';

export const projectsKey = (workspaceSlug: string) =>
    ['projects', workspaceSlug] as const;

export const useProjects = (workspaceSlug: string) =>
    useQuery({
        queryKey: projectsKey(workspaceSlug),
        queryFn: () => projectRepository.getAll(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const projectKey = (workspaceSlug: string, projectId: string) =>
    ['project', workspaceSlug, projectId] as const;

export const useProject = (workspaceSlug: string, projectId: string) =>
    useQuery({
        queryKey: projectKey(workspaceSlug, projectId),
        queryFn: () => projectRepository.getById(workspaceSlug, projectId),
        enabled: !!workspaceSlug && !!projectId,
    });

export const projectMembersKey = (workspaceSlug: string, projectId: string) =>
    ['project-members', workspaceSlug, projectId] as const;

export const useProjectMembers = (workspaceSlug: string, projectId: string) =>
    useQuery({
        queryKey: projectMembersKey(workspaceSlug, projectId),
        queryFn: () => projectRepository.getMembers(workspaceSlug, projectId),
        enabled: !!workspaceSlug && !!projectId,
    });

export const useUpdateProject = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    projectId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<Project, UpdateProjectData, TFormValues>({
        mutationFn: (data) =>
            projectRepository.update(workspaceSlug, projectId, data),
        onSuccess: (updated) => {
            void qc.invalidateQueries({ queryKey: projectsKey(workspaceSlug) });
            qc.setQueryData(projectKey(workspaceSlug, projectId), updated);
            toast.success('Proyecto actualizada');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al actualizar la proyecto',
    });
};

export const useDeleteProject = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (projectId: string) =>
            projectRepository.delete(workspaceSlug, projectId),
        onSuccess: (_, projectId) => {
            void qc.invalidateQueries({ queryKey: projectsKey(workspaceSlug) });
            qc.removeQueries({ queryKey: projectKey(workspaceSlug, projectId) });
            void qc.invalidateQueries({ queryKey: ['issues', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['cycles', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['modules', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['estimates', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['states', 'project', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['intake', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['admin', 'projects'] });
            void qc.invalidateQueries({ queryKey: ['admin', 'project-members', projectId] });
            void qc.invalidateQueries({ queryKey: ['workspace-members', workspaceSlug] });
            toast.success('Proyecto eliminada');
        },
        onError: () => toast.error('Error al eliminar la proyecto'),
    });
};

export const useCreateProject = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<Project, CreateProjectData, TFormValues>({
        mutationFn: (data) =>
            projectRepository.create(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: projectsKey(workspaceSlug) });
            toast.success('Proyecto creada');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al crear la proyecto',
    });
};

export const useAddProjectMember = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: AddProjectMemberData) =>
            projectRepository.addMember(workspaceSlug, projectId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: projectMembersKey(workspaceSlug, projectId) });
            toast.success('Miembro agregado');
        },
        onError: (error: unknown) => {
            const e = error as { response?: { data?: { message?: string; error?: string } } };
            toast.error(
                e?.response?.data?.message ?? e?.response?.data?.error ?? 'Error al agregar miembro',
            );
        },
    });
};

export const useRemoveProjectMember = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) =>
            projectRepository.removeMember(workspaceSlug, projectId, userId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: projectMembersKey(workspaceSlug, projectId) });
            toast.success('Miembro removido');
        },
        onError: (error: unknown) => {
            const e = error as { response?: { data?: { message?: string; error?: string } } };
            toast.error(
                e?.response?.data?.message ?? e?.response?.data?.error ?? 'Error al remover miembro',
            );
        },
    });
};

export const useUpdateProjectTeam = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, teamId }: { projectId: string; teamId: string | null }) =>
            projectRepository.updateTeam(workspaceSlug, projectId, teamId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: projectsKey(workspaceSlug) });
            toast.success('Equipo del proyecto actualizado');
        },
        onError: (err) => {
            const msg = getErrorMessage(err) ?? 'Error al actualizar el equipo';
            toast.error(msg);
        },
    });
};

export const useUpdateProjectMemberRole = (workspaceSlug: string, projectId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: UpdateProjectMemberRoleData }) =>
            projectRepository.updateMemberRole(workspaceSlug, projectId, userId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: projectMembersKey(workspaceSlug, projectId) });
            toast.success('Rol actualizado');
        },
        onError: (error: unknown) => {
            const e = error as { response?: { data?: { message?: string; error?: string } } };
            toast.error(
                e?.response?.data?.message ?? e?.response?.data?.error ?? 'Error al actualizar rol',
            );
        },
    });
};
