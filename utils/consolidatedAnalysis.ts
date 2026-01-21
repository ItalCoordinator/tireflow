import { UnifiedReportItem } from '../types';
import { getLocalType } from './brandResolver';

export interface ConsolidatedProduct {
  codigo: string;
  producto: string;
  marca: string;
  stockTotal: number;
  stockBodegas: number;
  stockPuntosVenta: number;
  ventaMensualPromedio: number;
  venta3Meses: number;
  venta12Meses: number;
  coberturaMeses: number;
  valorTotalImobilizado: number;
  diasPromedio: number;
  status: 'IMPORTAR_URGENTE' | 'REPOSICION_PROXIMA' | 'STOCK_SALUDABLE';
  sugestionCantidad: number;
  locales: Array<{
    nombre: string;
    tipo: 'WAREHOUSE' | 'STORE';
    stock: number;
    estado: string;
  }>;
}

export const calculateConsolidatedAnalysis = (items: UnifiedReportItem[]): ConsolidatedProduct[] => {
  if (!Array.isArray(items)) return [];

  const grouped = new Map<string, UnifiedReportItem[]>();

  items.forEach(item => {
    const key = item.codigo;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });

  const consolidated: ConsolidatedProduct[] = [];

  grouped.forEach((itemsPerSku, codigo) => {
    if (itemsPerSku.length === 0) return;

    const first = itemsPerSku[0];
    const stockTotal = itemsPerSku.reduce((acc, i) => acc + (i.stockAtual || 0), 0);
    const ventaMensualPromedio = itemsPerSku.reduce((acc, i) => acc + (i.mediaMensal || 0), 0);
    const venta3Meses = itemsPerSku.reduce((acc, i) => acc + (i.consumoProjetado3Meses || 0), 0);
    const venta12Meses = ventaMensualPromedio * 12;
    const valorTotalImobilizado = itemsPerSku.reduce((acc, i) => acc + (i.valorTotal || 0), 0);
    const diasPromedio = itemsPerSku.reduce((acc, i) => acc + (i.diasEstoque || 0), 0) / itemsPerSku.length;

    const coberturaMeses = ventaMensualPromedio > 0 ? stockTotal / ventaMensualPromedio : 0;

    let status: ConsolidatedProduct['status'];
    if (coberturaMeses < 0.5) {
      status = 'IMPORTAR_URGENTE';
    } else if (coberturaMeses < 1.5) {
      status = 'REPOSICION_PROXIMA';
    } else {
      status = 'STOCK_SALUDABLE';
    }

    const sugestionCantidad = ventaMensualPromedio * 3 - stockTotal;

    const locales = itemsPerSku.map(item => ({
      nombre: item.local,
      tipo: getLocalType(item.local),
      stock: item.stockAtual,
      estado: item.status
    }));

    consolidated.push({
      codigo,
      producto: first.producto,
      marca: first.marca,
      stockTotal,
      stockBodegas: locales
        .filter(l => l.tipo === 'WAREHOUSE')
        .reduce((acc, l) => acc + l.stock, 0),
      stockPuntosVenta: locales
        .filter(l => l.tipo === 'STORE')
        .reduce((acc, l) => acc + l.stock, 0),
      ventaMensualPromedio,
      venta3Meses,
      venta12Meses,
      coberturaMeses,
      valorTotalImobilizado,
      diasPromedio,
      status,
      sugestionCantidad: Math.max(0, Math.ceil(sugestionCantidad)),
      locales
    });
  });

  return consolidated.sort((a, b) => {
    const statusOrder = { 'IMPORTAR_URGENTE': 0, 'REPOSICION_PROXIMA': 1, 'STOCK_SALUDABLE': 2 };
    const aOrder = statusOrder[a.status];
    const bOrder = statusOrder[b.status];
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (b.valorTotalImobilizado || 0) - (a.valorTotalImobilizado || 0);
  });
};

export const getStatusColor = (status: ConsolidatedProduct['status']): string => {
  switch (status) {
    case 'IMPORTAR_URGENTE':
      return 'bg-red-50 border-red-200 text-red-700';
    case 'REPOSICION_PROXIMA':
      return 'bg-amber-50 border-amber-200 text-amber-700';
    case 'STOCK_SALUDABLE':
      return 'bg-green-50 border-green-200 text-green-700';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700';
  }
};

export const getStatusLabel = (status: ConsolidatedProduct['status']): string => {
  switch (status) {
    case 'IMPORTAR_URGENTE':
      return 'Importar Urgente';
    case 'REPOSICION_PROXIMA':
      return 'Reposición Próxima';
    case 'STOCK_SALUDABLE':
      return 'Stock Saludable';
    default:
      return 'Sin definir';
  }
};
