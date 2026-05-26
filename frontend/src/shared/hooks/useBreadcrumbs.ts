import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { Project } from '@/modules/projects/domain/types';

export interface Breadcrumb {
    label: string;
    href?: string;
}

const ROUTE_LABELS: Record<string, string> = {
    projects: 'Proyectos',
    issues: 'Tareas',
    cycles: 'Ciclos',
    modules: 'Módulos',
    inbox: 'Bandeja',
    analytics: 'Análisis',
    activity: 'Activity',
    notifications: 'Notifications',
    profile: 'My profile',
    settings: 'Configuración',
    states: 'States',
    'state-groups': 'State Groups',
    labels: 'Labels',
    'issue-types': 'Issue Types',
    views: 'Views',
    tokens: 'API Tokens',
    members: 'Members',
    users: 'Users',
};

function resolveSegmentLabel(
    seg: string,
    index: number,
    segments: string[],
    projectId: string | undefined,
    projectName: string | undefined,
): string | undefined {
    const known = ROUTE_LABELS[seg];
    if (known) return known;
    // If this UUID is the active projectId and follows "projects", use the project name
    if (seg === projectId && projectName && segments[index - 1] === 'projects') {
        return projectName;
    }
    return undefined;
}

export function useBreadcrumbs(): Breadcrumb[] {
    const location = useLocation();
    const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId?: string }>();
    const qc = useQueryClient();

    // Read project name from query cache — no extra network request
    const projectName = useMemo((): string | undefined => {
        if (!workspaceSlug || !projectId) return undefined;
        const cached = qc.getQueryData<Project>(['project', workspaceSlug, projectId]);
        return cached?.name;
    }, [qc, workspaceSlug, projectId]);

    return useMemo((): Breadcrumb[] => {
        if (!workspaceSlug) return [];

        const base = `/${workspaceSlug}`;
        const segments = location.pathname
            .replace(base, '')
            .split('/')
            .filter(Boolean);

        const crumbs: Breadcrumb[] = [];
        let path = base;

        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            path = `${path}/${seg}`;

            const label = resolveSegmentLabel(seg, i, segments, projectId, projectName);
            if (!label) continue;

            const nextSeg = segments[i + 1] ?? '';
            const isLast = i === segments.length - 1 || !ROUTE_LABELS[nextSeg];
            crumbs.push({ label, href: isLast ? undefined : path });
        }

        return crumbs;
    }, [location.pathname, workspaceSlug, projectId, projectName]);
}
