import React, { useState, useMemo } from 'react';
import { useAnalysis } from './AnalysisContext';
import { calculateConsolidatedAnalysis, getStatusColor, getStatusLabel } from '../utils/consolidatedAnalysis';
import { getLocalTypeLabel } from '../utils/brandResolver';
import { TrendingUp, AlertCircle, Filter, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export const ComprehensiveAnalysis: React.FC = () => {
  const { reportItems } = useAnalysis();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const consolidated = useMemo(() => calculateConsolidatedAnalysis(reportItems), [reportItems]);

  const filteredData = useMemo(() => {
    return consolidated.filter(item => {
      const matchesSearch = item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.marca.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [consolidated, searchTerm, statusFilter]);

  const totalCapitalAtRisk = filteredData
    .filter(p => p.status === 'IMPORTAR_URGENTE')
    .reduce((acc, p) => acc + p.valorTotalImobilizado, 0);

  const totalSugestionQuantity = filteredData.reduce((acc, p) => acc + p.sugestionCantidad, 0);

  const handleExport = () => {
    if (filteredData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(filteredData.map(p => ({
      'Código': p.codigo,
      'Producto': p.producto,
      'Marca': p.marca,
      'Stock Total': p.stockTotal,
      'Stock Bodegas': p.stockBodegas,
      'Stock PDV': p.stockPuntosVenta,
      'Venta Mensual': p.ventaMensualPromedio.toFixed(1),
      'Cobertura (meses)': p.coberturaMeses.toFixed(2),
      'Status': getStatusLabel(p.status),
      'Sugerencia Compra': p.sugestionCantidad,
      'Valor Inmovilizado': `$${p.valorTotalImobilizado.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Análisis General");
    XLSX.writeFile(wb, `TyreFlow_Analisis_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">SKUs en Análisis Urgente</div>
          <div className="text-4xl font-black text-red-600 mb-3">
            {filteredData.filter(p => p.status === 'IMPORTAR_URGENTE').length}
          </div>
          <p className="text-xs text-gray-500 font-medium">Productos que requieren reorden inmediato</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Capital en Riesgo</div>
          <div className="text-3xl font-black text-red-600 mb-3">
            $ {totalCapitalAtRisk.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-gray-500 font-medium">Valor inmovilizado en SKUs críticos</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sugerencia Compra Total</div>
          <div className="text-4xl font-black text-blue-600 mb-3">
            {totalSugestionQuantity.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 font-medium">Unidades recomendadas para importación</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                placeholder="Buscar por código, producto o marca..."
                className="pl-6 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none w-full md:w-96 font-medium"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={handleExport}
              className="flex items-center space-x-3 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl text-sm font-black uppercase tracking-widest whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Exportar XLS</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <select
              className="px-6 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-black uppercase tracking-widest focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-gray-500 appearance-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los Status</option>
              <option value="IMPORTAR_URGENTE">Importar Urgente</option>
              <option value="REPOSICION_PROXIMA">Reposición Próxima</option>
              <option value="STOCK_SALUDABLE">Stock Saludable</option>
            </select>

            {(statusFilter || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className="px-4 py-3 text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest hover:bg-gray-100 rounded-2xl transition-all"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-8 py-6">Producto / SKU</th>
                <th className="px-8 py-6">Marca</th>
                <th className="px-8 py-6">Stock Total</th>
                <th className="px-8 py-6">Bodega / PDV</th>
                <th className="px-8 py-6">Venta Mensual</th>
                <th className="px-8 py-6">Cobertura</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Sugerencia Compra</th>
                <th className="px-8 py-6 text-right">Valor Inmovilizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map(product => (
                <tr key={product.codigo} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{product.producto}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{product.codigo}</div>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-600 text-sm uppercase">{product.marca}</td>
                  <td className="px-8 py-6 font-black text-lg">{product.stockTotal}</td>
                  <td className="px-8 py-6 font-medium text-gray-600 text-sm">
                    <div>{product.stockBodegas} / {product.stockPuntosVenta}</div>
                  </td>
                  <td className="px-8 py-6 font-medium text-gray-500">{product.ventaMensualPromedio.toFixed(1)}</td>
                  <td className="px-8 py-6 font-medium text-gray-600">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                      product.coberturaMeses < 0.5 ? 'bg-red-100 text-red-700' :
                      product.coberturaMeses < 1.5 ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {product.coberturaMeses.toFixed(2)} meses
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${getStatusColor(product.status)}`}>
                      {getStatusLabel(product.status)}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-black text-blue-600 text-lg">{product.sugestionCantidad}</td>
                  <td className="px-8 py-6 text-right font-black text-gray-900">
                    $ {product.valorTotalImobilizado.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="p-32 text-center">
              <Filter className="w-16 h-16 text-gray-100 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-gray-300">No se encontraron resultados</h3>
              <p className="text-gray-400 mt-2 font-medium">Ajusta los filtros de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {consolidated.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-10 rounded-[2.5rem]">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-2xl mt-1"><AlertCircle className="w-6 h-6 text-blue-600" /></div>
            <div>
              <h4 className="text-lg font-black text-blue-900 mb-3">Recomendaciones de Compra</h4>
              <ul className="space-y-2 text-sm text-blue-800 font-medium">
                <li>• Priorizar importación de {filteredData.filter(p => p.status === 'IMPORTAR_URGENTE').length} SKUs en estado crítico</li>
                <li>• Cantidad total sugerida: <strong>{totalSugestionQuantity} unidades</strong></li>
                <li>• Enfoque en productos con cobertura menor a 0.5 meses</li>
                <li>• Considerar consolidar compras para optimizar fletes internacionales</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
