import type React from 'react';
import { useParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitHubIntegrationPanel } from '../components/GitHubIntegrationPanel';
import { SlackIntegrationPanel } from '../components/SlackIntegrationPanel';

export const IntegrationsPage = (): React.ReactElement => {
    const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
    const slug = workspaceSlug ?? '';

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Page header */}
                <div>
                    <h1 className="text-lg font-semibold text-primary">Integraciones</h1>
                    <p className="text-sm text-tertiary mt-0.5">
                        Conecta TaskManager con tus herramientas favoritas
                    </p>
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-blue-900/40 bg-blue-950/10">
                    <Info size={15} className="text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-blue-300/80">
                        Estas integraciones están en modo de configuración. Para activarlas, contacta al
                        administrador del sistema.
                    </p>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="github">
                    <TabsList className="bg-layer-2 border border-subtle h-9">
                        <TabsTrigger
                            value="github"
                            className="text-xs data-[state=active]:bg-surface-1 data-[state=active]:text-primary text-secondary"
                        >
                            GitHub
                        </TabsTrigger>
                        <TabsTrigger
                            value="slack"
                            className="text-xs data-[state=active]:bg-surface-1 data-[state=active]:text-primary text-secondary"
                        >
                            Slack
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="github" className="mt-6">
                        <div className="rounded-lg border border-subtle bg-surface-1/30 p-5">
                            <GitHubIntegrationPanel workspaceSlug={slug} />
                        </div>
                    </TabsContent>

                    <TabsContent value="slack" className="mt-6">
                        <div className="rounded-lg border border-subtle bg-surface-1/30 p-5">
                            <SlackIntegrationPanel workspaceSlug={slug} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
