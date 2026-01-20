
import React, { useState } from 'react';
import { useAnalysis } from './AnalysisContext';
import { ColumnMapping } from '../types';
import { Columns, ArrowRight, ShieldCheck, Database, Info } from 'lucide-react';

export const ColumnMapper: React.FC = () => {
  const { rawStore, applyMapping, reset } = useAnalysis();
  
  const [ignoreLocal, setIgnoreLocal] = useState(false);
  const [mapping, setMapping] = useState<ColumnMapping>({
    ignoreLocal: false,
    kardex: { codigo: '', producto: '', local: '', fecha: '', cantidad: '', tipo: '' },
    ventas: { codigo: '', producto: '', local: '', fecha: '', cantidad: '', valor: '' },
    stock: { codigo: '', producto: '', local: '', stockActual: '', valorUnitario: '', valorTotal: '' }
  });

  if (!rawStore) return null;

  const autoMap = (headers: string[], targets: string[]) => {
    const map: any = {};
    targets.forEach(target => {
      const found = headers.find(h => h.toLowerCase().includes(target.toLowerCase()));
      if (found) map[target] = found;
    });
    return map;
  };

  const handleApply = () => {
    applyMapping({ ...mapping, ignoreLocal });
  };

  const Section = ({ title, type, fields }: any) => {
    const headers = (rawStore.headers as any)[type];
    return (
      <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-200/50">
        <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-6 flex items-center">
          <Database className="w-4 h-4 mr-2 text-blue-600" />
          Archivo {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field: any) => {
            const isLocal = field.id === 'local';
            return (
              <div key={field.id} className={isLocal && ignoreLocal ? 'opacity-30 pointer-events-none' : ''}>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={(mapping as any)[type][field.id]}
                  onChange={e => setMapping({
                    ...mapping,
                    [type]: { ...(mapping as any)[type], [field.id]: e.target.value }
                  })}
                >
                  <option value="">Seleccionar Columna...</option>
                  {headers.map((h: string) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const isComplete = () => {
    const k = mapping.kardex;
    const v = mapping.ventas;
    const s = mapping.stock;
    
    const baseK = k.codigo && k.producto && k.fecha && k.cantidad;
    const baseV = v.codigo && v.producto && v.fecha && v.cantidad;
    const baseS = s.codigo && s.producto && s.stockActual;
    
    if (ignoreLocal) return baseK && baseV && baseS;
    return baseK && k.local && baseV && v.local && baseS && s.local;
  };

  return (
    <div className="max-w-6xl mx-auto my-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 p-10 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Mapeo de Columnas</h2>
              <p className="text-gray-400 text-sm mt-2 font-medium">Asigne las columnas de su archivo a los campos del sistema</p>
            </div>
            <div className="flex items-center bg-white/5 p-4 rounded-2xl border border-white/10">
              <input 
                type="checkbox" 
                id="ignoreLocal" 
                className="w-5 h-5 accent-blue-600 rounded"
                checked={ignoreLocal}
                onChange={e => setIgnoreLocal(e.target.checked)}
              />
              <label htmlFor="ignoreLocal" className="ml-3 font-black text-xs uppercase tracking-widest cursor-pointer select-none">
                Ignorar Ubicación (Análisis Global)
              </label>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-10">
          <Section 
            title="KARDEX" 
            type="kardex" 
            fields={[
              { id: 'codigo', label: 'Código SKU', required: true },
              { id: 'producto', label: 'Descripción', required: true },
              { id: 'local', label: 'Localización / Vendedor', required: !ignoreLocal },
              { id: 'fecha', label: 'Fecha Movimiento', required: true },
              { id: 'cantidad', label: 'Cantidad', required: true },
              { id: 'tipo', label: 'Tipo (Entrada/Salida)', required: false },
            ]} 
          />
          
          <Section 
            title="VENTAS" 
            type="ventas" 
            fields={[
              { id: 'codigo', label: 'Código SKU', required: true },
              { id: 'producto', label: 'Descripción', required: true },
              { id: 'local', label: 'Localización / Vendedor', required: !ignoreLocal },
              { id: 'fecha', label: 'Fecha Factura', required: true },
              { id: 'cantidad', label: 'Cantidad Vendida', required: true },
              { id: 'valor', label: 'Valor Venta', required: false },
            ]} 
          />

          <Section 
            title="STOCK ACTUAL" 
            type="stock" 
            fields={[
              { id: 'codigo', label: 'Código SKU', required: true },
              { id: 'producto', label: 'Descripción', required: true },
              { id: 'local', label: 'Localización / Vendedor', required: !ignoreLocal },
              { id: 'stockActual', label: 'Stock Actual', required: true },
              { id: 'valorUnitario', label: 'Valor Unitario', required: false },
              { id: 'valorTotal', label: 'Valor Total', required: false },
            ]} 
          />

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start space-x-4">
            <Info className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              <strong>Importante:</strong> La normalización automática eliminará guiones y espacios extras en los códigos para asegurar que los datos de las tres tablas coincidan correctamente.
            </p>
          </div>

          <div className="flex items-center justify-between pt-6">
            <button onClick={reset} className="px-8 py-5 text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-900 transition-colors">
              Cancelar Carga
            </button>
            <button
              onClick={handleApply}
              disabled={!isComplete()}
              className="flex items-center space-x-4 px-12 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-blue-700 transition-all disabled:opacity-30 disabled:grayscale shadow-2xl shadow-blue-200 active:scale-95"
            >
              <span>Continuar al Diagnóstico</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
