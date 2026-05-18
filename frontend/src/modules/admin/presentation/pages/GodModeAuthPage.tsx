import type React from 'react';
import { ShieldOff } from 'lucide-react';

export const GodModeAuthPage = (): React.ReactElement => (
    <div className="max-w-lg">
        <div className="mb-6">
            <h2 className="text-lg font-semibold text-primary">Autenticación</h2>
            <p className="text-sm text-secondary mt-1">
                Métodos de inicio de sesión y configuración de seguridad.
            </p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-lg border border-subtle bg-layer-1">
            <div className="w-12 h-12 rounded-full bg-layer-2 flex items-center justify-center">
                <ShieldOff size={22} className="text-tertiary" aria-hidden="true" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-primary">Próximamente</p>
                <p className="text-xs text-tertiary mt-1">
                    La configuración de métodos de autenticación estará disponible en una próxima versión.
                </p>
            </div>
        </div>
    </div>
);
