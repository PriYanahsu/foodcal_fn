-- Create the food_logs table
create table public.food_logs (
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

-- Enable Row Level Security (RLS)
alter table public.food_logs enable row level security;

-- Create policies
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
