/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scissors } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  hasData: boolean;
}

export default function Header({ onReset, hasData }: HeaderProps) {
  return (
    <header className="border-b border-slate-900 bg-[#070b13]/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-2.5 group"
          aria-label="Volver al inicio"
        >
          <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-400 text-slate-950 group-hover:bg-amber-300 transition-colors">
            <Scissors className="h-4 w-4" />
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">
                Barber<span className="text-amber-400">Cut</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5">
                Pareto ABC
              </span>
            </span>
            <span className="text-xxs text-slate-500 hidden sm:inline">
              Analizador de Control de Inventario y Servicios
            </span>
          </span>
        </button>

        {hasData && (
          <span className="text-xxs font-mono uppercase tracking-widest text-slate-500 hidden sm:inline">
            Ley de Pareto 80/20
          </span>
        )}
      </div>
    </header>
  );
}
