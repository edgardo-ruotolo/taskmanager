import type React from 'react';
import { useState, useEffect } from 'react';
import { Archive, Inbox, Layers, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemedSwitch } from '@/shared/components/ThemedSwitch';
import { useProject, useUpdateProject } from '@/modules/projects/application/use-projects';
import { SectionHeader } from './SectionHeader';

type FeatureId = 'cycles' | 'modules' | 'intake' | 'archives';

const FEATURES: {
    id: FeatureId;
    label: string;
    description: string;
    icon: React.ElementType;
    key: 'cyclesEnabled' | 'modulesEnabled' | 'intakeEnabled' | 'archivesEnabled';
}[] = [
    { id: 'cycles', label: 'Ciclos', description: 'Sprints y ciclos de trabajo', icon: RefreshCw, key: 'cyclesEnabled' },
    { id: 'modules', label: 'Módulos', description: 'Agrupación temática de tareas', icon: Layers, key: 'modulesEnabled' },
    { id: 'intake', label: 'Solicitudes', description: 'Buzón de solicitudes externas', icon: Inbox, key: 'intakeEnabled' },
    { id: 'archives', label: 'Archivos', description: 'Archivar y consultar tareas archivadas', icon: Archive, key: 'archivesEnabled' },
];

interface ProjectFeaturesTabProps {
    workspaceSlug: string;
    projectId: string;
}

type FeaturesState = Record<FeatureId, boolean>;

export function ProjectFeaturesTab({ workspaceSlug, projectId }: ProjectFeaturesTabProps): React.ReactElement {
    const { data: project, isLoading } = useProject(workspaceSlug, projectId);
    const { mutate: updateProject, isPending } = useUpdateProject(workspaceSlug, projectId);
    const [pendingFeature, setPendingFeature] = useState<FeatureId | null>(null);

    const [localFeatures, setLocalFeatures] = useState<FeaturesState>({
        cycles: false,
        modules: false,
        intake: false,
        archives: false,
    });

    useEffect(() => {
        if (project) {
            setLocalFeatures({
                cycles: project.cyclesEnabled,
                modules: project.modulesEnabled,
                intake: project.intakeEnabled,
                archives: project.archivesEnabled,
            });
        }
    }, [project]);

    const handleToggle = (feature: (typeof FEATURES)[number]): void => {
        const prev = localFeatures[feature.id];
        const next = !prev;

        setLocalFeatures((s) => ({ ...s, [feature.id]: next }));
        setPendingFeature(feature.id);

        updateProject(
            { [feature.key]: next },
            {
                onSuccess: () => {
                    setPendingFeature(null);
                    toast.success(`${feature.label} ${next ? 'activado' : 'desactivado'}`);
                },
                onError: () => {
                    setLocalFeatures((s) => ({ ...s, [feature.id]: prev }));
                    setPendingFeature(null);
                    toast.error(`Error al actualizar ${feature.label}`);
                },
            },
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <SectionHeader
                    title="Características"
                    description="Activa o desactiva módulos para este proyecto."
                />
                <div className="space-y-1 max-w-lg">
                    {FEATURES.map(({ id }) => (
                        <div key={id} className="flex items-center justify-between px-4 py-3 rounded-md">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-4 h-4 rounded" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-2.5 w-40" />
                                </div>
                            </div>
                            <Skeleton className="w-9 h-5 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Características"
                description="Activa o desactiva módulos para este proyecto."
            />
            <div className="space-y-1 max-w-lg">
                {FEATURES.map((feature) => {
                    const { id, label, description, icon: Icon } = feature;
                    const isThisPending = isPending && pendingFeature === id;
                    return (
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
                            <ThemedSwitch
                                checked={localFeatures[id]}
                                onCheckedChange={() => handleToggle(feature)}
                                ariaLabel={`Activar ${label}`}
                                disabled={isThisPending}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
