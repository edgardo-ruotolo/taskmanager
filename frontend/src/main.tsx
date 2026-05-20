import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as Sentry from '@sentry/react';
import { initPostHog } from '@/shared/lib/posthog';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/shared/lib/query-client';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ThemeProvider } from '@/shared/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { App } from './App';

// Initialize Sentry only when a DSN is provided. This keeps local dev clean
// and avoids reporting noise from tests / preview environments.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
    Sentry.init({
        dsn: sentryDsn,
        environment: import.meta.env.VITE_ENV ?? import.meta.env.MODE,
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0.5,
    });
}

// Product analytics — no-op when VITE_POSTHOG_KEY is missing.
initPostHog();
// Font assets (self-hosted via fontsource so we don't depend on Google CDN)
import '@fontsource-variable/geist/index.css';
import '@fontsource-variable/geist-mono/index.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <ErrorBoundary>
                        <TooltipProvider>
                            <App />
                            <Toaster position="top-right" richColors closeButton />
                            <ReactQueryDevtools initialIsOpen={false} />
                        </TooltipProvider>
                    </ErrorBoundary>
                </BrowserRouter>
            </QueryClientProvider>
        </ThemeProvider>
    </React.StrictMode>,
);
