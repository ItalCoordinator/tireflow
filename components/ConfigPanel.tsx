
import React from 'react';
import { ConfigParams } from '../types';
import { Settings, Info } from 'lucide-react';

interface Props {
  config: ConfigParams;
  onChange: (config: ConfigParams) => void;
}

export const ConfigPanel: React.FC<Props> = ({ config, onChange }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
      <div className="flex items-center space-x-2 mb-8 text-gray-800">
        <Settings className="w-5 h-5" />
        <h3 className="font-bold text-lg">Criterios de Análisis</h3>
      </div>
      
      <div className="space-y-8">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center justify-between">
            Fator de Stock Ideal
            <Info className="w-4 h-4 text-gray-300" />
          </label>
          <input 
            type="range" 
            min="1" 
            max="12" 
            step="0.5"
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            value={config.fatorEstoqueIdeal}
            onChange={e => onChange({...config, fatorEstoqueIdeal: parseFloat(e.target.value)})}
          />
          <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">
            <span>Mínimo</span>
            <span className="text-blue-600 text-sm">{config.fatorEstoqueIdeal}x Venta Prom.</span>
            <span>Máximo</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center justify-between">
            Alerta de Stock Parado
            <Info className="w-4 h-4 text-gray-300" />
          </label>
          <div className="relative">
            <input 
              type="number" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm pr-12 focus:ring-2 focus:ring-blue-500 transition outline-none font-bold"
              value={config.diasEstoqueParadoThreshold}
              onChange={e => onChange({...config, diasEstoqueParadoThreshold: parseInt(e.target.value) || 0})}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">Días</span>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Reglas Dinámicas</h4>
          <ul className="text-xs space-y-4 text-gray-600">
            <li className="flex items-start space-x-3">
              <span className="block w-2.5 h-2.5 rounded-full bg-red-500 mt-0.5 shadow-sm shadow-red-200"></span>
              <span><strong>Sobrestock:</strong> Excede {config.fatorEstoqueIdeal * 1.5}x la venta promedio.</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="block w-2.5 h-2.5 rounded-full bg-yellow-500 mt-0.5 shadow-sm shadow-yellow-200"></span>
              <span><strong>Stock Bajo:</strong> Inferior a {config.fatorEstoqueIdeal * 0.5}x la venta promedio.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
