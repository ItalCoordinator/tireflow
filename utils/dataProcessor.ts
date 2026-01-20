
import { 
  KardexEntry, 
  VentasEntry, 
  StockEntry, 
  UnifiedReportItem, 
  StockStatus, 
  ConfigParams, 
  ConnectionDiagnostic,
  ColumnMapping
} from '../types';

/**
 * Normaliza strings para llaves de unión (Uppercase, trim, remove hyphens)
 */
export const normalizeKey = (val: any): string => {
  if (val === null || val === undefined) return 'N/A';
  return String(val)
    .trim()
    .toUpperCase()
    .replace(/-/g, '');
};

export const calculateDaysBetween = (d1: Date, d2: Date): number => {
  try {
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

/**
 * Procesa los datos crudos usando el mapeo de columnas definido por el usuario
 */
export const processMappedData = (raw: any[], mapping: any, type: 'kardex' | 'ventas' | 'stock'): any[] => {
  return raw.map(row => {
    const getVal = (key: string) => row[mapping[key]];
    
    if (type === 'kardex') {
      return {
        codigo: normalizeKey(getVal('codigo')),
        producto: String(getVal('producto') || 'Sin Nombre'),
        local: normalizeKey(getVal('local')),
        data: new Date(getVal('fecha')),
        tipo: String(getVal('tipo')).toLowerCase().includes('ent') ? 'entrada' : 'salida',
        quantidade: Number(getVal('cantidad') || 0)
      } as KardexEntry;
    }
    
    if (type === 'ventas') {
      return {
        codigo: normalizeKey(getVal('codigo')),
        producto: String(getVal('producto') || 'Sin Nombre'),
        local: normalizeKey(getVal('local')),
        data: new Date(getVal('fecha')),
        quantidade: Number(getVal('cantidad') || 0),
        valor: Number(getVal('valor') || 0)
      } as VentasEntry;
    }
    
    return {
      codigo: normalizeKey(getVal('codigo')),
      producto: String(getVal('producto') || 'Sin Nombre'),
      local: normalizeKey(getVal('local')),
      quantidadeAtual: Number(getVal('stockActual') || 0),
      valorUnitario: Number(getVal('valorUnitario') || 0),
      valorTotal: Number(getVal('valorTotal') || 0)
    } as StockEntry;
  });
};

export const generateUnifiedReport = (
  kardex: KardexEntry[],
  ventas: VentasEntry[],
  stock: StockEntry[],
  config: ConfigParams,
  ignoreLocal: boolean
): { items: UnifiedReportItem[], diagnostics: ConnectionDiagnostic } => {
  const today = new Date();
  const reportMap = new Map<string, Partial<UnifiedReportItem>>();
  
  const createKey = (codigo: string, local: string) => ignoreLocal ? codigo : `${codigo}-${local}`;
  
  const stockKeys = new Set(stock.map(s => createKey(s.codigo, s.local)));
  const salesKeys = new Set(ventas.map(v => createKey(v.codigo, v.local)));
  
  let totalInAll = 0;
  let stockOnly = 0;
  let ventasOnly = 0;

  // 1. Población base desde Stock
  stock.forEach(s => {
    const key = createKey(s.codigo, s.local);
    if (salesKeys.has(key)) totalInAll++;
    else stockOnly++;

    reportMap.set(key, {
      id: key,
      codigo: s.codigo,
      producto: s.producto,
      marca: 'N/A', // Opcional, se podría extraer del nombre
      local: ignoreLocal ? 'GLOBAL' : s.local,
      stockAtual: s.quantidadeAtual,
      valorUnitario: s.valorUnitario,
      valorTotal: s.valorTotal,
      vendas30d: 0,
      vendas60d: 0,
      vendas90d: 0,
      mediaMensal: 0,
      dataUltimaVenda: null,
      diasSemVender: 999,
      dataUltimoMovimento: null,
      diasEstoque: 0,
    });
  });

  // 2. Enriquecimiento con Ventas
  ventas.forEach(v => {
    const key = createKey(v.codigo, v.local);
    if (!stockKeys.has(key)) ventasOnly++;
    
    const entry = reportMap.get(key);
    if (entry) {
      const daysAgo = calculateDaysBetween(v.data, today);
      if (daysAgo <= 30) entry.vendas30d = (entry.vendas30d || 0) + v.quantidade;
      if (daysAgo <= 60) entry.vendas60d = (entry.vendas60d || 0) + v.quantidade;
      if (daysAgo <= 90) entry.vendas90d = (entry.vendas90d || 0) + v.quantidade;

      if (!entry.dataUltimaVenda || v.data > entry.dataUltimaVenda) {
        entry.dataUltimaVenda = v.data;
        entry.diasSemVender = daysAgo;
      }
    }
  });

  // 3. Enriquecimiento con Kardex (Ultimo movimiento)
  kardex.forEach(k => {
    const key = createKey(k.codigo, k.local);
    const entry = reportMap.get(key);
    if (entry) {
      if (!entry.dataUltimoMovimento || k.data > entry.dataUltimoMovimento) {
        entry.dataUltimoMovimento = k.data;
        entry.diasEstoque = calculateDaysBetween(k.data, today);
      }
    }
  });

  // 4. Cálculos finales y estatus
  const items: UnifiedReportItem[] = Array.from(reportMap.values()).map(item => {
    const media = (item.vendas90d || 0) / 3;
    const estoqueIdeal = Math.max(1, Math.ceil(media * config.fatorEstoqueIdeal));
    const consumo3Meses = media * 3;
    const stockQty = item.stockAtual || 0;

    let status = StockStatus.OK;
    if ((item.diasSemVender || 0) > config.diasEstoqueParadoThreshold && stockQty > 0) {
      status = StockStatus.DEAD;
    } else if (stockQty > estoqueIdeal * 1.5) {
      status = StockStatus.OVERSTOCK;
    } else if (stockQty < estoqueIdeal * 0.5) {
      status = StockStatus.LOW;
    }

    return {
      ...item,
      mediaMensal: media,
      estoqueIdeal,
      consumoProjetado3Meses: consumo3Meses,
      status
    } as UnifiedReportItem;
  });

  return {
    items,
    diagnostics: {
      totalInAll,
      stockOnly,
      ventasOnly,
      isValid: totalInAll > 0
    }
  };
};
