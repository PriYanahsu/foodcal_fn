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
