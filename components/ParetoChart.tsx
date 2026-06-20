/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { ComputedServiceData } from '../types';

interface ParetoChartProps {
  data: ComputedServiceData[];
  totalRevenue: number;
}

const CLASS_COLOR: Record<'A' | 'B' | 'C', string> = {
  A: '#fbbf24',
  B: '#38bdf8',
  C: '#64748b',
};

export default function ParetoChart({ data, totalRevenue }: ParetoChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const chartWidth = 1000;
  const chartHeight = 320;
  const paddingLeft = 50;
  const paddingRight = 50;
  const paddingTop = 20;
  const paddingBottom = 70;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxIngreso = useMemo(() => Math.max(...data.map((d) => d.ingreso_total), 1), [data]);
  const barWidth = data.length > 0 ? innerWidth / data.length : 0;

  const linePoints = useMemo(() => {
    return data.map((d, i) => {
      const x = paddingLeft + barWidth * i + barWidth / 2;
      const y = paddingTop + innerHeight - (d.porcentaje_acumulado / 100) * innerHeight;
      return { x, y };
    });
  }, [data, barWidth, innerHeight]);

  const linePath = linePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const y80 = paddingTop + innerHeight - 0.8 * innerHeight;

  if (data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Curva de Distribución de Pareto
          </h3>
          <p className="text-xxs text-slate-500 mt-0.5">Barras: Ingreso por servicio ($) · Línea: Porcentaje acumulado (%)</p>
        </div>
        <div className="flex items-center gap-4 text-xxs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CLASS_COLOR.A }} />
            <span className="text-slate-400">Clase A (Top 80%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CLASS_COLOR.B }} />
            <span className="text-slate-400">Clase B (80% a 95%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CLASS_COLOR.C }} />
            <span className="text-slate-400">Clase C (Resto 5%)</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          style={{ minWidth: Math.max(600, data.length * 40) }}
        >
          {/* Línea 80% */}
          <line
            x1={paddingLeft}
            y1={y80}
            x2={chartWidth - paddingRight}
            y2={y80}
            stroke="#fbbf24"
            strokeOpacity={0.3}
            strokeDasharray="4 4"
          />
          <text x={chartWidth - paddingRight + 5} y={y80 + 4} fontSize="10" fill="#fbbf24" opacity={0.6}>
            80%
          </text>

          {/* Eje Y izquierdo (referencia) */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = paddingTop + innerHeight - (pct / 100) * innerHeight;
            return (
              <g key={pct}>
                <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#1e293b" strokeWidth={1} />
                <text x={paddingLeft - 8} y={y + 3} fontSize="9" fill="#64748b" textAnchor="end">
                  {pct}%
                </text>
              </g>
            );
          })}

          {/* Barras */}
          {data.map((d, i) => {
            const barHeight = (d.ingreso_total / maxIngreso) * innerHeight;
            const x = paddingLeft + barWidth * i;
            const y = paddingTop + innerHeight - barHeight;
            return (
              <g key={d.sku}>
                <rect
                  x={x + barWidth * 0.15}
                  y={y}
                  width={barWidth * 0.7}
                  height={barHeight}
                  fill={CLASS_COLOR[d.categoria]}
                  opacity={hoverIndex === null || hoverIndex === i ? 0.85 : 0.3}
                  rx={2}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                />
                {data.length <= 15 && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - paddingBottom + 14}
                    fontSize="9"
                    fill="#64748b"
                    textAnchor="end"
                    transform={`rotate(-35 ${x + barWidth / 2} ${chartHeight - paddingBottom + 14})`}
                  >
                    {d.nombre_servicio.length > 14 ? d.nombre_servicio.slice(0, 14) + '…' : d.nombre_servicio}
                  </text>
                )}
              </g>
            );
          })}

          {/* Línea acumulada */}
          <path d={linePath} fill="none" stroke="#f8fafc" strokeWidth={2} />
          {linePoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 4 : 2.5}
              fill="#f8fafc"
              style={{ cursor: 'pointer', transition: 'r 0.15s' }}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}

          {/* Tooltip */}
          {hoverIndex !== null && (
            <g>
              {(() => {
                const d = data[hoverIndex];
                const p = linePoints[hoverIndex];
                const tooltipX = Math.min(Math.max(p.x - 70, paddingLeft), chartWidth - paddingRight - 140);
                return (
                  <g transform={`translate(${tooltipX}, ${Math.max(p.y - 60, paddingTop)})`}>
                    <rect width={140} height={50} rx={6} fill="#0f172a" stroke="#334155" strokeWidth={1} />
                    <text x={8} y={16} fontSize="10" fontWeight="bold" fill="#f8fafc">
                      {d.nombre_servicio.length > 18 ? d.nombre_servicio.slice(0, 18) + '…' : d.nombre_servicio}
                    </text>
                    <text x={8} y={30} fontSize="9" fill="#94a3b8">
                      Ingreso: ${d.ingreso_total.toLocaleString('es-CL')}
                    </text>
                    <text x={8} y={42} fontSize="9" fill="#94a3b8">
                      Acumulado: {d.porcentaje_acumulado.toFixed(1)}%
                    </text>
                  </g>
                );
              })()}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
