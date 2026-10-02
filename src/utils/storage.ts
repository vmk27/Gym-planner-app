import {
  UserDocument,
  ExerciseDocument,
  RoutineDocument,
  SessionDocument
} from '../types/gym';
import { DEFAULT_ROUTINES } from '../data/defaultRoutines';
import { EXERCISES_DATA } from '../data/exercises';
import { calculate1RM } from './calculations';

const STORAGE_KEYS = {
  USERS: 'ironlog_user_doc_v1',
  ROUTINES: 'ironlog_routines_v1',
  SESSIONS: 'ironlog_sessions_v1',
  CUSTOM_EXERCISES: 'ironlog_custom_exercises_v1'
};

export const DEFAULT_USER: UserDocument = {
  uid: 'user_123',
  email: 'alex.fitness@example.com',
  displayName: 'Alex Pratama',
  createdAt: '2026-09-01T00:00:00.000Z',
  weightKg: 75,
  heightCm: 175,
  experienceLevel: 'Menengah',
  preferences: {
    weightUnit: 'kg',
    theme: 'dark',
    restTimerDefault: 90,
    soundEnabled: true,
    vibrateEnabled: true
  }
};

// Seed realistic completed sessions matching the exact NoSQL / Supabase schema
const SAMPLE_PAST_SESSIONS: SessionDocument[] = [
  {
    id: 'ses_001',
    userId: 'user_123',
    routineId: 'rt_001',
    routineName: 'Hypertrophy Push Day',
    startTime: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() - 7 * 24 * 3600 * 1000 + 52 * 60 * 1000).toISOString(),
    durationSeconds: 52 * 60,
    status: 'completed',
    totalVolume: 5880,
    totalSets: 14,
    totalReps: 132,
    prCount: 1,
    logs: [
      {
        exerciseId: 'ex_001',
        name: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        equipment: 'Barbell',
        sets: [
          { setNumber: 1, weight: 40, reps: 10, isWarmup: true, completed: true },
          { setNumber: 2, weight: 60, reps: 10, isWarmup: false, completed: true },
          { setNumber: 3, weight: 65, reps: 8, isWarmup: false, completed: true },
          { setNumber: 4, weight: 70, reps: 6, isWarmup: false, completed: true }
        ]
      },
      {
        exerciseId: 'ex_002',
        name: 'Incline Dumbbell Press',
        muscleGroup: 'Chest',
        equipment: 'Dumbbell',
        sets: [
          { setNumber: 1, weight: 20, reps: 10, isWarmup: false, completed: true },
          { setNumber: 2, weight: 22, reps: 10, isWarmup: false, completed: true },
          { setNumber: 3, weight: 24, reps: 8, isWarmup: false, completed: true }
        ]
      },
      {
        exerciseId: 'ex_031',
        name: 'Dumbbell Lateral Raise',
        muscleGroup: 'Shoulders',
        equipment: 'Dumbbell',
        sets: [
          { setNumber: 1, weight: 8, reps: 12, isWarmup: false, completed: true },
          { setNumber: 2, weight: 10, reps: 12, isWarmup: false, completed: true },
          { setNumber: 3, weight: 10, reps: 10, isWarmup: false, completed: true }
        ]
      },
      {
        exerciseId: 'ex_043',
        name: 'Tricep Rope Pushdown',
        muscleGroup: 'Triceps',
        equipment: 'Cable',
        sets: [
          { setNumber: 1, weight: 20, reps: 12, isWarmup: false, completed: true },
          { setNumber: 2, weight: 25, reps: 12, isWarmup: false, completed: true },
          { setNumber: 3, weight: 25, reps: 10, isWarmup: false, completed: true },
          { setNumber: 4, weight: 25, reps: 10, isWarmup: false, completed: true }
        ]
      }
    ]
  },
  {
    id: 'ses_002',
    userId: 'user_123',
    routineId: 'rt_002',
    routineName: 'Pull Day (Punggung & Bisep)',
    startTime: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 60 * 60 * 1000).toISOString(),
    durationSeconds: 60 * 60,
    status: 'completed',
    totalVolume: 7420,
    totalSets: 16,
    totalReps: 148,
    prCount: 2,
    logs: [
      {
        exerciseId: 'ex_010',
        name: 'Barbell Deadlift',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        sets: [
          { setNumber: 1, weight: 60, reps: 8, isWarmup: true, completed: true },
          { setNumber: 2, weight: 90, reps: 5, isWarmup: false, completed: true },
          { setNumber: 3, weight: 105, reps: 5, isWarmup: false, completed: true },
          { setNumber: 4, weight: 110, reps: 5, isWarmup: false, completed: true }
        ]
      },
      {
        exerciseId: 'ex_011',
        name: 'Lat Pulldown',
        muscleGroup: 'Back',
        equipment: 'Cable',
        sets: [
          { setNumber: 1, weight: 45, reps: 10, isWarmup: false, completed: true },
          { setNumber: 2, weight: 50, reps: 10, isWarmup: false, completed: true },
          { setNumber: 3, weight: 55, reps: 9, isWarmup: false, completed: true }
        ]
      },
      {
        exerciseId: 'ex_040',
        name: 'Barbell Bicep Curl',
        muscleGroup: 'Biceps',
        equipment: 'Barbell',
        sets: [
          { setNumber: 1, weight: 20, reps: 10, isWarmup: false, completed: true },
          { setNumber: 2, weight: 25, reps: 10, isWarmup: false, completed: true },
          { setNumber: 3, weight: 25, reps: 8, isWarmup: false, completed: true }
        ]
      }
    ]
  },
  {
    id: 'ses_003',
    userId: 'user_123',
    routineId: 'rt_001',
    routineName: 'Hypertrophy Push Day',
    startTime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 56 * 60 * 1000).toISOString(),
    durationSeconds: 56 * 60,
    status: 'completed',
    totalVolume: 6540,
    totalSets: 15,
    totalReps: 138,
    prCount: 1,
    logs: [
      {
        exerciseId: 'ex_001',
        name: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        equipment: 'Barbell',
        sets: [
          { setNumber: 1, weight: 40, reps: 10, isWarmup: true, completed: true },
          { setNumber: 2, weight: 62.5, reps: 8, isWarmup: false, completed: true },
          { setNumber: 3, weight: 67.5, reps: 8, isWarmup: false, completed: true },
          { setNumber: 4, weight: 72.5, reps: 6, isWarmup: false, completed: true }
        ]
      },
      {
        exerciseId: 'ex_002',
        name: 'Incline Dumbbell Press',
        muscleGroup: 'Chest',
        equipment: 'Dumbbell',
        sets: [
          { setNumber: 1, weight: 22, reps: 10, isWarmup: false, completed: true },
          { setNumber: 2, weight: 24, reps: 9, isWarmup: false, completed: true },
          { setNumber: 3, weight: 24, reps: 8, isWarmup: false, completed: true }
        ]
      },
      {
        exerciseId: 'ex_031',
        name: 'Dumbbell Lateral Raise',
        muscleGroup: 'Shoulders',
        equipment: 'Dumbbell',
        sets: [
          { setNumber: 1, weight: 10, reps: 12, isWarmup: false, completed: true },
          { setNumber: 2, weight: 10, reps: 12, isWarmup: false, completed: true },
          { setNumber: 3, weight: 12, reps: 10, isWarmup: false, completed: true }
        ]
      }
    ]
  }
];

