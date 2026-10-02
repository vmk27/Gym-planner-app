import { SessionDocument, ExerciseChartPoint } from '../types/gym';

/**
 * Menghitung estimasi 1RM menggunakan Formula Epley
 * @param weight - Beban yang diangkat
 * @param reps - Jumlah repetisi
 * @returns Estimasi 1RM
 */
export const calculate1RM = (weight: number, reps: number): number => {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  
  // Formula Epley: Beban × (1 + (Repetisi / 30))
  return weight * (1 + (reps / 30));
};

/**
 * Menghasilkan data untuk grafik progres berdasarkan satu gerakan spesifik
 * Mengembalikan array of objects berformat { date, volume, estimated1RM }
 * @param sessions - Array dokumen sesi dari Firestore / Local NoSQL
 * @param targetExerciseId - ID gerakan yang ingin dilihat grafiknya (misal: "ex_001")
 * @returns Data berformat untuk visualisasi grafik
 */
export const getExerciseProgressData = (
  sessions: SessionDocument[],
  targetExerciseId: string
): ExerciseChartPoint[] => {
  // 1. Filter hanya sesi yang 'completed' dan urutkan dari yang paling lama ke terbaru berdasarkan waktu selesai
  const completedSessions = sessions.filter(s => s.status === 'completed' && s.endTime);
  const sortedSessions = [...completedSessions].sort(
    (a, b) => new Date(a.endTime!).getTime() - new Date(b.endTime!).getTime()
  );

  const chartData: ExerciseChartPoint[] = [];

  sortedSessions.forEach(session => {
    // Cari apakah gerakan target dilakukan pada sesi ini
    const exerciseLog = session.logs?.find(log => log.exerciseId === targetExerciseId);

    if (exerciseLog && exerciseLog.sets?.length > 0) {
      let sessionVolume = 0;
      let maxSession1RM = 0;
      let maxWeight = 0;

      exerciseLog.sets.forEach(set => {
        // Abaikan set pemanasan untuk akurasi data progres utama
        if (set.isWarmup) return;

        // Hitung akumulasi Volume (Beban x Repetisi)
        sessionVolume += (set.weight * set.reps);

        if (set.weight > maxWeight) {
          maxWeight = set.weight;
        }

        // Hitung 1RM untuk set ini dan simpan yang paling tinggi (Max)
        const currentSet1RM = calculate1RM(set.weight, set.reps);
        if (currentSet1RM > maxSession1RM) {
          maxSession1RM = currentSet1RM;
        }
      });

      // Hanya masukkan ke data grafik jika ada volume yang valid
      if (sessionVolume > 0) {
        chartData.push({
          // Format tanggal singkat untuk sumbu X (misal: "2 Okt")
          date: new Date(session.endTime!).toLocaleDateString('id-ID', { 
            month: 'short', 
            day: 'numeric' 
          }),
          volume: sessionVolume,
          // Bulatkan 1RM ke 1 angka desimal
          estimated1RM: Math.round(maxSession1RM * 10) / 10,
          maxWeight
        });
      }
    }
  });

  return chartData;
};

export interface PlateResult {
  barWeight: number;
  targetWeight: number;
  weightPerSide: number;
  platesPerSide: { weight: number; count: number; color: string; border: string }[];
  achievedWeight: number;
  difference: number;
}

export const OLYMPIC_PLATES = [
  { weight: 25, color: 'bg-red-600', text: 'text-white', border: 'border-red-500' },
  { weight: 20, color: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
  { weight: 15, color: 'bg-amber-400', text: 'text-slate-950', border: 'border-amber-300' },
  { weight: 10, color: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-500' },
  { weight: 5, color: 'bg-slate-200', text: 'text-slate-900', border: 'border-slate-300' },
  { weight: 2.5, color: 'bg-slate-700', text: 'text-white', border: 'border-slate-600' },
  { weight: 1.25, color: 'bg-zinc-500', text: 'text-white', border: 'border-zinc-400' }
];

export function calculatePlates(targetWeight: number, barWeight = 20): PlateResult {
  if (targetWeight <= barWeight) {
    return {
      barWeight,
      targetWeight,
      weightPerSide: 0,
      platesPerSide: [],
      achievedWeight: barWeight,
      difference: barWeight - targetWeight
    };
  }

  const weightNeeded = targetWeight - barWeight;
  let remainingPerSide = weightNeeded / 2;
  const platesPerSide: { weight: number; count: number; color: string; border: string }[] = [];

  for (const plate of OLYMPIC_PLATES) {
    if (remainingPerSide >= plate.weight) {
      const count = Math.floor(remainingPerSide / plate.weight);
      remainingPerSide = Math.round((remainingPerSide - count * plate.weight) * 100) / 100;
      platesPerSide.push({
        weight: plate.weight,
        count,
        color: plate.color,
        border: plate.border
      });
    }
  }

  const platesTotalWeight = platesPerSide.reduce((sum, p) => sum + p.weight * p.count, 0) * 2;
  const achievedWeight = barWeight + platesTotalWeight;

  return {
    barWeight,
    targetWeight,
    weightPerSide: platesTotalWeight / 2,
    platesPerSide,
    achievedWeight,
    difference: Math.round((targetWeight - achievedWeight) * 100) / 100
  };
}

export function getRepMaxTable(oneRM: number) {
  const table = [
    { reps: 1, percentage: 100 },
    { reps: 2, percentage: 95 },
    { reps: 4, percentage: 90 },
    { reps: 6, percentage: 85 },
    { reps: 8, percentage: 80 },
    { reps: 10, percentage: 75 },
    { reps: 12, percentage: 70 },
    { reps: 15, percentage: 65 },
  ];

  return table.map(item => ({
    reps: item.reps,
    percentage: item.percentage,
    estimatedWeightKg: Math.round((oneRM * (item.percentage / 100)) * 2) / 2
  }));
}
