
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useAnalysis } from './AnalysisContext';
import { RawDataStore } from '../types';

export const FileUploadSection: React.FC = () => {
  const { startMapping, applyMapping, confirmAnalysis } = useAnalysis();
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

  const handleDemoMode = async () => {
    setLoading(true);

    const generateDate = (daysAgo: number) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date;
    };

    const products = [
      { codigo: 'BR-175-70-R13', producto: 'Bridgestone Turanza 175/70 R13', marca: 'Bridgestone' },
      { codigo: 'MIC-185-65-R15', producto: 'Michelin Primacy 185/65 R15', marca: 'Michelin' },
      { codigo: 'GY-195-55-R16', producto: 'Goodyear Eagle 195/55 R16', marca: 'Goodyear' },
      { codigo: 'PIR-205-55-R16', producto: 'Pirelli Cinturato 205/55 R16', marca: 'Pirelli' },
      { codigo: 'CON-175-65-R14', producto: 'Continental ContiPremium 175/65 R14', marca: 'Continental' },
      { codigo: 'FIR-185-60-R15', producto: 'Firestone F700 185/60 R15', marca: 'Firestone' },
      { codigo: 'YOK-195-60-R15', producto: 'Yokohama BluEarth 195/60 R15', marca: 'Yokohama' },
      { codigo: 'HAN-205-65-R15', producto: 'Hankook Kinergy 205/65 R15', marca: 'Hankook' },
      { codigo: 'DUN-215-60-R16', producto: 'Dunlop SP Sport 215/60 R16', marca: 'Dunlop' },
      { codigo: 'BR-225-45-R17', producto: 'Bridgestone Potenza 225/45 R17', marca: 'Bridgestone' },
      { codigo: 'MIC-235-45-R18', producto: 'Michelin Pilot Sport 235/45 R18', marca: 'Michelin' },
      { codigo: 'GY-225-50-R17', producto: 'Goodyear Excellence 225/50 R17', marca: 'Goodyear' },
      { codigo: 'LING-175-70-R13', producto: 'Linglong Green Max 175/70 R13', marca: 'Linglong' },
      { codigo: 'TOY-185-65-R14', producto: 'Toyo Proxes 185/65 R14', marca: 'Toyo' },
      { codigo: 'KUM-195-65-R15', producto: 'Kumho Ecsta 195/65 R15', marca: 'Kumho' },
    ];

    const locations = ['DEPOSITO-CENTRAL', 'SUCURSAL-NORTE', 'SUCURSAL-SUR'];

    const mockKardex = [];
    const mockVentas = [];
    const mockStock = [];

    products.forEach(prod => {
      locations.forEach(loc => {
        const baseStock = Math.floor(Math.random() * 100) + 10;
        const monthlySales = Math.floor(Math.random() * 30) + 5;

        for (let i = 0; i < 20; i++) {
          const daysAgo = Math.floor(Math.random() * 120);
          mockKardex.push({
            'Código': prod.codigo,
            'Producto': prod.producto,
            'Local': loc,
            'Fecha': generateDate(daysAgo),
            'Cantidad': Math.floor(Math.random() * 20) + 1,
            'Tipo': Math.random() > 0.6 ? 'Entrada' : 'Salida'
          });
        }

        for (let i = 0; i < 15; i++) {
          const daysAgo = Math.floor(Math.random() * 90);
          const qty = Math.floor(Math.random() * 8) + 1;
          mockVentas.push({
            'Código': prod.codigo,
            'Producto': prod.producto,
            'Local': loc,
            'Fecha': generateDate(daysAgo),
            'Cantidad': qty,
            'Valor': qty * (Math.random() * 200 + 150)
          });
        }

        const isOverstock = Math.random() > 0.7;
        const isLowStock = !isOverstock && Math.random() > 0.8;
        const stockQty = isOverstock
          ? monthlySales * 8
          : isLowStock
            ? Math.floor(monthlySales * 0.3)
            : monthlySales * 3;

        mockStock.push({
          'Código': prod.codigo,
          'Producto': prod.producto,
          'Local': loc,
          'Stock Actual': Math.floor(stockQty),
          'Valor Unitario': Math.random() * 200 + 150,
          'Valor Total': stockQty * (Math.random() * 200 + 150)
        });
      });
    });

    const mockStore: RawDataStore = {
      kardex: mockKardex,
      ventas: mockVentas,
      stock: mockStock,
      headers: {
        kardex: ['Código', 'Producto', 'Local', 'Fecha', 'Cantidad', 'Tipo'],
        ventas: ['Código', 'Producto', 'Local', 'Fecha', 'Cantidad', 'Valor'],
        stock: ['Código', 'Producto', 'Local', 'Stock Actual', 'Valor Unitario', 'Valor Total']
      }
    };

    const mockMapping = {
      kardex: {
        codigo: 'Código',
        producto: 'Producto',
        local: 'Local',
        fecha: 'Fecha',
        cantidad: 'Cantidad',
        tipo: 'Tipo'
      },
      ventas: {
        codigo: 'Código',
        producto: 'Producto',
        local: 'Local',
        fecha: 'Fecha',
        cantidad: 'Cantidad',
        valor: 'Valor'
      },
      stock: {
        codigo: 'Código',
        producto: 'Producto',
        local: 'Local',
        stockActual: 'Stock Actual',
        valorUnitario: 'Valor Unitario',
        valorTotal: 'Valor Total'
      },
      ignoreLocal: false
    };

    startMapping(mockStore);

    setTimeout(() => {
      applyMapping(mockMapping);

      setTimeout(() => {
        confirmAnalysis();
        setLoading(false);
      }, 100);
    }, 100);
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

      <div className="mt-12 flex flex-col items-center gap-6">
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

        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-50 px-4 text-gray-400 font-black tracking-widest">O bien</span>
          </div>
        </div>

        <button
          onClick={handleDemoMode}
          disabled={loading}
          className="flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-[1.5rem] font-black text-sm hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-30 shadow-xl shadow-blue-200 active:scale-95 group"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>Cargar Datos de Demo</span>
        </button>
        <p className="text-xs text-gray-400 font-medium text-center max-w-md">
          Prueba la plataforma con datos de muestra realistas sin necesidad de cargar archivos
        </p>
      </div>
    </div>
  );
};
