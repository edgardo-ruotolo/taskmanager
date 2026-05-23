import type React from 'react';
import { useState } from 'react';
import { CircleDot, Inbox, Layers, LayoutGrid, RefreshCw } from 'lucide-react';
import { ThemedSwitch } from '@/shared/components/ThemedSwitch';
import { SectionHeader } from './SectionHeader';

const FEATURES = [
    { id: 'issues', label: 'Tareas', description: 'Gestión de tareas y bugs', icon: CircleDot },
    { id: 'cycles', label: 'Ciclos', description: 'Sprints y ciclos de trabajo', icon: RefreshCw },
    { id: 'modules', label: 'Módulos', description: 'Agrupación temática de tareas', icon: Layers },
    {
        id: 'views',
        label: 'Vistas',
        description: 'Vistas personalizadas y filtros guardados',
        icon: LayoutGrid,
    },
    {
        id: 'intake',
        label: 'Solicitudes',
        description: 'Buzón de solicitudes externas',
        icon: Inbox,
    },
] as const;

type FeatureId = (typeof FEATURES)[number]['id'];

export function ProjectFeaturesTab(): React.ReactElement {
    const [features, setFeatures] = useState<Record<FeatureId, boolean>>({
        issues: true,
        cycles: true,
        modules: true,
        views: true,
        intake: true,
    });

    const toggle = (id: FeatureId): void => {
        setFeatures((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Características"
                description="Activa o desactiva módulos para este proyecto."
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
                        <ThemedSwitch
                            checked={features[id]}
                            onCheckedChange={() => toggle(id)}
                            ariaLabel={`Activar ${label}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
