-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR GYM PLANNER (IRONLOG)
-- ====================================================================
-- Catatan: File ini adalah rancangan skema DDL untuk Supabase / PostgreSQL.
-- Sesuai permintaan, skema ini belum dijalankan ke database Supabase live.
-- Pengguna dapat menjalankan skrip ini di SQL Editor pada dashboard Supabase.
-- ====================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUM TYPES (OPSIONAL / TEKS DENGAN CHECK CONSTRAINT)
-- Menggunakan teks + check constraint untuk fleksibilitas Supabase Studio

-- 3. TABEL PROFILES (Pengguna)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  preferences jsonb not null default '{
    "weightUnit": "kg",
    "theme": "dark",
    "restTimerDefault": 90,
    "soundEnabled": true,
    "vibrateEnabled": true
  }'::jsonb,
  weight_kg numeric(5, 2),
  height_cm numeric(5, 2),
  experience_level text check (experience_level in ('Pemula', 'Menengah', 'Lanjutan')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger untuk membuat profil otomatis saat user register di auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4. TABEL EXERCISES (Master Gerakan Latihan)
create table if not exists public.exercises (
  id text primary key, -- e.g. 'ex_001' atau uuid
  name text not null,
  name_indo text,
  muscle_group text not null check (muscle_group in (
    'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Full Body', 'Cardio'
  )),
  secondary_muscles jsonb default '[]'::jsonb,
  equipment text not null check (equipment in (
    'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Smith Machine', 'Kettlebell', 'Resistance Band'
  )),
  is_custom boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  instructions jsonb default '[]'::jsonb,
  tips jsonb default '[]'::jsonb,
  default_rest_seconds integer not null default 90,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 5. TABEL ROUTINES (Template Rutinitas Latihan)
create table if not exists public.routines (
  id text primary key default ('rt_' || replace(uuid_generate_v4()::text, '-', '')),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  notes text default '',
  category text default 'Push Pull Legs',
  difficulty text default 'Menengah',
  target_days jsonb default '[]'::jsonb, -- e.g. ["Senin", "Kamis"]
  exercises jsonb not null default '[]'::jsonb, 
  -- Struktur exercises JSONB (Denormalized):
  -- [
  --   {
  --     "exerciseId": "ex_001",
  --     "name": "Barbell Bench Press",
  --     "targetSets": 3,
  --     "targetReps": "8-12",
  --     "restTimer": 90,
  --     "muscleGroup": "Chest",
  --     "equipment": "Barbell"
  --   }
  -- ]
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 6. TABEL SESSIONS (Live Tracker & Riwayat Latihan)
create table if not exists public.sessions (
  id text primary key default ('ses_' || replace(uuid_generate_v4()::text, '-', '')),
  user_id uuid references auth.users(id) on delete cascade not null,
  routine_id text, -- nullable jika Free Workout
  routine_name text not null,
  start_time timestamp with time zone not null default timezone('utc'::text, now()),
  end_time timestamp with time zone,
  duration_seconds integer not null default 0,
  status text not null default 'in-progress' check (status in ('in-progress', 'completed', 'cancelled')),
  total_volume numeric(12, 2) not null default 0,
  total_sets integer not null default 0,
  total_reps integer not null default 0,
  pr_count integer not null default 0,
  logs jsonb not null default '[]'::jsonb,
  -- Struktur logs JSONB:
  -- [
  --   {
  --     "exerciseId": "ex_001",
  --     "name": "Barbell Bench Press",
  --     "sets": [
  --       { "setNumber": 1, "weight": 60, "reps": 10, "isWarmup": false, "completedAt": "2026-10-02T15:10:00Z" },
  --       { "setNumber": 2, "weight": 65, "reps": 8, "isWarmup": false, "completedAt": "2026-10-02T15:15:00Z" }
  --     ]
  --   }
  -- ]
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================================
-- INDEXES UNTUK KINERJA QUERY DASHBOARD & STATISTIK
-- ====================================================================
create index if not exists idx_sessions_user_status on public.sessions (user_id, status);
create index if not exists idx_sessions_user_endtime on public.sessions (user_id, end_time desc);
create index if not exists idx_routines_user on public.routines (user_id);
create index if not exists idx_exercises_muscle on public.exercises (muscle_group);
create index if not exists idx_exercises_custom on public.exercises (is_custom, created_by);


-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.sessions enable row level security;

-- Policies: PROFILES
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Policies: EXERCISES
create policy "Users can view public or own custom exercises"
  on public.exercises for select
  using (is_custom = false or created_by = auth.uid());

create policy "Users can create their own custom exercises"
  on public.exercises for insert
  with check (auth.uid() = created_by and is_custom = true);

create policy "Users can update their own custom exercises"
  on public.exercises for update
  using (auth.uid() = created_by);

create policy "Users can delete their own custom exercises"
  on public.exercises for delete
  using (auth.uid() = created_by);

-- Policies: ROUTINES
create policy "Users can manage their own routines"
  on public.routines for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies: SESSIONS
create policy "Users can manage their own workout sessions"
  on public.sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
