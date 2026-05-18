import type React from 'react';
import { Sparkles } from 'lucide-react';

export const GodModeAiPage = (): React.ReactElement => (
    <div className="max-w-lg">
        <div className="mb-6">
            <h2 className="text-lg font-semibold text-primary">Inteligencia artificial</h2>
            <p className="text-sm text-secondary mt-1">
                Configuración de integraciones de IA para asistencia en issues y contenido.
            </p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-lg border border-subtle bg-layer-1">
            <div className="w-12 h-12 rounded-full bg-layer-2 flex items-center justify-center">
                <Sparkles size={22} className="text-tertiary" aria-hidden="true" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-primary">Próximamente</p>
                <p className="text-xs text-tertiary mt-1">
                    Las integraciones de IA estarán disponibles en una próxima versión.
                </p>
            </div>
        </div>
    </div>
);
