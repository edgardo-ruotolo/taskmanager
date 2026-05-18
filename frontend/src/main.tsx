import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@/shared/lib/query-client';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ThemeProvider } from '@/shared/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { App } from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <ErrorBoundary>
            <ThemeProvider>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <TooltipProvider>
                            <App />
                            <Toaster position="top-right" richColors />
                            <ReactQueryDevtools initialIsOpen={false} />
                        </TooltipProvider>
                    </BrowserRouter>
                </QueryClientProvider>
            </ThemeProvider>
        </ErrorBoundary>
    </React.StrictMode>,
);
