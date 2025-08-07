
-- Quest sessions table
create table if not exists quest_sessions (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid references multiplayer_lobbies(id) on delete cascade,
  title text not null,
  theme text,
  region text,
  difficulty text default 'normal',
  status text default 'active', -- active, completed, paused
  current_scene jsonb,
  story_history jsonb default '[]',
  created_at timestamp default now(),
  completed_at timestamp
);

-- Player actions in quests
create table if not exists quest_actions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references quest_sessions(id) on delete cascade,
  user_id uuid references auth.users(id),
  action_text text not null,
  action_type text default 'speech', -- speech, choice, movement
  response_generated text,
  created_at timestamp default now()
);

-- AI narrator responses
create table if not exists narrator_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references quest_sessions(id) on delete cascade,
  prompt_text text not null,
  response_text text not null,
  response_type text default 'story', -- story, choice, challenge
  created_at timestamp default now()
);

-- Enable RLS
alter table quest_sessions enable row level security;
alter table quest_actions enable row level security;
alter table narrator_responses enable row level security;

-- Policies
create policy "Users can view quest sessions they participate in" 
on quest_sessions for select using (
  lobby_id in (
    select lobby_id from lobby_participants where user_id = auth.uid()
  )
);

create policy "Users can create quest sessions in their lobbies" 
on quest_sessions for insert with check (
  lobby_id in (
    select id from multiplayer_lobbies where created_by = auth.uid()
  )
);

create policy "Users can view quest actions in their sessions" 
on quest_actions for select using (
  session_id in (
    select id from quest_sessions where lobby_id in (
      select lobby_id from lobby_participants where user_id = auth.uid()
    )
  )
);

create policy "Users can create quest actions" 
on quest_actions for insert with check (auth.uid() = user_id);

create policy "Users can view narrator responses in their sessions" 
on narrator_responses for select using (
  session_id in (
    select id from quest_sessions where lobby_id in (
      select lobby_id from lobby_participants where user_id = auth.uid()
    )
  )
);
