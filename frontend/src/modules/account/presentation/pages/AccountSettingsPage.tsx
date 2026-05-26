import type React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationPreferencesForm } from '../components/NotificationPreferencesForm';

export function AccountSettingsPage(): React.ReactElement {
    return (
        <div className="flex flex-col flex-1 overflow-auto">
            {/* Page header */}
            <div
                className="flex items-center px-6 py-4 border-b shrink-0"
                style={{ borderColor: 'var(--neutral-300)', background: 'var(--canvas)' }}
            >
                <div>
                    <h1 className="text-[16px] font-semibold tracking-tight" style={{ color: 'var(--neutral-1200)' }}>
                        Mi configuración
                    </h1>
                    <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--neutral-800)' }}>
                        Gestioná tus preferencias personales de cuenta.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto px-6 py-6">
                <div className="max-w-2xl w-full mx-auto">
                    <Tabs defaultValue="notifications">
                        <TabsList className="mb-6">
                            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                            {/* Future tabs — profile, security, etc. */}
                            {/* <TabsTrigger value="profile" disabled>Perfil</TabsTrigger> */}
                        </TabsList>

                        <TabsContent value="notifications">
                            <NotificationPreferencesForm />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
