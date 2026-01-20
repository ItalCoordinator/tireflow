
import React, { useMemo } from 'react';
import { useAnalysis } from './AnalysisContext';
import { StockStatus, UnifiedReportItem } from '../types';
import { MoveRight, AlertTriangle, ArrowRightCircle } from 'lucide-react';

export const TransferList: React.FC = () => {
  const { reportItems } = useAnalysis();

  const recommendations = useMemo(() => {
    if (!Array.isArray(reportItems)) return [];
    
    const grouped = new Map<string, UnifiedReportItem[]>();
    reportItems.forEach(item => {
      const list = grouped.get(item.codigo) || [];
      list.push(item);
      grouped.set(item.codigo, list);
    });

    const suggestions: any[] = [];
    grouped.forEach((items, codigo) => {
      const overstock = items.find(i => i.status === StockStatus.OVERSTOCK);
      const lowStock = items.find(i => i.status === StockStatus.LOW || i.stockAtual === 0);

      if (overstock && lowStock) {
        const surplus = overstock.stockAtual - overstock.estoqueIdeal;
        const deficit = lowStock.estoqueIdeal - lowStock.stockAtual;
        const qty = Math.min(surplus, deficit);

        if (qty > 0) {
          suggestions.push({
            codigo,
            producto: overstock.producto,
            marca: overstock.marca,
            desde: overstock.local,
            hacia: lowStock.local,
            cantidad: qty,
            motivo: `Excedente en ${overstock.local} y falta crítica en ${lowStock.local}`
          });
        }
      }
    });
    return suggestions;
  }, [reportItems]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="bg-amber-50 p-10 rounded-[2.5rem] border border-amber-100 flex items-start space-x-6 shadow-sm">
        <div className="bg-amber-100 p-3 rounded-2xl shadow-sm"><AlertTriangle className="w-8 h-8 text-amber-600" /></div>
        <div>
          <h3 className="text-2xl font-black text-amber-900 mb-2">Equilibrio de Inventario</h3>
          <p className="text-amber-700 font-medium leading-relaxed max-w-2xl">
            Se han detectado {recommendations.length} oportunidades de transferencia directa. Mover stock entre sucursales reduce la necesidad de nuevas compras y libera capital inmovilizado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col lg:flex-row items-center justify-between group hover:border-blue-200 hover:shadow-2xl transition-all duration-500">
            <div className="flex-1 mb-8 lg:mb-0">
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">{rec.marca}</div>
              <h4 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{rec.producto}</h4>
              <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest">{rec.codigo} • {rec.motivo}</p>
            </div>

            <div className="flex items-center space-x-12 px-12 border-x border-gray-50 mx-12">
              <div className="text-center">
                <span className="text-[10px] uppercase font-black text-gray-300 block mb-2 tracking-widest">Desde</span>
                <p className="font-black text-gray-700 uppercase tracking-tighter text-sm">{rec.desde}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                <MoveRight className="w-8 h-8" />
              </div>
              <div className="text-center">
                <span className="text-[10px] uppercase font-black text-gray-300 block mb-2 tracking-widest">Hacia</span>
                <p className="font-black text-gray-700 uppercase tracking-tighter text-sm">{rec.hacia}</p>
              </div>
            </div>

            <div className="bg-gray-900 px-10 py-6 rounded-[2rem] text-center min-w-[160px] shadow-xl group-hover:scale-105 transition-transform">
              <span className="text-[10px] uppercase font-black text-gray-500 block mb-2 tracking-[0.3em]">Mover</span>
              <p className="text-4xl font-black text-white">{rec.cantidad}</p>
              <p className="text-[10px] text-blue-400 font-black uppercase mt-1 tracking-widest">Unidades</p>
            </div>
          </div>
        ))}
        
        {recommendations.length === 0 && (
          <div className="p-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-100">
            <ArrowRightCircle className="w-16 h-16 text-gray-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-300">Sin Movimientos Pendientes</h3>
            <p className="text-gray-400 mt-2 font-medium">El inventario se encuentra balanceado entre locales</p>
          </div>
        )}
      </div>
    </div>
  );
};