export function getStoredUser(): UserDocument {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER;
  }
}

export function saveStoredUser(user: UserDocument): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function getStoredRoutines(): RoutineDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(DEFAULT_ROUTINES));
      return DEFAULT_ROUTINES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ROUTINES;
  }
}

export function saveStoredRoutines(routines: RoutineDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  } catch {
    // ignore
  }
}

export function getStoredSessions(): SessionDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(SAMPLE_PAST_SESSIONS));
      return SAMPLE_PAST_SESSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SAMPLE_PAST_SESSIONS;
  }
}

export function saveStoredSessions(sessions: SessionDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export function getStoredCustomExercises(): ExerciseDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomExercise(exercise: ExerciseDocument): void {
  const current = getStoredCustomExercises();
  const updated = [exercise, ...current.filter(e => e.id !== exercise.id)];
  localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(updated));
}

export function getAllExercises(): ExerciseDocument[] {
  const custom = getStoredCustomExercises();
  return [...custom, ...EXERCISES_DATA];
}

/**
 * Returns historical best weight & reps for an exercise from completed sessions
 */
export function getPreviousExercisePerformance(exerciseId: string): { weight: number; reps: number; oneRM: number } | null {
  const sessions = getStoredSessions().filter(s => s.status === 'completed');
  let bestWeight = 0;
  let bestReps = 0;
  let max1RM = 0;

  for (const session of sessions) {
    const log = session.logs?.find(l => l.exerciseId === exerciseId);
    if (log && log.sets) {
      for (const set of log.sets) {
        if (!set.isWarmup && (set.completed ?? true)) {
          const oneRM = calculate1RM(set.weight, set.reps);
          if (oneRM > max1RM) {
            max1RM = oneRM;
            bestWeight = set.weight;
            bestReps = set.reps;
          }
        }
      }
    }
  }

  if (bestWeight > 0) {
    return {
      weight: bestWeight,
      reps: bestReps,
      oneRM: Math.round(max1RM * 10) / 10
    };
  }
  return null;
}

export function exportAppData(): string {
  const data = {
    user: getStoredUser(),
    routines: getStoredRoutines(),
    sessions: getStoredSessions(),
    customExercises: getStoredCustomExercises(),
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  return JSON.stringify(data, null, 2);
}

export function importAppData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.user) saveStoredUser(data.user);
    if (data.routines) saveStoredRoutines(data.routines);
    if (data.sessions) saveStoredSessions(data.sessions);
    if (data.customExercises) localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(data.customExercises));
    return true;
  } catch {
    return false;
  }
}
