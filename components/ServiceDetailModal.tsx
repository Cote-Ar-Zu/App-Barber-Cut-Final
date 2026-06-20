/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ComputedServiceData } from '../types';
import { X, User, TrendingUp } from 'lucide-react';

interface ServiceDetailModalProps {
  service: ComputedServiceData;
  totalRevenue: number;
  onClose: () => void;
}

const CLASS_STYLES: Record<'A' | 'B' | 'C', string> = {
  A: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  B: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
  C: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const formatCLP = (value: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);

export default function ServiceDetailModal({ service, totalRevenue, onClose }: ServiceDetailModalProps) {
  const maxUnidadesBarbero = Math.max(...service.ventasPorBarbero.map((b) => b.unidades_vendidas), 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-slate-800 bg-[#0a0f1a] shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0f1a]/95 backdrop-blur border-b border-slate-900 px-5 sm:px-6 py-4 flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xxs font-bold border ${CLASS_STYLES[service.categoria]}`}>
              Clase {service.categoria}
            </span>
            <h3 className="text-lg font-bold text-white leading-tight">{service.nombre_servicio}</h3>
            <p className="text-xxs font-mono text-slate-500">SKU {service.sku}</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-900 bg-slate-950/50 p-3.5">
              <p className="text-xxs text-slate-500 uppercase tracking-wider mb-1">Ingreso Total</p>
              <p className="text-base font-bold text-amber-400">{formatCLP(service.ingreso_total)}</p>
            </div>
            <div className="rounded-xl border border-slate-900 bg-slate-950/50 p-3.5">
              <p className="text-xxs text-slate-500 uppercase tracking-wider mb-1">Utilidad Neta</p>
              <p className="text-base font-bold text-emerald-400">{formatCLP(service.utilidad_total)}</p>
            </div>
            <div className="rounded-xl border border-slate-900 bg-slate-950/50 p-3.5">
              <p className="text-xxs text-slate-500 uppercase tracking-wider mb-1">Unidades Vendidas</p>
              <p className="text-base font-bold text-slate-200">{service.unidades_vendidas}</p>
            </div>
            <div className="rounded-xl border border-slate-900 bg-slate-950/50 p-3.5">
              <p className="text-xxs text-slate-500 uppercase tracking-wider mb-1">Margen</p>
              <p className="text-base font-bold text-slate-200">{service.margen_porcentaje.toFixed(1)}%</p>
            </div>
          </div>

          {/* Precio y costo */}
          <div className="flex items-center justify-between text-xs border-t border-b border-slate-900 py-3">
            <span className="text-slate-500">Costo unitario: <span className="text-slate-300 font-mono">{formatCLP(service.costo_unitario)}</span></span>
            <span className="text-slate-500">Precio venta: <span className="text-slate-300 font-mono">{formatCLP(service.precio_venta)}</span></span>
          </div>

          {/* Desglose por barbero */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Ventas por Barbero
              </h4>
            </div>
            <div className="space-y-2.5">
              {service.ventasPorBarbero.map((b) => (
                <div key={b.barbero} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{b.barbero}</span>
                    <span className="font-mono text-slate-400">
                      {b.unidades_vendidas} uds · {formatCLP(b.ingreso_total)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-amber-400/70 rounded-full"
                      style={{ width: `${(b.unidades_vendidas / maxUnidadesBarbero) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contribución a ingresos totales */}
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-400/10 bg-amber-400/5 px-4 py-3">
            <TrendingUp className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-slate-300">
              Este servicio representa el <span className="font-bold text-amber-400">{service.porcentaje_ingresos.toFixed(1)}%</span> de los ingresos totales del negocio.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
