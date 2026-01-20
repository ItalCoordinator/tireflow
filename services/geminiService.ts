
import { GoogleGenAI } from "@google/genai";
import { UnifiedReportItem, StockStatus } from "../types";

export const getInventoryInsights = async (report: UnifiedReportItem[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const totalItems = report.length;
  const overstockItems = report.filter(i => i.status === StockStatus.OVERSTOCK).length;
  const lowStockItems = report.filter(i => i.status === StockStatus.LOW).length;
  const deadStockItems = report.filter(i => i.status === StockStatus.DEAD).length;
  const totalValueDeadStock = report.filter(i => i.status === StockStatus.DEAD).reduce((acc, i) => acc + i.valorTotal, 0);

  const sampleProblematic = report
    .filter(i => i.status !== StockStatus.OK)
    .slice(0, 8)
    .map(i => `- ${i.producto} (${i.local}): Status ${i.status}, Stock ${i.stockAtual}, Ideal ${i.estoqueIdeal}`)
    .join('\n');

  const prompt = `
    Como arquitecto de software y analista de datos experto en el sector de neumáticos, analiza este resumen de inventario:
    
    ESTADÍSTICAS GENERALES:
    - SKUs monitoreados: ${totalItems}
    - Ítems en Sobrestock: ${overstockItems}
    - Ítems con Stock Bajo: ${lowStockItems}
    - Ítems Parados (Sin ventas): ${deadStockItems}
    - Capital Inmovilizado en Stock Parado: R$ ${totalValueDeadStock.toLocaleString('es-ES')}

    EJEMPLOS DE ÍTEMS CRÍTICOS:
    ${sampleProblematic}

    TAREAS:
    1. Sugiere 3 campañas comerciales específicas para mover el stock parado.
    2. Identifica oportunidades de transferencia entre locales (ej: donde uno tiene sobrestock y otro falta).
    3. Recomienda una política de descuentos o combos para marcas específicas si hay patrones.
    4. Haz una breve previsión basada en estos desequilibrios.

    Responde en ESPAÑOL con un tono profesional y accionable, usa Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lo sentimos, no fue posible generar insights en este momento.";
  }
};
