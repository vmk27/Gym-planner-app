import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Check,
  Plus,
  Trash2,
  Minimize2,
  Maximize2,
  Clock,
  Dumbbell,
  Calculator,
  Flame,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  SessionDocument,
  ExerciseLog,
  WorkoutSetLog,
  ExerciseDocument
} from '../types/gym';
import { calculate1RM } from '../utils/calculations';
import { playSetCompleteSound } from '../utils/audio';
import { ExercisePickerModal } from './ExercisePickerModal';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { OneRMCalculatorModal } from './OneRMCalculatorModal';
import { getPreviousExercisePerformance } from '../utils/storage';

interface LiveWorkoutTrackerProps {
  routineName: string;
  routineId?: string | null;
  initialLogs: ExerciseLog[];
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onFinishWorkout: (session: SessionDocument) => void;
  onCancelWorkout: () => void;
  onTriggerRestTimer: (seconds: number) => void;
}

export const LiveWorkoutTracker: React.FC<LiveWorkoutTrackerProps> = ({
  routineName,
  routineId,
  initialLogs,
  isMinimized,
  onToggleMinimize,
  onFinishWorkout,
  onCancelWorkout,
  onTriggerRestTimer
}) => {
  const [logs, setLogs] = useState<ExerciseLog[]>(initialLogs);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [startTime] = useState<string>(new Date().toISOString());

  // Sub modals
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [plateCalcWeight, setPlateCalcWeight] = useState<number | null>(null);
  const [oneRMCalcData, setOneRMCalcData] = useState<{ weight: number; reps: number } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Stopwatch timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formattedTime = () => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Toggle completed status on a set
  const handleToggleSetComplete = (exIdx: number, setIdx: number) => {
    const currentLog = logs[exIdx];
    const currentSet = currentLog.sets[setIdx];
    const nextCompleted = !currentSet.completed;

    if (nextCompleted) {
      playSetCompleteSound();
      // Auto trigger rest timer (default 90s or 120s if heavy)
      const restTime = currentSet.weight >= 70 ? 120 : 90;
      onTriggerRestTimer(restTime);
    }

    setLogs(prev =>
      prev.map((log, lI) => {
        if (lI !== exIdx) return log;
        const newSets = log.sets.map((s, sI) =>
          sI === setIdx
            ? {
                ...s,
                completed: nextCompleted,
                completedAt: nextCompleted ? new Date().toISOString() : undefined
              }
            : s
        );
        return { ...log, sets: newSets };
      })
    );
  };

  const handleUpdateSetValue = (
    exIdx: number,
    setIdx: number,
    field: 'weight' | 'reps' | 'isWarmup',
    value: number | boolean
  ) => {
    setLogs(prev =>
      prev.map((log, lI) => {
        if (lI !== exIdx) return log;
        const newSets = log.sets.map((s, sI) => {
          if (sI !== setIdx) return s;
          return { ...s, [field]: value };
        });
        return { ...log, sets: newSets };
      })
    );
  };

  const handleAddSet = (exIdx: number) => {
    const currentLog = logs[exIdx];
    const lastSet = currentLog.sets[currentLog.sets.length - 1];
    const newSet: WorkoutSetLog = {
      id: `s_${Date.now()}_${Math.random()}`,
      setNumber: currentLog.sets.length + 1,
      weight: lastSet ? lastSet.weight : 20,
      reps: lastSet ? lastSet.reps : 10,
      isWarmup: false,
      completed: false
    };

    setLogs(prev =>
      prev.map((log, lI) => (lI === exIdx ? { ...log, sets: [...log.sets, newSet] } : log))
    );
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    setLogs(prev =>
      prev.map((log, lI) => {
        if (lI !== exIdx) return log;
        const filtered = log.sets.filter((_, sI) => sI !== setIdx);
        const renumbered = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return { ...log, sets: renumbered };
      })
    );
  };

  const handleRemoveExercise = (exIdx: number) => {
    setLogs(prev => prev.filter((_, i) => i !== exIdx));
  };

  const handleAddExerciseFromPicker = (exercise: ExerciseDocument) => {
    const prevPerf = getPreviousExercisePerformance(exercise.id);
    const newLog: ExerciseLog = {
      exerciseId: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      sets: [
        {
          id: `s_${Date.now()}_1`,
          setNumber: 1,
          weight: prevPerf?.weight || 20,
          reps: prevPerf?.reps || 10,
          isWarmup: false,
          previousWeight: prevPerf?.weight,
          previousReps: prevPerf?.reps,
          completed: false
        }
      ]
    };
    setLogs(prev => [...prev, newLog]);
    setIsPickerOpen(false);
  };

  // Completion calculation
  const completedSetsCount = logs.reduce(
    (acc, log) => acc + log.sets.filter(s => s.completed).length,
    0
  );
  const totalSetsCount = logs.reduce((acc, log) => acc + log.sets.length, 0);

  const handleFinish = () => {
    const endTime = new Date().toISOString();
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;
    let prCount = 0;

    logs.forEach(log => {
      const completedSets = log.sets.filter(s => s.completed);
      let maxSetWeight = 0;

      completedSets.forEach(s => {
        totalSets++;
        totalReps += s.reps;
        if (!s.isWarmup) {
          totalVolume += s.weight * s.reps;
          if (s.weight > maxSetWeight) maxSetWeight = s.weight;
        }
      });

      const prev = getPreviousExercisePerformance(log.exerciseId);
      if (prev && maxSetWeight > prev.weight) {
        prCount++;
      } else if (!prev && maxSetWeight > 0) {
        prCount++;
      }
    });

    const session: SessionDocument = {
      id: `ses_${Date.now()}`,
      userId: 'user_123',
      routineId: routineId || null,
      routineName,
      startTime,
      endTime,
      durationSeconds: Math.max(elapsedSeconds, 1),
      status: 'completed',
      totalVolume,
      totalSets,
      totalReps,
      prCount,
      logs
    };

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    onFinishWorkout(session);
  };

  // Minimized Sticky Dock
  if (isMinimized) {
    return (
      <aside aria-label="Sesi Latihan Aktif" className="fixed bottom-18 left-3 right-3 md:left-auto md:right-8 md:bottom-8 z-40 max-w-md ml-auto rounded-2xl bg-slate-900/95 border border-lime-400/50 p-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold">
            <Dumbbell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                {routineName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="font-mono text-lime-400 font-semibold">{formattedTime()}</span>
              <span>·</span>
              <span>{completedSetsCount}/{totalSetsCount} set</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
            title={isTimerRunning ? 'Jeda' : 'Lanjut'}
          >
            {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-lime-400" />}
          </button>
          <button
            onClick={onToggleMinimize}
            className="px-3 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-lime-400/20"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Buka</span>
          </button>
        </div>
      </aside>
    );
  }

  // Full Expanded Workout Screen
  return (
    <div className="fixed inset-0 z-40 bg-slate-950 overflow-y-auto pb-28 pt-safe animate-in fade-in flex flex-col">
      {/* Top sticky action header */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleMinimize}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
            title="Minimalkan Sesi"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight truncate max-w-[180px] sm:max-w-xs">
              {routineName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono text-lime-400 font-semibold">
                <Clock className="w-3 h-3" /> {formattedTime()}
              </span>
              <span>·</span>
              <span>{completedSetsCount}/{totalSetsCount} set selesai</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-900 transition"
          >
            Batal
          </button>
          <button
            onClick={handleFinish}
            disabled={completedSetsCount === 0}
            className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-lime-400/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Selesai Latihan</span>
          </button>
        </div>
      </header>

      {/* Main exercises container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 space-y-5">
        {logs.map((log, exIdx) => (
          <div
            key={log.exerciseId + exIdx}
            className="rounded-3xl bg-slate-900 border border-slate-800/90 overflow-hidden shadow-xl"
          >
            {/* Exercise Card Header */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-lime-400 font-semibold mb-0.5">
                  <span>{log.muscleGroup}</span>
                  <span>·</span>
                  <span>{log.equipment}</span>
                </div>
                <h3 className="text-base font-bold text-white">{log.name}</h3>
              </div>

              <div className="flex items-center gap-1">
                {/* Barbell Plate Calc Quick Trigger */}
                {log.equipment === 'Barbell' && (
                  <button
                    onClick={() => {
                      const firstSetWeight = log.sets[0]?.weight || 60;
                      setPlateCalcWeight(firstSetWeight);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-lime-400 hover:bg-slate-800 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                    title="Kalkulator Piringan Barbel"
                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                )}
                {/* 1RM Quick Trigger */}
                <button
                  onClick={() => {
                    const topSet = [...log.sets].sort((a, b) => b.weight - a.weight)[0];
                    setOneRMCalcData({
                      weight: topSet ? topSet.weight : 60,
                      reps: topSet ? topSet.reps : 8
                    });
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                  title="Kalkulator 1RM"
                >
                  <Flame className="w-4 h-4" />
                </button>
                {/* Remove Exercise */}
                <button
                  onClick={() => handleRemoveExercise(exIdx)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                  title="Hapus Gerakan dari Sesi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sets Table */}
            <div className="p-3 sm:p-4">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 px-2 pb-2 text-center">
                <span className="col-span-2 text-left">SET</span>
                <span className="col-span-3 text-left">SEBELUMNYA</span>
                <span className="col-span-3">BEBAN (KG)</span>
                <span className="col-span-2">REPS</span>
                <span className="col-span-2 text-right">SELESAI</span>
              </div>

              {/* Set Rows */}
              <div className="space-y-2">
                {log.sets.map((set, setIdx) => (
                  <div
                    key={set.id || setIdx}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl transition ${
                      set.completed
                        ? 'bg-lime-950/20 border border-lime-500/20'
                        : 'bg-slate-950/70 border border-slate-800/80'
                    }`}
                  >
                    {/* Set Number & Warmup Toggle */}
                    <div className="col-span-2 flex items-center gap-1 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSetValue(exIdx, setIdx, 'isWarmup', !set.isWarmup)
                        }
                        className={`text-xs font-bold px-1.5 py-0.5 rounded transition ${
                          set.isWarmup
                            ? 'bg-amber-400/20 text-amber-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                        title="Klik untuk ubah jenis set (Pemanasan / Utama)"
                      >
                        {set.isWarmup ? 'W' : set.setNumber}
                      </button>
                    </div>

                    {/* Previous Performance */}
                    <div className="col-span-3 text-left text-xs font-mono text-slate-400 truncate">
                      {set.previousWeight !== undefined ? (
                        <span>
                          {set.previousWeight}kg × {set.previousReps}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </div>

                    {/* Weight Input (Touch friendly >= 44px) */}
                    <div className="col-span-3">
                      <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                        <input
                          type="number"
                          step="2.5"
                          value={set.weight}
                          onChange={e =>
                            handleUpdateSetValue(
                              exIdx,
                              setIdx,
                              'weight',
                              Math.max(0, Number(e.target.value) || 0)
                            )
                          }
                          className="w-full h-11 bg-transparent text-center font-mono font-bold text-white text-xs sm:text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Reps Input */}
                    <div className="col-span-2">
                      <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                        <input
                          type="number"
                          min="1"
                          value={set.reps}
                          onChange={e =>
                            handleUpdateSetValue(
                              exIdx,
                              setIdx,
                              'reps',
                              Math.max(1, Number(e.target.value) || 1)
                            )
                          }
                          className="w-full h-11 bg-transparent text-center font-mono font-bold text-white text-xs sm:text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Completed Checkbox Touch Target >= 44x44px */}
                    <div className="col-span-2 flex items-center justify-end">
                      <button
                        onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                        aria-label={`Tandai Set ${set.setNumber} selesai`}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition active:scale-90 ${
                          set.completed
                            ? 'bg-lime-400 text-slate-950 font-bold shadow-md shadow-lime-400/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                        }`}
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Set Actions: Add Set & Remove Set */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleAddSet(exIdx)}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-lime-400 font-bold transition active:scale-95 min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Set</span>
                </button>

                {log.sets.length > 1 && (
                  <button
                    onClick={() => handleRemoveSet(exIdx, log.sets.length - 1)}
                    className="text-slate-500 hover:text-red-400 py-2 px-2 text-xs"
                  >
                    Hapus Set Terakhir
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Exercise to this active workout */}
        <button
          onClick={() => setIsPickerOpen(true)}
          className="w-full py-4 rounded-3xl bg-slate-900 border-2 border-dashed border-slate-800 hover:border-lime-400/50 text-slate-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-98 min-h-[52px]"
        >
          <Plus className="w-4 h-4 text-lime-400" />
          <span>Tambah Gerakan Latihan ke Sesi Ini</span>
        </button>
      </main>

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Batalkan Sesi Latihan?</h3>
            <p className="text-xs text-slate-400 mt-2">
              Sesi latihan yang sedang berlangsung akan dibatalkan dan tidak dicatat ke riwayat.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 min-h-[44px]"
              >
                Lanjutkan
              </button>
              <button
                onClick={onCancelWorkout}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs min-h-[44px]"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub Modals */}
      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectExercise={handleAddExerciseFromPicker}
        title="Tambah Gerakan ke Sesi Ini"
      />

      <PlateCalculatorModal
        isOpen={plateCalcWeight !== null}
        onClose={() => setPlateCalcWeight(null)}
        defaultWeightKg={plateCalcWeight || 60}
      />

      <OneRMCalculatorModal
        isOpen={oneRMCalcData !== null}
        onClose={() => setOneRMCalcData(null)}
        defaultWeightKg={oneRMCalcData?.weight || 80}
        defaultReps={oneRMCalcData?.reps || 6}
      />
    </div>
  );
};
