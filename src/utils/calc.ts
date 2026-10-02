// 1RM Calculation Utilities and Plate Loading Math

/**
 * Calculate One-Rep Max using Epley formula: w * (1 + r / 30)
 */
export function calculate1RMEpley(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round((weightKg * (1 + reps / 30)) * 10) / 10;
}

/**
 * Calculate One-Rep Max using Brzycki formula: w * (36 / (37 - r))
 */
export function calculate1RMBrzycki(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  if (reps >= 37) return Math.round(weightKg * 2.5 * 10) / 10;
  return Math.round((weightKg * (36 / (37 - reps))) * 10) / 10;
}

/**
 * Standard 1RM estimation used across app (average of Epley & Brzycki for balanced accuracy)
 */
export function estimate1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  const epley = calculate1RMEpley(weightKg, reps);
  const brzycki = calculate1RMBrzycki(weightKg, reps);
  return Math.round(((epley + brzycki) / 2) * 10) / 10;
}

export interface RepPercentage {
  reps: number;
  percentage: number;
  estimatedWeightKg: number;
}

export function getRepMaxTable(oneRMKg: number): RepPercentage[] {
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
    estimatedWeightKg: Math.round((oneRMKg * (item.percentage / 100)) * 2) / 2
  }));
}

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

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}
