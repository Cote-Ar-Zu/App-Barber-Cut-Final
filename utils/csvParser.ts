/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RawServiceData, ComputedServiceData, ABCAnalysisSummary, CSVParseResult, BarberoVenta } from '../types';

const REQUIRED_HEADERS = [
  'sku',
  'nombre_servicio',
  'costo_unitario',
  'precio_venta',
  'barbero',
  'unidades_vendidas',
];

// Parsea una línea CSV respetando comillas (campos con comas dentro de "")
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function parseNumberSafe(value: string): number | null {
  if (value === undefined || value === null) return null;
  const cleaned = value.replace(/\$/g, '').replace(/\./g, '').replace(',', '.').trim();
  // Si el reemplazo de miles/decimales genera NaN, intenta parseo directo
  const direct = Number(value.trim());
  if (!isNaN(direct) && value.trim() !== '') return direct;
  const fallback = Number(cleaned);
  return isNaN(fallback) ? null : fallback;
}

/**
 * Parsea el contenido crudo del CSV subido por el usuario.
 * `barberosEsperados` es la lista de nombres ingresados por el usuario en el paso previo;
 * se usa solo para generar warnings informativos (no bloquea el parseo).
 */
export function parseCSV(content: string, barberosEsperados: string[] = []): CSVParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: RawServiceData[] = [];

  const lines = content
    .split(/\r\n|\n|\r/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    errors.push('El archivo está vacío.');
    return { data, errors, warnings };
  }

  const rawHeaders = parseCSVLine(lines[0]).map(normalizeHeader);
  const headerIndex: Record<string, number> = {};
  rawHeaders.forEach((h, i) => (headerIndex[h] = i));

  const missing = REQUIRED_HEADERS.filter((h) => !(h in headerIndex));
  if (missing.length > 0) {
    errors.push(
      `Faltan columnas obligatorias en el CSV: ${missing.join(', ')}. Encabezados esperados: ${REQUIRED_HEADERS.join(', ')}.`
    );
    return { data, errors, warnings };
  }

  const barberosEsperadosNorm = new Set(barberosEsperados.map((b) => b.trim().toLowerCase()));
  const barberosNoListados = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const cols = parseCSVLine(lines[i]);

    if (cols.length < REQUIRED_HEADERS.length) {
      warnings.push(`Fila ${rowNum}: columnas insuficientes, se omitió.`);
      continue;
    }

    const sku = cols[headerIndex['sku']]?.trim();
    const nombre_servicio = cols[headerIndex['nombre_servicio']]?.trim();
    const costo_unitario = parseNumberSafe(cols[headerIndex['costo_unitario']]);
    const precio_venta = parseNumberSafe(cols[headerIndex['precio_venta']]);
    const barbero = cols[headerIndex['barbero']]?.trim();
    const unidades_vendidas = parseNumberSafe(cols[headerIndex['unidades_vendidas']]);

    if (!sku || !nombre_servicio || !barbero) {
      warnings.push(`Fila ${rowNum}: faltan datos de texto (sku, nombre_servicio o barbero), se omitió.`);
      continue;
    }
    if (costo_unitario === null || precio_venta === null || unidades_vendidas === null) {
      warnings.push(`Fila ${rowNum}: valores numéricos inválidos, se omitió.`);
      continue;
    }
    if (costo_unitario < 0 || precio_venta < 0 || unidades_vendidas < 0) {
      warnings.push(`Fila ${rowNum}: valores negativos no permitidos, se omitió.`);
      continue;
    }
    if (precio_venta < costo_unitario) {
      warnings.push(`Fila ${rowNum}: "${nombre_servicio}" tiene precio de venta menor al costo unitario.`);
    }

    if (barberosEsperadosNorm.size > 0 && !barberosEsperadosNorm.has(barbero.toLowerCase())) {
      barberosNoListados.add(barbero);
    }

    data.push({
      sku,
      nombre_servicio,
      costo_unitario,
      precio_venta,
      barbero,
      unidades_vendidas,
    });
  }

  if (barberosNoListados.size > 0) {
    warnings.push(
      `Se encontraron barberos en el archivo que no estaban en tu lista: ${Array.from(barberosNoListados).join(', ')}. Se incluyeron igualmente en el análisis.`
    );
  }

  if (data.length === 0 && errors.length === 0) {
    errors.push('No se encontraron filas de datos válidas en el archivo.');
  }

  return { data, errors, warnings };
}

