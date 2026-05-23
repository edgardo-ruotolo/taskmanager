import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Shield, Layers, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProject } from '../../application/use-projects';
import { ProjectGeneralTab } from '../components/settings/ProjectGeneralTab';
import { ProjectStateGroupTab } from '../components/settings/ProjectStateGroupTab';
import { ProjectFeaturesTab } from '../components/settings/ProjectFeaturesTab';
import { ProjectDangerTab } from '../components/settings/ProjectDangerTab';

type TabKey = 'general' | 'states' | 'features' | 'danger';

interface TabDef {
    key: TabKey;
    label: string;
    icon: React.ElementType;
}

const PROJECT_TABS: TabDef[] = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'states', label: 'Estados', icon: Shield },
    { key: 'features', label: 'Funcionalidades', icon: Layers },
];

const DANGER_TAB: TabDef = { key: 'danger', label: 'Zona peligrosa', icon: AlertTriangle };

export const ProjectSettingsPage = (): React.ReactElement => {
    const { workspaceSlug = '', projectId = '' } = useParams<{
        workspaceSlug: string;
        projectId: string;
    }>();
    const { data: project } = useProject(workspaceSlug, projectId);
    const [activeTab, setActiveTab] = useState<TabKey>('general');

    const renderTab = (tab: TabDef): React.ReactElement => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;

        return (
            <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                    'flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-medium transition-all border-b-2 -mb-[1px]',
                    isActive
                        ? 'border-[var(--brand-700)] text-[var(--neutral-1200)]'
                        : 'border-transparent text-[var(--neutral-600)] hover:text-[var(--neutral-1200)]',
                )}
            >
                <Icon size={14} className="shrink-0" aria-hidden="true" />
                {tab.label}
            </button>
        );
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-canvas">
            {/* Header */}
            <div className="px-10 pt-10 pb-6 shrink-0">
                <h1 className="text-[32px] font-semibold text-[var(--neutral-1200)] tracking-[-0.04em]">
                    Configuración del proyecto
                </h1>
                <p className="text-[14.5px] text-[var(--neutral-600)] mt-1">
                    {project?.name
                        ? `Administra la configuración de ${project.name}.`
                        : 'Administra la configuración del proyecto.'}
                </p>
            </div>

            {/* Tabs Navigation */}
            <div className="px-10 border-b border-[var(--neutral-300)] shrink-0 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 mr-4">
                    {PROJECT_TABS.map(renderTab)}
                </div>
                <div className="h-4 w-px bg-[var(--neutral-300)] mx-2" />
                <div className="flex items-center gap-1">
                    {renderTab(DANGER_TAB)}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-4xl px-10 py-8">
                    {activeTab === 'general' && (
                        <ProjectGeneralTab workspaceSlug={workspaceSlug} projectId={projectId} />
                    )}
                    {activeTab === 'states' && (
                        <ProjectStateGroupTab workspaceSlug={workspaceSlug} projectId={projectId} />
                    )}
                    {activeTab === 'features' && <ProjectFeaturesTab />}
                    {activeTab === 'danger' && (
                        <ProjectDangerTab workspaceSlug={workspaceSlug} projectId={projectId} />
                    )}
                </div>
            </div>
        </div>
    );
};
