import type React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils';
import { useCompanies } from '@/modules/companies/application/use-companies';
import { CreateCompanyDialog } from '@/modules/companies/presentation/components/CreateCompanyDialog';
import type { Company } from '@/modules/companies/domain/types';

const ACCENT_COLORS = [
    'var(--brand-700)',
    'var(--green-700)',
    'var(--amber-700)',
    '#6b6298',
    'var(--neutral-1200)',
];

function getAccentColor(index: number): string {
    return ACCENT_COLORS[index % ACCENT_COLORS.length] ?? 'var(--brand-700)';
}

interface CompanyCardProps {
    company: Company;
    accentColor: string;
    onClick: () => void;
}

function CompanyCard({ company, accentColor, onClick }: CompanyCardProps): React.ReactElement {
    const initials = company.identifier.slice(0, 2).toUpperCase();

    return (
        <button
            type="button"
            onClick={onClick}
            className="group relative w-full text-left bg-white rounded-lg border border-[var(--neutral-400)] p-5 overflow-hidden hover:border-[var(--neutral-700)] transition-colors duration-150 flex flex-col gap-3"
        >
            {/* Top accent bar */}
            <span
                className="absolute top-0 left-0 w-8 h-[3px]"
                style={{ background: accentColor }}
                aria-hidden="true"
            />

            {/* Header: mark + name + identifier */}
            <div className="flex items-center gap-3 mt-1">
                <span
                    className="w-9 h-9 rounded-md flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                    style={{ background: accentColor }}
                    aria-hidden="true"
                >
                    {initials}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="text-[18px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)] truncate leading-tight">
                        {company.name}
                    </div>
                    <div className="font-mono text-[10.5px] text-[var(--neutral-600)] mt-0.5 tracking-[0.05em]">
                        /{company.identifier.toLowerCase()} · Interno
                    </div>
                </div>
            </div>

            {/* Description */}
            {company.description && (
                <p className="text-[13px] text-[var(--neutral-600)] leading-[1.55] tracking-[-0.005em] line-clamp-2">
                    {company.description}
                </p>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-5 pt-3 border-t border-[var(--neutral-400)]">
                <div>
                    <div className="font-mono text-[9.5px] text-[var(--neutral-600)] uppercase tracking-[0.1em]">Issues</div>
                    <div className="text-[16px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)] leading-tight">
                        0<span className="text-[var(--neutral-600)] font-normal">/0</span>
                    </div>
                </div>
                <div>
                    <div className="font-mono text-[9.5px] text-[var(--neutral-600)] uppercase tracking-[0.1em]">Ciclos</div>
                    <div className="text-[16px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)] leading-tight">0</div>
                </div>
                <div className="ml-auto">
                    <span className="font-mono text-[10.5px] text-[var(--brand-700)] group-hover:underline">
                        Configurar →
                    </span>
                </div>
            </div>
        </button>
    );
}

export const WorkspaceCompaniesSettingsTab = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const navigate = useNavigate();
    const { data, isLoading } = useCompanies(workspaceSlug);

    const companies = data?.items ?? [];

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-5xl px-10 py-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <Eyebrow>Tus proyectos · {isLoading ? '…' : `${companies.length} activos`}</Eyebrow>
                        <h1 className="mt-2 text-[56px] font-medium tracking-[-0.05em] leading-[0.95] text-[var(--neutral-1200)]">
                            Companies.
                        </h1>
                        <p className="mt-2 text-[14.5px] text-[var(--neutral-600)] max-w-[600px]">
                            Cada company es un proyecto con su propia jerarquía de issues, ciclos y módulos.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 shrink-0">
                        <CreateCompanyDialog
                            workspaceSlug={workspaceSlug}
                            trigger={
                                <Button className="gap-2 bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[#f0eadf]">
                                    <Plus size={14} />
                                    Nueva company
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="grid grid-cols-2 gap-4">
                        {(['sk-0', 'sk-1', 'sk-2', 'sk-3'] as const).map((k) => (
                            <div key={k} className="bg-white border border-[var(--neutral-400)] rounded-lg p-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 rounded-md bg-[var(--neutral-200)]" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-4 w-2/3 bg-[var(--neutral-200)]" />
                                        <Skeleton className="h-3 w-1/3 bg-[var(--neutral-200)]" />
                                    </div>
                                </div>
                                <Skeleton className="h-3 w-full bg-[var(--neutral-200)]" />
                                <Skeleton className="h-3 w-4/5 bg-[var(--neutral-200)]" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!isLoading && companies.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-14 h-14 rounded-lg bg-[var(--neutral-200)] flex items-center justify-center mb-4">
                            <Building2 size={24} className="text-[var(--neutral-600)]" />
                        </div>
                        <h2 className="text-[18px] font-medium text-[var(--neutral-1200)] mb-2">No hay empresas aún</h2>
                        <p className="text-[13px] text-[var(--neutral-600)] mb-6">
                            Crea la primera empresa de este workspace
                        </p>
                        <CreateCompanyDialog
                            workspaceSlug={workspaceSlug}
                            trigger={
                                <Button className={cn('gap-2 bg-[var(--neutral-1200)] hover:bg-[var(--neutral-1000)] text-[#f0eadf]')}>
                                    <Plus size={14} />
                                    Crear primera empresa
                                </Button>
                            }
                        />
                    </div>
                )}

                {/* Grid */}
                {!isLoading && companies.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        {companies.map((company, index) => (
                            <CompanyCard
                                key={company.id}
                                company={company}
                                accentColor={getAccentColor(index)}
                                onClick={() => void navigate(`/${workspaceSlug}/settings/companies/${company.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
