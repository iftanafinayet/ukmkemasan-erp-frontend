import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 text-red-500 mb-2">
              <AlertTriangle size={40} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Oops! Terjadi Kesalahan</h1>
              <p className="text-slate-500 font-medium">Aplikasi mengalami kendala yang tidak terduga. Kami mohon maaf atas ketidaknyamanan ini.</p>
            </div>

            {this.props.showDetails && this.state.error && (
              <div className="p-4 bg-slate-50 rounded-2xl text-left overflow-auto max-h-40 border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Error Details</p>
                <code className="text-xs text-red-600 font-mono break-all">{this.state.error.toString()}</code>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <RotateCcw size={20} />
              Muat Ulang Aplikasi
            </button>
            
            <p className="text-xs text-slate-400 font-medium pt-2">
              Jika masalah berlanjut, silakan hubungi tim IT.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
