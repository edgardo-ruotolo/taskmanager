import type React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.ReactElement {
    return (
        <NextThemesProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem
            themes={['light', 'dark', 'system']}
            disableTransitionOnChange
        >
            {children}
        </NextThemesProvider>
    );
}
