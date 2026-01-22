-- Create a table for user preferences if it doesn't exist
create table if not exists public.user_preferences (
  user_id uuid references auth.users not null primary key,
  step_goal integer default 10000,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.user_preferences enable row level security;

-- Policies
create policy "Users can view their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences (update)"
  on public.user_preferences for update
  using (auth.uid() = user_id);
