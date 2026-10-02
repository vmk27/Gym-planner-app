import { RoutineDocument } from '../types/gym';

export const DEFAULT_ROUTINES: RoutineDocument[] = [
  {
    id: 'rt_001',
    userId: 'user_123',
    name: 'Push Day (Dada, Bahu, Trisep)',
    notes: 'Fokus pada rentang gerak (ROM) dan kontrol gerakan eksentrik 2-3 detik.',
    category: 'Push Pull Legs',
    difficulty: 'Menengah',
    targetDays: ['Senin', 'Kamis'],
    createdAt: '2026-01-01T00:00:00.000Z',
    exercises: [
      {
        exerciseId: 'ex_001',
        name: 'Barbell Bench Press',
        targetSets: 4,
        targetReps: '6-8',
        restTimer: 120,
        muscleGroup: 'Chest',
        equipment: 'Barbell'
      },
      {
        exerciseId: 'ex_002',
        name: 'Incline Dumbbell Press',
        targetSets: 3,
        targetReps: '8-12',
        restTimer: 90,
        muscleGroup: 'Chest',
        equipment: 'Dumbbell'
      },
      {
        exerciseId: 'ex_031',
        name: 'Dumbbell Lateral Raise',
        targetSets: 4,
        targetReps: '12-15',
        restTimer: 60,
        muscleGroup: 'Shoulders',
        equipment: 'Dumbbell'
      },
      {
        exerciseId: 'ex_043',
        name: 'Tricep Rope Pushdown',
        targetSets: 3,
        targetReps: '10-12',
        restTimer: 60,
        muscleGroup: 'Triceps',
        equipment: 'Cable'
      },
      {
        exerciseId: 'ex_003',
        name: 'Cable Chest Fly',
        targetSets: 3,
        targetReps: '12-15',
        restTimer: 60,
        muscleGroup: 'Chest',
        equipment: 'Cable'
      }
    ]
  },
  {
    id: 'rt_002',
    userId: 'user_123',
    name: 'Pull Day (Punggung & Bisep)',
    notes: 'Aktivasi lat penuh, tarik beban dengan siku menuju saku celana.',
    category: 'Push Pull Legs',
    difficulty: 'Menengah',
    targetDays: ['Selasa', 'Jumat'],
    createdAt: '2026-01-01T00:00:00.000Z',
    exercises: [
      {
        exerciseId: 'ex_010',
        name: 'Barbell Deadlift',
        targetSets: 3,
        targetReps: '5',
        restTimer: 180,
        muscleGroup: 'Back',
        equipment: 'Barbell'
      },
      {
        exerciseId: 'ex_011',
        name: 'Lat Pulldown',
        targetSets: 4,
        targetReps: '8-10',
        restTimer: 90,
        muscleGroup: 'Back',
        equipment: 'Cable'
      },
      {
        exerciseId: 'ex_014',
        name: 'Seated Cable Row',
        targetSets: 3,
        targetReps: '10-12',
        restTimer: 90,
        muscleGroup: 'Back',
        equipment: 'Cable'
      },
      {
        exerciseId: 'ex_033',
        name: 'Cable Face Pull',
        targetSets: 3,
        targetReps: '15',
        restTimer: 60,
        muscleGroup: 'Shoulders',
        equipment: 'Cable'
      },
      {
        exerciseId: 'ex_040',
        name: 'Barbell Bicep Curl',
        targetSets: 3,
        targetReps: '8-10',
        restTimer: 75,
        muscleGroup: 'Biceps',
        equipment: 'Barbell'
      },
      {
        exerciseId: 'ex_042',
        name: 'Dumbbell Hammer Curl',
        targetSets: 3,
        targetReps: '10-12',
        restTimer: 60,
        muscleGroup: 'Biceps',
        equipment: 'Dumbbell'
      }
    ]
  },
  {
    id: 'rt_003',
    userId: 'user_123',
    name: 'Legs & Core Day (Kaki & Perut)',
    notes: 'Kedalaman squat minimal sejajar paha, dorong melalui tumit.',
    category: 'Push Pull Legs',
    difficulty: 'Menengah',
    targetDays: ['Rabu', 'Sabtu'],
    createdAt: '2026-01-01T00:00:00.000Z',
    exercises: [
      {
        exerciseId: 'ex_020',
        name: 'Barbell Back Squat',
        targetSets: 4,
        targetReps: '6-8',
        restTimer: 150,
        muscleGroup: 'Legs',
        equipment: 'Barbell'
      },
      {
        exerciseId: 'ex_021',
        name: 'Romanian Deadlift (RDL)',
        targetSets: 3,
        targetReps: '8-10',
        restTimer: 120,
        muscleGroup: 'Legs',
        equipment: 'Barbell'
      },
      {
        exerciseId: 'ex_022',
        name: 'Leg Press Machine',
        targetSets: 3,
        targetReps: '10-12',
        restTimer: 120,
        muscleGroup: 'Legs',
        equipment: 'Machine'
      },
      {
        exerciseId: 'ex_025',
        name: 'Standing Calf Raise',
        targetSets: 4,
        targetReps: '15',
        restTimer: 60,
        muscleGroup: 'Legs',
        equipment: 'Machine'
      },
      {
        exerciseId: 'ex_050',
        name: 'Hanging Leg Raise',
        targetSets: 3,
        targetReps: '12-15',
        restTimer: 60,
        muscleGroup: 'Core',
        equipment: 'Bodyweight'
      }
    ]
  },
  {
    id: 'rt_004',
    userId: 'user_123',
    name: 'Full Body Starter (Pemula)',
    notes: 'Latihan seluruh tubuh esensial 3 hari seminggu untuk adaptasi neuromuskular.',
    category: 'Full Body',
    difficulty: 'Pemula',
    targetDays: ['Senin', 'Rabu', 'Jumat'],
    createdAt: '2026-01-01T00:00:00.000Z',
    exercises: [
      {
        exerciseId: 'ex_020',
        name: 'Barbell Back Squat',
        targetSets: 3,
        targetReps: '8',
        restTimer: 120,
        muscleGroup: 'Legs',
        equipment: 'Barbell'
      },
      {
        exerciseId: 'ex_001',
        name: 'Barbell Bench Press',
        targetSets: 3,
        targetReps: '8',
        restTimer: 120,
        muscleGroup: 'Chest',
        equipment: 'Barbell'
      },
      {
        exerciseId: 'ex_011',
        name: 'Lat Pulldown',
        targetSets: 3,
        targetReps: '10',
        restTimer: 90,
        muscleGroup: 'Back',
        equipment: 'Cable'
      },
      {
        exerciseId: 'ex_030',
        name: 'Overhead Barbell Press',
        targetSets: 3,
        targetReps: '8',
        restTimer: 90,
        muscleGroup: 'Shoulders',
        equipment: 'Barbell'
      },
      {
        exerciseId: 'ex_051',
        name: 'Core Plank',
        targetSets: 3,
        targetReps: '45-60s',
        restTimer: 60,
        muscleGroup: 'Core',
        equipment: 'Bodyweight'
      }
    ]
  }
];
