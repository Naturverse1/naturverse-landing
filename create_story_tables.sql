
-- Story sessions table
create table if not exists story_sessions (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  title text not null,
  created_by uuid references auth.users(id),
  status text default 'active', -- active, completed, paused
  current_scene jsonb default '{}',
  story_history jsonb default '[]',
  max_participants integer default 8,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Story participants
create table if not exists story_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references story_sessions(id) on delete cascade,
  user_id uuid references auth.users(id),
  joined_at timestamp default now(),
  unique(session_id, user_id)
);

-- Story votes for group decisions
create table if not exists story_votes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references story_sessions(id) on delete cascade,
  user_id uuid references auth.users(id),
  vote_option integer not null,
  vote_text text not null,
  created_at timestamp default now(),
  unique(session_id, user_id)
);

-- Enable RLS
alter table story_sessions enable row level security;
alter table story_participants enable row level security;
alter table story_votes enable row level security;

-- Policies for story_sessions
create policy "Anyone can view active story sessions" 
on story_sessions for select using (status = 'active');

create policy "Authenticated users can create story sessions" 
on story_sessions for insert with check (auth.uid() = created_by);

create policy "Session creators can update their sessions" 
on story_sessions for update using (auth.uid() = created_by);

-- Policies for story_participants
create policy "Users can view story participants" 
on story_participants for select using (
  session_id in (
    select id from story_sessions where status = 'active'
  )
);

create policy "Users can join story sessions" 
on story_participants for insert with check (auth.uid() = user_id);

create policy "Users can leave story sessions" 
on story_participants for delete using (auth.uid() = user_id);

-- Policies for story_votes
create policy "Users can view votes in their sessions" 
on story_votes for select using (
  session_id in (
    select session_id from story_participants where user_id = auth.uid()
  )
);

create policy "Users can vote in their sessions" 
on story_votes for insert with check (
  auth.uid() = user_id and 
  session_id in (
    select session_id from story_participants where user_id = auth.uid()
  )
);

create policy "Users can update their votes" 
on story_votes for update using (
  auth.uid() = user_id and 
  session_id in (
    select session_id from story_participants where user_id = auth.uid()
  )
);

-- Add profiles table reference if it doesn't exist
do $$ 
begin
  if not exists (select 1 from information_schema.tables where table_name = 'profiles') then
    create table profiles (
      id uuid primary key references auth.users(id),
      email text,
      full_name text,
      created_at timestamp default now()
    );
    
    alter table profiles enable row level security;
    
    create policy "Users can view profiles" on profiles for select using (true);
    create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
  end if;
end $$;
