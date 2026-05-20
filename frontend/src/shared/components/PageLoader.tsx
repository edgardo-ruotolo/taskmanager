import type React from 'react';

export const PageLoader = (): React.ReactElement => (
    <div className="flex h-screen w-full items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-subtle border-t-[var(--brand-700)]" />
            <p className="text-xs text-placeholder">Cargando...</p>
        </div>
    </div>
);
