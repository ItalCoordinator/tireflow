
import React from 'react';
import { useAnalysis } from './AnalysisContext';
import { StockStatus } from '../types';
import { ShieldCheck, AlertCircle, Package, ArrowUpRight, TrendingDown, Clock } from 'lucide-react';

const Card = ({ title, value, subtitle, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-all group overflow-hidden relative">
    <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-500`}>
      <Icon className="w-24 h-24" />
    </div>
    <div className="relative z-10">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
      </div>
    </div>
    <p className="text-[10px] text-gray-400 font-bold uppercase mt-6 pt-4 border-t border-gray-50 flex items-center">
      <ShieldCheck className="w-3 h-3 mr-2 text-green-500" />
      {subtitle}
    </p>
  </div>
);

export const DashboardCards: React.FC = () => {
  const { reportItems, connectionDiagnostics } = useAnalysis();

  if (!Array.isArray(reportItems)) return null;

  const overstockCount = reportItems.filter(i => i.status === StockStatus.OVERSTOCK).length;
  const lowStockCount = reportItems.filter(i => i.status === StockStatus.LOW).length;
  const deadStockCount = reportItems.filter(i => i.status === StockStatus.DEAD).length;
  const totalCapital = reportItems.reduce((acc, i) => acc + (i.valorTotal || 0), 0);

  return (
    <div className="space-y-8">
      <div className={`p-4 rounded-2xl flex items-center justify-between ${connectionDiagnostics?.isValid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'} border border-current/10 font-black text-[10px] uppercase tracking-widest`}>
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full animate-pulse ${connectionDiagnostics?.isValid ? 'bg-green-500' : 'bg-amber-500'}`}></div>
          <span>Estado de Integridad: {connectionDiagnostics?.isValid ? 'Óptimo' : 'Parcial'}</span>
        </div>
        <span>{reportItems.length} SKUs bajo monitoreo activo</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card 
          title="Capital en Almacén" 
          value={`R$ ${totalCapital.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`}
          subtitle="Valor total del inventario"
          icon={Package}
          colorClass="bg-blue-600 text-white shadow-blue-200"
        />
        <Card 
          title="Sobre-Stock" 
          value={overstockCount.toLocaleString()}
          subtitle="Capital con baja rotación"
          icon={ArrowUpRight}
          colorClass="bg-red-500 text-white shadow-red-200"
        />
        <Card 
          title="Stock Bajo" 
          value={lowStockCount.toLocaleString()}
          subtitle="Riesgo de quiebre de stock"
          icon={TrendingDown}
          colorClass="bg-amber-500 text-white shadow-amber-200"
        />
        <Card 
          title="Stock Parado" 
          value={deadStockCount.toLocaleString()}
          subtitle={`Sin ventas (+90 días)`}
          icon={Clock}
          colorClass="bg-gray-900 text-white shadow-gray-300"
        />
      </div>
    </div>
  );
};
