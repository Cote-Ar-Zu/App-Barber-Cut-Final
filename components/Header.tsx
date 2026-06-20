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
          <span className="text-sm font-bold tracking-tight text-white">
            BarberCut <span className="text-amber-400 font-normal">ABC</span>
          </span>
        </button>

        {hasData && (
          <span className="text-xxs font-mono uppercase tracking-widest text-slate-500 hidden sm:inline">
            Análisis de Clasificación de Servicios
          </span>
        )}
      </div>
    </header>
  );
}
