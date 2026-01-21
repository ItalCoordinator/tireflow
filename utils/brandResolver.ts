export const BRAND_PREFIXES: Record<string, string> = {
  'BR-': 'Bridgestone',
  'MIC-': 'Michelin',
  'GY-': 'Goodyear',
  'PIR-': 'Pirelli',
  'CON-': 'Continental',
  'FIR-': 'Firestone',
  'YOK-': 'Yokohama',
  'HAN-': 'Hankook',
  'DUN-': 'Dunlop',
  'LING-': 'Linglong',
  'TOY-': 'Toyo',
  'KUM-': 'Kumho'
};

export const resolveBrand = (codigo: string): string => {
  if (!codigo) return 'Sin definir';

  for (const [prefix, brand] of Object.entries(BRAND_PREFIXES)) {
    if (codigo.toUpperCase().startsWith(prefix)) {
      return brand;
    }
  }

  return 'Otro';
};

export const getLocalType = (localName: string): 'WAREHOUSE' | 'STORE' => {
  if (!localName) return 'STORE';

  const name = localName.toUpperCase();
  const warehouseKeywords = ['DEPOSITO', 'BODEGA', 'CENTRAL', 'ALMACEN', 'WAREHOUSE', 'DC', 'DISTRIBUTION'];

  for (const keyword of warehouseKeywords) {
    if (name.includes(keyword)) {
      return 'WAREHOUSE';
    }
  }

  return 'STORE';
};

export const getLocalTypeLabel = (type: 'WAREHOUSE' | 'STORE'): string => {
  return type === 'WAREHOUSE' ? 'Bodega' : 'Punto de Venta';
};
