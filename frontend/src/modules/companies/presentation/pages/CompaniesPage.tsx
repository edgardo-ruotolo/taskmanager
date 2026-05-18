import type React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanies } from '../../application/use-companies';
import { CreateCompanyDialog } from '../components/CreateCompanyDialog';

export const CompaniesPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const navigate = useNavigate();
    const { data, isLoading } = useCompanies(workspaceSlug);

    const companies = data?.items ?? [];

    return (
        <div className="p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-xs text-placeholder uppercase tracking-wider mb-1">{workspaceSlug}</p>
                        <h1 className="text-2xl font-bold text-primary">Empresas</h1>
                    </div>
                    <CreateCompanyDialog
                        workspaceSlug={workspaceSlug}
                        trigger={
                            <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                <Plus size={16} />
                                Nueva Empresa
                            </Button>
                        }
                    />
                </div>

                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                            <div key={k} className="bg-surface-1/50 border border-subtle rounded-lg p-5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-12 bg-layer-1 rounded-full" />
                                    <Skeleton className="h-5 w-2/3 bg-layer-1" />
                                </div>
                                <Skeleton className="h-4 w-full bg-layer-1" />
                                <Skeleton className="h-8 w-24 bg-layer-1" />
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && companies.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Building2 size={48} className="text-placeholder mb-4" />
                        <h2 className="text-lg font-medium text-secondary mb-2">No hay empresas aún</h2>
                        <p className="text-sm text-placeholder mb-6">
                            Crea la primera empresa de este workspace
                        </p>
                        <CreateCompanyDialog
                            workspaceSlug={workspaceSlug}
                            trigger={
                                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                    <Plus size={16} />
                                    Crear primera empresa
                                </Button>
                            }
                        />
                    </div>
                )}

                {!isLoading && companies.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {companies.map((company) => (
                            <div
                                key={company.id}
                                className="bg-surface-1/50 border border-subtle rounded-lg p-5 hover:border-strong hover:scale-[1.01] transition-all duration-150 flex flex-col gap-3"
                            >
                                <div className="flex items-start gap-3 flex-1">
                                    <Badge
                                        variant="secondary"
                                        className="bg-layer-2 text-secondary font-mono text-xs shrink-0"
                                    >
                                        {company.identifier}
                                    </Badge>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-primary text-sm truncate">
                                            {company.name}
                                        </h3>
                                        {company.description && (
                                            <p className="text-xs text-tertiary mt-1 line-clamp-2">
                                                {company.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-subtle">
                                    <Button
                                        size="sm"
                                        onClick={() => void navigate(`/${workspaceSlug}/companies/${company.id}/issues`)}
                                        className="bg-layer-2 hover:bg-layer-3 text-primary text-xs h-7 px-3 w-full"
                                    >
                                        Ver tareas
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
