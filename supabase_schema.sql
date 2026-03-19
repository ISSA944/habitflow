-- HabitFlow Dashboard — Supabase Schema
-- Run this SQL in your Supabase SQL Editor

-- Habits table
create table if not exists habits (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  emoji text default '💪',
  created_at timestamptz default now()
);

-- Habit logs (daily completion tracking)
create table if not exists habit_logs (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade,
  date date not null,
  completed boolean default false,
  created_at timestamptz default now(),
  unique(habit_id, date)
);

-- Tasks
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text default 'other',
  priority text default 'medium',
  deadline date,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Daily routines
create table if not exists routines (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  time_slot time,
  order_index integer default 0,
  completed_today boolean default false,
  date date not null,
  created_at timestamptz default now()
);

-- User preferences
create table if not exists user_preferences (
  id uuid default gen_random_uuid() primary key,
  name text default 'Искандер',
  quote_categories text[] default '{}',
  notification_times text[] default '{08:00,20:00}',
  created_at timestamptz default now()
);

-- Enable Row Level Security (open access since no auth)
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table tasks enable row level security;
alter table routines enable row level security;
alter table user_preferences enable row level security;

-- Allow all operations (no auth, single user)
create policy "Allow all" on habits for all using (true) with check (true);
create policy "Allow all" on habit_logs for all using (true) with check (true);
create policy "Allow all" on tasks for all using (true) with check (true);
create policy "Allow all" on routines for all using (true) with check (true);
create policy "Allow all" on user_preferences for all using (true) with check (true);
