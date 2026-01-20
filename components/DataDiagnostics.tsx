
import React from 'react';
import { useAnalysis } from './AnalysisContext';
import { CheckCircle2, AlertCircle, XCircle, ArrowRight, Table, Info } from 'lucide-react';
import { FileDiagnostic } from '../types';

export const DataDiagnostics: React.FC = () => {
  const { fileDiagnostics, connectionDiagnostics, confirmAnalysis, reset } = useAnalysis();

  const fileList = Object.values(fileDiagnostics);
  const isFilesValid = fileList.length === 3 && fileList.every((d: FileDiagnostic) => d.isValid);
  const isConnectionValid = connectionDiagnostics?.isValid || false;
  const isDataValid = isFilesValid && isConnectionValid;

  const FileCard = ({ diag }: { diag: FileDiagnostic }) => (
    <div className={`p-6 rounded-[2rem] border-2 transition-all duration-300 ${diag.isValid ? 'border-green-100 bg-green-50/20' : 'border-red-100 bg-red-50/20'}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-black uppercase text-[10px] tracking-widest text-gray-400">{diag.name}</h4>
        {diag.isValid ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-black text-gray-900">{diag.rowCount.toLocaleString()} <span className="text-[10px] text-gray-400 font-bold uppercase">Filas</span></p>
        <p className="text-xs text-gray-500 font-bold">{diag.uniqueProducts.toLocaleString()} SKUs Únicos</p>
      </div>
      {diag.missingColumns.length > 0 && (
        <div className="mt-4 p-3 bg-red-100/50 rounded-xl text-[10px] text-red-700 font-black border border-red-100 leading-tight">
          ERROR: FALTAN COLUMNAS ({diag.missingColumns.join(', ')})
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto my-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 p-10 text-white flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Diagnóstico de Integridad</h2>
            <p className="text-gray-400 text-sm mt-2 font-medium uppercase tracking-wider">Validación técnica antes del análisis final</p>
          </div>
          <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${isDataValid ? 'bg-green-600 shadow-green-900/20' : 'bg-amber-500'}`}>
            {isDataValid ? 'Análisis Habilitado' : 'Revisión Necesaria'}
          </div>
        </div>

        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FileCard diag={fileDiagnostics.kardex} />
            <FileCard diag={fileDiagnostics.ventas} />
            <FileCard diag={fileDiagnostics.stock} />
          </div>

          <div className="bg-blue-50/30 rounded-[2.5rem] p-10 border border-blue-100 shadow-inner">
            <div className="flex items-center space-x-4 mb-8 text-blue-900">
              <Table className="w-8 h-8" />
              <h3 className="font-black text-2xl tracking-tight">Sincronización de Datos</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Coincidencias Código + Local:</span>
                  <span className="text-3xl font-black text-blue-600">{connectionDiagnostics?.totalInAll.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-1000 ease-out shadow-lg shadow-blue-200" 
                    style={{ width: `${Math.min(100, (connectionDiagnostics?.totalInAll || 0) / Math.max(1, (connectionDiagnostics?.totalInAll || 0) + (connectionDiagnostics?.stockOnly || 0)) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-white rounded-2xl border border-blue-50 shadow-sm">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong className="text-gray-900 block mb-1">Información de Cruce:</strong>
                    {connectionDiagnostics?.stockOnly} productos no registran ventas recientes en su local correspondiente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!isDataValid && (
            <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] flex items-start space-x-6 text-red-700 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="w-8 h-8 shrink-0" />
              <div className="text-sm">
                <h4 className="font-black text-lg mb-2">Bloqueo de Seguridad</h4>
                <p className="font-medium leading-relaxed">
                  {!isFilesValid 
                    ? "Los archivos cargados no tienen la estructura de columnas requerida. Por favor, revise el formato Excel." 
                    : "No se encontraron coincidencias de (Código + Local) entre Stock y Ventas. El análisis no puede generar resultados significativos."}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 pt-6">
            <button
              onClick={confirmAnalysis}
              disabled={!isDataValid}
              className="flex-grow w-full md:w-auto flex items-center justify-center space-x-4 px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-blue-700 transition-all disabled:opacity-30 disabled:grayscale shadow-2xl shadow-blue-200 active:scale-95"
            >
              <span>Confirmar y Analizar Datos</span>
              <ArrowRight className="w-6 h-6" />
            </button>
            <button 
              onClick={reset}
              className="w-full md:w-auto px-8 py-5 bg-gray-100 text-gray-500 rounded-[1.5rem] font-black hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
