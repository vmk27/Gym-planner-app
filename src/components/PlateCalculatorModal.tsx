import React, { useState } from 'react';
import { X, Dumbbell, Plus, Minus } from 'lucide-react';
import { calculatePlates } from '../utils/calc';

interface PlateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWeightKg?: number;
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  isOpen,
  onClose,
  defaultWeightKg = 60
}) => {
  const [targetWeight, setTargetWeight] = useState<number>(defaultWeightKg);
  const [barWeight, setBarWeight] = useState<number>(20);

  if (!isOpen) return null;

  const result = calculatePlates(targetWeight, barWeight);

  const adjustWeight = (delta: number) => {
    setTargetWeight(prev => Math.max(barWeight, Math.round((prev + delta) * 10) / 10));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kalkulator Beban Barbel</h3>
              <p className="text-xs text-slate-400">Distribusi piringan beban per sisi barbel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Target Weight */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Target Total Beban (kg)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustWeight(-5)}
                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="number"
                  step="2.5"
                  value={targetWeight}
                  onChange={e => setTargetWeight(Math.max(barWeight, Number(e.target.value) || barWeight))}
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-center font-mono text-xl font-bold text-white focus:outline-none focus:border-lime-400"
                />
                <span className="absolute right-3 top-3 text-xs text-slate-500 font-mono">kg</span>
              </div>
              <button
                onClick={() => adjustWeight(5)}
                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {/* Quick bumps */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[-2.5, 2.5, 10, 20].map(delta => (
                <button
                  key={delta}
                  onClick={() => adjustWeight(delta)}
                  className="py-1 rounded-lg bg-slate-800/60 text-xs font-mono text-slate-300 hover:bg-slate-800 active:scale-95"
                >
                  {delta > 0 ? `+${delta}` : delta} kg
                </button>
              ))}
            </div>
          </div>

          {/* Bar Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Berat Batang Barbel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { weight: 20, label: 'Olympic 20kg' },
                { weight: 15, label: 'Women 15kg' },
                { weight: 10, label: 'EZ Bar 10kg' }
              ].map(bar => (
                <button
                  key={bar.weight}
                  onClick={() => setBarWeight(bar.weight)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border transition ${
                    barWeight === bar.weight
                      ? 'border-lime-400 bg-lime-400/10 text-lime-400 font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {bar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Barbell Sleeve */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
              <span>Ilustrasi Sleeve (1 Sisi)</span>
              <span className="font-mono text-lime-400 font-semibold">{result.weightPerSide} kg per sisi</span>
            </div>

            {/* Visual Sleeve Canvas */}
            <div className="h-28 flex items-center justify-center overflow-x-auto py-2 px-4 bg-slate-900/50 rounded-xl border border-slate-800/60">
              {/* Bar collar */}
              <div className="w-4 h-16 bg-slate-600 rounded-l shrink-0" />
              {/* Sleeve shaft */}
              <div className="h-7 w-6 bg-slate-400 shrink-0" />

              {/* Stacked Plates from heaviest to lightest */}
              {result.platesPerSide.length === 0 ? (
                <span className="text-xs text-slate-500 italic ml-4">Hanya batang barbel kosong</span>
              ) : (
                result.platesPerSide.map((plateGroup, idx) => (
                  <React.Fragment key={idx}>
                    {Array.from({ length: plateGroup.count }).map((_, pIdx) => {
                      // Height scaling based on plate size
                      const heightMap: Record<number, string> = {
                        25: 'h-24',
                        20: 'h-22',
                        15: 'h-20',
                        10: 'h-16',
                        5: 'h-14',
                        2.5: 'h-12',
                        1.25: 'h-10'
                      };
                      return (
                        <div
                          key={pIdx}
                          className={`w-6 ${heightMap[plateGroup.weight] || 'h-16'} ${plateGroup.color} ${plateGroup.border} border-2 rounded mx-0.5 flex items-center justify-center shrink-0 shadow-sm`}
                          title={`${plateGroup.weight} kg`}
                        >
                          <span className={`text-[10px] font-bold font-mono -rotate-90 select-none ${plateGroup.weight === 5 || plateGroup.weight === 15 ? 'text-slate-950' : 'text-white'}`}>
                            {plateGroup.weight}
                          </span>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
              {/* Bar End Cap */}
              <div className="h-7 w-8 bg-slate-400 rounded-r shrink-0" />
            </div>

            {/* Plate Breakdown Text */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-left">
              <span className="text-xs font-semibold text-slate-300 block mb-2">Daftar Piringan Tiap Sisi:</span>
              {result.platesPerSide.length === 0 ? (
                <p className="text-xs text-slate-500">Tidak memerlukan piringan tambahan.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result.platesPerSide.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs"
                    >
                      <span className={`w-3 h-3 rounded-full ${p.color}`} />
                      <span className="font-mono text-white font-semibold">
                        {p.count}x {p.weight} kg
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {result.difference !== 0 && (
                <p className="text-[11px] text-amber-400 mt-2">
                  Catatan: Selisih berat terdekat adalah {result.achievedWeight} kg ({result.difference > 0 ? `kurang ${result.difference}kg` : `lebih ${Math.abs(result.difference)}kg`}).
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full h-11 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-sm transition"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};
