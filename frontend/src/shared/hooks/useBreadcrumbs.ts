import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export interface Breadcrumb {
    label: string;
    href?: string;
}

const ROUTE_LABELS: Record<string, string> = {
    projects: 'Proyectos',
    issues: 'Tareas',
    cycles: 'Ciclos',
    modules: 'Módulos',
    estimates: 'Estimaciones',
    inbox: 'Bandeja',
    analytics: 'Analíticas',
    activity: 'Actividad',
    notifications: 'Notificaciones',
    profile: 'Mi perfil',
    settings: 'Configuración',
    states: 'Estados',
    'state-groups': 'Grupos de Estados',
    labels: 'Etiquetas',
    'issue-types': 'Tipos de tarea',
    views: 'Vistas',
    tokens: 'Tokens de API',
    members: 'Miembros',
    users: 'Usuarios',
};

export function useBreadcrumbs(): Breadcrumb[] {
    const location = useLocation();
    const { workspaceSlug } = useParams<{ workspaceSlug: string }>();

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
            const label = ROUTE_LABELS[seg];

            if (!label) {
                // UUID/ID segment — skip, contributes to path only
                continue;
            }

            const isLast = i === segments.length - 1 || !ROUTE_LABELS[segments[i + 1] ?? ''];
            crumbs.push({ label, href: isLast ? undefined : path });
        }

        return crumbs;
    }, [location.pathname, workspaceSlug]);
}
