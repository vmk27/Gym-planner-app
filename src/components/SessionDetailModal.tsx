import React from 'react';
import { X, Calendar, Award, Trash2 } from 'lucide-react';
import { SessionDocument } from '../types/gym';
import { calculate1RM } from '../utils/calculations';

interface SessionDetailModalProps {
  session: SessionDocument | null;
  onClose: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  onClose,
  onDeleteSession
}) => {
  if (!session) return null;

  const dateObj = new Date(session.startTime);
  const formattedDate = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col max-h-[85vh] text-left">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-lime-400 font-semibold mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {formattedDate} · {formattedTime}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{session.routineName}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-950/60 border-b border-slate-800 shrink-0 text-center font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block font-sans">Durasi</span>
            <span className="text-sm sm:text-base font-bold text-white">
              {Math.round(session.durationSeconds / 60)} mnt
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block font-sans">Total Volume</span>
            <span className="text-sm sm:text-base font-bold text-lime-400">
              {session.totalVolume.toLocaleString()} kg
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block font-sans">Set / Reps</span>
            <span className="text-sm sm:text-base font-bold text-white">
              {session.totalSets || 0} / {session.totalReps || 0}
            </span>
          </div>
        </div>

        {/* Exercise breakdown from logs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {session.logs?.map((log, idx) => {
            const exerciseVolume = log.sets.reduce((sum, s) => sum + (s.isWarmup ? 0 : s.weight * s.reps), 0);
            return (
              <div
                key={log.exerciseId + idx}
                className="rounded-2xl bg-slate-950 border border-slate-800/80 p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-lime-400 font-semibold">{log.muscleGroup || 'Latihan'}</span>
                    <h4 className="text-sm font-bold text-white">{log.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-400 block">
                      Vol: {exerciseVolume.toLocaleString()} kg
                    </span>
                  </div>
                </div>

                {/* Set list */}
                <div className="divide-y divide-slate-800/50 text-xs">
                  {log.sets.map((set, sIdx) => {
                    const estimated1RM = Math.round(calculate1RM(set.weight, set.reps) * 10) / 10;
                    return (
                      <div
                        key={set.id || sIdx}
                        className="py-1.5 flex items-center justify-between font-mono"
                      >
                        <span className="text-slate-500 flex items-center gap-1">
                          Set {set.setNumber} {set.isWarmup && <span className="text-amber-400 text-[10px] font-sans font-bold">(Warmup)</span>}
                        </span>
                        <span className="text-slate-300 font-semibold">
                          {set.weight} kg × {set.reps} reps
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          ~{estimated1RM} kg 1RM
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (window.confirm('Hapus riwayat sesi latihan ini?')) {
                onDeleteSession(session.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Sesi Ini</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
