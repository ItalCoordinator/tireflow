
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAnalysis } from './AnalysisContext';
import { RawDataStore } from '../types';

export const FileUploadSection: React.FC = () => {
  const { startMapping } = useAnalysis();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{kardex?: string, ventas?: string, stock?: string}>({});
  const [rawDatasets, setRawDatasets] = useState<{kardex: any[], ventas: any[], stock: any[]}>({
    kardex: [], ventas: [], stock: []
  });
  const [headers, setHeaders] = useState<{kardex: string[], ventas: string[], stock: string[]}>({
    kardex: [], ventas: [], stock: []
  });

  const handleFileUpload = async (type: 'kardex' | 'ventas' | 'stock', file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(ws);
        
        if (rawData.length > 0) {
          const fileHeaders = Object.keys(rawData[0] as object);
          setHeaders(prev => ({ ...prev, [type]: fileHeaders }));
          setRawDatasets(prev => ({ ...prev, [type]: rawData }));
          setFiles(prev => ({ ...prev, [type]: file.name }));
        }
      } catch (err) {
        console.error("Error parsing file", err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const isReady = files.kardex && files.ventas && files.stock;

  const FileInput = ({ type, label, description }: any) => (
    <div className="flex-1 min-w-[280px] bg-white border-2 border-dashed border-gray-200 rounded-3xl p-8 hover:border-blue-400 transition-all group relative cursor-pointer active:scale-95 shadow-sm hover:shadow-xl">
      <input 
        type="file" 
        accept=".xlsx, .xls"
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(type, e.target.files[0])}
      />
      <div className="flex flex-col items-center text-center">
        {files[type] ? (
          <div className="bg-green-500 p-4 rounded-full mb-4 shadow-lg shadow-green-200">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-full mb-4 group-hover:bg-blue-50 transition-colors">
            <Upload className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
        )}
        <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">{label}</h4>
        <p className="text-[10px] text-gray-400 mt-1 mb-4 uppercase tracking-[0.2em] font-black">{description}</p>
        {files[type] && (
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 uppercase truncate max-w-full">
            {files[type]}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="mb-12 animate-in fade-in duration-500">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-gray-900 p-3 rounded-2xl">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Carga de Fuentes Maestras</h2>
      </div>
      
      <div className="flex flex-wrap gap-8">
        <FileInput type="kardex" label="Kardex" description="Movimientos de Entrada/Salida" />
        <FileInput type="ventas" label="Ventas" description="Historial de Facturación" />
        <FileInput type="stock" label="Stock" description="Inventario Actual" />
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={() => isReady && startMapping({ ...rawDatasets, headers })}
          disabled={!isReady || loading}
          className="flex items-center space-x-4 px-16 py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xl hover:bg-black transition-all disabled:opacity-30 disabled:grayscale shadow-2xl active:scale-95 group"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              <span>Iniciar Configuración de Datos</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
