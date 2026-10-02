import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Plus, Minus, Bell } from 'lucide-react';
import { playCountdownTickSound, playTimerCompleteSound } from '../utils/audio';

interface RestTimerOverlayProps {
  initialSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onAdjustSeconds: (delta: number) => void;
  onClose: () => void;
  soundEnabled: boolean;
}

export const RestTimerOverlay: React.FC<RestTimerOverlayProps> = ({
  initialSeconds,
  remainingSeconds,
  isRunning,
  onTogglePlay,
  onReset,
  onAdjustSeconds,
  onClose,
  soundEnabled
}) => {
  // Tick sound on 3, 2, 1
  useEffect(() => {
    if (isRunning && soundEnabled) {
      if (remainingSeconds === 3 || remainingSeconds === 2 || remainingSeconds === 1) {
        playCountdownTickSound();
      } else if (remainingSeconds === 0) {
        playTimerCompleteSound();
      }
    }
  }, [remainingSeconds, isRunning, soundEnabled]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const total = Math.max(initialSeconds, 1);
  const progressPercent = Math.max(0, Math.min(100, ((total - remainingSeconds) / total) * 100));

  // Stroke circle calculation
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <aside aria-label="Penghitung Waktu Istirahat" className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-40 max-w-sm ml-auto rounded-3xl bg-slate-900/95 border border-slate-800 p-4 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-lime-400">Timer Istirahat</span>
        </div>
        <div className="flex items-center gap-1">
          {soundEnabled && <Bell className="w-3.5 h-3.5 text-slate-400" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Tutup Timer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 py-3">
        {/* Progress Circular Timer */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-800"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-300 ${remainingSeconds === 0 ? 'text-red-500' : 'text-lime-400'}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold tracking-tight text-white tabular-nums">
              {formatted}
            </span>
            <span className="text-[10px] text-slate-400">
              {remainingSeconds === 0 ? 'Waktunya Set!' : `${Math.round(progressPercent)}%`}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className={`flex-1 h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
                isRunning
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'bg-lime-400 text-slate-950 hover:bg-lime-300'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" /> Jeda
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Lanjut
                </>
              )}
            </button>
            <button
              onClick={onReset}
              className="w-11 h-11 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition active:scale-95"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick adjusters */}
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => onAdjustSeconds(-15)}
              className="py-1.5 px-1 rounded-lg bg-slate-800/80 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 flex items-center justify-center gap-0.5 active:scale-95"
            >
              <Minus className="w-3 h-3" /> 15s
            </button>
            <button
              onClick={() => onAdjustSeconds(30)}
              className="py-1.5 px-1 rounded-lg bg-slate-800/80 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 flex items-center justify-center gap-0.5 active:scale-95"
            >
              <Plus className="w-3 h-3" /> 30s
            </button>
            <button
              onClick={() => onAdjustSeconds(60)}
              className="py-1.5 px-1 rounded-lg bg-slate-800/80 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 flex items-center justify-center gap-0.5 active:scale-95"
            >
              <Plus className="w-3 h-3" /> 60s
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
