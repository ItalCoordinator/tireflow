
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Fixed: Inheriting from Component directly ensures 'props' is correctly typed in the instance
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] shadow-2xl p-12 max-w-xl w-full text-center border border-red-100">
            <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertOctagon className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">¡Ups! Algo salió mal</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              La aplicación encontró un error inesperado. Hemos registrado el incidente para solucionarlo.
              Por favor, intenta recargar la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center space-x-3 w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all shadow-xl"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Recargar Aplicación</span>
            </button>
            {this.state.error && (
              <div className="mt-8 p-4 bg-gray-100 rounded-xl text-left text-[10px] font-mono text-gray-400 overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}