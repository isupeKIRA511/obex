import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Antigravity Application Error Boundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.hash = 'bento';
    }
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-4xl mx-auto my-8 p-6 lg:p-8 bg-card border border-rose-800/40 rounded-2xl text-textPrimary font-mono space-y-5 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-400">
                {this.props.fallbackTitle || 'Telemetry Rendering Subsystem Recovered'}
              </h2>
              <p className="text-xs text-textSecondary mt-0.5">
                An unexpected state anomaly occurred in this module. The rest of the platform remains operational.
              </p>
            </div>
          </div>

          {this.state.error && (
            <div className="p-3 rounded-xl bg-canvas border border-borderHairline text-[11px] text-textMuted overflow-x-auto max-h-36">
              <div className="text-rose-300 font-semibold mb-1">{this.state.error.name}: {this.state.error.message}</div>
              {this.state.error.stack && (
                <pre className="text-[10px] text-textMuted whitespace-pre-wrap font-mono">
                  {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                </pre>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-opticsCyan text-black font-semibold text-xs flex items-center gap-2 hover:bg-cyan-300 transition-all cursor-pointer shadow-lg shadow-cyan-950/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Module</span>
            </button>

            <button
              onClick={this.handleGoHome}
              className="px-4 py-2 rounded-xl bg-canvas border border-borderHairline text-textPrimary text-xs flex items-center gap-2 hover:border-textSecondary transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Mission Control</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
