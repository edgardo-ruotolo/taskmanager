import type React from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Sun, Moon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const themeIcon: Record<string, React.ReactElement> = {
    light: <Sun size={14} aria-hidden="true" />,
    dark: <Moon size={14} aria-hidden="true" />,
    system: <Monitor size={14} aria-hidden="true" />,
};

export function ThemeSwitcher(): React.ReactElement {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const activeIcon = themeIcon[theme ?? 'system'] ?? themeIcon[resolvedTheme ?? 'system'] ?? <Monitor size={14} />;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex items-center gap-2 px-2 py-1.5 w-full text-[13px] text-[var(--txt-tertiary)] rounded hover:bg-[var(--bg-layer-transparent-hover)] hover:text-[var(--txt-primary)] transition-colors duration-150"
                    aria-label="Cambiar tema"
                >
                    {activeIcon}
                    <span>Tema</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="min-w-32">
                <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2 text-[13px]">
                    <Sun size={14} aria-hidden="true" />
                    Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2 text-[13px]">
                    <Moon size={14} aria-hidden="true" />
                    Oscuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2 text-[13px]">
                    <Monitor size={14} aria-hidden="true" />
                    Sistema
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
