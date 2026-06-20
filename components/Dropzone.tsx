/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { UploadCloud, FileSpreadsheet, AlertCircle, Download, Users, Pencil } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';
import { RawServiceData } from '../types';

interface DropzoneProps {
  barberos: string[];
  onDataLoaded: (data: RawServiceData[], warnings: string[]) => void;
  onEditBarberos: () => void;
}

export default function Dropzone({ barberos, onDataLoaded, onEditBarberos }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Solo se aceptan archivos con formato .csv');
        return;
      }

      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const { data, errors, warnings } = parseCSV(content, barberos);

        if (errors.length > 0) {
          setError(errors[0]);
          setIsProcessing(false);
          return;
        }

        onDataLoaded(data, warnings);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setError('No se pudo leer el archivo. Intenta nuevamente.');
        setIsProcessing(false);
      };
      reader.readAsText(file, 'utf-8');
    },
    [barberos, onDataLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  // Genera una plantilla CSV vacía precargada con los nombres de barberos ya ingresados
  const handleDownloadTemplate = () => {
    const headers = ['sku', 'nombre_servicio', 'costo_unitario', 'precio_venta', 'barbero', 'unidades_vendidas'];
    const rows: string[] = [headers.join(',')];

    barberos.forEach((nombre) => {
      rows.push(['001', 'Nombre del Servicio', '0', '0', `"${nombre.replace(/"/g, '""')}"`, '0'].join(','));
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'BarberCut_Plantilla_Ventas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto space-y-5"
    >
      {/* Barra de barberos confirmados */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-900 bg-slate-950/60 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center justify-center h-7 w-7 rounded-md bg-amber-400/10 text-amber-400 flex-shrink-0">
            <Users className="h-3.5 w-3.5" />
          </span>
          <p className="text-xs text-slate-400 truncate">
            <span className="text-slate-200 font-semibold">{barberos.length} barbero{barberos.length !== 1 ? 's' : ''}</span>
            {' · '}
            {barberos.join(', ')}
          </p>
        </div>
        <button
          onClick={onEditBarberos}
          className="flex items-center gap-1.5 text-xxs font-semibold text-slate-500 hover:text-amber-400 transition-colors flex-shrink-0"
        >
          <Pencil className="h-3 w-3" />
          Editar
        </button>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">Carga tu archivo de ventas</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Sube un CSV con columnas <code className="text-amber-400/90 font-mono text-xs">sku, nombre_servicio, costo_unitario, precio_venta, barbero, unidades_vendidas</code>
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all p-10 sm:p-14 text-center ${
          isDragging
            ? 'border-amber-400 bg-amber-400/5'
            : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <span className={`flex items-center justify-center h-14 w-14 rounded-2xl transition-colors ${
            isDragging ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-500'
          }`}>
            {isProcessing ? (
              <FileSpreadsheet className="h-6 w-6 animate-pulse" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              {isProcessing ? 'Procesando archivo...' : 'Arrastra tu CSV aquí'}
            </p>
            <p className="text-xs text-slate-500 mt-1">o haz clic para seleccionar un archivo</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
        </div>
      )}

      <button
        onClick={handleDownloadTemplate}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-900 text-xs font-semibold text-slate-400 hover:text-amber-400 hover:border-amber-400/20 transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Descargar plantilla CSV con tus barberos precargados
      </button>
    </motion.div>
  );
}
