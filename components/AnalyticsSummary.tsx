/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ABCAnalysisSummary, ComputedServiceData } from '../types';
import { DollarSign, PiggyBank, Briefcase, PlusCircle, Award, Percent } from 'lucide-react';

interface AnalyticsSummaryProps {
  summary: ABCAnalysisSummary;
  computedData: ComputedServiceData[];
}

const formatCLP = (value: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);

const CLASS_META: Record<'A' | 'B' | 'C', { titulo: string; subtitulo: string; color: string; bg: string; border: string; acciones: string[] }> = {
  A: {
    titulo: 'Clase A (Estrella)',
    subtitulo: 'Sostiene el 80% del ingreso',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    acciones: [
      'Control Riguroso: Cero quiebres de material de barbería crudo (champús, ceras, etc).',
      'Agilización Agenda: Optimiza horarios estrella para estos servicios con mayores recursos.',
      'Cuidado del Margen: Evalúa incrementos de precio sutiles periódicos, ya que son inelásticos.',
    ],
  },
  B: {
    titulo: 'Clase B (Intermedio)',
    subtitulo: 'Aporta el 15% del ingreso',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/20',
    acciones: [
      'Incentivos de Compra: Implementa combos para que migren a transacciones de Clase A.',
      'Control de Costos: Consolida stock de seguridad para evitar estancamientos financieros.',
      'Soporte General: Buen pilar de servicios recurrentes que amortiguan gastos fijos.',
    ],
  },
  C: {
    titulo: 'Clase C (Bajo Impacto)',
    subtitulo: 'Aporta el 5% del ingreso',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    acciones: [
      'Simplificación: Minimiza o automatiza compras de materiales para estos servicios.',
      'Combos de Salida: Úsalos como obsequio o complemento en promociones de alto valor.',
      'Eliminación: Evalúa retirar el servicio si el tiempo de preparación o costo operativo es alto.',
    ],
  },
};

export default function AnalyticsSummary({ summary, computedData }: AnalyticsSummaryProps) {
  const margenGlobal = summary.totalIngresos > 0 ? (summary.totalUtilidad / summary.totalIngresos) * 100 : 0;

  // Diagnóstico de Pareto: % de servicios que son Clase A vs % de ingresos que acumulan
  const porcentajeServiciosA = summary.serviciosCount > 0 ? (summary.countA / summary.serviciosCount) * 100 : 0;
  const porcentajeIngresosA = summary.totalIngresos > 0 ? (summary.ingresosA / summary.totalIngresos) * 100 : 0;
  const cumplePareto = porcentajeIngresosA >= 70;

  const cards = [
    { label: 'Ingreso Bruto Total', value: formatCLP(summary.totalIngresos), icon: DollarSign, color: 'text-amber-400' },
    { label: 'Costo Operativo Suma', value: formatCLP(summary.totalCostos), icon: PiggyBank, color: 'text-rose-400' },
    { label: 'Utilidad Operativa Real', value: formatCLP(summary.totalUtilidad), icon: Briefcase, color: 'text-emerald-400' },
    { label: 'Suma de Unidades Vendidas', value: `${summary.totalUnidades.toLocaleString('es-CL')} servicios`, icon: PlusCircle, color: 'text-sky-400' },
  ];

  const classBreakdown: Array<{ key: 'A' | 'B' | 'C'; count: number; ingresos: number }> = [
    { key: 'A', count: summary.countA, ingresos: summary.ingresosA },
    { key: 'B', count: summary.countB, ingresos: summary.ingresosB },
    { key: 'C', count: summary.countC, ingresos: summary.ingresosC },
  ];

  return (
    <div className="space-y-6">
      {/* Diagnóstico de Pareto */}
      <div className="rounded-2xl border border-amber-400/15 bg-gradient-to-br from-amber-400/5 to-transparent p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Diagnóstico de Pareto BarberCut
          </h3>
        </div>

        <p className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed">
          {cumplePareto ? '¡La Ley del 80/20 se cumple! ' : 'Atención: la concentración de ingresos es distinta al 80/20 clásico. '}
          El <span className="text-amber-400 font-bold">{porcentajeServiciosA.toFixed(0)}%</span> de tus servicios genera el{' '}
          <span className="text-amber-400 font-bold">{porcentajeIngresosA.toFixed(0)}%</span> de tus ingresos totales.
        </p>

        <p className="text-sm text-slate-400 leading-relaxed">
          Concentra tus esfuerzos operativos, campañas publicitarias y compras de insumos principalmente en estos
          servicios críticos de <span className="text-amber-400 font-semibold">Clase A</span>. Ellos sostienen la
          rentabilidad completa de tu barbería.
        </p>

        <div className="inline-flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
          <span className="flex items-center gap-1.5 text-xxs font-semibold uppercase tracking-wider text-slate-500">
            <Percent className="h-3 w-3" />
            Margen Operativo Global
          </span>
          <span className="text-2xl font-bold text-emerald-400">{margenGlobal.toFixed(1)}%</span>
        </div>
      </div>

      {/* Tarjetas de metricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-900 bg-slate-950/40 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500">{card.label}</span>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tarjetas de clasificacion ABC con accion estrategica */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {classBreakdown.map((c) => {
          const meta = CLASS_META[c.key];
          return (
            <div key={c.key} className={`rounded-2xl border ${meta.border} bg-slate-950/40 p-5 space-y-4`}>
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center h-9 w-9 rounded-lg ${meta.bg} ${meta.color} font-bold text-sm border ${meta.border}`}>
                  {c.key}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-100">{meta.titulo}</p>
                  <p className="text-xxs text-slate-500">{meta.subtitulo}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-b border-slate-900 py-3">
                <div>
                  <p className="text-xxs text-slate-500 uppercase tracking-wider">Servicios</p>
                  <p className="text-base font-bold text-slate-200">{c.count}</p>
                </div>
                <div className="text-right">
                  <p className="text-xxs text-slate-500 uppercase tracking-wider">Ventas</p>
                  <p className={`text-base font-bold ${meta.color}`}>{formatCLP(c.ingresos)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xxs font-bold uppercase tracking-wider text-slate-400">Acción Estratégica:</p>
                <ul className="space-y-1.5">
                  {meta.acciones.map((accion, i) => {
                    const [titulo, ...resto] = accion.split(':');
                    return (
                      <li key={i} className="text-xxs text-slate-400 leading-relaxed">
                        <span className="font-semibold text-slate-300">{titulo}:</span>
                        {resto.join(':')}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
