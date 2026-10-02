import React from 'react';
import { X, Target, Info, CheckCircle2, Dumbbell } from 'lucide-react';
import { ExerciseDocument } from '../types/gym';
import { getPreviousExercisePerformance } from '../utils/storage';

interface ExerciseDetailModalProps {
  exercise: ExerciseDocument | null;
  onClose: () => void;
  onStartWithExercise?: (exercise: ExerciseDocument) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
  onStartWithExercise
}) => {
  if (!exercise) return null;

  const previousBest = getPreviousExercisePerformance(exercise.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-lime-400 font-semibold mb-1">
              <span>{exercise.muscleGroup}</span>
              <span>·</span>
              <span>{exercise.equipment}</span>
              <span>·</span>
              <span>Istirahat ~{exercise.defaultRestSeconds || 90}s</span>
            </div>
            <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
            {exercise.nameIndo && (
              <p className="text-xs text-slate-400 mt-0.5">{exercise.nameIndo}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previous Record Banner */}
        {previousBest && (
          <div className="mt-4 p-3 rounded-2xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
              <span className="text-slate-300">Rekor Terbaik Sebelumnya:</span>
            </div>
            <div className="font-mono text-sm font-bold text-lime-400">
              {previousBest.weight} kg × {previousBest.reps} reps ({previousBest.oneRM} kg 1RM)
            </div>
          </div>
        )}

        {/* Muscle Targets */}
        <div className="mt-4">
          <span className="text-xs font-semibold text-slate-400 block mb-2">Fokus Otot</span>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-3 py-1 rounded-lg bg-lime-400/15 border border-lime-400/30 text-lime-400 text-xs font-semibold">
              Otot Utama: {exercise.muscleGroup}
            </span>
            {exercise.secondaryMuscles && exercise.secondaryMuscles.map(m => (
              <span
                key={m}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Step by Step Instructions */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2.5">
              <Target className="w-4 h-4 text-lime-400" />
              <span>Instruksi Gerakan</span>
            </div>
            <ol className="space-y-2.5">
              {exercise.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-lime-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Form Tips */}
        {exercise.tips && exercise.tips.length > 0 && (
          <div className="mt-5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Tips Form & Keamanan</span>
            </div>
            <ul className="space-y-1.5">
              {exercise.tips.map((tip, idx) => (
                <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                  <span className="text-amber-400 font-bold">›</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          {onStartWithExercise && (
            <button
              onClick={() => {
                onStartWithExercise(exercise);
                onClose();
              }}
              className="flex-1 h-11 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Mulai Latihan Gerakan Ini</span>
            </button>
          )}
          <button
            onClick={onClose}
            className={`h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm px-6 transition ${
              onStartWithExercise ? '' : 'w-full'
            }`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
