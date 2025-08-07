
-- Multiplayer lobbies
create table if not exists multiplayer_lobbies (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  lobby_name text not null,
  created_by uuid references auth.users(id),
  max_players integer default 4,
  current_players integer default 1,
  status text default 'open', -- open, in_progress, closed
  created_at timestamp default now()
);

-- Lobby participants
create table if not exists lobby_participants (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid references multiplayer_lobbies(id) on delete cascade,
  user_id uuid references auth.users(id),
  joined_at timestamp default now(),
  unique(lobby_id, user_id)
);

-- Live trades
create table if not exists item_trades (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id),
  receiver_id uuid references auth.users(id),
  offered_item_id uuid references game_items(id),
  requested_item_id uuid references game_items(id),
  offer_quantity integer default 1,
  request_quantity integer default 1,
  status text default 'pending', -- pending, accepted, rejected, completed
  message text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
alter table multiplayer_lobbies enable row level security;
alter table lobby_participants enable row level security;
alter table item_trades enable row level security;

-- Create policies
create policy "Anyone can view lobbies" on multiplayer_lobbies for select using (true);
create policy "Users can create lobbies" on multiplayer_lobbies for insert with check (auth.uid() = created_by);
create policy "Users can update their lobbies" on multiplayer_lobbies for update using (auth.uid() = created_by);

create policy "Anyone can view lobby participants" on lobby_participants for select using (true);
create policy "Users can join lobbies" on lobby_participants for insert with check (auth.uid() = user_id);
create policy "Users can leave lobbies" on lobby_participants for delete using (auth.uid() = user_id);

create policy "Users can view their trades" on item_trades for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can create trades" on item_trades for insert with check (auth.uid() = sender_id);
create policy "Users can update received trades" on item_trades for update using (auth.uid() = receiver_id);

-- Function to update lobby player count
create or replace function update_lobby_player_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update multiplayer_lobbies 
    set current_players = current_players + 1 
    where id = NEW.lobby_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update multiplayer_lobbies 
    set current_players = current_players - 1 
    where id = OLD.lobby_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

-- Trigger for player count updates
create trigger lobby_participant_count_trigger
  after insert or delete on lobby_participants
  for each row execute procedure update_lobby_player_count();
