import { useMemo } from 'react';
import { useAuthMe } from '@/modules/auth/application/use-auth-me';
import type { WorkspaceRole } from '../domain/types';
import { useWorkspaceMembers } from './use-workspaces';

/**
 * Devuelve el rol del usuario autenticado dentro del workspace indicado.
 * Retorna `null` mientras carga o si el usuario no es miembro.
 */
export const useCurrentWorkspaceRole = (workspaceSlug: string): WorkspaceRole | null => {
    const { data: user } = useAuthMe();
    const { data: members } = useWorkspaceMembers(workspaceSlug);

    return useMemo(() => {
        if (!user || !members) return null;
        const match = members.find((m) => m.userId === user.id);
        return match?.role ?? null;
    }, [user, members]);
};

/**
 * `true` si el usuario es Admin o Lead del workspace (puede ejecutar acciones administrativas
 * sobre tareas recurrentes, etc.). Mientras se resuelve la información retorna `false` por
 * seguridad (no muestra controles destructivos hasta confirmar el rol).
 */
export const useIsWorkspaceAdmin = (workspaceSlug: string): boolean => {
    const role = useCurrentWorkspaceRole(workspaceSlug);
    return role === 'Admin' || role === 'Lead';
};
