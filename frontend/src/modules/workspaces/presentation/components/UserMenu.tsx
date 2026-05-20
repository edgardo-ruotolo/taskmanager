import type React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher';
import { useAuthMe } from '@/modules/auth/application/use-auth-me';
import { authRepository } from '@/modules/auth/infrastructure/auth-repository';
import { handleAuthFailure } from '@/shared/lib/api-client';

export function UserMenu(): React.ReactElement {
    const { data: user } = useAuthMe();
    const navigate = useNavigate();
    const { workspaceSlug } = useParams<{ workspaceSlug: string }>();

    const handleLogout = async (): Promise<void> => {
        try {
            await authRepository.logout();
        } catch {
            // even if server call fails, always clear local auth
        } finally {
            handleAuthFailure();
            toast.success('Sesión cerrada');
        }
    };

    const initials = user?.displayName
        ? user.displayName
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()
        : user?.email?.slice(0, 2).toUpperCase() ?? '??';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex size-8 items-center justify-center rounded-md hover:bg-layer-1 transition-colors duration-150 focus:outline-none"
                    aria-label="Menú de usuario"
                >
                    <div className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-on-color">{initials}</span>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-52">
                <DropdownMenuLabel className="text-[11px] text-tertiary font-normal">
                    {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => void navigate(`/${workspaceSlug}/profile`)}
                    className="gap-2 text-[13px]"
                >
                    <UserCircle size={14} aria-hidden="true" />
                    Mi perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-1 py-0.5">
                    <ThemeSwitcher />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => void handleLogout()}
                    className="gap-2 text-[13px] text-danger-primary focus:text-danger-primary"
                >
                    <LogOut size={14} aria-hidden="true" />
                    Cerrar sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
