
import React from 'react';
import { useAnalysis } from './AnalysisContext';
import { TrendingUp, Scale, Calculator, Info, ShieldAlert } from 'lucide-react';

export const PlanningView: React.FC = () => {
  const { reportItems, config } = useAnalysis();

  if (!Array.isArray(reportItems)) return null;

  const totalIdealValue = reportItems.reduce((acc, i) => acc + ((i.estoqueIdeal || 0) * (i.valorUnitario || 0)), 0);
  const totalCurrentValue = reportItems.reduce((acc, i) => acc + (i.valorTotal || 0), 0);
  const diff = totalCurrentValue - totalIdealValue;
  const riskSkus = reportItems.filter(i => (i.stockAtual || 0) < (i.consumoProjetado3Meses || 0)).length;

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-12 transition-transform duration-1000">
            <Scale className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-10">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg"><Scale className="w-6 h-6 text-white" /></div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Simulación de Balance</h3>
            </div>
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-6 border-b border-gray-50">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Valor Real Actual</span>
                <span className="text-2xl font-black text-gray-900">R$ {totalCurrentValue.toLocaleString('es-ES')}</span>
              </div>
              <div className="flex justify-between items-end pb-6 border-b border-gray-50">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Objetivo Teórico ({config.fatorEstoqueIdeal}x)</span>
                <span className="text-2xl font-black text-blue-600">R$ {totalIdealValue.toLocaleString('es-ES')}</span>
              </div>
              <div className={`p-8 rounded-[2rem] flex items-center justify-between shadow-xl ${diff > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                <div className="flex items-center space-x-3">
                  <Calculator className="w-6 h-6 opacity-50" />
                  <span className="text-xs font-black uppercase tracking-widest">Desviación de Capital</span>
                </div>
                <span className="text-3xl font-black">
                  {diff > 0 ? '+' : ''} R$ {diff.toLocaleString('es-ES')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-12 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
          <TrendingUp className="absolute right-[-40px] bottom-[-40px] w-96 h-96 opacity-5 group-hover:translate-x-4 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-10">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg"><TrendingUp className="w-6 h-6 text-white" /></div>
              <h3 className="text-2xl font-black tracking-tight">Proyección 90 Días</h3>
            </div>
            <p className="text-gray-400 text-sm mb-12 leading-relaxed font-medium uppercase tracking-wider">
              Análisis predictivo basado en el historial de facturación real para detectar riesgos de quiebre.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase text-blue-400 tracking-[0.3em] mb-4">Unidades Necesarias</p>
                <p className="text-5xl font-black">
                  {reportItems.reduce((acc, i) => acc + (i.consumoProjetado3Meses || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase text-red-400 tracking-[0.3em] mb-4">Riesgo de Quiebre</p>
                <div className="flex items-end space-x-3">
                  <p className="text-5xl font-black text-red-500">{riskSkus}</p>
                  <span className="text-xs font-black uppercase text-gray-500 pb-2">SKUs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm flex items-start space-x-8">
        <div className="bg-gray-50 p-4 rounded-2xl"><Info className="w-8 h-8 text-blue-500" /></div>
        <div className="max-w-4xl">
          <h4 className="text-xl font-black text-gray-900 mb-4">Nota sobre el Algoritmo</h4>
          <p className="text-gray-500 font-medium leading-relaxed mb-6">
            El factor actual de <strong>{config.fatorEstoqueIdeal}x</strong> multiplicado por la venta promedio mensual define el nivel de stock de seguridad. 
            Valores por debajo de este rango activan la alerta de <strong>"Bajo"</strong>, mientras que valores 50% superiores al ideal activan <strong>"Sobre-Stock"</strong>.
          </p>
          <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-xs font-bold uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4" />
            <span>Se recomienda un factor de 3x para importaciones y 1.5x para compras locales.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
