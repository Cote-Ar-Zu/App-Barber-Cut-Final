/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ComputedServiceData, ABCAnalysisSummary } from '../types';
import { ChevronDown, Search } from 'lucide-react';

interface ServiceTableProps {
  data: ComputedServiceData[];
  summary: ABCAnalysisSummary;
  onSelectService: (service: ComputedServiceData) => void;
}

const CLASS_STYLES: Record<'A' | 'B' | 'C', string> = {
  A: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  B: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
  C: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const formatCLP = (value: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);

type SortKey = 'ingreso_total' | 'unidades_vendidas' | 'margen_porcentaje' | 'nombre_servicio';

export default function ServiceTable({ data, summary, onSelectService }: ServiceTableProps) {
  const [filterClass, setFilterClass] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('ingreso_total');
  const [sortDesc, setSortDesc] = useState(true);

  const filtered = useMemo(() => {
    let result = data;
    if (filterClass !== 'ALL') {
      result = result.filter((d) => d.categoria === filterClass);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (d) => d.nombre_servicio.toLowerCase().includes(q) || d.sku.toLowerCase().includes(q)
      );
    }
    const sorted = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDesc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      return sortDesc ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });
    return sorted;
  }, [data, filterClass, search, sortKey, sortDesc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const SortHeader = ({ label, sortKeyName, className = '' }: { label: string; sortKeyName: SortKey; className?: string }) => (
    <th
      onClick={() => toggleSort(sortKeyName)}
      className={`px-4 py-3 text-xxs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-300 select-none transition-colors ${className}`}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          <ChevronDown className={`h-3 w-3 transition-transform ${sortDesc ? '' : 'rotate-180'}`} />
        )}
      </span>
    </th>
  );

  const counts = {
    ALL: data.length,
    A: summary.countA,
    B: summary.countB,
    C: summary.countC,
  };

  return (
    <div className="rounded-2xl border border-slate-900 bg-slate-950/40 overflow-hidden">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por SKU o nombre de servicio..."
            className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/30 transition-all"
          />
        </div>
        <div className="flex gap-1.5">
          {(['ALL', 'A', 'B', 'C'] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setFilterClass(cls)}
              className={`px-3 py-2 rounded-lg text-xxs font-bold border transition-all whitespace-nowrap ${
                filterClass === cls
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cls === 'ALL' ? `Todos (${counts.ALL})` : `Clase ${cls} (${counts[cls]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-900">
              <th className="px-4 py-3 text-xxs font-semibold uppercase tracking-wider text-slate-500 text-left">SKU / Cód.</th>
              <SortHeader label="Nombre del Servicio / Producto" sortKeyName="nombre_servicio" className="text-left" />
              <th className="px-4 py-3 text-xxs font-semibold uppercase tracking-wider text-slate-500 text-right">Costo Unit.</th>
              <th className="px-4 py-3 text-xxs font-semibold uppercase tracking-wider text-slate-500 text-right">Precio Vta.</th>
              <SortHeader label="Uds. Vendidas" sortKeyName="unidades_vendidas" className="text-right" />
              <SortHeader label="Ingreso Bruto Ac." sortKeyName="ingreso_total" className="text-right" />
              <SortHeader label="Margen" sortKeyName="margen_porcentaje" className="text-right" />
              <th className="px-4 py-3 text-xxs font-semibold uppercase tracking-wider text-slate-500 text-center">Clase</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.sku}
                onClick={() => onSelectService(item)}
                className="border-b border-slate-900/60 hover:bg-slate-900/40 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.sku}</td>
                <td className="px-4 py-3 text-xs font-medium text-slate-200 group-hover:text-amber-400 transition-colors">
                  {item.nombre_servicio}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 text-right font-mono">{formatCLP(item.costo_unitario)}</td>
                <td className="px-4 py-3 text-xs text-slate-400 text-right font-mono">{formatCLP(item.precio_venta)}</td>
                <td className="px-4 py-3 text-xs text-slate-400 text-right font-mono">{item.unidades_vendidas}</td>
                <td className="px-4 py-3 text-xs text-amber-400 text-right font-mono font-semibold">{formatCLP(item.ingreso_total)}</td>
                <td className="px-4 py-3 text-xs text-slate-400 text-right font-mono">{item.margen_porcentaje.toFixed(1)}%</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center justify-center h-6 w-6 rounded-md text-xxs font-bold border ${CLASS_STYLES[item.categoria]}`}>
                    {item.categoria}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-xs text-slate-600">
                  No se encontraron servicios con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
