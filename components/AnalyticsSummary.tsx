/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ABCAnalysisSummary, ComputedServiceData } from '../types';
import { DollarSign, TrendingUp, Package, Percent } from 'lucide-react';

interface AnalyticsSummaryProps {
  summary: ABCAnalysisSummary;
  computedData: ComputedServiceData[];
}

const formatCLP = (value: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);

export default function AnalyticsSummary({ summary, computedData }: AnalyticsSummaryProps) {
  const margenGlobal = summary.totalIngresos > 0 ? (summary.totalUtilidad / summary.totalIngresos) * 100 : 0;

  const cards = [
    {
      label: 'Ingresos Totales',
      value: formatCLP(summary.totalIngresos),
      icon: DollarSign,
      color: 'text-amber-400',
    },
    {
      label: 'Utilidad Neta',
      value: formatCLP(summary.totalUtilidad),
      icon: TrendingUp,
      color: 'text-emerald-400',
    },
    {
      label: 'Unidades Vendidas',
      value: summary.totalUnidades.toLocaleString('es-CL'),
      icon: Package,
      color: 'text-sky-400',
    },
    {
      label: 'Margen Global',
      value: `${margenGlobal.toFixed(1)}%`,
      icon: Percent,
      color: 'text-violet-400',
    },
  ];

  const classBreakdown = [
    { label: 'Clase A', count: summary.countA, ingresos: summary.ingresosA, color: 'bg-amber-400', text: 'text-amber-400' },
    { label: 'Clase B', count: summary.countB, ingresos: summary.ingresosB, color: 'bg-sky-400', text: 'text-sky-400' },
    { label: 'Clase C', count: summary.countC, ingresos: summary.ingresosC, color: 'bg-slate-500', text: 'text-slate-400' },
  ];

  return (
    <div className="space-y-4">
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

      <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-4 sm:p-5">
        <p className="text-xxs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Distribución de Servicios por Clasificación ABC
        </p>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-900 mb-4">
          {classBreakdown.map((c) => (
            <div
              key={c.label}
              className={c.color}
              style={{ width: `${summary.totalIngresos > 0 ? (c.ingresos / summary.totalIngresos) * 100 : 0}%` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {classBreakdown.map((c) => (
            <div key={c.label} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${c.color}`} />
                <span className="text-xs font-semibold text-slate-300">{c.label}</span>
              </div>
              <p className={`text-sm font-bold ${c.text}`}>{c.count} servicios</p>
              <p className="text-xxs text-slate-500 font-mono">{formatCLP(c.ingresos)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
