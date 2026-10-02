// NoSQL Document Schemas for Gym Planner

export interface UserPreferences {
  weightUnit: 'kg' | 'lbs';
  theme: 'dark' | 'light';
  restTimerDefault: number; // in seconds
  soundEnabled: boolean;
  vibrateEnabled: boolean;
}

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  preferences: UserPreferences;
  weightKg?: number;
  heightCm?: number;
  experienceLevel?: 'Pemula' | 'Menengah' | 'Lanjutan';
}

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Core'
  | 'Full Body'
  | 'Cardio';

export type Equipment =
  | 'Barbell'
  | 'Dumbbell'
  | 'Machine'
  | 'Cable'
  | 'Bodyweight'
  | 'Smith Machine'
  | 'Kettlebell'
  | 'Resistance Band';

export interface ExerciseDocument {
  id: string;
  name: string;
  nameIndo?: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: string[];
  equipment: Equipment;
  isCustom: boolean;
  createdBy: string | null;
  instructions?: string[];
  tips?: string[];
  defaultRestSeconds?: number;
}

export interface RoutineExerciseItem {
  exerciseId: string;
  name: string; // Denormalized for fast reads without joins
  targetSets: number;
  targetReps: string; // e.g. "8-12" or "10"
  restTimer: number;  // in seconds
  equipment?: Equipment;
  muscleGroup?: MuscleGroup;
}

export interface RoutineDocument {
  id: string;
  userId: string;
  name: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
  category?: 'Push Pull Legs' | 'Upper Lower' | 'Full Body' | 'Bro Split' | 'Custom';
  difficulty?: 'Pemula' | 'Menengah' | 'Lanjutan';
  targetDays?: string[];
  exercises: RoutineExerciseItem[];
}

export interface WorkoutSetLog {
  id?: string;
  setNumber: number;
  weight: number;      // in kg/lbs
  reps: number;
  isWarmup: boolean;
  completedAt?: string;
  completed?: boolean; // Client UI tracker state
  rpe?: number;
  previousWeight?: number;
  previousReps?: number;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string; // Denormalized
  muscleGroup?: MuscleGroup;
  equipment?: Equipment;
  sets: WorkoutSetLog[];
}

export type SessionStatus = 'in-progress' | 'completed' | 'cancelled';

export interface SessionDocument {
  id: string;
  userId: string;
  routineId: string | null; // Can be null if Free Workout
  routineName: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  status: SessionStatus;
  totalVolume: number; // Total volume (kg or lbs)
  totalSets?: number;
  totalReps?: number;
  prCount?: number;
  logs: ExerciseLog[];
}

export interface ExerciseChartPoint {
  date: string;
  volume: number;
  estimated1RM: number;
  maxWeight?: number;
}
