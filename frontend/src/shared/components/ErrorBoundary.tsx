import { Component } from 'react';
import type React from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';

interface InnerProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    navigate: NavigateFunction;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundaryInner extends Component<InnerProps, State> {
    constructor(props: InnerProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    private readonly handleReset = (): void => {
        this.setState({ hasError: false, error: null });
        this.props.navigate('/', { replace: true });
    };

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
                                onClick={this.handleReset}
                                className="mt-4 px-4 py-2 bg-accent-primary hover:bg-accent-primary-hover text-on-color text-sm rounded-md"
                            >
                                Volver al inicio
                            </button>
                        </div>
                    </div>
                )
            );
        }
        return this.props.children;
    }
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const ErrorBoundary = ({ children, fallback }: ErrorBoundaryProps): React.ReactElement => {
    const navigate = useNavigate();
    return (
        <ErrorBoundaryInner navigate={navigate} fallback={fallback}>
            {children}
        </ErrorBoundaryInner>
    );
};
