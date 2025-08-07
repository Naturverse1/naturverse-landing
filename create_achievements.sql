
-- user_badges table
create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  badge_name text,
  badge_image text,
  minted boolean default false,
  created_at timestamp default now()
);

-- user_profiles table
create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  title text,
  theme text,
  profile_image text,
  updated_at timestamp default now()
);

-- Enable RLS
alter table user_badges enable row level security;
alter table user_profiles enable row level security;

-- Create policies
create policy "Users can view their own badges" on user_badges for select using (auth.uid() = user_id);
create policy "Users can insert their own badges" on user_badges for insert with check (auth.uid() = user_id);

create policy "Users can view their own profile" on user_profiles for select using (auth.uid() = user_id);
create policy "Users can update their own profile" on user_profiles for all using (auth.uid() = user_id);
