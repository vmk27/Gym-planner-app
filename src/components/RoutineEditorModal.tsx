import React, { useState } from 'react';
import { X, Plus, Trash2, Dumbbell, MoveUp, MoveDown } from 'lucide-react';
import { RoutineDocument, RoutineExerciseItem, ExerciseDocument } from '../types/gym';
import { ExercisePickerModal } from './ExercisePickerModal';

interface RoutineEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (routine: RoutineDocument) => void;
  initialRoutine?: RoutineDocument | null;
}

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const RoutineEditorModal: React.FC<RoutineEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRoutine
}) => {
  const [name, setName] = useState(initialRoutine?.name || '');
  const [notes, setNotes] = useState(initialRoutine?.notes || '');
  const [category, setCategory] = useState<RoutineDocument['category']>(
    initialRoutine?.category || 'Push Pull Legs'
  );
  const [difficulty, setDifficulty] = useState<RoutineDocument['difficulty']>(
    initialRoutine?.difficulty || 'Menengah'
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialRoutine?.targetDays || ['Senin']
  );
  const [exercises, setExercises] = useState<RoutineExerciseItem[]>(
    initialRoutine?.exercises || [
      {
        exerciseId: 'ex_001',
        name: 'Barbell Bench Press',
        targetSets: 4,
        targetReps: '8-10',
        restTimer: 120,
        muscleGroup: 'Chest',
        equipment: 'Barbell'
      }
    ]
  );

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAddExercise = (exercise: ExerciseDocument) => {
    if (!exercises.some(e => e.exerciseId === exercise.id)) {
      setExercises(prev => [
        ...prev,
        {
          exerciseId: exercise.id,
          name: exercise.name, // Denormalized as required by NoSQL/Supabase schema
          targetSets: 3,
          targetReps: '10',
          restTimer: exercise.defaultRestSeconds || 90,
          muscleGroup: exercise.muscleGroup,
          equipment: exercise.equipment
        }
      ]);
    }
    setIsPickerOpen(false);
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMove = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= exercises.length) return;
    const copy = [...exercises];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setExercises(copy);
  };

  const updateExerciseSets = (idx: number, sets: number) => {
    setExercises(prev =>
      prev.map((item, i) => (i === idx ? { ...item, targetSets: Math.max(1, sets) } : item))
    );
  };

  const updateExerciseReps = (idx: number, reps: string) => {
    setExercises(prev =>
      prev.map((item, i) => (i === idx ? { ...item, targetReps: reps } : item))
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const routine: RoutineDocument = {
      id: initialRoutine?.id || `rt_${Date.now()}`,
      userId: initialRoutine?.userId || 'user_123',
      name: name.trim(),
      notes: notes.trim(),
      category,
      difficulty,
      targetDays: selectedDays,
      exercises,
      createdAt: initialRoutine?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(routine);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
        <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col max-h-[90vh] text-left">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
            <h3 className="text-base font-bold text-white">
              {initialRoutine ? 'Edit Rutinitas Latihan' : 'Buat Rutinitas Baru'}
            </h3>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Routine Name */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                Nama Program / Rutinitas
              </label>
              <input
                type="text"
                placeholder="Contoh: Hypertrophy Push Day, Upper Power..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 font-semibold"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                Catatan Sesi (Notes)
              </label>
              <textarea
                rows={2}
                placeholder="Fokus pada rentang gerak (ROM), tempo latihan..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 resize-none"
              />
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Kategori</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as RoutineDocument['category'])}
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="Push Pull Legs">Push Pull Legs</option>
                  <option value="Upper Lower">Upper Lower</option>
                  <option value="Full Body">Full Body</option>
                  <option value="Bro Split">Bro Split</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Tingkat Kesulitan</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as RoutineDocument['difficulty'])}
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="Pemula">Pemula</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Lanjutan">Lanjutan</option>
                </select>
              </div>
            </div>

            {/* Target Days */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                Jadwal Hari Latihan
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_OF_WEEK.map(day => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? 'bg-lime-400 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exercises List inside Routine */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Daftar Gerakan ({exercises.length})
                </label>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-lime-400 font-bold hover:text-lime-300 py-1 px-2 rounded-lg hover:bg-slate-800 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Gerakan
                </button>
              </div>

              {exercises.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-dashed border-slate-800">
                  <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Belum ada gerakan latihan yang ditambahkan.</p>
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-lime-400 text-slate-950 text-xs font-bold hover:bg-lime-300"
                  >
                    Pilih Gerakan Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {exercises.map((item, idx) => (
                    <div
                      key={item.exerciseId + idx}
                      className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'up')}
                            disabled={idx === 0}
                            className="text-slate-500 hover:text-slate-300 disabled:opacity-30 p-0.5"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'down')}
                            disabled={idx === exercises.length - 1}
                            className="text-slate-500 hover:text-slate-300 disabled:opacity-30 p-0.5"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {item.muscleGroup} · {item.equipment} · Istirahat {item.restTimer}s
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <input
                            type="number"
                            min="1"
                            value={item.targetSets}
                            onChange={e => updateExerciseSets(idx, Number(e.target.value) || 1)}
                            className="w-12 h-8 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono font-bold text-white text-xs focus:outline-none focus:border-lime-400"
                          />
                          <span className="text-slate-500 text-[11px]">set ×</span>
                          <input
                            type="text"
                            value={item.targetReps}
                            onChange={e => updateExerciseReps(idx, e.target.value)}
                            placeholder="8-12"
                            className="w-14 h-8 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono font-bold text-white text-xs focus:outline-none focus:border-lime-400"
                          />
                          <span className="text-slate-500 text-[11px]">reps</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition"
                          title="Hapus Gerakan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim() || exercises.length === 0}
              className="px-5 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs hover:bg-lime-300 transition disabled:opacity-50 disabled:pointer-events-none"
            >
              Simpan Rutinitas
            </button>
          </div>
        </div>
      </div>

      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectExercise={handleAddExercise}
        selectedExerciseIds={exercises.map(e => e.exerciseId)}
        title="Pilih Gerakan untuk Rutinitas"
      />
    </>
  );
};
