
export enum AnalysisStatus {
  IDLE = 'idle',
  MAPPING = 'mapping',
  DIAGNOSING = 'diagnosing',
  ANALYZING = 'analyzing',
  READY = 'ready',
  ERROR = 'error'
}

export enum StockStatus {
  OK = 'OK',
  LOW = 'STOCK BAJO',
  OVERSTOCK = 'SOBRESTOCK',
  DEAD = 'PARADO'
}

export interface RawDataStore {
  kardex: any[];
  ventas: any[];
  stock: any[];
  headers: {
    kardex: string[];
    ventas: string[];
    stock: string[];
  };
}

export interface ColumnMapping {
  kardex: { codigo: string; producto: string; local: string; fecha: string; cantidad: string; tipo: string };
  ventas: { codigo: string; producto: string; local: string; fecha: string; cantidad: string; valor: string };
  stock: { codigo: string; producto: string; local: string; stockActual: string; valorUnitario: string; valorTotal: string };
  ignoreLocal: boolean;
}

export interface KardexEntry {
  codigo: string;
  producto: string;
  local: string;
  data: Date;
  tipo: 'entrada' | 'salida';
  quantidade: number;
}

export interface VentasEntry {
  codigo: string;
  producto: string;
  local: string;
  data: Date;
  quantidade: number;
  valor: number;
}

export interface StockEntry {
  codigo: string;
  producto: string;
  local: string;
  quantidadeAtual: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface FileDiagnostic {
  name: string;
  rowCount: number;
  isValid: boolean;
  // Added missing properties used in DataDiagnostics.tsx
  uniqueProducts: number;
  missingColumns: string[];
}

export interface ConnectionDiagnostic {
  totalInAll: number;
  stockOnly: number;
  ventasOnly: number;
  isValid: boolean;
}

export interface UnifiedReportItem {
  id: string; 
  codigo: string;
  producto: string;
  marca: string;
  local: string;
  stockAtual: number;
  valorUnitario: number;
  valorTotal: number;
  vendas30d: number;
  vendas60d: number;
  vendas90d: number;
  mediaMensal: number;
  dataUltimaVenda: Date | null;
  diasSemVender: number;
  dataUltimoMovimento: Date | null;
  diasEstoque: number;
  estoqueIdeal: number;
  status: StockStatus;
  consumoProjetado3Meses: number;
}

export interface ConfigParams {
  fatorEstoqueIdeal: number;
  diasEstoqueParadoThreshold: number;
  periodoAnaliseVendasDias: number;
}

export type AppTab = 'dashboard' | 'reportes' | 'transferencias' | 'planificacion';