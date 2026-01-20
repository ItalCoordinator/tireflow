
import React from 'react';
import { AnalysisProvider } from './components/AnalysisContext';
import { InventoryOrchestrator } from './components/InventoryOrchestrator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Database } from 'lucide-react';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AnalysisProvider>
        <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
          <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 no-print">
            <div className="max-w-[1600px] mx-auto px-8 py-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-900 p-2.5 rounded-2xl text-white shadow-xl shadow-gray-200 transform rotate-[-2deg]">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-gray-900">
                    TyreFlow <span className="text-blue-600">Intelligence</span>
                  </h1>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    Advanced Analytics Engine
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-4 py-2 rounded-full uppercase tracking-widest border border-gray-200 shadow-sm">
                  v4.0 Column-Mapping Edition
                </span>
              </div>
            </div>
          </header>

          <main className="flex-grow max-w-[1600px] w-full mx-auto px-8 py-12 relative">
            <InventoryOrchestrator />
          </main>

          <footer className="bg-white border-t border-gray-100 py-16 text-center text-sm text-gray-400 font-black no-print">
            <p className="tracking-[0.4em] uppercase opacity-40">
              © 2024 TyreFlow Systems • Ingeniería de Datos de Alto Nivel
            </p>
          </footer>
        </div>
      </AnalysisProvider>
    </ErrorBoundary>
  );
};

export default App;
