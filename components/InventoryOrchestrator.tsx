
import React from 'react';
import { useAnalysis } from './AnalysisContext';
import { AnalysisStatus } from '../types';
import { FileUploadSection } from './FileUploadSection';
import { DataDiagnostics } from './DataDiagnostics';
import { LoadingAnalysis } from './LoadingAnalysis';
import { TabsNavigation } from './TabsNavigation';
import { DashboardCards } from './DashboardCards';
import { InventoryTable } from './InventoryTable';
import { TransferList } from './TransferList';
import { PlanningView } from './PlanningView';
import { ComprehensiveAnalysis } from './ComprehensiveAnalysis';
import { AIRecommendation } from './AIRecommendation';
import { ConfigPanel } from './ConfigPanel';
import { ColumnMapper } from './ColumnMapper';
import { Database, AlertCircle } from 'lucide-react';

export const InventoryOrchestrator: React.FC = () => {
  const { status, activeTab, reportItems, connectionDiagnostics, config, updateConfig } = useAnalysis();

  // 1. Error Global
  if (status === AnalysisStatus.ERROR) {
    return (
      <div className="p-12 text-center bg-red-50 rounded-[3rem] border border-red-100 max-w-2xl mx-auto shadow-2xl animate-in zoom-in">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-red-900 mb-4">Error Crítico</h2>
        <p className="text-red-700 font-medium mb-8">La aplicación encontró una inconsistencia en los datos procesados.</p>
        <button onClick={() => window.location.reload()} className="px-10 py-5 bg-red-600 text-white rounded-2xl font-black shadow-xl hover:bg-red-700 transition-all">Reiniciar Plataforma</button>
      </div>
    );
  }

  // 2. Estado Inicial: Carga de Archivos
  if (status === AnalysisStatus.IDLE) {
    return (
      <div className="animate-in fade-in duration-700">
        <div className="mb-16 max-w-3xl">
          <h2 className="text-5xl font-black text-gray-900 leading-tight">
            Gestión de Inventario para <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">Neumáticos</span>
          </h2>
          <p className="text-gray-500 mt-6 text-xl leading-relaxed font-medium">
            Transforma datos crudos de su ERP en decisiones estratégicas de compra y movimiento.
          </p>
        </div>
        <FileUploadSection />
      </div>
    );
  }

  // 3. Fase de Mapeo
  if (status === AnalysisStatus.MAPPING) {
    return <ColumnMapper />;
  }

  // 4. Fase de Diagnóstico (Post-Mapeo)
  if (status === AnalysisStatus.DIAGNOSING) {
    return <DataDiagnostics />;
  }

  // 5. Pantalla de Carga/Análisis
  if (status === AnalysisStatus.ANALYZING) {
    return <LoadingAnalysis />;
  }

  // 6. Dashboard Listo
  if (status === AnalysisStatus.READY) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-forwards">
        <div className="xl:col-span-3 space-y-12">
          <TabsNavigation />
          
          {activeTab === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <DashboardCards />
              <AIRecommendation />
              <InventoryTable />
            </div>
          )}

          {activeTab === 'analisis' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ComprehensiveAnalysis />
            </div>
          )}

          {activeTab === 'reportes' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <InventoryTable />
            </div>
          )}

          {activeTab === 'transferencias' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <TransferList />
            </div>
          )}

          {activeTab === 'planificacion' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PlanningView />
            </div>
          )}
        </div>

        <div className="xl:col-span-1 no-print">
          <div className="sticky top-32 animate-in fade-in slide-in-from-right-8 duration-1000">
            <ConfigPanel config={config} onChange={updateConfig} />
          </div>
        </div>
      </div>
    );
  }

  // Fallback de seguridad para evitar pantalla blanca
  return (
    <div className="p-20 text-center bg-white rounded-[3rem] border border-gray-100 shadow-xl">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-6" />
      <h3 className="text-xl font-black text-gray-400">Sincronizando estado de la aplicación...</h3>
    </div>
  );
};

// Icono decorativo de Loader para el fallback
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
);
