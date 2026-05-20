import type React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Bell, HelpCircle, Menu } from 'lucide-react';
import { BreadcrumbBar } from '@/shared/components/BreadcrumbBar';
import { UserMenu } from './UserMenu';
import { useSidebarStore } from '@/modules/workspaces/application/sidebar-store';

export function TopNavigation(): React.ReactElement {
    const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
    const navigate = useNavigate();
    const { toggleMobileSidebar } = useSidebarStore();

    const handleSearchOpen = (): void => {
        window.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
        );
    };

    return (
        <header 
            className="z-[27] flex min-h-[52px] w-full items-center bg-canvas border-b px-6 gap-6 shrink-0" 
            style={{ borderColor: 'var(--neutral-400)' }}
        >
            {/* Mobile hamburger — visible only on <lg */}
            <button
                type="button"
                onClick={toggleMobileSidebar}
                className="flex lg:hidden size-8 items-center justify-center rounded-md text-secondary hover:bg-layer-1 transition-colors duration-150 shrink-0"
                aria-label="Abrir menú"
            >
                <Menu size={18} aria-hidden="true" />
            </button>

            {/* Left — Breadcrumbs */}
            <div className="flex-1 min-w-0">
                <BreadcrumbBar />
            </div>

            {/* Right — Search & Actions */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleSearchOpen}
                    className="flex h-7 w-[200px] items-center gap-2 rounded-md border-0 px-3 text-[12px] font-mono transition-colors duration-150 hover:opacity-90"
                    style={{ background: 'var(--neutral-300)', color: 'var(--neutral-700)' }}
                    aria-label="Buscar comandos"
                >
                    <Search size={13} className="shrink-0 text-placeholder" aria-hidden="true" />
                    <span className="flex-1 text-left">Comandos…</span>
                    <span className="opacity-50">⌘K</span>
                </button>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => void navigate(`/${workspaceSlug}/notifications`)}
                        className="flex size-8 items-center justify-center rounded-md text-secondary hover:bg-layer-1 transition-colors duration-150"
                        aria-label="Notificaciones"
                    >
                        <Bell size={17} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className="flex size-8 items-center justify-center rounded-md text-secondary hover:bg-layer-1 transition-colors duration-150 mr-1"
                        aria-label="Ayuda"
                    >
                        <HelpCircle size={17} aria-hidden="true" />
                    </button>
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}

