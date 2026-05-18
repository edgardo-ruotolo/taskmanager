import { Component } from 'react';
import type React from 'react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <div className="flex h-screen w-full items-center justify-center bg-canvas">
                        <div className="flex flex-col items-center gap-3 max-w-md text-center p-8">
                            <p className="text-lg font-semibold text-primary">Algo salió mal</p>
                            <p className="text-sm text-placeholder">{this.state.error?.message}</p>
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-accent-primary hover:bg-accent-primary-hover text-on-color text-sm rounded-md"
                            >
                                Recargar página
                            </button>
                        </div>
                    </div>
                )
            );
        }
        return this.props.children;
    }
}
