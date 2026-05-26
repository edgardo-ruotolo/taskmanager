import { Navigate, useParams } from 'react-router-dom';
import { useProject } from '@/modules/projects/application/use-projects';
import { getProjectFeatures, type ProjectFeatures } from '@/modules/projects/application/use-project-features';
import type { ReactNode, ReactElement } from 'react';

interface ProjectFeatureGuardProps {
    feature: keyof ProjectFeatures;
    children: ReactNode;
}

export const ProjectFeatureGuard = ({ feature, children }: ProjectFeatureGuardProps): ReactElement | null => {
    const { workspaceSlug = '', projectId = '' } = useParams<{ workspaceSlug: string; projectId: string }>();
    const { data: project, isLoading } = useProject(workspaceSlug, projectId);

    if (isLoading || !project) return null;

    const features = getProjectFeatures(project);
    if (!features[feature]) {
        return <Navigate to={`/${workspaceSlug}/projects/${projectId}/issues`} replace />;
    }

    return <>{children}</>;
};
