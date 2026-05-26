import type React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, SquareStack } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UnsubscribeFailedPage(): React.ReactElement {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--canvas)' }}>
            <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
                {/* Brand mark */}
                <div className="flex items-center gap-2 mb-2">
                    <SquareStack size={22} style={{ color: 'var(--brand-700)' }} aria-hidden="true" />
                    <span className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--neutral-1200)' }}>
                        TaskManager
                    </span>
                </div>

                {/* Icon */}
                <div
                    className="flex size-14 items-center justify-center rounded-full"
                    style={{ background: 'var(--red-100)' }}
                >
                    <XCircle size={28} style={{ color: 'var(--red-700)' }} aria-hidden="true" />
                </div>

                {/* Heading */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--neutral-1200)' }}>
                        Enlace inválido
                    </h1>
                    <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--neutral-900)' }}>
                        El enlace no es válido o ha expirado. Si necesitás darte de baja, podés hacerlo desde la configuración de tu cuenta.
                    </p>
                </div>

                {/* CTA */}
                <Button asChild className="mt-2">
                    <Link to="/">Volver a la app</Link>
                </Button>
            </div>
        </div>
    );
}
