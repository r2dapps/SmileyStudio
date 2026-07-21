import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AudioErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Audio Exception Caught:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center space-y-4 max-w-md mx-auto my-12 glassmorphism rounded-2xl border border-red-500/30">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-white">Audio System Error</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {this.state.error?.message || 'An unexpected Web Audio engine error occurred.'}
          </p>
          <button
            onClick={this.handleReload}
            className="px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold flex items-center space-x-2 mx-auto active:scale-95 transition shadow-lg shadow-pink-600/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Studio</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
