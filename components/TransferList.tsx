
import React, { useMemo, useState } from 'react';
import { useAnalysis } from './AnalysisContext';
import { StockStatus, UnifiedReportItem } from '../types';
import { MoveRight, AlertTriangle, ArrowRightCircle, Sliders } from 'lucide-react';
import { getLocalType, getLocalTypeLabel } from '../utils/brandResolver';

export const TransferList: React.FC = () => {
  const { reportItems } = useAnalysis();
  const [minQuantity, setMinQuantity] = useState(5);
  const [marcaFilter, setMarcaFilter] = useState('');
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);

  const marcas = useMemo(() => {
    if (!Array.isArray(reportItems)) return [];
    return [...new Set(reportItems.map(i => i.marca))].sort();
  }, [reportItems]);

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

        if (qty >= minQuantity) {
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

    return suggestions.filter(s => {
      const marcaMatch = !marcaFilter || s.marca === marcaFilter;
      const urgencyMatch = !showOnlyUrgent || s.urgencia === 'Crítico';
      return marcaMatch && urgencyMatch;
    });
  }, [reportItems, minQuantity, marcaFilter, showOnlyUrgent]);

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

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gray-100 p-3 rounded-2xl"><Sliders className="w-5 h-5 text-gray-600" /></div>
          <h4 className="text-xl font-black text-gray-900">Filtros de Transferencia</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Cantidad Mínima</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                value={minQuantity}
                onChange={e => setMinQuantity(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg font-black text-gray-900 min-w-[60px] text-right">{minQuantity}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Filtrar por Marca</label>
            <select
              value={marcaFilter}
              onChange={e => setMarcaFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold uppercase text-gray-600 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              <option value="">Todas las Marcas</option>
              {marcas.map(marca => <option key={marca} value={marca}>{marca}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Opciones</label>
            <label className="flex items-center space-x-3 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl cursor-pointer hover:bg-red-100 transition-colors">
              <input
                type="checkbox"
                checked={showOnlyUrgent}
                onChange={e => setShowOnlyUrgent(e.target.checked)}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-sm font-black text-red-700">Solo Críticos</span>
            </label>
          </div>
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
