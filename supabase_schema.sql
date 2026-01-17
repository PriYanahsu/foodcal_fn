-- 1. Create the profiles table
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

-- 2. Enable RLS on profiles
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

-- 3. Automatic Profile Creation Trigger
-- This function copies data from auth.users (and metadata) to public.profiles
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

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4. Create the food_logs table (from previous step)
create table if not exists public.food_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  food_name text not null,
  calories integer,
  protein float,
  carbs float,
  fats float,
  confidence float,
  image_path text,
  meal_type text default 'snack',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on food_logs
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
