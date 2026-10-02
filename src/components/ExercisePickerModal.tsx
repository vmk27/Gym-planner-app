import React, { useState, useMemo } from 'react';
import { X, Search, Check, Dumbbell } from 'lucide-react';
import { ExerciseDocument, MuscleGroup, Equipment } from '../types/gym';
import { getAllExercises } from '../utils/storage';
import { MUSCLE_GROUPS, EQUIPMENTS } from '../data/exercises';

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseDocument) => void;
  selectedExerciseIds?: string[];
  title?: string;
}

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  selectedExerciseIds = [],
  title = 'Pilih Gerakan Latihan'
}) => {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'Semua'>('Semua');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'Semua'>('Semua');

  const allExercises = useMemo(() => getAllExercises(), []);

  const filteredExercises = useMemo(() => {
    return allExercises.filter(ex => {
      const matchSearch =
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        (ex.nameIndo && ex.nameIndo.toLowerCase().includes(search.toLowerCase()));
      const matchMuscle = selectedMuscle === 'Semua' || ex.muscleGroup === selectedMuscle;
      const matchEquipment = selectedEquipment === 'Semua' || ex.equipment === selectedEquipment;
      return matchSearch && matchMuscle && matchEquipment;
    });
  }, [allExercises, search, selectedMuscle, selectedEquipment]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col max-h-[85vh] text-left">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar & Filters */}
        <div className="p-4 border-b border-slate-800 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari gerakan (misal: Bench Press, Squat, Deadlift)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Muscle Category Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedMuscle('Semua')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                selectedMuscle === 'Semua'
                  ? 'bg-lime-400 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Semua Otot
            </button>
            {MUSCLE_GROUPS.map(muscle => (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(muscle)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                  selectedMuscle === muscle
                    ? 'bg-lime-400 text-slate-950 font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {muscle}
              </button>
            ))}
          </div>

          {/* Equipment Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <span className="text-slate-500 shrink-0">Alat:</span>
            <button
              onClick={() => setSelectedEquipment('Semua')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition ${
                selectedEquipment === 'Semua'
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            {EQUIPMENTS.map(eq => (
              <button
                key={eq}
                onClick={() => setSelectedEquipment(eq)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition ${
                  selectedEquipment === eq
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 sm:p-3">
          {filteredExercises.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm">Tidak ada gerakan yang cocok dengan pencarian.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedMuscle('Semua');
                  setSelectedEquipment('Semua');
                }}
                className="mt-2 text-xs text-lime-400 underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            filteredExercises.map(ex => {
              const isSelected = selectedExerciseIds.includes(ex.id);
              return (
                <button
                  key={ex.id}
                  onClick={() => {
                    onSelectExercise(ex);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/60 active:bg-slate-800 transition text-left group min-h-[56px]"
                >
                  <div className="pr-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-0.5">
                      <span className="text-lime-400 font-semibold">{ex.muscleGroup}</span>
                      <span>·</span>
                      <span>{ex.equipment}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-lime-300 transition">
                      {ex.name}
                    </h4>
                    {ex.nameIndo && (
                      <p className="text-[11px] text-slate-500">{ex.nameIndo}</p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {isSelected ? (
                      <div className="w-8 h-8 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center font-bold">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-slate-700 text-slate-400 flex items-center justify-center transition">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 text-center text-[11px] text-slate-500 shrink-0">
          Menampilkan {filteredExercises.length} dari {allExercises.length} gerakan latihan
        </div>
      </div>
    </div>
  );
};
