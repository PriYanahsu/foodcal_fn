-- ==========================================
-- 1. Profiles Table & Auth Triggers
-- ==========================================

create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  email text,
  gender text check (gender in ('Male', 'Female', 'Other')),
  age integer,
  height float, -- in cm
  weight float, -- in kg
  activity_level text check (activity_level in ('Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active')),
  goal text check (goal in ('Lose Weight', 'Maintain Weight', 'Gain Muscle')),
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Trigger for new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username, gender)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'gender'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==========================================
-- 2. Food Logs Table
-- ==========================================

create table if not exists public.food_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  food_name text not null,
  calories integer,
  protein float,
  carbs float,
  fats float,
  confidence float,
  meal_type text default 'snack',
  image_path text,
  is_manual boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.food_logs enable row level security;

create policy "Users can view their own food logs"
  on public.food_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own food logs"
  on public.food_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own food logs"
  on public.food_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own food logs"
  on public.food_logs for delete
  using (auth.uid() = user_id);


-- ==========================================
-- 3. Storage Buckets & Policies
-- ==========================================

-- Avatar Images Bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

-- Meal Images Bucket
insert into storage.buckets (id, name, public)
values ('meal_images', 'meal_images', true)
on conflict (id) do nothing;

-- Meal Images Policies
-- Note: We use simpler creates here. If they fail because they exist, that's fine for a schema reference.
-- For a migration script, we'd use DO blocks, but for a reference file, CREATE is standard.

create policy "Public Access to Meal Images"
  on storage.objects for select
  to public
  using ( bucket_id = 'meal_images' );

create policy "Authenticated users can upload meal images"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'meal_images' AND auth.uid() = owner );

create policy "Users can update their own meal images"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'meal_images' AND auth.uid() = owner );

create policy "Users can delete their own meal images"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'meal_images' AND auth.uid() = owner );


-- ==========================================
-- 4. Smart Fitness Profile Updates
-- ==========================================

-- Add Goal & Target Columns to Profiles
alter table public.profiles 
add column if not exists target_weight float,
add column if not exists target_date date,
add column if not exists daily_calorie_target integer,
add column if not exists daily_protein_target integer,
add column if not exists daily_carbs_target integer,
add column if not exists daily_fats_target integer,
add column if not exists ai_coach_advice text;

-- Create Weight Logs Table
create table if not exists public.weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  weight float not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Weight Logs
alter table public.weight_logs enable row level security;

-- Policies for Weight Logs
create policy "Users can view their own weight logs"
  on public.weight_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own weight logs"
  on public.weight_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own weight logs"
  on public.weight_logs for delete
  using (auth.uid() = user_id);


-- ==========================================
-- 5. Step Logs & Activity Tracking
-- ==========================================

create table if not exists public.step_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  steps integer default 0,
  distance_km float default 0,
  calories_burned float default 0,
  log_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(user_id, log_date)
);

-- Enable RLS for Step Logs
alter table public.step_logs enable row level security;

-- Policies for Step Logs
create policy "Users can view their own step logs"
  on public.step_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own step logs"
  on public.step_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own step logs"
  on public.step_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own step logs"
  on public.step_logs for delete
  using (auth.uid() = user_id);

-- RPC Function for atomic step increments
create or replace function public.increment_steps(user_id_input uuid, steps_count integer)
returns void as $$
begin
  insert into public.step_logs (user_id, steps, log_date, distance_km, calories_burned, updated_at)
  values (
    user_id_input, 
    steps_count, 
    current_date,
    steps_count * 0.0007,
    steps_count * 0.04,
    timezone('utc'::text, now())
  )
  on conflict (user_id, log_date)
  do update set 
    steps = public.step_logs.steps + steps_count,
    distance_km = (public.step_logs.steps + steps_count) * 0.0007,
    calories_burned = (public.step_logs.steps + steps_count) * 0.04,
    updated_at = timezone('utc'::text, now());
end;
$$ language plpgsql security definer;

