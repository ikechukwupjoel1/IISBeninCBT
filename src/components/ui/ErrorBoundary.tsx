import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './UI';
import { Icons } from './Icons';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    readonly props: Props;

    constructor(props: Props) {
        super(props);
        this.props = props;
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center border-t-4 border-red-500">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <Icons.ExclamationTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error. Please try reloading the page.
                        </p>
                        {this.state.error && (
                            <div className="bg-gray-100 p-4 rounded text-left mb-6 overflow-auto max-h-40">
                                <p className="text-xs font-mono text-red-600">{this.state.error.toString()}</p>
                            </div>
                        )}
                        <Button onClick={this.handleReload} className="w-full">
                            Reload Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
