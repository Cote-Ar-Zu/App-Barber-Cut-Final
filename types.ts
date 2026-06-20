/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Una fila cruda del CSV: una combinación servicio + barbero
export interface RawServiceData {
  sku: string;
  nombre_servicio: string;
  costo_unitario: number;
  precio_venta: number;
  barbero: string;
  unidades_vendidas: number;
}

// Detalle de ventas de un barbero para un servicio específico (usado en el modal)
export interface BarberoVenta {
  barbero: string;
  unidades_vendidas: number;
  ingreso_total: number;
}

// Datos agregados por SKU (sumando todos los barberos) — base del análisis ABC
export interface ComputedServiceData {
  sku: string;
  nombre_servicio: string;
  costo_unitario: number;
  precio_venta: number;
  unidades_vendidas: number;
  ingreso_total: number;
  costo_total: number;
  utilidad_total: number;
  margen_porcentaje: number; // (utilidad / ingreso) * 100
  porcentaje_ingresos: number; // (ingreso_total / total_ingresos) * 100
  porcentaje_acumulado: number; // cumulative running percentage
  categoria: 'A' | 'B' | 'C';
  ventasPorBarbero: BarberoVenta[];
}

export interface ABCAnalysisSummary {
  totalIngresos: number;
  totalCostos: number;
  totalUtilidad: number;
  totalUnidades: number;
  serviciosCount: number;
  countA: number;
  countB: number;
  countC: number;
  ingresosA: number;
  ingresosB: number;
  ingresosC: number;
}

export interface CSVParseResult {
  data: RawServiceData[];
  errors: string[];
  warnings: string[];
}
