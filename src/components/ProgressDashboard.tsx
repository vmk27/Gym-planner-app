import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  Calendar as CalendarIcon,
  Flame,
  Dumbbell,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SessionDocument } from '../types/gym';
import { getAllExercises } from '../utils/storage';
import { getExerciseProgressData } from '../utils/calculations';

interface ProgressDashboardProps {
  sessions: SessionDocument[];
  onSelectSessionDetail: (session: SessionDocument) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  sessions,
  onSelectSessionDetail
}) => {
  const allExercises = useMemo(() => getAllExercises(), []);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ex_001');
  const [activeTab, setActiveTab] = useState<'grafik' | 'riwayat'>('grafik');

  // Filter completed sessions
  const completedSessions = useMemo(
    () => sessions.filter(s => s.status === 'completed'),
    [sessions]
  );

  // Overall metrics calculation
  const totalVolumeKg = useMemo(() => {
    return completedSessions.reduce((acc, s) => acc + s.totalVolume, 0);
  }, [completedSessions]);

  const totalSets = useMemo(() => {
    return completedSessions.reduce((acc, s) => acc + (s.totalSets || 0), 0);
  }, [completedSessions]);

  const totalDurationMinutes = useMemo(() => {
    return Math.round(completedSessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);
  }, [completedSessions]);

  const totalPRs = useMemo(() => {
    return completedSessions.reduce((acc, s) => acc + (s.prCount || 0), 0);
  }, [completedSessions]);

  // Execute the exact transformation function specified by the user!
  const exerciseProgressData = useMemo(() => {
    return getExerciseProgressData(completedSessions, selectedExerciseId);
  }, [completedSessions, selectedExerciseId]);

  // Max and Min for Chart scaling
  const max1RM = useMemo(() => {
    if (exerciseProgressData.length === 0) return 100;
    return Math.max(...exerciseProgressData.map(h => h.estimated1RM)) * 1.15;
  }, [exerciseProgressData]);

  const min1RM = useMemo(() => {
    if (exerciseProgressData.length === 0) return 0;
    return Math.max(0, Math.min(...exerciseProgressData.map(h => h.estimated1RM)) * 0.85);
  }, [exerciseProgressData]);

  const maxVolume = useMemo(() => {
    if (completedSessions.length === 0) return 10000;
    return Math.max(...completedSessions.map(v => v.totalVolume)) * 1.15;
  }, [completedSessions]);

  const selectedExerciseObj = allExercises.find(e => e.id === selectedExerciseId);

  return (
    <div className="space-y-6 text-left">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Volume</span>
            <Layers className="w-4 h-4 text-lime-400" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-white">
            {(totalVolumeKg / 1000).toFixed(1)} <span className="text-xs text-slate-400 font-normal">Ton</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Dari {completedSessions.length} sesi latihan</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Rekor Baru (PR)</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-white">
            {totalPRs} <span className="text-xs text-slate-400 font-normal">PR</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Pencapaian beban baru</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Set Tuntas</span>
            <Dumbbell className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-white">
            {totalSets} <span className="text-xs text-slate-400 font-normal">Set</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Tercatat di log</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Waktu di Gym</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-white">
            {totalDurationMinutes} <span className="text-xs text-slate-400 font-normal">Menit</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Total waktu aktif</span>
        </div>
      </div>

      {/* Tabs: Grafik vs Riwayat */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800 max-w-xs">
        <button
          onClick={() => setActiveTab('grafik')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === 'grafik'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Grafik Progres (1RM)
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === 'riwayat'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Daftar Riwayat Sesi
        </button>
      </div>

      {activeTab === 'grafik' ? (
        <div className="space-y-6">
          {/* 1RM Progression Line Chart Card */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-lime-400" />
                  <h3 className="text-sm font-bold text-white">Grafik Progres 1RM (Formula Epley)</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  1RM = Beban × (1 + (Repetisi / 30))
                </p>
              </div>

              {/* Exercise Selector Dropdown */}
              <div className="shrink-0">
                <select
                  value={selectedExerciseId}
                  onChange={e => setSelectedExerciseId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-lime-400 focus:outline-none focus:border-lime-400"
                >
                  {allExercises.slice(0, 15).map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SVG Interactive Line Chart based on getExerciseProgressData */}
            <div className="mt-5">
              {exerciseProgressData.length < 2 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800">
                  <Flame className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs">
                    Membutuhkan minimal 2 sesi dengan gerakan{' '}
                    <strong className="text-slate-300">{selectedExerciseObj?.name}</strong> untuk
                    memvisualisasikan kurva progres.
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Pilih "Barbell Bench Press" atau "Barbell Deadlift" yang sudah memiliki catatan sesi.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="h-56 w-full relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="epleyLimeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a3e635" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#a3e635" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const y = 20 + ratio * 160;
                        const val = Math.round(max1RM - ratio * (max1RM - min1RM));
                        return (
                          <g key={i}>
                            <line
                              x1="40"
                              y1={y}
                              x2="490"
                              y2={y}
                              stroke="#1e293b"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                            />
                            <text
                              x="32"
                              y={y + 4}
                              fill="#64748b"
                              fontSize="10"
                              textAnchor="end"
                              className="font-mono"
                            >
                              {val}kg
                            </text>
                          </g>
                        );
                      })}

                      {/* Line and Area based on exerciseProgressData */}
                      {(() => {
                        const points = exerciseProgressData.map((item, idx) => {
                          const x = 50 + (idx / (exerciseProgressData.length - 1)) * 430;
                          const range = Math.max(max1RM - min1RM, 1);
                          const y = 180 - ((item.estimated1RM - min1RM) / range) * 160;
                          return { x, y, item };
                        });

                        const pathData = points
                          .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                          .join(' ');

                        const areaData = `${pathData} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

                        return (
                          <>
                            <path d={areaData} fill="url(#epleyLimeGradient)" />
                            <path
                              d={pathData}
                              fill="none"
                              stroke="#a3e635"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {points.map((p, idx) => (
                              <g key={idx}>
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r="5"
                                  className="fill-lime-400 stroke-slate-900"
                                  strokeWidth="2"
                                />
                                <text
                                  x={p.x}
                                  y={196}
                                  fill="#94a3b8"
                                  fontSize="10"
                                  textAnchor="middle"
                                  className="font-mono"
                                >
                                  {p.item.date}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      1RM Terkini:{' '}
                      <strong className="text-white font-mono">
                        {exerciseProgressData[exerciseProgressData.length - 1]?.estimated1RM} kg
                      </strong>
                    </span>
                    <span className="text-lime-400 font-semibold font-mono">
                      +{Math.round(
                        (exerciseProgressData[exerciseProgressData.length - 1].estimated1RM -
                          exerciseProgressData[0].estimated1RM) *
                          10
                      ) / 10}{' '}
                      kg peningkatan
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Volume Progression Bars */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Akumulasi Total Volume per Sesi</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Beban × Repetisi (Set non-pemanasan)
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {completedSessions.map(session => {
                const percent = Math.min(100, (session.totalVolume / maxVolume) * 100);
                const d = new Date(session.endTime || session.startTime);
                const dateStr = d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });

                return (
                  <div key={session.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate max-w-[200px]">
                        {session.routineName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-[11px]">{dateStr}</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {session.totalVolume.toLocaleString()} kg
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-lime-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Riwayat Sesi List */
        <div className="space-y-3">
          {completedSessions.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
              <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm">Belum ada riwayat sesi latihan.</p>
              <p className="text-xs text-slate-600 mt-1">
                Selesaikan satu sesi latihan untuk mulai melihat catatan dan grafik progres Anda!
              </p>
            </div>
          ) : (
            completedSessions.map(session => {
              const dateObj = new Date(session.startTime);
              const formattedDate = dateObj.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });
              const mins = Math.round(session.durationSeconds / 60);

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSessionDetail(session)}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-lime-400" />
                        <span>{formattedDate}</span>
                        <span>·</span>
                        <span>{mins} menit</span>
                      </div>
                      <h4 className="text-base font-bold text-white group-hover:text-lime-300 transition">
                        {session.routineName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {session.prCount && session.prCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-bold flex items-center gap-1">
                          <Award className="w-3 h-3" /> {session.prCount} PR
                        </span>
                      ) : null}
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition" />
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block">VOLUME</span>
                      <span className="font-bold text-slate-200">
                        {session.totalVolume.toLocaleString()} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">SET</span>
                      <span className="font-bold text-slate-200">{session.totalSets || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">REPS</span>
                      <span className="font-bold text-slate-200">{session.totalReps || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">GERAKAN</span>
                      <span className="font-bold text-slate-200">{session.logs?.length || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
