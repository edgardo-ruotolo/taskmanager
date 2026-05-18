import type React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { UserMenu } from './UserMenu';

export function TopNavigation(): React.ReactElement {
    const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
    const navigate = useNavigate();

    const handleSearchOpen = (): void => {
        window.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
        );
    };

    return (
        <div className="z-[27] flex min-h-10 w-full items-center bg-canvas px-3.5 shrink-0">
            {/* Left — Workspace switcher */}
            <div className="flex-1 min-w-0">
                <WorkspaceSwitcher />
            </div>

            {/* Center — Search commands */}
            <div className="shrink-0">
                <button
                    type="button"
                    onClick={handleSearchOpen}
                    className="flex h-7 w-[280px] items-center gap-2 rounded-lg border border-subtle bg-layer-2 px-3 text-[13px] text-placeholder hover:bg-layer-1 transition-colors duration-150"
                    aria-label="Buscar comandos"
                >
                    <Search size={14} className="shrink-0 text-placeholder" aria-hidden="true" />
                    <span>Buscar comandos...</span>
                </button>
            </div>

            {/* Right — Actions */}
            <div className="flex-1 flex items-center justify-end gap-1">
                <button
                    type="button"
                    onClick={() => void navigate(`/${workspaceSlug}/notifications`)}
                    className="flex size-8 items-center justify-center rounded-md text-secondary hover:bg-layer-1 transition-colors duration-150"
                    aria-label="Notificaciones"
                >
                    <Bell size={18} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    className="flex size-8 items-center justify-center rounded-md text-secondary hover:bg-layer-1 transition-colors duration-150"
                    aria-label="Ayuda"
                >
                    <HelpCircle size={18} aria-hidden="true" />
                </button>
                <UserMenu />
            </div>
        </div>
    );
}
