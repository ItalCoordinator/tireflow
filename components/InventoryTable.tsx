
import React, { useState, useMemo } from 'react';
import { useAnalysis } from './AnalysisContext';
import { StockStatus } from '../types';
import { Search, Filter, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export const InventoryTable: React.FC = () => {
  const { reportItems } = useAnalysis();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredData = useMemo(() => {
    if (!Array.isArray(reportItems)) return [];
    return reportItems.filter(item => {
      const matchesSearch = 
        (item.producto || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.codigo || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reportItems, searchTerm, statusFilter]);

  const handleExport = () => {
    if (filteredData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(filteredData.map(r => ({
      'Código': r.codigo,
      'Producto': r.producto,
      'Marca': r.marca,
      'Local': r.local,
      'Stock Actual': r.stockAtual,
      'Venta Mensual': r.mediaMensal,
      'Ideal': r.estoqueIdeal,
      'Estado': r.status,
      'Inactividad (días)': r.diasSemVender,
      'Valor Total': r.valorTotal
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, `TyreFlow_Inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case StockStatus.OK: return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">🟢 OK</span>;
      case StockStatus.LOW: return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">🟡 Bajo</span>;
      case StockStatus.OVERSTOCK: return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">🔴 Sobre</span>;
      case StockStatus.DEAD: return <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">⚫ Parado</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por SKU o descripción..." 
              className="pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none w-full md:w-80 font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-black uppercase tracking-widest focus:bg-white transition-all outline-none text-gray-500 appearance-none"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los Estados</option>
            {Object.values(StockStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        
        <button 
          onClick={handleExport}
          className="flex items-center space-x-3 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 text-sm font-black uppercase tracking-widest"
        >
          <Download className="w-4 h-4" />
          <span>Exportar XLS</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <tr>
              <th className="px-8 py-6">Producto / Identificación</th>
              <th className="px-8 py-6">Localización</th>
              <th className="px-8 py-6">Stock Real</th>
              <th className="px-8 py-6">Venta Mensual</th>
              <th className="px-8 py-6">Estado / Alerta</th>
              <th className="px-8 py-6 text-right">Valorización</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredData.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{item.producto}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.codigo} • {item.marca}</div>
                </td>
                <td className="px-8 py-6 font-bold text-gray-600 uppercase text-xs">{item.local}</td>
                <td className="px-8 py-6 font-black text-lg">{item.stockAtual}</td>
                <td className="px-8 py-6 font-medium text-gray-500">{(item.mediaMensal || 0).toFixed(1)} / mes</td>
                <td className="px-8 py-6">{getStatusBadge(item.status)}</td>
                <td className="px-8 py-6 text-right font-black text-gray-900">
                  R$ {(item.valorTotal || 0).toLocaleString('es-ES')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="p-32 text-center">
            <Filter className="w-16 h-16 text-gray-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-300">No se encontraron resultados</h3>
            <p className="text-gray-400 mt-2 font-medium">Prueba ajustando los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};
