
-- Inventory
create table if not exists user_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  item_id uuid references game_items(id),
  quantity integer default 1,
  acquired_at timestamp default now()
);

-- Items catalog
create table if not exists game_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  type text, -- e.g. 'consumable', 'material', 'gear', 'decoration'
  effect jsonb,
  rarity text default 'common', -- common, rare, epic, legendary
  value integer default 0,
  created_at timestamp default now()
);

-- Crafting recipes
create table if not exists item_recipes (
  id uuid primary key default gen_random_uuid(),
  output_item_id uuid references game_items(id),
  required_items jsonb, -- [{"item_id": "uuid", "quantity": 1}]
  created_at timestamp default now()
);

-- Enable RLS
alter table user_inventory enable row level security;
alter table game_items enable row level security;
alter table item_recipes enable row level security;

-- Create policies
create policy "Users can view their own inventory" on user_inventory for select using (auth.uid() = user_id);
create policy "Users can insert into their inventory" on user_inventory for insert with check (auth.uid() = user_id);
create policy "Users can update their inventory" on user_inventory for update using (auth.uid() = user_id);

create policy "Anyone can view game items" on game_items for select using (true);
create policy "Anyone can view recipes" on item_recipes for select using (true);

-- Decrease item quantity helper
create or replace function decrease_item_quantity(user_id_input uuid, item_id_input uuid, amount integer)
returns void as $$
begin
  update user_inventory
  set quantity = quantity - amount
  where user_id = user_id_input and item_id = item_id_input;
  
  -- Remove items with 0 quantity
  delete from user_inventory 
  where user_id = user_id_input and item_id = item_id_input and quantity <= 0;
end;
$$ language plpgsql;

-- Insert some sample items
insert into game_items (name, description, image_url, type, effect, rarity, value) values
('Magic Seeds', 'Plant these to grow magical trees', '/items/magic-seeds.png', 'consumable', '{"growth_boost": 2}', 'common', 10),
('Crystal Gem', 'A shimmering gem with mysterious powers', '/items/crystal-gem.png', 'material', '{"energy": 5}', 'rare', 50),
('Nature Staff', 'Increases learning speed by 25%', '/items/nature-staff.png', 'gear', '{"learning_boost": 0.25}', 'epic', 200),
('Golden Leaf', 'Legendary item that grants wisdom', '/items/golden-leaf.png', 'material', '{"wisdom": 10}', 'legendary', 500),
('Health Potion', 'Restores energy during long study sessions', '/items/health-potion.png', 'consumable', '{"energy_restore": 100}', 'common', 15),
('Book of Knowledge', 'Unlock bonus quiz questions', '/items/knowledge-book.png', 'gear', '{"bonus_questions": 3}', 'rare', 75);

-- Sample crafting recipes
insert into item_recipes (output_item_id, required_items) values
((select id from game_items where name = 'Nature Staff'), 
 '[{"item_id": "' || (select id from game_items where name = 'Crystal Gem') || '", "quantity": 2}, {"item_id": "' || (select id from game_items where name = 'Magic Seeds') || '", "quantity": 5}]'),
((select id from game_items where name = 'Health Potion'), 
 '[{"item_id": "' || (select id from game_items where name = 'Magic Seeds') || '", "quantity": 3}]');
