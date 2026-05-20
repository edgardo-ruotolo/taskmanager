import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Lock,
    CircleDot,
    RefreshCw,
    Layers,
    LayoutGrid,
    FileText,
    Inbox,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompany, useUpdateCompany, useDeleteCompany } from '@/modules/companies/application/use-companies';

const updateSchema = z.object({
    name: z.string().min(1, 'Requerido').max(255),
    description: z.string().max(1000).optional(),
});
type UpdateForm = z.infer<typeof updateSchema>;

const inputClass =
    'bg-layer-1 border-subtle text-primary placeholder:text-placeholder focus:border-strong transition-colors';

const FEATURES = [
    { id: 'issues', label: 'Tareas', description: 'Gestión de tareas y bugs', icon: CircleDot },
    { id: 'cycles', label: 'Ciclos', description: 'Sprints y ciclos de trabajo', icon: RefreshCw },
    { id: 'modules', label: 'Módulos', description: 'Agrupación temática de tareas', icon: Layers },
    { id: 'views', label: 'Vistas', description: 'Vistas personalizadas y filtros guardados', icon: LayoutGrid },
    { id: 'pages', label: 'Páginas', description: 'Notas y documentación interna', icon: FileText },
    { id: 'intake', label: 'Solicitudes', description: 'Buzón de solicitudes externas', icon: Inbox },
] as const;

type FeatureId = (typeof FEATURES)[number]['id'];

function SectionHeader({ title, description }: { title: string; description: string }): React.ReactElement {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-semibold text-primary">{title}</h3>
                <p className="text-sm text-tertiary mt-0.5">{description}</p>
            </div>
            <Separator className="bg-subtle" />
        </div>
    );
}

interface GeneralTabProps {
    workspaceSlug: string;
    companyId: string;
}

function GeneralTab({ workspaceSlug, companyId }: GeneralTabProps): React.ReactElement {
    const { data: company, isLoading } = useCompany(workspaceSlug, companyId);

    const form = useForm<UpdateForm>({
        resolver: zodResolver(updateSchema),
        values: {
            name: company?.name ?? '',
            description: company?.description ?? '',
        },
    });

    const { mutate, isPending } = useUpdateCompany<UpdateForm>(workspaceSlug, companyId, {
        setError: form.setError,
    });

    const onSubmit = (data: UpdateForm): void => {
        mutate(data);
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Información general"
                description="Nombre, descripción e identificador de la empresa."
            />
            {isLoading ? (
                <div className="space-y-4 max-w-lg">
                    <Skeleton className="h-9 w-full bg-layer-1" />
                    <Skeleton className="h-9 w-full bg-layer-1" />
                    <Skeleton className="h-9 w-32 bg-layer-1" />
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-sm">Nombre</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nombre de la empresa"
                                            className={inputClass}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-sm">
                                        Descripción (opcional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Descripción de la empresa"
                                            className={inputClass}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-1.5">
                            <p className="text-sm text-secondary font-medium">Identificador</p>
                            <div className="flex items-center gap-2 px-3 h-9 rounded-md border border-subtle bg-layer-1/50 w-full">
                                <Lock size={13} className="text-placeholder shrink-0" aria-hidden="true" />
                                <span className="text-sm font-mono text-placeholder">
                                    {company?.identifier ?? '—'}
                                </span>
                            </div>
                            <p className="text-[11px] text-placeholder">
                                El identificador no se puede cambiar después de crear la empresa.
                            </p>
                        </div>
                        <Button
                            type="submit"
                            className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                            disabled={isPending}
                        >
                            {isPending ? 'Guardando...' : 'Actualizar empresa'}
                        </Button>
                    </form>
                </Form>
            )}
        </div>
    );
}

function FeaturesTab(): React.ReactElement {
    const [features, setFeatures] = useState<Record<FeatureId, boolean>>({
        issues: true,
        cycles: true,
        modules: true,
        views: true,
        pages: true,
        intake: true,
    });

    const toggle = (id: FeatureId): void => {
        setFeatures((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Características"
                description="Activa o desactiva módulos para esta empresa."
            />
            <div className="space-y-1 max-w-lg">
                {FEATURES.map(({ id, label, description, icon: Icon }) => (
                    <div
                        key={id}
                        className="flex items-center justify-between px-4 py-3 rounded-md hover:bg-layer-transparent-hover transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Icon size={16} className="text-placeholder shrink-0" aria-hidden="true" />
                            <div>
                                <p className="text-sm font-medium text-primary">{label}</p>
                                <p className="text-xs text-placeholder">{description}</p>
                            </div>
                        </div>
                        <Switch
                            checked={features[id]}
                            onCheckedChange={() => toggle(id)}
                            aria-label={`Activar ${label}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

interface DangerTabProps {
    workspaceSlug: string;
    companyId: string;
}

function DangerTab({ workspaceSlug, companyId }: DangerTabProps): React.ReactElement {
    const navigate = useNavigate();
    const { mutate: deleteCompany, isPending } = useDeleteCompany(workspaceSlug);

    const handleDelete = (): void => {
        deleteCompany(companyId, {
            onSuccess: () => void navigate(`/${workspaceSlug}/settings/companies`),
        });
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Zona de peligro"
                description="Las acciones aquí son permanentes e irreversibles."
            />
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-900/40 bg-red-950/10 max-w-lg">
                <div>
                    <p className="text-sm font-medium text-primary">Eliminar esta empresa</p>
                    <p className="text-xs text-placeholder mt-0.5">
                        Se eliminarán todos los issues, ciclos, módulos y datos asociados.
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={isPending}
                        >
                            Eliminar
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-surface-2 border-subtle">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-primary">
                                ¿Eliminar empresa?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-placeholder">
                                Esta acción es irreversible. Se eliminarán todos los datos de la empresa de forma permanente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-layer-2 border-subtle text-secondary hover:bg-layer-3">
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Sí, eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

import { ChevronLeft } from 'lucide-react';

export const WorkspaceCompanyDetailSettingsTab = (): React.ReactElement => {
    const { workspaceSlug = '', companyId = '' } = useParams<{
        workspaceSlug: string;
        companyId: string;
    }>();
    const navigate = useNavigate();

    return (
        <div className="animate-fade-in space-y-10 max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
                <button
                    type="button"
                    onClick={() => navigate(`/${workspaceSlug}/settings/companies`)}
                    className="p-1 text-secondary hover:text-primary transition-colors bg-layer-1 hover:bg-layer-2 rounded-md border border-subtle"
                >
                    <ChevronLeft size={16} />
                </button>
                <h1 className="text-lg font-semibold text-primary">Configuración de empresa</h1>
            </div>

            <div className="space-y-12">
                <GeneralTab workspaceSlug={workspaceSlug} companyId={companyId} />
                <Separator className="bg-subtle" />
                <FeaturesTab />
                <Separator className="bg-subtle" />
                <DangerTab workspaceSlug={workspaceSlug} companyId={companyId} />
            </div>
        </div>
    );
};
