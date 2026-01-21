
import React from 'react';
import { useAnalysis } from './AnalysisContext';
import { AppTab } from '../types';
import { LayoutDashboard, FileSpreadsheet, Truck, TrendingUp, BarChart3 } from 'lucide-react';

export const TabsNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useAnalysis();

  const tabs: { id: AppTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analisis', label: 'Análisis General', icon: BarChart3 },
    { id: 'reportes', label: 'Reportes', icon: FileSpreadsheet },
    { id: 'transferencias', label: 'Transferencias', icon: Truck },
    { id: 'planificacion', label: 'Planificación', icon: TrendingUp },
  ];

  return (
    <nav className="flex items-center space-x-2 bg-gray-100/50 p-2 rounded-[2rem] border border-gray-200/50 mb-12 no-print overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-3 px-8 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-300 whitespace-nowrap ${
              isActive
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 translate-y-[-2px]'
                : 'text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-sm'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
