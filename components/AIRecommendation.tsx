
import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { getInventoryInsights } from '../services/geminiService';
import { useAnalysis } from './AnalysisContext';

export const AIRecommendation: React.FC = () => {
  const { reportItems } = useAnalysis();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);

  const generate = async () => {
    if (!reportItems || reportItems.length === 0) return;
    setLoading(true);
    try {
      const result = await getInventoryInsights(reportItems);
      setInsights(result || "No se pudieron obtener recomendaciones en este momento.");
    } catch (error) {
      setInsights("Ocurrió un error al intentar conectar con el motor de IA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportItems && reportItems.length > 0 && !insights && !loading) {
      generate();
    }
  }, [reportItems]);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-black rounded-[3rem] shadow-2xl p-12 text-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
        <Sparkles className="w-64 h-64" />
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          <div className="flex items-center space-x-6">
            <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-500/20"><Sparkles className="w-8 h-8" /></div>
            <div>
              <h3 className="text-3xl font-black tracking-tight">Análisis Inteligente TyreFlow</h3>
              <p className="text-blue-300 font-bold text-sm uppercase tracking-widest mt-1">Recomendaciones estratégicas basadas en IA</p>
            </div>
          </div>
          <button 
            onClick={generate}
            disabled={loading}
            className="px-10 py-5 bg-white text-gray-900 font-black rounded-[1.5rem] hover:bg-blue-50 transition-all flex items-center space-x-4 disabled:opacity-50 shadow-2xl active:scale-95 text-sm uppercase tracking-widest"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            <span>{insights ? "Actualizar Insights" : "Generando..."}</span>
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-8 animate-pulse">
            <div className="w-24 h-24 border-8 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-xl font-black text-blue-200 tracking-widest uppercase">Cruzando patrones de demanda con IA...</p>
          </div>
        ) : insights ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-10 border border-white/10 shadow-inner prose prose-invert max-w-none">
            <div className="space-y-6">
              {insights.split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={i} className="h-4" />;
                if (trimmed.startsWith('#')) return <h4 key={i} className="text-2xl font-black border-b border-white/10 pb-4 mb-6 text-blue-400">{trimmed.replace(/#/g, '')}</h4>;
                if (trimmed.startsWith('**') || trimmed.match(/^\d\./)) 
                  return <p key={i} className="font-black text-xl text-white tracking-tight leading-relaxed">{trimmed.replace(/\*\*/g, '')}</p>;
                return <p key={i} className="text-gray-400 font-medium leading-relaxed">{trimmed}</p>;
              })}
            </div>
          </div>
        ) : (
          <div className="py-32 border-4 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center text-center">
            <p className="text-2xl font-black text-white/30 tracking-widest uppercase">Iniciando motor de IA...</p>
          </div>
        )}
      </div>
    </div>
  );
};