/**
 * Agrega filas crudas (servicio+barbero) por SKU y aplica la clasificación ABC de Pareto.
 */
export function performABCAnalysis(rawData: RawServiceData[]): {
  computed: ComputedServiceData[];
  summary: ABCAnalysisSummary;
} {
  // 1. Agrupar por SKU
  const groups = new Map<string, RawServiceData[]>();
  for (const row of rawData) {
    const key = row.sku;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  // 2. Calcular agregados por SKU
  const aggregated = Array.from(groups.entries()).map(([sku, rows]) => {
    const nombre_servicio = rows[0].nombre_servicio;
    const costo_unitario = rows[0].costo_unitario;
    const precio_venta = rows[0].precio_venta;

    const unidades_vendidas = rows.reduce((sum, r) => sum + r.unidades_vendidas, 0);
    const ingreso_total = unidades_vendidas * precio_venta;
    const costo_total = unidades_vendidas * costo_unitario;
    const utilidad_total = ingreso_total - costo_total;
    const margen_porcentaje = ingreso_total > 0 ? (utilidad_total / ingreso_total) * 100 : 0;

    const ventasPorBarbero: BarberoVenta[] = rows
      .map((r) => ({
        barbero: r.barbero,
        unidades_vendidas: r.unidades_vendidas,
        ingreso_total: r.unidades_vendidas * precio_venta,
      }))
      .sort((a, b) => b.unidades_vendidas - a.unidades_vendidas);

    return {
      sku,
      nombre_servicio,
      costo_unitario,
      precio_venta,
      unidades_vendidas,
      ingreso_total,
      costo_total,
      utilidad_total,
      margen_porcentaje,
      ventasPorBarbero,
    };
  });

  // 3. Ordenar de mayor a menor ingreso (base del análisis de Pareto)
  aggregated.sort((a, b) => b.ingreso_total - a.ingreso_total);

  const totalIngresos = aggregated.reduce((sum, s) => sum + s.ingreso_total, 0);
  const totalCostos = aggregated.reduce((sum, s) => sum + s.costo_total, 0);
  const totalUtilidad = aggregated.reduce((sum, s) => sum + s.utilidad_total, 0);
  const totalUnidades = aggregated.reduce((sum, s) => sum + s.unidades_vendidas, 0);

  // 4. Calcular porcentajes y porcentaje acumulado, asignar clase ABC
  let acumulado = 0;
  let countA = 0,
    countB = 0,
    countC = 0;
  let ingresosA = 0,
    ingresosB = 0,
    ingresosC = 0;

  const computed: ComputedServiceData[] = aggregated.map((item) => {
    const porcentaje_ingresos = totalIngresos > 0 ? (item.ingreso_total / totalIngresos) * 100 : 0;
    acumulado += porcentaje_ingresos;

    let categoria: 'A' | 'B' | 'C';
    if (acumulado <= 80) {
      categoria = 'A';
    } else if (acumulado <= 95) {
      categoria = 'B';
    } else {
      categoria = 'C';
    }

    if (categoria === 'A') {
      countA++;
      ingresosA += item.ingreso_total;
    } else if (categoria === 'B') {
      countB++;
      ingresosB += item.ingreso_total;
    } else {
      countC++;
      ingresosC += item.ingreso_total;
    }

    return {
      ...item,
      porcentaje_ingresos,
      porcentaje_acumulado: acumulado,
      categoria,
    };
  });

  const summary: ABCAnalysisSummary = {
    totalIngresos,
    totalCostos,
    totalUtilidad,
    totalUnidades,
    serviciosCount: computed.length,
    countA,
    countB,
    countC,
    ingresosA,
    ingresosB,
    ingresosC,
  };

  return { computed, summary };
}
