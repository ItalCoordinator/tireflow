
import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Search, Database, LayoutDashboard } from 'lucide-react';

export const LoadingAnalysis: React.FC = () => {
  const [step, setStep] = useState(0);
  const steps = [
    { label: 'Leyendo archivos maestros', icon: Database },
    { label: 'Validando integridad de columnas', icon: CheckCircle2 },
    { label: 'Cruzando Kardex, Ventas y Stock', icon: Search },
    { label: 'Generando dashboard estratégico', icon: LayoutDashboard },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 750);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="relative mb-12">
        <div className="w-32 h-32 border-8 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-600" />
        </div>
      </div>
      
      <div className="max-w-md w-full">
        <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Lendo y Analizando Datos</h2>
        
        <div className="space-y-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = idx < step;
            const isCurrent = idx === step;
            
            return (
              <div 
                key={idx} 
                className={`flex items-center space-x-4 p-4 rounded-2xl border transition-all duration-500 ${
                  isCompleted ? 'bg-green-50 border-green-100 text-green-700' : 
                  isCurrent ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-lg scale-105' : 
                  'bg-gray-50 border-gray-100 text-gray-400 opacity-50'
                }`}
              >
                <div className={`${isCompleted ? 'text-green-500' : isCurrent ? 'text-blue-500' : 'text-gray-300'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm tracking-tight">{s.label}</span>
                {isCompleted && <CheckCircle2 className="w-5 h-5 ml-auto animate-in zoom-in" />}
                {isCurrent && <Loader2 className="w-5 h-5 ml-auto animate-spin" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
