import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { useServerMutation } from '@/shared/hooks/useServerMutation';
import { companyRepository } from '../infrastructure/company-repository';
import type { Company, CreateCompanyData, UpdateCompanyData } from '../domain/types';

export const companiesKey = (workspaceSlug: string) =>
    ['companies', workspaceSlug] as const;

export const useCompanies = (workspaceSlug: string) =>
    useQuery({
        queryKey: companiesKey(workspaceSlug),
        queryFn: () => companyRepository.getAll(workspaceSlug),
        enabled: !!workspaceSlug,
    });

export const companyKey = (workspaceSlug: string, companyId: string) =>
    ['company', workspaceSlug, companyId] as const;

export const useCompany = (workspaceSlug: string, companyId: string) =>
    useQuery({
        queryKey: companyKey(workspaceSlug, companyId),
        queryFn: () => companyRepository.getById(workspaceSlug, companyId),
        enabled: !!workspaceSlug && !!companyId,
    });

export const useUpdateCompany = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    companyId: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<Company, UpdateCompanyData, TFormValues>({
        mutationFn: (data) =>
            companyRepository.update(workspaceSlug, companyId, data),
        onSuccess: (updated) => {
            void qc.invalidateQueries({ queryKey: companiesKey(workspaceSlug) });
            qc.setQueryData(companyKey(workspaceSlug, companyId), updated);
            toast.success('Empresa actualizada');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al actualizar la empresa',
    });
};

export const useDeleteCompany = (workspaceSlug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (companyId: string) =>
            companyRepository.delete(workspaceSlug, companyId),
        onSuccess: (_, companyId) => {
            void qc.invalidateQueries({ queryKey: companiesKey(workspaceSlug) });
            qc.removeQueries({ queryKey: companyKey(workspaceSlug, companyId) });
            void qc.invalidateQueries({ queryKey: ['issues', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['cycles', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['modules', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['estimates', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['states', 'company', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['intake', workspaceSlug] });
            void qc.invalidateQueries({ queryKey: ['admin', 'companies'] });
            void qc.invalidateQueries({ queryKey: ['admin', 'company-members', companyId] });
            void qc.invalidateQueries({ queryKey: ['workspace-members', workspaceSlug] });
            toast.success('Empresa eliminada');
        },
        onError: () => toast.error('Error al eliminar la empresa'),
    });
};

export const useCreateCompany = <TFormValues extends FieldValues = FieldValues>(
    workspaceSlug: string,
    options?: { setError?: UseFormSetError<TFormValues> },
) => {
    const qc = useQueryClient();
    return useServerMutation<Company, CreateCompanyData, TFormValues>({
        mutationFn: (data) =>
            companyRepository.create(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: companiesKey(workspaceSlug) });
            toast.success('Empresa creada');
        },
        setError: options?.setError,
        fallbackMessage: 'Error al crear la empresa',
    });
};
