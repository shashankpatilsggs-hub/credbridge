import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { analytics } from '../services/analytics';

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

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CredBridge Global Error Boundary caught exception]:', error, errorInfo);
    analytics.captureException(error, { context: 'ErrorBoundary', errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full bg-black flex items-center justify-center p-4 font-inter select-none">
          <div className="max-w-md w-full bg-neutral-950 border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl text-white text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h2 className="text-xl font-medium tracking-tight">System Exception Intercepted</h2>
            
            <p className="text-xs text-white/70 leading-relaxed">
              CredBridge encountered an unexpected runtime error. Your Stellar Testnet wallet session and on-chain proofs remain safe.
            </p>

            {this.state.error && (
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-left font-mono text-[11px] text-rose-300 break-all max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-white text-black font-medium text-xs rounded hover:bg-white/90 transition-colors btn-cut flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-black" />
              <span>Reload CredBridge Protocol</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
