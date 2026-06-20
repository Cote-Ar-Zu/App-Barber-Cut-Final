/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, X, ArrowRight, Scissors } from 'lucide-react';

interface BarberoSetupProps {
  onConfirm: (barberos: string[]) => void;
  initialBarberos?: string[];
}

export default function BarberoSetup({ onConfirm, initialBarberos = [] }: BarberoSetupProps) {
  const [barberos, setBarberos] = useState<string[]>(
    initialBarberos.length > 0 ? initialBarberos : ['']
  );
  const [error, setError] = useState<string | null>(null);

  const handleChange = (index: number, value: string) => {
    const next = [...barberos];
    next[index] = value;
    setBarberos(next);
    if (error) setError(null);
  };

  const handleAdd = () => {
    setBarberos([...barberos, '']);
  };

  const handleRemove = (index: number) => {
    if (barberos.length === 1) {
      setBarberos(['']);
      return;
    }
    setBarberos(barberos.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === barberos.length - 1) {
        handleAdd();
      }
    }
  };

  const handleSubmit = () => {
    const cleaned = barberos.map((b) => b.trim()).filter((b) => b.length > 0);

    if (cleaned.length === 0) {
      setError('Ingresa al menos el nombre de un barbero para continuar.');
      return;
    }

    const lowerSet = new Set<string>();
    const duplicates = new Set<string>();
    for (const name of cleaned) {
      const lower = name.toLowerCase();
      if (lowerSet.has(lower)) duplicates.add(name);
      lowerSet.add(lower);
    }
    if (duplicates.size > 0) {
      setError(`Hay nombres repetidos: ${Array.from(duplicates).join(', ')}.`);
      return;
    }

    onConfirm(cleaned);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto py-10 sm:py-16"
    >
      <div className="text-center mb-8 space-y-3">
        <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 mb-2">
          <Users className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight">¿Quiénes son tus barberos?</h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          Ingresa el nombre de cada barbero o estilista de tu local. Estos nombres se usarán para
          registrar las ventas individuales en el archivo que generes.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-5 sm:p-6 space-y-3">
        {barberos.map((nombre, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="flex items-center justify-center h-9 w-9 rounded-lg bg-slate-900 text-slate-500 flex-shrink-0">
              <Scissors className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder={`Nombre del barbero ${index + 1}`}
              autoFocus={index === 0}
              className="flex-1 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40 transition-all"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              aria-label="Quitar barbero"
              className="flex items-center justify-center h-9 w-9 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-slate-800 text-xs font-semibold text-slate-400 hover:text-amber-400 hover:border-amber-400/30 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar otro barbero
        </button>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-3 rounded-lg text-sm font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all active:scale-[0.99] shadow-md shadow-amber-500/10"
        >
          Continuar a cargar ventas
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
