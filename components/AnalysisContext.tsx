
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { 
  UnifiedReportItem, 
  ConfigParams, 
  KardexEntry, 
  VentasEntry, 
  StockEntry, 
  FileDiagnostic, 
  ConnectionDiagnostic,
  AppTab,
  AnalysisStatus,
  RawDataStore,
  ColumnMapping
} from '../types';
import { generateUnifiedReport, processMappedData } from '../utils/dataProcessor';

interface AnalysisContextType {
  status: AnalysisStatus;
  rawStore: RawDataStore | null;
  mapping: ColumnMapping | null;
  reportItems: UnifiedReportItem[];
  connectionDiagnostics: ConnectionDiagnostic | null;
  // Added fileDiagnostics to the context type
  fileDiagnostics: {
    kardex: FileDiagnostic;
    ventas: FileDiagnostic;
    stock: FileDiagnostic;
  };
  activeTab: AppTab;
  config: ConfigParams;
  
  startMapping: (store: RawDataStore) => void;
  applyMapping: (mapping: ColumnMapping) => void;
  confirmAnalysis: () => Promise<void>;
  setActiveTab: (tab: AppTab) => void;
  updateConfig: (config: ConfigParams) => void;
  reset: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [rawStore, setRawStore] = useState<RawDataStore | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [config, setConfig] = useState<ConfigParams>({
    fatorEstoqueIdeal: 3,
    diasEstoqueParadoThreshold: 90,
    periodoAnaliseVendasDias: 90
  });

  // Procesamiento de datos finales y diagnósticos
  const { reportItems, connectionDiagnostics, fileDiagnostics } = useMemo(() => {
    const defaultDiags = {
      kardex: { name: 'Kardex', rowCount: 0, isValid: false, uniqueProducts: 0, missingColumns: [] },
      ventas: { name: 'Ventas', rowCount: 0, isValid: false, uniqueProducts: 0, missingColumns: [] },
      stock: { name: 'Stock', rowCount: 0, isValid: false, uniqueProducts: 0, missingColumns: [] }
    };

    if (!rawStore || !mapping || (status !== AnalysisStatus.READY && status !== AnalysisStatus.DIAGNOSING)) {
      return { reportItems: [], connectionDiagnostics: null, fileDiagnostics: defaultDiags };
    }

    const getUniqueProducts = (data: any[], colName: string) => {
      if (!colName) return 0;
      const set = new Set();
      data.forEach(row => {
        if (row[colName]) set.add(row[colName]);
      });
      return set.size;
    };

    const getMissing = (type: 'kardex' | 'ventas' | 'stock') => {
      const m = mapping[type] as any;
      const required = [];
      if (type === 'kardex') required.push('codigo', 'producto', 'fecha', 'cantidad');
      if (type === 'ventas') required.push('codigo', 'producto', 'fecha', 'cantidad');
      if (type === 'stock') required.push('codigo', 'producto', 'stockActual');
      if (!mapping.ignoreLocal) required.push('local');
      return required.filter(field => !m[field]);
    };

    const kardexProcessed = processMappedData(rawStore.kardex, mapping.kardex, 'kardex');
    const ventasProcessed = processMappedData(rawStore.ventas, mapping.ventas, 'ventas');
    const stockProcessed = processMappedData(rawStore.stock, mapping.stock, 'stock');

    const result = generateUnifiedReport(kardexProcessed, ventasProcessed, stockProcessed, config, mapping.ignoreLocal);

    const diags = {
      kardex: {
        name: 'Kardex',
        rowCount: rawStore.kardex.length,
        uniqueProducts: getUniqueProducts(rawStore.kardex, mapping.kardex.codigo),
        missingColumns: getMissing('kardex'),
        isValid: getMissing('kardex').length === 0
      },
      ventas: {
        name: 'Ventas',
        rowCount: rawStore.ventas.length,
        uniqueProducts: getUniqueProducts(rawStore.ventas, mapping.ventas.codigo),
        missingColumns: getMissing('ventas'),
        isValid: getMissing('ventas').length === 0
      },
      stock: {
        name: 'Stock',
        rowCount: rawStore.stock.length,
        uniqueProducts: getUniqueProducts(rawStore.stock, mapping.stock.codigo),
        missingColumns: getMissing('stock'),
        isValid: getMissing('stock').length === 0
      }
    };

    return { 
      reportItems: result.items, 
      connectionDiagnostics: result.diagnostics,
      fileDiagnostics: diags
    };
  }, [rawStore, mapping, config, status]);

  const startMapping = (store: RawDataStore) => {
    setRawStore(store);
    setStatus(AnalysisStatus.MAPPING);
  };

  const applyMapping = (newMapping: ColumnMapping) => {
    setMapping(newMapping);
    setStatus(AnalysisStatus.DIAGNOSING);
  };

  const confirmAnalysis = async () => {
    setStatus(AnalysisStatus.ANALYZING);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setStatus(AnalysisStatus.READY);
  };

  const updateConfig = (newConfig: ConfigParams) => setConfig(newConfig);

  const reset = () => {
    setRawStore(null);
    setMapping(null);
    setStatus(AnalysisStatus.IDLE);
    setActiveTab('dashboard');
  };

  return (
    <AnalysisContext.Provider value={{
      status,
      rawStore,
      mapping,
      reportItems,
      connectionDiagnostics,
      fileDiagnostics,
      activeTab,
      config,
      startMapping,
      applyMapping,
      confirmAnalysis,
      setActiveTab,
      updateConfig,
      reset
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error('useAnalysis must be used within an AnalysisProvider');
  return context;
};