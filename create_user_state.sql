
-- Run this in Supabase SQL Editor
create table if not exists user_state (
  user_id uuid primary key,
  region text,
  navatar_data json,
  current_quest json,
  completed_stamps json,
  turian_memory json,
  updated_at timestamp default now(),
  created_at timestamp default now()
);

-- Add RLS policies
alter table user_state enable row level security;

create policy "Users can view own state" on user_state
  for select using (user_id = auth.uid());

create policy "Users can update own state" on user_state
  for all using (user_id = auth.uid());

-- Add indexes for performance
create index if not exists user_state_user_id_idx on user_state(user_id);
create index if not exists user_state_updated_at_idx on user_state(updated_at);
