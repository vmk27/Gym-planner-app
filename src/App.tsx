import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dumbbell,
  Play,
  Plus,
  TrendingUp,
  Search,
  BookOpen,
  User,
  Calculator,
  Flame,
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  Copy,
  Trash2,
  Edit2
} from 'lucide-react';
import {
  UserDocument,
  RoutineDocument,
  SessionDocument,
  ExerciseDocument,
  ExerciseLog
} from './types/gym';
import {
  getStoredUser,
  saveStoredUser,
  getStoredRoutines,
  saveStoredRoutines,
  getStoredSessions,
  saveStoredSessions,
  getAllExercises,
  saveCustomExercise,
  getPreviousExercisePerformance
} from './utils/storage';
import { LiveWorkoutTracker } from './components/LiveWorkoutTracker';
import { RestTimerOverlay } from './components/RestTimerOverlay';
import { ProgressDashboard } from './components/ProgressDashboard';
import { RoutineEditorModal } from './components/RoutineEditorModal';
import { ExerciseDetailModal } from './components/ExerciseDetailModal';
import { SessionDetailModal } from './components/SessionDetailModal';
import { ProfileModal } from './components/ProfileModal';
import { PlateCalculatorModal } from './components/PlateCalculatorModal';
import { OneRMCalculatorModal } from './components/OneRMCalculatorModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MUSCLE_GROUPS, EQUIPMENTS } from './data/exercises';

