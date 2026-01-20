
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
          const urgency = lowStock.diasEstoque === 0 ? 'Crítico' : 'Necesario';
          const reason = lowStock.diasEstoque === 0
            ? `Quiebre inminente: ${lowStock.local} sin stock. ${overstock.local} con exceso.`
            : `Bajo stock en ${lowStock.local} (${lowStock.diasEstoque} días disponibles). Excedente en ${overstock.local}.`;

          suggestions.push({
            codigo,
            producto: overstock.producto,
            marca: overstock.marca,
            desde: overstock.local,
            hacia: lowStock.local,
            cantidad: qty,
            motivo: reason,
            urgencia: urgency,
            diasDisponibles: lowStock.diasEstoque,
            excedente: surplus,
            deficit: deficit
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
        {recommendations.map((rec, idx) => {
          const isUrgent = rec.urgencia === 'Crítico';
          return (
          <div key={idx} className={`p-10 rounded-[2.5rem] border shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between group transition-all duration-500 ${
            isUrgent
              ? 'bg-red-50 border-red-200 hover:border-red-400 hover:shadow-2xl hover:shadow-red-100'
              : 'bg-white border-gray-50 hover:border-blue-200 hover:shadow-2xl'
          }`}>
            <div className="flex-1 mb-8 lg:mb-0 lg:mr-12">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{rec.marca}</div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isUrgent
                    ? 'bg-red-200 text-red-700'
                    : 'bg-amber-200 text-amber-700'
                }`}>
                  {rec.urgencia}
                </span>
              </div>
              <h4 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-3">{rec.producto}</h4>
              <div className="text-xs text-gray-600 font-medium mb-2 uppercase tracking-wider">SKU: {rec.codigo}</div>
              <p className={`text-sm font-medium leading-relaxed mt-3 ${isUrgent ? 'text-red-700' : 'text-gray-600'}`}>
                {rec.motivo}
              </p>
              {rec.diasDisponibles !== undefined && (
                <div className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Días de stock disponibles: <span className={isUrgent ? 'text-red-600' : 'text-blue-600'}>{rec.diasDisponibles}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 px-0 lg:px-12 lg:border-x border-gray-50 w-full lg:w-auto mb-8 lg:mb-0">
              <div className="text-center">
                <span className="text-[10px] uppercase font-black text-gray-300 block mb-2 tracking-widest">Desde (Excedente)</span>
                <p className="font-black text-gray-700 uppercase tracking-tighter text-sm">{rec.desde}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">+{rec.excedente} unidades</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-12 hidden lg:block">
                <MoveRight className="w-8 h-8" />
              </div>
              <div className="text-center">
                <span className="text-[10px] uppercase font-black text-gray-300 block mb-2 tracking-widest">Hacia (Falta)</span>
                <p className="font-black text-gray-700 uppercase tracking-tighter text-sm">{rec.hacia}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">-{rec.deficit} unidades</p>
              </div>
            </div>

            <div className={`px-10 py-6 rounded-[2rem] text-center min-w-[160px] shadow-xl group-hover:scale-105 transition-transform ${
              isUrgent
                ? 'bg-red-600 text-white'
                : 'bg-gray-900 text-white'
            }`}>
              <span className="text-[10px] uppercase font-black block mb-2 tracking-[0.3em]" style={{color: isUrgent ? '#fee2e2' : '#9ca3af'}}>Trasladar</span>
              <p className="text-4xl font-black">{rec.cantidad}</p>
              <p className="text-[10px] font-black uppercase mt-1 tracking-widest" style={{color: isUrgent ? '#fca5a5' : '#60a5fa'}}>Unidades</p>
            </div>
          </div>
        );
        })}
        
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
