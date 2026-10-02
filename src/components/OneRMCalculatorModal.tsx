import React, { useState } from 'react';
import { X, Flame, Plus, Minus } from 'lucide-react';
import { estimate1RM, getRepMaxTable } from '../utils/calc';

interface OneRMCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWeightKg?: number;
  defaultReps?: number;
}

export const OneRMCalculatorModal: React.FC<OneRMCalculatorModalProps> = ({
  isOpen,
  onClose,
  defaultWeightKg = 80,
  defaultReps = 6
}) => {
  const [weightKg, setWeightKg] = useState<number>(defaultWeightKg);
  const [reps, setReps] = useState<number>(defaultReps);

  if (!isOpen) return null;

  const calculated1RM = estimate1RM(weightKg, reps);
  const repTable = getRepMaxTable(calculated1RM);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kalkulator One-Rep Max (1RM)</h3>
              <p className="text-xs text-slate-400">Estimasi kekuatan maksimal & tabel persentase beban</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Beban Terangkat (kg)
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setWeightKg(prev => Math.max(1, prev - 2.5))}
                className="w-9 h-11 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={weightKg}
                onChange={e => setWeightKg(Math.max(1, Number(e.target.value) || 1))}
                className="w-full h-11 bg-slate-950 border border-slate-800 rounded-lg px-2 text-center font-mono text-lg font-bold text-white focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => setWeightKg(prev => prev + 2.5)}
                className="w-9 h-11 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Repetisi Berhasil (Reps)
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setReps(prev => Math.max(1, prev - 1))}
                className="w-9 h-11 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={reps}
                onChange={e => setReps(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                className="w-full h-11 bg-slate-950 border border-slate-800 rounded-lg px-2 text-center font-mono text-lg font-bold text-white focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => setReps(prev => Math.min(30, prev + 1))}
                className="w-9 h-11 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Big 1RM Card */}
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-amber-400/10 via-slate-900 to-slate-900 border border-amber-400/30 p-4 text-center">
          <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Estimasi 1RM Anda</span>
          <div className="my-1 font-mono text-4xl font-extrabold text-white">
            {calculated1RM} <span className="text-base font-normal text-slate-400">kg</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Dihitung menggunakan formula Epley & Brzycki standar fisiologi olahraga
          </p>
        </div>

        {/* Percentage Table */}
        <div className="mt-4">
          <span className="text-xs font-semibold text-slate-300 block mb-2">Tabel Rekomendasi Beban Latihan</span>
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/60">
            <div className="grid grid-cols-3 px-3 py-2 text-[11px] font-semibold text-slate-400 bg-slate-900/60">
              <span>Persentase</span>
              <span className="text-center">Target Reps</span>
              <span className="text-right">Beban (kg)</span>
            </div>
            {repTable.map(item => (
              <div
                key={item.reps}
                className="grid grid-cols-3 px-3 py-2 text-xs items-center hover:bg-slate-900/40 transition"
              >
                <span className="font-mono text-amber-400 font-semibold">{item.percentage}% 1RM</span>
                <span className="text-center font-mono text-slate-300">~{item.reps} reps</span>
                <span className="text-right font-mono font-bold text-white">{item.estimatedWeightKg} kg</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