export default function App() {
  // Persistence state
  const [user, setUser] = useState<UserDocument>(() => getStoredUser());
  const [routines, setRoutines] = useState<RoutineDocument[]>(() => getStoredRoutines());
  const [sessions, setSessions] = useState<SessionDocument[]>(() => getStoredSessions());
  const [allExercises, setAllExercises] = useState<ExerciseDocument[]>(() => getAllExercises());

  // Navigation tab: 'latihan' | 'rutinitas' | 'database' | 'progres'
  const [activeTab, setActiveTab] = useState<'latihan' | 'rutinitas' | 'database' | 'progres'>(
    'latihan'
  );

  // Active Live Workout Session
  const [activeSession, setActiveSession] = useState<{
    routineName: string;
    routineId?: string | null;
    initialLogs: ExerciseLog[];
  } | null>(null);
  const [isWorkoutMinimized, setIsWorkoutMinimized] = useState(false);

  // Rest Timer State
  const [restTimer, setRestTimer] = useState<{
    initialSeconds: number;
    remainingSeconds: number;
    isRunning: boolean;
    visible: boolean;
  }>({
    initialSeconds: 90,
    remainingSeconds: 90,
    isRunning: false,
    visible: false
  });

  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals state
  const [isRoutineEditorOpen, setIsRoutineEditorOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineDocument | null>(null);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<ExerciseDocument | null>(null);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<SessionDocument | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState(false);
  const [isOneRMCalcOpen, setIsOneRMCalcOpen] = useState(false);

  // Database Tab Filters
  const [searchExercise, setSearchExercise] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<string>('Semua');
  const [filterEquipment, setFilterEquipment] = useState<string>('Semua');

  // Rest Timer interval loop
  useEffect(() => {
    if (restTimer.isRunning && restTimer.visible) {
      restTimerRef.current = setInterval(() => {
        setRestTimer(prev => {
          if (prev.remainingSeconds <= 1) {
            return { ...prev, remainingSeconds: 0, isRunning: false };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    } else {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    }
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [restTimer.isRunning, restTimer.visible]);

  const triggerRestTimer = (seconds: number) => {
    setRestTimer({
      initialSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: true,
      visible: true
    });
  };

  // Start workout from a routine
  const handleStartRoutineWorkout = (routine: RoutineDocument) => {
    const logs: ExerciseLog[] = routine.exercises.map(item => {
      const prev = getPreviousExercisePerformance(item.exerciseId);
      const setsCount = item.targetSets || 3;
      const parsedReps = parseInt(item.targetReps) || 10;

      const sets = Array.from({ length: setsCount }, (_, idx) => ({
        id: `s_${Date.now()}_${idx}`,
        setNumber: idx + 1,
        weight: prev?.weight || 20,
        reps: prev?.reps || parsedReps,
        isWarmup: idx === 0 && (prev?.weight || 20) >= 50,
        previousWeight: prev?.weight,
        previousReps: prev?.reps,
        completed: false
      }));

      return {
        exerciseId: item.exerciseId,
        name: item.name,
        muscleGroup: item.muscleGroup,
        equipment: item.equipment,
        sets
      };
    });

    setActiveSession({
      routineName: routine.name,
      routineId: routine.id,
      initialLogs: logs
    });
    setIsWorkoutMinimized(false);
  };

  // Start free/blank workout
  const handleStartBlankWorkout = () => {
    const bench = allExercises.find(e => e.id === 'ex_001') || allExercises[0];
    const prev = getPreviousExercisePerformance(bench.id);

    const logs: ExerciseLog[] = [
      {
        exerciseId: bench.id,
        name: bench.name,
        muscleGroup: bench.muscleGroup,
        equipment: bench.equipment,
        sets: [
          {
            id: `s_${Date.now()}_0`,
            setNumber: 1,
            weight: prev?.weight || 40,
            reps: prev?.reps || 10,
            isWarmup: false,
            previousWeight: prev?.weight,
            previousReps: prev?.reps,
            completed: false
          }
        ]
      }
    ];

    setActiveSession({
      routineName: 'Latihan Bebas (Free Workout)',
      routineId: null,
      initialLogs: logs
    });
    setIsWorkoutMinimized(false);
  };

  // Finish active session
  const handleFinishWorkout = (finishedSession: SessionDocument) => {
    const updated = [finishedSession, ...sessions];
    setSessions(updated);
    saveStoredSessions(updated);
    setActiveSession(null);
    setRestTimer(prev => ({ ...prev, visible: false, isRunning: false }));
    setActiveTab('progres');
  };

  // Cancel active session
  const handleCancelWorkout = () => {
    setActiveSession(null);
    setRestTimer(prev => ({ ...prev, visible: false, isRunning: false }));
  };

  // Save Routine
  const handleSaveRoutine = (routine: RoutineDocument) => {
    const exists = routines.some(r => r.id === routine.id);
    let updated: RoutineDocument[];
    if (exists) {
      updated = routines.map(r => (r.id === routine.id ? routine : r));
    } else {
      updated = [routine, ...routines];
    }
    setRoutines(updated);
    saveStoredRoutines(updated);
  };

  // Delete Routine
  const handleDeleteRoutine = (routineId: string) => {
    if (window.confirm('Hapus rutinitas ini?')) {
      const updated = routines.filter(r => r.id !== routineId);
      setRoutines(updated);
      saveStoredRoutines(updated);
    }
  };

  // Duplicate Routine
  const handleDuplicateRoutine = (routine: RoutineDocument) => {
    const copy: RoutineDocument = {
      ...routine,
      id: `rt_${Date.now()}`,
      name: `${routine.name} (Salinan)`,
      createdAt: new Date().toISOString()
    };
    const updated = [copy, ...routines];
    setRoutines(updated);
    saveStoredRoutines(updated);
  };

  // Delete Session from history
  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter(s => s.id !== sessionId);
    setSessions(updated);
    saveStoredSessions(updated);
  };

  // Filtered exercises for Database tab
  const filteredExercises = useMemo(() => {
    return allExercises.filter(ex => {
      const matchSearch =
        ex.name.toLowerCase().includes(searchExercise.toLowerCase()) ||
        (ex.nameIndo && ex.nameIndo.toLowerCase().includes(searchExercise.toLowerCase()));
      const matchMuscle = filterMuscle === 'Semua' || ex.muscleGroup === filterMuscle;
      const matchEquipment = filterEquipment === 'Semua' || ex.equipment === filterEquipment;
      return matchSearch && matchMuscle && matchEquipment;
    });
  }, [allExercises, searchExercise, filterMuscle, filterEquipment]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 md:pb-12">
      <OfflineIndicator />

      {/* TOP BAR CONTRACT: Single text Brand Title | 4 Clean Nav Links | 1-2 Primary Actions */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Zone 1: Single text element wordmark in display font */}
          <a
            href="/"
            onClick={e => {
              e.preventDefault();
              setActiveTab('latihan');
            }}
            className="text-xl font-extrabold tracking-tight text-white hover:text-lime-400 transition font-display flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400 inline-block" />
            IronLog
          </a>

          {/* Zone 2: 4 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <button
              onClick={() => setActiveTab('latihan')}
              className={`hover:text-white transition-colors pb-0.5 ${
                activeTab === 'latihan' ? 'text-lime-400 border-b-2 border-lime-400 font-bold' : ''
              }`}
            >
              Latihan
            </button>
            <button
              onClick={() => setActiveTab('rutinitas')}
              className={`hover:text-white transition-colors pb-0.5 ${
                activeTab === 'rutinitas' ? 'text-lime-400 border-b-2 border-lime-400 font-bold' : ''
              }`}
            >
              Rutinitas
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`hover:text-white transition-colors pb-0.5 ${
                activeTab === 'database' ? 'text-lime-400 border-b-2 border-lime-400 font-bold' : ''
              }`}
            >
              Database Gerakan
            </button>
            <button
              onClick={() => setActiveTab('progres')}
              className={`hover:text-white transition-colors pb-0.5 ${
                activeTab === 'progres' ? 'text-lime-400 border-b-2 border-lime-400 font-bold' : ''
              }`}
            >
              Grafik Progres
            </button>
          </nav>

          {/* Zone 3: 1-2 Primary actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPlateCalcOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
              title="Kalkulator Piringan Barbel"
            >
              <Calculator className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOneRMCalcOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-slate-700 transition"
              title="Kalkulator 1RM"
            >
              <Flame className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-lime-400 hover:border-slate-700 transition flex items-center gap-1.5"
              title="Pengaturan Profil"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">{user.displayName}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 flex-1">
        {/* TAB 1: LATIHAN (WORKOUTS & QUICK START) */}
        {activeTab === 'latihan' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Hero Quick Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
              <div className="max-w-xl relative z-10 text-left">
                <span className="text-xs uppercase tracking-widest text-lime-400 font-bold block mb-2">
                  Siap Latihan Hari Ini?
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Tingkatkan Beban, Catat Repetisi, Lampaui Rekor Anda
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Lacak setiap set angkatan langsung di gym. Stopwatch istirahat otomatis berbunyi saat jeda antar set selesai.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleStartBlankWorkout}
                    className="px-5 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-extrabold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-lime-400/20 active:scale-95 min-h-[44px]"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Mulai Latihan Bebas</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('rutinitas')}
                    className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition border border-slate-700/60 active:scale-95 min-h-[44px]"
                  >
                    Pilih Dari Rutinitas
                  </button>
                </div>
              </div>
            </div>

            {/* Active Workout Banner if in progress and minimized */}
            {activeSession && isWorkoutMinimized && (
              <div className="p-4 rounded-2xl bg-lime-950/30 border border-lime-400/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-lime-400 animate-ping" />
                  <div>
                    <span className="text-xs text-lime-400 font-bold block uppercase tracking-wider">
                      Sesi Latihan Berlangsung
                    </span>
                    <span className="text-sm font-bold text-white">{activeSession.routineName}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsWorkoutMinimized(false)}
                  className="px-4 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs hover:bg-lime-300 transition"
                >
                  Buka Sesi
                </button>
              </div>
            )}

            {/* Quick Routine Selector */}
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Program & Rutinitas Tersedia</h2>
                  <p className="text-xs text-slate-400">Pilih program latihan untuk langsung mulai melacak</p>
                </div>
                <button
                  onClick={() => {
                    setEditingRoutine(null);
                    setIsRoutineEditorOpen(true);
                  }}
                  className="text-xs font-bold text-lime-400 hover:text-lime-300 flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-slate-900 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Program Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routines.map(routine => (
                  <div
                    key={routine.id}
                    className="rounded-3xl bg-slate-900 border border-slate-800 p-5 hover:border-slate-700 transition flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="text-lime-400 font-semibold">{routine.category}</span>
                        <div className="flex items-center gap-1.5">
                          {routine.targetDays && routine.targetDays.map(d => (
                            <span key={d} className="text-[10px] text-slate-400">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-lime-300 transition">
                        {routine.name}
                      </h3>
                      {routine.notes && (
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{routine.notes}</p>
                      )}

                      {/* Exercises summary chips */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {routine.exercises.slice(0, 4).map(ex => (
                          <span
                            key={ex.exerciseId}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
                          >
                            {ex.name}
                          </span>
                        ))}
                        {routine.exercises.length > 4 && (
                          <span className="px-2 py-1 rounded-lg bg-slate-950 text-[11px] text-slate-500 font-mono">
                            +{routine.exercises.length - 4} lainnya
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">
                        {routine.exercises.length} Gerakan
                      </span>
                      <button
                        onClick={() => handleStartRoutineWorkout(routine)}
                        className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-lime-400/20 active:scale-95 min-h-[44px]"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Mulai Sesi Ini</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RUTINITAS (CRUD MANAGER) */}
        {activeTab === 'rutinitas' && (
          <div className="space-y-5 text-left animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Manajemen Rutinitas</h2>
                <p className="text-xs text-slate-400">
                  Buat, edit, dan atur template latihan terstruktur untuk target mingguan Anda
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingRoutine(null);
                  setIsRoutineEditorOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-lime-400/20 active:scale-95 self-start min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Rutinitas Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routines.map(routine => (
                <div
                  key={routine.id}
                  className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-lime-400 uppercase tracking-wider block mb-1">
                        {routine.category} · {routine.difficulty || 'Menengah'}
                      </span>
                      <h3 className="text-base font-bold text-white">{routine.name}</h3>
                      {routine.notes && (
                        <p className="text-xs text-slate-400 mt-1">{routine.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicateRoutine(routine)}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                        title="Duplikat Rutinitas"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingRoutine(routine);
                          setIsRoutineEditorOpen(true);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-lime-400 hover:bg-slate-800 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                        title="Edit Rutinitas"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoutine(routine.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                        title="Hapus Rutinitas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Exercise list in routine */}
                  <div className="space-y-1.5">
                    {routine.exercises.map((item, idx) => (
                      <div
                        key={item.exerciseId + idx}
                        className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-300 font-medium">{item.name}</span>
                        <span className="font-mono text-slate-400 text-[11px]">
                          {item.targetSets} set × {item.targetReps} reps · {item.restTimer}s
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      Jadwal: {routine.targetDays?.join(', ') || 'Fleksibel'}
                    </div>
                    <button
                      onClick={() => handleStartRoutineWorkout(routine)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-lime-400 font-bold text-xs transition flex items-center gap-1.5 min-h-[44px]"
                    >
                      <Play className="w-3.5 h-3.5 fill-lime-400" />
                      <span>Mulai Latihan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DATABASE GERAKAN (EXERCISES EXPLORER) */}
        {activeTab === 'database' && (
          <div className="space-y-5 text-left animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Database Gerakan Latihan</h2>
                <p className="text-xs text-slate-400">
                  Panduan gerakan lengkap dengan instruksi eksekusi, fokus otot, dan tips form aman
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-3 bg-slate-900 p-4 rounded-3xl border border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama gerakan (misal: Bench Press, Squat, Lateral Raise)..."
                  value={searchExercise}
                  onChange={e => setSearchExercise(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              {/* Muscle filter chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  onClick={() => setFilterMuscle('Semua')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                    filterMuscle === 'Semua'
                      ? 'bg-lime-400 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Semua Otot
                </button>
                {MUSCLE_GROUPS.map(m => (
                  <button
                    key={m}
                    onClick={() => setFilterMuscle(m)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                      filterMuscle === m
                        ? 'bg-lime-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Equipment filter chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                <span className="text-slate-500 shrink-0">Alat:</span>
                <button
                  onClick={() => setFilterEquipment('Semua')}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap transition ${
                    filterEquipment === 'Semua'
                      ? 'bg-slate-700 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua
                </button>
                {EQUIPMENTS.map(eq => (
                  <button
                    key={eq}
                    onClick={() => setFilterEquipment(eq)}
                    className={`px-2.5 py-1 rounded-md whitespace-nowrap transition ${
                      filterEquipment === eq
                        ? 'bg-slate-700 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredExercises.map(ex => {
                const prev = getPreviousExercisePerformance(ex.id);
                return (
                  <div
                    key={ex.id}
                    onClick={() => setSelectedExerciseDetail(ex)}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="text-lime-400 font-semibold">{ex.muscleGroup}</span>
                        <span>{ex.equipment}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-lime-300 transition">
                        {ex.name}
                      </h4>
                      {ex.nameIndo && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{ex.nameIndo}</p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      {prev ? (
                        <span className="font-mono text-lime-400 text-[11px] font-semibold">
                          Rekor: {prev.weight}kg × {prev.reps}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Belum ada riwayat</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PROGRES & RIWAYAT (DASHBOARD) */}
        {activeTab === 'progres' && (
          <div className="animate-in fade-in">
            <ProgressDashboard
              sessions={sessions}
              onSelectSessionDetail={session => setSelectedSessionDetail(session)}
            />
          </div>
        )}
      </main>

      {/* FIXED MOBILE BOTTOM TAB BAR (Thumb ergonomics <= 15% sticky cap) */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 pb-safe">
        <div className="grid grid-cols-4 items-center h-16">
          <button
            onClick={() => setActiveTab('latihan')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'latihan' ? 'text-lime-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Latihan</span>
          </button>
          <button
            onClick={() => setActiveTab('rutinitas')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'rutinitas' ? 'text-lime-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Rutinitas</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'database' ? 'text-lime-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Database</span>
          </button>
          <button
            onClick={() => setActiveTab('progres')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'progres' ? 'text-lime-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Progres</span>
          </button>
        </div>
      </footer>

      {/* ACTIVE LIVE WORKOUT TRACKER MODAL / DOCK */}
      {activeSession && (
        <LiveWorkoutTracker
          routineName={activeSession.routineName}
          routineId={activeSession.routineId}
          initialLogs={activeSession.initialLogs}
          isMinimized={isWorkoutMinimized}
          onToggleMinimize={() => setIsWorkoutMinimized(!isWorkoutMinimized)}
          onFinishWorkout={handleFinishWorkout}
          onCancelWorkout={handleCancelWorkout}
          onTriggerRestTimer={triggerRestTimer}
        />
      )}

      {/* REST TIMER FLOATING OVERLAY */}
      {restTimer.visible && (
        <RestTimerOverlay
          initialSeconds={restTimer.initialSeconds}
          remainingSeconds={restTimer.remainingSeconds}
          isRunning={restTimer.isRunning}
          onTogglePlay={() => setRestTimer(prev => ({ ...prev, isRunning: !prev.isRunning }))}
          onReset={() =>
            setRestTimer(prev => ({ ...prev, remainingSeconds: prev.initialSeconds, isRunning: true }))
          }
          onAdjustSeconds={delta =>
            setRestTimer(prev => ({
              ...prev,
              remainingSeconds: Math.max(0, prev.remainingSeconds + delta)
            }))
          }
          onClose={() => setRestTimer(prev => ({ ...prev, visible: false, isRunning: false }))}
          soundEnabled={user.preferences.soundEnabled}
        />
      )}

      {/* MODALS */}
      <RoutineEditorModal
        isOpen={isRoutineEditorOpen}
        onClose={() => {
          setIsRoutineEditorOpen(false);
          setEditingRoutine(null);
        }}
        onSave={handleSaveRoutine}
        initialRoutine={editingRoutine}
      />

      <ExerciseDetailModal
        exercise={selectedExerciseDetail}
        onClose={() => setSelectedExerciseDetail(null)}
        onStartWithExercise={ex => {
          setSelectedExerciseDetail(null);
          const prev = getPreviousExercisePerformance(ex.id);
          setActiveSession({
            routineName: `Latihan: ${ex.name}`,
            routineId: null,
            initialLogs: [
              {
                exerciseId: ex.id,
                name: ex.name,
                muscleGroup: ex.muscleGroup,
                equipment: ex.equipment,
                sets: [
                  {
                    id: `s_${Date.now()}_0`,
                    setNumber: 1,
                    weight: prev?.weight || 20,
                    reps: prev?.reps || 10,
                    isWarmup: false,
                    previousWeight: prev?.weight,
                    previousReps: prev?.reps,
                    completed: false
                  }
                ]
              }
            ]
          });
          setIsWorkoutMinimized(false);
        }}
      />

      <SessionDetailModal
        session={selectedSessionDetail}
        onClose={() => setSelectedSessionDetail(null)}
        onDeleteSession={handleDeleteSession}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onSaveUser={updated => {
          setUser(updated);
          saveStoredUser(updated);
        }}
        onDataImported={() => {
          setUser(getStoredUser());
          setRoutines(getStoredRoutines());
          setSessions(getStoredSessions());
          setAllExercises(getAllExercises());
        }}
      />

      <PlateCalculatorModal
        isOpen={isPlateCalcOpen}
        onClose={() => setIsPlateCalcOpen(false)}
        defaultWeightKg={60}
      />

      <OneRMCalculatorModal
        isOpen={isOneRMCalcOpen}
        onClose={() => setIsOneRMCalcOpen(false)}
        defaultWeightKg={80}
        defaultReps={6}
      />
    </div>
  );
}
