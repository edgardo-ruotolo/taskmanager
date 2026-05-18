import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminRepository } from '../infrastructure/admin-repository';
import type {
    UpdateInstanceConfigData,
    CreateAdminUserData,
    UpdateAdminUserData,
    AdminAddCompanyMemberData,
    UpdateAdminCompanyData,
} from '../domain/types';
import { STATES_KEY, STATE_GROUPS_KEY } from '@/modules/states/application/use-states';

export const adminConfigKey = ['admin', 'config'] as const;
export const adminUsersKey = (page: number) => ['admin', 'users', page] as const;
export const adminCompaniesKey = (page: number) => ['admin', 'companies', page] as const;
export const adminCompanyMembersKey = (companyId: string) => ['admin', 'company-members', companyId] as const;
export const adminStateGroupsKey = ['admin', 'state-groups'] as const;

export const useInstanceConfig = () =>
    useQuery({
        queryKey: adminConfigKey,
        queryFn: adminRepository.getConfig,
    });

export const useUpdateInstanceConfig = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateInstanceConfigData) => adminRepository.updateConfig(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: adminConfigKey });
            toast.success('Configuración guardada');
        },
        onError: () => toast.error('Error al guardar'),
    });
};

export const useAdminUsers = (page = 1) =>
    useQuery({
        queryKey: adminUsersKey(page),
        queryFn: () => adminRepository.getUsers(page),
    });

export const useCreateAdminUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAdminUserData) => adminRepository.createUser(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            toast.success('Usuario creado');
        },
        onError: () => toast.error('Error al crear usuario'),
    });
};

export const useUpdateAdminUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAdminUserData }) =>
            adminRepository.updateUser(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            void queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
            void queryClient.invalidateQueries({ queryKey: ['admin', 'company-members'] });
            void queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Usuario actualizado');
        },
        onError: () => toast.error('Error al actualizar usuario'),
    });
};

export const useDeleteAdminUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminRepository.deleteUser(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            void queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
            void queryClient.invalidateQueries({ queryKey: ['admin', 'company-members'] });
            void queryClient.invalidateQueries({ queryKey: ['notifications'] });
            void queryClient.invalidateQueries({ queryKey: ['issue-subscribers'] });
            void queryClient.invalidateQueries({ queryKey: ['comments'] });
            void queryClient.invalidateQueries({ queryKey: ['activities'] });
            toast.success('Usuario eliminado');
        },
        onError: () => toast.error('Error al eliminar usuario'),
    });
};

export const useAdminCompanies = (page = 1) =>
    useQuery({
        queryKey: adminCompaniesKey(page),
        queryFn: () => adminRepository.getCompanies(page),
    });

export const useAdminCompanyMembers = (companyId: string | null) =>
    useQuery({
        queryKey: adminCompanyMembersKey(companyId ?? ''),
        queryFn: () => {
            if (companyId === null) return Promise.resolve([]);
            return adminRepository.getCompanyMembers(companyId);
        },
        enabled: companyId !== null,
    });

export const useAddCompanyMember = (companyId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AdminAddCompanyMemberData) =>
            adminRepository.addCompanyMember(companyId, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: adminCompanyMembersKey(companyId) });
            void queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
            void queryClient.invalidateQueries({ queryKey: ['issues'] });
            void queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Miembro agregado');
        },
        onError: () => toast.error('Error al agregar miembro'),
    });
};

export const useRemoveCompanyMember = (companyId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => adminRepository.removeCompanyMember(companyId, userId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: adminCompanyMembersKey(companyId) });
            void queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
            void queryClient.invalidateQueries({ queryKey: ['issues'] });
            void queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Miembro removido');
        },
        onError: () => toast.error('Error al remover miembro'),
    });
};

export const useUpdateAdminCompany = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAdminCompanyData }) =>
            adminRepository.updateCompany(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
            void queryClient.invalidateQueries({ queryKey: ['companies'] });
            void queryClient.invalidateQueries({ queryKey: ['company'] });
            void queryClient.invalidateQueries({ queryKey: STATES_KEY });
            void queryClient.invalidateQueries({ queryKey: STATE_GROUPS_KEY });
            void queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
            void queryClient.invalidateQueries({ queryKey: ['issues'] });
            void queryClient.invalidateQueries({ queryKey: ['cycle-issues'] });
            void queryClient.invalidateQueries({ queryKey: ['module-issues'] });
            toast.success('Empresa actualizada');
        },
        onError: () => toast.error('Error al actualizar empresa'),
    });
};
